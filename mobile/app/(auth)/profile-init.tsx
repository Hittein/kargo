import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Input, Screen, Text } from '@/components/ui';
import { useAuthStore } from '@/lib/stores/auth';
import { CITIES } from '@/lib/mocks/transit';
import { useTheme } from '@/theme/ThemeProvider';
import { authApi } from '@/lib/api';

export default function ProfileInitScreen() {
  const router = useRouter();
  const completeProfile = useAuthStore((s) => s.completeProfile);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const isValid = name.trim().length >= 2;

  const submit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    const payload = {
      name: name.trim(),
      email: email.trim() || undefined,
      city,
    };
    // On écrit local tout de suite (UX réactif) et on tente backend.
    completeProfile(payload);
    setOnboarded();
    try {
      // Blocking : si ça échoue, l'user voit un message et peut retry.
      // Sans ça, le profil restait local seulement → à la prochaine re-install,
      // le backend renverrait name="" et l'utilisateur devait re-saisir.
      await authApi.updateMe(payload);
      router.replace('/(tabs)');
    } catch (e) {
      setSubmitting(false);
      Alert.alert(
        'Synchronisation échouée',
        "Votre profil n'a pas pu être enregistré sur le serveur (connexion instable ?). Il sera perdu si vous changez de téléphone. Réessayer ?",
        [
          {
            text: 'Continuer quand même',
            style: 'cancel',
            onPress: () => router.replace('/(tabs)'),
          },
          { text: 'Réessayer', onPress: () => submit() },
        ],
      );
    }
  };

  return (
    <Screen scroll>
      <Text variant="heading1">Bienvenue !</Text>
      <Text variant="bodyM" tone="secondary">
        Quelques informations pour personnaliser votre Kargo.
      </Text>
      <Input
        label="Prénom"
        value={name}
        onChangeText={setName}
        placeholder="Votre prénom"
        autoCapitalize="words"
      />
      <Input
        label="Email (optionnel)"
        value={email}
        onChangeText={setEmail}
        placeholder="vous@exemple.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Card variant="sand">
        <Text variant="caption" tone="secondary" style={{ marginBottom: 8 }}>
          Ville principale (optionnel)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CITIES.map((c) => (
            <CityPill
              key={c.id}
              label={c.name}
              active={city === c.name}
              onPress={() => setCity(city === c.name ? undefined : c.name)}
            />
          ))}
        </View>
      </Card>
      <Button
        label={submitting ? 'Enregistrement…' : 'Continuer'}
        fullWidth
        onPress={submit}
        disabled={!isValid || submitting}
      />
    </Screen>
  );
}

function CityPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.radius.pill,
        backgroundColor: active ? theme.color.primary : theme.color.bgElevated,
      }}
    >
      <Text variant="caption" weight="semiBold" style={{ color: active ? theme.color.textInverse : theme.color.text }}>
        {label}
      </Text>
    </Pressable>
  );
}
