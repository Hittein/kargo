import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, Input, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/lib/stores/auth';
import { CITIES } from '@/lib/mocks/transit';

export default function SettingsProfile() {
  const router = useRouter();
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [city, setCity] = useState<string | undefined>(user?.city);

  const dirty = name !== (user?.name ?? '') || email !== (user?.email ?? '') || city !== user?.city;

  const save = () => {
    updateProfile({ name: name.trim(), email: email.trim() || undefined, city });
    Alert.alert('Profil mis à jour');
  };

  if (!user) {
    return (
      <Screen>
        <Text variant="heading2">Aucun utilisateur connecté.</Text>
      </Screen>
    );
  }

  const initial = (user.name || user.phone || 'K').slice(0, 1).toUpperCase();

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={theme.color.text} />
        </Pressable>
        <Text variant="heading1" style={{ flex: 1 }}>
          Mon profil
        </Text>
        <Badge label="P-01" tone="neutral" />
      </View>

      <Card>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: theme.color.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="heading1" style={{ color: theme.color.textInverse }}>
              {initial}
            </Text>
          </View>
          <Pressable onPress={() => Alert.alert('Photo', 'Sélection de la photo (simulation).')}>
            <Text variant="bodyM" style={{ color: theme.color.primary }} weight="semiBold">
              Changer la photo
            </Text>
          </Pressable>
        </View>
      </Card>

      <Card>
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="bodyM" tone="secondary">
              Téléphone
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Text variant="bodyM" weight="semiBold">
                {user.phone}
              </Text>
              {user.phoneVerified ? (
                <Badge label="Vérifié" tone="success" />
              ) : (
                <Badge label="Non vérifié" tone="danger" />
              )}
            </View>
          </View>
          <Input label="Prénom et nom" value={name} onChangeText={setName} placeholder="Aminetou" />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="vous@exemple.com"
            keyboardType="email-address"
            autoCapitalize="none"
            trailing={
              user.emailVerified ? (
                <Badge label="Vérifié" tone="success" />
              ) : email ? (
                <Badge label="À vérifier" tone="gold" />
              ) : null
            }
          />
        </View>
      </Card>

      <Card variant="sand">
        <Text variant="caption" tone="secondary" style={{ marginBottom: 8 }}>
          Ville principale
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CITIES.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setCity(city === c.name ? undefined : c.name)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: theme.radius.pill,
                backgroundColor: city === c.name ? theme.color.primary : theme.color.bgElevated,
              }}
            >
              <Text
                variant="caption"
                weight="semiBold"
                style={{ color: city === c.name ? theme.color.textInverse : theme.color.text }}
              >
                {c.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="bodyL" weight="semiBold">
              Niveau Kargo Trust
            </Text>
            <Text variant="caption" tone="secondary">
              {kycLabel(user.kycLevel)}
            </Text>
          </View>
          <Button
            label="Vérifier"
            variant="secondary"
            size="sm"
            onPress={() => router.push('/trust/kyc')}
          />
        </View>
      </Card>

      <Button label="Enregistrer" fullWidth onPress={save} disabled={!dirty} />
    </Screen>
  );
}

function kycLabel(level: 0 | 1 | 2 | 3) {
  return ['Niveau 0 — non vérifié', 'Niveau 1 — téléphone', 'Niveau 2 — pièce d\'identité', 'Niveau 3 — pleine vérification'][level];
}
