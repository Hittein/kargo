// Wire shapes mirroring backend DTOs (com.kargo.api.dto.Dtos).
// Keep field names in sync — these are not generated yet.

export type ApiUser = {
  id: string;
  phone: string;
  name: string;
  email?: string;
  city?: string;
  avatarUrl?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  kycLevel: 0 | 1 | 2 | 3;
  hasPin: boolean;
  hasBiometric: boolean;
  trustScore: number;
  createdAt: string;
};

export type ApiAuthResponse = { token: string; user: ApiUser };

export type ApiStartOtp = { challengeId: string; simulatedCode?: string | null };

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
};

export type ApiTrip = {
  id: string;
  companyId: string;
  fromCityId: string;
  toCityId: string;
  fromStop: string;
  toStop: string;
  departure: string;
  arrival: string;
  durationMin: number;
  distanceKm: number;
  priceMru: number;
  seatsTotal: number;
  seatsLeft: number;
  busSize: 'small' | 'medium' | 'big';
  status: string;
};

export type ApiWallet = {
  id: string;
  balanceMru: number;
  points: number;
  killSwitch: boolean;
  dailyLimitMru: number;
  perTxLimitMru: number;
};

export type ApiTransaction = {
  id: string;
  type: string;
  amountMru: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  counterparty: string;
  reference: string;
  note?: string;
  createdAt: string;
};
