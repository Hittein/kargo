import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Input, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { CITIES, type City } from '@/lib/mocks/transit';
import { useTransitStore } from '@/lib/stores/transit';

export default function TransitDestination() {
  const theme = useTheme();
  const router = useRouter();
  const { fromCityId, setTo } = useTransitStore();
  const [query, setQuery] = useState('');

  const cities = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CITIES.filter((c) => {
      if (c.id === fromCityId) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q);
    });
  }, [query, fromCityId]);

  const onSelect = (city: City) => {
    setTo(city.id);
    router.back();
  };

  return (
    <Screen padded={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20 }}>
        <Ionicons name="chevron-back" size={26} color={theme.color.text} onPress={() => router.back()} />
        <Text variant="heading2" style={{ flex: 1 }}>
          Destination
        </Text>
        <Badge label="T-03" tone="neutral" />
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Input
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher une ville, un arrêt…"
          leading={<Ionicons name="search" size={18} color={theme.color.textSecondary} />}
        />
      </View>
      <FlatList
        data={cities}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 4 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item)}
            style={({ pressed }) => ({
              paddingVertical: 14,
              paddingHorizontal: 8,
              borderRadius: theme.radius.md,
              backgroundColor: pressed ? theme.color.bgElevated : 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            })}
          >
            <Ionicons name="location" size={18} color={theme.color.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyL" weight="semiBold">
                {item.name}
              </Text>
              <Text variant="caption" tone="secondary">
                {item.region} · {item.stops.length} arrêt{item.stops.length > 1 ? 's' : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.color.textSecondary} />
          </Pressable>
        )}
      />
    </Screen>
  );
}
