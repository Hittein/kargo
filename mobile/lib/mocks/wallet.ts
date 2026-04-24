export type TxType =
  | 'topup_bankily'
  | 'topup_masrvi'
  | 'topup_sedad'
  | 'topup_card'
  | 'p2p_sent'
  | 'p2p_received'
  | 'ticket_transit'
  | 'rental_payment'
  | 'marketplace_deposit'
  | 'merchant_payment'
  | 'bill_payment'
  | 'loyalty_reward'
  | 'withdrawal';

export type TxStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  status: TxStatus;
  createdAt: string;
  counterparty: string;
  note?: string;
  reference: string;
  pointsEarned?: number;
};

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export const TIERS: {
  key: LoyaltyTier;
  label: string;
  minPoints: number;
  color: string;
  perks: string[];
}[] = [
  { key: 'bronze', label: 'Bronze', minPoints: 0, color: '#B45309', perks: ['1 point / 100 MRU'] },
  {
    key: 'silver',
    label: 'Argent',
    minPoints: 500,
    color: '#94A3B8',
    perks: ['1.5 pts / 100 MRU', 'Support prioritaire'],
  },
  {
    key: 'gold',
    label: 'Or',
    minPoints: 2000,
    color: '#F7B500',
    perks: ['2 pts / 100 MRU', 'BNPL sans frais', 'Assurance location offerte'],
  },
  {
    key: 'platinum',
    label: 'Platine',
    minPoints: 5000,
    color: '#7C3AED',
    perks: [
      '3 pts / 100 MRU',
      'BNPL 6x sans frais',
      'Inspection Kargo offerte',
      'Lounge aéroport',
    ],
  },
];

export const WALLET_STATE = {
  balance: 128_450,
  currency: 'MRU',
  cardLast4: '4821',
  cardFrozen: false,
  points: 1_240,
};

export function tierFromPoints(points: number) {
  let current = TIERS[0];
  for (const t of TIERS) {
    if (points >= t.minPoints) current = t;
  }
  const next = TIERS.find((t) => t.minPoints > current.minPoints);
  return { current, next };
}

function iso(offsetHours: number, minuteOffset = 0): string {
  const base = new Date('2026-04-23T14:30:00Z');
  base.setUTCHours(base.getUTCHours() - offsetHours);
  base.setUTCMinutes(base.getUTCMinutes() - minuteOffset);
  return base.toISOString();
}

