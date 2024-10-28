import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, ScrollView, View, Pressable } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Typography } from '@/components/ui/typography';
import { Button } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useCart } from '@/app/contexts/CartContext';
import { router } from 'expo-router';
import { OptimizedImage } from '@/components/OptimizedImage';

// Add interface for CartItem
interface CartItem {
  id: number;
  storeId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartScreen() {
  const { state, dispatch } = useCart();

  const handleCheckout = () => {
    router.push({
      pathname: '/checkout',
      params: { 
        products: JSON.stringify(state.items)
      }
    });
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Shopping Cart",
          headerTransparent: true,
          headerBackground: () => (
            <BlurView intensity={100} style={StyleSheet.absoluteFill} />
          ),
        }}
      />
      <ThemedView style={styles.container}>
        {state.items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="shopping-cart" size={64} color="#666" />
            <Typography variant="h2" style={styles.emptyTitle}>
              Your cart is empty
            </Typography>
            <Typography variant="p" style={styles.emptyText}>
              Add some items to get started
            </Typography>
            <Button
              mode="contained"
              onPress={() => router.push('/(tabs)/stores')}
              style={styles.shopButton}
            >
              Browse Stores
            </Button>
          </View>
        ) : (
          <>
            <ScrollView style={styles.itemList}>
              {state.items.map((item: CartItem) => (
                <View key={item.id} style={styles.cartItem}>
                  <OptimizedImage 
                    uri={item.image} 
                    style={styles.itemImage}
                  />
                  <View style={styles.itemInfo}>
                    <Typography variant="p" style={styles.itemName}>
                      {item.name}
                    </Typography>
                    <Typography variant="p" style={styles.itemPrice}>
                      ${item.price.toFixed(2)}
                    </Typography>
                    <View style={styles.quantityControls}>
                      <Button
                        mode="outlined"
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <Typography variant="p" style={styles.quantity}>
                        {item.quantity}
                      </Typography>
                      <Button
                        mode="outlined"
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </View>
                  </View>
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => dispatch({ type: 'REMOVE_ITEM', payload: { id: item.id } })}
                  >
                    <Feather name="x" size={24} color="#666" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
            <View style={styles.footer}>
              <View style={styles.totalContainer}>
                <Typography variant="h3">Total:</Typography>
                <Typography variant="h2" style={styles.totalAmount}>
                  ${state.total.toFixed(2)}
                </Typography>
              </View>
              <Button
                mode="contained"
                onPress={handleCheckout}
                style={styles.checkoutButton}
              >
                Proceed to Checkout
              </Button>
            </View>
          </>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    marginBottom: 24,
  },
  shopButton: {
    width: '100%',
  },
  itemList: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemPrice: {
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
  removeButton: {
    padding: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalAmount: {
    color: '#4CAF50',
  },
  checkoutButton: {
    width: '100%',
  }
});
