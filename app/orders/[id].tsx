import React, { useState, useEffect } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Typography } from '@/components/ui/typography';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { OptimizedImage } from '@/components/OptimizedImage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderDetails {
  id: string;
  status: 'ordered' | 'processing' | 'shipped' | 'delivered';
  date: string;
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  trackingNumber?: string;
}

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        const storedOrder = await AsyncStorage.getItem(`order_${id}`);
        if (storedOrder) {
          setOrderDetails(JSON.parse(storedOrder));
        }
      } catch (error) {
        console.error('Error loading order details:', error);
      }
    };

    loadOrderDetails();
  }, [id]);

  if (!orderDetails) {
    return (
      <ThemedView style={styles.container}>
        <Typography variant="h2">Loading order details...</Typography>
      </ThemedView>
    );
  }

  const getStatusColor = (status: OrderDetails['status']) => {
    switch (status) {
      case 'ordered': return '#FFA000';
      case 'processing': return '#1976D2';
      case 'shipped': return '#7B1FA2';
      case 'delivered': return '#388E3C';
      default: return '#666';
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `Order #${id}`,
          headerTransparent: true,
          headerBackground: () => (
            <BlurView intensity={100} style={StyleSheet.absoluteFill} />
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Order Status */}
          <View style={styles.section}>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderDetails.status) }]}>
                <Typography variant="p" style={styles.statusText}>
                  {orderDetails.status.toUpperCase()}
                </Typography>
              </View>
              <Typography variant="p" style={styles.date}>
                Ordered on {orderDetails.date}
              </Typography>
            </View>
          </View>

          {/* Tracking Info */}
          {orderDetails.trackingNumber && (
            <View style={styles.section}>
              <Typography variant="h3" style={styles.sectionTitle}>
                Tracking Information
              </Typography>
              <View style={styles.trackingInfo}>
                <Feather name="package" size={20} color="#666" />
                <Typography variant="p" style={styles.trackingNumber}>
                  {orderDetails.trackingNumber}
                </Typography>
              </View>
            </View>
          )}

          {/* Order Items */}
          <View style={styles.section}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Order Items
            </Typography>
            {orderDetails.items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <OptimizedImage 
                  uri={item.image} 
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Typography variant="p" style={styles.itemName}>
                    {item.name}
                  </Typography>
                  <Typography variant="small" style={styles.itemQuantity}>
                    Quantity: {item.quantity}
                  </Typography>
                  <Typography variant="p" style={styles.itemPrice}>
                    ${item.price.toFixed(2)}
                  </Typography>
                </View>
              </View>
            ))}
          </View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Shipping Address
            </Typography>
            <Typography variant="p" style={styles.address}>
              {orderDetails.shippingAddress}
            </Typography>
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Order Summary
            </Typography>
            <View style={styles.summaryRow}>
              <Typography variant="p">Subtotal</Typography>
              <Typography variant="p">${orderDetails.total.toFixed(2)}</Typography>
            </View>
            <View style={styles.summaryRow}>
              <Typography variant="p">Shipping</Typography>
              <Typography variant="p">Free</Typography>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Typography variant="h3">Total</Typography>
              <Typography variant="h3">${orderDetails.total.toFixed(2)}</Typography>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
  },
  date: {
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackingNumber: {
    color: '#666',
  },
  itemCard: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemImage: {
    width: 80,
    height: 80,
  },
  itemInfo: {
    flex: 1,
    padding: 12,
  },
  itemName: {
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontWeight: '600',
  },
  address: {
    color: '#666',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    marginTop: 8,
  },
});
