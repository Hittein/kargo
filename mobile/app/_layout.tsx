import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';

import { ThemeProvider } from '@/theme/ThemeProvider';
import { I18nGate } from '@/i18n/I18nProvider';
import '@/i18n';
import { useKargoFonts } from '@/hooks/use-fonts';
import { useAuthStore } from '@/lib/stores/auth';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const user = useAuthStore((s) => s.user);
  const hasOnboarded = useAuthStore((s) => s.hasOnboarded);

  useEffect(() => {
    const inAuth = segments[0] === '(auth)';
    const inSupport = segments[0] === 'support';
    if (!user && !inAuth && !inSupport) {
      router.replace(hasOnboarded ? '/(auth)/sign-in' : '/(auth)/welcome');
    } else if (user && user.name && inAuth) {
      router.replace('/(tabs)');
    }
  }, [user, hasOnboarded, segments, router]);

  return null;
}

export default function RootLayout() {
  const { loaded, error } = useKargoFonts();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <I18nGate>
              <AuthGate />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="marketplace" />
                <Stack.Screen name="rental" />
                <Stack.Screen name="transit" />
                <Stack.Screen name="wallet" />
                <Stack.Screen name="trust" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="support" />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              </Stack>
            </I18nGate>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
