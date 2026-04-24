export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';
export type Transmission = 'manual' | 'auto';
export type AIVerdict = 'deal' | 'fair' | 'high' | 'risk';
export type VehicleCategory = 'used' | 'new' | 'export' | 'rental';

export type Vehicle = {
  id: string;
  category: VehicleCategory;
  brand: string;
  model: string;
  year: number;
  importYear?: number;
  ownersInCountry: number;
  price: number;
  km: number;
  fuel: FuelType;
  transmission: Transmission;
  city: string;
  district?: string;
  sellerName: string;
  sellerType: 'particulier' | 'pro';
  verified: boolean;
  vinVerified: boolean;
  kargoVerified: boolean;
  publishedAt: string;
  photos: number;
  photoUrls: string[];
  aiVerdict: AIVerdict;
  aiEstimate?: { low: number; high: number };
  highlights: string[];
  premium?: boolean;
};

export const CURRENT_YEAR = 2026;

export function isFreshlyImported(v: Vehicle): boolean {
  return v.importYear === CURRENT_YEAR && v.ownersInCountry === 0;
}

const CAR_PHOTO_POOL: Record<string, string[]> = {
  sedan: [
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=70',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=70',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&q=70',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=70',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=900&q=70',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=900&q=70',
    'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=900&q=70',
    'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=900&q=70',
    'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&q=70',
    'https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=900&q=70',
  ],
  suv: [
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&q=70',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=70',
    'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=900&q=70',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&q=70',
    'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=900&q=70',
    'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=900&q=70',
    'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=900&q=70',
    'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=900&q=70',
    'https://images.unsplash.com/photo-1542228262-3d663b306a53?w=900&q=70',
    'https://images.unsplash.com/photo-1547038577-da80abbc4f19?w=900&q=70',
  ],
  pickup: [
    'https://images.unsplash.com/photo-1595923533867-9dac6e2c5dec?w=900&q=70',
    'https://images.unsplash.com/photo-1605515298946-d0573716f0bd?w=900&q=70',
    'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=900&q=70',
    'https://images.unsplash.com/photo-1597007030739-6d2e7172ee6c?w=900&q=70',
    'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=900&q=70',
    'https://images.unsplash.com/photo-1567808291548-fc3ee04dbcf0?w=900&q=70',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=900&q=70',
    'https://images.unsplash.com/photo-1602510088818-0fdc5d9e6dd9?w=900&q=70',
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=900&q=70',
    'https://images.unsplash.com/photo-1551830820-330a71b99659?w=900&q=70',
  ],
  compact: [
    'https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=900&q=70',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&q=70',
    'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=900&q=70',
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&q=70',
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=900&q=70',
    'https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=900&q=70',
    'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=900&q=70',
    'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=900&q=70',
    'https://images.unsplash.com/photo-1542228262-3d663b306a53?w=900&q=70',
    'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=900&q=70',
  ],
};

const INTERIOR_POOL = [
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&q=70',
  'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=900&q=70',
  'https://images.unsplash.com/photo-1577496549804-8b2dde2e72eb?w=900&q=70',
  'https://images.unsplash.com/photo-1517994112540-009c47ea476b?w=900&q=70',
  'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=900&q=70',
  'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?w=900&q=70',
];

/**
 * Build a photo set whose length matches the requested count by interleaving body shots
 * and interior shots, so the carousel counter ("1 / N") always equals the swipeable pages.
 */
function buildPhotoSet(category: keyof typeof CAR_PHOTO_POOL, count: number): string[] {
  const body = CAR_PHOTO_POOL[category];
  const out: string[] = [];
  let interiorIdx = 0;
  for (let i = 0; i < count; i++) {
    if (i > 0 && i % 4 === 0) {
      out.push(INTERIOR_POOL[interiorIdx % INTERIOR_POOL.length]);
      interiorIdx++;
    } else {
      out.push(body[i % body.length]);
    }
  }
  return out;
}

