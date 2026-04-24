import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';

export type MessageContext =
  | { kind: 'listing'; vehicleId: string }
  | { kind: 'rental'; rentalId: string }
  | { kind: 'trip'; tripId: string }
  | { kind: 'support' };

export type ChatMessage = {
  id: string;
  threadId: string;
  fromMe: boolean;
  text: string;
  createdAt: string;
  read: boolean;
};

export type ChatThread = {
  id: string;
  context: MessageContext;
  partnerName: string;
  partnerAvatarUrl?: string;
  partnerVerified: boolean;
  lastMessage: string;
  lastAt: string;
  unread: number;
};

const seedThreads: ChatThread[] = [
  {
    id: 't_seed_1',
    context: { kind: 'listing', vehicleId: 'v_001' },
    partnerName: 'Mohamed Vall',
    partnerVerified: true,
    lastMessage: 'D\'accord, je peux passer demain à 14h pour voir la voiture.',
    lastAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    unread: 2,
  },
  {
    id: 't_seed_2',
    context: { kind: 'rental', rentalId: 'r_001' },
    partnerName: 'Agence Sahara Rent',
    partnerVerified: true,
    lastMessage: 'Bonjour, votre Hyundai Tucson est prête pour 8h.',
    lastAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    unread: 0,
  },
  {
    id: 't_seed_3',
    context: { kind: 'trip', tripId: 'tr_001' },
    partnerName: 'Compagnie El Bourrak',
    partnerVerified: true,
    lastMessage: 'Votre billet a été utilisé. Bon voyage !',
    lastAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    unread: 0,
  },
  {
    id: 't_seed_4',
    context: { kind: 'support' },
    partnerName: 'Support Kargo',
    partnerVerified: true,
    lastMessage: 'Comment pouvons-nous vous aider ?',
    lastAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    unread: 0,
  },
];

const seedMessages: Record<string, ChatMessage[]> = {
  t_seed_1: [
    {
      id: 'm_1',
      threadId: 't_seed_1',
      fromMe: true,
      text: 'Bonjour, la voiture est-elle toujours disponible ?',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: true,
    },
    {
      id: 'm_2',
      threadId: 't_seed_1',
      fromMe: false,
      text: 'Oui, vous pouvez passer la voir.',
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      read: true,
    },
    {
      id: 'm_3',
      threadId: 't_seed_1',
      fromMe: true,
      text: 'Demain 14h ça vous va ?',
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      read: true,
    },
    {
      id: 'm_4',
      threadId: 't_seed_1',
      fromMe: false,
      text: "D'accord, je peux passer demain à 14h pour voir la voiture.",
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      read: false,
    },
  ],
  t_seed_2: [
    {
      id: 'm_5',
      threadId: 't_seed_2',
      fromMe: false,
      text: 'Bonjour, votre Hyundai Tucson est prête pour 8h.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      read: true,
    },
  ],
  t_seed_3: [
    {
      id: 'm_6',
      threadId: 't_seed_3',
      fromMe: false,
      text: 'Votre billet a été utilisé. Bon voyage !',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      read: true,
    },
  ],
  t_seed_4: [
    {
      id: 'm_7',
      threadId: 't_seed_4',
      fromMe: false,
      text: 'Comment pouvons-nous vous aider ?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      read: true,
    },
  ],
};

type State = {
  threads: ChatThread[];
  messages: Record<string, ChatMessage[]>;
  ensureThread: (context: MessageContext, partnerName: string, partnerAvatarUrl?: string) => string;
  send: (threadId: string, text: string) => void;
  markRead: (threadId: string) => void;
  remove: (threadId: string) => void;
};

export const useMessagingStore = create<State>()(
  persist(
    (set, get) => ({
      threads: seedThreads,
      messages: seedMessages,
      ensureThread: (context, partnerName, partnerAvatarUrl) => {
        const existing = get().threads.find((t) => sameContext(t.context, context));
        if (existing) return existing.id;
        const id = `t_${Date.now()}`;
        const newThread: ChatThread = {
          id,
          context,
          partnerName,
          partnerAvatarUrl,
          partnerVerified: true,
          lastMessage: '',
          lastAt: new Date().toISOString(),
          unread: 0,
        };
        set((s) => ({
          threads: [newThread, ...s.threads],
          messages: { ...s.messages, [id]: [] },
        }));
        return id;
      },
      send: (threadId, text) => {
        const msg: ChatMessage = {
          id: `m_${Date.now()}`,
          threadId,
          fromMe: true,
          text,
          createdAt: new Date().toISOString(),
          read: true,
        };
        set((s) => ({
          messages: { ...s.messages, [threadId]: [...(s.messages[threadId] ?? []), msg] },
          threads: s.threads.map((t) =>
            t.id === threadId ? { ...t, lastMessage: text, lastAt: msg.createdAt } : t,
          ),
        }));
        setTimeout(() => {
          const reply: ChatMessage = {
            id: `m_${Date.now()}_r`,
            threadId,
            fromMe: false,
            text: simulatedReply(text),
            createdAt: new Date().toISOString(),
            read: false,
          };
          useMessagingStore.setState((s) => ({
            messages: { ...s.messages, [threadId]: [...(s.messages[threadId] ?? []), reply] },
            threads: s.threads.map((t) =>
              t.id === threadId
                ? {
                    ...t,
                    lastMessage: reply.text,
                    lastAt: reply.createdAt,
                    unread: t.unread + 1,
                  }
                : t,
            ),
          }));
        }, 1500 + Math.random() * 1500);
      },
      markRead: (threadId) =>
        set((s) => ({
          threads: s.threads.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t)),
          messages: {
            ...s.messages,
            [threadId]: (s.messages[threadId] ?? []).map((m) => ({ ...m, read: true })),
          },
        })),
      remove: (threadId) =>
        set((s) => ({
          threads: s.threads.filter((t) => t.id !== threadId),
          messages: Object.fromEntries(
            Object.entries(s.messages).filter(([k]) => k !== threadId),
          ),
        })),
    }),
    {
      name: 'kargo:messaging',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

function sameContext(a: MessageContext, b: MessageContext) {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'listing' && b.kind === 'listing') return a.vehicleId === b.vehicleId;
  if (a.kind === 'rental' && b.kind === 'rental') return a.rentalId === b.rentalId;
  if (a.kind === 'trip' && b.kind === 'trip') return a.tripId === b.tripId;
  if (a.kind === 'support' && b.kind === 'support') return true;
  return false;
}

function simulatedReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('prix') || t.includes('combien')) return 'Le prix est ferme, désolé.';
  if (t.includes('rendez-vous') || t.includes('voir') || t.includes('passer'))
    return "D'accord, je vous confirme dès que possible.";
  if (t.includes('merci')) return 'Avec plaisir !';
  if (t.includes('disponible') || t.includes('encore')) return 'Oui, toujours disponible.';
  return 'Bien reçu, je reviens vers vous.';
}
