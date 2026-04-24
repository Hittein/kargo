import { Alert, Share, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Badge, Button, Card, Screen, Text } from '@/components/ui';
import { QrPlaceholder } from '@/components/QrPlaceholder';
import { useTheme } from '@/theme/ThemeProvider';
import { formatMRU } from '@/lib/format';
import { formatDateLong, formatTime } from '@/lib/time';
import { getCity, getCompany, getTrip } from '@/lib/mocks/transit';
import { CATEGORY_LABELS, PAYMENT_LABELS } from '@/lib/stores/booking';
import { useTicketsStore } from '@/lib/stores/tickets';

export default function TicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const tickets = useTicketsStore((s) => s.tickets);
  const cancel = useTicketsStore((s) => s.cancel);
  const ticket = tickets.find((t) => t.id === id);
  const trip = ticket ? getTrip(ticket.tripId) : undefined;
  const from = trip ? getCity(trip.fromCityId) : undefined;
  const to = trip ? getCity(trip.toCityId) : undefined;
  const company = trip ? getCompany(trip.companyId) : undefined;

  if (!ticket || !trip) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Ionicons name="alert-circle" size={40} color={theme.color.textSecondary} />
          <Text variant="heading2">Billet introuvable</Text>
          <Button label="Retour" variant="secondary" onPress={() => router.replace('/(tabs)/tickets')} />
        </View>
      </Screen>
    );
  }

  const onShare = async () => {
    try {
      await Share.share({
        message: `Billet Kargo · ${from?.name} → ${to?.name} · ${formatDateLong(trip.departure)} · ${formatTime(
          trip.departure,
        )} · QR ${ticket.qrToken}`,
      });
    } catch {
      // user cancelled
    }
  };

  const onCancel = () => {
    Alert.alert(
      'Annuler ce billet ?',
      'Le remboursement sera traité sous 48 h selon la politique de la compagnie.',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: () => {
            cancel(ticket.id);
          },
        },
      ],
    );
  };

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Ionicons
          name="chevron-back"
          size={26}
          color={theme.color.text}
          onPress={() => router.replace('/(tabs)/tickets')}
        />
        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
          <Ionicons name="share-outline" size={22} color={theme.color.text} onPress={onShare} />
          <Badge label="T-12" tone="neutral" />
        </View>
      </View>

      <View style={{ alignItems: 'center', gap: 6 }}>
        {ticket.status === 'cancelled' ? (
          <Badge label="Billet annulé" tone="danger" />
        ) : (
          <Badge label="Billet valide" tone="success" />
        )}
        <Text variant="caption" tone="secondary">
          {formatDateLong(trip.departure)}
        </Text>
      </View>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: company?.logoColor ?? theme.color.transit,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="bodyL" weight="bold" style={{ color: theme.color.textInverse }}>
              {company?.name.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyL" weight="semiBold">
              {company?.name}
            </Text>
            <Text variant="caption" tone="secondary">
              {PAYMENT_LABELS[ticket.method].label} · {formatMRU(ticket.totalPaid)} MRU
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 16, gap: 16, alignItems: 'center' }}>
          <View style={{ alignItems: 'center' }}>
            <Text variant="heading1" weight="bold">
              {formatTime(trip.departure)}
            </Text>
            <Text variant="caption" tone="secondary">
              {from?.name}
            </Text>
            <Text variant="caption" tone="secondary">
              {trip.fromStop}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ height: 2, alignSelf: 'stretch', backgroundColor: theme.color.border }} />
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text variant="heading1" weight="bold">
              {formatTime(trip.arrival)}
            </Text>
            <Text variant="caption" tone="secondary">
              {to?.name}
            </Text>
            <Text variant="caption" tone="secondary">
              {trip.toStop}
            </Text>
          </View>
        </View>
      </Card>

      <View style={{ alignItems: 'center', gap: 10, paddingVertical: 8 }}>
        <QrPlaceholder value={ticket.qrToken} size={240} foreground={theme.color.text} background={theme.color.bg} />
        <Text variant="caption" tone="secondary">
          {ticket.qrToken}
        </Text>
        <Text variant="caption" tone="secondary" align="center">
          À présenter au contrôleur · luminosité maximale recommandée
        </Text>
      </View>

      <Card variant="sand">
        <Text variant="caption" tone="secondary" style={{ textTransform: 'uppercase' }}>
          {ticket.passengers.length} passager{ticket.passengers.length > 1 ? 's' : ''}
        </Text>
        {ticket.passengers.map((p, idx) => (
          <View
            key={p.seatLabel}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingTop: 10,
              borderTopWidth: idx === 0 ? 0 : 1,
              borderTopColor: theme.color.divider,
              marginTop: idx === 0 ? 6 : 10,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: theme.color.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant="caption" weight="bold" style={{ color: theme.color.textInverse }}>
                {p.seatLabel}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyL" weight="semiBold">
                {p.name || `Passager ${idx + 1}`}
              </Text>
              <Text variant="caption" tone="secondary">
                {CATEGORY_LABELS[p.category].label} · {p.phone}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      {ticket.status !== 'cancelled' ? (
        <Button
          label="Annuler le billet"
          variant="ghost"
          fullWidth
          onPress={onCancel}
        />
      ) : null}
    </Screen>
  );
}
