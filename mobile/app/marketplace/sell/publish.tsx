import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, StickyCTA, Text } from '@/components/ui';
import { VehiclePhotoCarousel } from '@/components/VehiclePhotoCarousel';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { formatKm, formatMRU } from '@/lib/format';
import { CURRENT_YEAR } from '@/lib/mocks/vehicles';
import { useSellStore } from '@/lib/stores/sell';

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
  const { draft, reset } = useSellStore();
  const [state, setState] = useState<'preview' | 'publishing' | 'done'>('preview');

  const fresh = draft.importYear === CURRENT_YEAR && draft.ownersInCountry === 0;

  const publish = () => {
    setState('publishing');
    setTimeout(() => setState('done'), 1200);
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
            Modération IA en cours (≈ 30 s). Validation humaine dans les 30 min.
          </Text>
          <View style={{ width: '100%', gap: 10, marginTop: 20 }}>
            <Button
              label="Voir mes annonces"
              onPress={() => {
                reset();
                router.replace('/settings/my-listings');
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
              {draft.price ? `${formatMRU(draft.price)} MRU` : '—'}
              {draft.negotiable ? ' · négociable' : ''}
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
            onPress={() => router.replace('/marketplace/sell/vin')}
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
