import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';

export type Review = {
  id: string;
  kind: 'seller' | 'agency' | 'company' | 'trip';
  targetId: string;
  targetName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
};

const seed: Review[] = [
  {
    id: 'rv_seed_1',
    kind: 'company',
    targetId: 'cmp_001',
    targetName: 'Compagnie El Bourrak',
    rating: 5,
    comment: 'Bus confortable, ponctualité parfaite. À recommander.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'rv_seed_2',
    kind: 'agency',
    targetId: 'ag_001',
    targetName: 'Sahara Rent',
    rating: 4,
    comment: "Voiture propre, livraison à l'aéroport rapide.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
];

type State = {
  given: Review[];
  received: Review[];
  add: (r: Omit<Review, 'id' | 'createdAt'>) => string;
  remove: (id: string) => void;
};

export const useReviewsStore = create<State>()(
  persist(
    (set) => ({
      given: seed,
      received: [
        {
          id: 'rv_rcv_1',
          kind: 'seller',
          targetId: 'me',
          targetName: 'Acheteur',
          rating: 5,
          comment: 'Vendeur sérieux, voiture conforme à l\'annonce.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
        },
      ],
      add: (r) => {
        const id = `rv_${Date.now()}`;
        set((s) => ({
          given: [{ ...r, id, createdAt: new Date().toISOString() }, ...s.given],
        }));
        return id;
      },
      remove: (id) =>
        set((s) => ({ given: s.given.filter((r) => r.id !== id) })),
    }),
    {
      name: 'kargo:reviews',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
