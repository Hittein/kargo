import { create } from 'zustand';

const MAX_COMPARE = 3;

type State = {
  ids: string[];
  toggle: (id: string) => { added: boolean; rejected?: 'full' };
  has: (id: string) => boolean;
  clear: () => void;
  remove: (id: string) => void;
  max: number;
};

export const useCompareStore = create<State>((set, get) => ({
  ids: [],
  max: MAX_COMPARE,
  toggle: (id) => {
    const { ids } = get();
    if (ids.includes(id)) {
      set({ ids: ids.filter((x) => x !== id) });
      return { added: false };
    }
    if (ids.length >= MAX_COMPARE) {
      return { added: false, rejected: 'full' };
    }
    set({ ids: [...ids, id] });
    return { added: true };
  },
  has: (id) => get().ids.includes(id),
  clear: () => set({ ids: [] }),
  remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
}));
