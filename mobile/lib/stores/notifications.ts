import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';

export type NotifCategory =
  | 'message'
  | 'transit'
  | 'rental'
  | 'marketplace'
  | 'wallet'
  | 'trust'
  | 'promo'
  | 'system';

export type Notif = {
  id: string;
  category: NotifCategory;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  archived: boolean;
  href?: string;
};

export type NotifPrefs = {
  push: Record<NotifCategory, boolean>;
  email: Record<NotifCategory, boolean>;
  sms: Record<NotifCategory, boolean>;
  silentStart: string;
  silentEnd: string;
  silentEnabled: boolean;
  digest: 'realtime' | 'daily' | 'weekly';
};

const allCats: NotifCategory[] = [
  'message',
  'transit',
  'rental',
  'marketplace',
  'wallet',
  'trust',
  'promo',
  'system',
];

const defaults = (initial: boolean): Record<NotifCategory, boolean> =>
  Object.fromEntries(allCats.map((c) => [c, initial])) as Record<NotifCategory, boolean>;

const seed: Notif[] = [
  {
    id: 'n_seed_1',
    category: 'transit',
    title: 'Billet confirmé — Nouakchott → Nouadhibou',
    body: 'Départ demain à 08:30, place 12. QR disponible dans Mes billets.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    archived: false,
    href: '/(tabs)/tickets',
  },
  {
    id: 'n_seed_2',
    category: 'wallet',
    title: 'Recharge réussie',
    body: '+5 000 MRU depuis Bankily. Solde : 27 350 MRU.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: false,
    archived: false,
    href: '/wallet',
  },
  {
    id: 'n_seed_3',
    category: 'marketplace',
    title: 'Nouvelle baisse de prix',
    body: 'Toyota Corolla 2018 — 215 000 MRU (−10 000).',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    read: true,
    archived: false,
  },
  {
    id: 'n_seed_4',
    category: 'trust',
    title: 'Inspection programmée',
    body: 'Mardi 10h, garage Kargo Verified Nouakchott Tevragh-Zeina.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    read: true,
    archived: false,
  },
];

type State = {
  items: Notif[];
  prefs: NotifPrefs;
  push: (n: Omit<Notif, 'id' | 'createdAt' | 'read' | 'archived'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  archive: (id: string) => void;
  remove: (id: string) => void;
  unreadCount: () => number;
  setPushPref: (cat: NotifCategory, value: boolean) => void;
  setEmailPref: (cat: NotifCategory, value: boolean) => void;
  setSmsPref: (cat: NotifCategory, value: boolean) => void;
  setSilent: (enabled: boolean, start?: string, end?: string) => void;
  setDigest: (digest: NotifPrefs['digest']) => void;
};

export const useNotificationsStore = create<State>()(
  persist(
    (set, get) => ({
      items: seed,
      prefs: {
        push: defaults(true),
        email: { ...defaults(false), wallet: true, trust: true, system: true },
        sms: { ...defaults(false), transit: true, wallet: true },
        silentStart: '22:00',
        silentEnd: '07:00',
        silentEnabled: true,
        digest: 'realtime',
      },
      push: (n) =>
        set((s) => ({
          items: [
            {
              ...n,
              id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              createdAt: new Date().toISOString(),
              read: false,
              archived: false,
            },
            ...s.items,
          ],
        })),
      markRead: (id) =>
        set((s) => ({
          items: s.items.map((it) => (it.id === id ? { ...it, read: true } : it)),
        })),
      markAllRead: () =>
        set((s) => ({ items: s.items.map((it) => ({ ...it, read: true })) })),
      archive: (id) =>
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id ? { ...it, archived: true, read: true } : it,
          ),
        })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
      unreadCount: () =>
        get().items.filter((it) => !it.read && !it.archived).length,
      setPushPref: (cat, value) =>
        set((s) => ({ prefs: { ...s.prefs, push: { ...s.prefs.push, [cat]: value } } })),
      setEmailPref: (cat, value) =>
        set((s) => ({
          prefs: { ...s.prefs, email: { ...s.prefs.email, [cat]: value } },
        })),
      setSmsPref: (cat, value) =>
        set((s) => ({ prefs: { ...s.prefs, sms: { ...s.prefs.sms, [cat]: value } } })),
      setSilent: (enabled, start, end) =>
        set((s) => ({
          prefs: {
            ...s.prefs,
            silentEnabled: enabled,
            silentStart: start ?? s.prefs.silentStart,
            silentEnd: end ?? s.prefs.silentEnd,
          },
        })),
      setDigest: (digest) => set((s) => ({ prefs: { ...s.prefs, digest } })),
    }),
    {
      name: 'kargo:notifications',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
