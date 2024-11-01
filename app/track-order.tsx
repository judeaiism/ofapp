import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TrackOrderScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Track Order' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">Track Your Order</ThemedText>
        <ThemedText>Coming soon...</ThemedText>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
});
