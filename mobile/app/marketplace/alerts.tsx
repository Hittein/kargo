import { useEffect } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, Text } from '@/components/ui';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { formatMRU } from '@/lib/format';
import { CATEGORY_LABELS } from '@/lib/mocks/vehicles';
import { useMarketplaceStore } from '@/lib/stores/marketplace';
import { useSavedSearchStore, type SavedSearch } from '@/lib/stores/saved-searches';

export default function AlertsScreen() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { searches, remove, toggleNotify, markViewed, syncFromRemote, syncing } =
    useSavedSearchStore();
  const { setFilters, setQuery } = useMarketplaceStore();

  useEffect(() => {
    syncFromRemote();
  }, [syncFromRemote]);

  const openSearch = (s: SavedSearch) => {
    markViewed(s.id);
    setQuery(s.query ?? '');
    setFilters(s.filters ?? {});
    router.push('/marketplace/search');
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text variant="heading2" weight="bold">
            Mes recherches
          </Text>
          <Text variant="caption" tone="secondary">
            Alertes marché sauvegardées
          </Text>
        </View>
        <Badge label="A-14" tone="primary" />
      </View>

      <FlatList
        data={searches}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={syncing}
            onRefresh={syncFromRemote}
            tintColor={theme.color.primary}
          />
        }
        ListHeaderComponent={
          <Card variant="soft">
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.color.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="notifications" size={22} color={theme.color.textInverse} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyL" weight="bold">
                  Soyez alerté en premier
                </Text>
                <Text variant="caption" tone="secondary">
                  Push dès qu'une annonce matche vos critères.
                </Text>
              </View>
            </View>
          </Card>
        }
        renderItem={({ item }) => (
          <SearchRow
            search={item}
            onOpen={() => openSearch(item)}
            onToggle={() => toggleNotify(item.id)}
            onDelete={() => remove(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', gap: 10, padding: 40 }}>
            <Ionicons name="bookmark-outline" size={40} color={theme.color.textSecondary} />
            <Text variant="bodyL" weight="semiBold">
              Aucune recherche sauvegardée
            </Text>
            <Text variant="caption" tone="secondary" align="center">
              Lancez une recherche puis utilisez « Sauvegarder ».
            </Text>
          </View>
        }
      />

      <View
        style={{
          position: 'absolute',
          bottom: 24,
          left: 16,
          right: 16,
        }}
      >
        <Button
          label="Nouvelle recherche"
          onPress={() => router.push('/marketplace/browse')}
          leading={<Ionicons name="add" size={16} color={theme.color.textInverse} />}
        />
      </View>
    </SafeAreaView>
  );
}

function SearchRow({
  search,
  onOpen,
  onToggle,
  onDelete,
}: {
  search: SavedSearch;
  onOpen: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const f = search.filters ?? {};
  const criteria: string[] = [];
  const cat = f.category ?? search.category;
  if (cat) criteria.push(CATEGORY_LABELS[cat]);
  if (f.brand ?? search.brand) criteria.push((f.brand ?? search.brand) as string);
  if (f.model ?? search.model) criteria.push((f.model ?? search.model) as string);
  const minY = f.minYear ?? search.minYear;
  if (minY) criteria.push(`≥ ${minY}`);
  if (f.maxYear) criteria.push(`≤ ${f.maxYear}`);
  const maxP = f.maxPrice ?? search.maxPrice;
  if (maxP) criteria.push(`≤ ${formatMRU(maxP)} MRU`);
  if (f.minPrice) criteria.push(`≥ ${formatMRU(f.minPrice)} MRU`);
  if (f.maxKm) criteria.push(`< ${Math.round(f.maxKm / 1000)}K km`);
  if (f.fuel?.length) criteria.push(f.fuel.join('/'));
  if (f.transmission?.length) criteria.push(f.transmission.join('/'));
  const cities = f.city?.length ? f.city.join(', ') : search.city;
  if (cities) criteria.push(cities);
  if (f.verifiedOnly) criteria.push('Vérifiés');
  if (f.kargoVerifiedOnly) criteria.push('Kargo Verified');
  if (f.aiVerdict?.length) criteria.push(`IA: ${f.aiVerdict.join('/')}`);
  if (search.freshlyImportedOnly) criteria.push('Fraîchement dédouanée');
  if (search.query) criteria.push(`« ${search.query} »`);

  return (
    <Card onPress={onOpen}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text variant="bodyL" weight="bold" numberOfLines={1} style={{ flex: 1 }}>
              {search.name}
            </Text>
            {search.newMatchesSinceLastView > 0 ? (
              <Badge label={`+${search.newMatchesSinceLastView} nouveau`} tone="success" />
            ) : null}
          </View>
          <Text variant="caption" tone="secondary" numberOfLines={2}>
            {criteria.join(' · ') || 'Tous critères'}
          </Text>
          <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>
            {search.lastMatchCount} annonce{search.lastMatchCount > 1 ? 's' : ''} trouvée
            {search.lastMatchCount > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: theme.color.divider,
          gap: 12,
        }}
      >
        <Pressable
          onPress={onToggle}
          hitSlop={6}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Ionicons
            name={search.notifyEnabled ? 'notifications' : 'notifications-off'}
            size={16}
            color={search.notifyEnabled ? theme.color.primary : theme.color.textSecondary}
          />
          <Text
            variant="caption"
            weight="semiBold"
            style={{ color: search.notifyEnabled ? theme.color.primary : theme.color.textSecondary }}
          >
            {search.notifyEnabled ? 'Notifications ON' : 'OFF'}
          </Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={onDelete}
          hitSlop={6}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <Ionicons name="trash-outline" size={16} color={theme.color.danger} />
          <Text variant="caption" weight="semiBold" style={{ color: theme.color.danger }}>
            Supprimer
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}
