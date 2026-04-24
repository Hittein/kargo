import type { StateStorage } from 'zustand/middleware';

type Backend = {
  set: (k: string, v: string) => void;
  getString: (k: string) => string | undefined;
  delete: (k: string) => void;
  clearAll: () => void;
};

let backend: Backend;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MMKV } = require('react-native-mmkv');
  const mmkv = new MMKV({ id: 'kargo-app' });
  backend = {
    set: (k, v) => mmkv.set(k, v),
    getString: (k) => mmkv.getString(k),
    delete: (k) => mmkv.delete(k),
    clearAll: () => mmkv.clearAll(),
  };
} catch {
  const mem = new Map<string, string>();
  backend = {
    set: (k, v) => {
      mem.set(k, v);
    },
    getString: (k) => mem.get(k),
    delete: (k) => {
      mem.delete(k);
    },
    clearAll: () => mem.clear(),
  };
}

export const storage = backend;

export const mmkvStorage: StateStorage = {
  setItem: (name, value) => backend.set(name, value),
  getItem: (name) => backend.getString(name) ?? null,
  removeItem: (name) => backend.delete(name),
};

export function clearAllPersistedState() {
  backend.clearAll();
}
