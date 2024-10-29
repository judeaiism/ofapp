import React from 'react';
import { StyleSheet, Image, View, ScrollView, Dimensions, Linking } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Button, Searchbar, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Button as ModernButton } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Image as ExpoImage } from 'expo-image';

const { width } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const featuredBouquets = [
    { id: 1, name: 'Spring Collection', price: '$49.99', color: ['#FF9A8B', '#FF6A88'] },
    { id: 2, name: 'Summer Blooms', price: '$59.99', color: ['#A8E6CF', '#1DE9B6'] },
    { id: 3, name: 'Wedding Special', price: '$89.99', color: ['#FFD3B6', '#FF8B94'] },
  ];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FAFAFA', dark: '#1A1A1A' }}
      headerImage={
        <ExpoImage 
          source={require('@/assets/images/header-background.jpg')}
          style={{
            width: '100%',
            height: 300,
          }}
          contentFit="cover"
        />
      }>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <Typography variant="h1" style={styles.title}>
            Only Wiid
          </Typography>
          <Typography variant="h4" style={styles.subtitle}>
            Fresh flowers, delivered to you
          </Typography>
        </ThemedView>

        <ThemedView style={styles.contentContainer}>
          <ModernButton 
            icon={<Feather name="shopping-bag" size={20} color="white" />}
            onPress={() => router.replace('/stores')}>
            Browse Wiid Stores
          </ModernButton>

          <ModernButton 
            variant="outline"
            icon={<Feather name="map-pin" size={20} color="#374151" />}
            onPress={() => Linking.openURL('https://tracking.wiid.com')}>
            Track Your Order
          </ModernButton>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    padding: 20,
  },
  titleContainer: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 32,
    paddingTop: 16,
  },
  title: {
    textAlign: 'center',
    includeFontPadding: false,
    padding: 0,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    includeFontPadding: false,
    padding: 0,
  },
  contentContainer: {
    gap: 16,
  },
  headerImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  }
});
