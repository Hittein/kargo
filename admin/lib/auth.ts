'use client';
import { create } from 'zustand';

type State = {
  isAuthed: boolean;
  email: string | null;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
  hydrate: () => void;
};

const ACCEPTED = ['admin', 'kargo', 'demo'];

export const useAdminAuth = create<State>((set) => ({
  isAuthed: false,
  email: null,
  signIn: (email, password) => {
    if (!email.includes('@')) return false;
    if (!ACCEPTED.includes(password)) return false;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kargo:admin', JSON.stringify({ email }));
    }
    set({ isAuthed: true, email });
    return true;
  },
  signOut: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('kargo:admin');
    set({ isAuthed: false, email: null });
  },
  hydrate: () => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('kargo:admin');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      set({ isAuthed: true, email: parsed.email });
    } catch {
      // ignore
    }
  },
}));
