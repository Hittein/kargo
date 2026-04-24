import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, Input, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useWalletStore } from '@/lib/stores/wallet';
import { useAuthStore } from '@/lib/stores/auth';
import { useWalletExtraStore } from '@/lib/stores/wallet-extra';
import { formatMRU } from '@/lib/format';

const RECENT = [
  { name: 'Mariem', phone: '+222 22 11 22 33' },
  { name: 'Cheikh', phone: '+222 33 22 11 44' },
  { name: 'Sidi', phone: '+222 44 11 22 55' },
];

export default function WalletTransfer() {
  const theme = useTheme();
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance);
  const debit = useWalletStore((s) => s.debit);
  const addTransaction = useWalletStore((s) => s.addTransaction);
  const user = useAuthStore((s) => s.user);
  const settings = useWalletExtraStore((s) => s.settings);

  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const value = Math.max(0, parseInt(amount.replace(/\D/g, ''), 10) || 0);
  const validPhone = /^[\d\s+]{8,}$/.test(phone.trim());
  const exceedsLimit = value > settings.perTxLimit;
  const exceedsBalance = value > balance;
  const valid = validPhone && value >= 100 && !exceedsLimit && !exceedsBalance && !settings.killSwitch;

  const send = () => {
    if (!valid) return;
    const confirm = () => {
      const ok = debit(value);
      if (!ok) {
        Alert.alert('Solde insuffisant');
        return;
      }
      addTransaction({
        id: `tx_${Date.now()}`,
        type: 'p2p_sent',
        amount: -value,
        status: 'completed',
        createdAt: new Date().toISOString(),
        counterparty: phone,
        note: note || undefined,
        reference: `P2P-${Date.now().toString().slice(-6)}`,
      });
      Alert.alert('Transfert envoyé', `${formatMRU(value)} MRU à ${phone}.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    };
    if (user?.hasBiometric) {
      Alert.alert('Validation biométrique', 'Authentifiez-vous (simulation)', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Valider', onPress: confirm },
      ]);
    } else if (user?.hasPin) {
      Alert.alert('Saisir le PIN', 'PIN requis (simulation : tapez OK)', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'OK', onPress: confirm },
      ]);
    } else {
      confirm();
    }
  };

  return (
    <Screen scroll>
      <BackHeader title="Envoyer" code="W-04" />

      <Card variant="sand">
        <Text variant="caption" tone="secondary">
          Solde disponible
        </Text>
        <Text variant="heading2">{formatMRU(balance)} MRU</Text>
      </Card>

      <Card>
        <Input
          label="Numéro de téléphone du destinataire"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          placeholder="+222 ** ** ** **"
          leading={<Ionicons name="call" size={18} color={theme.color.textSecondary} />}
        />
        <Text variant="caption" tone="secondary" style={{ marginTop: 12, marginBottom: 6 }}>
          Récents
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {RECENT.map((r) => (
            <Pressable
              key={r.phone}
              onPress={() => setPhone(r.phone)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.color.bgElevated,
              }}
            >
              <Text variant="caption">
                {r.name} · {r.phone.slice(-5)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Input
          label="Montant (MRU)"
          keyboardType="number-pad"
          value={amount}
          onChangeText={(v) => setAmount(v.replace(/\D/g, ''))}
          placeholder="0"
        />
        <Input
          label="Note (optionnel)"
          value={note}
          onChangeText={setNote}
          placeholder="Remboursement courses…"
          containerStyle={{ marginTop: 12 }}
        />
      </Card>

      {settings.killSwitch ? <Badge label="Wallet bloqué (kill switch)" tone="danger" /> : null}
      {exceedsLimit ? (
        <Badge label={`Dépasse votre plafond par opération (${formatMRU(settings.perTxLimit)} MRU)`} tone="danger" />
      ) : null}
      {exceedsBalance ? <Badge label="Montant supérieur au solde" tone="danger" /> : null}

      <Button
        label={value > 0 ? `Envoyer ${formatMRU(value)} MRU` : 'Saisir un montant'}
        fullWidth
        disabled={!valid}
        onPress={send}
      />
    </Screen>
  );
}
