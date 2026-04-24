import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Card, Text } from '@/components/ui';
import { VehiclePhotoCarousel } from '@/components/VehiclePhotoCarousel';
import { useTheme } from '@/theme/ThemeProvider';
import { formatMRU } from '@/lib/format';
import { RENTAL_CATEGORY_LABEL, type RentalListing } from '@/lib/mocks/rentals';

export function RentalCard({ rental }: { rental: RentalListing }) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Card padding={0} style={{ overflow: 'hidden' }} onPress={() => router.push(`/rental/${rental.id}` as never)}>
      <VehiclePhotoCarousel
        photos={rental.photoUrls}
        totalCount={rental.photos}
        height={180}
        borderRadius={0}
      />
      <View style={{ padding: 16, gap: 6 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ flex: 1 }}>
            <Text variant="bodyL" weight="bold" numberOfLines={1}>
              {rental.brand} {rental.model}
            </Text>
            <Text variant="caption" tone="secondary">
              {RENTAL_CATEGORY_LABEL[rental.category]} · {rental.year}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="heading2" weight="bold" style={{ color: theme.color.primary }}>
              {formatMRU(rental.pricePerDay)}
            </Text>
            <Text variant="caption" tone="secondary">
              MRU / jour
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
          <IconRow icon="people" label={`${rental.seats} places`} />
          <IconRow icon="settings" label={rental.transmission === 'auto' ? 'Auto' : 'Manuelle'} />
          {rental.airCon ? <IconRow icon="snow" label="Clim." /> : null}
          {rental.chauffeurAvailable ? <IconRow icon="person" label="Chauffeur" /> : null}
          <IconRow icon="speedometer" label={`${rental.kmIncludedPerDay} km/j`} />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="star" size={14} color="#F5A524" />
            <Text variant="caption" weight="semiBold">
              {rental.rating.toFixed(1)}
            </Text>
            <Text variant="caption" tone="secondary">
              ({rental.reviewsCount})
            </Text>
            <Text variant="caption" tone="secondary">
              · {rental.agency}
            </Text>
          </View>
          {rental.verified ? <Badge label="Vérifié" tone="gold" /> : null}
        </View>
      </View>
    </Card>
  );
}

function IconRow({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={14} color={theme.color.textSecondary} />
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </View>
  );
}
