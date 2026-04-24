import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';

export type VirtualCard = {
  id: string;
  name: string;
  last4: string;
  expMonth: number;
  expYear: number;
  monthlyLimit: number;
  spent: number;
  frozen: boolean;
  createdAt: string;
};

export type BnplPlan = {
  id: string;
  label: string;
  total: number;
  installments: { dueAt: string; amount: number; paid: boolean }[];
  status: 'active' | 'completed' | 'late';
  createdAt: string;
};

export type WalletSettings = {
  pinEnabled: boolean;
  biometricEnabled: boolean;
  dailyLimit: number;
  perTxLimit: number;
  killSwitch: boolean;
};

type State = {
  cards: VirtualCard[];
  bnpl: BnplPlan[];
  settings: WalletSettings;
  createCard: (name: string, monthlyLimit: number) => string;
  toggleFreeze: (id: string) => void;
  removeCard: (id: string) => void;
  addBnpl: (label: string, total: number, monthsCount: 3 | 4 | 6) => string;
  payBnplInstallment: (planId: string, idx: number) => void;
  setSettings: (patch: Partial<WalletSettings>) => void;
};

const seedCards: VirtualCard[] = [
  {
    id: 'c_seed_1',
    name: 'Achats en ligne',
    last4: '4821',
    expMonth: 12,
    expYear: 2027,
    monthlyLimit: 50000,
    spent: 12750,
    frozen: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
];

export const useWalletExtraStore = create<State>()(
  persist(
    (set) => ({
      cards: seedCards,
      bnpl: [],
      settings: {
        pinEnabled: true,
        biometricEnabled: false,
        dailyLimit: 100000,
        perTxLimit: 50000,
        killSwitch: false,
      },
      createCard: (name, monthlyLimit) => {
        const id = `c_${Date.now()}`;
        const last4 = String(Math.floor(1000 + Math.random() * 9000));
        set((s) => ({
          cards: [
            {
              id,
              name,
              last4,
              expMonth: 12,
              expYear: new Date().getFullYear() + 3,
              monthlyLimit,
              spent: 0,
              frozen: false,
              createdAt: new Date().toISOString(),
            },
            ...s.cards,
          ],
        }));
        return id;
      },
      toggleFreeze: (id) =>
        set((s) => ({
          cards: s.cards.map((c) => (c.id === id ? { ...c, frozen: !c.frozen } : c)),
        })),
      removeCard: (id) =>
        set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),
      addBnpl: (label, total, monthsCount) => {
        const id = `bnpl_${Date.now()}`;
        const each = Math.round(total / monthsCount);
        const installments = Array.from({ length: monthsCount }, (_, i) => ({
          dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * (i + 1)).toISOString(),
          amount: i === monthsCount - 1 ? total - each * (monthsCount - 1) : each,
          paid: i === 0,
        }));
        set((s) => ({
          bnpl: [
            {
              id,
              label,
              total,
              installments,
              status: 'active',
              createdAt: new Date().toISOString(),
            },
            ...s.bnpl,
          ],
        }));
        return id;
      },
      payBnplInstallment: (planId, idx) =>
        set((s) => ({
          bnpl: s.bnpl.map((p) => {
            if (p.id !== planId) return p;
            const installments = p.installments.map((it, i) =>
              i === idx ? { ...it, paid: true } : it,
            );
            const status = installments.every((i) => i.paid) ? 'completed' : p.status;
            return { ...p, installments, status };
          }),
        })),
      setSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: 'kargo:wallet-extra',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
