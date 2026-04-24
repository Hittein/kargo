import { create } from 'zustand';
import type { RentalFilters } from '@/lib/mocks/rentals';

export type RentalSearch = {
  city?: string;
  startDate?: string;
  endDate?: string;
  category?: RentalFilters['category'];
};

export type RentalQuote = {
  listingId?: string;
  days: number;
  basePerDay: number;
  optionsPerDay: number;
  chauffeurPerDay: number;
  selectedOptions: string[];
  withChauffeur: boolean;
  deliveryCity?: string;
};

type State = {
  search: RentalSearch;
  filters: RentalFilters;
  quote: RentalQuote;
  kycDone: boolean;
  setSearch: (s: Partial<RentalSearch>) => void;
  setFilters: (f: Partial<RentalFilters>) => void;
  setQuote: (q: Partial<RentalQuote>) => void;
  toggleOption: (key: string, pricePerDay: number) => void;
  setChauffeur: (on: boolean, pricePerDay: number) => void;
  setKycDone: (done: boolean) => void;
  reset: () => void;
};

const initialQuote: RentalQuote = {
  days: 0,
  basePerDay: 0,
  optionsPerDay: 0,
  chauffeurPerDay: 0,
  selectedOptions: [],
  withChauffeur: false,
};

export const useRentalStore = create<State>((set, get) => ({
  search: {},
  filters: {},
  quote: initialQuote,
  kycDone: false,
  setSearch: (s) => set((prev) => ({ search: { ...prev.search, ...s } })),
  setFilters: (f) => set((prev) => ({ filters: { ...prev.filters, ...f } })),
  setQuote: (q) => set((prev) => ({ quote: { ...prev.quote, ...q } })),
  toggleOption: (key, pricePerDay) => {
    const q = get().quote;
    const selected = q.selectedOptions.includes(key);
    const nextSelected = selected
      ? q.selectedOptions.filter((k) => k !== key)
      : [...q.selectedOptions, key];
    const nextOptionsPerDay = selected
      ? q.optionsPerDay - pricePerDay
      : q.optionsPerDay + pricePerDay;
    set({
      quote: { ...q, selectedOptions: nextSelected, optionsPerDay: nextOptionsPerDay },
    });
  },
  setChauffeur: (on, pricePerDay) => {
    const q = get().quote;
    set({
      quote: { ...q, withChauffeur: on, chauffeurPerDay: on ? pricePerDay : 0 },
    });
  },
  setKycDone: (done) => set({ kycDone: done }),
  reset: () => set({ search: {}, filters: {}, quote: initialQuote, kycDone: false }),
}));

export function quoteTotal(q: RentalQuote): number {
  return q.days * (q.basePerDay + q.optionsPerDay + q.chauffeurPerDay);
}
