import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';

export type AuthUser = {
  id: string;
  phone: string;
  name: string;
  email?: string;
  city?: string;
  avatarUrl?: string;
  createdAt: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  kycLevel: 0 | 1 | 2 | 3;
  hasPin: boolean;
  hasBiometric: boolean;
};

type PendingOtp = {
  phone: string;
  code: string;
  expiresAt: number;
  attempts: number;
};

type State = {
  user: AuthUser | null;
  token: string | null;
  pendingOtp: PendingOtp | null;
  hasOnboarded: boolean;

  startSignIn: (phone: string) => string;
  verifyOtp: (code: string) => { ok: boolean; reason?: 'expired' | 'invalid' | 'too_many' };
  resendOtp: () => string;
  completeProfile: (data: { name: string; email?: string; city?: string }) => void;
  signOut: () => void;
  setOnboarded: () => void;

  /** Hydrate from backend (used by /auth/verify and /users/me responses). */
  setSession: (user: AuthUser, token: string) => void;

  updateProfile: (patch: Partial<Omit<AuthUser, 'id' | 'createdAt'>>) => void;
  setKycLevel: (level: 0 | 1 | 2 | 3) => void;
  setPin: (enabled: boolean) => void;
  setBiometric: (enabled: boolean) => void;
};

const SIM_OTP_TTL_MS = 5 * 60 * 1000;

function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const useAuthStore = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      pendingOtp: null,
      hasOnboarded: false,

      startSignIn: (phone) => {
        const code = genOtp();
        set({
          pendingOtp: {
            phone,
            code,
            expiresAt: Date.now() + SIM_OTP_TTL_MS,
            attempts: 0,
          },
        });
        return code;
      },
      verifyOtp: (code) => {
        const { pendingOtp } = get();
        if (!pendingOtp) return { ok: false, reason: 'invalid' };
        if (Date.now() > pendingOtp.expiresAt) return { ok: false, reason: 'expired' };
        if (pendingOtp.attempts >= 5) return { ok: false, reason: 'too_many' };
        const accepts = code === pendingOtp.code || code === '0000' || code === '000000';
        if (!accepts) {
          set({
            pendingOtp: { ...pendingOtp, attempts: pendingOtp.attempts + 1 },
          });
          return { ok: false, reason: 'invalid' };
        }
        const now = new Date().toISOString();
        const existing = get().user;
        // Si le user existant a le même phone, on conserve son profil ; sinon
        // c'est une nouvelle inscription : on part sur un user vierge pour
        // éviter de récupérer un "name" fantôme d'une session précédente.
        const keepExisting = existing && existing.phone === pendingOtp.phone;
        const user: AuthUser = keepExisting
          ? { ...existing, phoneVerified: true }
          : {
              id: `usr_${Date.now()}`,
              phone: pendingOtp.phone,
              name: '',
              createdAt: now,
              emailVerified: false,
              phoneVerified: true,
              kycLevel: 0,
              hasPin: false,
              hasBiometric: false,
            };
        set({
          user,
          token: `sim_${user.id}_${Date.now()}`,
          pendingOtp: null,
        });
        return { ok: true };
      },
      resendOtp: () => {
        const { pendingOtp } = get();
        if (!pendingOtp) return '';
        const code = genOtp();
        set({
          pendingOtp: {
            ...pendingOtp,
            code,
            expiresAt: Date.now() + SIM_OTP_TTL_MS,
            attempts: 0,
          },
        });
        return code;
      },
      completeProfile: (data) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            name: data.name,
            email: data.email,
            city: data.city,
          },
        });
      },
      signOut: () => set({ user: null, token: null, pendingOtp: null }),
      setOnboarded: () => set({ hasOnboarded: true }),

      setSession: (user, token) => set({ user, token, pendingOtp: null }),

      updateProfile: (patch) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, ...patch } });
      },
      setKycLevel: (level) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, kycLevel: level } });
      },
      setPin: (enabled) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, hasPin: enabled } });
      },
      setBiometric: (enabled) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, hasBiometric: enabled } });
      },
    }),
    {
      name: 'kargo:auth',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (s) => ({ user: s.user, token: s.token, hasOnboarded: s.hasOnboarded }),
    },
  ),
);
