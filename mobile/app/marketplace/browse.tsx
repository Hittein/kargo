import { useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Text } from '@/components/ui';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import {
  CATEGORY_LABELS,
  listBrandsForCategory,
  listModelsForBrand,
  VEHICLES,
  type VehicleCategory,
} from '@/lib/mocks/vehicles';
import { useMarketplaceStore } from '@/lib/stores/marketplace';

type Params = {
  category?: VehicleCategory;
  brand?: string;
};

export default function MarketplaceBrowse() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const { setFilters, setQuery } = useMarketplaceStore();

  const level: 'category' | 'brand' | 'model' = params.brand
    ? 'model'
    : params.category
      ? 'brand'
      : 'category';

  const items: { key: string; label: string; meta?: string; href?: string; onPress?: () => void }[] =
    useMemo(() => {
      if (level === 'category') {
        return (Object.keys(CATEGORY_LABELS) as VehicleCategory[]).map((c) => ({
          key: c,
          label: CATEGORY_LABELS[c],
          meta: `${VEHICLES.filter((v) => v.category === c).length} annonces`,
          onPress: () => router.push(`/marketplace/browse?category=${c}` as never),
        }));
      }
      if (level === 'brand') {
        const brands = listBrandsForCategory(params.category as VehicleCategory);
        return [
          {
            key: '__all__',
            label: `Tout dans ${CATEGORY_LABELS[params.category as VehicleCategory]}`,
            onPress: () => {
              setQuery('');
              setFilters({ category: params.category });
              router.push('/marketplace/search');
            },
          },
          ...brands.map((b) => ({
            key: b,
            label: b,
            meta: `${VEHICLES.filter((v) => v.category === params.category && v.brand === b).length}`,
            onPress: () =>
              router.push(
                `/marketplace/browse?category=${params.category}&brand=${encodeURIComponent(b)}` as never,
              ),
          })),
        ];
      }
      const models = listModelsForBrand(
        params.category as VehicleCategory,
        params.brand as string,
      );
      return [
        {
          key: '__all__',
          label: `Tout dans ${params.brand}`,
          onPress: () => {
            setQuery('');
            setFilters({ category: params.category, brand: params.brand });
            router.push('/marketplace/search');
          },
        },
        ...models.map((m) => ({
          key: m,
          label: m,
          onPress: () => {
            setQuery('');
            setFilters({
              category: params.category,
              brand: params.brand,
              model: m,
            });
            router.push('/marketplace/search');
          },
        })),
      ];
    }, [level, params.category, params.brand, router, setFilters, setQuery]);

  const title =
    level === 'category'
      ? 'Véhicules'
      : level === 'brand'
        ? CATEGORY_LABELS[params.category as VehicleCategory]
        : (params.brand as string);

  const breadcrumb =
    level === 'category'
      ? null
      : level === 'brand'
        ? 'Véhicules'
        : `Véhicules > ${CATEGORY_LABELS[params.category as VehicleCategory]}`;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.color.border,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={{ padding: 4 }}
        >
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          {breadcrumb ? (
            <Text variant="caption" tone="secondary">
              {breadcrumb}
            </Text>
          ) : null}
          <Text variant="heading2" weight="bold">
            {title}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/marketplace/search')}
          hitSlop={8}
          style={{ padding: 4 }}
        >
          <Ionicons name="search" size={22} color={theme.color.text} />
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={item.onPress}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 18,
              backgroundColor: pressed ? theme.color.bgElevated : 'transparent',
            })}
          >
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text
                variant="bodyL"
                weight={item.key === '__all__' ? 'bold' : 'regular'}
              >
                {item.label}
              </Text>
              {item.key === '__all__' ? (
                <Ionicons name="checkmark" size={18} color={theme.color.primary} />
              ) : null}
            </View>
            {item.meta ? (
              <Badge label={item.meta} tone="neutral" />
            ) : null}
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.color.textSecondary}
              style={{ marginLeft: 8 }}
            />
          </Pressable>
        )}
        ItemSeparatorComponent={() => (
          <View
            style={{ height: 1, backgroundColor: theme.color.border, marginHorizontal: 20 }}
          />
        )}
      />
    </SafeAreaView>
  );
}
