import { useMemo } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Chip, Input, Text } from '@/components/ui';
import { VehicleCard } from '@/components/VehicleCard';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { CATEGORY_LABELS, filterVehicles, type SortKey, VEHICLES } from '@/lib/mocks/vehicles';
import { countActiveFilters, useMarketplaceStore } from '@/lib/stores/marketplace';
import { useSavedSearchStore } from '@/lib/stores/saved-searches';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Récents' },
  { key: 'price-asc', label: 'Prix ↑' },
  { key: 'price-desc', label: 'Prix ↓' },
  { key: 'km-asc', label: 'Km ↑' },
];

export default function MarketplaceSearch() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { query, filters, sort, setQuery, patchFilters, setSort } = useMarketplaceStore();
  const addSearch = useSavedSearchStore((s) => s.add);

  const results = useMemo(
    () => filterVehicles(VEHICLES, { ...filters, query }, sort),
    [filters, query, sort],
  );

  const activeFilterCount = countActiveFilters(filters);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            variant="bodyL"
            weight="semiBold"
            onPress={() => router.back()}
            style={{ color: theme.color.primary, padding: 4 }}
          >
            {t('common.back')}
          </Text>
          <Text variant="heading2" style={{ flex: 1, textAlign: 'center' }}>
            {t('marketplace.title')}
          </Text>
          <Pressable
            onPress={() => {
              const parts: string[] = [];
              if (filters.category) parts.push(CATEGORY_LABELS[filters.category]);
              if (filters.brand) parts.push(filters.brand);
              if (filters.model) parts.push(filters.model);
              if (query) parts.push(`« ${query} »`);
              if (parts.length === 0) parts.push('Tous véhicules');
              addSearch({
                name: parts.join(' · '),
                category: filters.category,
                brand: filters.brand,
                model: filters.model,
                maxPrice: filters.maxPrice,
                minYear: filters.minYear,
                city: filters.city?.[0],
              });
              router.push('/marketplace/alerts');
            }}
            hitSlop={8}
            style={{ padding: 4 }}
          >
            <Ionicons name="bookmark-outline" size={22} color={theme.color.text} />
          </Pressable>
          <Pressable onPress={() => router.push('/marketplace/browse')} hitSlop={8} style={{ padding: 4 }}>
            <Ionicons name="list" size={22} color={theme.color.text} />
          </Pressable>
        </View>

        {(filters.category || filters.brand || filters.model) ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6, paddingRight: 20 }}
          >
            {filters.category ? (
              <Chip
                label={CATEGORY_LABELS[filters.category]}
                active
                tone="primary"
                trailing={<Ionicons name="close" size={12} color={theme.color.textInverse} />}
                onPress={() =>
                  patchFilters({ category: undefined, brand: undefined, model: undefined })
                }
              />
            ) : null}
            {filters.brand ? (
              <Chip
                label={filters.brand}
                active
                tone="primary"
                trailing={<Ionicons name="close" size={12} color={theme.color.textInverse} />}
                onPress={() => patchFilters({ brand: undefined, model: undefined })}
              />
            ) : null}
            {filters.model ? (
              <Chip
                label={filters.model}
                active
                tone="primary"
                trailing={<Ionicons name="close" size={12} color={theme.color.textInverse} />}
                onPress={() => patchFilters({ model: undefined })}
              />
            ) : null}
          </ScrollView>
        ) : null}

        <Input
          value={query}
          onChangeText={setQuery}
          placeholder={t('marketplace.searchPlaceholder')}
          leading={<Ionicons name="search" size={18} color={theme.color.textSecondary} />}
          trailing={
            query ? (
              <Ionicons
                name="close-circle"
                size={18}
                color={theme.color.textSecondary}
                onPress={() => setQuery('')}
              />
            ) : null
          }
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 20 }}
        >
          <Chip
            label={activeFilterCount > 0 ? `Filtres · ${activeFilterCount}` : 'Filtres'}
            leading={
              <Ionicons name="options" size={14} color={activeFilterCount > 0 ? theme.color.textInverse : theme.color.text} />
            }
            active={activeFilterCount > 0}
            tone="primary"
            onPress={() => router.push('/marketplace/filters')}
          />
          <Chip
            label="Kargo Verified"
            active={filters.kargoVerifiedOnly}
            onPress={() => patchFilters({ kargoVerifiedOnly: !filters.kargoVerifiedOnly })}
          />
          <Chip
            label="Vérifiés"
            active={filters.verifiedOnly}
            onPress={() => patchFilters({ verifiedOnly: !filters.verifiedOnly })}
          />
          <Chip
            label="< 500K"
            active={filters.maxPrice === 500_000}
            onPress={() =>
              patchFilters({ maxPrice: filters.maxPrice === 500_000 ? undefined : 500_000 })
            }
          />
          <Chip
            label="2020+"
            active={filters.minYear === 2020}
            onPress={() => patchFilters({ minYear: filters.minYear === 2020 ? undefined : 2020 })}
          />
          <Chip
            label="Diesel"
            active={filters.fuel?.includes('diesel')}
            onPress={() =>
              patchFilters({ fuel: filters.fuel?.includes('diesel') ? [] : ['diesel'] })
            }
          />
        </ScrollView>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="caption" tone="secondary">
            {results.length} résultat{results.length > 1 ? 's' : ''}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {SORT_OPTIONS.map((o) => (
              <Chip
                key={o.key}
                label={o.label}
                active={sort === o.key}
                onPress={() => setSort(o.key)}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ padding: 20, paddingTop: 12, gap: 12 }}
        renderItem={({ item }) => <VehicleCard vehicle={item} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', gap: 8, padding: 32 }}>
            <Ionicons name="search" size={40} color={theme.color.textSecondary} />
            <Text variant="bodyL" weight="semiBold">
              Aucun résultat
            </Text>
            <Text variant="bodyM" tone="secondary" align="center">
              Ajustez vos filtres ou créez une alerte marché.
            </Text>
            <Badge label="A-01" tone="neutral" />
          </View>
        }
      />
    </SafeAreaView>
  );
}
