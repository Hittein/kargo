import { api } from './client';

export type ApiRentalListing = {
  id: string;
  companyId?: string;
  companyName?: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  pricePerDayMru: number;
  priceWeeklyMru?: number;
  priceMonthlyMru?: number;
  seats: number;
  transmission: 'manual' | 'auto';
  airCon: boolean;
  minDays: number;
  depositMru: number;
  kmIncludedPerDay: number;
  extraKmMru: number;
  chauffeurAvailable: boolean;
  chauffeurPricePerDayMru?: number;
  city: string;
  status: string;
  photos: number;
  photoUrls: string[];
  createdAt: string;
};

export async function listRentals() {
  return api.get<ApiRentalListing[]>('/rental-listings', { auth: false });
}

export async function getRental(id: string) {
  return api.get<ApiRentalListing>(`/rental-listings/${id}`, { auth: false });
}
