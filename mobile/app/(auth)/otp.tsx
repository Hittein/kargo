import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Input, Screen, Text } from '@/components/ui';
import { useAuthStore, type AuthUser } from '@/lib/stores/auth';
import { authApi } from '@/lib/api';
import type { ApiUser } from '@/lib/api/types';

function fromApi(u: ApiUser): AuthUser {
  return {
    id: u.id,
    phone: u.phone,
    name: u.name,
    email: u.email,
    city: u.city,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
    emailVerified: u.emailVerified,
    phoneVerified: u.phoneVerified,
    kycLevel: u.kycLevel,
    hasPin: u.hasPin,
    hasBiometric: u.hasBiometric,
  };
}

export default function OtpScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const pending = useAuthStore((s) => s.pendingOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const setSession = useAuthStore((s) => s.setSession);
  const user = useAuthStore((s) => s.user);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!pending) {
    return (
      <Screen scroll>
        <Text variant="heading1">Aucun code en attente</Text>
        <Text variant="bodyM" tone="secondary">
          Veuillez recommencer depuis l'écran de connexion.
        </Text>
        <Button label="Retour" fullWidth onPress={() => router.replace('/(auth)/sign-in')} />
      </Screen>
    );
  }

  const remaining = Math.max(0, Math.ceil((pending.expiresAt - now) / 1000));
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      // Try real backend first.
      const res = await authApi.verifyOtp(pending.phone, code);
      setSession(fromApi(res.user), res.token);
      if (res.user.name) router.replace('/(tabs)');
      else router.replace('/(auth)/profile-init');
      return;
    } catch (err: unknown) {
      // If backend unreachable or rejected, fall back to local sim.
      // (Network errors throw before we get a status — try local in that case too.)
      const local = verifyOtp(code);
      if (!local.ok) {
        const messages = {
          invalid: 'Code incorrect.',
          expired: 'Code expiré, demandez un nouveau code.',
          too_many: 'Trop de tentatives.',
        } as const;
        setError(messages[local.reason ?? 'invalid']);
        return;
      }
      if (user && user.name) router.replace('/(tabs)');
      else router.replace('/(auth)/profile-init');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      const res = await authApi.startOtp(pending.phone);
      const code = res.simulatedCode || resendOtp();
      Alert.alert('Nouveau code envoyé', `Code : ${code}`);
    } catch {
      const code = resendOtp();
      Alert.alert('Nouveau code (offline)', `Code : ${code}`);
    }
  };

  return (
    <Screen scroll>
      <Text variant="heading1">{t('auth.otpTitle')}</Text>
      <Text variant="bodyM" tone="secondary">
        {t('auth.otpHint', { phone: pending.phone })}
      </Text>
      <Input
        keyboardType="number-pad"
        placeholder="••••••"
        value={code}
        onChangeText={(v) => {
          setCode(v.replace(/\D/g, ''));
          if (error) setError(null);
        }}
        maxLength={6}
        error={error ?? undefined}
        hint={remaining > 0 ? `Code valide encore ${mm}:${ss}` : undefined}
      />
      <Button
        label={loading ? '...' : t('common.confirm')}
        fullWidth
        onPress={submit}
        disabled={code.length < 4 || loading}
      />
      <Button label={t('auth.resendOtp')} variant="ghost" fullWidth onPress={resend} />
    </Screen>
  );
}
