import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, ScrollView, View, Image, Pressable } from 'react-native';
import { Typography } from '@/components/ui/typography';
import { ThemedView } from '@/components/ThemedView';
import { Searchbar, Menu } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import * as Location from 'expo-location';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Store {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  image: string;
  distance: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

const stores: Store[] = [
  {
    id: 1,
    name: "Bloom & Wild",
    rating: 4.8,
    reviews: 234,
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364",
    distance: "1.2",
    address: "123 Flower Street",
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
  },
  {
    id: 2,
    name: "Rose Garden",
    rating: 4.6,
    reviews: 186,
    image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd",
    distance: "2.4",
    address: "456 Petal Avenue",
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
  },
  {
    id: 3,
    name: "Floral Paradise",
    rating: 4.9,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1558350315-8aa00e8e4590",
    distance: "0.8",
    address: "789 Bouquet Road",
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
  },
];

export default function StoresScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStores, setFilteredStores] = useState(stores);
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [menuVisible, setMenuVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      }
    })();
  }, []);

  const calculateDistance = (store: Store) => {
    if (!userLocation?.coords || !store.coordinates) return Infinity;
    
    // Haversine formula for calculating distance
    const R = 6371; // Earth's radius in km
    const lat1 = userLocation.coords.latitude * Math.PI / 180;
    const lat2 = store.coordinates.latitude * Math.PI / 180;
    const dLat = (store.coordinates.latitude - userLocation.coords.latitude) * Math.PI / 180;
    const dLon = (store.coordinates.longitude - userLocation.coords.longitude) * Math.PI / 180;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    let result = [...stores];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(store => 
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'distance') {
        return calculateDistance(a) - calculateDistance(b);
      } else {
        return b.rating - a.rating;
      }
    });

    setFilteredStores(result);
  }, [searchQuery, sortBy, userLocation]);

  const handleStorePress = (storeId: number) => {
    router.push({
      pathname: '/store/[id]',
      params: { id: storeId }
    });
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerTitle: "Flower Stores",
          headerRight: () => (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Pressable onPress={() => setMenuVisible(true)}>
                  <Feather name="sliders" size={24} color="#374151" style={{ marginRight: 16 }} />
                </Pressable>
              }
            >
              <Menu.Item 
                onPress={() => { setSortBy('distance'); setMenuVisible(false); }}
                title="Sort by Distance"
                leadingIcon="map-marker"
              />
              <Menu.Item 
                onPress={() => { setSortBy('rating'); setMenuVisible(false); }}
                title="Sort by Rating"
                leadingIcon="star"
              />
            </Menu>
          ),
        }} 
      />
      <ThemedView style={styles.container}>
        <Searchbar
          placeholder="Search stores..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#666"
        />
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredStores.map((store, index) => (
            <AnimatedPressable
              key={store.id}
              entering={FadeInDown.delay(index * 100)}
              style={styles.storeCard}
              onPress={() => handleStorePress(store.id)}
            >
              <Image source={{ uri: store.image }} style={styles.storeImage} />
              <View style={styles.storeInfo}>
                <Typography variant="h3" style={styles.storeName}>
                  {store.name}
                </Typography>
                <View style={styles.ratingContainer}>
                  <Feather name="star" size={16} color="#FFB800" />
                  <Typography variant="p" style={styles.rating}>
                    {store.rating} ({store.reviews} reviews)
                  </Typography>
                </View>
                <View style={styles.locationContainer}>
                  <Feather name="map-pin" size={16} color="#666" />
                  <Typography variant="small" style={styles.address}>
                    {store.address} • {store.distance}
                  </Typography>
                </View>
              </View>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  searchBar: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  storeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    gap: 16,
    elevation: 2,
  },
  storeImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  storeInfo: {
    flex: 1,
    gap: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: '#666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  address: {
    color: '#666',
  },
});
