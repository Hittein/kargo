import { useMemo } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Chip, Text } from '@/components/ui';
import { RentalCard } from '@/components/RentalCard';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import {
  filterRentals,
  RENTAL_CATEGORY_LABEL,
  RENTALS,
  type RentalCategory,
} from '@/lib/mocks/rentals';
import { useRentalStore } from '@/lib/stores/rental';

const CATEGORIES: RentalCategory[] = [
  'economique',
  'standard',
  'premium',
  '4x4',
  'utilitaire',
];

export default function RentalResults() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { search, filters, setFilters } = useRentalStore();

  const results = useMemo(
    () =>
      filterRentals(RENTALS, {
        city: search.city,
        category: filters.category ?? search.category,
        withChauffeur: filters.withChauffeur,
        transmission: filters.transmission,
        minSeats: filters.minSeats,
        maxPricePerDay: filters.maxPricePerDay,
      }),
    [filters, search],
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
            <Ionicons name="chevron-back" size={24} color={theme.color.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text variant="caption" tone="secondary">
              {search.city ?? '—'}
            </Text>
            <Text variant="bodyL" weight="bold">
              {results.length} voiture{results.length > 1 ? 's' : ''}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/rental/filters')}
            hitSlop={8}
            style={{ padding: 6 }}
          >
            <Ionicons name="options" size={22} color={theme.color.text} />
          </Pressable>
          <Badge label="L-02" tone="primary" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingRight: 20 }}
        >
          <Chip
            label="Toutes"
            active={!filters.category}
            onPress={() => setFilters({ category: undefined })}
          />
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={RENTAL_CATEGORY_LABEL[c]}
              active={filters.category === c}
              tone="primary"
              onPress={() => setFilters({ category: filters.category === c ? undefined : c })}
            />
          ))}
          <Chip
            label="Avec chauffeur"
            active={!!filters.withChauffeur}
            onPress={() => setFilters({ withChauffeur: !filters.withChauffeur })}
          />
          <Chip
            label="Auto"
            active={filters.transmission === 'auto'}
            onPress={() =>
              setFilters({ transmission: filters.transmission === 'auto' ? undefined : 'auto' })
            }
          />
        </ScrollView>
      </View>

      <FlatList
        data={results}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 12 }}
        renderItem={({ item }) => <RentalCard rental={item} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', gap: 8, padding: 32 }}>
            <Ionicons name="car-outline" size={40} color={theme.color.textSecondary} />
            <Text variant="bodyL" weight="semiBold">
              Aucune voiture disponible
            </Text>
            <Text variant="bodyM" tone="secondary" align="center">
              Changez de ville ou élargissez vos filtres.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
