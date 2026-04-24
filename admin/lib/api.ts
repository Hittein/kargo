const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://kargo-api-g00w.onrender.com/api/v1';

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API ${res.status}`);
  }
  return res.json();
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error(`API ${res.status}`);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API ${res.status}`);
  }
  return res.json();
}

export type ApiListing = {
  id: string;
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
  verified: boolean;
  vinVerified: boolean;
  kargoVerified: boolean;
  photos: number;
  photoUrls: string[];
  status: string;
  publishedAt: string;
  viewCount?: number;
  contactCount?: number;
  favoriteCount?: number;
};

export type ApiCompany = {
  id: string;
  name: string;
  type: 'transit' | 'rental';
  city: string;
  contact?: string;
  logoUrl?: string;
  rating: number;
  fleetSize: number;
  status: string;
  createdAt: string;
};

export type ApiRentalListing = {
  id: string;
  companyId?: string;
  companyName?: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  pricePerDayMru: number;
  city: string;
  status: string;
  photos: number;
  photoUrls: string[];
};

export type ApiTrip = {
  id: string;
  companyId: string;
  fromCityId: string;
  toCityId: string;
  fromStop: string;
  toStop: string;
  departure: string;
  priceMru: number;
  seatsTotal: number;
  seatsLeft: number;
  busSize: string;
  status: string;
};

