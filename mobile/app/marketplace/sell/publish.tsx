import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, StickyCTA, Text } from '@/components/ui';
import { VehiclePhotoCarousel } from '@/components/VehiclePhotoCarousel';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { formatKm, formatMRU } from '@/lib/format';
import { CURRENT_YEAR } from '@/lib/mocks/vehicles';
import { useSellStore } from '@/lib/stores/sell';
import { useAuthStore } from '@/lib/stores/auth';
import { listingsApi, rentalsApi } from '@/lib/api';

function formatHands(n?: number): string {
  if (n == null) return '—';
  if (n === 0) return '0 main';
  if (n === 1) return '1 main';
  return `${n} mains`;
}

export default function SellPublish() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { draft, reset, mode } = useSellStore();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const isRent = mode === 'rent';
  const [state, setState] = useState<'preview' | 'publishing' | 'done'>('preview');

  const fresh = draft.importYear === CURRENT_YEAR && draft.ownersInCountry === 0;

  const publish = async () => {
    // Validation minimale — évite d'envoyer un payload incomplet au backend.
    const missing: string[] = [];
    if (!draft.brand) missing.push('marque');
    if (!draft.model) missing.push('modèle');
    if (!draft.year) missing.push('année');
    if (draft.price == null) missing.push('prix');
    if (draft.km == null) missing.push('kilométrage');
    if (!draft.fuel) missing.push('carburant');
    if (!draft.transmission) missing.push('transmission');
    if (!draft.city) missing.push('ville');
    if (missing.length > 0) {
      Alert.alert('Informations manquantes', `Merci de compléter : ${missing.join(', ')}`);
      return;
    }
    if (draft.photoUrls.length < 3) {
      Alert.alert('Photos requises', 'Minimum 3 photos pour publier.');
      return;
    }

    setState('publishing');
    try {
      if (isRent) {
        await rentalsApi.createRental({
          brand: draft.brand!,
          model: draft.model!,
          year: draft.year!,
          category: draft.bodyType || 'Berline',
          pricePerDayMru: draft.price!,
          seats: 5,
          transmission: draft.transmission === 'auto' ? 'auto' : 'manual',
          airCon: true,
          chauffeurAvailable: false,
          city: draft.city!,
          photoUrls: draft.photoUrls,
        });
        queryClient.invalidateQueries({ queryKey: ['rentals'] });
      } else {
        await listingsApi.createListing({
          brand: draft.brand!,
          model: draft.model!,
          year: draft.year!,
          importYear: draft.importYear,
          ownersInCountry: draft.ownersInCountry ?? 0,
          priceMru: draft.price!,
          km: draft.km!,
          fuel: draft.fuel!,
          transmission: draft.transmission!,
          city: draft.city!,
          district: draft.district,
          sellerName: user?.name || 'Vendeur',
          sellerType: 'particulier',
          kargoVerified: false,
          photoUrls: draft.photoUrls,
        });
        queryClient.invalidateQueries({ queryKey: ['my-listings'] });
        queryClient.invalidateQueries({ queryKey: ['listings'] });
      }
      setState('done');
    } catch (e) {
      setState('preview');
      const msg = e instanceof Error ? e.message : 'Erreur inconnue';
      Alert.alert(
        'Publication échouée',
        `Votre annonce n'a pas pu être envoyée au serveur. ${msg}\n\nVérifiez votre connexion et réessayez.`,
      );
    }
  };

  if (state === 'done') {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.color.success,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="checkmark" size={42} color={theme.color.textInverse} />
          </View>
          <Text variant="heading1" align="center">
            Annonce envoyée
          </Text>
          <Text variant="bodyM" tone="secondary" align="center">
            Votre annonce est en attente de validation par l'équipe Kargo. Vous serez notifié dès qu'elle est publiée (généralement moins de 30 min).
          </Text>
          <View style={{ width: '100%', gap: 10, marginTop: 20 }}>
            <Button
              label="Voir mes annonces"
              onPress={() => {
                reset();
                router.replace('/settings/my-listings?tab=moderation');
              }}
            />
            <Button
              label="Retour à l'accueil"
              variant="secondary"
              onPress={() => {
                reset();
                router.replace('/');
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <Text variant="heading2" weight="bold" style={{ flex: 1 }}>
          Prévisualisation
        </Text>
        <Badge label="A-12" tone="primary" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 160 }}>
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <VehiclePhotoCarousel
            photos={draft.photoUrls}
            totalCount={draft.photoUrls.length}
            height={220}
            borderRadius={0}
          />
          <View style={{ padding: 16, gap: 6 }}>
            {fresh ? <Badge label="Fraîchement dédouanée" tone="success" /> : null}
            <Text variant="heading2" weight="bold" style={{ color: theme.color.primary }}>
              {draft.price ? `${formatMRU(draft.price)} MRU${isRent ? ' / jour' : ''}` : '—'}
              {!isRent && draft.negotiable ? ' · négociable' : ''}
            </Text>
            <Text variant="bodyL" weight="semiBold">
              {draft.brand} · {draft.model} · {draft.year}
            </Text>
            <Text variant="caption" tone="secondary">
              Modèle: {draft.year ?? '—'} · Dédouanée: {draft.importYear ?? '—'} ·{' '}
              {draft.km ? formatKm(draft.km) : '—'} · {formatHands(draft.ownersInCountry)}
            </Text>
            <Text variant="caption" tone="secondary">
              {draft.district ? `${draft.district}, ` : ''}
              {draft.city ?? '—'}
            </Text>
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Modération
          </Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            <ModRow icon="shield-checkmark" label="Analyse IA — photos & texte" />
            <ModRow icon="scan" label="Vérification VIN" active={!!draft.vin} />
            <ModRow icon="person" label="Validation humaine (30 min max)" />
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Contact
          </Text>
          <Text variant="bodyM" weight="semiBold" style={{ marginTop: 4 }}>
            {draft.contactPhone ?? '—'}
          </Text>
          <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
            {draft.contactMethods.join(' · ')}
            {draft.availabilityHours ? ` · ${draft.availabilityHours}` : ''}
          </Text>
        </Card>
      </ScrollView>

      <StickyCTA>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button
            label="Éditer"
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => router.back()}
          />
          <Button
            label={state === 'publishing' ? 'Envoi…' : 'Publier'}
            disabled={state === 'publishing'}
            style={{ flex: 1.4 }}
            onPress={publish}
            leading={<Ionicons name="cloud-upload" size={16} color={theme.color.textInverse} />}
          />
        </View>
      </StickyCTA>
    </SafeAreaView>
  );
}

function ModRow({
  icon,
  label,
  active = true,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  active?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Ionicons
        name={active ? icon : 'close-circle'}
        size={16}
        color={active ? theme.color.success : theme.color.textSecondary}
      />
      <Text variant="bodyM" tone={active ? undefined : 'secondary'}>
        {label}
      </Text>
    </View>
  );
}
