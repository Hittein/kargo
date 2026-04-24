import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, Input, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useWalletExtraStore } from '@/lib/stores/wallet-extra';
import { formatMRU } from '@/lib/format';

export default function WalletCards() {
  const theme = useTheme();
  const cards = useWalletExtraStore((s) => s.cards);
  const create = useWalletExtraStore((s) => s.createCard);
  const toggleFreeze = useWalletExtraStore((s) => s.toggleFreeze);
  const removeCard = useWalletExtraStore((s) => s.removeCard);

  const [name, setName] = useState('');
  const [limit, setLimit] = useState('50000');

  const submit = () => {
    if (!name.trim()) return;
    const value = Math.max(1000, parseInt(limit.replace(/\D/g, ''), 10) || 50000);
    create(name.trim(), value);
    setName('');
    setLimit('50000');
  };

  return (
    <Screen scroll>
      <BackHeader title="Cartes virtuelles" code="W-05" />
      <Text variant="bodyM" tone="secondary">
        Générez des cartes Visa virtuelles pour vos achats en ligne, contrôlées par limite mensuelle, gel instantané ou suppression.
      </Text>

      <Card variant="sand">
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Créer une carte
        </Text>
        <Input label="Nom" value={name} onChangeText={setName} placeholder="Achats Netflix" />
        <Input
          label="Limite mensuelle (MRU)"
          keyboardType="number-pad"
          value={limit}
          onChangeText={(v) => setLimit(v.replace(/\D/g, ''))}
          containerStyle={{ marginTop: 12 }}
        />
        <Button label="Générer la carte" onPress={submit} disabled={!name.trim()} style={{ marginTop: 12 }} />
      </Card>

      {cards.map((c) => {
        const remaining = c.monthlyLimit - c.spent;
        return (
          <Card
            key={c.id}
            style={{
              backgroundColor: c.frozen ? theme.color.bgElevated : '#0A1E5B',
              padding: 20,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="bodyM" weight="semiBold" style={{ color: c.frozen ? theme.color.text : theme.color.textInverse }}>
                {c.name}
              </Text>
              {c.frozen ? <Badge label="Gelée" tone="gold" /> : <Badge label="Active" tone="success" />}
            </View>
            <Text variant="displayL" weight="bold" style={{ color: c.frozen ? theme.color.text : theme.color.textInverse, marginTop: 12 }}>
              •••• •••• •••• {c.last4}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <View>
                <Text variant="caption" style={{ color: c.frozen ? theme.color.textSecondary : '#fff', opacity: 0.7 }}>
                  Expire
                </Text>
                <Text variant="bodyM" weight="semiBold" style={{ color: c.frozen ? theme.color.text : theme.color.textInverse }}>
                  {String(c.expMonth).padStart(2, '0')}/{c.expYear}
                </Text>
              </View>
              <View>
                <Text variant="caption" style={{ color: c.frozen ? theme.color.textSecondary : '#fff', opacity: 0.7 }}>
                  Restant ce mois
                </Text>
                <Text variant="bodyM" weight="semiBold" style={{ color: c.frozen ? theme.color.text : theme.color.textInverse }}>
                  {formatMRU(remaining)} / {formatMRU(c.monthlyLimit)}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              <Button
                label={c.frozen ? 'Dégeler' : 'Geler'}
                size="sm"
                variant="secondary"
                leading={<Ionicons name={c.frozen ? 'play' : 'snow'} size={14} color={theme.color.text} />}
                onPress={() => toggleFreeze(c.id)}
              />
              <Button
                label="Détails CVV"
                size="sm"
                variant="secondary"
                onPress={() =>
                  Alert.alert('Détails carte', `Numéro : 4242 4242 4242 ${c.last4}\nExp : ${c.expMonth}/${c.expYear}\nCVV : ${100 + Math.floor(Math.random() * 899)}`, [
                    { text: 'Copier', onPress: () => Alert.alert('Copié (simulation)') },
                    { text: 'Fermer', style: 'cancel' },
                  ])
                }
              />
              <Button
                label="Supprimer"
                size="sm"
                variant="ghost"
                onPress={() =>
                  Alert.alert('Supprimer ?', 'Cette carte ne fonctionnera plus.', [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Supprimer', style: 'destructive', onPress: () => removeCard(c.id) },
                  ])
                }
              />
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
