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
  // Timeout large : Render free tier met parfois 30s+ à se réveiller d'un cold start.
  // Sans ce buffer on perd les publications silencieusement.
  return api.post<ApiListing>('/listings', body, { timeoutMs: 45_000 });
}

export async function getListing(id: string) {
  return api.get<ApiListing>(`/listings/${id}`, { auth: false });
}

export async function listMyListings() {
  return api.get<ApiListing[]>('/users/me/listings');
}

// Note: auth:true par défaut — si l'user est connecté, le header Bearer part et
// le backend enregistre une ligne ListingView + UserActivity. Si pas connecté,
// la route reste publique (permitAll), le call marche quand même sans token.
export async function trackView(id: string) {
  return api.post<void>(`/listings/${encodeURIComponent(id)}/view`, undefined);
}

export async function trackContact(id: string) {
  return api.post<void>(`/listings/${encodeURIComponent(id)}/contact`, undefined);
}
