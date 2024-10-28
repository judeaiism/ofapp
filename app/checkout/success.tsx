import React from 'react';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Typography } from '@/components/ui/typography';
import { Button } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';

export default function CheckoutSuccessScreen() {
  const params = useLocalSearchParams();
  // Ensure orderId is a string
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;

  const handleContinueShopping = () => {
    router.replace({
      pathname: '/(tabs)'
    });
  };

  const handleViewOrder = () => {
    if (orderId) {
      router.push({
        pathname: '/orders/[id]',
        params: { id: orderId }
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Order Confirmed",
          headerTransparent: true,
          headerBackground: () => (
            <BlurView intensity={100} style={StyleSheet.absoluteFill} />
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Feather name="check-circle" size={64} color="#4CAF50" />
          </View>

          <Typography variant="h2" style={styles.title}>
            Thank You!
          </Typography>

          <Typography variant="p" style={styles.message}>
            Your order has been successfully placed. We'll send you a confirmation
            email with your order details.
          </Typography>

          <Typography variant="p" style={styles.orderNumber}>
            Order Number: {orderId}
          </Typography>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleViewOrder}
              style={styles.button}
              disabled={!orderId}
            >
              View Order
            </Button>
            <Button
              mode="outlined"
              onPress={handleContinueShopping}
              style={styles.button}
            >
              Continue Shopping
            </Button>
          </View>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  orderNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
  },
});
