import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, Chip, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { formatMRU } from '@/lib/format';
import { formatDateShort, formatTime } from '@/lib/time';
import { getCity, getCompany, getTrip } from '@/lib/mocks/transit';
import { categorizeTickets, useTicketsStore } from '@/lib/stores/tickets';

type Tab = 'active' | 'used' | 'cancelled';

export default function TicketsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const tickets = useTicketsStore((s) => s.tickets);
  const [tab, setTab] = useState<Tab>('active');

  const grouped = useMemo(() => categorizeTickets(tickets), [tickets]);
  const current = grouped[tab] ?? [];

  return (
    <Screen scroll>
      <View>
        <Text variant="caption" tone="secondary">
          Kargo Transport
        </Text>
        <Text variant="heading1">Mes billets</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip label={`Actifs · ${grouped.active.length}`} active={tab === 'active'} onPress={() => setTab('active')} tone="primary" />
        <Chip label={`Passés · ${grouped.used.length}`} active={tab === 'used'} onPress={() => setTab('used')} tone="primary" />
        <Chip
          label={`Annulés · ${grouped.cancelled.length}`}
          active={tab === 'cancelled'}
          onPress={() => setTab('cancelled')}
          tone="primary"
        />
      </View>

      {current.length === 0 ? (
        <Card variant="sand">
          <View style={{ alignItems: 'center', gap: 10, padding: 16 }}>
            <Ionicons name="ticket-outline" size={40} color={theme.color.textSecondary} />
            <Text variant="bodyL" weight="semiBold" align="center">
              {tab === 'active'
                ? 'Aucun billet actif'
                : tab === 'used'
                  ? 'Aucun billet passé'
                  : 'Aucun billet annulé'}
            </Text>
            <Text variant="bodyM" tone="secondary" align="center">
              Réservez un trajet pour obtenir votre e-billet avec QR.
            </Text>
            <Button
              label="Chercher un trajet"
              onPress={() => router.push('/transit')}
              leading={<Ionicons name="search" size={16} color={theme.color.textInverse} />}
            />
          </View>
        </Card>
      ) : (
        <FlatList
          scrollEnabled={false}
          data={current}
          keyExtractor={(t) => t.id}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            const trip = getTrip(item.tripId);
            if (!trip) return null;
            const from = getCity(trip.fromCityId);
            const to = getCity(trip.toCityId);
            const company = getCompany(trip.companyId);
            return (
              <Card onPress={() => router.push(`/transit/ticket/${item.id}` as never)}>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: company?.logoColor ?? theme.color.transit,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text variant="caption" weight="bold" style={{ color: theme.color.textInverse }}>
                      {company?.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyL" weight="semiBold">
                      {from?.name} → {to?.name}
                    </Text>
                    <Text variant="caption" tone="secondary">
                      {formatDateShort(trip.departure)} · {formatTime(trip.departure)}
                    </Text>
                  </View>
                  {item.status === 'cancelled' ? (
                    <Badge label="Annulé" tone="danger" />
                  ) : (
                    <Badge label={`${item.passengers.length} pass.`} tone="neutral" />
                  )}
                </View>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Text variant="caption" tone="secondary" numberOfLines={1}>
                    {item.passengers.map((p) => p.seatLabel).join(', ')}
                  </Text>
                  <Text variant="bodyM" weight="semiBold" style={{ color: theme.color.primary }}>
                    {formatMRU(item.totalPaid)} MRU
                  </Text>
                </View>
              </Card>
            );
          }}
        />
      )}

      <Card variant="sand">
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <Ionicons name="ticket" size={18} color={theme.color.transit} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Badge label="T-13" tone="neutral" />
            <Text variant="bodyM" style={{ marginTop: 6 }}>
              Billets disponibles hors ligne dans Kargo Wallet. Le QR reste valide même sans
              réseau.
            </Text>
          </View>
        </View>
      </Card>
    </Screen>
  );
}
