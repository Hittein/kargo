export type RentalCategory = 'economique' | 'standard' | 'premium' | 'utilitaire' | '4x4';
export type RentalTransmission = 'manual' | 'auto';

export type RentalOption = {
  key: string;
  label: string;
  pricePerDay: number;
  icon: string;
};

export type RentalListing = {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: RentalCategory;
  pricePerDay: number;
  priceWeekly?: number;
  priceMonthly?: number;
  seats: number;
  transmission: RentalTransmission;
  airCon: boolean;
  minDays: number;
  depositMRU: number;
  kmIncludedPerDay: number;
  extraKmMRU: number;
  chauffeurAvailable: boolean;
  chauffeurPricePerDay?: number;
  cities: string[];
  photoUrls: string[];
  photos: number;
  agency: string;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  equipment: string[];
};

export type RentalBooking = {
  id: string;
  listingId: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  pickupCity: string;
  totalMRU: number;
  withChauffeur: boolean;
};

const RENTAL_PHOTO_POOL: Record<RentalCategory, string[]> = {
  economique: [
    'https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=900&q=70',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&q=70',
    'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=900&q=70',
  ],
  standard: [
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=70',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&q=70',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=70',
  ],
  premium: [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=70',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&q=70',
    'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=900&q=70',
  ],
  utilitaire: [
    'https://images.unsplash.com/photo-1605515298946-d0573716f0bd?w=900&q=70',
    'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=900&q=70',
    'https://images.unsplash.com/photo-1597007030739-6d2e7172ee6c?w=900&q=70',
  ],
  '4x4': [
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&q=70',
    'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=900&q=70',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=70',
  ],
};

export const RENTAL_CATEGORY_LABEL: Record<RentalCategory, string> = {
  economique: 'Économique',
  standard: 'Standard',
  premium: 'Premium',
  utilitaire: 'Utilitaire',
  '4x4': '4×4 / SUV',
};

export const RENTAL_OPTIONS: RentalOption[] = [
  { key: 'chauffeur', label: 'Avec chauffeur', pricePerDay: 4000, icon: 'person' },
  { key: 'childSeat', label: 'Siège enfant', pricePerDay: 500, icon: 'body' },
  { key: 'delivery', label: 'Livraison en ville', pricePerDay: 1500, icon: 'location' },
  { key: 'insurance', label: 'Assurance tous risques', pricePerDay: 2500, icon: 'shield-checkmark' },
  { key: 'extraKm', label: '+100 km / jour', pricePerDay: 1200, icon: 'speedometer' },
];

