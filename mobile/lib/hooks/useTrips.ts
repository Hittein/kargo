import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '@/lib/api';
import type { ApiTrip } from '@/lib/api/types';
import { TRIPS, type Trip, type BusSize } from '@/lib/mocks/transit';

function busSizeOf(s: string): BusSize {
  if (s === 'small' || s === 'medium' || s === 'big') return s;
  return 'medium';
}

export function fromApiTrip(t: ApiTrip): Trip {
  return {
    id: t.id,
    companyId: t.companyId,
    fromCityId: t.fromCityId,
    toCityId: t.toCityId,
    fromStop: t.fromStop,
    toStop: t.toStop,
    departure: t.departure,
    arrival: t.arrival,
    durationMin: t.durationMin,
    distanceKm: t.distanceKm,
    price: t.priceMru,
    seatsTotal: t.seatsTotal,
    seatsLeft: t.seatsLeft,
    busSize: busSizeOf(t.busSize),
    type: 'interurbain',
    direct: true,
    amenities: ['Climatisation'],
    cancelable: true,
  };
}

export function useTrips(params?: { from?: string; to?: string; date?: string }) {
  return useQuery({
    queryKey: ['trips', params?.from, params?.to, params?.date],
    queryFn: async (): Promise<Trip[]> => {
      try {
        const data = params?.from && params?.to
          ? await tripsApi.searchTrips({ from: params.from, to: params.to, date: params.date })
          : await tripsApi.searchTrips({ from: '', to: '' }).catch(() => []);
        const mapped = data.map(fromApiTrip);
        return mapped.length > 0 ? mapped : TRIPS;
      } catch {
        return TRIPS;
      }
    },
    staleTime: 30_000,
  });
}
