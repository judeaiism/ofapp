import React from 'react';
import { Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

interface CachedImageProps {
  uri: string;
  style: any;
}

export function CachedImage({ uri, style }: CachedImageProps) {
  const [cachedUri, setCachedUri] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getCachedImage = async () => {
      try {
        const hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          uri
        );
        const cachedFile = `${FileSystem.cacheDirectory}${hash}`;
        const fileInfo = await FileSystem.getInfoAsync(cachedFile);
        
        if (fileInfo.exists) {
          setCachedUri(fileInfo.uri);
        } else {
          const downloadResult = await FileSystem.downloadAsync(uri, cachedFile);
          setCachedUri(downloadResult.uri);
        }
      } catch (error) {
        console.error('Error caching image:', error);
        setCachedUri(uri); // Fallback to original URI
      }
    };

    getCachedImage();
  }, [uri]);

  return (
    <Image
      source={{ uri: cachedUri || uri }}
      style={style}
      defaultSource={require('@/assets/images/placeholder.png')}
    />
  );
} 