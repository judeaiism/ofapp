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

type PaymentMethodType = 'crypto' | 'eft';
type CryptoType = 'btc' | 'erc20' | 'trc20';
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

export default function CheckoutScreen() {
  const { storeId, products } = useLocalSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('crypto');
  const [orderId] = useState(generateOrderId());
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>('btc');
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [paymentProofAsset, setPaymentProofAsset] = useState<DocumentAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { state, dispatch } = useCart();

  const CRYPTO_OPTIONS: CryptoOption[] = [
    { label: 'Bitcoin (BTC)', value: 'btc' },
    { label: 'USDT (ERC20)', value: 'erc20' },
    { label: 'USDT (TRC20)', value: 'trc20' },
  ];

  const PAYMENT_DETAILS = {
    crypto: {
      btc: {
        walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        qrCodeUrl: require('@/assets/images/btc-qr.png'),
      },
      erc20: {
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        qrCodeUrl: require('@/assets/images/erc20-qr.png'),
      },
      trc20: {
        walletAddress: 'TNVtwXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        qrCodeUrl: require('@/assets/images/trc20-qr.png'),
      },
    },
    eft: {
      bankName: 'Example Bank',
      accountHolder: 'Flower Shop',
      accountNumber: '1234567890',
      branchCode: '250655',
      reference: orderId,
    },
  };

  const createOrder = async (paymentProofUrl: string | null) => {
    try {
      // Create order document in Firestore
      const orderData = {
        id: orderId,
        items: state.items,
        total: state.total,
        status: 'ordered',
        date: new Date().toISOString(),
        customerInfo: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
        },
        payment: {
          method: paymentMethod,
          ...(paymentMethod === 'crypto' && { cryptoType: selectedCrypto }),
          proofUrl: paymentProofUrl,
        },
      };

      // Save to Firestore
      await setDoc(doc(db, 'orders', orderId), orderData);

      // Clear cart and redirect
      dispatch({ type: 'CLEAR_CART' });
      router.push({
        pathname: '/checkout/success',
        params: { orderId }
      });
    } catch (error) {
      console.error('Error creating order:', error);
      throw error; // Re-throw to be handled by the parent try-catch
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
      <Typography variant="small">
        <Text selectable style={styles.walletAddress}>
          {PAYMENT_DETAILS.crypto[selectedCrypto as CryptoType].walletAddress}
        </Text>
      </Typography>
      
      <Button
        mode="outlined"
        onPress={handleFilePick}
        style={styles.uploadButton}
      >
        {paymentProof ? `Selected: ${paymentProof}` : 'Upload Payment Proof'}
      </Button>
      
      <Image 
        source={PAYMENT_DETAILS.crypto[selectedCrypto as CryptoType].qrCodeUrl}
        style={styles.qrCode}
        resizeMode="contain"
      />
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
        <RadioButton.Group 
          onValueChange={handlePaymentMethodChange}
          value={paymentMethod}
        >
          <View style={styles.paymentMethodContainer}>
            <Pressable 
              onPress={() => handlePaymentMethodChange('crypto')}
              style={({ pressed }: { pressed: boolean }) => [
                styles.paymentOption,
                paymentMethod === 'crypto' && styles.selectedPayment,
                pressed && styles.pressedPayment
              ]}
            >
              <RadioButton value="crypto" />
              <View style={styles.paymentOptionContent}>
                <Typography variant="h4">Pay with Cryptocurrency</Typography>
                <Typography variant="small" style={styles.paymentDescription}>
                  Pay instantly using your crypto wallet
                </Typography>
              </View>
            </Pressable>
            
            <Pressable
              onPress={() => handlePaymentMethodChange('eft')}
              style={({ pressed }: { pressed: boolean }) => [
                styles.paymentOption,
                paymentMethod === 'eft' && styles.selectedPayment,
                pressed && styles.pressedPayment
              ]}
            >
              <RadioButton value="eft" />
              <View style={styles.paymentOptionContent}>
                <Typography variant="h4">Pay with EFT</Typography>
                <Typography variant="small" style={styles.paymentDescription}>
                  Make a direct bank transfer
                </Typography>
              </View>
            </Pressable>
          </View>
        </RadioButton.Group>
      </Surface>
    </View>
  );

  const renderEftPaymentDetails = () => (
    <View style={styles.paymentDetails}>
      <Typography variant="p" style={styles.paymentInfo}>
        Bank Details:
      </Typography>
      {Object.entries(PAYMENT_DETAILS.eft).map(([key, value]) => (
        <Typography key={key} variant="small">
          <Text selectable style={styles.bankDetail}>
            {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
          </Text>
        </Typography>
      ))}

      <Button
        mode="outlined"
        onPress={handleFilePick}
        style={styles.uploadButton}
      >
        {paymentProof ? `Selected: ${paymentProof}` : 'Upload Payment Proof'}
      </Button>
    </View>
  );

  // Add validation function
  const isFormValid = () => {
    const isContactInfoComplete = 
      form.name.trim() !== '' &&
      form.email.trim() !== '' &&
      form.phone.trim() !== '' &&
      form.address.trim() !== '';
    
    // Require payment proof for both payment methods
    const isPaymentComplete = paymentProof !== null;

    return isContactInfoComplete && isPaymentComplete;
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
          <TextInput
            label="Full Name"
            value={form.name}
            onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={form.email}
            onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
            style={styles.input}
          />
          <TextInput
            label="Phone"
            value={form.phone}
            onChangeText={(text) => setForm(prev => ({ ...prev, phone: text }))}
            style={styles.input}
          />
          <TextInput
            label="Delivery Address"
            value={form.address}
            onChangeText={(text) => setForm(prev => ({ ...prev, address: text }))}
            style={styles.input}
            multiline
          />

          <Typography variant="h3" style={styles.sectionTitle}>
            Payment Method
          </Typography>
          
          {renderPaymentMethodCards()}

          {paymentMethod === 'crypto' && renderCryptoPaymentDetails()}

          {paymentMethod === 'eft' && renderEftPaymentDetails()}

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
  walletAddress: {
    fontFamily: 'monospace',
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  qrCode: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: 16,
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
});
