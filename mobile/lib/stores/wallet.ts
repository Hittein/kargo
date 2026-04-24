import { create } from 'zustand';
import { walletApi } from '@/lib/api';
import type { ApiTransaction } from '@/lib/api/types';
import { TRANSACTIONS, WALLET_STATE, type Transaction, type TxStatus, type TxType } from '@/lib/mocks/wallet';

type TxFilter = 'all' | 'in' | 'out';

type State = {
  balance: number;
  points: number;
  cardLast4: string;
  cardFrozen: boolean;
  balanceVisible: boolean;
  txFilter: TxFilter;
  txQuery: string;
  transactions: Transaction[];
  hydrating: boolean;
  hydratedAt: number | null;
  toggleBalance: () => void;
  setTxFilter: (f: TxFilter) => void;
  setTxQuery: (q: string) => void;
  toggleCardFreeze: () => void;
  addTransaction: (tx: Transaction) => void;
  debit: (amount: number) => boolean;
  credit: (amount: number) => void;
  addPoints: (n: number) => void;
  hydrate: () => Promise<void>;
};

const ALLOWED_TX_TYPES: TxType[] = [
  'topup_bankily',
  'topup_masrvi',
  'topup_sedad',
  'topup_card',
  'p2p_sent',
  'p2p_received',
  'ticket_transit',
  'rental_payment',
  'marketplace_deposit',
  'merchant_payment',
  'bill_payment',
  'loyalty_reward',
  'withdrawal',
];

function txTypeOf(s: string): TxType {
  return (ALLOWED_TX_TYPES as string[]).includes(s) ? (s as TxType) : 'topup_card';
}

function txStatusOf(s: string): TxStatus {
  if (s === 'pending' || s === 'failed' || s === 'refunded') return s;
  return 'completed';
}

function fromApiTx(t: ApiTransaction): Transaction {
  return {
    id: t.id,
    type: txTypeOf(t.type),
    amount: t.amountMru,
    status: txStatusOf(t.status),
    createdAt: t.createdAt,
    counterparty: t.counterparty,
    note: t.note,
    reference: t.reference,
  };
}

export const useWalletStore = create<State>((set, get) => ({
  balance: WALLET_STATE.balance,
  points: WALLET_STATE.points,
  cardLast4: WALLET_STATE.cardLast4,
  cardFrozen: WALLET_STATE.cardFrozen,
  balanceVisible: true,
  txFilter: 'all',
  txQuery: '',
  transactions: TRANSACTIONS,
  hydrating: false,
  hydratedAt: null,
  toggleBalance: () => set((s) => ({ balanceVisible: !s.balanceVisible })),
  setTxFilter: (txFilter) => set({ txFilter }),
  setTxQuery: (txQuery) => set({ txQuery }),
  toggleCardFreeze: () => set((s) => ({ cardFrozen: !s.cardFrozen })),
  addTransaction: (tx) => set((s) => ({ transactions: [tx, ...s.transactions] })),
  debit: (amount) => {
    const { balance } = get();
    if (balance < amount) return false;
    set({ balance: balance - amount });
    return true;
  },
  credit: (amount) => set((s) => ({ balance: s.balance + amount })),
  addPoints: (n) => set((s) => ({ points: s.points + n })),
  hydrate: async () => {
    if (get().hydrating) return;
    set({ hydrating: true });
    try {
      const [w, txList] = await Promise.all([walletApi.getWallet(), walletApi.listTransactions()]);
      const mapped = txList.map(fromApiTx);
      set({
        balance: w.balanceMru,
        points: w.points,
        transactions: mapped.length > 0 ? mapped : get().transactions,
        hydratedAt: Date.now(),
      });
    } catch {
      // offline / unauth: keep mock state
    } finally {
      set({ hydrating: false });
    }
  },
}));
