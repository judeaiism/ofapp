import React, { useState, useEffect } from 'react';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, ScrollView, View, ActivityIndicator, Button } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Typography } from '@/components/ui/typography';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { ProductImage } from '@/components/ProductImage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderDetails {
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: {
      country: string;
      state: string;
      city: string;
      county: string;
      landmark: string;
      streetAddress: string;
      zipCode: string;
    };
  };
  paymentInfo: {
    method: string;
    cryptoType: string;
    proofUrl: string;
  };
  orderDetails: {
    storeId: number;
    products: Array<{
      id: number;
      storeId: number;
      name: string;
      price: number;
      quantity: number;
      image: string | number;
    }>;
    total: number;
    status: string;
    createdAt: number;
    trackingNumber?: string;
  };
}

const ErrorView = ({ error }: { error: string }) => (
  <View style={styles.errorContainer}>
    <Typography variant="h2" style={styles.errorText}>
      {error}
    </Typography>
    <Button 
      onPress={() => router.back()}
      title="Go Back"
    />
  </View>
);

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Attempting to load order with ID:', id);
        
        const orderId = typeof id === 'string' ? id : String(id);
        const storageKey = `order_${orderId}`;
        
        console.log('Checking AsyncStorage for key:', storageKey);
        const storedOrder = await AsyncStorage.getItem(storageKey);
        
        console.log('Retrieved from AsyncStorage:', storedOrder);
        
        if (!storedOrder) {
          const allKeys = await AsyncStorage.getAllKeys();
          console.log('All AsyncStorage keys:', allKeys);
          
          setError('Order not found');
          return;
        }

        const parsedOrder = JSON.parse(storedOrder);
        console.log('Parsed order:', parsedOrder);
        
        if (!parsedOrder) {
          setError('Invalid order data');
          return;
        }

        setOrderDetails(parsedOrder);
      } catch (error) {
        console.error('Error loading order details:', error);
        setError(`Failed to load order details: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadOrderDetails();
    } else {
      setError('Invalid order ID');
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Typography variant="p" style={styles.loadingText}>
            Loading order details...
          </Typography>
        </View>
      </ThemedView>
    );
  }

  if (error || !orderDetails) {
    return (
      <ThemedView style={styles.container}>
        <ErrorView error={error || 'Order not found'} />
      </ThemedView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#FFA000';
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
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderDetails.orderDetails.status) }]}>
                <Typography variant="p" style={styles.statusText}>
                  {orderDetails.orderDetails.status.toUpperCase()}
                </Typography>
              </View>
              <Typography variant="p" style={styles.date}>
                Ordered on {new Date(orderDetails.orderDetails.createdAt).toLocaleDateString()}
              </Typography>
            </View>
          </View>

          {/* Tracking Info */}
          {orderDetails.orderDetails.trackingNumber && (
            <View style={styles.section}>
              <Typography variant="h3" style={styles.sectionTitle}>
                Tracking Information
              </Typography>
              <View style={styles.trackingInfo}>
                <Feather name="package" size={20} color="#666" />
                <Typography variant="p" style={styles.trackingNumber}>
                  {orderDetails.orderDetails.trackingNumber}
                </Typography>
              </View>
            </View>
          )}

          {/* Order Items */}
          <View style={styles.section}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Order Items
            </Typography>
            {orderDetails.orderDetails.products.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <ProductImage 
                  source={item.image} 
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
                    R{item.price.toFixed(2)}
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
              {orderDetails.customerInfo.address.streetAddress}, 
              {orderDetails.customerInfo.address.landmark && ` near ${orderDetails.customerInfo.address.landmark},`}
              {orderDetails.customerInfo.address.city}, 
              {orderDetails.customerInfo.address.state}, 
              {orderDetails.customerInfo.address.country} 
              {orderDetails.customerInfo.address.zipCode}
            </Typography>
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Order Summary
            </Typography>
            <View style={styles.summaryRow}>
              <Typography variant="p">Subtotal</Typography>
              <Typography variant="p">R{orderDetails.orderDetails.total.toFixed(2)}</Typography>
            </View>
            <View style={styles.summaryRow}>
              <Typography variant="p">Shipping</Typography>
              <Typography variant="p">Free</Typography>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Typography variant="h3">Total</Typography>
              <Typography variant="h3">R{orderDetails.orderDetails.total.toFixed(2)}</Typography>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const additionalStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
});

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
  ...additionalStyles,
});
