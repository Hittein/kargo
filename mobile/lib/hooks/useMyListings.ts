import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import type { ApiListing } from '@/lib/api/types';
import { MY_LISTINGS, type MyListing } from '@/lib/mocks/my-listings';

function fromApi(a: ApiListing): MyListing {
  return {
    id: a.id,
    brand: a.brand,
    model: a.model,
    year: a.year,
    price: a.priceMru,
    km: a.km,
    city: a.city,
    photoUrl: a.photoUrls?.[0] ?? '',
    status: (a.status as MyListing['status']) ?? 'active',
    views: a.viewCount ?? 0,
    leads: a.contactCount ?? 0,
    favorites: a.favoriteCount ?? 0,
    publishedAt: a.publishedAt,
  };
}

/**
 * Annonces du seller connecté. Tombe sur les mocks si backend offline
 * ou si l'utilisateur n'a encore rien publié (liste vide → on renvoie
 * vide, pas le mock — le mock n'est que pour le cas "API down").
 */
export function useMyListings() {
  return useQuery({
    queryKey: ['my-listings'],
    queryFn: async (): Promise<MyListing[]> => {
      try {
        const data = await listingsApi.listMyListings();
        return data.map(fromApi);
      } catch {
        return MY_LISTINGS;
      }
    },
    staleTime: 30_000,
  });
}
