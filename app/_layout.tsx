import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { CartProvider } from './contexts/CartContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <CartProvider>
      <PaperProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              headerShown: true,
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
              headerTitleStyle: {
                color: '#000',
                fontSize: 24,
              },
              headerShadowVisible: false,
              headerTitleAlign: 'center',
              contentStyle: {
                paddingTop: 56,
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="store/[id]" />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="track-order" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="checkout/success" />
            <Stack.Screen name="orders/[id]" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </PaperProvider>
    </CartProvider>
  );
}
