import { api } from './client';
import type { ApiListing } from './types';

export async function listListings() {
  return api.get<ApiListing[]>('/listings', { auth: false });
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
