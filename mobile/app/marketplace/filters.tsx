import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, Chip, Input, Screen, StickyCTA, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import {
  type AIVerdict,
  filterVehicles,
  type FuelType,
  type Transmission,
  type VehicleFilters,
  VEHICLES,
} from '@/lib/mocks/vehicles';
import { useMarketplaceStore } from '@/lib/stores/marketplace';

const CITIES = ['Nouakchott', 'Nouadhibou', 'Kiffa', 'Atar', 'Zouérate', 'Rosso'];
const FUELS: { key: FuelType; label: string }[] = [
  { key: 'petrol', label: 'Essence' },
  { key: 'diesel', label: 'Diesel' },
  { key: 'hybrid', label: 'Hybride' },
  { key: 'electric', label: 'Électrique' },
];
const TRANSMISSIONS: { key: Transmission; label: string }[] = [
  { key: 'auto', label: 'Auto' },
  { key: 'manual', label: 'Manuelle' },
];
const AI_VERDICTS: { key: AIVerdict; label: string }[] = [
  { key: 'deal', label: '💚 Bonne affaire' },
  { key: 'fair', label: 'Prix juste' },
  { key: 'high', label: 'Prix élevé' },
  { key: 'risk', label: '⚠️ À risque' },
];

function toggleInArray<T>(arr: T[] | undefined, value: T): T[] {
  const list = arr ?? [];
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function MarketplaceFilters() {
  const theme = useTheme();
  const router = useRouter();
  const { filters: committed, setFilters, query } = useMarketplaceStore();
  const [draft, setDraft] = useState<VehicleFilters>(committed);

  const preview = useMemo(
    () => filterVehicles(VEHICLES, { ...draft, query }).length,
    [draft, query],
  );

  const patch = (partial: Partial<VehicleFilters>) => setDraft((d) => ({ ...d, ...partial }));

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll contentStyle={{ paddingBottom: 140 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons
            name="close"
            size={24}
            color={theme.color.text}
            onPress={() => router.back()}
          />
          <Text variant="heading1" style={{ flex: 1 }}>
            Filtres
          </Text>
          <Badge label="A-02" tone="neutral" />
        </View>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Prix (MRU)
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <Input
              containerStyle={{ flex: 1 }}
              placeholder="Min"
              keyboardType="numeric"
              value={draft.minPrice?.toString() ?? ''}
              onChangeText={(v) => patch({ minPrice: v ? Number(v) : undefined })}
            />
            <Input
              containerStyle={{ flex: 1 }}
              placeholder="Max"
              keyboardType="numeric"
              value={draft.maxPrice?.toString() ?? ''}
              onChangeText={(v) => patch({ maxPrice: v ? Number(v) : undefined })}
            />
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Année
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <Input
              containerStyle={{ flex: 1 }}
              placeholder="De"
              keyboardType="numeric"
              maxLength={4}
              value={draft.minYear?.toString() ?? ''}
              onChangeText={(v) => patch({ minYear: v ? Number(v) : undefined })}
            />
            <Input
              containerStyle={{ flex: 1 }}
              placeholder="À"
              keyboardType="numeric"
              maxLength={4}
              value={draft.maxYear?.toString() ?? ''}
              onChangeText={(v) => patch({ maxYear: v ? Number(v) : undefined })}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingTop: 10 }}
          >
            {[2015, 2018, 2020, 2022, 2024].map((year) => (
              <Chip
                key={year}
                label={`${year}+`}
                active={draft.minYear === year && draft.maxYear == null}
                onPress={() =>
                  patch({
                    minYear: draft.minYear === year ? undefined : year,
                    maxYear: undefined,
                  })
                }
              />
            ))}
          </ScrollView>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Kilométrage
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <Input
              containerStyle={{ flex: 1 }}
              placeholder="Min (km)"
              keyboardType="numeric"
              value={draft.minKm?.toString() ?? ''}
              onChangeText={(v) => patch({ minKm: v ? Number(v) : undefined })}
            />
            <Input
              containerStyle={{ flex: 1 }}
              placeholder="Max (km)"
              keyboardType="numeric"
              value={draft.maxKm?.toString() ?? ''}
              onChangeText={(v) => patch({ maxKm: v ? Number(v) : undefined })}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingTop: 10 }}
          >
            {[30_000, 60_000, 100_000, 150_000].map((km) => (
              <Chip
                key={km}
                label={`< ${km / 1000}K km`}
                active={draft.maxKm === km && draft.minKm == null}
                onPress={() =>
                  patch({
                    maxKm: draft.maxKm === km ? undefined : km,
                    minKm: undefined,
                  })
                }
              />
            ))}
          </ScrollView>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Carburant
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', paddingTop: 10 }}>
            {FUELS.map((f) => (
              <Chip
                key={f.key}
                label={f.label}
                active={draft.fuel?.includes(f.key)}
                onPress={() => patch({ fuel: toggleInArray(draft.fuel, f.key) })}
              />
            ))}
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Transmission
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, paddingTop: 10 }}>
            {TRANSMISSIONS.map((tr) => (
              <Chip
                key={tr.key}
                label={tr.label}
                active={draft.transmission?.includes(tr.key)}
                onPress={() => patch({ transmission: toggleInArray(draft.transmission, tr.key) })}
              />
            ))}
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Ville
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', paddingTop: 10 }}>
            {CITIES.map((c) => (
              <Chip
                key={c}
                label={c}
                active={draft.city?.includes(c)}
                onPress={() => patch({ city: toggleInArray(draft.city, c) })}
              />
            ))}
          </View>
        </Card>

        <Card variant="sand">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="sparkles" size={14} color={theme.color.primary} />
            <Text variant="caption" tone="secondary">
              Verdict IA
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', paddingTop: 10 }}>
            {AI_VERDICTS.map((v) => (
              <Chip
                key={v.key}
                label={v.label}
                active={draft.aiVerdict?.includes(v.key)}
                tone={draft.aiVerdict?.includes(v.key) ? 'primary' : undefined}
                onPress={() => patch({ aiVerdict: toggleInArray(draft.aiVerdict, v.key) })}
              />
            ))}
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Vérification
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, paddingTop: 10, flexWrap: 'wrap' }}>
            <Chip
              label="Vendeur vérifié"
              active={draft.verifiedOnly}
              onPress={() => patch({ verifiedOnly: !draft.verifiedOnly })}
            />
            <Chip
              label="Kargo Verified"
              active={draft.kargoVerifiedOnly}
              onPress={() => patch({ kargoVerifiedOnly: !draft.kargoVerifiedOnly })}
              tone="primary"
            />
          </View>
        </Card>
      </Screen>

      <StickyCTA>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Button
            label="Réinitialiser"
            variant="ghost"
            onPress={() => setDraft({})}
            style={{ flex: 1 }}
          />
          <Button
            label={`Voir ${preview} résultat${preview > 1 ? 's' : ''}`}
            style={{ flex: 2 }}
            onPress={() => {
              setFilters(draft);
              router.back();
            }}
          />
        </View>
      </StickyCTA>
    </View>
  );
}
