import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, Input, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useWalletExtraStore, type BnplPlan } from '@/lib/stores/wallet-extra';
import { formatMRU } from '@/lib/format';

const SCORE = 78;

export default function WalletBnpl() {
  const theme = useTheme();
  const plans = useWalletExtraStore((s) => s.bnpl);
  const addBnpl = useWalletExtraStore((s) => s.addBnpl);
  const pay = useWalletExtraStore((s) => s.payBnplInstallment);

  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('150000');
  const [months, setMonths] = useState<3 | 4 | 6>(3);

  const value = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const valid = label.trim().length > 0 && value >= 5000;

  const submit = () => {
    if (!valid) return;
    addBnpl(label.trim(), value, months);
    setLabel('');
    setAmount('150000');
    Alert.alert('Plan créé', `${months}x sans frais validé.`);
  };

  return (
    <Screen scroll>
      <BackHeader title="BNPL — Paiement fractionné" code="W-06" />

      <Card variant="sand">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="caption" tone="secondary">
              Score Kargo (transparent)
            </Text>
            <Text variant="heading2">{SCORE}/100</Text>
            <Text variant="caption" tone="secondary">
              Basé sur historique paiements + ancienneté + KYC
            </Text>
          </View>
          <Badge label="Éligible jusqu'à 500 000 MRU" tone="success" />
        </View>
      </Card>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Nouveau plan
        </Text>
        <Input label="Libellé" value={label} onChangeText={setLabel} placeholder="Pneus 4×4" />
        <Input
          label="Montant total (MRU)"
          keyboardType="number-pad"
          value={amount}
          onChangeText={(v) => setAmount(v.replace(/\D/g, ''))}
          containerStyle={{ marginTop: 12 }}
        />
        <Text variant="caption" tone="secondary" style={{ marginTop: 12, marginBottom: 6 }}>
          Échelonnement
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {([3, 4, 6] as const).map((n) => (
            <Pressable
              key={n}
              onPress={() => setMonths(n)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: theme.radius.lg,
                backgroundColor: months === n ? theme.color.primary : theme.color.bgElevated,
                alignItems: 'center',
              }}
            >
              <Text
                variant="bodyM"
                weight="semiBold"
                style={{ color: months === n ? theme.color.textInverse : theme.color.text }}
              >
                {n}× sans frais
              </Text>
              <Text
                variant="caption"
                style={{ color: months === n ? theme.color.textInverse : theme.color.textSecondary }}
              >
                {formatMRU(Math.round(value / n))} MRU/mois
              </Text>
            </Pressable>
          ))}
        </View>
        <Button label="Créer le plan" onPress={submit} disabled={!valid} style={{ marginTop: 16 }} />
      </Card>

      <Text variant="heading2">Mes plans</Text>
      {plans.length === 0 ? (
        <Card variant="sand">
          <Text variant="bodyM" tone="secondary" align="center">
            Vous n'avez aucun plan en cours.
          </Text>
        </Card>
      ) : (
        plans.map((p) => <PlanCard key={p.id} plan={p} onPay={(idx) => pay(p.id, idx)} />)
      )}
    </Screen>
  );
}

function PlanCard({ plan, onPay }: { plan: BnplPlan; onPay: (idx: number) => void }) {
  const theme = useTheme();
  const paid = plan.installments.filter((i) => i.paid).length;
  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text variant="bodyL" weight="semiBold">
          {plan.label}
        </Text>
        <Badge
          label={plan.status === 'completed' ? 'Soldé' : plan.status === 'late' ? 'En retard' : 'Actif'}
          tone={plan.status === 'completed' ? 'success' : plan.status === 'late' ? 'danger' : 'primary'}
        />
      </View>
      <Text variant="caption" tone="secondary">
        {formatMRU(plan.total)} MRU · {paid}/{plan.installments.length} payé
      </Text>
      <View style={{ height: 6, backgroundColor: theme.color.bgElevated, borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
        <View
          style={{
            width: `${(paid / plan.installments.length) * 100}%`,
            height: '100%',
            backgroundColor: theme.color.success,
          }}
        />
      </View>
      <View style={{ gap: 6, marginTop: 12 }}>
        {plan.installments.map((it, i) => (
          <View
            key={i}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons
                name={it.paid ? 'checkmark-circle' : 'time'}
                size={18}
                color={it.paid ? theme.color.success : theme.color.textSecondary}
              />
              <Text variant="bodyM">
                Échéance {i + 1} · {new Date(it.dueAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Text variant="bodyM" weight="semiBold">
                {formatMRU(it.amount)} MRU
              </Text>
              {!it.paid ? (
                <Button label="Payer" size="sm" onPress={() => onPay(i)} />
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
