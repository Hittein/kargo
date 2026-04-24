import { useEffect, useRef, useState } from 'react';
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
import { useAuthStore, type AuthUser } from '@/lib/stores/auth';
import { isBiometryOptedIn } from '@/lib/biometry';
import { CallOverlay } from '@/components/CallOverlay';
import { authApi } from '@/lib/api';
import type { ApiUser } from '@/lib/api/types';

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

function fromApiUser(u: ApiUser): AuthUser {
  return {
    id: u.id,
    phone: u.phone,
    name: u.name,
    email: u.email,
    city: u.city,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
    emailVerified: u.emailVerified,
    phoneVerified: u.phoneVerified,
    kycLevel: u.kycLevel,
    hasPin: u.hasPin,
    hasBiometric: u.hasBiometric,
  };
}

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const user = useAuthStore((s) => s.user);
  const hasOnboarded = useAuthStore((s) => s.hasOnboarded);
  const lockedRef = useRef<boolean>(false);
  const syncedRef = useRef<boolean>(false);
  const [coldStart, setColdStart] = useState<boolean>(true);

  // Cold-start reconciliation: si on a un token mais backend / local divergent,
  // on aligne dans un sens ou l'autre. Corrige notamment le cas où completeProfile
  // a écrit local mais le précédent updateMe n'avait pas atteint le backend.
  useEffect(() => {
    if (syncedRef.current) return;
    const state = useAuthStore.getState();
    if (!state.user || !state.token) return;
    syncedRef.current = true;
    const localName = state.user.name;
    (async () => {
      try {
        const me = await authApi.getMe();
        if (me.name && me.name !== localName) {
          // Backend connaît un nom différent (ou à jour) → source of truth serveur.
          useAuthStore.getState().updateProfile({
            name: me.name,
            email: me.email,
            city: me.city,
            avatarUrl: me.avatarUrl,
          });
        } else if (!me.name && localName) {
          // Local a un nom, serveur non. Push pour que le prochain login propre.
          const localEmail = state.user?.email;
          const localCity = state.user?.city;
          try {
            const updated = await authApi.updateMe({
              name: localName,
              email: localEmail,
              city: localCity,
            });
            const currentToken = useAuthStore.getState().token;
            if (currentToken) {
              useAuthStore.getState().setSession(fromApiUser(updated), currentToken);
            }
          } catch {
            /* on réessaiera au prochain cold-start */
          }
        }
      } catch {
        /* offline : pas de sync, pas de régression */
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    const inAuth = segments[0] === '(auth)';
    const inSupport = segments[0] === 'support';
    const onLock = segments[0] === '(auth)' && segments[1] === 'lock';

    // 1) Pas connecté → écran de connexion (sauf si on est déjà dans (auth) ou support).
    if (!user && !inAuth && !inSupport) {
      router.replace(hasOnboarded ? '/(auth)/sign-in' : '/(auth)/welcome');
      return;
    }

    // 2) Connecté + cold start + biométrie activée → lock screen.
    if (user && user.name && coldStart && isBiometryOptedIn() && !onLock && !lockedRef.current) {
      lockedRef.current = true;
      setColdStart(false);
      router.replace('/(auth)/lock');
      return;
    }

    // 3) Connecté avec profil rempli, pas de lock requis → tabs.
    if (user && user.name && inAuth && !onLock) {
      router.replace('/(tabs)');
      return;
    }

    // 4) Premier passage sans biométrie : marquer la fin du cold start.
    if (user && user.name && coldStart && !isBiometryOptedIn()) {
      setColdStart(false);
    }
  }, [user, hasOnboarded, segments, router, coldStart]);

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
                <Stack.Screen name="call" options={{ presentation: 'fullScreenModal' }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              </Stack>
              <CallOverlay />
            </I18nGate>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
