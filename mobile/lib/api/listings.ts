import { api } from './client';
import type { ApiListing } from './types';

export type CreateListingPayload = {
  brand: string;
  model: string;
  year: number;
  importYear?: number;
  ownersInCountry: number;
  priceMru: number;
  km: number;
  fuel: string;
  transmission: string;
  city: string;
  district?: string;
  sellerName: string;
  sellerType: 'particulier' | 'pro';
  kargoVerified: boolean;
  photoUrls: string[];
};

export async function listListings() {
  return api.get<ApiListing[]>('/listings', { auth: false });
}

export async function createListing(body: CreateListingPayload) {
  return api.post<ApiListing>('/listings', body);
}

export async function getListing(id: string) {
  return api.get<ApiListing>(`/listings/${id}`, { auth: false });
}

export async function listMyListings() {
  return api.get<ApiListing[]>('/users/me/listings');
}

export async function trackView(id: string) {
  return api.post<void>(`/listings/${encodeURIComponent(id)}/view`, undefined, {
    auth: false,
  });
}

export async function trackContact(id: string) {
  return api.post<void>(`/listings/${encodeURIComponent(id)}/contact`, undefined, {
    auth: false,
  });
}
