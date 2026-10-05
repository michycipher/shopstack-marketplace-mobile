import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';
import { CatalogProvider } from '@/lib/catalog';
import { ThemeProvider } from '@/lib/theme';
import { ToastProvider } from '@/lib/toast';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return <SafeAreaProvider><ThemeProvider><ToastProvider><AuthProvider><CatalogProvider><CartProvider><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /><Stack.Screen name="login" options={{ presentation: 'modal' }} /><Stack.Screen name="product/[id]" /><Stack.Screen name="store/[slug]" /><Stack.Screen name="checkout" /></Stack></CartProvider></CatalogProvider></AuthProvider></ToastProvider></ThemeProvider></SafeAreaProvider>;
}
