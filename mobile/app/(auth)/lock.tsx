import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/lib/stores/auth';
import { authenticate, isBiometryAvailable } from '@/lib/biometry';

export default function LockScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isBiometryAvailable().then(setAvailable);
  }, []);

  const tryUnlock = async () => {
    setError(null);
    setBusy(true);
    const ok = await authenticate('Déverrouiller Kargo');
    setBusy(false);
    if (ok) router.replace('/(tabs)');
    else setError('Authentification annulée. Réessayez ou utilisez votre numéro.');
  };

  // Lance la prompt automatiquement à l'ouverture si dispo.
  useEffect(() => {
    if (available && !busy) tryUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available]);

  const switchAccount = () => {
    signOut();
    router.replace('/(auth)/sign-in');
  };

  const initial = (user?.name || user?.phone || 'K').slice(0, 1).toUpperCase();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 32 }}>
        <View />
        <View style={{ alignItems: 'center', gap: 16 }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: theme.color.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="displayL" weight="bold" style={{ color: theme.color.textInverse }}>
              {initial}
            </Text>
          </View>
          <Text variant="heading1" align="center">
            Bonjour, {user?.name?.split(' ')[0] || ''}
          </Text>
          <Text variant="bodyM" tone="secondary" align="center">
            {user?.phone}
          </Text>

          {available ? (
            <Pressable
              onPress={tryUnlock}
              disabled={busy}
              style={{
                marginTop: 24,
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: theme.color.bgElevated,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: busy ? 0.6 : 1,
              }}
            >
              <Ionicons name="finger-print" size={44} color={theme.color.primary} />
            </Pressable>
          ) : (
            <Text variant="caption" tone="secondary" align="center" style={{ marginTop: 16 }}>
              Biométrie indisponible sur cet appareil.
            </Text>
          )}

          {error ? (
            <Text variant="caption" tone="danger" align="center">
              {error}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: 10 }}>
          {available ? (
            <Button label="Déverrouiller avec Face ID" fullWidth onPress={tryUnlock} disabled={busy} />
          ) : null}
          <Button label="Se connecter avec un autre compte" variant="ghost" fullWidth onPress={switchAccount} />
        </View>
      </View>
    </Screen>
  );
}
