import React from 'react';
import { StyleSheet } from 'react-native';
import { OptimizedImage } from './OptimizedImage';

interface ProductImageProps {
  source: string | number;
  style?: any;
}

export function ProductImage({ source, style }: ProductImageProps) {
  // Convert number (local require) to string by accessing the default property
  // Remote URLs (strings) are passed through unchanged
  const imageUri = typeof source === 'number' ? source.toString() : source;

  return (
    <OptimizedImage
      uri={imageUri}
      style={[styles.image, style]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
}); 