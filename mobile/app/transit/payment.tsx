import { useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, Screen, StickyCTA, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { formatMRU } from '@/lib/format';
import { getCity, getTrip } from '@/lib/mocks/transit';
import {
  CATEGORY_LABELS,
  PAYMENT_LABELS,
  type PaymentMethod,
  useBookingStore,
} from '@/lib/stores/booking';
import { makeQrToken, makeTicketId, useTicketsStore } from '@/lib/stores/tickets';
import { useWalletStore } from '@/lib/stores/wallet';
import { ticketsApi } from '@/lib/api';

const BOOKING_FEE = 150;
const METHODS: PaymentMethod[] = ['kargo_wallet', 'bankily', 'masrvi', 'sedad', 'card'];

export default function TransitPayment() {
  const theme = useTheme();
  const router = useRouter();
  const { tripId, passengers, method, setMethod, reset } = useBookingStore();
  const addTicket = useTicketsStore((s) => s.add);
  const wallet = useWalletStore();
  const [processing, setProcessing] = useState(false);

  const trip = tripId ? getTrip(tripId) : undefined;
  const from = trip ? getCity(trip.fromCityId) : undefined;
  const to = trip ? getCity(trip.toCityId) : undefined;

  const total = useMemo(() => {
    if (!trip) return 0;
    let sub = 0;
    for (const p of passengers) sub += trip.price * (1 - CATEGORY_LABELS[p.category].discount);
    return Math.round(sub + BOOKING_FEE);
  }, [trip, passengers]);

  if (!trip) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Ionicons name="alert-circle" size={40} color={theme.color.textSecondary} />
          <Text variant="heading2">Session expirée</Text>
          <Button label="Retour" variant="secondary" onPress={() => router.replace('/transit')} />
        </View>
      </Screen>
    );
  }

  const walletInsufficient = method === 'kargo_wallet' && wallet.balance < total;
  const canPay = !!method && !walletInsufficient && !processing;

  const onPay = async () => {
    if (!method || !trip) return;
    if (method === 'kargo_wallet' && !wallet.debit(total)) {
      Alert.alert('Solde insuffisant', 'Rechargez votre Kargo Wallet pour continuer.');
      return;
    }
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 900));

    const ticketId = makeTicketId();
    const pointsEarned = Math.round(total / 100);
    wallet.addTransaction({
      id: `tx-${ticketId}`,
      type: 'ticket_transit',
      amount: -total,
      status: 'completed',
      createdAt: new Date().toISOString(),
      counterparty: `${from?.name} → ${to?.name}`,
      note: `${passengers.length} billet${passengers.length > 1 ? 's' : ''} · ${PAYMENT_LABELS[method].label}`,
      reference: ticketId.toUpperCase(),
      pointsEarned,
    });
    wallet.addPoints(pointsEarned);
    const qrToken = makeQrToken();
    addTicket({
      id: ticketId,
      tripId: trip.id,
      passengers,
      totalPaid: total,
      method,
      issuedAt: new Date().toISOString(),
      qrToken,
      status: 'upcoming',
    });

    // Trace l'achat côté backend (fire-and-forget). L'UX ne dépend pas du retour
    // serveur : la réservation est déjà enregistrée localement. Si le backend est
    // offline ou le trip est un mock (pas d'UUID valide), on ignore silencieusement.
    if (/^[0-9a-f]{8}-/.test(trip.id)) {
      ticketsApi
        .createTicket({
          tripId: trip.id,
          seatsBooked: passengers.length,
          totalPaidMru: total,
          paymentMethod: method,
          qrToken,
        })
        .catch(() => {});
    }

    reset();
    router.replace(`/transit/ticket/${ticketId}`);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll contentStyle={{ paddingBottom: 140 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Ionicons name="chevron-back" size={26} color={theme.color.text} onPress={() => router.back()} />
          <Badge label="T-11" tone="neutral" />
        </View>
        <Text variant="heading1">Mode de paiement</Text>
        <Text variant="bodyM" tone="secondary">
          Total à payer : {formatMRU(total)} MRU
        </Text>

        <View style={{ gap: 10 }}>
          {METHODS.map((m) => {
            const meta = PAYMENT_LABELS[m];
            const isWallet = m === 'kargo_wallet';
            const disabled = isWallet && wallet.balance < total;
            const selected = method === m;
            return (
              <Pressable
                key={m}
                onPress={() => !disabled && setMethod(m)}
                style={({ pressed }) => ({
                  padding: 14,
                  borderRadius: theme.radius.md,
                  borderWidth: 2,
                  borderColor: selected ? theme.color.primary : theme.color.border,
                  backgroundColor: selected ? theme.color.surface : theme.color.card,
                  opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                })}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    backgroundColor: meta.color + '22',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name={meta.icon as React.ComponentProps<typeof Ionicons>['name']}
                    size={20}
                    color={meta.color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyL" weight="semiBold">
                    {meta.label}
                  </Text>
                  {isWallet ? (
                    <Text
                      variant="caption"
                      tone="secondary"
                      style={disabled ? { color: theme.color.danger } : undefined}
                    >
                      Solde · {formatMRU(wallet.balance)} MRU
                      {disabled ? ' · insuffisant' : ''}
                    </Text>
                  ) : (
                    <Text variant="caption" tone="secondary">
                      Paiement instantané
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: selected ? theme.color.primary : theme.color.border,
                    backgroundColor: selected ? theme.color.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selected ? (
                    <Ionicons name="checkmark" size={14} color={theme.color.textInverse} />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Card variant="sand">
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Ionicons name="shield-checkmark" size={18} color={theme.color.success} style={{ marginTop: 2 }} />
            <Text variant="bodyM" style={{ flex: 1 }}>
              Kargo protège votre paiement. En cas d'annulation par la compagnie, remboursement
              automatique sous 48 h.
            </Text>
          </View>
        </Card>
      </Screen>

      <StickyCTA>
        <Button
          label={processing ? 'Traitement…' : `Confirmer · ${formatMRU(total)} MRU`}
          fullWidth
          disabled={!canPay}
          loading={processing}
          leading={<Ionicons name="lock-closed" size={16} color={theme.color.textInverse} />}
          onPress={onPay}
        />
      </StickyCTA>
    </View>
  );
}
