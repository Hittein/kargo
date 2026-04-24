import { create } from 'zustand';
import type { TripFilters, TripSort } from '@/lib/mocks/transit';

type State = {
  fromCityId?: string;
  toCityId?: string;
  date: string;
  passengers: number;
  filters: TripFilters;
  sort: TripSort;
  recentSearches: { fromCityId: string; toCityId: string; at: string }[];
  setFrom: (id: string) => void;
  setTo: (id: string) => void;
  swap: () => void;
  setDate: (d: string) => void;
  setPassengers: (n: number) => void;
  patchFilters: (f: Partial<TripFilters>) => void;
  setFilters: (f: TripFilters) => void;
  setSort: (s: TripSort) => void;
  pushRecent: () => void;
  reset: () => void;
};

function defaultDate(): string {
  const d = new Date('2026-04-24T00:00:00Z');
  return d.toISOString();
}

export const useTransitStore = create<State>((set, get) => ({
  fromCityId: undefined,
  toCityId: undefined,
  date: defaultDate(),
  passengers: 1,
  filters: {},
  sort: 'early',
  recentSearches: [
    { fromCityId: 'nkt', toCityId: 'ndb', at: '2026-04-22T18:00:00Z' },
    { fromCityId: 'nkt', toCityId: 'atr', at: '2026-04-20T09:12:00Z' },
  ],
  setFrom: (id) => set({ fromCityId: id }),
  setTo: (id) => set({ toCityId: id }),
  swap: () => {
    const { fromCityId, toCityId } = get();
    set({ fromCityId: toCityId, toCityId: fromCityId });
  },
  setDate: (date) => set({ date }),
  setPassengers: (n) => set({ passengers: Math.max(1, Math.min(9, n)) }),
  patchFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  setFilters: (filters) => set({ filters }),
  setSort: (sort) => set({ sort }),
  pushRecent: () => {
    const { fromCityId, toCityId, recentSearches } = get();
    if (!fromCityId || !toCityId) return;
    const entry = { fromCityId, toCityId, at: new Date().toISOString() };
    const deduped = recentSearches.filter(
      (r) => !(r.fromCityId === fromCityId && r.toCityId === toCityId),
    );
    set({ recentSearches: [entry, ...deduped].slice(0, 5) });
  },
  reset: () =>
    set({
      fromCityId: undefined,
      toCityId: undefined,
      date: defaultDate(),
      passengers: 1,
      filters: {},
      sort: 'early',
    }),
}));

export function countTripFilters(f: TripFilters): number {
  let n = 0;
  if (f.companyIds?.length) n++;
  if (f.maxPrice != null) n++;
  if (f.minDepartHour != null || f.maxDepartHour != null) n++;
  if (f.directOnly) n++;
  if (f.busSize) n++;
  return n;
}
