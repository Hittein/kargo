import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, Chip, Text } from '@/components/ui';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { useRentalStore } from '@/lib/stores/rental';

const PRICE_PRESETS = [10_000, 20_000, 30_000, 50_000];
const SEAT_PRESETS = [2, 4, 5, 7];

export default function RentalFilters() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { filters, setFilters } = useRentalStore();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="close" size={24} color={theme.color.text} />
        </Pressable>
        <Text variant="heading2" weight="bold" style={{ flex: 1 }}>
          Filtres location
        </Text>
        <Badge label="L-03" tone="primary" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 120 }}>
        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Prix max / jour
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {PRICE_PRESETS.map((p) => (
              <Chip
                key={p}
                label={`${p.toLocaleString('fr-FR')} MRU`}
                active={filters.maxPricePerDay === p}
                tone="primary"
                onPress={() =>
                  setFilters({ maxPricePerDay: filters.maxPricePerDay === p ? undefined : p })
                }
              />
            ))}
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Transmission
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Chip
              label="Auto"
              active={filters.transmission === 'auto'}
              tone="primary"
              onPress={() =>
                setFilters({ transmission: filters.transmission === 'auto' ? undefined : 'auto' })
              }
            />
            <Chip
              label="Manuelle"
              active={filters.transmission === 'manual'}
              tone="primary"
              onPress={() =>
                setFilters({
                  transmission: filters.transmission === 'manual' ? undefined : 'manual',
                })
              }
            />
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Nombre de places minimum
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {SEAT_PRESETS.map((s) => (
              <Chip
                key={s}
                label={`≥ ${s} places`}
                active={filters.minSeats === s}
                tone="primary"
                onPress={() =>
                  setFilters({ minSeats: filters.minSeats === s ? undefined : s })
                }
              />
            ))}
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Services
          </Text>
          <Pressable
            onPress={() => setFilters({ withChauffeur: !filters.withChauffeur })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 12,
              marginTop: 8,
            }}
          >
            <Ionicons
              name={filters.withChauffeur ? 'checkbox' : 'square-outline'}
              size={22}
              color={filters.withChauffeur ? theme.color.primary : theme.color.textSecondary}
            />
            <Text variant="bodyL" weight="semiBold" style={{ flex: 1 }}>
              Avec chauffeur
            </Text>
            <Text variant="caption" tone="secondary">
              ~ 4 000 MRU/j
            </Text>
          </Pressable>
        </Card>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          paddingBottom: 28,
          flexDirection: 'row',
          gap: 12,
          backgroundColor: theme.color.bg,
          borderTopWidth: 1,
          borderTopColor: theme.color.border,
        }}
      >
        <Button
          label="Réinitialiser"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => setFilters({})}
        />
        <Button
          label="Appliquer"
          style={{ flex: 1.4 }}
          onPress={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}
