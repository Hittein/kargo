import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Card, SegmentedTabs, Text } from '@/components/ui';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { formatMRU } from '@/lib/format';
import {
  getRentalById,
  MY_RENTALS,
  type RentalBooking,
} from '@/lib/mocks/rentals';

type Tab = 'upcoming' | 'active' | 'past';

const STATUS_LABEL: Record<RentalBooking['status'], { label: string; tone: 'primary' | 'success' | 'neutral' | 'danger' }> = {
  pending: { label: 'En attente', tone: 'neutral' },
  confirmed: { label: 'Confirmée', tone: 'primary' },
  in_progress: { label: 'En cours', tone: 'success' },
  completed: { label: 'Terminée', tone: 'neutral' },
  cancelled: { label: 'Annulée', tone: 'danger' },
};

export default function MyRentals() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('active');

  const data = useMemo(() => {
    if (tab === 'upcoming') return MY_RENTALS.filter((b) => b.status === 'pending' || b.status === 'confirmed');
    if (tab === 'active') return MY_RENTALS.filter((b) => b.status === 'in_progress');
    return MY_RENTALS.filter((b) => b.status === 'completed' || b.status === 'cancelled');
  }, [tab]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <Text variant="heading2" weight="bold" style={{ flex: 1 }}>
          Mes locations
        </Text>
        <Badge label="L-09" tone="primary" />
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <SegmentedTabs
          variant="pill"
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          items={[
            { key: 'upcoming', label: 'À venir' },
            { key: 'active', label: 'En cours' },
            { key: 'past', label: 'Historique' },
          ]}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => <BookingRow booking={item} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', gap: 8, padding: 32 }}>
            <Ionicons name="calendar-outline" size={40} color={theme.color.textSecondary} />
            <Text variant="bodyL" weight="semiBold">
              Aucune location ici
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function BookingRow({ booking }: { booking: RentalBooking }) {
  const theme = useTheme();
  const router = useRouter();
  const rental = getRentalById(booking.listingId);
  const status = STATUS_LABEL[booking.status];

  return (
    <Card onPress={() => router.push(`/rental/${booking.listingId}` as never)}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 12,
            backgroundColor: theme.color.bgElevated,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="car-sport" size={28} color={theme.color.textSecondary} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="bodyL" weight="semiBold" numberOfLines={1}>
              {rental ? `${rental.brand} ${rental.model}` : 'Véhicule'}
            </Text>
            <Badge label={status.label} tone={status.tone} />
          </View>
          <Text variant="caption" tone="secondary">
            {booking.startDate} → {booking.endDate} · {booking.pickupCity}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="bodyM" weight="bold" style={{ color: theme.color.primary }}>
              {formatMRU(booking.totalMRU)} MRU
            </Text>
            {booking.status === 'in_progress' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="location" size={14} color={theme.color.success} />
                <Text variant="caption" weight="semiBold" style={{ color: theme.color.success }}>
                  Suivi GPS actif
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Card>
  );
}
