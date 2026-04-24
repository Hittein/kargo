import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Badge, Card, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { TRIPS, CITIES, getCity, getCompany } from '@/lib/mocks/transit';
import { formatTime } from '@/lib/time';

export default function TransitTracking() {
  const theme = useTheme();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const trip = useMemo(() => TRIPS.find((t) => t.id === tripId) ?? TRIPS[0], [tripId]);
  const company = getCompany(trip.companyId);
  const from = getCity(trip.fromCityId);
  const to = getCity(trip.toCityId);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const progress = Math.min(1, (tick % 20) / 20);
  const etaMin = Math.round(trip.durationMin * (1 - progress));
  const delayMin = progress > 0.3 ? 5 : 0;
  const status = progress < 0.05 ? 'Départ imminent' : progress >= 1 ? 'Arrivé' : 'En route';

  const stops = [from?.name ?? '—', trip.fromStop, 'Boutilimit', 'Aleg', 'Rosso', trip.toStop, to?.name ?? '—'];
  const currentStop = Math.min(stops.length - 1, Math.floor(progress * (stops.length - 1)));

  return (
    <Screen scroll>
      <BackHeader title="Suivi GPS" code="T-15" />

      <Card style={{ backgroundColor: theme.color.transit ?? '#0EA5E9', padding: 20 }}>
        <Text variant="caption" style={{ color: theme.color.textInverse, opacity: 0.85 }}>
          {company?.name ?? 'Compagnie'} · Trajet {trip.id.toUpperCase()}
        </Text>
        <Text variant="heading2" style={{ color: theme.color.textInverse, marginTop: 4 }}>
          {from?.name} → {to?.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <Badge label={status} tone="neutral" />
          {delayMin > 0 ? <Badge label={`+${delayMin} min de retard`} tone="gold" /> : null}
        </View>
      </Card>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Position en temps réel
        </Text>
        <View
          style={{
            height: 160,
            backgroundColor: theme.color.bgElevated,
            borderRadius: theme.radius.lg,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute',
              left: 20,
              right: 20,
              top: 80,
              height: 4,
              borderRadius: 2,
              backgroundColor: theme.color.divider,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: 20,
              top: 80,
              height: 4,
              width: `${progress * 80}%`,
              backgroundColor: theme.color.primary,
              borderRadius: 2,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: `${10 + progress * 80}%`,
              top: 60,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.color.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="bus" size={20} color={theme.color.textInverse} />
          </View>
          <Text variant="caption" tone="secondary" style={{ position: 'absolute', top: 16 }}>
            Carte temps réel (simulation)
          </Text>
        </View>
      </Card>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          ETA & distance
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <InfoTile label="ETA restante" value={`${etaMin} min`} />
          <InfoTile label="Arrivée" value={formatTime(new Date(Date.now() + etaMin * 60000).toISOString())} />
          <InfoTile label="Distance" value={`${Math.round((trip.distanceKm ?? 0) * (1 - progress))} km`} />
        </View>
      </Card>

      <Text variant="heading2">Prochains arrêts</Text>
      <Card>
        {stops.map((s, i) => {
          const done = i < currentStop;
          const current = i === currentStop;
          return (
            <View key={s} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 6 }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: current ? theme.color.primary : done ? theme.color.success : theme.color.bgElevated,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: current ? 3 : 0,
                  borderColor: current ? '#fff' : 'transparent',
                }}
              >
                {done ? <Ionicons name="checkmark" size={12} color={theme.color.textInverse} /> : null}
              </View>
              <Text variant="bodyM" weight={current ? 'bold' : 'regular'} style={{ flex: 1 }}>
                {s}
              </Text>
              {current ? <Badge label="En approche" tone="primary" /> : null}
            </View>
          );
        })}
      </Card>

      <Card variant="sand">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="notifications" size={16} color={theme.color.textSecondary} />
          <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
            Notifications activées : départ, 10 min avant arrêt, retard supérieur à 10 min, arrivée.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        backgroundColor: theme.color.bgElevated,
        borderRadius: theme.radius.lg,
      }}
    >
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
      <Text variant="bodyL" weight="bold">
        {value}
      </Text>
    </View>
  );
}
