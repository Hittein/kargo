import { useRouter } from 'expo-router';
import { Alert, Pressable, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useWalletExtraStore } from '@/lib/stores/wallet-extra';
import { useAuthStore } from '@/lib/stores/auth';

const LIMITS_DAILY = [50000, 100000, 250000, 500000];
const LIMITS_PER_TX = [20000, 50000, 100000, 250000];

export default function WalletSettings() {
  const theme = useTheme();
  const router = useRouter();
  const settings = useWalletExtraStore((s) => s.settings);
  const setSettings = useWalletExtraStore((s) => s.setSettings);
  const user = useAuthStore((s) => s.user);
  const setBiometric = useAuthStore((s) => s.setBiometric);

  return (
    <Screen scroll>
      <BackHeader title="Paramètres wallet" code="W-07" />

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Sécurité
        </Text>
        <Row
          icon="finger-print"
          label="Biométrie pour valider"
          desc="Face ID / empreinte sur paiements > 5 000 MRU."
          right={
            <Switch
              value={user?.hasBiometric ?? false}
              onValueChange={(v) => setBiometric(v)}
            />
          }
        />
        <Row
          icon="key"
          label="PIN à 4 chiffres"
          desc={user?.hasPin ? 'Activé' : 'Non configuré'}
          right={
            <Button
              label="Gérer"
              size="sm"
              variant="ghost"
              onPress={() => router.push('/settings/security')}
            />
          }
        />
      </Card>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Plafonds
        </Text>
        <Row
          icon="speedometer"
          label="Plafond journalier"
          desc={`${settings.dailyLimit.toLocaleString('fr-FR')} MRU`}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
          {LIMITS_DAILY.map((v) => (
            <Pill
              key={v}
              label={`${(v / 1000).toFixed(0)}K`}
              active={settings.dailyLimit === v}
              onPress={() => setSettings({ dailyLimit: v })}
            />
          ))}
        </View>
        <Row
          icon="card"
          label="Plafond par opération"
          desc={`${settings.perTxLimit.toLocaleString('fr-FR')} MRU`}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
          {LIMITS_PER_TX.map((v) => (
            <Pill
              key={v}
              label={`${(v / 1000).toFixed(0)}K`}
              active={settings.perTxLimit === v}
              onPress={() => setSettings({ perTxLimit: v })}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Kill switch
        </Text>
        <Text variant="caption" tone="secondary" style={{ marginBottom: 12 }}>
          Bloque instantanément toutes les opérations entrantes/sortantes du wallet.
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Badge label={settings.killSwitch ? 'Wallet bloqué' : 'Wallet actif'} tone={settings.killSwitch ? 'danger' : 'success'} />
          </View>
          <Switch
            value={settings.killSwitch}
            onValueChange={(v) => {
              setSettings({ killSwitch: v });
              if (v) Alert.alert('Wallet bloqué', 'Toutes les opérations sont gelées.');
            }}
          />
        </View>
      </Card>
    </Screen>
  );
}

function Row({
  icon,
  label,
  desc,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  desc: string;
  right?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
      <Ionicons name={icon} size={20} color={theme.color.textSecondary} />
      <View style={{ flex: 1 }}>
        <Text variant="bodyM" weight="semiBold">
          {label}
        </Text>
        <Text variant="caption" tone="secondary">
          {desc}
        </Text>
      </View>
      {right}
    </View>
  );
}

function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.radius.pill,
        backgroundColor: active ? theme.color.primary : theme.color.bgElevated,
      }}
    >
      <Text variant="caption" weight="semiBold" style={{ color: active ? theme.color.textInverse : theme.color.text }}>
        {label}
      </Text>
    </Pressable>
  );
}
