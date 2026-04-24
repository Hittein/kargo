import { Linking, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Card, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';

export default function AboutScreen() {
  const router = useRouter();
  const theme = useTheme();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const rawRuntime = Constants.expoConfig?.runtimeVersion;
  const runtime = typeof rawRuntime === 'string' ? rawRuntime : '1.0.0';

  const items = [
    { icon: 'document-text' as const, label: 'Conditions générales', onPress: () => router.push('/support/legal') },
    { icon: 'shield-checkmark' as const, label: 'Politique de confidentialité', onPress: () => router.push('/support/legal') },
    { icon: 'cookie' as const, label: 'Cookies & traceurs', onPress: () => router.push('/support/legal') },
    { icon: 'business' as const, label: 'Mentions légales', onPress: () => router.push('/support/legal') },
    { icon: 'star' as const, label: 'Noter l\'app', onPress: () => Linking.openURL('https://apps.apple.com/').catch(() => {}) },
    { icon: 'logo-github' as const, label: 'Open source & licences', onPress: () => Linking.openURL('https://opensource.org/').catch(() => {}) },
  ];

  return (
    <Screen scroll>
      <BackHeader title="À propos" code="P-09" />

      <Card variant="sand">
        <View style={{ alignItems: 'center', gap: 6, paddingVertical: 8 }}>
          <Text variant="displayL" weight="bold">
            Kargo
          </Text>
          <Text variant="bodyM" tone="secondary" align="center">
            Solution de mobilité intégrée — Mauritanie
          </Text>
          <Text variant="caption" tone="secondary" style={{ marginTop: 8 }}>
            Version {version} · Runtime {runtime}
          </Text>
        </View>
      </Card>

      <View style={{ gap: 8 }}>
        {items.map((it) => (
          <Card key={it.label} padding={14} onPress={it.onPress}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons
                name={it.icon === 'cookie' ? 'fast-food' : it.icon}
                size={20}
                color={theme.color.textSecondary}
              />
              <Text variant="bodyL" style={{ flex: 1 }}>
                {it.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.color.textSecondary} />
            </View>
          </Card>
        ))}
      </View>

      <Text variant="caption" tone="secondary" align="center" style={{ marginTop: 16 }}>
        © {new Date().getFullYear()} Kargo SAS — Tous droits réservés.
      </Text>
    </Screen>
  );
}
