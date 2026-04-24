import { create } from 'zustand';
import { TRANSACTIONS, WALLET_STATE, type Transaction } from '@/lib/mocks/wallet';

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
  toggleBalance: () => void;
  setTxFilter: (f: TxFilter) => void;
  setTxQuery: (q: string) => void;
  toggleCardFreeze: () => void;
  addTransaction: (tx: Transaction) => void;
  debit: (amount: number) => boolean;
  credit: (amount: number) => void;
  addPoints: (n: number) => void;
};

export const useWalletStore = create<State>((set, get) => ({
  balance: WALLET_STATE.balance,
  points: WALLET_STATE.points,
  cardLast4: WALLET_STATE.cardLast4,
  cardFrozen: WALLET_STATE.cardFrozen,
  balanceVisible: true,
  txFilter: 'all',
  txQuery: '',
  transactions: TRANSACTIONS,
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
}));
