import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, Chip, Input, StickyCTA, Text } from '@/components/ui';
import { SellStepper } from '@/components/SellStepper';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import type { FuelType, Transmission } from '@/lib/mocks/vehicles';
import { useSellStore } from '@/lib/stores/sell';

const BRANDS = [
  'Toyota',
  'Hyundai',
  'Nissan',
  'Renault',
  'Peugeot',
  'Mercedes-Benz',
  'Kia',
  'Ford',
  'Volkswagen',
  'BMW',
];

const FUELS: { key: FuelType; label: string }[] = [
  { key: 'petrol', label: 'Essence' },
  { key: 'diesel', label: 'Diesel' },
  { key: 'hybrid', label: 'Hybride' },
  { key: 'electric', label: 'Électrique' },
];

export default function SellSpecs() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { draft, patch } = useSellStore();

  const canContinue = !!(draft.brand && draft.model && draft.year && draft.fuel && draft.transmission);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <Text variant="heading2" weight="bold" style={{ flex: 1 }}>
          Véhicule
        </Text>
        <Badge label="A-07" tone="primary" />
      </View>

      <SellStepper current={1} />

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 160 }}>
        {draft.vinDecoded ? (
          <Card variant="soft">
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Ionicons name="checkmark-circle" size={20} color={theme.color.success} />
              <Text variant="bodyM" style={{ flex: 1 }}>
                VIN décodé — vérifiez les informations pré-remplies.
              </Text>
            </View>
          </Card>
        ) : null}

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Marque
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {BRANDS.map((b) => (
              <Chip
                key={b}
                label={b}
                active={draft.brand === b}
                tone="primary"
                onPress={() => patch({ brand: b })}
              />
            ))}
          </View>
        </Card>

        <Input
          label="Modèle"
          value={draft.model ?? ''}
          onChangeText={(v) => patch({ model: v })}
          placeholder="ex. Hilux"
          leading={<Ionicons name="car-sport" size={18} color={theme.color.textSecondary} />}
        />

        <Input
          label="Année modèle"
          value={draft.year?.toString() ?? ''}
          onChangeText={(v) => {
            const n = parseInt(v.replace(/\D/g, ''), 10);
            patch({ year: Number.isNaN(n) ? undefined : n });
          }}
          placeholder="ex. 2021"
          keyboardType="number-pad"
          leading={<Ionicons name="calendar" size={18} color={theme.color.textSecondary} />}
        />

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Carburant
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {FUELS.map((f) => (
              <Chip
                key={f.key}
                label={f.label}
                active={draft.fuel === f.key}
                tone="primary"
                onPress={() => patch({ fuel: f.key })}
              />
            ))}
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Transmission
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            {(['auto', 'manual'] as Transmission[]).map((t) => (
              <Chip
                key={t}
                label={t === 'auto' ? 'Automatique' : 'Manuelle'}
                active={draft.transmission === t}
                tone="primary"
                onPress={() => patch({ transmission: t })}
              />
            ))}
          </View>
        </Card>
      </ScrollView>

      <StickyCTA>
        <Button
          label="Continuer"
          disabled={!canContinue}
          onPress={() => router.push('/marketplace/sell/history')}
          leading={<Ionicons name="arrow-forward" size={16} color={theme.color.textInverse} />}
        />
      </StickyCTA>
    </SafeAreaView>
  );
}
