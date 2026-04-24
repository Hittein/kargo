import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, Screen, StickyCTA, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { formatMRU } from '@/lib/format';
import { getSeatLayout } from '@/lib/mocks/seats';
import { getTrip } from '@/lib/mocks/transit';
import { useBookingStore } from '@/lib/stores/booking';

export default function SeatSelection() {
  const theme = useTheme();
  const router = useRouter();
  const { tripId, selectedSeats, toggleSeat, lockExpiresAt } = useBookingStore();
  const [remaining, setRemaining] = useState(() => getRemaining(lockExpiresAt));

  useEffect(() => {
    const i = setInterval(() => setRemaining(getRemaining(lockExpiresAt)), 1_000);
    return () => clearInterval(i);
  }, [lockExpiresAt]);

  const seats = useMemo(() => (tripId ? getSeatLayout(tripId) : []), [tripId]);
  const rows = useMemo(() => {
    const map = new Map<number, typeof seats>();
    for (const s of seats) {
      const arr = map.get(s.row) ?? [];
      arr.push(s);
      map.set(s.row, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [seats]);

  const trip = tripId ? getTrip(tripId) : undefined;
  const subtotal = trip ? trip.price * selectedSeats.length : 0;

  if (!trip) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Ionicons name="alert-circle" size={40} color={theme.color.textSecondary} />
          <Text variant="heading2">Aucun trajet sélectionné</Text>
          <Button label="Retour" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll contentStyle={{ paddingBottom: 140 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Ionicons name="chevron-back" size={26} color={theme.color.text} onPress={() => router.back()} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="timer-outline" size={14} color={theme.color.danger} />
            <Text variant="caption" weight="semiBold" style={{ color: theme.color.danger }}>
              Places réservées · {remaining}
            </Text>
            <Badge label="T-08" tone="neutral" />
          </View>
        </View>

        <Text variant="heading1">Choisissez votre siège</Text>
        <Text variant="bodyM" tone="secondary">
          {selectedSeats.length > 0
            ? `${selectedSeats.length} siège${selectedSeats.length > 1 ? 's' : ''} sélectionné${
                selectedSeats.length > 1 ? 's' : ''
              } · ${selectedSeats.join(', ')}`
            : 'Jusqu\'à 6 sièges par réservation.'}
        </Text>

        <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
          <Legend color={theme.color.bgElevated} border={theme.color.border} label="Libre" />
          <Legend color={theme.color.primary} border={theme.color.primary} label="Sélectionné" />
          <Legend color={theme.color.divider} border={theme.color.divider} label="Occupé" striped />
        </View>

        <Card variant="sand">
          <View style={{ alignItems: 'center', gap: 6, paddingBottom: 14 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.color.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="car" size={22} color={theme.color.textSecondary} />
            </View>
            <Text variant="caption" tone="secondary">
              Conducteur
            </Text>
          </View>
          <ScrollView>
            <View style={{ gap: 8, alignItems: 'center' }}>
              {rows.map(([rowNum, rowSeats]) => (
                <View key={rowNum} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text variant="caption" tone="secondary" style={{ width: 20, textAlign: 'right' }}>
                    {rowNum}
                  </Text>
                  {rowSeats.map((seat) => {
                    const selected = selectedSeats.includes(seat.label);
                    return (
                      <View key={seat.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <SeatButton
                          label={seat.label}
                          status={selected ? 'selected' : seat.status}
                          onPress={() => {
                            if (seat.status === 'occupied') return;
                            toggleSeat(seat.label);
                          }}
                        />
                        {seat.aisleAfter ? <View style={{ width: 16 }} /> : null}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </Card>
      </Screen>

      <StickyCTA>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="caption" tone="secondary">
              {selectedSeats.length} × {formatMRU(trip.price)} MRU
            </Text>
            <Text variant="heading2" weight="bold" style={{ color: theme.color.primary }}>
              {formatMRU(subtotal)} MRU
            </Text>
          </View>
          <Button
            label="Continuer"
            disabled={selectedSeats.length === 0}
            style={{ flex: 1.3 }}
            leading={<Ionicons name="arrow-forward" size={16} color={theme.color.textInverse} />}
            onPress={() => router.push('/transit/passenger')}
          />
        </View>
      </StickyCTA>
    </View>
  );
}

function SeatButton({
  label,
  status,
  onPress,
}: {
  label: string;
  status: 'free' | 'occupied' | 'selected';
  onPress: () => void;
}) {
  const theme = useTheme();
  const palette = {
    free: { bg: theme.color.bgElevated, fg: theme.color.text, border: theme.color.border },
    occupied: { bg: theme.color.divider, fg: theme.color.textSecondary, border: theme.color.divider },
    selected: { bg: theme.color.primary, fg: theme.color.textInverse, border: theme.color.primary },
  }[status];
  return (
    <Pressable
      onPress={onPress}
      disabled={status === 'occupied'}
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: palette.bg,
        borderWidth: 2,
        borderColor: palette.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {status === 'occupied' ? (
        <Ionicons name="close" size={14} color={palette.fg} />
      ) : (
        <Text variant="caption" weight="semiBold" style={{ color: palette.fg }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function Legend({
  color,
  border,
  label,
  striped,
}: {
  color: string;
  border: string;
  label: string;
  striped?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          backgroundColor: color,
          borderWidth: 1,
          borderColor: border,
          opacity: striped ? 0.6 : 1,
        }}
      />
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

function getRemaining(expiresAt?: number): string {
  if (!expiresAt) return '10:00';
  const delta = Math.max(0, expiresAt - Date.now());
  const m = Math.floor(delta / 60_000);
  const s = Math.floor((delta % 60_000) / 1_000);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
