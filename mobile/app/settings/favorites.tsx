import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card, Screen, SegmentedTabs, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { VehicleCard } from '@/components/VehicleCard';
import { RentalCard } from '@/components/RentalCard';
import { TripCard } from '@/components/TripCard';
import { useTheme } from '@/theme/ThemeProvider';
import { useFavoritesStore } from '@/lib/stores/favorites';
import { useSavedSearchStore } from '@/lib/stores/saved-searches';
import { VEHICLES } from '@/lib/mocks/vehicles';
import { RENTALS } from '@/lib/mocks/rentals';
import { TRIPS } from '@/lib/mocks/transit';

type Tab = 'vehicles' | 'rentals' | 'trips' | 'searches';

export default function Favorites() {
  const router = useRouter();
  const theme = useTheme();
  const [tab, setTab] = useState<Tab>('vehicles');
  const fav = useFavoritesStore();
  const saved = useSavedSearchStore((s) => s.searches);

  const vehicles = useMemo(
    () => VEHICLES.filter((v) => fav.vehicles.includes(v.id)),
    [fav.vehicles],
  );
  const rentals = useMemo(
    () => RENTALS.filter((r) => fav.rentals.includes(r.id)),
    [fav.rentals],
  );
  const trips = useMemo(
    () => TRIPS.filter((t) => fav.trips.includes(t.id)),
    [fav.trips],
  );

  return (
    <Screen scroll>
      <BackHeader title="Mes favoris" code="P-02" />
      <SegmentedTabs
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        items={[
          { key: 'vehicles', label: `Véhicules (${vehicles.length})` },
          { key: 'rentals', label: `Locations (${rentals.length})` },
          { key: 'trips', label: `Trajets (${trips.length})` },
          { key: 'searches', label: `Recherches (${saved.length})` },
        ]}
      />

      {tab === 'vehicles' && (
        <View style={{ gap: 12 }}>
          {vehicles.length === 0 ? (
            <EmptyState icon="heart-outline" text="Aucun véhicule favori." />
          ) : (
            vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} layout="full" />)
          )}
        </View>
      )}

      {tab === 'rentals' && (
        <View style={{ gap: 12 }}>
          {rentals.length === 0 ? (
            <EmptyState icon="heart-outline" text="Aucune location favorite." />
          ) : (
            rentals.map((r) => <RentalCard key={r.id} rental={r} />)
          )}
        </View>
      )}

      {tab === 'trips' && (
        <View style={{ gap: 12 }}>
          {trips.length === 0 ? (
            <EmptyState icon="heart-outline" text="Aucun trajet favori." />
          ) : (
            trips.map((t) => <TripCard key={t.id} trip={t} />)
          )}
        </View>
      )}

      {tab === 'searches' && (
        <View style={{ gap: 8 }}>
          {saved.length === 0 ? (
            <EmptyState icon="bookmark-outline" text="Aucune recherche enregistrée." />
          ) : (
            saved.map((s) => (
              <Card
                key={s.id}
                padding={14}
                onPress={() => router.push('/marketplace/results')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Ionicons name="car" size={20} color={theme.color.textSecondary} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyM" weight="semiBold">
                      {s.name}
                    </Text>
                    <Text variant="caption" tone="secondary">
                      {s.lastMatchCount} annonces · alertes {s.notifyEnabled ? 'activées' : 'désactivées'}
                      {s.newMatchesSinceLastView > 0 ? ` · +${s.newMatchesSinceLastView} nouvelles` : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.color.textSecondary} />
                </View>
              </Card>
            ))
          )}
        </View>
      )}
    </Screen>
  );
}

function EmptyState({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const theme = useTheme();
  return (
    <Card variant="sand">
      <View style={{ alignItems: 'center', gap: 8, paddingVertical: 24 }}>
        <Ionicons name={icon} size={36} color={theme.color.textSecondary} />
        <Text variant="bodyM" tone="secondary">
          {text}
        </Text>
      </View>
    </Card>
  );
}
