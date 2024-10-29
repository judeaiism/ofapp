import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface ProductImageProps {
  source: string | number;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

export function ProductImage({ source, style, resizeMode = 'cover' }: ProductImageProps) {
  // Handle the image source properly
  const imageSource = typeof source === 'string' 
    ? { uri: source }
    : source;

  return (
    <Image
      source={imageSource}
      style={style}
      resizeMode={resizeMode}
      // Add default placeholder while image loads
      defaultSource={require('@/assets/images/placeholder.png')}
    />
  );
} 