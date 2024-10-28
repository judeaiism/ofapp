import React, { useState } from 'react';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Typography } from '@/components/ui/typography';
import { TextInput, Button } from 'react-native-paper';
import { BlurView } from 'expo-blur';

export default function CheckoutScreen() {
  const { storeId, products } = useLocalSearchParams();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const handleSubmit = () => {
    // Here you would typically process the payment
    // and create the order in your backend
    
    // Navigate to success page
    router.push({
      pathname: '/checkout/success',
      params: { orderId: 'ORDER123' }
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
            Payment Details
          </Typography>
          <TextInput
            label="Card Number"
            value={form.cardNumber}
            onChangeText={(text) => setForm(prev => ({ ...prev, cardNumber: text }))}
            style={styles.input}
          />
          <View style={styles.row}>
            <TextInput
              label="Expiry Date"
              value={form.expiryDate}
              onChangeText={(text) => setForm(prev => ({ ...prev, expiryDate: text }))}
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="CVV"
              value={form.cvv}
              onChangeText={(text) => setForm(prev => ({ ...prev, cvv: text }))}
              style={[styles.input, styles.halfInput]}
              secureTextEntry
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            Place Order
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
});
