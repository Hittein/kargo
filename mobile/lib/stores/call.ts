import { create } from 'zustand';

/**
 * Machine d'états d'un appel in-app Kargo (Agora).
 *
 *   idle ──start()──▶ connecting ──onJoined()──▶ active ──end()──▶ ended ──reset()──▶ idle
 *                  │                          │
 *                  └── onError() / end() ─────┘
 */
export type CallStatus =
  | 'idle'
  | 'connecting' // token fetch + join du canal
  | 'active' // au moins le local est joint (peer peut être en train d'arriver)
  | 'ended';

export type CallMode = 'audio' | 'video';

export type CallPeer = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type CallTokenBundle = {
  appId: string;
  channelName: string;
  uid: number;
  token: string;
  mode: CallMode;
  ttlSeconds: number;
};

export type RemoteParticipant = {
  uid: number;
  hasAudio: boolean;
  hasVideo: boolean;
  joinedAt: number;
};

type State = {
  status: CallStatus;
  mode: CallMode;
  /** true = écran plein visible ; false = bubble flottante. */
  expanded: boolean;
  /** true = l'appel est ouvert par l'utilisateur courant. */
  outgoing: boolean;

  conversationId?: string;
  peer?: CallPeer;
  bundle?: CallTokenBundle;

  /** Horodatage du "connecting" — sert au chrono. */
  startedAt?: number;
  /** Horodatage de "active" (premier peer joint OU moi joint). */
  connectedAt?: number;

  micEnabled: boolean;
  cameraEnabled: boolean;
  speakerOn: boolean;

  /** Peers distants qui ont rejoint le canal (hors soi). */
  remotes: RemoteParticipant[];

  error?: string;

  // --- Actions (appelées par le driver) ---
  begin: (params: {
    conversationId: string;
    peer: CallPeer;
    mode: CallMode;
    outgoing: boolean;
  }) => void;
  setBundle: (bundle: CallTokenBundle) => void;
  onJoined: () => void;
  onRemoteJoined: (uid: number) => void;
  onRemoteLeft: (uid: number) => void;
  onRemoteAudio: (uid: number, enabled: boolean) => void;
  onRemoteVideo: (uid: number, enabled: boolean) => void;
  onError: (msg: string) => void;
  end: () => void;
  reset: () => void;

  toggleMic: () => void;
  toggleCamera: () => void;
  toggleSpeaker: () => void;
  switchMode: (mode: CallMode) => void;
  setExpanded: (v: boolean) => void;
};

export const useCallStore = create<State>((set, get) => ({
  status: 'idle',
  mode: 'audio',
  expanded: true,
  outgoing: false,
  micEnabled: true,
  cameraEnabled: false,
  speakerOn: false,
  remotes: [],

  begin: ({ conversationId, peer, mode, outgoing }) =>
    set({
      status: 'connecting',
      mode,
      outgoing,
      expanded: true,
      conversationId,
      peer,
      startedAt: Date.now(),
      connectedAt: undefined,
      remotes: [],
      micEnabled: true,
      cameraEnabled: mode === 'video',
      speakerOn: mode === 'video',
      error: undefined,
      bundle: undefined,
    }),

  setBundle: (bundle) => set({ bundle }),

  onJoined: () => {
    const { status } = get();
    if (status === 'connecting' || status === 'idle') {
      set({ status: 'active', connectedAt: Date.now() });
    }
  },

  onRemoteJoined: (uid) =>
    set((s) => {
      if (s.remotes.find((r) => r.uid === uid)) return s;
      return {
        remotes: [
          ...s.remotes,
          { uid, hasAudio: true, hasVideo: s.mode === 'video', joinedAt: Date.now() },
        ],
      };
    }),
  onRemoteLeft: (uid) =>
    set((s) => ({ remotes: s.remotes.filter((r) => r.uid !== uid) })),
  onRemoteAudio: (uid, enabled) =>
    set((s) => ({
      remotes: s.remotes.map((r) => (r.uid === uid ? { ...r, hasAudio: enabled } : r)),
    })),
  onRemoteVideo: (uid, enabled) =>
    set((s) => ({
      remotes: s.remotes.map((r) => (r.uid === uid ? { ...r, hasVideo: enabled } : r)),
    })),

  onError: (msg) => set({ error: msg, status: 'ended' }),

  end: () => set({ status: 'ended' }),

  reset: () =>
    set({
      status: 'idle',
      mode: 'audio',
      expanded: true,
      outgoing: false,
      conversationId: undefined,
      peer: undefined,
      bundle: undefined,
      startedAt: undefined,
      connectedAt: undefined,
      micEnabled: true,
      cameraEnabled: false,
      speakerOn: false,
      remotes: [],
      error: undefined,
    }),

  toggleMic: () => set((s) => ({ micEnabled: !s.micEnabled })),
  toggleCamera: () => set((s) => ({ cameraEnabled: !s.cameraEnabled })),
  toggleSpeaker: () => set((s) => ({ speakerOn: !s.speakerOn })),
  switchMode: (mode) =>
    set((s) => ({
      mode,
      cameraEnabled: mode === 'video' ? true : s.cameraEnabled,
    })),
  setExpanded: (v) => set({ expanded: v }),
}));

/** Helper format duration mm:ss pour l'UI. */
export function formatCallDuration(startMs?: number): string {
  if (!startMs) return '00:00';
  const sec = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
