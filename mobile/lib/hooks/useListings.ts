import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import type { ApiListing } from '@/lib/api/types';
import { VEHICLES, type Vehicle, type FuelType, type Transmission } from '@/lib/mocks/vehicles';

function fuelOf(s: string): FuelType {
  const v = s.toLowerCase();
  if (v === 'diesel' || v === 'petrol' || v === 'hybrid' || v === 'electric') return v as FuelType;
  return 'petrol';
}

function transmissionOf(s: string): Transmission {
  return s === 'auto' ? 'auto' : 'manual';
}

function aiVerdict(price: number): 'deal' | 'fair' | 'high' | 'risk' {
  if (price < 500_000) return 'deal';
  if (price > 3_000_000) return 'high';
  return 'fair';
}

export function fromApi(l: ApiListing): Vehicle {
  return {
    id: l.id,
    category: 'used',
    brand: l.brand,
    model: l.model,
    year: l.year,
    importYear: l.importYear,
    ownersInCountry: l.ownersInCountry,
    price: l.priceMru,
    km: l.km,
    fuel: fuelOf(l.fuel),
    transmission: transmissionOf(l.transmission),
    city: l.city,
    district: l.district,
    sellerName: l.sellerName,
    sellerType: l.sellerType,
    verified: l.verified,
    vinVerified: l.vinVerified,
    kargoVerified: l.kargoVerified,
    publishedAt: l.publishedAt,
    photos: l.photos,
    photoUrls: l.photoUrls,
    aiVerdict: aiVerdict(l.priceMru),
    highlights: [],
  };
}

/**
 * Returns the live list of vehicles from the backend, falling back to the
 * bundled VEHICLES mocks if the network call fails (offline / cold-start).
 */
export function useVehicles() {
  return useQuery({
    queryKey: ['listings'],
    queryFn: async (): Promise<Vehicle[]> => {
      try {
        const data = await listingsApi.listListings();
        const mapped = data.map(fromApi);
        return mapped.length > 0 ? mapped : VEHICLES;
      } catch {
        return VEHICLES;
      }
    },
    staleTime: 60_000,
  });
}

export function useVehicle(id: string | undefined) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async (): Promise<Vehicle | undefined> => {
      if (!id) return undefined;
      try {
        const data = await listingsApi.getListing(id);
        return fromApi(data);
      } catch {
        return VEHICLES.find((v) => v.id === id);
      }
    },
    enabled: !!id,
    staleTime: 60_000,
  });
}
