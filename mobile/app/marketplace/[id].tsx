import { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, Screen, StickyCTA, Text } from '@/components/ui';
import { VehiclePhotoCarousel } from '@/components/VehiclePhotoCarousel';
import { useTheme } from '@/theme/ThemeProvider';
import { formatKm, formatMRU, formatRelativeDate } from '@/lib/format';
import { getVehicleById, isFreshlyImported } from '@/lib/mocks/vehicles';
import { useVehicle } from '@/lib/hooks/useListings';
import { listingsApi } from '@/lib/api';
import { useMessagingStore } from '@/lib/stores/messaging';

function formatHands(n: number): string {
  if (n === 0) return '0 main';
  if (n === 1) return '1 main';
  return `${n} mains`;
}

const VERDICT_COPY: Record<'deal' | 'fair' | 'high' | 'risk', { label: string; tone: 'success' | 'primary' | 'danger' | 'neutral' }> = {
  deal: { label: 'Bonne affaire', tone: 'success' },
  fair: { label: 'Prix cohérent', tone: 'primary' },
  high: { label: 'Prix élevé', tone: 'danger' },
  risk: { label: 'À vérifier', tone: 'neutral' },
};

const FUEL_LABEL = {
  petrol: 'Essence',
  diesel: 'Diesel',
  hybrid: 'Hybride',
  electric: 'Électrique',
} as const;

export default function VehicleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { data: vehicleApi } = useVehicle(id);
  const vehicle = vehicleApi ?? getVehicleById(id ?? '');

  // Track une vue quand l'écran s'ouvre avec un id. Best-effort (silent si offline).
  useEffect(() => {
    if (!id) return;
    listingsApi.trackView(id).catch(() => {});
  }, [id]);

  if (!vehicle) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Ionicons name="alert-circle" size={40} color={theme.color.textSecondary} />
          <Text variant="heading2">Annonce introuvable</Text>
          <Button label="Retour" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const verdict = VERDICT_COPY[vehicle.aiVerdict];

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll contentStyle={{ paddingBottom: 160 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={theme.color.text}
            onPress={() => router.back()}
          />
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <Ionicons name="share-outline" size={22} color={theme.color.text} />
            <Ionicons name="heart-outline" size={22} color={theme.color.text} />
          </View>
        </View>

        <VehiclePhotoCarousel
          photos={vehicle.photoUrls}
          totalCount={vehicle.photos}
          height={260}
          borderRadius={16}
        />

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {isFreshlyImported(vehicle) ? (
            <Badge label="Fraîchement dédouanée" tone="success" />
          ) : null}
          {vehicle.kargoVerified ? <Badge label="Kargo Verified" tone="gold" /> : null}
          {vehicle.vinVerified ? <Badge label="VIN vérifié" tone="success" /> : null}
          <Badge label={verdict.label} tone={verdict.tone} />
          {vehicle.sellerType === 'pro' ? <Badge label="Professionnel" tone="transit" /> : null}
        </View>

        <Text variant="heading1">
          {vehicle.brand} {vehicle.model} {vehicle.year}
        </Text>
        <Text variant="bodyM" tone="secondary">
          {vehicle.city}
          {vehicle.district ? ` · ${vehicle.district}` : ''} · {formatRelativeDate(vehicle.publishedAt)}
        </Text>
        <Text variant="displayL" style={{ color: theme.color.primary }}>
          {formatMRU(vehicle.price)} MRU
        </Text>

        {vehicle.aiEstimate ? (
          <Card style={{ backgroundColor: theme.color.surface }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Ionicons name="sparkles" size={18} color={theme.color.primary} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text variant="caption" tone="secondary">
                  Kargo Price Oracle
                </Text>
                <Text variant="bodyL" weight="semiBold">
                  Estimé entre {formatMRU(vehicle.aiEstimate.low)} et {formatMRU(vehicle.aiEstimate.high)} MRU
                </Text>
                <Text variant="bodyM" tone="secondary" style={{ marginTop: 4 }}>
                  Analyse comparative sur {VEHICLES_COUNT_HINT} annonces similaires de la région.
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Spécifications
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 10 }}>
            <Spec icon="calendar" label="Modèle" value={String(vehicle.year)} />
            {vehicle.importYear ? (
              <Spec icon="flag" label="Dédouanée" value={String(vehicle.importYear)} />
            ) : null}
            <Spec icon="people" label="Mains en MR" value={formatHands(vehicle.ownersInCountry)} />
            <Spec icon="speedometer" label="Km" value={formatKm(vehicle.km)} />
            <Spec icon="settings" label="Boîte" value={vehicle.transmission === 'auto' ? 'Auto' : 'Manuelle'} />
            <Spec icon="flash" label="Carburant" value={FUEL_LABEL[vehicle.fuel]} />
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Points forts
          </Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            {vehicle.highlights.map((h) => (
              <View key={h} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="checkmark-circle" size={16} color={theme.color.success} />
                <Text variant="bodyM">{h}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.color.bgElevated,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="person" size={20} color={theme.color.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyL" weight="semiBold">
                {vehicle.sellerName}
              </Text>
              <Text variant="caption" tone="secondary">
                {vehicle.sellerType === 'pro' ? 'Professionnel' : 'Particulier'}
                {vehicle.verified ? ' · Identité vérifiée' : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.color.textSecondary} />
          </View>
        </Card>

        <Button
          label="Historique véhicule"
          variant="secondary"
          fullWidth
          leading={<Ionicons name="document-text" size={16} color={theme.color.text} />}
          onPress={() => router.push(`/trust/vehicle/${vehicle.id}` as never)}
        />
        <Button
          label="Comparer avec d'autres"
          variant="ghost"
          fullWidth
          onPress={() => router.push('/marketplace/compare')}
        />
      </Screen>

      <StickyCTA>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button
            label="WhatsApp"
            variant="secondary"
            style={{ flex: 1 }}
            leading={<Ionicons name="logo-whatsapp" size={16} color={theme.color.text} />}
            onPress={() => {
              listingsApi.trackContact(vehicle.id).catch(() => {});
            }}
          />
          <Button
            label="Contacter"
            style={{ flex: 1.3 }}
            leading={<Ionicons name="chatbubble" size={16} color={theme.color.textInverse} />}
            onPress={async () => {
              listingsApi.trackContact(vehicle.id).catch(() => {});
              const threadId = await useMessagingStore
                .getState()
                .ensureThread({ kind: 'listing', vehicleId: vehicle.id });
              if (threadId) {
                router.push(`/chat/${threadId}` as never);
              } else {
                // Backend injoignable ou listing sans seller : fallback support.
                const supportId = await useMessagingStore
                  .getState()
                  .ensureThread({ kind: 'support' });
                if (supportId) router.push(`/chat/${supportId}` as never);
              }
            }}
          />
        </View>
      </StickyCTA>
    </View>
  );
}

const VEHICLES_COUNT_HINT = 124;

function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: '42%' }}>
      <Ionicons name={icon} size={18} color={theme.color.textSecondary} />
      <View>
        <Text variant="caption" tone="secondary">
          {label}
        </Text>
        <Text variant="bodyM" weight="semiBold">
          {value}
        </Text>
      </View>
    </View>
  );
}
