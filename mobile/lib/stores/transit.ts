import { create } from 'zustand';
import type { TripFilters, TripSort } from '@/lib/mocks/transit';

export type TripLeg = {
  fromCityId?: string;
  toCityId?: string;
  date: string; // ISO
};

export type TripMode = 'one-way' | 'round-trip' | 'multi';

type State = {
  legs: TripLeg[];
  mode: TripMode;
  returnDate: string | null;
  passengers: number;
  filters: TripFilters;
  sort: TripSort;
  recentSearches: { fromCityId: string; toCityId: string; at: string }[];

  // Champs miroirs du 1er leg pour la rétro-compat des écrans existants.
  fromCityId?: string;
  toCityId?: string;
  date: string;

  setFrom: (id: string) => void;
  setTo: (id: string) => void;
  swap: () => void;
  setDate: (d: string) => void;
  setPassengers: (n: number) => void;

  setMode: (m: TripMode) => void;
  setReturnDate: (d: string | null) => void;
  setLegFrom: (index: number, cityId: string) => void;
  setLegTo: (index: number, cityId: string) => void;
  setLegDate: (index: number, date: string) => void;
  addLeg: () => void;
  removeLeg: (index: number) => void;

  patchFilters: (f: Partial<TripFilters>) => void;
  setFilters: (f: TripFilters) => void;
  setSort: (s: TripSort) => void;
  pushRecent: () => void;
  reset: () => void;
};

function defaultDate(): string {
  return new Date().toISOString();
}

function syncFirstLeg(legs: TripLeg[]): { fromCityId?: string; toCityId?: string; date: string } {
  const first = legs[0];
  return {
    fromCityId: first?.fromCityId,
    toCityId: first?.toCityId,
    date: first?.date ?? defaultDate(),
  };
}

const initialLegs: TripLeg[] = [{ date: defaultDate() }];

export const useTransitStore = create<State>((set, get) => ({
  legs: initialLegs,
  mode: 'one-way',
  returnDate: null,
  passengers: 1,
  filters: {},
  sort: 'early',
  recentSearches: [
    { fromCityId: 'nkt', toCityId: 'ndb', at: '2026-04-22T18:00:00Z' },
    { fromCityId: 'nkt', toCityId: 'atr', at: '2026-04-20T09:12:00Z' },
  ],
  ...syncFirstLeg(initialLegs),

  setFrom: (id) =>
    set((s) => {
      const legs = s.legs.map((l, i) => (i === 0 ? { ...l, fromCityId: id } : l));
      return { legs, ...syncFirstLeg(legs) };
    }),
  setTo: (id) =>
    set((s) => {
      const legs = s.legs.map((l, i) => (i === 0 ? { ...l, toCityId: id } : l));
      // Multi-leg : la 2e étape hérite de la destination précédente si vide.
      if (s.mode === 'multi' && legs[1] && !legs[1].fromCityId) {
        legs[1] = { ...legs[1], fromCityId: id };
      }
      return { legs, ...syncFirstLeg(legs) };
    }),
  swap: () =>
    set((s) => {
      const first = s.legs[0];
      if (!first) return s;
      const legs = s.legs.map((l, i) =>
        i === 0 ? { ...l, fromCityId: first.toCityId, toCityId: first.fromCityId } : l,
      );
      return { legs, ...syncFirstLeg(legs) };
    }),
  setDate: (date) =>
    set((s) => {
      const legs = s.legs.map((l, i) => (i === 0 ? { ...l, date } : l));
      return { legs, ...syncFirstLeg(legs) };
    }),
  setPassengers: (n) => set({ passengers: Math.max(1, Math.min(9, n)) }),

  setMode: (mode) =>
    set((s) => {
      if (mode === 'one-way') {
        const legs = s.legs.slice(0, 1);
        return { mode, returnDate: null, legs, ...syncFirstLeg(legs) };
      }
      if (mode === 'round-trip') {
        const legs = s.legs.slice(0, 1);
        const first = legs[0];
        const returnIso = new Date(new Date(first.date).getTime() + 86_400_000 * 3).toISOString();
        return { mode, returnDate: returnIso, legs, ...syncFirstLeg(legs) };
      }
      // multi
      let legs = s.legs;
      if (legs.length < 2) {
        const first = legs[0];
        const nextDate = new Date(new Date(first.date).getTime() + 86_400_000).toISOString();
        legs = [...legs, { fromCityId: first.toCityId, toCityId: undefined, date: nextDate }];
      }
      return { mode, returnDate: null, legs, ...syncFirstLeg(legs) };
    }),
  setReturnDate: (returnDate) => set({ returnDate }),
  setLegFrom: (index, cityId) =>
    set((s) => {
      const legs = s.legs.map((l, i) => (i === index ? { ...l, fromCityId: cityId } : l));
      return { legs, ...syncFirstLeg(legs) };
    }),
  setLegTo: (index, cityId) =>
    set((s) => {
      const legs = s.legs.map((l, i) => (i === index ? { ...l, toCityId: cityId } : l));
      if (legs[index + 1] && !legs[index + 1].fromCityId) {
        legs[index + 1] = { ...legs[index + 1], fromCityId: cityId };
      }
      return { legs, ...syncFirstLeg(legs) };
    }),
  setLegDate: (index, date) =>
    set((s) => {
      const legs = s.legs.map((l, i) => (i === index ? { ...l, date } : l));
      return { legs, ...syncFirstLeg(legs) };
    }),
  addLeg: () =>
    set((s) => {
      if (s.legs.length >= 5) return s;
      const last = s.legs[s.legs.length - 1];
      const nextDate = new Date(new Date(last.date).getTime() + 86_400_000).toISOString();
      const legs = [
        ...s.legs,
        { fromCityId: last.toCityId, toCityId: undefined, date: nextDate },
      ];
      return { legs };
    }),
  removeLeg: (index) =>
    set((s) => {
      if (s.legs.length <= 1 || index === 0) return s;
      const legs = s.legs.filter((_, i) => i !== index);
      return { legs };
    }),

  patchFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  setFilters: (filters) => set({ filters }),
  setSort: (sort) => set({ sort }),
  pushRecent: () => {
    const { legs, recentSearches } = get();
    const first = legs[0];
    if (!first.fromCityId || !first.toCityId) return;
    const entry = {
      fromCityId: first.fromCityId,
      toCityId: first.toCityId,
      at: new Date().toISOString(),
    };
    const deduped = recentSearches.filter(
      (r) => !(r.fromCityId === first.fromCityId && r.toCityId === first.toCityId),
    );
    set({ recentSearches: [entry, ...deduped].slice(0, 5) });
  },
  reset: () => {
    const legs = [{ date: defaultDate() }];
    set({
      legs,
      mode: 'one-way',
      returnDate: null,
      passengers: 1,
      filters: {},
      sort: 'early',
      ...syncFirstLeg(legs),
    });
  },
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