export const RENTALS: RentalListing[] = [
  {
    id: 'rnt-001',
    brand: 'Kia',
    model: 'Picanto',
    year: 2022,
    category: 'economique',
    pricePerDay: 8_000,
    priceWeekly: 50_000,
    priceMonthly: 180_000,
    seats: 4,
    transmission: 'manual',
    airCon: true,
    minDays: 1,
    depositMRU: 30_000,
    kmIncludedPerDay: 150,
    extraKmMRU: 50,
    chauffeurAvailable: false,
    cities: ['Nouakchott', 'Nouadhibou'],
    photoUrls: RENTAL_PHOTO_POOL.economique,
    photos: 9,
    agency: 'Sahel Rent',
    verified: true,
    rating: 4.6,
    reviewsCount: 42,
    equipment: ['Climatisation', 'Bluetooth', 'USB'],
  },
  {
    id: 'rnt-002',
    brand: 'Hyundai',
    model: 'Accent',
    year: 2023,
    category: 'standard',
    pricePerDay: 12_000,
    priceWeekly: 75_000,
    priceMonthly: 270_000,
    seats: 5,
    transmission: 'auto',
    airCon: true,
    minDays: 1,
    depositMRU: 50_000,
    kmIncludedPerDay: 200,
    extraKmMRU: 60,
    chauffeurAvailable: true,
    chauffeurPricePerDay: 4_000,
    cities: ['Nouakchott'],
    photoUrls: RENTAL_PHOTO_POOL.standard,
    photos: 12,
    agency: 'Nouakchott Motors',
    verified: true,
    rating: 4.8,
    reviewsCount: 118,
    equipment: ['Climatisation', 'Boîte auto', 'GPS', 'Apple CarPlay'],
  },
  {
    id: 'rnt-003',
    brand: 'Toyota',
    model: 'Land Cruiser',
    year: 2022,
    category: '4x4',
    pricePerDay: 45_000,
    priceWeekly: 290_000,
    priceMonthly: 1_050_000,
    seats: 7,
    transmission: 'auto',
    airCon: true,
    minDays: 2,
    depositMRU: 250_000,
    kmIncludedPerDay: 250,
    extraKmMRU: 150,
    chauffeurAvailable: true,
    chauffeurPricePerDay: 6_000,
    cities: ['Nouakchott', 'Atar', 'Zouérate'],
    photoUrls: RENTAL_PHOTO_POOL['4x4'],
    photos: 18,
    agency: 'Adrar Expéditions',
    verified: true,
    rating: 4.9,
    reviewsCount: 76,
    equipment: ['4×4', '7 places', 'Climatisation', 'GPS désert', 'Treuil'],
  },
  {
    id: 'rnt-004',
    brand: 'Mercedes-Benz',
    model: 'Classe C',
    year: 2023,
    category: 'premium',
    pricePerDay: 35_000,
    priceWeekly: 220_000,
    priceMonthly: 800_000,
    seats: 5,
    transmission: 'auto',
    airCon: true,
    minDays: 1,
    depositMRU: 200_000,
    kmIncludedPerDay: 200,
    extraKmMRU: 120,
    chauffeurAvailable: true,
    chauffeurPricePerDay: 5_000,
    cities: ['Nouakchott'],
    photoUrls: RENTAL_PHOTO_POOL.premium,
    photos: 14,
    agency: 'Prestige Cars MR',
    verified: true,
    rating: 4.7,
    reviewsCount: 38,
    equipment: ['Cuir', 'Toit ouvrant', 'Climatisation bi-zone', 'GPS'],
  },
  {
    id: 'rnt-005',
    brand: 'Toyota',
    model: 'Hilux',
    year: 2021,
    category: 'utilitaire',
    pricePerDay: 22_000,
    priceWeekly: 140_000,
    priceMonthly: 500_000,
    seats: 5,
    transmission: 'manual',
    airCon: true,
    minDays: 1,
    depositMRU: 100_000,
    kmIncludedPerDay: 200,
    extraKmMRU: 80,
    chauffeurAvailable: true,
    chauffeurPricePerDay: 4_500,
    cities: ['Nouakchott', 'Rosso', 'Kaédi'],
    photoUrls: RENTAL_PHOTO_POOL.utilitaire,
    photos: 11,
    agency: 'Sahara Trucks',
    verified: true,
    rating: 4.5,
    reviewsCount: 54,
    equipment: ['Double cabine', 'Plateau', 'Climatisation'],
  },
  {
    id: 'rnt-006',
    brand: 'Renault',
    model: 'Clio',
    year: 2021,
    category: 'economique',
    pricePerDay: 7_000,
    priceWeekly: 42_000,
    priceMonthly: 150_000,
    seats: 5,
    transmission: 'manual',
    airCon: true,
    minDays: 1,
    depositMRU: 25_000,
    kmIncludedPerDay: 150,
    extraKmMRU: 45,
    chauffeurAvailable: false,
    cities: ['Nouakchott'],
    photoUrls: RENTAL_PHOTO_POOL.economique,
    photos: 7,
    agency: 'Yakoub Rental',
    verified: false,
    rating: 4.1,
    reviewsCount: 12,
    equipment: ['Climatisation', 'USB'],
  },
];

export function getRentalById(id: string): RentalListing | undefined {
  return RENTALS.find((r) => r.id === id);
}

export type RentalFilters = {
  city?: string;
  category?: RentalCategory;
  withChauffeur?: boolean;
  transmission?: RentalTransmission;
  minSeats?: number;
  maxPricePerDay?: number;
};

export function filterRentals(list: RentalListing[], f: RentalFilters): RentalListing[] {
  return list.filter((r) => {
    if (f.city && !r.cities.includes(f.city)) return false;
    if (f.category && r.category !== f.category) return false;
    if (f.withChauffeur && !r.chauffeurAvailable) return false;
    if (f.transmission && r.transmission !== f.transmission) return false;
    if (f.minSeats != null && r.seats < f.minSeats) return false;
    if (f.maxPricePerDay != null && r.pricePerDay > f.maxPricePerDay) return false;
    return true;
  });
}

export const MY_RENTALS: RentalBooking[] = [
  {
    id: 'book-001',
    listingId: 'rnt-002',
    status: 'in_progress',
    startDate: '2026-04-21',
    endDate: '2026-04-25',
    pickupCity: 'Nouakchott',
    totalMRU: 48_000,
    withChauffeur: false,
  },
  {
    id: 'book-002',
    listingId: 'rnt-003',
    status: 'confirmed',
    startDate: '2026-05-02',
    endDate: '2026-05-09',
    pickupCity: 'Atar',
    totalMRU: 315_000,
    withChauffeur: true,
  },
  {
    id: 'book-003',
    listingId: 'rnt-001',
    status: 'completed',
    startDate: '2026-03-10',
    endDate: '2026-03-14',
    pickupCity: 'Nouakchott',
    totalMRU: 32_000,
    withChauffeur: false,
  },
  {
    id: 'book-004',
    listingId: 'rnt-004',
    status: 'pending',
    startDate: '2026-06-01',
    endDate: '2026-06-03',
    pickupCity: 'Nouakchott',
    totalMRU: 70_000,
    withChauffeur: false,
  },
];
