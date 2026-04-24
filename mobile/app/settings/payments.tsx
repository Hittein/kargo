import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Card, Screen, SegmentedTabs, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useWalletStore } from '@/lib/stores/wallet';
import { formatMRU } from '@/lib/format';
import type { TxType } from '@/lib/mocks/wallet';

type Tab = 'all' | 'tickets' | 'rentals' | 'wallet' | 'refunds';

export default function MyPayments() {
  const theme = useTheme();
  const transactions = useWalletStore((s) => s.transactions);
  const [tab, setTab] = useState<Tab>('all');

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (tab === 'all') return true;
      if (tab === 'refunds') return tx.status === 'refunded';
      if (tab === 'tickets') return tx.type === 'ticket_transit';
      if (tab === 'rentals') return tx.type === 'rental_payment' || tx.type === 'marketplace_deposit';
      if (tab === 'wallet') return tx.type.startsWith('topup_') || tx.type.startsWith('p2p_');
      return true;
    });
  }, [transactions, tab]);

  return (
    <Screen scroll>
      <BackHeader title="Mes paiements" code="P-03" />
      <SegmentedTabs
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        items={[
          { key: 'all', label: 'Tous' },
          { key: 'tickets', label: 'Billets' },
          { key: 'rentals', label: 'Locations' },
          { key: 'wallet', label: 'Wallet' },
          { key: 'refunds', label: 'Remb.' },
        ]}
      />
      <View style={{ gap: 8 }}>
        {filtered.length === 0 ? (
          <Card variant="sand">
            <Text variant="bodyM" tone="secondary" align="center">
              Aucun paiement dans cette catégorie.
            </Text>
          </Card>
        ) : (
          filtered.map((tx) => (
            <Card
              key={tx.id}
              padding={14}
              onPress={() =>
                Alert.alert(
                  'Reçu de paiement',
                  `Réf : ${tx.reference}\nDate : ${new Date(tx.createdAt).toLocaleString('fr-FR')}\nMontant : ${formatMRU(tx.amount)} MRU\nContrepartie : ${tx.counterparty}\nStatut : ${tx.status}`,
                  [
                    { text: 'Télécharger PDF', onPress: () => Alert.alert('Reçu PDF généré (simulation)') },
                    { text: 'Fermer', style: 'cancel' },
                  ],
                )
              }
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.color.bgElevated,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name={iconFor(tx.type)}
                    size={20}
                    color={tx.amount > 0 ? theme.color.success : theme.color.text}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyM" weight="semiBold">
                    {tx.counterparty}
                  </Text>
                  <Text variant="caption" tone="secondary">
                    {new Date(tx.createdAt).toLocaleDateString('fr-FR')} · {labelFor(tx.type)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text
                    variant="bodyL"
                    weight="bold"
                    style={{ color: tx.amount > 0 ? theme.color.success : theme.color.text }}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {formatMRU(tx.amount)} MRU
                  </Text>
                  {tx.status === 'pending' ? <Badge label="En attente" tone="gold" /> : null}
                  {tx.status === 'failed' ? <Badge label="Échec" tone="danger" /> : null}
                  {tx.status === 'refunded' ? <Badge label="Remboursé" tone="primary" /> : null}
                </View>
              </View>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}

function iconFor(type: TxType): keyof typeof Ionicons.glyphMap {
  if (type === 'ticket_transit') return 'ticket';
  if (type === 'rental_payment' || type === 'marketplace_deposit') return 'key';
  if (type === 'p2p_sent' || type === 'p2p_received') return 'paper-plane';
  if (type.startsWith('topup_')) return 'add-circle';
  if (type === 'withdrawal') return 'arrow-down';
  if (type === 'loyalty_reward') return 'gift';
  return 'card';
}

function labelFor(type: TxType): string {
  const map: Record<TxType, string> = {
    topup_bankily: 'Recharge Bankily',
    topup_masrvi: 'Recharge Masrvi',
    topup_sedad: 'Recharge Sedad',
    topup_card: 'Recharge carte',
    p2p_sent: 'Transfert envoyé',
    p2p_received: 'Transfert reçu',
    ticket_transit: 'Billet de transport',
    rental_payment: 'Paiement location',
    marketplace_deposit: 'Acompte marketplace',
    merchant_payment: 'Paiement marchand',
    bill_payment: 'Facture',
    loyalty_reward: 'Récompense fidélité',
    withdrawal: 'Retrait',
  };
  return map[type];
}
