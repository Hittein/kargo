import { create } from 'zustand';
import type { VehicleCategory } from '@/lib/mocks/vehicles';

export type SavedSearch = {
  id: string;
  name: string;
  category?: VehicleCategory;
  brand?: string;
  model?: string;
  maxPrice?: number;
  minYear?: number;
  city?: string;
  freshlyImportedOnly?: boolean;
  createdAt: string;
  lastMatchCount: number;
  newMatchesSinceLastView: number;
  notifyEnabled: boolean;
};

const INITIAL: SavedSearch[] = [
  {
    id: 'sav-001',
    name: 'Toyota Hilux < 3M',
    category: 'used',
    brand: 'Toyota',
    model: 'Hilux',
    maxPrice: 3_000_000,
    minYear: 2019,
    city: 'Nouakchott',
    createdAt: '2026-04-15T10:00:00Z',
    lastMatchCount: 14,
    newMatchesSinceLastView: 3,
    notifyEnabled: true,
  },
  {
    id: 'sav-002',
    name: 'Fraîchement dédouanée',
    category: 'used',
    freshlyImportedOnly: true,
    createdAt: '2026-04-20T08:30:00Z',
    lastMatchCount: 6,
    newMatchesSinceLastView: 2,
    notifyEnabled: true,
  },
  {
    id: 'sav-003',
    name: 'SUV Premium Nouakchott',
    category: 'used',
    maxPrice: 2_500_000,
    minYear: 2018,
    city: 'Nouakchott',
    createdAt: '2026-03-28T14:15:00Z',
    lastMatchCount: 22,
    newMatchesSinceLastView: 0,
    notifyEnabled: false,
  },
];

type State = {
  searches: SavedSearch[];
  add: (s: Omit<SavedSearch, 'id' | 'createdAt' | 'lastMatchCount' | 'newMatchesSinceLastView' | 'notifyEnabled'>) => void;
  remove: (id: string) => void;
  toggleNotify: (id: string) => void;
  markViewed: (id: string) => void;
};

export const useSavedSearchStore = create<State>((set) => ({
  searches: INITIAL,
  add: (s) =>
    set((prev) => ({
      searches: [
        {
          ...s,
          id: `sav-${Date.now()}`,
          createdAt: new Date().toISOString(),
          lastMatchCount: Math.floor(Math.random() * 30) + 1,
          newMatchesSinceLastView: 0,
          notifyEnabled: true,
        },
        ...prev.searches,
      ],
    })),
  remove: (id) => set((prev) => ({ searches: prev.searches.filter((s) => s.id !== id) })),
  toggleNotify: (id) =>
    set((prev) => ({
      searches: prev.searches.map((s) =>
        s.id === id ? { ...s, notifyEnabled: !s.notifyEnabled } : s,
      ),
    })),
  markViewed: (id) =>
    set((prev) => ({
      searches: prev.searches.map((s) =>
        s.id === id ? { ...s, newMatchesSinceLastView: 0 } : s,
      ),
    })),
}));
