import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useRouter } from 'expo-router';

export default function EmptyState() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Ionicons name="cloud-offline" size={48} color={theme.color.textSecondary} />
        <Text variant="heading2" align="center">
          Aucun résultat
        </Text>
        <Text variant="bodyM" tone="secondary" align="center">
          Vérifiez votre connexion ou ajustez vos filtres.
        </Text>
        <Button label="Réessayer" variant="secondary" onPress={() => router.back()} />
        <Text variant="caption" tone="secondary">
          S-01 — Empty state global
        </Text>
      </View>
    </Screen>
  );
}
