import { create } from 'zustand';
import type { SortKey, VehicleFilters } from '@/lib/mocks/vehicles';

type State = {
  query: string;
  filters: VehicleFilters;
  sort: SortKey;
  setQuery: (q: string) => void;
  setFilters: (f: VehicleFilters) => void;
  patchFilters: (f: Partial<VehicleFilters>) => void;
  setSort: (s: SortKey) => void;
  reset: () => void;
};

const emptyFilters: VehicleFilters = {};

export const useMarketplaceStore = create<State>((set) => ({
  query: '',
  filters: emptyFilters,
  sort: 'recent',
  setQuery: (query) => set({ query }),
  setFilters: (filters) => set({ filters }),
  patchFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial } })),
  setSort: (sort) => set({ sort }),
  reset: () => set({ query: '', filters: emptyFilters, sort: 'recent' }),
}));

export function countActiveFilters(f: VehicleFilters): number {
  let n = 0;
  if (f.minPrice != null || f.maxPrice != null) n++;
  if (f.minYear != null) n++;
  if (f.maxKm != null) n++;
  if (f.fuel?.length) n++;
  if (f.transmission?.length) n++;
  if (f.city?.length) n++;
  if (f.verifiedOnly) n++;
  if (f.kargoVerifiedOnly) n++;
  return n;
}
