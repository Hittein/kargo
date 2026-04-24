import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Card, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { formatMRU } from '@/lib/format';
import { formatDuration, formatTime } from '@/lib/time';
import {
  BUS_SIZE_ICON,
  BUS_SIZE_LABEL,
  getCity,
  getCompany,
  type Trip,
  type TripRank,
} from '@/lib/mocks/transit';

const RANK_STYLE: Record<TripRank, { label: string; color: string; bg: string }> = {
  cheapest: { label: 'Le moins cher', color: '#047857', bg: '#D1FAE5' },
  '2nd-cheapest': { label: '2e moins cher', color: '#047857', bg: '#D1FAE5' },
  fastest: { label: 'Le plus rapide', color: '#1D4ED8', bg: '#DBEAFE' },
  '2nd-fastest': { label: '2e plus rapide', color: '#1D4ED8', bg: '#DBEAFE' },
  alternative: { label: 'Route alternative', color: '#B45309', bg: '#FEF3C7' },
};

export function TripCard({
  trip,
  ranks,
  onPress,
}: {
  trip: Trip;
  ranks?: TripRank[];
  onPress?: () => void;
}) {
  const theme = useTheme();
  const router = useRouter();
  const company = getCompany(trip.companyId);
  const from = getCity(trip.fromCityId);
  const to = getCity(trip.toCityId);

  return (
    <Card onPress={onPress ?? (() => router.push(`/transit/${trip.id}` as never))}>
      {ranks && ranks.length > 0 ? (
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {ranks.map((r) => {
            const s = RANK_STYLE[r];
            return (
              <View
                key={r}
                style={{
                  backgroundColor: s.bg,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text variant="caption" weight="semiBold" style={{ color: s.color }}>
                  {s.label}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: company?.logoColor ?? theme.color.transit,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="caption" weight="bold" style={{ color: theme.color.textInverse }}>
            {company?.name.slice(0, 2).toUpperCase() ?? '??'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyM" weight="semiBold" numberOfLines={1}>
            {company?.name ?? 'Compagnie'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="star" size={10} color={theme.color.accent} />
            <Text variant="caption" tone="secondary">
              {company?.rating.toFixed(1)} · {company?.reviews} avis
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            backgroundColor: theme.color.bgElevated,
          }}
        >
          <Ionicons
            name={
              BUS_SIZE_ICON[trip.busSize] as React.ComponentProps<typeof Ionicons>['name']
            }
            size={14}
            color={theme.color.text}
          />
          <Text variant="caption" weight="semiBold">
            {BUS_SIZE_LABEL[trip.busSize]}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ alignItems: 'center' }}>
          <Text variant="heading2" weight="bold">
            {formatTime(trip.departure)}
          </Text>
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {from?.name}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text variant="caption" tone="secondary">
            {formatDuration(trip.durationMin)}
            {trip.distanceKm ? ` · ${trip.distanceKm} km` : ''}
          </Text>
          <View
            style={{
              height: 2,
              alignSelf: 'stretch',
              backgroundColor: theme.color.border,
              borderRadius: 1,
            }}
          />
          <Ionicons
            name={BUS_SIZE_ICON[trip.busSize] as React.ComponentProps<typeof Ionicons>['name']}
            size={14}
            color={theme.color.textSecondary}
          />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text variant="heading2" weight="bold">
            {formatTime(trip.arrival)}
          </Text>
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {to?.name}
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: theme.color.divider,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {trip.direct ? (
            <Badge label="Direct" tone="success" />
          ) : (
            <Badge label="Arrêts" tone="neutral" />
          )}
          <Text
            variant="caption"
            weight="semiBold"
            style={{
              color: trip.seatsLeft <= 5 ? theme.color.danger : theme.color.textSecondary,
            }}
          >
            {trip.seatsLeft <= 5
              ? `Plus que ${trip.seatsLeft} place${trip.seatsLeft > 1 ? 's' : ''}`
              : `${trip.seatsLeft} places`}
          </Text>
        </View>
        <Text variant="bodyL" weight="bold" style={{ color: theme.color.primary }}>
          {formatMRU(trip.price)} MRU
        </Text>
      </View>
    </Card>
  );
}
