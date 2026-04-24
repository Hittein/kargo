import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, Input, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useTrustStore, type InspectionRequest } from '@/lib/stores/trust';
import { CITIES } from '@/lib/mocks/transit';
import { formatMRU } from '@/lib/format';

const PRICE = 15000;
const TIMES = ['09:00', '11:00', '14:00', '16:00'];

export default function TrustInspection() {
  const theme = useTheme();
  const inspections = useTrustStore((s) => s.inspections);
  const request = useTrustStore((s) => s.requestInspection);

  const [vehicleId, setVehicleId] = useState('');
  const [city, setCity] = useState(CITIES[0].name);
  const [time, setTime] = useState(TIMES[0]);
  const [date, setDate] = useState(toShortDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 2)));

  const submit = () => {
    if (!vehicleId.trim()) {
      Alert.alert('Identifiant requis', 'Saisissez la plaque ou le VIN du véhicule.');
      return;
    }
    request({
      vehicleId: vehicleId.trim(),
      city,
      preferredAt: `${date} ${time}`,
    });
    Alert.alert('Demande envoyée', 'Nous vous proposerons un créneau sous 24h.');
    setVehicleId('');
  };

  return (
    <Screen scroll>
      <BackHeader title="Inspection Kargo Verified" code="K-04" />

      <Card variant="sand">
        <Text variant="bodyM">
          Notre inspection en 80 points vérifie carrosserie, mécanique, électronique, intérieur et historique. Rapport PDF + badge sur l'annonce.
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Badge label="80 points" tone="primary" />
          <Badge label={`${formatMRU(PRICE)} MRU`} tone="gold" />
          <Badge label="2-3 h" tone="neutral" />
        </View>
      </Card>

      <Card>
        <Input
          label="Plaque ou VIN du véhicule"
          value={vehicleId}
          onChangeText={setVehicleId}
          placeholder="2345 NKT 11 ou KARG…"
          autoCapitalize="characters"
        />
        <Text variant="caption" tone="secondary" style={{ marginTop: 12, marginBottom: 6 }}>
          Centre Kargo Verified
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {CITIES.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setCity(c.name)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: theme.radius.pill,
                backgroundColor: city === c.name ? theme.color.primary : theme.color.bgElevated,
              }}
            >
              <Text variant="caption" weight="semiBold" style={{ color: city === c.name ? theme.color.textInverse : theme.color.text }}>
                {c.name}
              </Text>
            </Pressable>
          ))}
        </View>
        <Input label="Date souhaitée" value={date} onChangeText={setDate} placeholder="2026-04-30" containerStyle={{ marginTop: 12 }} />
        <Text variant="caption" tone="secondary" style={{ marginTop: 12, marginBottom: 6 }}>
          Créneau
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {TIMES.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTime(t)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: theme.radius.lg,
                backgroundColor: time === t ? theme.color.primary : theme.color.bgElevated,
                alignItems: 'center',
              }}
            >
              <Text variant="bodyM" weight="semiBold" style={{ color: time === t ? theme.color.textInverse : theme.color.text }}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
        <Button label={`Demander · ${formatMRU(PRICE)} MRU`} onPress={submit} style={{ marginTop: 16 }} />
      </Card>

      <Text variant="heading2">Mes demandes</Text>
      {inspections.length === 0 ? (
        <Card variant="sand">
          <Text variant="bodyM" tone="secondary" align="center">
            Aucune demande en cours.
          </Text>
        </Card>
      ) : (
        inspections.map((i) => <InspectionCard key={i.id} inspection={i} />)
      )}
    </Screen>
  );
}

function InspectionCard({ inspection }: { inspection: InspectionRequest }) {
  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text variant="bodyM" weight="semiBold">
            {inspection.vehicleId}
          </Text>
          <Text variant="caption" tone="secondary">
            {inspection.city} · {inspection.preferredAt}
          </Text>
          {inspection.scheduledAt ? (
            <Text variant="caption" tone="secondary">
              Confirmé : {new Date(inspection.scheduledAt).toLocaleString('fr-FR')}
            </Text>
          ) : null}
        </View>
        <Badge
          label={inspection.status === 'requested' ? 'Demandée' : inspection.status === 'scheduled' ? 'Programmée' : 'Effectuée'}
          tone={inspection.status === 'completed' ? 'success' : 'gold'}
        />
      </View>
    </Card>
  );
}

function toShortDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
