export type ListingStatus = 'active' | 'draft' | 'moderation' | 'rejected' | 'sold';

export type MyListing = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number;
  city: string;
  photoUrl: string;
  status: ListingStatus;
  views: number;
  leads: number;
  favorites: number;
  publishedAt: string;
  rejectReason?: string;
  moderationStep?: string;
};

export const STATUS_LABEL: Record<ListingStatus, string> = {
  active: 'Active',
  draft: 'Brouillon',
  moderation: 'Modération',
  rejected: 'Refusée',
  sold: 'Vendue',
};

export const STATUS_TONE: Record<ListingStatus, 'success' | 'neutral' | 'primary' | 'danger' | 'gold'> = {
  active: 'success',
  draft: 'neutral',
  moderation: 'primary',
  rejected: 'danger',
  sold: 'gold',
};

export const MY_LISTINGS: MyListing[] = [
  {
    id: 'my-001',
    brand: 'Toyota',
    model: 'Hilux',
    year: 2021,
    price: 2_450_000,
    km: 28_000,
    city: 'Nouakchott',
    photoUrl: 'https://images.unsplash.com/photo-1605515298946-d0573716f0bd?w=600&q=70',
    status: 'active',
    views: 1284,
    leads: 37,
    favorites: 84,
    publishedAt: '2026-04-12T10:00:00Z',
  },
  {
    id: 'my-002',
    brand: 'Hyundai',
    model: 'Tucson',
    year: 2020,
    price: 1_200_000,
    km: 32_000,
    city: 'Nouakchott',
    photoUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=70',
    status: 'moderation',
    views: 0,
    leads: 0,
    favorites: 0,
    publishedAt: '2026-04-22T14:30:00Z',
    moderationStep: 'Validation humaine en cours',
  },
  {
    id: 'my-003',
    brand: 'Renault',
    model: 'Clio',
    year: 2016,
    price: 280_000,
    km: 120_000,
    city: 'Kiffa',
    photoUrl: 'https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=600&q=70',
    status: 'rejected',
    views: 0,
    leads: 0,
    favorites: 0,
    publishedAt: '2026-04-16T08:00:00Z',
    rejectReason: 'Photos insuffisantes, ajoutez 3 vues minimum.',
  },
  {
    id: 'my-004',
    brand: 'Kia',
    model: 'Picanto',
    year: 2019,
    price: 380_000,
    km: 68_000,
    city: 'Nouadhibou',
    photoUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&q=70',
    status: 'sold',
    views: 2410,
    leads: 62,
    favorites: 156,
    publishedAt: '2026-02-18T11:00:00Z',
  },
  {
    id: 'my-005',
    brand: 'Peugeot',
    model: '301',
    year: 2020,
    price: 0,
    km: 0,
    city: '',
    photoUrl: '',
    status: 'draft',
    views: 0,
    leads: 0,
    favorites: 0,
    publishedAt: '2026-04-23T07:00:00Z',
  },
];
