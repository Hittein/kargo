import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Input, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/lib/stores/auth';
import { authApi } from '@/lib/api';
import { normalizePhone } from '@/lib/phone';

export default function SignInScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const startSignIn = useAuthStore((s) => s.startSignIn);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const normalized = normalizePhone(phone);
  const isValid = normalized !== null;

  const submit = async () => {
    const phoneNorm = normalizePhone(phone);
    if (!phoneNorm) {
      Alert.alert(
        'Numéro invalide',
        'Entrez un numéro mauritanien à 8 chiffres (ex. 45 25 25 25). Le préfixe +222 est optionnel.',
      );
      return;
    }
    setLoading(true);
    try {
      // Real backend (Render). En dev prod-OTP simulé : la réponse contient simulatedCode.
      const res = await authApi.startOtp(phoneNorm);
      // On garde aussi un OTP local de secours (au cas où le backend tombe entre start et verify).
      const localCode = startSignIn(phoneNorm);
      const code = res.simulatedCode || localCode;
      Alert.alert(
        'Code OTP envoyé',
        `Numéro : ${phoneNorm}\nCode : ${code}\n\nAstuce : 0000 ou 000000 sont aussi acceptés.`,
        [{ text: 'Continuer', onPress: () => router.push('/(auth)/otp') }],
      );
    } catch {
      // Fallback offline : on simule en local seulement.
      const code = startSignIn(phoneNorm);
      Alert.alert(
        'Mode hors-ligne (simulation locale)',
        `Numéro : ${phoneNorm}\nCode : ${code}\n\n0000/000000 acceptés.`,
        [{ text: 'Continuer', onPress: () => router.push('/(auth)/otp') }],
      );
    } finally {
      setLoading(false);
    }
  };

  const continueWith = (provider: 'google' | 'apple') => {
    const fakePhone = provider === 'google' ? '22222222' : '33333333';
    setPhone(fakePhone);
    const code = startSignIn(fakePhone);
    Alert.alert(`${provider === 'google' ? 'Google' : 'Apple'} (simulation)`, `Code OTP : ${code}`, [
      { text: 'Continuer', onPress: () => router.push('/(auth)/otp') },
    ]);
  };

  return (
    <Screen scroll>
      <Text variant="heading1">{t('auth.welcome')}</Text>
      <Text variant="bodyM" tone="secondary">
        Connectez-vous avec votre numéro mauritanien.
      </Text>
      <Input
        label={t('auth.phoneLabel')}
        keyboardType="phone-pad"
        placeholder="+222 — — — — — — — —"
        value={phone}
        onChangeText={setPhone}
        leading={<Ionicons name="call" size={18} color={theme.color.textSecondary} />}
      />
      <Button
        label={loading ? '...' : t('auth.continueWithPhone')}
        fullWidth
        onPress={submit}
        disabled={!isValid || loading}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.color.divider }} />
        <Text variant="caption" tone="secondary">ou</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.color.divider }} />
      </View>
      <Button
        label={t('auth.continueWithGoogle')}
        variant="secondary"
        fullWidth
        leading={<Ionicons name="logo-google" size={18} color={theme.color.text} />}
        onPress={() => continueWith('google')}
      />
      <Button
        label={t('auth.continueWithApple')}
        variant="secondary"
        fullWidth
        leading={<Ionicons name="logo-apple" size={18} color={theme.color.text} />}
        onPress={() => continueWith('apple')}
      />
      <Text variant="caption" tone="secondary" align="center" style={{ marginTop: 12 }}>
        Mode démo — OTP & mot de passe simulés. Backend Render branché si en ligne.
      </Text>
    </Screen>
  );
}
