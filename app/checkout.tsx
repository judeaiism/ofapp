import React, { useState } from 'react';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, ScrollView, View, Image, Text } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Typography } from '@/components/ui/typography';
import { TextInput, Button, RadioButton, Surface } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { generateOrderId } from '@/utils/orderUtils';
import { Dropdown } from 'react-native-element-dropdown';

type PaymentMethodType = 'crypto' | 'eft';
type CryptoType = 'btc' | 'erc20' | 'trc20';
type CryptoOption = { label: string; value: CryptoType };

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

  const handleSubmit = () => {
    router.push({
      pathname: '/checkout/success',
      params: { orderId }
    });
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
      <Image 
        source={PAYMENT_DETAILS.crypto[selectedCrypto as CryptoType].qrCodeUrl}
        style={styles.qrCode}
        resizeMode="contain"
      />
    </View>
  );

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
          
          <View style={styles.paymentMethodWrapper}>
            <Surface style={styles.paymentMethodSurface}>
              <RadioButton.Group 
                onValueChange={handlePaymentMethodChange}
                value={paymentMethod}
              >
                <View style={styles.paymentMethodContainer}>
                  <View 
                    style={[
                      styles.paymentOption,
                      paymentMethod === 'crypto' && styles.selectedPayment
                    ]}
                  >
                    <RadioButton value="crypto" />
                    <View style={styles.paymentOptionContent}>
                      <Typography variant="h4">Pay with Cryptocurrency</Typography>
                      <Typography variant="small" style={styles.paymentDescription}>
                        Pay instantly using your crypto wallet
                      </Typography>
                    </View>
                  </View>
                  
                  <View 
                    style={[
                      styles.paymentOption,
                      paymentMethod === 'eft' && styles.selectedPayment
                    ]}
                  >
                    <RadioButton value="eft" />
                    <View style={styles.paymentOptionContent}>
                      <Typography variant="h4">Pay with EFT</Typography>
                      <Typography variant="small" style={styles.paymentDescription}>
                        Make a direct bank transfer
                      </Typography>
                    </View>
                  </View>
                </View>
              </RadioButton.Group>
            </Surface>
          </View>

          {paymentMethod === 'crypto' && renderCryptoPaymentDetails()}

          {paymentMethod === 'eft' && (
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
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
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
    marginBottom: 4,
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
});
