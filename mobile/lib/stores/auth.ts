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

/** Profil connu pour un numéro, conservé entre deux sessions (survit au signOut).
 *  Permet de re-hydrater le user quand le backend ne connaît pas encore le profil
 *  (onboarding fait offline, puis re-login) ou quand on revient après un signOut. */
type KnownProfile = {
  name: string;
  email?: string;
  city?: string;
  avatarUrl?: string;
};

type State = {
  user: AuthUser | null;
  token: string | null;
  pendingOtp: PendingOtp | null;
  hasOnboarded: boolean;
  knownProfiles: Record<string, KnownProfile>;

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

function rememberProfile(
  registry: Record<string, KnownProfile>,
  user: AuthUser,
): Record<string, KnownProfile> {
  if (!user.name) return registry;
  return {
    ...registry,
    [user.phone]: {
      name: user.name,
      email: user.email,
      city: user.city,
      avatarUrl: user.avatarUrl,
    },
  };
}

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
      knownProfiles: {},

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
        const known = get().knownProfiles[pendingOtp.phone];
        // Si le user actif a le même phone, on conserve son profil. Sinon, on
        // cherche un profil connu (signOut antérieur) pour re-hydrater afin de
        // ne pas re-demander le prénom. Sinon, c'est vraiment un nouveau compte.
        const keepExisting = existing && existing.phone === pendingOtp.phone;
        const user: AuthUser = keepExisting
          ? { ...existing, phoneVerified: true }
          : {
              id: `usr_${Date.now()}`,
              phone: pendingOtp.phone,
              name: known?.name ?? '',
              email: known?.email,
              city: known?.city,
              avatarUrl: known?.avatarUrl,
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
        const { user, knownProfiles } = get();
        if (!user) return;
        const next: AuthUser = {
          ...user,
          name: data.name,
          email: data.email,
          city: data.city,
        };
        set({ user: next, knownProfiles: rememberProfile(knownProfiles, next) });
      },
      signOut: () => set({ user: null, token: null, pendingOtp: null }),
      setOnboarded: () => set({ hasOnboarded: true }),

      setSession: (user, token) => {
        const { knownProfiles } = get();
        const known = knownProfiles[user.phone];
        // Si le backend nous renvoie un user sans name mais qu'on a un profil
        // connu pour ce téléphone (onboarding fait offline ou signOut antérieur),
        // on ré-hydrate. Empêche l'écran Bienvenue de réapparaître.
        const merged: AuthUser =
          user.name || !known
            ? user
            : {
                ...user,
                name: known.name,
                email: user.email ?? known.email,
                city: user.city ?? known.city,
                avatarUrl: user.avatarUrl ?? known.avatarUrl,
              };
        set({
          user: merged,
          token,
          pendingOtp: null,
          knownProfiles: rememberProfile(knownProfiles, merged),
        });
      },

      updateProfile: (patch) => {
        const { user, knownProfiles } = get();
        if (!user) return;
        const next = { ...user, ...patch };
        set({ user: next, knownProfiles: rememberProfile(knownProfiles, next) });
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
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        hasOnboarded: s.hasOnboarded,
        knownProfiles: s.knownProfiles,
      }),
    },
  ),
);
