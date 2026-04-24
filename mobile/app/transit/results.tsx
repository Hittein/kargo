import { useMemo } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Chip, Text } from '@/components/ui';
import { TripCard } from '@/components/TripCard';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { formatDateLong } from '@/lib/time';
import {
  BUS_SIZE_LABEL,
  distanceBetween,
  getCity,
  rankTrips,
  searchTrips,
  type BusSize,
  type TripSort,
} from '@/lib/mocks/transit';
import { countTripFilters, useTransitStore } from '@/lib/stores/transit';

const SORTS: { key: TripSort; label: string }[] = [
  { key: 'early', label: 'Tôt' },
  { key: 'price-asc', label: 'Prix ↑' },
  { key: 'duration-asc', label: 'Durée ↓' },
  { key: 'rating-desc', label: 'Note' },
];

export default function TransitResults() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { fromCityId, toCityId, date, filters, sort, patchFilters, setSort } = useTransitStore();

  const from = fromCityId ? getCity(fromCityId) : undefined;
  const to = toCityId ? getCity(toCityId) : undefined;
  const distanceKm = distanceBetween(fromCityId, toCityId);

  const trips = useMemo(
    () => searchTrips({ fromCityId, toCityId, date }, filters, sort),
    [fromCityId, toCityId, date, filters, sort],
  );

  const ranksById = useMemo(() => rankTrips(trips), [trips]);

  const activeFilterCount = countTripFilters(filters);

  const busSizes: BusSize[] = ['small', 'medium', 'big'];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={theme.color.text}
            onPress={() => router.back()}
          />
          <View style={{ flex: 1 }}>
            <Text variant="bodyL" weight="semiBold" numberOfLines={1}>
              {from?.name ?? '—'} → {to?.name ?? '—'}
            </Text>
            <Text variant="caption" tone="secondary" numberOfLines={1}>
              {formatDateLong(date)}
              {distanceKm ? ` · ${distanceKm} km` : ''}
            </Text>
          </View>
          <Badge label="T-05" tone="neutral" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 20 }}
        >
          <Chip
            label={activeFilterCount > 0 ? `Filtres · ${activeFilterCount}` : 'Filtres'}
            leading={
              <Ionicons
                name="options"
                size={14}
                color={activeFilterCount > 0 ? theme.color.textInverse : theme.color.text}
              />
            }
            active={activeFilterCount > 0}
            tone="primary"
            onPress={() => router.push('/transit/filters')}
          />
          <Chip
            label="Direct"
            active={filters.directOnly}
            onPress={() => patchFilters({ directOnly: !filters.directOnly })}
          />
          <Chip
            label="Matin"
            active={filters.maxDepartHour === 12}
            onPress={() =>
              patchFilters({
                minDepartHour: filters.maxDepartHour === 12 ? undefined : 0,
                maxDepartHour: filters.maxDepartHour === 12 ? undefined : 12,
              })
            }
          />
          <Chip
            label="Après-midi"
            active={filters.minDepartHour === 12 && filters.maxDepartHour === 18}
            onPress={() =>
              patchFilters({
                minDepartHour: filters.minDepartHour === 12 ? undefined : 12,
                maxDepartHour: filters.minDepartHour === 12 ? undefined : 18,
              })
            }
          />
          <Chip
            label="< 2000 MRU"
            active={filters.maxPrice === 2000}
            onPress={() => patchFilters({ maxPrice: filters.maxPrice === 2000 ? undefined : 2000 })}
          />
          {busSizes.map((b) => (
            <Chip
              key={b}
              label={BUS_SIZE_LABEL[b]}
              active={filters.busSize === b}
              tone="primary"
              onPress={() => patchFilters({ busSize: filters.busSize === b ? undefined : b })}
            />
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="caption" tone="secondary">
            {trips.length} trajet{trips.length > 1 ? 's' : ''}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6 }}
          >
            {SORTS.map((s) => (
              <Chip key={s.key} label={s.label} active={sort === s.key} onPress={() => setSort(s.key)} />
            ))}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={trips}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 20, paddingTop: 12, gap: 12 }}
        renderItem={({ item }) => <TripCard trip={item} ranks={ranksById[item.id]} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', gap: 8, padding: 32 }}>
            <Ionicons name="bus" size={40} color={theme.color.textSecondary} />
            <Text variant="bodyL" weight="semiBold">
              Aucun trajet disponible
            </Text>
            <Text variant="bodyM" tone="secondary" align="center">
              Essayez une autre date ou relâchez les filtres.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
