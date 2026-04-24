import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, StickyCTA, Text } from '@/components/ui';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { getRentalById } from '@/lib/mocks/rentals';
import { quoteTotal, useRentalStore } from '@/lib/stores/rental';
import { formatMRU } from '@/lib/format';

type PhotoSide = 'front' | 'back' | 'left' | 'right' | 'interior' | 'odometer';

const SIDES: { key: PhotoSide; label: string; icon: string }[] = [
  { key: 'front', label: 'Avant', icon: 'car-sport' },
  { key: 'back', label: 'Arrière', icon: 'car-sport' },
  { key: 'left', label: 'Côté gauche', icon: 'car-sport' },
  { key: 'right', label: 'Côté droit', icon: 'car-sport' },
  { key: 'interior', label: 'Intérieur', icon: 'grid' },
  { key: 'odometer', label: 'Compteur', icon: 'speedometer' },
];

export default function RentalContract() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { quote, search, reset } = useRentalStore();
  const rental = quote.listingId ? getRentalById(quote.listingId) : undefined;

  const [signed, setSigned] = useState(false);
  const [photos, setPhotos] = useState<Record<PhotoSide, boolean>>({
    front: false,
    back: false,
    left: false,
    right: false,
    interior: false,
    odometer: false,
  });

  const photosCount = Object.values(photos).filter(Boolean).length;
  const canFinish = signed && photosCount === 6;
  const total = quoteTotal(quote);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <Text variant="heading2" weight="bold" style={{ flex: 1 }}>
          Contrat & état des lieux
        </Text>
        <Badge label="L-08" tone="primary" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 180 }}>
        <Card variant="soft">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.color.success,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="lock-closed" size={20} color={theme.color.textInverse} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyL" weight="bold">
                Paiement sécurisé
              </Text>
              <Text variant="caption" tone="secondary">
                {formatMRU(total)} MRU bloqués · libération au retour
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text variant="caption" tone="secondary">
            Contrat digital
          </Text>
          <Text variant="bodyL" weight="bold" style={{ marginTop: 4 }}>
            {rental ? `${rental.brand} ${rental.model} ${rental.year}` : '—'}
          </Text>
          <Text variant="bodyM" tone="secondary" style={{ marginTop: 6 }}>
            {search.startDate} → {search.endDate} · {search.city}
          </Text>
          <Text variant="bodyM" tone="secondary">
            Agence : {rental?.agency ?? '—'}
          </Text>

          <Pressable
            onPress={() => setSigned((s) => !s)}
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 12,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: signed ? theme.color.success : theme.color.border,
              alignItems: 'center',
              gap: 6,
              backgroundColor: signed ? '#E8F7EE' : 'transparent',
            }}
          >
            <Ionicons
              name={signed ? 'checkmark-circle' : 'create'}
              size={28}
              color={signed ? theme.color.success : theme.color.textSecondary}
            />
            <Text variant="bodyM" weight="semiBold">
              {signed ? 'Signé · 23/04/2026' : 'Appuyez pour signer'}
            </Text>
          </Pressable>
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="bodyL" weight="bold">
              État des lieux — départ
            </Text>
            <Badge label={`${photosCount}/6`} tone={photosCount === 6 ? 'success' : 'neutral'} />
          </View>
          <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>
            Photos horodatées, stockées de manière tamper-proof.
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 14,
            }}
          >
            {SIDES.map((s) => {
              const taken = photos[s.key];
              return (
                <Pressable
                  key={s.key}
                  onPress={() => setPhotos((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
                  style={{
                    width: '31%',
                    aspectRatio: 1,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: taken ? theme.color.primary : theme.color.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: taken ? theme.color.primarySoft : 'transparent',
                    gap: 6,
                  }}
                >
                  <Ionicons
                    name={taken ? 'checkmark-circle' : (s.icon as React.ComponentProps<typeof Ionicons>['name'])}
                    size={22}
                    color={taken ? theme.color.primary : theme.color.textSecondary}
                  />
                  <Text variant="caption" weight="semiBold">
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      </ScrollView>

      <StickyCTA>
        <Button
          label={canFinish ? 'Récupérer le véhicule' : 'Signez et complétez les 6 photos'}
          disabled={!canFinish}
          onPress={() => {
            reset();
            router.replace('/rental/my-rentals');
          }}
          leading={<Ionicons name="key" size={16} color={theme.color.textInverse} />}
        />
      </StickyCTA>
    </SafeAreaView>
  );
}
