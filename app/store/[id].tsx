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
import { getStoreById } from '@/data/stores';
import { Store } from '@/types/store';

export default function StoreDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [selectedProducts, setSelectedProducts] = useState<{[key: number]: number}>({});
  const { dispatch } = useCart();
  
  // Get the specific store data using the ID
  const store = getStoreById(Number(id));

  // Show loading or error state if store not found
  if (!store) {
    return (
      <ThemedView style={styles.container}>
        <Typography variant="h2">Store not found</Typography>
      </ThemedView>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${store.contact.phone}`);
  };

  const handleMessage = () => {
    // Redirect to Wiid chat URL without parameters
    Linking.openURL('https://wiid.app/chat');
  };

  const handleAddToCart = (product: Store['products'][0]) => {
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
          <Image source={store.coverImages[0]} style={styles.image} />
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
              <Typography variant="p" style={styles.infoText}>
                Monday: {store.hours.monday}{'\n'}
                Tuesday: {store.hours.tuesday}{'\n'}
                Wednesday: {store.hours.wednesday}{'\n'}
                Thursday: {store.hours.thursday}{'\n'}
                Friday: {store.hours.friday}{'\n'}
                Saturday: {store.hours.saturday}{'\n'}
                Sunday: {store.hours.sunday}
              </Typography>
            </View>

            <View style={styles.infoSection}>
              <Feather name="phone" size={20} color="#666" />
              <Typography variant="p" style={styles.infoText}>{store.contact.phone}</Typography>
            </View>

            <Typography variant="h3" style={styles.sectionTitle}>About</Typography>
            <Typography variant="p" style={styles.description}>
              {store.description}
            </Typography>

            {/* Services Section */}
            <Typography variant="h3" style={styles.sectionTitle}>Services</Typography>
            <View style={styles.tagContainer}>
              {store.services.map((service, index) => (
                <View key={index} style={styles.tag}>
                  <Typography variant="small">{service}</Typography>
                </View>
              ))}
            </View>

            {/* Specialties Section */}
            <Typography variant="h3" style={styles.sectionTitle}>Specialties</Typography>
            <View style={styles.tagContainer}>
              {store.specialties.map((specialty, index) => (
                <View key={index} style={styles.tag}>
                  <Typography variant="small">{specialty}</Typography>
                </View>
              ))}
            </View>

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
                  <Image source={product.image} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Typography variant="p" style={styles.productName}>
                      {product.name}
                    </Typography>
                    <Typography variant="p" style={styles.productPrice}>
                      R{product.price.toFixed(2)}
                    </Typography>
                    <Typography variant="small" style={styles.productDescription}>
                      {product.description}
                    </Typography>
                    <Button 
                      mode="contained"
                      onPress={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                    >
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </View>
                </View>
              ))}
            </View>

            {/* Delivery Information */}
            <Typography variant="h3" style={styles.sectionTitle}>Delivery Information</Typography>
            <View style={styles.deliveryInfo}>
              <Typography variant="p">Minimum Order: R{store.deliveryInfo.minOrder}</Typography>
              <Typography variant="p">Delivery Fee: R{store.deliveryInfo.fee}</Typography>
              <Typography variant="p">Estimated Time: {store.deliveryInfo.estimatedTime}</Typography>
              <Typography variant="p">Delivery Areas:</Typography>
              <View style={styles.tagContainer}>
                {store.deliveryInfo.areas.map((area, index) => (
                  <View key={index} style={styles.tag}>
                    <Typography variant="small">{area}</Typography>
                  </View>
                ))}
              </View>
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
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  deliveryInfo: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  productDescription: {
    color: '#666',
    marginVertical: 4,
  }
});
