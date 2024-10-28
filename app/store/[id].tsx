import { useLocalSearchParams, Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Image, Linking, Pressable } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Typography } from '@/components/ui/typography';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import { useCart } from '../contexts/CartContext';
import { CartButton } from '@/components/CartButton';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
}

export default function StoreDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [selectedProducts, setSelectedProducts] = useState<{[key: number]: number}>({});
  const { dispatch } = useCart();
  
  const handleCall = () => {
    Linking.openURL(`tel:${store.phone}`);
  };

  const handleMessage = () => {
    // Navigate to chat screen
    router.push({
      pathname: '/chat/[id]',
      params: { id: store.id }
    });
  };

  const addToCart = (productId: number) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: number) => {
    setSelectedProducts(prev => {
      const newCount = (prev[productId] || 0) - 1;
      const newSelected = { ...prev };
      if (newCount <= 0) {
        delete newSelected[productId];
      } else {
        newSelected[productId] = newCount;
      }
      return newSelected;
    });
  };

  const getTotalPrice = () => {
    return Object.entries(selectedProducts).reduce((total, [productId, quantity]) => {
      const product = store.products.find(p => p.id === Number(productId));
      return total + (product?.price || 0) * quantity;
    }, 0);
  };

  const handleCheckout = () => {
    router.push({
      pathname: '/checkout',
      params: { 
        storeId: store.id,
        products: JSON.stringify(selectedProducts)
      }
    });
  };

  const handleAddToCart = (product: Product) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        storeId: Number(id),
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      }
    });
  };

  // In a real app, you would fetch the store data based on the ID
  // For this example, we'll hardcode the data
  const store = {
    id: 1,
    name: "Blooming Paradise",
    rating: 4.8,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1562690868-60bbe7293e94",
    distance: "2.5",
    address: "123 Flower Street, Garden District",
    description: "A beautiful flower shop offering a wide variety of fresh flowers and arrangements. We specialize in custom bouquets and event floristry.",
    hours: "Mon-Sat: 9AM-6PM\nSun: 10AM-4PM",
    phone: "(555) 123-4567",
    products: [
      {
        id: 1,
        name: "Red Rose Bouquet",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1548386135-000f8f8b6308",
        description: "Beautiful arrangement of fresh red roses",
        category: "Bouquets",
        inStock: true,
      },
      {
        id: 2,
        name: "Sunflower Bundle",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1551945326-df678a97c3af",
        description: "Bright and cheerful sunflowers",
        category: "Single Flowers",
        inStock: true,
      },
      // Add more products as needed
    ],
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: store.name,
          headerTransparent: true,
          headerBackground: () => (
            <BlurView intensity={100} style={StyleSheet.absoluteFill} />
          ),
          headerRight: () => <CartButton />
        }}
      />
      <ThemedView style={styles.container}>
        <ScrollView>
          <Image source={{ uri: store.image }} style={styles.image} />
          <View style={styles.content}>
            <Typography variant="h2" style={styles.name}>{store.name}</Typography>
            
            <View style={styles.ratingContainer}>
              <Feather name="star" size={20} color="#FFB800" />
              <Typography variant="p" style={styles.rating}>
                {store.rating} ({store.reviews} reviews)
              </Typography>
            </View>

            <View style={styles.infoSection}>
              <Feather name="map-pin" size={20} color="#666" />
              <Typography variant="p" style={styles.infoText}>{store.address}</Typography>
            </View>

            <View style={styles.infoSection}>
              <Feather name="clock" size={20} color="#666" />
              <Typography variant="p" style={styles.infoText}>{store.hours}</Typography>
            </View>

            <View style={styles.infoSection}>
              <Feather name="phone" size={20} color="#666" />
              <Typography variant="p" style={styles.infoText}>{store.phone}</Typography>
            </View>

            <Typography variant="h3" style={styles.sectionTitle}>About</Typography>
            <Typography variant="p" style={styles.description}>
              {store.description}
            </Typography>

            {/* Contact Buttons */}
            <View style={styles.contactButtons}>
              <Button 
                mode="contained" 
                onPress={handleMessage}
                icon="message"
                style={styles.contactButton}
              >
                Message Store
              </Button>
              <Button 
                mode="contained" 
                onPress={handleCall}
                icon="phone"
                style={styles.contactButton}
              >
                Call Now
              </Button>
            </View>

            {/* Products Section */}
            <Typography variant="h3" style={styles.sectionTitle}>Products</Typography>
            <View style={styles.productsGrid}>
              {store.products.map(product => (
                <View key={product.id} style={styles.productCard}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Typography variant="p" style={styles.productName}>
                      {product.name}
                    </Typography>
                    <Typography variant="p" style={styles.productPrice}>
                      ${product.price.toFixed(2)}
                    </Typography>
                    <Button 
                      mode="contained"
                      onPress={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  </View>
                </View>
              ))}
            </View>

            {/* Checkout Bar */}
            {Object.keys(selectedProducts).length > 0 && (
              <View style={styles.checkoutBar}>
                <Typography variant="p" style={styles.totalPrice}>
                  Total: ${getTotalPrice().toFixed(2)}
                </Typography>
                <Button 
                  mode="contained"
                  onPress={handleCheckout}
                  style={styles.checkoutButton}
                >
                  Proceed to Checkout
                </Button>
              </View>
            )}
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
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  rating: {
    color: '#666',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    color: '#666',
    lineHeight: 24,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  contactButton: {
    flex: 1,
  },
  productsGrid: {
    gap: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  quantity: {
    minWidth: 24,
    textAlign: 'center',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutButton: {
    minWidth: 150,
  },
});
