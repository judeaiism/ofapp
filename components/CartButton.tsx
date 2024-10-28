import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart } from '@/app/contexts/CartContext';
import { Typography } from '@/components/ui/typography';

export function CartButton() {
  const { state } = useCart();
  const itemCount = state.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);

  return (
    <Pressable 
      style={styles.container} 
      onPress={() => router.push('/cart' as any)}
    >
      <Feather name="shopping-cart" size={24} color="#374151" />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Typography variant="small" style={styles.badgeText}>
            {itemCount}
          </Typography>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginRight: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
