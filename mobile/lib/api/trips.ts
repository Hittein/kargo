import { api } from './client';
import type { ApiTrip } from './types';

export async function searchTrips(params: { from: string; to: string; date?: string }) {
  return api.get<ApiTrip[]>('/trips', { auth: false, query: params });
}
