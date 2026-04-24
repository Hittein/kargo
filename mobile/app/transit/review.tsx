import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, Screen, StickyCTA, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { formatMRU } from '@/lib/format';
import { formatDateLong, formatTime } from '@/lib/time';
import { getCity, getCompany, getTrip } from '@/lib/mocks/transit';
import { CATEGORY_LABELS, useBookingStore } from '@/lib/stores/booking';

const BOOKING_FEE = 150;

export default function TransitReview() {
  const theme = useTheme();
  const router = useRouter();
  const { tripId, passengers, cgvAccepted, setCgv, lockExpiresAt } = useBookingStore();
  const [remaining, setRemaining] = useState(() => getRemaining(lockExpiresAt));

  useEffect(() => {
    const i = setInterval(() => setRemaining(getRemaining(lockExpiresAt)), 1_000);
    return () => clearInterval(i);
  }, [lockExpiresAt]);

  const trip = tripId ? getTrip(tripId) : undefined;
  const from = trip ? getCity(trip.fromCityId) : undefined;
  const to = trip ? getCity(trip.toCityId) : undefined;
  const company = trip ? getCompany(trip.companyId) : undefined;

  const breakdown = useMemo(() => {
    if (!trip) return { subtotal: 0, discount: 0, fee: 0, total: 0 };
    let subtotal = 0;
    let discount = 0;
    for (const p of passengers) {
      const rate = CATEGORY_LABELS[p.category].discount;
      subtotal += trip.price;
      discount += trip.price * rate;
    }
    const fee = passengers.length > 0 ? BOOKING_FEE : 0;
    return { subtotal, discount, fee, total: subtotal - discount + fee };
  }, [trip, passengers]);

  if (!trip || passengers.length === 0) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Ionicons name="alert-circle" size={40} color={theme.color.textSecondary} />
          <Text variant="heading2">Réservation incomplète</Text>
          <Button label="Retour" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll contentStyle={{ paddingBottom: 160 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Ionicons name="chevron-back" size={26} color={theme.color.text} onPress={() => router.back()} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="timer-outline" size={14} color={theme.color.danger} />
            <Text variant="caption" weight="semiBold" style={{ color: theme.color.danger }}>
              Panier · {remaining}
            </Text>
            <Badge label="T-10" tone="neutral" />
          </View>
        </View>

        <Text variant="heading1">Résumé de la commande</Text>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
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
                {formatDateLong(trip.departure)} · {formatTime(trip.departure)}
              </Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: theme.color.divider }} />

          <View style={{ gap: 10, marginTop: 12 }}>
            {passengers.map((p, idx) => (
              <View
                key={p.seatLabel}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    backgroundColor: theme.color.bgElevated,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text variant="caption" weight="bold">
                    {p.seatLabel}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyM" weight="semiBold">
                    {p.name || `Passager ${idx + 1}`}
                  </Text>
                  <Text variant="caption" tone="secondary">
                    {CATEGORY_LABELS[p.category].label} · {p.phone}
                  </Text>
                </View>
                <Text variant="bodyM" weight="semiBold">
                  {formatMRU(trip.price * (1 - CATEGORY_LABELS[p.category].discount))}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <Card variant="sand">
          <Row label={`Sous-total (${passengers.length} billet${passengers.length > 1 ? 's' : ''})`} value={`${formatMRU(breakdown.subtotal)} MRU`} />
          {breakdown.discount > 0 ? (
            <Row
              label="Réduction catégories"
              value={`− ${formatMRU(breakdown.discount)} MRU`}
              valueColor={theme.color.success}
            />
          ) : null}
          <Row label="Frais de réservation" value={`${formatMRU(breakdown.fee)} MRU`} />
          <View style={{ height: 1, backgroundColor: theme.color.divider, marginVertical: 10 }} />
          <Row
            label="Total"
            value={`${formatMRU(breakdown.total)} MRU`}
            emphasized
          />
        </Card>

        <Pressable
          onPress={() => setCgv(!cgvAccepted)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10,
            padding: 12,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: cgvAccepted ? theme.color.primary : theme.color.border,
            backgroundColor: cgvAccepted ? theme.color.surface : 'transparent',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: cgvAccepted ? theme.color.primary : theme.color.border,
              backgroundColor: cgvAccepted ? theme.color.primary : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {cgvAccepted ? (
              <Ionicons name="checkmark" size={14} color={theme.color.textInverse} />
            ) : null}
          </View>
          <Text variant="bodyM" style={{ flex: 1 }}>
            J'accepte les conditions de transport ({company?.name}) et la politique d'annulation
            Kargo. Les billets sont nominatifs.
          </Text>
        </Pressable>
      </Screen>

      <StickyCTA>
        <Button
          label={`Payer ${formatMRU(breakdown.total)} MRU`}
          fullWidth
          disabled={!cgvAccepted}
          leading={<Ionicons name="lock-closed" size={16} color={theme.color.textInverse} />}
          onPress={() => router.push('/transit/payment')}
        />
      </StickyCTA>
    </View>
  );
}

function Row({
  label,
  value,
  valueColor,
  emphasized,
}: {
  label: string;
  value: string;
  valueColor?: string;
  emphasized?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
      <Text variant={emphasized ? 'bodyL' : 'bodyM'} tone={emphasized ? undefined : 'secondary'}>
        {label}
      </Text>
      <Text
        variant={emphasized ? 'bodyL' : 'bodyM'}
        weight={emphasized ? 'bold' : 'semiBold'}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
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
