import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Typography } from '@/components/ui/typography';

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerTitle: "Store Details",
          headerShadowVisible: false,
        }} 
      />
      <ThemedView style={styles.container}>
        <Typography variant="h1">Store {id}</Typography>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
