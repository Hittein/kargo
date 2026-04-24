import { useQuery } from '@tanstack/react-query';
import { rentalsApi } from '@/lib/api';
import type { ApiRentalListing } from '@/lib/api/rentals';
import {
  RENTALS,
  type RentalCategory,
  type RentalListing,
  type RentalTransmission,
} from '@/lib/mocks/rentals';

const CATEGORIES: RentalCategory[] = ['economique', 'standard', 'premium', 'utilitaire', '4x4'];

function categoryOf(s: string): RentalCategory {
  return (CATEGORIES as string[]).includes(s) ? (s as RentalCategory) : 'standard';
}

function transmissionOf(s: string): RentalTransmission {
  return s === 'auto' ? 'auto' : 'manual';
}

export function fromApi(r: ApiRentalListing): RentalListing {
  return {
    id: r.id,
    brand: r.brand,
    model: r.model,
    year: r.year,
    category: categoryOf(r.category),
    pricePerDay: r.pricePerDayMru,
    priceWeekly: r.priceWeeklyMru,
    priceMonthly: r.priceMonthlyMru,
    seats: r.seats,
    transmission: transmissionOf(r.transmission),
    airCon: r.airCon,
    minDays: r.minDays,
    depositMRU: r.depositMru,
    kmIncludedPerDay: r.kmIncludedPerDay,
    extraKmMRU: r.extraKmMru,
    chauffeurAvailable: r.chauffeurAvailable,
    chauffeurPricePerDay: r.chauffeurPricePerDayMru,
    cities: [r.city],
    photoUrls: r.photoUrls ?? [],
    photos: r.photos,
    agency: r.companyName ?? 'Kargo Partner',
    verified: true,
    rating: 4.7,
    reviewsCount: 0,
    equipment: [],
  };
}

export function useRentals() {
  return useQuery({
    queryKey: ['rentals'],
    queryFn: async (): Promise<RentalListing[]> => {
      try {
        const data = await rentalsApi.listRentals();
        const mapped = data.map(fromApi);
        return mapped.length > 0 ? mapped : RENTALS;
      } catch {
        return RENTALS;
      }
    },
    staleTime: 60_000,
  });
}

export function useRental(id: string | undefined) {
  return useQuery({
    queryKey: ['rental', id],
    queryFn: async (): Promise<RentalListing | undefined> => {
      if (!id) return undefined;
      try {
        return fromApi(await rentalsApi.getRental(id));
      } catch {
        return RENTALS.find((r) => r.id === id);
      }
    },
    enabled: !!id,
    staleTime: 60_000,
  });
}
