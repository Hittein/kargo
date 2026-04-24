import { useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Card, Input, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { VEHICLES } from '@/lib/mocks/vehicles';
import { TRIPS, getCity } from '@/lib/mocks/transit';
import { RENTALS } from '@/lib/mocks/rentals';

const QUICK_CATS = [
  { key: 'used', label: 'Voitures occasion', icon: 'car' as const, href: '/marketplace/browse' },
  { key: 'new', label: 'Voitures neuves', icon: 'car-sport' as const, href: '/marketplace/browse' },
  { key: 'imp', label: 'Fraîchement dédouanées', icon: 'airplane' as const, href: '/marketplace/browse' },
  { key: 'rent', label: 'Location voiture', icon: 'key' as const, href: '/rental/search' },
  { key: 'bus', label: 'Trajet inter-ville', icon: 'bus' as const, href: '/transit' },
  { key: 'visual', label: 'Recherche visuelle', icon: 'camera' as const, href: '/marketplace/visual-search' },
];

const RECENT = ['Toyota Hilux', 'Hyundai Tucson', 'Nouakchott Atar', 'SUV diesel', 'Bus El Bourrak'];

export default function ExploreScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const fromVehicles = VEHICLES.filter(
      (v) => v.brand.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.city.toLowerCase().includes(q),
    )
      .slice(0, 4)
      .map((v) => ({ kind: 'vehicle' as const, id: v.id, label: `${v.brand} ${v.model}`, hint: `${v.city} · ${v.year}` }));
    const fromRentals = RENTALS.filter(
      (r) => r.brand.toLowerCase().includes(q) || r.cities.some((c) => c.toLowerCase().includes(q)),
    )
      .slice(0, 3)
      .map((r) => ({ kind: 'rental' as const, id: r.id, label: `Location ${r.brand} ${r.model}`, hint: r.cities[0] ?? '' }));
    const fromTrips = TRIPS.filter((t) => {
      const f = getCity(t.fromCityId)?.name.toLowerCase() ?? '';
      const tt = getCity(t.toCityId)?.name.toLowerCase() ?? '';
      return f.includes(q) || tt.includes(q);
    })
      .slice(0, 3)
      .map((t) => ({
        kind: 'trip' as const,
        id: t.id,
        label: `${getCity(t.fromCityId)?.name} → ${getCity(t.toCityId)?.name}`,
        hint: `${(t.price / 1).toLocaleString('fr-FR')} MRU`,
      }));
    return [...fromVehicles, ...fromRentals, ...fromTrips];
  }, [query]);

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="heading1">Explorer</Text>
        <Badge label="C-07" tone="neutral" />
      </View>

      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Marque, modèle, ville, trajet…"
        leading={<Ionicons name="search" size={18} color={theme.color.textSecondary} />}
        trailing={
          <Pressable onPress={() => Alert.alert('Recherche vocale (simulation)')}>
            <Ionicons name="mic" size={18} color={theme.color.textSecondary} />
          </Pressable>
        }
      />

      {query.trim() === '' && (
        <>
          <Text variant="bodyL" weight="semiBold">
            Catégories
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {QUICK_CATS.map((c) => (
              <Card
                key={c.key}
                padding={14}
                style={{ width: '48%' }}
                onPress={() => router.push(c.href as never)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name={c.icon} size={20} color={theme.color.primary} />
                  <Text variant="bodyM" weight="semiBold" style={{ flex: 1 }}>
                    {c.label}
                  </Text>
                </View>
              </Card>
            ))}
          </View>

          <Text variant="bodyL" weight="semiBold">
            Recherches récentes
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {RECENT.map((r) => (
              <Pressable
                key={r}
                onPress={() => setQuery(r)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.color.bgElevated,
                }}
              >
                <Text variant="caption">{r}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {query.trim() !== '' && (
        <>
          <Text variant="bodyL" weight="semiBold">
            Suggestions
          </Text>
          {suggestions.length === 0 ? (
            <Card variant="sand">
              <Text variant="bodyM" tone="secondary" align="center">
                Aucun résultat. Essayez un autre terme.
              </Text>
            </Card>
          ) : (
            <View style={{ gap: 8 }}>
              {suggestions.map((s) => (
                <Card
                  key={`${s.kind}-${s.id}`}
                  padding={14}
                  onPress={() =>
                    router.push(
                      s.kind === 'vehicle'
                        ? (`/marketplace/${s.id}` as never)
                        : s.kind === 'rental'
                          ? (`/rental/${s.id}` as never)
                          : (`/transit/${s.id}` as never),
                    )
                  }
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons
                      name={s.kind === 'vehicle' ? 'car' : s.kind === 'rental' ? 'key' : 'bus'}
                      size={18}
                      color={theme.color.textSecondary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyM" weight="semiBold">
                        {s.label}
                      </Text>
                      <Text variant="caption" tone="secondary">
                        {s.hint}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.color.textSecondary} />
                  </View>
                </Card>
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}
