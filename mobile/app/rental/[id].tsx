import { useEffect } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Badge, Button, Card, Screen, StickyCTA, Text } from '@/components/ui';
import { VehiclePhotoCarousel } from '@/components/VehiclePhotoCarousel';
import { useTheme } from '@/theme/ThemeProvider';
import { formatMRU } from '@/lib/format';
import { getRentalById, RENTAL_CATEGORY_LABEL } from '@/lib/mocks/rentals';
import { useRental } from '@/lib/hooks/useRentals';
import { useRentalStore } from '@/lib/stores/rental';

function daysBetween(startISO?: string, endISO?: string): number {
  if (!startISO || !endISO) return 1;
  const a = new Date(startISO);
  const b = new Date(endISO);
  return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function RentalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { data: apiRental } = useRental(id);
  const rental = apiRental ?? getRentalById(id ?? '');
  const { search, setQuote } = useRentalStore();

  const days = daysBetween(search.startDate, search.endDate);

  useEffect(() => {
    if (!rental) return;
    setQuote({
      listingId: rental.id,
      basePerDay: rental.pricePerDay,
      days,
      selectedOptions: [],
      optionsPerDay: 0,
      withChauffeur: false,
      chauffeurPerDay: 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rental?.id, days]);

  if (!rental) {
    return (
      <Screen>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Ionicons name="alert-circle" size={40} color={theme.color.textSecondary} />
          <Text variant="heading2">Location introuvable</Text>
          <Button label="Retour" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const totalBase = rental.pricePerDay * days;

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll contentStyle={{ paddingBottom: 160 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={theme.color.text}
            onPress={() => router.back()}
          />
          <Badge label="L-04" tone="primary" />
        </View>

        <VehiclePhotoCarousel
          photos={rental.photoUrls}
          totalCount={rental.photos}
          height={240}
          borderRadius={16}
        />

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Badge label={RENTAL_CATEGORY_LABEL[rental.category]} tone="primary" />
          {rental.verified ? <Badge label="Agence vérifiée" tone="gold" /> : null}
          {rental.chauffeurAvailable ? <Badge label="Chauffeur dispo" tone="transit" /> : null}
        </View>

        <Text variant="heading1">
          {rental.brand} {rental.model} {rental.year}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="star" size={16} color="#F5A524" />
          <Text variant="bodyM" weight="semiBold">
            {rental.rating.toFixed(1)}
          </Text>
          <Text variant="bodyM" tone="secondary">
            · {rental.reviewsCount} avis · {rental.agency}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text variant="displayL" style={{ color: theme.color.primary }}>
            {formatMRU(rental.pricePerDay)}
          </Text>
          <Text variant="bodyL" tone="secondary">
            MRU / jour
          </Text>
        </View>

        {rental.priceWeekly || rental.priceMonthly ? (
          <Card variant="sand">
            <Text variant="caption" tone="secondary">
              Tarifs longue durée
            </Text>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
              {rental.priceWeekly ? (
                <View>
                  <Text variant="bodyL" weight="bold">
                    {formatMRU(rental.priceWeekly)} MRU
                  </Text>
                  <Text variant="caption" tone="secondary">
                    / semaine
                  </Text>
                </View>
              ) : null}
              {rental.priceMonthly ? (
                <View>
                  <Text variant="bodyL" weight="bold">
                    {formatMRU(rental.priceMonthly)} MRU
                  </Text>
                  <Text variant="caption" tone="secondary">
                    / mois
                  </Text>
                </View>
              ) : null}
            </View>
          </Card>
        ) : null}

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Spécifications
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 10 }}>
            <Spec icon="people" label="Places" value={String(rental.seats)} />
            <Spec
              icon="settings"
              label="Boîte"
              value={rental.transmission === 'auto' ? 'Auto' : 'Manuelle'}
            />
            <Spec icon="snow" label="Clim." value={rental.airCon ? 'Oui' : 'Non'} />
            <Spec icon="speedometer" label="Km inclus" value={`${rental.kmIncludedPerDay}/j`} />
            <Spec icon="add-circle" label="Km extra" value={`${rental.extraKmMRU} MRU`} />
            <Spec
              icon="wallet"
              label="Caution"
              value={`${formatMRU(rental.depositMRU)} MRU`}
            />
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Équipements
          </Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            {rental.equipment.map((e) => (
              <View key={e} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="checkmark-circle" size={16} color={theme.color.success} />
                <Text variant="bodyM">{e}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Conditions
          </Text>
          <View style={{ gap: 6, marginTop: 10 }}>
            <Text variant="bodyM">
              • Durée minimum : {rental.minDays} jour{rental.minDays > 1 ? 's' : ''}
            </Text>
            <Text variant="bodyM">
              • Retrait : {rental.cities.join(', ')}
            </Text>
            <Text variant="bodyM">
              • Permis de conduire valide + pièce d'identité
            </Text>
            <Text variant="bodyM">
              • Caution bloquée {formatMRU(rental.depositMRU)} MRU
            </Text>
          </View>
        </Card>

        {days > 0 ? (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text variant="caption" tone="secondary">
                  Estimation pour {days} jour{days > 1 ? 's' : ''}
                </Text>
                <Text variant="heading2" style={{ color: theme.color.primary, marginTop: 4 }}>
                  {formatMRU(totalBase)} MRU
                </Text>
              </View>
              <Ionicons
                name="calculator"
                size={28}
                color={theme.color.primary}
                style={{ alignSelf: 'center' }}
              />
            </View>
          </Card>
        ) : null}
      </Screen>

      <StickyCTA>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button
            label="Options"
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => router.push('/rental/options')}
            leading={<Ionicons name="add-circle" size={16} color={theme.color.text} />}
          />
          <Button
            label="Réserver"
            style={{ flex: 1.4 }}
            onPress={() => router.push('/rental/options')}
          />
        </View>
      </StickyCTA>
    </View>
  );
}

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
