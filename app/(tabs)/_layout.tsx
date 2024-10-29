import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerLargeStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerLargeTitle: true,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="Home" 
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="stores" 
        options={{
          headerShown: true
        }}
      />
    </Stack>
  );
}
