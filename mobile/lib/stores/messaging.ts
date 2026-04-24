import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';
import { conversationsApi } from '@/lib/api';
import type { ApiConversation, ApiMessage } from '@/lib/api/conversations';

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

function contextFromApi(c: ApiConversation): MessageContext {
  switch (c.kind) {
    case 'LISTING':
      return { kind: 'listing', vehicleId: c.listingId ?? '' };
    case 'RENTAL':
      return { kind: 'rental', rentalId: c.listingId ?? '' };
    case 'TRIP':
      return { kind: 'trip', tripId: c.listingId ?? '' };
    case 'SUPPORT':
    default:
      return { kind: 'support' };
  }
}

function threadFromApi(c: ApiConversation): ChatThread {
  return {
    id: c.id,
    context: contextFromApi(c),
    partnerName: c.partnerName,
    partnerAvatarUrl: c.partnerAvatarUrl ?? undefined,
    partnerVerified: true,
    lastMessage: c.lastMessagePreview ?? '',
    lastAt: c.lastMessageAt,
    unread: c.unread,
  };
}

function messageFromApi(m: ApiMessage): ChatMessage {
  return {
    id: m.id,
    threadId: m.conversationId,
    fromMe: m.fromMe,
    text: m.text,
    createdAt: m.createdAt,
    read: m.readAt != null,
  };
}

type State = {
  threads: ChatThread[];
  messages: Record<string, ChatMessage[]>;
  syncing: boolean;
  /** Crée ou retrouve la conversation pour un context donné. Retourne l'id backend. */
  ensureThread: (context: MessageContext) => Promise<string | null>;
  /** Envoie un message via backend. Ajoute la réponse serveur au store. */
  send: (threadId: string, text: string) => Promise<void>;
  /** Sync backend → store : conversations + messages du thread courant si fourni. */
  syncFromBackend: (focusedThreadId?: string) => Promise<void>;
  markRead: (threadId: string) => Promise<void>;
  remove: (threadId: string) => void;
};

export const useMessagingStore = create<State>()(
  persist(
    (set, get) => ({
      threads: [],
      messages: {},
      syncing: false,

      ensureThread: async (context) => {
        try {
          let body: { kind: string; listingId?: string };
          if (context.kind === 'listing') {
            body = { kind: 'LISTING', listingId: context.vehicleId };
          } else if (context.kind === 'support') {
            body = { kind: 'SUPPORT' };
          } else {
            // rental/trip pas encore supportés côté backend — fallback support pour V1.
            body = { kind: 'SUPPORT' };
          }
          const c = await conversationsApi.start(body as never);
          const thread = threadFromApi(c);
          set((s) => {
            const existing = s.threads.find((t) => t.id === thread.id);
            return {
              threads: existing
                ? s.threads.map((t) => (t.id === thread.id ? { ...t, ...thread } : t))
                : [thread, ...s.threads],
            };
          });
          return thread.id;
        } catch {
          return null;
        }
      },

      send: async (threadId, text) => {
        // Optimistic: on ajoute le message localement immédiatement.
        const tempId = `pending_${Date.now()}`;
        const optimistic: ChatMessage = {
          id: tempId,
          threadId,
          fromMe: true,
          text,
          createdAt: new Date().toISOString(),
          read: true,
        };
        set((s) => ({
          messages: { ...s.messages, [threadId]: [...(s.messages[threadId] ?? []), optimistic] },
          threads: s.threads.map((t) =>
            t.id === threadId ? { ...t, lastMessage: text, lastAt: optimistic.createdAt } : t,
          ),
        }));

        try {
          const real = await conversationsApi.sendMessage(threadId, text);
          // Remplace l'optimistic par le message persistant.
          set((s) => ({
            messages: {
              ...s.messages,
              [threadId]: (s.messages[threadId] ?? []).map((m) =>
                m.id === tempId ? messageFromApi(real) : m,
              ),
            },
          }));
        } catch {
          // Laisse l'optimistic avec un marqueur "pending" si besoin (V2).
        }
      },

      syncFromBackend: async (focusedThreadId) => {
        if (get().syncing) return;
        set({ syncing: true });
        try {
          const list = await conversationsApi.list();
          const threads = list.map(threadFromApi);
          set((s) => ({ threads, syncing: false }));
          if (focusedThreadId) {
            try {
              const msgs = await conversationsApi.listMessages(focusedThreadId);
              set((s) => ({
                messages: { ...s.messages, [focusedThreadId]: msgs.map(messageFromApi) },
              }));
            } catch {
              /* ignore */
            }
          }
        } catch {
          set({ syncing: false });
        }
      },

      markRead: async (threadId) => {
        set((s) => ({
          threads: s.threads.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t)),
          messages: {
            ...s.messages,
            [threadId]: (s.messages[threadId] ?? []).map((m) => ({ ...m, read: true })),
          },
        }));
        try {
          await conversationsApi.markRead(threadId);
        } catch {
          /* silent */
        }
      },

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
      version: 2,
      migrate: () => ({ threads: [], messages: {}, syncing: false }) as never,
    },
  ),
);
