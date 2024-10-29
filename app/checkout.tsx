import React, { useState } from 'react';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, ScrollView, View, Image, Text } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Typography } from '@/components/ui/typography';
import { TextInput, Button, RadioButton } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { generateOrderId } from '@/utils/orderUtils';

export default function CheckoutScreen() {
  const { storeId, products } = useLocalSearchParams();
  const [paymentMethod, setPaymentMethod] = useState('crypto');
  const [orderId] = useState(generateOrderId());
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const PAYMENT_DETAILS = {
    crypto: {
      walletAddress: '0x1234...5678',
      qrCodeUrl: require('@/assets/images/crypto-qr.png'),
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
          
          <RadioButton.Group onValueChange={value => setPaymentMethod(value)} value={paymentMethod}>
            <View style={styles.radioOption}>
              <RadioButton value="crypto" />
              <Typography>Pay with Cryptocurrency</Typography>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="eft" />
              <Typography>Pay with EFT</Typography>
            </View>
          </RadioButton.Group>

          {paymentMethod === 'crypto' && (
            <View style={styles.paymentDetails}>
              <Typography variant="p" style={styles.paymentInfo}>
                Send payment to the following wallet address:
              </Typography>
              <Typography variant="small">
                <Text selectable style={styles.walletAddress}>
                  {PAYMENT_DETAILS.crypto.walletAddress}
                </Text>
              </Typography>
              <Image 
                source={PAYMENT_DETAILS.crypto.qrCodeUrl}
                style={styles.qrCode}
                resizeMode="contain"
              />
            </View>
          )}

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
  },
  qrCode: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },
  bankDetail: {
    marginBottom: 4,
  },
});
