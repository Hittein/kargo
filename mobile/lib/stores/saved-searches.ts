import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';
import type { SortKey, VehicleCategory, VehicleFilters } from '@/lib/mocks/vehicles';
import { savedSearchesApi } from '@/lib/api';
import type { ApiSavedSearch } from '@/lib/api/saved-searches';

export type SavedSearch = {
  id: string;
  name: string;
  /** Snapshot complet des filtres utilisés (nouvelle forme). */
  filters: VehicleFilters;
  sort?: SortKey;
  /** Texte libre de la barre de recherche au moment de la sauvegarde. */
  query?: string;
  /** Accès rapide à la catégorie pour l'UI de liste. */
  category?: VehicleCategory;
  freshlyImportedOnly?: boolean;
  createdAt: string;
  lastMatchCount: number;
  newMatchesSinceLastView: number;
  notifyEnabled: boolean;
  /** Identifiant backend si synchronisé. */
  remoteId?: string;

  // Champs legacy conservés pour la rétro-compat des entrées INITIAL.
  // Ne plus les écrire pour les nouvelles recherches.
  brand?: string;
  model?: string;
  maxPrice?: number;
  minYear?: number;
  city?: string;
};

type AddInput = {
  name: string;
  filters: VehicleFilters;
  sort?: SortKey;
  query?: string;
  category?: VehicleCategory;
  freshlyImportedOnly?: boolean;
};

const INITIAL: SavedSearch[] = [
  {
    id: 'sav-001',
    name: 'Toyota Hilux < 3M',
    category: 'used',
    filters: {
      category: 'used',
      brand: 'Toyota',
      model: 'Hilux',
      maxPrice: 3_000_000,
      minYear: 2019,
      city: ['Nouakchott'],
    },
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
    filters: { category: 'used' },
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
    filters: {
      category: 'used',
      maxPrice: 2_500_000,
      minYear: 2018,
      city: ['Nouakchott'],
    },
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
  syncing: boolean;
  lastSyncAt?: string;
  /** Ajoute une recherche et retourne son id local. */
  add: (input: AddInput) => string;
  remove: (id: string) => void;
  toggleNotify: (id: string) => void;
  markViewed: (id: string) => void;
  updateMatchCount: (id: string, count: number, newSinceLastView?: number) => void;
  setRemoteId: (id: string, remoteId: string) => void;
  /** Remplace l'ensemble des recherches (après sync serveur). */
  hydrateFromRemote: (list: SavedSearch[]) => void;
  /** Full sync : GET backend + merge local-only entries. */
  syncFromRemote: () => Promise<void>;
};

/** Parse filtersJson du backend vers VehicleFilters (fallback {} si JSON invalide). */
function parseFilters(raw?: string | null): VehicleFilters {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as VehicleFilters;
  } catch {
    return {};
  }
}

/** Mappe un ApiSavedSearch en SavedSearch local (id local = remote id préfixé pour éviter collisions). */
function fromApi(a: ApiSavedSearch): SavedSearch {
  return {
    id: `rem-${a.id}`,
    remoteId: a.id,
    name: a.name,
    filters: parseFilters(a.filtersJson),
    sort: (a.sort as SortKey) || undefined,
    query: a.query ?? undefined,
    category: (a.category as VehicleCategory) || undefined,
    freshlyImportedOnly: a.freshlyImportedOnly,
    createdAt: a.createdAt,
    lastMatchCount: a.lastMatchCount,
    newMatchesSinceLastView: a.newMatchesSinceLastView,
    notifyEnabled: a.notifyEnabled,
  };
}

