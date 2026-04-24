import { useEffect, useMemo } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Badge, Button, Card, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { VEHICLES, type Vehicle } from '@/lib/mocks/vehicles';
import { formatKm, formatMRU } from '@/lib/format';
import { useVehicles } from '@/lib/hooks/useListings';
import { useCompareStore } from '@/lib/stores/compare';

const VERDICT_LABEL: Record<string, { label: string; tone: 'success' | 'gold' | 'danger' | 'primary' }> = {
  deal: { label: 'Bonne affaire', tone: 'success' },
  fair: { label: 'Prix correct', tone: 'primary' },
  high: { label: 'Au-dessus du marché', tone: 'gold' },
  risk: { label: 'Risque', tone: 'danger' },
};

export default function CompareScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { ids: idsParam } = useLocalSearchParams<{ ids?: string }>();
  const storeIds = useCompareStore((s) => s.ids);
  const removeFromStore = useCompareStore((s) => s.remove);
  const maxCompare = useCompareStore((s) => s.max);
  const { data: allVehicles = VEHICLES } = useVehicles();

  // Sync URL → store si on arrive via deep link avec ?ids=
  useEffect(() => {
    if (!idsParam) return;
    const fromUrl = idsParam.split(',').filter(Boolean);
    const current = useCompareStore.getState().ids;
    if (fromUrl.length && current.length === 0) {
      useCompareStore.setState({ ids: fromUrl.slice(0, maxCompare) });
    }
  }, [idsParam, maxCompare]);

  const ids = storeIds.length > 0 ? storeIds : idsParam ? idsParam.split(',') : [];

  const vehicles = useMemo(
    () => ids.map((id) => allVehicles.find((v) => v.id === id)).filter(Boolean) as Vehicle[],
    [ids, allVehicles],
  );

  const removeAt = (id: string) => removeFromStore(id);
  const canAddMore = ids.length < maxCompare;

  const winners = useMemo(() => {
    if (vehicles.length === 0) return {};
    const lowestPrice = vehicles.reduce((a, b) => (a.price < b.price ? a : b)).id;
    const lowestKm = vehicles.reduce((a, b) => (a.km < b.km ? a : b)).id;
    const newest = vehicles.reduce((a, b) => (a.year > b.year ? a : b)).id;
    return { lowestPrice, lowestKm, newest };
  }, [vehicles]);

  if (vehicles.length === 0) {
    return (
      <Screen scroll>
        <BackHeader title="Comparer" code="A-05" />
        <View style={{ alignItems: 'center', gap: 12, padding: 32 }}>
          <Ionicons name="git-compare" size={48} color={theme.color.textSecondary} />
          <Text variant="heading2" weight="bold" align="center">
            Aucune voiture à comparer
          </Text>
          <Text variant="bodyM" tone="secondary" align="center">
            Depuis la recherche, tapez l'icône ⇄ sur chaque annonce pour en ajouter au comparateur (2 à 3).
          </Text>
          <Button
            label="Retour à la recherche"
            onPress={() => router.push('/marketplace/search')}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <BackHeader title="Comparer" code="A-05" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
        {vehicles.map((v) => (
          <CompareCard
            key={v.id}
            vehicle={v}
            highlights={{
              price: v.id === winners.lowestPrice,
              km: v.id === winners.lowestKm,
              year: v.id === winners.newest,
            }}
            onRemove={() => removeAt(v.id)}
          />
        ))}
        {canAddMore ? (
          <Pressable
            onPress={() => router.push('/marketplace/search')}
            style={{
              width: 200,
              height: 320,
              borderRadius: theme.radius.xl,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: theme.color.border,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: 12,
            }}
          >
            <Ionicons name="add-circle" size={36} color={theme.color.textSecondary} />
            <Text variant="bodyM" tone="secondary" align="center">
              Choisir dans la liste
            </Text>
            <Text variant="caption" tone="secondary" align="center">
              {maxCompare - ids.length} emplacement
              {maxCompare - ids.length > 1 ? 's' : ''} restant
              {maxCompare - ids.length > 1 ? 's' : ''}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <Text variant="heading2">Comparaison détaillée</Text>
      <Card>
        {ROWS.map((row) => (
          <View
            key={row.key}
            style={{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderBottomColor: theme.color.divider,
              paddingVertical: 10,
            }}
          >
            <View style={{ width: 130 }}>
              <Text variant="bodyM" tone="secondary">
                {row.label}
              </Text>
            </View>
            {vehicles.map((v) => {
              const { value, win } = row.get(v, winners);
              return (
                <View key={v.id} style={{ flex: 1, paddingHorizontal: 4 }}>
                  <Text variant="bodyM" weight={win ? 'bold' : 'regular'} style={{ color: win ? theme.color.success : theme.color.text }}>
                    {value}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </Card>

      <Text variant="heading2">Verdict IA</Text>
      <View style={{ gap: 8 }}>
        {vehicles.map((v) => (
          <Card key={v.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="bodyM" weight="semiBold" style={{ flex: 1 }}>
                {v.brand} {v.model}
              </Text>
              <Badge label={VERDICT_LABEL[v.aiVerdict].label} tone={VERDICT_LABEL[v.aiVerdict].tone} />
            </View>
            {v.aiEstimate ? (
              <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>
                Estimation marché : {formatMRU(v.aiEstimate.low)} – {formatMRU(v.aiEstimate.high)} MRU
              </Text>
            ) : null}
          </Card>
        ))}
      </View>

      <Button label="Ouvrir une discussion sur la meilleure option" />
    </Screen>
  );
}

const ROWS: { key: string; label: string; get: (v: Vehicle, w: { lowestPrice?: string; lowestKm?: string; newest?: string }) => { value: string; win: boolean } }[] = [
  { key: 'price', label: 'Prix', get: (v, w) => ({ value: `${formatMRU(v.price)} MRU`, win: v.id === w.lowestPrice }) },
  { key: 'year', label: 'Année', get: (v, w) => ({ value: String(v.year), win: v.id === w.newest }) },
  { key: 'km', label: 'Kilométrage', get: (v, w) => ({ value: formatKm(v.km), win: v.id === w.lowestKm }) },
  { key: 'fuel', label: 'Carburant', get: (v) => ({ value: v.fuel, win: false }) },
  { key: 'trans', label: 'Transmission', get: (v) => ({ value: v.transmission === 'auto' ? 'Auto' : 'Manuelle', win: false }) },
  { key: 'city', label: 'Ville', get: (v) => ({ value: v.city, win: false }) },
  { key: 'owners', label: 'Mains pays', get: (v) => ({ value: String(v.ownersInCountry), win: false }) },
  { key: 'verified', label: 'Vérifié', get: (v) => ({ value: v.kargoVerified ? 'Oui' : v.vinVerified ? 'VIN' : 'Non', win: v.kargoVerified }) },
];

function CompareCard({ vehicle, highlights, onRemove }: { vehicle: Vehicle; highlights: { price: boolean; km: boolean; year: boolean }; onRemove: () => void }) {
  const theme = useTheme();
  return (
    <Card padding={12} style={{ width: 220 }}>
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: vehicle.photoUrls[0] }} style={{ width: '100%', height: 120, borderRadius: 12 }} />
        <Pressable
          onPress={onRemove}
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="close" size={16} color="#fff" />
        </Pressable>
      </View>
      <Text variant="bodyM" weight="semiBold" style={{ marginTop: 8 }}>
        {vehicle.brand} {vehicle.model}
      </Text>
      <Text variant="caption" tone="secondary">
        {vehicle.year} · {vehicle.city}
      </Text>
      <View style={{ marginTop: 8, gap: 4 }}>
        <Text variant="bodyL" weight="bold" style={{ color: highlights.price ? theme.color.success : theme.color.text }}>
          {formatMRU(vehicle.price)} MRU
        </Text>
        <Text variant="caption" tone="secondary">
          {formatKm(vehicle.km)}
        </Text>
      </View>
    </Card>
  );
}
