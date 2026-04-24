import { View, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export default function ForceUpdateScreen() {
  const theme = useTheme();
  const openStore = () => {
    const url = Platform.select({
      ios: 'itms-apps://itunes.apple.com/app/id000000000',
      android: 'market://details?id=com.kargo.client',
      default: 'https://kargo.mr',
    });
    if (url) Linking.openURL(url).catch(() => {});
  };
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Ionicons name="cloud-download" size={48} color={theme.color.primary} />
        <Text variant="heading1" align="center">
          Mise à jour requise
        </Text>
        <Text variant="bodyM" tone="secondary" align="center">
          Une nouvelle version de Kargo est nécessaire pour continuer à utiliser l'application.
        </Text>
        <Button label="Mettre à jour" onPress={openStore} />
        <Text variant="caption" tone="secondary">
          S-03 — Force update
        </Text>
      </View>
    </Screen>
  );
}
