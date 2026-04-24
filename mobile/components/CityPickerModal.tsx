import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { CITIES, type City } from '@/lib/mocks/transit';

export type CityPickerModalProps = {
  visible: boolean;
  title: string;
  excludeId?: string;
  onClose: () => void;
  onSelect: (city: City) => void;
};

export function CityPickerModal({ visible, title, excludeId, onClose, onSelect }: CityPickerModalProps) {
  const theme = useTheme();
  const [query, setQuery] = useState('');

  const cities = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CITIES.filter((c) => {
      if (c.id === excludeId) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q);
    });
  }, [query, excludeId]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }} edges={['top', 'bottom']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, gap: 12 }}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={theme.color.text} />
          </Pressable>
          <Text variant="heading2" style={{ flex: 1 }}>
            {title}
          </Text>
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
              onPress={() => {
                onSelect(item);
                onClose();
              }}
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
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 32, gap: 8 }}>
              <Ionicons name="search" size={32} color={theme.color.textSecondary} />
              <Text variant="bodyM" tone="secondary">
                Aucune ville trouvée
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}
