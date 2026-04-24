import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, Input, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useWalletStore } from '@/lib/stores/wallet';
import { formatMRU } from '@/lib/format';
import type { TxType } from '@/lib/mocks/wallet';

type Source = {
  key: 'bankily' | 'masrvi' | 'sedad' | 'card' | 'wallety';
  txType: TxType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  fee: number;
  delaySec: number;
};

const SOURCES: Source[] = [
  { key: 'bankily', txType: 'topup_bankily', label: 'Bankily', icon: 'phone-portrait', fee: 0, delaySec: 1 },
  { key: 'masrvi', txType: 'topup_masrvi', label: 'Masrvi', icon: 'phone-portrait', fee: 0, delaySec: 1 },
  { key: 'sedad', txType: 'topup_sedad', label: 'Sedad', icon: 'phone-portrait', fee: 0, delaySec: 1 },
  { key: 'wallety', txType: 'topup_card', label: 'Wallety', icon: 'wallet', fee: 0, delaySec: 1 },
  { key: 'card', txType: 'topup_card', label: 'Carte bancaire', icon: 'card', fee: 200, delaySec: 2 },
];

const QUICK = [5000, 10000, 25000, 50000, 100000];

export default function WalletTopup() {
  const theme = useTheme();
  const router = useRouter();
  const credit = useWalletStore((s) => s.credit);
  const addTransaction = useWalletStore((s) => s.addTransaction);
  const [source, setSource] = useState<Source>(SOURCES[0]);
  const [amount, setAmount] = useState('10000');

  const value = Math.max(0, parseInt(amount.replace(/\D/g, ''), 10) || 0);
  const fee = value > 0 ? source.fee : 0;
  const total = value + fee;
  const valid = value >= 1000 && value <= 1_000_000;

  const submit = () => {
    if (!valid) return;
    Alert.alert('Validation en cours', `Confirmez la transaction sur ${source.label} (simulation).`);
    setTimeout(() => {
      credit(value);
      addTransaction({
        id: `tx_${Date.now()}`,
        type: source.txType,
        amount: value,
        status: 'completed',
        createdAt: new Date().toISOString(),
        counterparty: source.label,
        reference: `${source.key.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      });
      Alert.alert('Recharge réussie', `+${formatMRU(value)} MRU depuis ${source.label}.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, source.delaySec * 1000);
  };

  return (
    <Screen scroll>
      <BackHeader title="Recharger" code="W-03" />
      <Text variant="bodyM" tone="secondary">
        Choisissez votre source et le montant à créditer sur votre wallet Kargo.
      </Text>

      <Card variant="sand">
        <Text variant="caption" tone="secondary" style={{ marginBottom: 8 }}>
          Source
        </Text>
        <View style={{ gap: 8 }}>
          {SOURCES.map((s) => {
            const active = s.key === source.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setSource(s)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 14,
                  borderRadius: theme.radius.lg,
                  backgroundColor: active ? theme.color.primary : theme.color.bg,
                  borderWidth: active ? 0 : 1,
                  borderColor: theme.color.border,
                }}
              >
                <Ionicons
                  name={s.icon}
                  size={20}
                  color={active ? theme.color.textInverse : theme.color.text}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    variant="bodyM"
                    weight="semiBold"
                    style={{ color: active ? theme.color.textInverse : theme.color.text }}
                  >
                    {s.label}
                  </Text>
                  <Text
                    variant="caption"
                    style={{ color: active ? theme.color.textInverse : theme.color.textSecondary, opacity: active ? 0.85 : 1 }}
                  >
                    {s.fee === 0 ? 'Sans frais' : `+ ${s.fee} MRU de frais`} · ~{s.delaySec}s
                  </Text>
                </View>
                {active ? <Ionicons name="checkmark-circle" size={20} color={theme.color.textInverse} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <Input
          label="Montant (MRU)"
          keyboardType="number-pad"
          value={amount}
          onChangeText={(v) => setAmount(v.replace(/\D/g, ''))}
          placeholder="10 000"
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {QUICK.map((v) => (
            <Pressable
              key={v}
              onPress={() => setAmount(String(v))}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.color.bgElevated,
              }}
            >
              <Text variant="caption" weight="semiBold">
                {formatMRU(v)} MRU
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <SummaryRow label="Montant rechargé" value={`${formatMRU(value)} MRU`} />
        <SummaryRow label="Frais" value={`${formatMRU(fee)} MRU`} />
        <View style={{ height: 1, backgroundColor: theme.color.divider, marginVertical: 8 }} />
        <SummaryRow label="Total à débiter" value={`${formatMRU(total)} MRU`} bold />
        {!valid ? <Badge label="Min 1 000 MRU · Max 1 000 000 MRU" tone="gold" style={{ marginTop: 8 }} /> : null}
      </Card>

      <Button
        label={valid ? `Recharger ${formatMRU(value)} MRU` : 'Saisir un montant valide'}
        fullWidth
        disabled={!valid}
        onPress={submit}
      />
    </Screen>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}>
      <Text variant="bodyM" tone="secondary">
        {label}
      </Text>
      <Text variant={bold ? 'bodyL' : 'bodyM'} weight={bold ? 'bold' : 'regular'}>
        {value}
      </Text>
    </View>
  );
}
