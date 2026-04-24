import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Screen, Stepper, Text } from '@/components/ui';

export default function OnboardingOne() {
  const router = useRouter();
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <Stepper current={1} total={3} />
        <View style={{ gap: 12 }}>
          <Text variant="displayL">Marketplace véhicules</Text>
          <Text variant="bodyL" tone="secondary">
            Acheter ou vendre une voiture en moins de 3 minutes. Scan VIN, IA pré-remplit, photos guidées,
            estimation transparente.
          </Text>
        </View>
        <Button label="Suivant" fullWidth onPress={() => router.push('/(auth)/onboarding-2')} />
      </View>
    </Screen>
  );
}
