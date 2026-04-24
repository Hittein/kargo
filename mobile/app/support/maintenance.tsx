import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export default function MaintenanceScreen() {
  const theme = useTheme();
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Ionicons name="construct" size={48} color={theme.color.accent} />
        <Text variant="heading1" align="center">
          Maintenance en cours
        </Text>
        <Text variant="bodyM" tone="secondary" align="center">
          Kargo revient très vite. Nous améliorons l'expérience pour vous.
        </Text>
        <Text variant="caption" tone="secondary">
          S-04 — Maintenance
        </Text>
      </View>
    </Screen>
  );
}
