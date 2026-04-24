import { Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Screen, Text } from '@/components/ui';
import { useAuthStore } from '@/lib/stores/auth';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  const skip = () => {
    setOnboarded();
    router.replace('/(auth)/sign-in');
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View />
        <View style={{ gap: 16, alignItems: 'center' }}>
          <Image
            source={require('@/assets/images/logo-wordmark.png')}
            style={{ width: 280, height: 96 }}
            resizeMode="contain"
          />
          <Text variant="bodyL" tone="secondary" align="center">
            {t('app.tagline')}
          </Text>
          <Text variant="caption" tone="secondary" align="center">
            build v3
          </Text>
        </View>
        <View style={{ gap: 12 }}>
          <Button label={t('common.continue')} fullWidth onPress={() => router.push('/(auth)/onboarding-1')} />
          <Button label={t('common.skip') + ' →'} variant="ghost" fullWidth onPress={skip} />
        </View>
      </View>
    </Screen>
  );
}
