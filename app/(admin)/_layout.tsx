import { Stack, router } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="stores/add" 
        options={{
          headerTitle: "Add New Store",
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()}
              style={{ marginLeft: 16 }}
            >
              <Feather name="arrow-left" size={24} color="#374151" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable 
              onPress={() => router.push('/')}
              style={{ marginRight: 16 }}
            >
              <Feather name="home" size={24} color="#374151" />
            </Pressable>
          ),
        }} 
      />
    </Stack>
  );
}
