import { useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Badge, Card, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { VEHICLES } from '@/lib/mocks/vehicles';
import { formatKm, formatMRU } from '@/lib/format';

type Event =
  | { kind: 'origin'; at: string; text: string }
  | { kind: 'import'; at: string; text: string }
  | { kind: 'service'; at: string; text: string; km?: number; cost?: number }
  | { kind: 'incident'; at: string; text: string }
  | { kind: 'inspection'; at: string; text: string; score: number }
  | { kind: 'owner'; at: string; text: string };

function buildHistory(vehicleId: string): Event[] {
  const v = VEHICLES.find((x) => x.id === vehicleId);
  if (!v) return [];
  const baseYear = v.year;
  const importYear = v.importYear ?? baseYear;
  const events: Event[] = [
    { kind: 'origin', at: `${baseYear}-03-15`, text: `Mise en circulation au Japon · ${v.brand} ${v.model}` },
    { kind: 'service', at: `${baseYear + 1}-04-12`, text: 'Révision constructeur (Toyota authorized)', km: 18000, cost: 32000 },
    { kind: 'service', at: `${baseYear + 2}-09-04`, text: 'Vidange + plaquettes', km: 45000, cost: 18500 },
    { kind: 'import', at: `${importYear}-02-08`, text: 'Importation et dédouanement Mauritanie' },
    { kind: 'owner', at: `${importYear}-02-22`, text: `1ère main en Mauritanie — ${v.sellerType === 'pro' ? 'Concessionnaire' : 'Particulier'}` },
    { kind: 'inspection', at: `${importYear}-03-10`, text: 'Contrôle technique mauritanien', score: 92 },
    { kind: 'service', at: `${importYear}-08-15`, text: 'Pneus 4 saisons', km: 88000, cost: 64000 },
  ];
  if (v.kargoVerified) {
    events.push({ kind: 'inspection', at: '2026-04-02', text: 'Inspection Kargo Verified (80 points)', score: 87 });
  }
  return events.sort((a, b) => (a.at < b.at ? 1 : -1));
}

const EVENT_META: Record<Event['kind'], { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  origin: { label: 'Origine', icon: 'flag', color: '#6366F1' },
  import: { label: 'Import', icon: 'airplane', color: '#0EA5E9' },
  service: { label: 'Entretien', icon: 'construct', color: '#10B981' },
  incident: { label: 'Incident', icon: 'warning', color: '#F87171' },
  inspection: { label: 'Inspection', icon: 'shield-checkmark', color: '#7C3AED' },
  owner: { label: 'Propriétaire', icon: 'person', color: '#F7B500' },
};

export default function VehiclePassport() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicle = useMemo(() => VEHICLES.find((v) => v.id === id), [id]);
  const history = useMemo(() => buildHistory(id ?? ''), [id]);

  if (!vehicle) {
    return (
      <Screen>
        <BackHeader title="Vehicle Passport" code="K-03" />
        <Text variant="bodyM" tone="secondary">
          Véhicule introuvable.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <BackHeader title="Vehicle Passport" code="K-03" />

      <Card>
        <Text variant="caption" tone="secondary">
          {vehicle.year} · {vehicle.fuel === 'petrol' ? 'Essence' : vehicle.fuel === 'diesel' ? 'Diesel' : vehicle.fuel}
        </Text>
        <Text variant="heading2">
          {vehicle.brand} {vehicle.model}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {vehicle.kargoVerified ? <Badge label="Kargo Verified" tone="primary" /> : null}
          {vehicle.vinVerified ? <Badge label="VIN vérifié" tone="success" /> : null}
          <Badge label={`${vehicle.ownersInCountry} main(s) en pays`} tone="neutral" />
        </View>
      </Card>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Identité véhicule
        </Text>
        <KV label="VIN" value={`KARG${vehicle.id.toUpperCase().slice(0, 13)}…`} />
        <KV label="Année modèle" value={String(vehicle.year)} />
        <KV label="Année d'import" value={vehicle.importYear ? String(vehicle.importYear) : '—'} />
        <KV label="Kilométrage actuel" value={formatKm(vehicle.km)} />
        <KV label="Prix annonce" value={`${formatMRU(vehicle.price)} MRU`} />
        <KV label="Ville" value={vehicle.city} />
      </Card>

      <Text variant="heading2">Historique chronologique</Text>
      <View style={{ gap: 0 }}>
        {history.map((e, i) => {
          const meta = EVENT_META[e.kind];
          const isLast = i === history.length - 1;
          return (
            <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ alignItems: 'center', width: 28 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: meta.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={meta.icon} size={14} color={theme.color.textInverse} />
                </View>
                {!isLast ? <View style={{ flex: 1, width: 2, backgroundColor: theme.color.divider, marginVertical: 4 }} /> : null}
              </View>
              <View style={{ flex: 1, paddingBottom: isLast ? 0 : 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Badge label={meta.label} tone="neutral" />
                  <Text variant="caption" tone="secondary">
                    {new Date(e.at).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <Text variant="bodyM" style={{ marginTop: 4 }}>
                  {e.text}
                </Text>
                {'km' in e && e.km ? (
                  <Text variant="caption" tone="secondary">
                    {formatKm(e.km)} {('cost' in e && e.cost) ? `· ${formatMRU(e.cost)} MRU` : ''}
                  </Text>
                ) : null}
                {'score' in e ? (
                  <Text variant="caption" tone="secondary">
                    Score : {e.score}/100
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      <Card variant="sand">
        <Text variant="caption" tone="secondary">
          Données issues du registre Kargo, des partenaires d'inspection et déclarations vendeur. Consultable par tout acheteur potentiel après accord du propriétaire.
        </Text>
      </Card>
    </Screen>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text variant="bodyM" tone="secondary">
        {label}
      </Text>
      <Text variant="bodyM" weight="semiBold">
        {value}
      </Text>
    </View>
  );
}
