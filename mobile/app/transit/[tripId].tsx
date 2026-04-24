import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Badge, Button, Card, Screen, StickyCTA, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { formatMRU } from '@/lib/format';
import { formatDateLong, formatDuration, formatTime } from '@/lib/time';
import {
  BUS_SIZE_ICON,
  BUS_SIZE_LABEL,
  BUS_SIZE_SEATS,
  getCity,
  getCompany,
  getTrip,
} from '@/lib/mocks/transit';
import { useBookingStore } from '@/lib/stores/booking';

export default function TripDetail() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const theme = useTheme();
  const router = useRouter();
  const startBooking = useBookingStore((s) => s.start);
  const trip = getTrip(tripId ?? '');

  if (!trip) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Ionicons name="alert-circle" size={40} color={theme.color.textSecondary} />
          <Text variant="heading2">Trajet introuvable</Text>
          <Button label="Retour" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const company = getCompany(trip.companyId);
  const from = getCity(trip.fromCityId);
  const to = getCity(trip.toCityId);

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll contentStyle={{ paddingBottom: 140 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={theme.color.text}
            onPress={() => router.back()}
          />
          <Badge label="T-07" tone="neutral" />
        </View>

        <Card>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: company?.logoColor ?? theme.color.transit,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant="bodyL" weight="bold" style={{ color: theme.color.textInverse }}>
                {company?.name.slice(0, 2).toUpperCase() ?? '??'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyL" weight="semiBold">
                {company?.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="star" size={12} color={theme.color.accent} />
                <Text variant="caption" tone="secondary">
                  {company?.rating.toFixed(1)} · {company?.reviews} avis
                </Text>
              </View>
            </View>
            {trip.direct ? <Badge label="Direct" tone="success" /> : null}
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            {formatDateLong(trip.departure)}
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 12, gap: 16 }}>
            <View style={{ alignItems: 'center', paddingTop: 4, gap: 6 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  borderWidth: 3,
                  borderColor: theme.color.transit,
                }}
              />
              <View
                style={{ width: 2, flex: 1, backgroundColor: theme.color.transit, opacity: 0.3 }}
              />
              <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: theme.color.transit }} />
            </View>
            <View style={{ flex: 1, gap: 24 }}>
              <View>
                <Text variant="heading2" weight="bold">
                  {formatTime(trip.departure)} · {from?.name}
                </Text>
                <Text variant="bodyM" tone="secondary">
                  {trip.fromStop}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="time" size={14} color={theme.color.textSecondary} />
                <Text variant="caption" tone="secondary">
                  {formatDuration(trip.durationMin)}
                  {trip.distanceKm ? ` · ${trip.distanceKm} km` : ''}
                </Text>
              </View>
              <View>
                <Text variant="heading2" weight="bold">
                  {formatTime(trip.arrival)} · {to?.name}
                </Text>
                <Text variant="bodyM" tone="secondary">
                  {trip.toStop}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: theme.color.bgElevated,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name={BUS_SIZE_ICON[trip.busSize] as React.ComponentProps<typeof Ionicons>['name']}
                size={24}
                color={theme.color.text}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyL" weight="bold">
                {BUS_SIZE_LABEL[trip.busSize]}
              </Text>
              <Text variant="caption" tone="secondary">
                {BUS_SIZE_SEATS[trip.busSize]} · {trip.seatsTotal} sièges total
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text variant="caption" tone="secondary">
            Services à bord
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {trip.amenities.map((a) => (
              <View
                key={a}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.color.bgElevated,
                }}
              >
                <Ionicons name="checkmark" size={12} color={theme.color.success} />
                <Text variant="caption" weight="semiBold">
                  {a}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text variant="caption" tone="secondary">
            Conditions
          </Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            <InfoRow
              icon={trip.cancelable ? 'checkmark-circle' : 'close-circle'}
              iconColor={trip.cancelable ? theme.color.success : theme.color.danger}
              text={
                trip.cancelable
                  ? 'Annulation gratuite jusqu\'à 2 h avant le départ'
                  : 'Non annulable / non remboursable'
              }
            />
            <InfoRow
              icon="people"
              iconColor={theme.color.textSecondary}
              text={`${trip.seatsLeft} places restantes sur ${trip.seatsTotal}`}
            />
            <InfoRow
              icon="shield-checkmark"
              iconColor={theme.color.textSecondary}
              text="Billet e-QR avec vérification à l'embarquement"
            />
          </View>
        </Card>

        <View
          style={{
            height: 140,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.color.bgElevated,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Ionicons name="map" size={32} color={theme.color.textSecondary} />
          <Text variant="caption" tone="secondary">
            Carte du trajet · bientôt
          </Text>
        </View>
      </Screen>

      <StickyCTA>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="caption" tone="secondary">
              Prix par passager
            </Text>
            <Text variant="heading2" weight="bold" style={{ color: theme.color.primary }}>
              {formatMRU(trip.price)} MRU
            </Text>
          </View>
          <Button
            label="Choisir ma place"
            style={{ flex: 1.3 }}
            leading={<Ionicons name="arrow-forward" size={16} color={theme.color.textInverse} />}
            onPress={() => {
              startBooking(trip.id);
              router.push('/transit/seat');
            }}
          />
        </View>
      </StickyCTA>
    </View>
  );
}

function InfoRow({
  icon,
  iconColor,
  text,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  text: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Ionicons name={icon} size={16} color={iconColor} />
      <Text variant="bodyM" style={{ flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}
