import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, Input, Text } from '@/components/ui';
import { SellStepper } from '@/components/SellStepper';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { useSellStore } from '@/lib/stores/sell';

export default function SellVin() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { draft, patch, mode } = useSellStore();
  const isRent = mode === 'rent';
  const [vin, setVin] = useState(draft.vin ?? '');
  const [scanning, setScanning] = useState(false);

  const valid = vin.trim().length === 17;

  const handleDecode = () => {
    setScanning(true);
    setTimeout(() => {
      patch({
        vin,
        vinDecoded: true,
        brand: 'Toyota',
        model: 'Hilux',
        year: 2021,
        fuel: 'diesel',
        transmission: 'manual',
        bodyType: 'Pick-up',
      });
      setScanning(false);
      router.push('/marketplace/sell/specs');
    }, 800);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <Text variant="heading2" weight="bold" style={{ flex: 1 }}>
          {isRent ? 'Mettre en location' : 'Vendre ma voiture'}
        </Text>
        <Badge label={isRent ? 'L-08' : 'A-06'} tone="primary" />
      </View>

      <SellStepper current={1} />

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
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
              <Ionicons name="sparkles" size={22} color={theme.color.textInverse} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyL" weight="bold">
                Pré-remplir avec le VIN
              </Text>
              <Text variant="caption" tone="secondary">
                17 caractères · sur le châssis ou la carte grise
              </Text>
            </View>
          </View>
        </Card>

        <Input
          label="Numéro de châssis (VIN)"
          value={vin}
          onChangeText={(v) => setVin(v.toUpperCase().slice(0, 17))}
          placeholder="ex. JN1TANT31Z0123456"
          autoCapitalize="characters"
          hint={`${vin.length}/17 caractères`}
          leading={<Ionicons name="car-sport" size={18} color={theme.color.textSecondary} />}
          trailing={
            <Pressable hitSlop={8} onPress={() => {}}>
              <Ionicons name="scan" size={20} color={theme.color.primary} />
            </Pressable>
          }
        />

        <Button
          label={scanning ? 'Décodage…' : 'Décoder et continuer'}
          disabled={!valid || scanning}
          onPress={handleDecode}
          leading={<Ionicons name="arrow-forward" size={16} color={theme.color.textInverse} />}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 8 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: theme.color.border }} />
          <Text variant="caption" tone="secondary">
            OU
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: theme.color.border }} />
        </View>

        <Button
          label="Saisie manuelle"
          variant="secondary"
          onPress={() => {
            patch({ vin: undefined, vinDecoded: false });
            router.push('/marketplace/sell/specs');
          }}
          leading={<Ionicons name="create" size={16} color={theme.color.text} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
