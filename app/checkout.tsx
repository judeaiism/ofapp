import React, { useState } from 'react';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, ScrollView, View, Image, Text, Pressable, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Typography } from '@/components/ui/typography';
import { TextInput, Button, RadioButton, Surface } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { generateOrderId } from '@/utils/orderUtils';
import { Dropdown } from 'react-native-element-dropdown';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '@/app/contexts/CartContext';
import { doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from '@/config/firebase'; // Ensure you have this config file
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

type PaymentMethodType = 'crypto';
type CryptoType = 'btc' | 'erc20' | 'trc20' | 'ltc';
type CryptoOption = { label: string; value: CryptoType };

interface DocumentAsset {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

// Add upload state type
interface UploadState {
  progress: number;
  error: Error | null;
  state: 'running' | 'paused' | 'error' | 'success';
}

// Add error text component
const ErrorText = ({ visible, message }: { visible: boolean; message: string }) => (
  visible ? <Text style={styles.errorText}>{message}</Text> : null
);

type PhonePrefix = {
  label: string;
  value: string;
};

// Update the form state interface
interface AddressFields {
  country: string;
  state: string;
  city: string;
  county: string;
  landmark: string;
  streetAddress: string;
  zipCode: string;
}

// Add this type for the order data structure
interface OrderData {
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: AddressFields;
  };
  paymentInfo: {
    method: PaymentMethodType;
    cryptoType?: CryptoType;
    proofUrl?: string;
  };
  orderDetails: {
    storeId: number;
    products: CartItem[];
    total: number;
    status: 'pending' | 'confirmed' | 'delivered';
    createdAt: number;
  };
}

// Update the OrderData interface to include proper product type
interface CartItem {
  id: number;
  storeId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string | number;
}

// Add near the top of the CheckoutScreen component
export default function CheckoutScreen() {
  const { storeId, products } = useLocalSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('crypto');
  const [orderId] = useState(generateOrderId());
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      country: 'South Africa', // Default and locked to South Africa
      state: 'Western Cape', // Default and locked to Western Cape
      city: 'Cape Town', // Default and locked to Cape Town
      county: '',
      landmark: '',
      streetAddress: '',
      zipCode: '',
    } as AddressFields,
    confirmAddress: {
      country: 'South Africa',
      state: 'Western Cape',
      city: 'Cape Town',
      county: '',
      landmark: '',
      streetAddress: '',
      zipCode: '',
    } as AddressFields,
  });
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>('btc');
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [paymentProofAsset, setPaymentProofAsset] = useState<DocumentAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { state, dispatch } = useCart();
  const [selectedPrefix, setSelectedPrefix] = useState<string>('+1'); // Default to US/Canada
  const { state: cartState } = useCart(); // Make sure useCart is imported

  const CRYPTO_OPTIONS: CryptoOption[] = [
    { label: 'Bitcoin (BTC)', value: 'btc' },
    { label: 'Litecoin (LTC)', value: 'ltc' },
    { label: 'USDT (ERC20)', value: 'erc20' },
    { label: 'USDT (TRC20)', value: 'trc20' },
  ];

  const PAYMENT_DETAILS = {
    crypto: {
      btc: {
        walletAddress: 'bc1ql4te0h6k0j6f4psqgepqfuelrp8cmx7ypfe0gt',
      },
      ltc: {
        walletAddress: 'ltc1qh87wzyamfq2mgvtl0ygr5f9mt2dtuadr8g3vk8',
      },
      erc20: {
        walletAddress: '0x2F825D795f5EA4f92Ce2b5397733E8Db0BB062d9',
      },
      trc20: {
        walletAddress: 'TTHc2iqVR2RnT6QMPu9pUhewbjC6ik5QtU',
      },
    },
  };

  const PHONE_PREFIXES: PhonePrefix[] = [
    { label: 'USA/Canada (+1)', value: '+1' },
    { label: 'UK (+44)', value: '+44' },
    { label: 'South Africa (+27)', value: '+27' },
    { label: 'Japan (+81)', value: '+81' },
    { label: 'South Korea (+82)', value: '+82' },
    { label: 'India (+91)', value: '+91' },
    { label: 'Australia (+61)', value: '+61' },
    { label: 'Germany (+49)', value: '+49' },
    { label: 'France (+33)', value: '+33' },
    { label: 'Italy (+39)', value: '+39' },
    { label: 'Spain (+34)', value: '+34' },
    { label: 'Russia (+7)', value: '+7' },
    { label: 'Brazil (+55)', value: '+55' },
    { label: 'Mexico (+52)', value: '+52' },
  ];

  const calculateTotal = (): number => {
    if (!cartState.items || cartState.items.length === 0) {
      return 0;
    }

    const subtotal = cartState.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Add delivery fee if applicable (can be adjusted based on your business logic)
    const deliveryFee = 0; // Free delivery as per the stores data

    // Calculate total including delivery
    const total = subtotal + deliveryFee;

    return total;
  };

  const createOrder = async (paymentProofUrl: string | null) => {
    try {
      setIsLoading(true);
      
      // Get storeId from the first item in cart and ensure it's a number
      const cartStoreId = state.items[0]?.storeId;
      
      if (typeof cartStoreId !== 'number') {
        throw new Error('Invalid or missing store ID');
      }

      const orderData: OrderData = {
        orderId: orderId,
        customerInfo: {
          name: form.name,
          email: form.email,
          phone: `${selectedPrefix}${form.phone}`,
          address: form.address,
        },
        paymentInfo: {
          method: paymentMethod,
          cryptoType: selectedCrypto,
          proofUrl: paymentProofUrl || undefined,
        },
        orderDetails: {
          storeId: cartStoreId, // Now properly typed as number
          products: state.items.map(item => ({
            ...item,
            id: Number(item.id) // Ensure ID is a number
          })),
          total: calculateTotal(),
          status: 'pending',
          createdAt: Date.now(),
        },
      };

      // Create the order document in Firestore
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, orderData);

      // Store order in AsyncStorage for offline access
      await AsyncStorage.setItem(`order_${orderId}`, JSON.stringify(orderData));

      // Clear the cart
      dispatch({ type: 'CLEAR_CART' });

      // Navigate to success screen
      router.replace({
        pathname: '/checkout/success',
        params: { orderId }
      });

    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Upload payment proof if exists
      let paymentProofUrl = null;
      if (paymentProofAsset) {
        try {
          setIsLoading(true); // Add loading state
          paymentProofUrl = await uploadPaymentProof(paymentProofAsset);
        } catch (uploadError) {
          console.error('Payment proof upload failed:', uploadError);
          // Show error to user but continue with order
          Alert.alert(
            'Upload Warning',
            'Payment proof upload failed. Do you want to continue without the proof?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => setIsLoading(false)
              },
              {
                text: 'Continue',
                onPress: async () => {
                  // Continue with order creation
                  await createOrder(null);
                }
              }
            ]
          );
          return;
        }
      }

      await createOrder(paymentProofUrl);

    } catch (error) {
      console.error('Error submitting order:', error);
      Alert.alert('Error', 'Failed to submit order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCryptoChange = (item: CryptoOption) => {
    setSelectedCrypto(item.value);
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as PaymentMethodType);
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await Clipboard.setStringAsync(address);
      Alert.alert('Copied!', 'Address copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  const renderCryptoPaymentDetails = () => (
    <View style={styles.paymentDetails}>
      <Typography variant="p" style={styles.paymentInfo}>
        Select Cryptocurrency:
      </Typography>
      <Dropdown<CryptoOption>
        style={styles.dropdown}
        data={CRYPTO_OPTIONS}
        maxHeight={300}
        labelField="label"
        valueField="value"
        value={selectedCrypto}
        onChange={handleCryptoChange}
      />
      
      <Typography variant="p" style={[styles.paymentInfo, styles.addressTitle]}>
        Send payment to the following {selectedCrypto.toUpperCase()} address:
      </Typography>
      
      <Typography variant="small" style={styles.copyInstruction}>
        Tap address to copy to clipboard
      </Typography>
      
      <Pressable 
        onPress={() => handleCopyAddress(PAYMENT_DETAILS.crypto[selectedCrypto as CryptoType].walletAddress)}
        style={({ pressed }) => [
          styles.addressContainer,
          pressed && styles.addressContainerPressed
        ]}
      >
        <View style={styles.addressContent}>
          <Text style={styles.walletAddress}>
            {PAYMENT_DETAILS.crypto[selectedCrypto as CryptoType].walletAddress}
          </Text>
          <Feather name="copy" size={20} color="#666" style={styles.copyIcon} />
        </View>
      </Pressable>
      
      <Button
        mode="outlined"
        onPress={handleFilePick}
        style={styles.uploadButton}
      >
        {paymentProof ? `Selected: ${paymentProof}` : 'Upload Payment Proof'}
      </Button>
    </View>
  );

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        setPaymentProof(result.assets[0].name);
        // Store the full asset info for upload
        setPaymentProofAsset(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const uploadPaymentProof = async (file: DocumentAsset): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Validate file
        if (!file?.uri) {
          throw new Error('Invalid file');
        }

        // Create unique filename
        const timestamp = Date.now();
        const extension = file.uri.split('.').pop() || 'jpg';
        const filename = `${timestamp}.${extension}`;

        // Get storage reference
        const storage = getStorage();
        const storageRef = ref(storage, `payment_proofs/${orderId}/${filename}`);

        // Create file metadata
        const metadata = {
          contentType: file.mimeType || 'image/jpeg',
          customMetadata: {
            'originalName': file.name,
            'uploadedAt': new Date().toISOString()
          }
        };

        // Start upload
        fetch(file.uri)
          .then(response => response.blob())
          .then(blob => {
            const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

            // Monitor upload
            uploadTask.on('state_changed',
              (snapshot) => {
                // Track progress
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
              },
              (error) => {
                // Handle errors
                console.error('Upload error:', error);
                switch (error.code) {
                  case 'storage/unauthorized':
                    reject(new Error('Unauthorized access'));
                    break;
                  case 'storage/canceled':
                    reject(new Error('Upload canceled'));
                    break;
                  case 'storage/unknown':
                    reject(new Error('Unknown error occurred'));
                    break;
                  default:
                    reject(error);
                }
              },
              async () => {
                // Upload completed successfully
                try {
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  resolve(downloadURL);
                } catch (urlError) {
                  reject(new Error('Failed to get download URL'));
                }
              }
            );
          })
          .catch(error => {
            console.error('File fetch error:', error);
            reject(new Error('Failed to fetch file'));
          });

      } catch (error) {
        console.error('Upload setup error:', error);
        reject(error);
      }
    });
  };

  const renderPaymentMethodCards = () => (
    <View style={styles.paymentMethodWrapper}>
      <Surface style={styles.paymentMethodSurface}>
        <View style={styles.paymentMethodContainer}>
          <View style={styles.paymentOption}>
            <View style={styles.paymentOptionContent}>
              <Typography variant="h4">Pay with Cryptocurrency</Typography>
              <Typography variant="small" style={styles.paymentDescription}>
                Pay instantly using your crypto wallet
              </Typography>
            </View>
          </View>
        </View>
      </Surface>
    </View>
  );

  // Add validation function for addresses
  const validateAddresses = (address: string, confirmAddress: string) => {
    if (confirmAddress && address !== confirmAddress) {
      Alert.alert('Address Mismatch', 'Delivery addresses do not match');
      return false;
    }
    return true;
  };

  // Update the form validation
  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s-]{10,}$/;
    const postalCodeRegex = /^\d{4}$/;

    const isContactInfoComplete = 
      form.name.trim().length >= 2 &&
      emailRegex.test(form.email.trim()) &&
      phoneRegex.test(form.phone.trim());

    const isAddressComplete =
      form.address.streetAddress.trim().length >= 5 &&
      form.address.landmark.trim().length >= 3 &&
      postalCodeRegex.test(form.address.zipCode) &&
      form.address.city === 'Cape Town' && // Ensure delivery is in Cape Town
      form.address.state === 'Western Cape' &&
      form.address.country === 'South Africa';

    const isPaymentComplete = paymentProof !== null;

    return isContactInfoComplete && isAddressComplete && isPaymentComplete;
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Checkout',
          headerTransparent: true,
          headerBackground: () => (
            <BlurView intensity={100} style={StyleSheet.absoluteFill} />
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <ScrollView style={styles.form}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Contact Information
          </Typography>
          
          <View>
            <TextInput
              label="Full Name"
              value={form.name}
              onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
              style={styles.input}
              error={form.name.trim().length > 0 && form.name.trim().length < 2}
            />
            <ErrorText 
              visible={form.name.trim().length > 0 && form.name.trim().length < 2} 
              message="Name is too short"
            />
          </View>
          
          <View>
            <TextInput
              label="Email"
              value={form.email}
              onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              error={form.email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())}
            />
            <ErrorText 
              visible={form.email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())} 
              message="Invalid email format"
            />
          </View>
          
          <View style={styles.phoneContainer}>
            <Dropdown
              style={styles.prefixDropdown}
              data={PHONE_PREFIXES}
              maxHeight={300}
              labelField="label"
              valueField="value"
              value={selectedPrefix}
              onChange={item => setSelectedPrefix(item.value)}
              placeholder="Select prefix"
            />
            <TextInput
              label="Phone Number"
              value={form.phone}
              onChangeText={(text) => {
                // Remove any non-digit characters except spaces and dashes
                const cleanedText = text.replace(/[^\d\s-]/g, '');
                setForm(prev => ({ ...prev, phone: cleanedText }));
              }}
              style={styles.phoneInput}
              keyboardType="phone-pad"
              error={form.phone.trim().length > 0 && !/^[\d\s-]{10,}$/.test(form.phone.trim())}
            />
          </View>
          <ErrorText 
            visible={form.phone.trim().length > 0 && !/^[\d\s-]{10,}$/.test(form.phone.trim())} 
            message="Invalid phone number"
          />
          
          <View>
            <Typography variant="h3" style={styles.sectionTitle}>
              Delivery Address
            </Typography>
            
            <Typography variant="small" style={styles.deliveryNotice}>
              Note: Delivery is only available within Cape Town, South Africa
            </Typography>

            <View style={styles.addressField}>
              <TextInput
                label="Street Address"
                value={form.address.streetAddress}
                onChangeText={(text) => setForm(prev => ({
                  ...prev,
                  address: { ...prev.address, streetAddress: text }
                }))}
                style={styles.input}
                error={form.address.streetAddress.length > 0 && form.address.streetAddress.length < 5}
              />
              <ErrorText 
                visible={form.address.streetAddress.length > 0 && form.address.streetAddress.length < 5}
                message="Please enter a valid street address"
              />
            </View>

            <View style={styles.addressField}>
              <TextInput
                label="Landmark (e.g., nearby church, building)"
                value={form.address.landmark}
                onChangeText={(text) => setForm(prev => ({
                  ...prev,
                  address: { ...prev.address, landmark: text }
                }))}
                style={styles.input}
                error={form.address.landmark.length > 0 && form.address.landmark.length < 3}
              />
              <ErrorText 
                visible={form.address.landmark.length > 0 && form.address.landmark.length < 3}
                message="Please enter a valid landmark"
              />
            </View>

            <View style={styles.addressField}>
              <TextInput
                label="County/Suburb (Optional)"
                value={form.address.county}
                onChangeText={(text) => setForm(prev => ({
                  ...prev,
                  address: { ...prev.address, county: text }
                }))}
                style={styles.input}
              />
            </View>

            <View style={styles.addressField}>
              <TextInput
                label="Postal Code"
                value={form.address.zipCode}
                onChangeText={(text) => setForm(prev => ({
                  ...prev,
                  address: { ...prev.address, zipCode: text }
                }))}
                style={styles.input}
                keyboardType="numeric"
                error={form.address.zipCode.length > 0 && !/^\d{4}$/.test(form.address.zipCode)}
              />
              <ErrorText 
                visible={form.address.zipCode.length > 0 && !/^\d{4}$/.test(form.address.zipCode)}
                message="Please enter a valid 4-digit postal code"
              />
            </View>

            <View style={styles.lockedFields}>
              <Typography variant="small">
                City: Cape Town
              </Typography>
              <Typography variant="small">
                State/Province: Western Cape
              </Typography>
              <Typography variant="small">
                Country: South Africa
              </Typography>
            </View>
          </View>
          
          <Typography variant="h3" style={styles.sectionTitle}>
            Payment Method
          </Typography>
          
          {renderPaymentMethodCards()}
          {renderCryptoPaymentDetails()}

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            disabled={!isFormValid()}
          >
            Confirm Order
          </Button>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentDetails: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  paymentInfo: {
    marginBottom: 8,
  },
  bankDetail: {
    marginBottom: 8,
  },
  paymentMethodContainer: {
    borderRadius: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
  selectedPayment: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  paymentOptionContent: {
    marginLeft: 8,
    flex: 1,
  },
  paymentDescription: {
    color: 'rgba(0,0,0,0.6)',
    marginTop: 4,
  },
  paymentMethodWrapper: {
    borderRadius: 12,
    marginHorizontal: 2,
    marginVertical: 4,
  },
  paymentMethodSurface: {
    elevation: 2,
  },
  dropdown: {
    height: 50,
    borderColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  addressTitle: {
    marginTop: 16,
  },
  uploadButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  pressedPayment: {
    opacity: 0.7,
  },
  addressContainer: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressContainerPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  walletAddress: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    color: '#000',
  },
  copyIcon: {
    marginLeft: 12,
  },
  copyInstruction: {
    color: '#FF0000',
    marginBottom: 8,
    fontSize: 12,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prefixDropdown: {
    width: 120,
    height: 56, // Match TextInput height
    borderColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0, // Override default input margin
  },
  deliveryNotice: {
    color: '#FF0000',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  addressField: {
    marginBottom: 16,
  },
  lockedFields: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
});