export const VEHICLES: Vehicle[] = [
  {
    id: 'veh-001',
    category: 'used',
    brand: 'Toyota',
    model: 'Yaris',
    year: 2018,
    importYear: 2019,
    ownersInCountry: 2,
    price: 450_000,
    km: 45_000,
    fuel: 'petrol',
    transmission: 'auto',
    city: 'Nouakchott',
    district: 'Tevragh Zeina',
    sellerName: 'Ahmed O.',
    sellerType: 'particulier',
    verified: true,
    vinVerified: true,
    kargoVerified: false,
    publishedAt: '2026-04-19T08:00:00Z',
    photos: 12,
    photoUrls: buildPhotoSet('compact', 12),
    aiVerdict: 'deal',
    aiEstimate: { low: 470_000, high: 520_000 },
    highlights: ['1er propriétaire', 'Entretien à jour', 'Climatisation'],
  },
  {
    id: 'veh-002',
    category: 'used',
    brand: 'Hyundai',
    model: 'Tucson',
    year: 2020,
    importYear: 2021,
    ownersInCountry: 1,
    price: 1_200_000,
    km: 32_000,
    fuel: 'diesel',
    transmission: 'auto',
    city: 'Nouakchott',
    district: 'Sebkha',
    sellerName: 'Nouakchott Motors',
    sellerType: 'pro',
    verified: true,
    vinVerified: true,
    kargoVerified: true,
    publishedAt: '2026-04-20T14:30:00Z',
    photos: 18,
    photoUrls: buildPhotoSet('suv', 18),
    aiVerdict: 'fair',
    aiEstimate: { low: 1_150_000, high: 1_280_000 },
    highlights: ['Kargo Verified', 'Garantie 6 mois', 'GPS intégré'],
    premium: true,
  },
  {
    id: 'veh-003',
    category: 'used',
    brand: 'Kia',
    model: 'Picanto',
    year: 2019,
    importYear: 2020,
    ownersInCountry: 3,
    price: 380_000,
    km: 68_000,
    fuel: 'petrol',
    transmission: 'manual',
    city: 'Nouadhibou',
    sellerName: 'Mariem S.',
    sellerType: 'particulier',
    verified: true,
    vinVerified: false,
    kargoVerified: false,
    publishedAt: '2026-04-18T10:15:00Z',
    photos: 8,
    photoUrls: buildPhotoSet('compact', 8),
    aiVerdict: 'deal',
    aiEstimate: { low: 400_000, high: 440_000 },
    highlights: ['Faible consommation', 'Idéale ville'],
  },
  {
    id: 'veh-004',
    category: 'used',
    brand: 'Toyota',
    model: 'Hilux',
    year: 2021,
    importYear: 2026,
    ownersInCountry: 0,
    price: 2_450_000,
    km: 28_000,
    fuel: 'diesel',
    transmission: 'manual',
    city: 'Nouakchott',
    district: 'Ksar',
    sellerName: 'Sahara Trucks',
    sellerType: 'pro',
    verified: true,
    vinVerified: true,
    kargoVerified: true,
    publishedAt: '2026-04-21T09:00:00Z',
    photos: 22,
    photoUrls: buildPhotoSet('pickup', 22),
    aiVerdict: 'fair',
    aiEstimate: { low: 2_400_000, high: 2_550_000 },
    highlights: ['4×4', 'Kargo Verified', 'Double cabine'],
    premium: true,
  },
  {
    id: 'veh-005',
    category: 'used',
    brand: 'Mercedes-Benz',
    model: 'Classe E',
    year: 2017,
    importYear: 2018,
    ownersInCountry: 2,
    price: 1_800_000,
    km: 95_000,
    fuel: 'diesel',
    transmission: 'auto',
    city: 'Nouakchott',
    district: 'Tevragh Zeina',
    sellerName: 'Cheikh A.',
    sellerType: 'particulier',
    verified: true,
    vinVerified: true,
    kargoVerified: false,
    publishedAt: '2026-04-17T16:45:00Z',
    photos: 15,
    photoUrls: buildPhotoSet('sedan', 15),
    aiVerdict: 'high',
    aiEstimate: { low: 1_500_000, high: 1_700_000 },
    highlights: ['Cuir', 'Toit ouvrant', 'Full options'],
  },
  {
    id: 'veh-006',
    category: 'used',
    brand: 'Renault',
    model: 'Clio',
    year: 2016,
    importYear: 2017,
    ownersInCountry: 4,
    price: 280_000,
    km: 120_000,
    fuel: 'petrol',
    transmission: 'manual',
    city: 'Kiffa',
    sellerName: 'Yacoub M.',
    sellerType: 'particulier',
    verified: false,
    vinVerified: false,
    kargoVerified: false,
    publishedAt: '2026-04-16T12:00:00Z',
    photos: 6,
    photoUrls: buildPhotoSet('compact', 6),
    aiVerdict: 'risk',
    aiEstimate: { low: 220_000, high: 260_000 },
    highlights: ['Négociable', 'Pièces récentes'],
  },
  {
    id: 'veh-007',
    category: 'used',
    brand: 'Nissan',
    model: 'Patrol',
    year: 2019,
    importYear: 2026,
    ownersInCountry: 0,
    price: 3_200_000,
    km: 56_000,
    fuel: 'petrol',
    transmission: 'auto',
    city: 'Atar',
    sellerName: 'Adrar Auto',
    sellerType: 'pro',
    verified: true,
    vinVerified: true,
    kargoVerified: true,
    publishedAt: '2026-04-22T11:20:00Z',
    photos: 20,
    photoUrls: buildPhotoSet('suv', 20),
    aiVerdict: 'fair',
    aiEstimate: { low: 3_100_000, high: 3_350_000 },
    highlights: ['V8', 'Kargo Verified', 'Expédition désert'],
    premium: true,
  },
  {
    id: 'veh-008',
    category: 'used',
    brand: 'Peugeot',
    model: '301',
    year: 2020,
    importYear: 2022,
    ownersInCountry: 1,
    price: 520_000,
    km: 52_000,
    fuel: 'petrol',
    transmission: 'manual',
    city: 'Rosso',
    sellerName: 'Mohamed L.',
    sellerType: 'particulier',
    verified: true,
    vinVerified: true,
    kargoVerified: false,
    publishedAt: '2026-04-20T07:30:00Z',
    photos: 10,
    photoUrls: buildPhotoSet('sedan', 10),
    aiVerdict: 'deal',
    aiEstimate: { low: 540_000, high: 590_000 },
    highlights: ['Familiale', 'Coffre spacieux'],
  },
  {
    id: 'veh-009',
    category: 'new',
    brand: 'Ford',
    model: 'Ranger',
    year: 2022,
    importYear: 2022,
    ownersInCountry: 1,
    price: 2_900_000,
    km: 18_000,
    fuel: 'diesel',
    transmission: 'auto',
    city: 'Zouérate',
    sellerName: 'SNIM Cars',
    sellerType: 'pro',
    verified: true,
    vinVerified: true,
    kargoVerified: true,
    publishedAt: '2026-04-22T15:10:00Z',
    photos: 24,
    photoUrls: buildPhotoSet('pickup', 24),
    aiVerdict: 'deal',
    aiEstimate: { low: 3_000_000, high: 3_200_000 },
    highlights: ['Quasi neuf', 'Garantie usine', 'Kargo Verified'],
    premium: true,
  },
  {
    id: 'veh-010',
    category: 'used',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2015,
    importYear: 2016,
    ownersInCountry: 3,
    price: 420_000,
    km: 140_000,
    fuel: 'petrol',
    transmission: 'manual',
    city: 'Nouakchott',
    district: 'Arafat',
    sellerName: 'Fatimata B.',
    sellerType: 'particulier',
    verified: false,
    vinVerified: false,
    kargoVerified: false,
    publishedAt: '2026-04-15T09:45:00Z',
    photos: 7,
    photoUrls: buildPhotoSet('compact', 7),
    aiVerdict: 'high',
    aiEstimate: { low: 340_000, high: 390_000 },
    highlights: ['Boîte manuelle', 'Historique complet'],
  },
];

