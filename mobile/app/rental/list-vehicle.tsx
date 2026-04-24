import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Button, Card, Text } from '@/components/ui';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { useSellStore } from '@/lib/stores/sell';

const STEPS: { icon: string; title: string; subtitle: string }[] = [
  {
    icon: 'car-sport',
    title: 'Décrivez votre véhicule',
    subtitle: 'Marque, modèle, année, photos — VIN auto-rempli possible.',
  },
  {
    icon: 'pricetags',
    title: 'Tarif par jour / semaine / mois',
    subtitle: 'Suggestion de prix basée sur le marché local.',
  },
  {
    icon: 'shield-checkmark',
    title: 'Conditions & caution',
    subtitle: 'Km inclus, chauffeur, livraison, caution bloquée.',
  },
  {
    icon: 'cloud-upload',
    title: 'Publier',
    subtitle: 'Modération IA + humaine en 30 min.',
  },
];

export default function ListVehicle() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const setMode = useSellStore((s) => s.setMode);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <Text variant="heading2" weight="bold" style={{ flex: 1 }}>
          Mettre en location
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }}>
        <Card variant="soft">
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.color.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="cash" size={22} color={theme.color.textInverse} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyL" weight="bold">
                Gagnez 150 000 – 400 000 MRU / mois
              </Text>
              <Text variant="caption" tone="secondary">
                Selon catégorie et taux d'occupation.
              </Text>
            </View>
          </View>
        </Card>

        {STEPS.map((s, i) => (
          <Card key={s.title}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: theme.color.bgElevated,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text variant="bodyM" weight="bold">
                  {i + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyL" weight="semiBold">
                  {s.title}
                </Text>
                <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>
                  {s.subtitle}
                </Text>
              </View>
              <Ionicons
                name={s.icon as React.ComponentProps<typeof Ionicons>['name']}
                size={20}
                color={theme.color.textSecondary}
              />
            </View>
          </Card>
        ))}

        <Button
          label="Commencer"
          onPress={() => {
            setMode('rent');
            router.push('/marketplace/sell/vin');
          }}
          leading={<Ionicons name="arrow-forward" size={16} color={theme.color.textInverse} />}
        />
        <Text variant="caption" tone="secondary" align="center">
          Le même flow que vendre, avec des champs location en plus.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