export const useSavedSearchStore = create<State>()(
  persist(
    (set, get) => ({
      searches: INITIAL,
      syncing: false,
      add: (input) => {
        const id = `sav-${Date.now()}`;
        const entry: SavedSearch = {
          id,
          name: input.name,
          filters: input.filters,
          sort: input.sort,
          query: input.query,
          category: input.category ?? input.filters.category,
          freshlyImportedOnly: input.freshlyImportedOnly,
          createdAt: new Date().toISOString(),
          lastMatchCount: 0,
          newMatchesSinceLastView: 0,
          notifyEnabled: true,
        };
        set((prev) => ({ searches: [entry, ...prev.searches] }));
        // Best-effort backend push. Silent si offline/non-authentifié.
        savedSearchesApi
          .create({
            name: entry.name,
            filtersJson: JSON.stringify(entry.filters ?? {}),
            sort: entry.sort,
            query: entry.query,
            category: entry.category,
            freshlyImportedOnly: entry.freshlyImportedOnly,
            notifyEnabled: entry.notifyEnabled,
          })
          .then((remote) => {
            set((prev) => ({
              searches: prev.searches.map((s) =>
                s.id === id ? { ...s, remoteId: remote.id } : s,
              ),
            }));
          })
          .catch(() => {
            /* offline ou non-auth : l'entrée reste locale, sera re-tentée à la prochaine sync */
          });
        return id;
      },
      remove: (id) => {
        const target = get().searches.find((s) => s.id === id);
        set((prev) => ({ searches: prev.searches.filter((s) => s.id !== id) }));
        if (target?.remoteId) {
          savedSearchesApi.remove(target.remoteId).catch(() => {});
        }
      },
      toggleNotify: (id) => {
        const target = get().searches.find((s) => s.id === id);
        if (!target) return;
        const next = !target.notifyEnabled;
        set((prev) => ({
          searches: prev.searches.map((s) =>
            s.id === id ? { ...s, notifyEnabled: next } : s,
          ),
        }));
        if (target.remoteId) {
          savedSearchesApi
            .update(target.remoteId, { notifyEnabled: next })
            .catch(() => {});
        }
      },
      markViewed: (id) => {
        const target = get().searches.find((s) => s.id === id);
        if (!target) return;
        set((prev) => ({
          searches: prev.searches.map((s) =>
            s.id === id ? { ...s, newMatchesSinceLastView: 0 } : s,
          ),
        }));
        if (target.remoteId) {
          savedSearchesApi.markViewed(target.remoteId).catch(() => {});
        }
      },
      updateMatchCount: (id, count, newSinceLastView) =>
        set((prev) => ({
          searches: prev.searches.map((s) =>
            s.id === id
              ? {
                  ...s,
                  lastMatchCount: count,
                  newMatchesSinceLastView: newSinceLastView ?? s.newMatchesSinceLastView,
                }
              : s,
          ),
        })),
      setRemoteId: (id, remoteId) =>
        set((prev) => ({
          searches: prev.searches.map((s) => (s.id === id ? { ...s, remoteId } : s)),
        })),
      hydrateFromRemote: (list) => set({ searches: list }),
      syncFromRemote: async () => {
        if (get().syncing) return;
        set({ syncing: true });
        try {
          const remote = await savedSearchesApi.list();
          // Les entrées backend font autorité. On garde en plus les locales sans
          // remoteId (créées offline) pour qu'elles soient push plus tard.
          const locals = get().searches.filter((s) => !s.remoteId && !s.id.startsWith('sav-00'));
          const mapped = remote.map(fromApi);
          // Push en arrière-plan les locales non-synchronisées.
          for (const local of locals) {
            savedSearchesApi
              .create({
                name: local.name,
                filtersJson: JSON.stringify(local.filters ?? {}),
                sort: local.sort,
                query: local.query,
                category: local.category,
                freshlyImportedOnly: local.freshlyImportedOnly,
                notifyEnabled: local.notifyEnabled,
              })
              .then((r) => {
                set((prev) => ({
                  searches: prev.searches.map((s) =>
                    s.id === local.id ? { ...s, remoteId: r.id } : s,
                  ),
                }));
              })
              .catch(() => {});
          }
          set({
            searches: [...locals, ...mapped],
            syncing: false,
            lastSyncAt: new Date().toISOString(),
          });
        } catch {
          set({ syncing: false });
        }
      },
    }),
    {
      name: 'kargo:saved-searches',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (s) => ({ searches: s.searches }),
      version: 2,
      migrate: (persisted, fromVersion) => {
        // v1 → v2: migrer les anciennes entrées (top-level fields) vers le nouveau shape filters{}.
        const s = persisted as { searches?: SavedSearch[] } | undefined;
        if (!s?.searches) return { searches: INITIAL } as unknown as State;
        if (fromVersion >= 2) return s as unknown as State;
        const migrated = s.searches.map((entry) => {
          if (entry.filters && Object.keys(entry.filters).length > 0) return entry;
          const filters: VehicleFilters = {
            category: entry.category,
            brand: entry.brand,
            model: entry.model,
            maxPrice: entry.maxPrice,
            minYear: entry.minYear,
            city: entry.city ? [entry.city] : undefined,
          };
          return { ...entry, filters };
        });
        return { searches: migrated } as unknown as State;
      },
    },
  ),
);
