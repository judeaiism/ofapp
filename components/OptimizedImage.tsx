import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image, ImageProps } from 'expo-image';
import { ActivityIndicator } from 'react-native-paper';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  fallback?: string;
}

const placeholder = require('@/assets/images/placeholder.png');

export function OptimizedImage({ 
  uri, 
  style, 
  fallback,
  ...props 
}: OptimizedImageProps) {
  return (
    <View style={[styles.container, style]}>
      <Image
        {...props}
        style={[styles.image, style]}
        source={uri}
        placeholder={placeholder}
        transition={200}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
}); 