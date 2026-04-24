import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Card, Text } from '@/components/ui';
import { VehiclePhotoCarousel } from '@/components/VehiclePhotoCarousel';
import { useTheme } from '@/theme/ThemeProvider';
import { formatKm, formatMRU, formatRelativeDate } from '@/lib/format';
import { isFreshlyImported, type Vehicle } from '@/lib/mocks/vehicles';
import { useCompareStore } from '@/lib/stores/compare';

function formatHands(n: number): string {
  if (n === 0) return '0 main';
  if (n === 1) return '1 main';
  return `${n} mains`;
}

export type VehicleCardProps = {
  vehicle: Vehicle;
  layout?: 'grid' | 'row' | 'full';
  onPress?: () => void;
};

export function VehicleCard({ vehicle, layout = 'full', onPress }: VehicleCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const [favorite, setFavorite] = useState(false);
  const inCompare = useCompareStore((s) => s.ids.includes(vehicle.id));
  const toggleCompare = useCompareStore((s) => s.toggle);
  const handlePress = onPress ?? (() => router.push(`/marketplace/${vehicle.id}` as never));

  const handleCompare = () => {
    const res = toggleCompare(vehicle.id);
    if (res.rejected === 'full') {
      Alert.alert(
        'Limite atteinte',
        'Vous ne pouvez comparer que 3 voitures à la fois. Retirez-en une pour ajouter celle-ci.',
      );
    }
  };

  if (layout === 'grid') {
    return (
      <Card padding={0} style={{ flex: 1, overflow: 'hidden' }}>
        <VehiclePhotoCarousel
          photos={vehicle.photoUrls}
          totalCount={vehicle.photos}
          height={140}
          borderRadius={0}
          onPress={handlePress}
        />
        <Pressable onPress={handlePress} style={{ padding: 12, gap: 2 }}>
          <Text variant="bodyM" weight="bold" style={{ color: theme.color.primary }}>
            {formatMRU(vehicle.price)} MRU
          </Text>
          <Text variant="bodyM" weight="semiBold" numberOfLines={1}>
            {vehicle.brand} {vehicle.model}
          </Text>
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {vehicle.year} · {formatKm(vehicle.km)}
          </Text>
        </Pressable>
      </Card>
    );
  }

  if (layout === 'row') {
    return (
      <Card>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 112, height: 88 }}>
            <VehiclePhotoCarousel
              photos={vehicle.photoUrls}
              totalCount={vehicle.photos}
              height={88}
              borderRadius={12}
              onPress={handlePress}
            />
          </View>
          <Pressable onPress={handlePress} style={{ flex: 1, justifyContent: 'space-between' }}>
            <View style={{ gap: 2 }}>
              <Text variant="bodyL" weight="semiBold" numberOfLines={1}>
                {vehicle.brand} {vehicle.model}
              </Text>
              <Text variant="caption" tone="secondary" numberOfLines={1}>
                {vehicle.year} · {formatKm(vehicle.km)} · {vehicle.city}
              </Text>
              <Text variant="bodyL" weight="bold" style={{ color: theme.color.primary }}>
                {formatMRU(vehicle.price)} MRU
              </Text>
            </View>
          </Pressable>
        </View>
      </Card>
    );
  }

  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <View>
        <VehiclePhotoCarousel
          photos={vehicle.photoUrls}
          totalCount={vehicle.photos}
          height={220}
          borderRadius={0}
          onPress={handlePress}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            flexDirection: 'row',
            gap: 6,
          }}
        >
          {vehicle.premium ? (
            <View
              style={{
                backgroundColor: '#F5A524',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text variant="caption" weight="bold" style={{ color: '#fff', letterSpacing: 0.4 }}>
                PREMIUM
              </Text>
            </View>
          ) : null}
          {isFreshlyImported(vehicle) ? (
            <View
              style={{
                backgroundColor: '#16A34A',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Ionicons name="sparkles" size={12} color="#fff" />
              <Text variant="caption" weight="bold" style={{ color: '#fff', letterSpacing: 0.3 }}>
                FRAÎCHEMENT DÉDOUANÉE
              </Text>
            </View>
          ) : null}
        </View>
        <View
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <CircleIconButton
            name="git-compare-outline"
            color={inCompare ? theme.color.primary : '#fff'}
            background={inCompare ? '#fff' : undefined}
            onPress={handleCompare}
          />
          <CircleIconButton name="share-social-outline" onPress={() => {}} />
          <CircleIconButton
            name={favorite ? 'heart' : 'heart-outline'}
            color={favorite ? '#E11D48' : '#fff'}
            onPress={() => setFavorite((v) => !v)}
          />
        </View>
      </View>

      <Pressable onPress={handlePress} style={{ padding: 16, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="heading2" weight="bold" style={{ color: theme.color.primary }}>
            {formatMRU(vehicle.price)} MRU
          </Text>
          <Text variant="caption" tone="secondary">
            {formatRelativeDate(vehicle.publishedAt)}
          </Text>
        </View>

        <Text variant="bodyL" weight="semiBold" numberOfLines={1}>
          {vehicle.brand} · {vehicle.model} · {vehicle.year}
        </Text>

        {vehicle.highlights[0] ? (
          <Text variant="bodyM" tone="secondary" numberOfLines={1}>
            {vehicle.highlights.join(' — ')}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 2, flexWrap: 'wrap' }}>
          <Text variant="caption" tone="secondary">
            <Text variant="caption" weight="semiBold">Modèle: </Text>
            {vehicle.year}
          </Text>
          {vehicle.importYear ? (
            <Text variant="caption" tone="secondary">
              <Text variant="caption" weight="semiBold">Dédouanée: </Text>
              {vehicle.importYear}
            </Text>
          ) : null}
          <Text variant="caption" tone="secondary">
            <Text variant="caption" weight="semiBold">Km: </Text>
            {formatKm(vehicle.km)}
          </Text>
          <Text variant="caption" tone="secondary">
            <Text variant="caption" weight="semiBold">{formatHands(vehicle.ownersInCountry)}</Text>
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <Ionicons name="location-outline" size={14} color={theme.color.textSecondary} />
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {vehicle.district ? `${vehicle.district}, ${vehicle.city}` : vehicle.city}
          </Text>
        </View>

        {(vehicle.kargoVerified || vehicle.aiVerdict === 'deal' || vehicle.sellerType === 'pro') ? (
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            {vehicle.kargoVerified ? <Badge label="Kargo Verified" tone="gold" /> : null}
            {vehicle.aiVerdict === 'deal' ? <Badge label="Bonne affaire" tone="success" /> : null}
            {vehicle.aiVerdict === 'high' ? <Badge label="Prix élevé" tone="danger" /> : null}
            {vehicle.sellerType === 'pro' ? <Badge label="Pro" tone="transit" /> : null}
          </View>
        ) : null}
      </Pressable>
    </Card>
  );
}

function CircleIconButton({
  name,
  color = '#fff',
  background,
  onPress,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color?: string;
  background?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: background ?? 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Ionicons name={name} size={18} color={color} />
    </Pressable>
  );
}