export const TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    type: 'topup_bankily',
    amount: 25_000,
    status: 'completed',
    createdAt: iso(2),
    counterparty: 'Bankily',
    reference: 'BNK-5821-0923',
    pointsEarned: 25,
  },
  {
    id: 'tx-002',
    type: 'ticket_transit',
    amount: -1_800,
    status: 'completed',
    createdAt: iso(5),
    counterparty: 'SONEF · NKC → NDB',
    note: 'Billet 6h30 · SONEF',
    reference: 'TKT-4455-7821',
  },
  {
    id: 'tx-003',
    type: 'p2p_received',
    amount: 8_500,
    status: 'completed',
    createdAt: iso(22),
    counterparty: 'Mohamed O.',
    note: 'Loyer partagé',
    reference: 'P2P-9912-4410',
    pointsEarned: 8,
  },
  {
    id: 'tx-004',
    type: 'marketplace_deposit',
    amount: -12_000,
    status: 'pending',
    createdAt: iso(26),
    counterparty: 'Toyota Yaris · #veh-001',
    note: 'Séquestre Kargo Trust',
    reference: 'ESC-1001-4521',
  },
  {
    id: 'tx-005',
    type: 'rental_payment',
    amount: -6_000,
    status: 'completed',
    createdAt: iso(48),
    counterparty: 'Hyundai Tucson · 3 jours',
    reference: 'RNT-2024-8812',
    pointsEarned: 60,
  },
  {
    id: 'tx-006',
    type: 'loyalty_reward',
    amount: 1_500,
    status: 'completed',
    createdAt: iso(72),
    counterparty: 'Kargo Points · palier Or',
    reference: 'LOY-GOLD-01',
  },
  {
    id: 'tx-007',
    type: 'merchant_payment',
    amount: -4_250,
    status: 'completed',
    createdAt: iso(96),
    counterparty: 'Super Carrefour Madrid',
    note: 'QR in-store',
    reference: 'MER-0098-2245',
    pointsEarned: 42,
  },
  {
    id: 'tx-008',
    type: 'topup_masrvi',
    amount: 50_000,
    status: 'completed',
    createdAt: iso(144),
    counterparty: 'Masrvi',
    reference: 'MSR-1120-5522',
    pointsEarned: 50,
  },
  {
    id: 'tx-009',
    type: 'bill_payment',
    amount: -3_200,
    status: 'completed',
    createdAt: iso(168),
    counterparty: 'SOMELEC · Électricité avril',
    reference: 'BIL-SMLC-4412',
  },
  {
    id: 'tx-010',
    type: 'p2p_sent',
    amount: -2_000,
    status: 'completed',
    createdAt: iso(192),
    counterparty: 'Fatimata B.',
    note: 'Merci pour hier',
    reference: 'P2P-3310-0094',
  },
  {
    id: 'tx-011',
    type: 'withdrawal',
    amount: -15_000,
    status: 'completed',
    createdAt: iso(216),
    counterparty: 'Agent Kargo · Tevragh Zeina',
    reference: 'WDR-0012-5501',
  },
  {
    id: 'tx-012',
    type: 'ticket_transit',
    amount: -900,
    status: 'refunded',
    createdAt: iso(240),
    counterparty: 'Saharienne · NKC → Rosso',
    note: 'Annulation · remboursement',
    reference: 'TKT-8821-0012',
  },
];

export const TX_META: Record<
  TxType,
  { icon: string; label: string; direction: 'in' | 'out' }
> = {
  topup_bankily: { icon: 'add-circle', label: 'Recharge Bankily', direction: 'in' },
  topup_masrvi: { icon: 'add-circle', label: 'Recharge Masrvi', direction: 'in' },
  topup_sedad: { icon: 'add-circle', label: 'Recharge Sedad', direction: 'in' },
  topup_card: { icon: 'card', label: 'Recharge carte', direction: 'in' },
  p2p_sent: { icon: 'arrow-up', label: 'Transfert envoyé', direction: 'out' },
  p2p_received: { icon: 'arrow-down', label: 'Transfert reçu', direction: 'in' },
  ticket_transit: { icon: 'bus', label: 'Billet transport', direction: 'out' },
  rental_payment: { icon: 'key', label: 'Paiement location', direction: 'out' },
  marketplace_deposit: { icon: 'shield', label: 'Séquestre Trust', direction: 'out' },
  merchant_payment: { icon: 'storefront', label: 'Paiement marchand', direction: 'out' },
  bill_payment: { icon: 'receipt', label: 'Paiement facture', direction: 'out' },
  loyalty_reward: { icon: 'gift', label: 'Récompense Kargo Points', direction: 'in' },
  withdrawal: { icon: 'cash', label: 'Retrait espèces', direction: 'out' },
};

export function monthlySummary(): { inflow: number; outflow: number; net: number } {
  const now = new Date('2026-04-23T14:30:00Z');
  const month = now.getUTCMonth();
  const year = now.getUTCFullYear();
  let inflow = 0;
  let outflow = 0;
  for (const tx of TRANSACTIONS) {
    const d = new Date(tx.createdAt);
    if (d.getUTCMonth() !== month || d.getUTCFullYear() !== year) continue;
    if (tx.status !== 'completed') continue;
    if (tx.amount > 0) inflow += tx.amount;
    else outflow += -tx.amount;
  }
  return { inflow, outflow, net: inflow - outflow };
}
