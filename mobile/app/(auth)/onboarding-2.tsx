import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Screen, Stepper, Text } from '@/components/ui';

export default function OnboardingTwo() {
  const router = useRouter();
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <Stepper current={2} total={3} />
        <View style={{ gap: 12 }}>
          <Text variant="displayL">Location premium</Text>
          <Text variant="bodyL" tone="secondary">
            Réservez une voiture courte ou longue durée. KYC réutilisable, contrat numérique, paiement
            sécurisé via Bankily, Masrvi ou carte.
          </Text>
        </View>
        <Button label="Suivant" fullWidth onPress={() => router.push('/(auth)/onboarding-3')} />
      </View>
    </Screen>
  );
}
