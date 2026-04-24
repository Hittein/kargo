import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';

type State = {
  vehicles: string[];
  rentals: string[];
  trips: string[];
  toggle: (kind: 'vehicles' | 'rentals' | 'trips', id: string) => void;
  isFav: (kind: 'vehicles' | 'rentals' | 'trips', id: string) => boolean;
  clear: (kind?: 'vehicles' | 'rentals' | 'trips') => void;
};

export const useFavoritesStore = create<State>()(
  persist(
    (set, get) => ({
      vehicles: [],
      rentals: [],
      trips: [],
      toggle: (kind, id) =>
        set((s) => {
          const list = s[kind];
          return {
            [kind]: list.includes(id) ? list.filter((x) => x !== id) : [id, ...list],
          } as Partial<State> as State;
        }),
      isFav: (kind, id) => get()[kind].includes(id),
      clear: (kind) =>
        set(() =>
          kind
            ? ({ [kind]: [] } as Partial<State> as State)
            : { vehicles: [], rentals: [], trips: [] },
        ),
    }),
    {
      name: 'kargo:favorites',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
