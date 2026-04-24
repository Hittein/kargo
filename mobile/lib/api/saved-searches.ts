import { api } from './client';

export type ApiSavedSearch = {
  id: string;
  name: string;
  filtersJson: string;
  sort?: string | null;
  query?: string | null;
  category?: string | null;
  freshlyImportedOnly: boolean;
  notifyEnabled: boolean;
  lastMatchCount: number;
  newMatchesSinceLastView: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateSavedSearchPayload = {
  name: string;
  filtersJson: string;
  sort?: string;
  query?: string;
  category?: string;
  freshlyImportedOnly?: boolean;
  notifyEnabled?: boolean;
};

export type UpdateSavedSearchPayload = Partial<CreateSavedSearchPayload>;

export function list() {
  return api.get<ApiSavedSearch[]>('/saved-searches');
}

export function create(body: CreateSavedSearchPayload) {
  return api.post<ApiSavedSearch>('/saved-searches', body);
}

export function update(id: string, body: UpdateSavedSearchPayload) {
  return api.patch<ApiSavedSearch>(`/saved-searches/${encodeURIComponent(id)}`, body);
}

export function markViewed(id: string) {
  return api.post<ApiSavedSearch>(`/saved-searches/${encodeURIComponent(id)}/mark-viewed`);
}

export function remove(id: string) {
  return api.delete<void>(`/saved-searches/${encodeURIComponent(id)}`);
}
