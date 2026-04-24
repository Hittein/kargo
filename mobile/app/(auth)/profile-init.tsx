import { useState } from 'react';
import { Pressable, View } from 'react-native';
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

  const isValid = name.trim().length >= 2;

  const submit = async () => {
    if (!isValid) return;
    completeProfile({ name: name.trim(), email: email.trim() || undefined, city });
    setOnboarded();
    // Best-effort sync vers le backend (silencieux si offline).
    try {
      await authApi.updateMe({ name: name.trim(), email: email.trim() || undefined, city });
    } catch {
      /* offline ou non authentifié — la version locale reste valide */
    }
    router.replace('/(tabs)');
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
        placeholder="Aminetou"
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
      <Button label="Continuer" fullWidth onPress={submit} disabled={!isValid} />
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
