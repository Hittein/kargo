import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, Chip, Input, StickyCTA, Text } from '@/components/ui';
import { SellStepper } from '@/components/SellStepper';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { CURRENT_YEAR } from '@/lib/mocks/vehicles';
import { useSellStore, type AccidentHistory } from '@/lib/stores/sell';

const ACCIDENTS: { key: AccidentHistory; label: string }[] = [
  { key: 'none', label: 'Aucun' },
  { key: 'minor', label: 'Léger (réparé)' },
  { key: 'major', label: 'Important' },
];

const HAND_PRESETS = [0, 1, 2, 3, 4];

export default function SellHistory() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { draft, patch } = useSellStore();

  const fresh =
    draft.importYear === CURRENT_YEAR && draft.ownersInCountry === 0;
  const canContinue = draft.km != null && draft.ownersInCountry != null;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <Text variant="heading2" weight="bold" style={{ flex: 1 }}>
          Historique
        </Text>
        <Badge label="A-08" tone="primary" />
      </View>

      <SellStepper current={2} />

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 160 }}>
        <Input
          label="Kilométrage"
          value={draft.km?.toString() ?? ''}
          onChangeText={(v) => {
            const n = parseInt(v.replace(/\D/g, ''), 10);
            patch({ km: Number.isNaN(n) ? undefined : n });
          }}
          placeholder="ex. 85000"
          keyboardType="number-pad"
          leading={<Ionicons name="speedometer" size={18} color={theme.color.textSecondary} />}
        />

        <Input
          label="Année de dédouanement en Mauritanie"
          value={draft.importYear?.toString() ?? ''}
          onChangeText={(v) => {
            const n = parseInt(v.replace(/\D/g, ''), 10);
            patch({ importYear: Number.isNaN(n) ? undefined : n });
          }}
          placeholder={`ex. ${CURRENT_YEAR}`}
          keyboardType="number-pad"
          hint="Année où la voiture est entrée dans le pays"
          leading={<Ionicons name="flag" size={18} color={theme.color.textSecondary} />}
        />

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Nombre de mains en Mauritanie
          </Text>
          <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
            0 main = jamais revendue depuis l'import
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {HAND_PRESETS.map((n) => (
              <Chip
                key={n}
                label={n === 0 ? '0 main' : n === 1 ? '1 main' : `${n} mains`}
                active={draft.ownersInCountry === n}
                tone="primary"
                onPress={() => patch({ ownersInCountry: n })}
              />
            ))}
          </View>
        </Card>

        {fresh ? (
          <Card variant="soft">
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Ionicons name="sparkles" size={20} color={theme.color.success} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyL" weight="bold" style={{ color: theme.color.success }}>
                  Fraîchement dédouanée
                </Text>
                <Text variant="caption" tone="secondary">
                  Votre annonce aura un badge vert mis en avant.
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Accidents
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {ACCIDENTS.map((a) => (
              <Chip
                key={a.key}
                label={a.label}
                active={draft.accidents === a.key}
                tone="primary"
                onPress={() => patch({ accidents: a.key })}
              />
            ))}
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Entretien & assurance
          </Text>
          <Pressable
            onPress={() => patch({ serviced: !draft.serviced })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 }}
          >
            <Ionicons
              name={draft.serviced ? 'checkbox' : 'square-outline'}
              size={22}
              color={draft.serviced ? theme.color.primary : theme.color.textSecondary}
            />
            <Text variant="bodyM" style={{ flex: 1 }}>
              Carnet d'entretien à jour
            </Text>
          </Pressable>
          <Pressable
            onPress={() => patch({ insuranceActive: !draft.insuranceActive })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 }}
          >
            <Ionicons
              name={draft.insuranceActive ? 'checkbox' : 'square-outline'}
              size={22}
              color={draft.insuranceActive ? theme.color.primary : theme.color.textSecondary}
            />
            <Text variant="bodyM" style={{ flex: 1 }}>
              Assurance active
            </Text>
          </Pressable>
        </Card>
      </ScrollView>

      <StickyCTA>
        <Button
          label="Continuer"
          disabled={!canContinue}
          onPress={() => router.push('/marketplace/sell/price')}
        />
      </StickyCTA>
    </SafeAreaView>
  );
}
