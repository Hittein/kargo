import { useState } from 'react';
import { Alert, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, Input, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/lib/stores/auth';
import { useWalletExtraStore } from '@/lib/stores/wallet-extra';

export default function Security() {
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setPin = useAuthStore((s) => s.setPin);
  const setBiometric = useAuthStore((s) => s.setBiometric);
  const signOut = useAuthStore((s) => s.signOut);
  const settings = useWalletExtraStore((s) => s.settings);
  const setWalletSettings = useWalletExtraStore((s) => s.setSettings);

  const [pin, setPinInput] = useState('');
  const [pin2, setPinInput2] = useState('');

  const enablePin = () => {
    if (pin.length !== 4) {
      Alert.alert('PIN invalide', 'Entrez un code à 4 chiffres.');
      return;
    }
    if (pin !== pin2) {
      Alert.alert('Confirmation incorrecte', 'Les deux PIN ne correspondent pas.');
      return;
    }
    setPin(true);
    setPinInput('');
    setPinInput2('');
    Alert.alert('PIN activé', 'Votre code à 4 chiffres a été enregistré (simulation).');
  };

  const disablePin = () =>
    Alert.alert('Désactiver le PIN ?', 'Vous devrez confirmer toutes les opérations sensibles autrement.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Désactiver', style: 'destructive', onPress: () => setPin(false) },
    ]);

  const exportData = () => Alert.alert('Export demandé', 'Vous recevrez un email avec vos données sous 24h.');
  const deleteAccount = () =>
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Vos données seront effacées sous 30 jours conformément au RGPD.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            signOut();
            router.replace('/(auth)/welcome');
          },
        },
      ],
    );

  return (
    <Screen scroll>
      <BackHeader title="Sécurité" code="P-08" />

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Code PIN
        </Text>
        <Text variant="caption" tone="secondary" style={{ marginBottom: 12 }}>
          Demandé pour les paiements et l'accès au wallet.
        </Text>
        {user?.hasPin ? (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
            <Badge label="PIN actif" tone="success" />
            <Button label="Désactiver" variant="ghost" size="sm" onPress={disablePin} />
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <Input label="Nouveau PIN" keyboardType="number-pad" maxLength={4} secureTextEntry value={pin} onChangeText={setPinInput} placeholder="1234" />
            <Input label="Confirmer le PIN" keyboardType="number-pad" maxLength={4} secureTextEntry value={pin2} onChangeText={setPinInput2} placeholder="1234" />
            <Button label="Activer le PIN (simulation)" onPress={enablePin} />
          </View>
        )}
      </Card>

      <Card>
        <Row
          icon="finger-print"
          label="Biométrie (Face ID / empreinte)"
          desc="Déverrouillage rapide & validation paiements."
          right={
            <Switch
              value={user?.hasBiometric ?? false}
              onValueChange={(v) => {
                setBiometric(v);
                if (v) Alert.alert('Biométrie activée (simulation)');
              }}
            />
          }
        />
        <Row
          icon="lock-closed"
          label="Verrouillage automatique"
          desc="Demander le PIN après 5 minutes d'inactivité."
          right={<Switch value={true} disabled />}
        />
      </Card>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Limites wallet
        </Text>
        <Row
          icon="speedometer"
          label="Plafond journalier"
          desc={`${settings.dailyLimit.toLocaleString('fr-FR')} MRU`}
          right={
            <Button
              label="Modifier"
              size="sm"
              variant="ghost"
              onPress={() =>
                Alert.alert('Plafond journalier', 'Ajuster (simulation)', [
                  { text: '50 000', onPress: () => setWalletSettings({ dailyLimit: 50000 }) },
                  { text: '100 000', onPress: () => setWalletSettings({ dailyLimit: 100000 }) },
                  { text: '250 000', onPress: () => setWalletSettings({ dailyLimit: 250000 }) },
                  { text: 'Annuler', style: 'cancel' },
                ])
              }
            />
          }
        />
        <Row
          icon="card"
          label="Plafond par opération"
          desc={`${settings.perTxLimit.toLocaleString('fr-FR')} MRU`}
          right={
            <Button
              label="Modifier"
              size="sm"
              variant="ghost"
              onPress={() =>
                Alert.alert('Plafond opération', 'Ajuster (simulation)', [
                  { text: '20 000', onPress: () => setWalletSettings({ perTxLimit: 20000 }) },
                  { text: '50 000', onPress: () => setWalletSettings({ perTxLimit: 50000 }) },
                  { text: '100 000', onPress: () => setWalletSettings({ perTxLimit: 100000 }) },
                  { text: 'Annuler', style: 'cancel' },
                ])
              }
            />
          }
        />
        <Row
          icon="warning"
          label="Kill switch"
          desc="Bloquer instantanément toutes les opérations."
          right={
            <Switch
              value={settings.killSwitch}
              onValueChange={(v) => {
                setWalletSettings({ killSwitch: v });
                if (v) Alert.alert('Wallet bloqué', 'Toutes les transactions sont gelées. Contactez le support pour réactiver.');
              }}
            />
          }
        />
      </Card>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Données personnelles
        </Text>
        <Button label="Exporter mes données" variant="secondary" onPress={exportData} />
        <View style={{ height: 8 }} />
        <Button label="Supprimer mon compte" variant="destructive" onPress={deleteAccount} />
      </Card>
    </Screen>
  );
}

function Row({
  icon,
  label,
  desc,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  desc: string;
  right?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
      <Ionicons name={icon} size={20} color={theme.color.textSecondary} />
      <View style={{ flex: 1 }}>
        <Text variant="bodyM" weight="semiBold">
          {label}
        </Text>
        <Text variant="caption" tone="secondary">
          {desc}
        </Text>
      </View>
      {right}
    </View>
  );
}