export const CATEGORY_LABELS: Record<VehicleCategory, string> = {
  used: 'Voitures d’occasion',
  new: 'Voitures neuves',
  export: 'Voitures d’export',
  rental: 'Location',
};

export function listBrandsForCategory(category: VehicleCategory): string[] {
  const brands = new Set<string>();
  for (const v of VEHICLES) {
    if (v.category === category) brands.add(v.brand);
  }
  return Array.from(brands).sort((a, b) => a.localeCompare(b));
}

export function listModelsForBrand(category: VehicleCategory, brand: string): string[] {
  const models = new Set<string>();
  for (const v of VEHICLES) {
    if (v.category === category && v.brand === brand) models.add(v.model);
  }
  return Array.from(models).sort((a, b) => a.localeCompare(b));
}

export function getVehicleById(id: string): Vehicle | undefined {
  return VEHICLES.find((v) => v.id === id);
}

export type VehicleFilters = {
  query?: string;
  category?: VehicleCategory;
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxKm?: number;
  fuel?: FuelType[];
  transmission?: Transmission[];
  city?: string[];
  verifiedOnly?: boolean;
  kargoVerifiedOnly?: boolean;
};

export type SortKey = 'recent' | 'price-asc' | 'price-desc' | 'km-asc';

export function filterVehicles(
  list: Vehicle[],
  filters: VehicleFilters,
  sort: SortKey = 'recent',
): Vehicle[] {
  const q = filters.query?.trim().toLowerCase();
  const filtered = list.filter((v) => {
    if (q) {
      const hay = `${v.brand} ${v.model} ${v.city}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.category && v.category !== filters.category) return false;
    if (filters.brand && v.brand !== filters.brand) return false;
    if (filters.model && v.model !== filters.model) return false;
    if (filters.minPrice != null && v.price < filters.minPrice) return false;
    if (filters.maxPrice != null && v.price > filters.maxPrice) return false;
    if (filters.minYear != null && v.year < filters.minYear) return false;
    if (filters.maxKm != null && v.km > filters.maxKm) return false;
    if (filters.fuel?.length && !filters.fuel.includes(v.fuel)) return false;
    if (filters.transmission?.length && !filters.transmission.includes(v.transmission)) return false;
    if (filters.city?.length && !filters.city.includes(v.city)) return false;
    if (filters.verifiedOnly && !v.verified) return false;
    if (filters.kargoVerifiedOnly && !v.kargoVerified) return false;
    return true;
  });
  const sorted = [...filtered];
  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'km-asc':
      sorted.sort((a, b) => a.km - b.km);
      break;
    case 'recent':
    default:
      sorted.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }
  return sorted;
}
