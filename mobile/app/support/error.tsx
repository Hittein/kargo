import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useRouter } from 'expo-router';

export default function ErrorState() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Ionicons name="alert-circle" size={48} color={theme.color.danger} />
        <Text variant="heading2" align="center">
          Une erreur est survenue
        </Text>
        <Text variant="bodyM" tone="secondary" align="center">
          Nos équipes ont été notifiées. Réessayez ou contactez le support.
        </Text>
        <Button label="Réessayer" variant="secondary" onPress={() => router.back()} />
        <Text variant="caption" tone="secondary">
          S-02 — Error screen
        </Text>
      </View>
    </Screen>
  );
}
