import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, Input, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useTrustStore } from '@/lib/stores/trust';
import { formatMRU } from '@/lib/format';

const COVERAGE = [
  { label: 'Vice caché 12 mois', desc: 'Pannes mécaniques majeures non détectées', max: 500_000 },
  { label: 'Annulation transaction', desc: 'Retrait sans pénalité sous 7 jours', max: 0 },
  { label: 'Médiation prioritaire', desc: 'Litige traité sous 24 h ouvré', max: 0 },
  { label: 'Assistance routière 1 an', desc: 'Dépannage 24/7 dans tout le pays', max: 50_000 },
];

const MONTHLY = 2500;

export default function TrustGarantie() {
  const theme = useTheme();
  const garantieActive = useTrustStore((s) => s.garantieActive);
  const garantieUntil = useTrustStore((s) => s.garantieUntil);
  const activate = useTrustStore((s) => s.activateGarantie);
  const claims = useTrustStore((s) => s.claims);
  const fileClaim = useTrustStore((s) => s.fileClaim);

  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');

  const submit = () => {
    if (!reason.trim() || !amount) return;
    fileClaim({
      vehicleId: 'v_demo',
      reason: reason.trim(),
      amount: parseInt(amount.replace(/\D/g, ''), 10),
    });
    setReason('');
    setAmount('');
    Alert.alert('Demande de prise en charge', 'Notre équipe vous contacte sous 24 h.');
  };

  return (
    <Screen scroll>
      <BackHeader title="Garantie Kargo" code="K-06" />

      <Card style={{ backgroundColor: garantieActive ? theme.color.success : theme.color.bgElevated, padding: 22 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="shield-checkmark" size={28} color={garantieActive ? theme.color.textInverse : theme.color.textSecondary} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyL" weight="semiBold" style={{ color: garantieActive ? theme.color.textInverse : theme.color.text }}>
              {garantieActive ? 'Garantie active' : 'Pas encore active'}
            </Text>
            {garantieActive && garantieUntil ? (
              <Text variant="caption" style={{ color: theme.color.textInverse, opacity: 0.85 }}>
                Jusqu'au {new Date(garantieUntil).toLocaleDateString('fr-FR')}
              </Text>
            ) : (
              <Text variant="caption" tone="secondary">
                {formatMRU(MONTHLY)} MRU/mois — sans engagement
              </Text>
            )}
          </View>
        </View>
      </Card>

      <Text variant="heading2">Couverture</Text>
      <View style={{ gap: 8 }}>
        {COVERAGE.map((c) => (
          <Card key={c.label}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <Ionicons name="checkmark-circle" size={20} color={theme.color.success} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyM" weight="semiBold">
                  {c.label}
                </Text>
                <Text variant="caption" tone="secondary">
                  {c.desc}
                </Text>
                {c.max > 0 ? (
                  <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>
                    Plafond : {formatMRU(c.max)} MRU
                  </Text>
                ) : null}
              </View>
            </View>
          </Card>
        ))}
      </View>

      {!garantieActive ? (
        <Button
          label={`Activer · ${formatMRU(MONTHLY)} MRU/mois`}
          fullWidth
          onPress={() => {
            const until = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString();
            activate(until);
            Alert.alert('Garantie activée', 'Vous êtes désormais couvert pour 12 mois.');
          }}
        />
      ) : (
        <>
          <Text variant="heading2">Faire jouer la garantie</Text>
          <Card>
            <Input label="Motif" value={reason} onChangeText={setReason} placeholder="Boîte de vitesse défaillante" />
            <Input
              label="Montant demandé (MRU)"
              keyboardType="number-pad"
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/\D/g, ''))}
              containerStyle={{ marginTop: 12 }}
            />
            <Button label="Soumettre la demande" onPress={submit} disabled={!reason.trim() || !amount} style={{ marginTop: 12 }} />
          </Card>

          {claims.length > 0 ? (
            <View style={{ gap: 8 }}>
              <Text variant="heading2">Mes demandes</Text>
              {claims.map((c) => (
                <Card key={c.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyM" weight="semiBold">
                        {c.reason}
                      </Text>
                      <Text variant="caption" tone="secondary">
                        {formatMRU(c.amount)} MRU · {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                    <Badge
                      label={c.status === 'pending' ? 'En cours' : c.status === 'approved' ? 'Acceptée' : 'Refusée'}
                      tone={c.status === 'approved' ? 'success' : c.status === 'rejected' ? 'danger' : 'gold'}
                    />
                  </View>
                </Card>
              ))}
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}
