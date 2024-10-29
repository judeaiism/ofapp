import React, { useState, useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, ScrollView, View, Image, Pressable, ActivityIndicator } from 'react-native';
import { Typography } from '@/components/ui/typography';
import { ThemedView } from '@/components/ThemedView';
import { Searchbar, Button } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Button as ModernButton } from '@/components/ui/button';
import { CartButton } from '@/components/CartButton';
import { ALL_STORES } from '@/data/stores';
import { Store } from '@/types/store';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function StoresScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStores, setFilteredStores] = useState<Store[]>(ALL_STORES);
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | undefined>(undefined);
  const [imageLoadingStates, setImageLoadingStates] = useState<{[key: number]: boolean}>({});
  const [imageErrorStates, setImageErrorStates] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const calculateDistance = useCallback(
    (store: Store) => {
      if (!location?.coords || !store.coordinates) return Infinity;
      
      const R = 6371;
      const lat1 = location.coords.latitude * Math.PI / 180;
      const lat2 = store.coordinates.latitude * Math.PI / 180;
      const dLat = (store.coordinates.latitude - location.coords.latitude) * Math.PI / 180;
      const dLon = (store.coordinates.longitude - location.coords.longitude) * Math.PI / 180;

      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    },
    [location]
  );

  useEffect(() => {
    let result = [...ALL_STORES];
    
    if (searchQuery) {
      result = result.filter(store => 
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'distance') {
        return calculateDistance(a) - calculateDistance(b);
      } else {
        return b.rating - a.rating;
      }
    });

    setFilteredStores(result);
  }, [searchQuery, sortBy, location, calculateDistance]);

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
          headerTitle: "W𖠞𖠞d Stores",
          headerTransparent: true,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTitleStyle: {
            color: '#000',
            fontSize: 24,
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <ModernButton
              variant="outline"
              onPress={() => router.replace('/')}
              icon={<Feather name="home" size={20} color="#666" />}
              style={[styles.backButton]} // Updated style
            >
              Home
            </ModernButton>
          ),
          headerBackground: () => (
            <BlurView intensity={100} tint="light" style={[StyleSheet.absoluteFill, { zIndex: 0 }]} />
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <CartButton />
            </View>
          ),
        }} 
      />
      <ThemedView style={styles.container}>
        <ThemedView style={styles.contentContainer}>
          <Searchbar
            placeholder="Search stores..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#666"
            inputStyle={{ 
              fontSize: 16,
              color: '#1F2937', // Darker text color
            }}
            placeholderTextColor="#9CA3AF" // Lighter placeholder color
            elevation={0} // Remove default elevation
          />
          
          <Animated.View style={[styles.mapContainer, mapExpanded && styles.mapExpanded]}>
            <MapView
              style={styles.map}
              region={mapRegion}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {filteredStores.map((store) => {
                if (!store.coordinates) return null;
                
                return (
                  <Marker
                    key={store.id}
                    coordinate={{
                      latitude: store.coordinates.latitude,
                      longitude: store.coordinates.longitude,
                    }}
                    title={store.name}
                    description={store.address}
                    onPress={() => handleStorePress(store.id)}
                  >
                    <View style={styles.markerContainer}>
                      <View style={styles.marker}>
                        <Feather name="shopping-bag" size={20} color="#fff" />
                      </View>
                    </View>
                  </Marker>
                );
              })}
            </MapView>
            <Button 
              mode="contained" 
              onPress={() => setMapExpanded(!mapExpanded)}
              style={styles.expandButton}
            >
              {mapExpanded ? 'Collapse Map' : 'Expand Map'}
            </Button>
          </Animated.View>

          <View style={styles.boldSeparator} />

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
                <View style={styles.imageContainer}>
                  <Image 
                    source={typeof store.image === 'number' ? store.image : { uri: store.image }}
                    style={styles.storeImage}
                    resizeMode="cover"
                    onLoadStart={() => setImageLoadingStates(prev => ({ ...prev, [store.id]: true }))}
                    onLoadEnd={() => setImageLoadingStates(prev => ({ ...prev, [store.id]: false }))}
                    onError={() => setImageErrorStates(prev => ({ ...prev, [store.id]: true }))}
                  />
                  {imageLoadingStates[store.id] && (
                    <View style={[styles.storeImage, styles.imagePlaceholder]}>
                      <ActivityIndicator color="#666" />
                    </View>
                  )}
                  {imageErrorStates[store.id] && (
                    <View style={[styles.storeImage, styles.imageError]}>
                      <Feather name="image" size={24} color="#666" />
                      <Typography variant="small" style={styles.errorText}>
                        Image not available
                      </Typography>
                    </View>
                  )}
                  <LinearGradient
                    colors={['rgba(0,0,0,0.5)', 'transparent']}
                    style={styles.imageOverlay}
                  />
                </View>
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
                      {store.address} • {store.distance} km
                    </Typography>
                  </View>
                </View>
              </AnimatedPressable>
            ))}
          </ScrollView>
        </ThemedView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 21,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 12,
    height: 50,
    backgroundColor: '#F3F4F6',
    // Enhanced shadow for better visibility
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    // Remove any existing margins that might cause overlap
    marginTop: 0,
    // Add border for better definition
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mapContainer: {
    height: 200,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F0F0F0',
  },
  mapExpanded: {
    height: 400,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  expandButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 20,
  },
  boldSeparator: {
    height: 2,
    backgroundColor: '#333',
    marginVertical: 16,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeImage: {
    width: '100%',
    height: 150,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  storeInfo: {
    padding: 16,
    gap: 8,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
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
  backButton: {
    marginLeft: 16,
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
    height: 40,
    minWidth: 100, // Add minimum width
    paddingHorizontal: 12, // Adjust padding
    paddingVertical: 8,  // Add vertical padding
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    backgroundColor: '#FF4B4B',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageError: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#666',
  },
});
