import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { VehicleCard } from '@/components/VehicleCard';
import { useTheme } from '@/theme/ThemeProvider';
import { VEHICLES } from '@/lib/mocks/vehicles';

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=70',
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&q=70',
  'https://images.unsplash.com/photo-1605515298946-d0573716f0bd?w=900&q=70',
];

type Phase = 'capture' | 'analyzing' | 'results';

export default function VisualSearch() {
  const theme = useTheme();
  const [phase, setPhase] = useState<Phase>('capture');
  const [photo, setPhoto] = useState<string | null>(null);

  const launch = (uri: string) => {
    setPhoto(uri);
    setPhase('analyzing');
    setTimeout(() => setPhase('results'), 2000);
  };

  const reset = () => {
    setPhoto(null);
    setPhase('capture');
  };

  const matches = VEHICLES.slice(0, 6);

  return (
    <Screen scroll>
      <BackHeader title="Recherche visuelle" code="C-08" />

      {phase === 'capture' && (
        <>
          <Card variant="sand">
            <Text variant="bodyM" tone="secondary">
              Prenez ou importez une photo de la voiture qui vous plaît. Notre IA détecte le modèle et propose des annonces similaires.
            </Text>
          </Card>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => launch(SAMPLE_PHOTOS[0])}
              style={{
                flex: 1,
                paddingVertical: 18,
                backgroundColor: theme.color.primary,
                borderRadius: theme.radius.lg,
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Ionicons name="camera" size={28} color={theme.color.textInverse} />
              <Text variant="bodyM" weight="semiBold" style={{ color: theme.color.textInverse }}>
                Caméra
              </Text>
            </Pressable>
            <Pressable
              onPress={() => launch(SAMPLE_PHOTOS[1])}
              style={{
                flex: 1,
                paddingVertical: 18,
                backgroundColor: theme.color.bgElevated,
                borderRadius: theme.radius.lg,
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Ionicons name="images" size={28} color={theme.color.text} />
              <Text variant="bodyM" weight="semiBold">
                Galerie
              </Text>
            </Pressable>
          </View>

          <Text variant="heading2">Exemples</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SAMPLE_PHOTOS.map((uri) => (
              <Pressable key={uri} onPress={() => launch(uri)} style={{ width: '31%' }}>
                <Image source={{ uri }} style={{ width: '100%', height: 90, borderRadius: 10 }} />
              </Pressable>
            ))}
          </View>
        </>
      )}

      {phase === 'analyzing' && photo && (
        <View style={{ alignItems: 'center', gap: 16, paddingVertical: 24 }}>
          <Image source={{ uri: photo }} style={{ width: '100%', height: 240, borderRadius: 16 }} />
          <Ionicons name="sync" size={32} color={theme.color.textSecondary} />
          <Text variant="bodyL" weight="semiBold">
            Analyse IA en cours…
          </Text>
          <Text variant="caption" tone="secondary" align="center">
            Détection des contours · classification marque/modèle · recherche dans le catalogue
          </Text>
        </View>
      )}

      {phase === 'results' && (
        <>
          {photo ? (
            <Card>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Image source={{ uri: photo }} style={{ width: 80, height: 80, borderRadius: 12 }} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Badge label="Détecté" tone="success" />
                  <Text variant="bodyM" weight="semiBold">
                    Toyota Corolla — confiance 92%
                  </Text>
                  <Text variant="caption" tone="secondary">
                    Berline · couleur claire · années 2017-2020
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Button label="Refaire" variant="secondary" size="sm" onPress={reset} />
                <Button label="Affiner" variant="ghost" size="sm" onPress={() => {}} />
              </View>
            </Card>
          ) : null}

          <Text variant="heading2">{matches.length} annonces similaires</Text>
          <View style={{ gap: 12 }}>
            {matches.map((v) => (
              <VehicleCard key={v.id} vehicle={v} layout="full" />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
