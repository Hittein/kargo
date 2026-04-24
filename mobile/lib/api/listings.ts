import { api } from './client';
import type { ApiListing } from './types';

export async function listListings() {
  return api.get<ApiListing[]>('/listings', { auth: false });
}

export async function getListing(id: string) {
  return api.get<ApiListing>(`/listings/${id}`, { auth: false });
}
