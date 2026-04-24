import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Screen, Stepper, Text } from '@/components/ui';

export default function OnboardingThree() {
  const router = useRouter();
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <Stepper current={3} total={3} />
        <View style={{ gap: 12 }}>
          <Text variant="displayL">Mobilité interurbaine</Text>
          <Text variant="bodyL" tone="secondary">
            Réservez votre billet Nouakchott–Nouadhibou, Kiffa, Atar… E-billet QR hors ligne, embarquement
            en un scan.
          </Text>
        </View>
        <Button label="Commencer" fullWidth onPress={() => router.replace('/(auth)/sign-in')} />
      </View>
    </Screen>
  );
}
