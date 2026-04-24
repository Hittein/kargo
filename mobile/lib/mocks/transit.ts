export type TransportType = 'interurbain' | 'urbain' | 'minibus' | 'taxi-collectif' | 'navette';
export type BusSize = 'small' | 'medium' | 'big';

export const BUS_SIZE_LABEL: Record<BusSize, string> = {
  small: 'Minibus',
  medium: 'Bus moyen',
  big: 'Grand bus',
};

export const BUS_SIZE_SEATS: Record<BusSize, string> = {
  small: '12–15 places',
  medium: '28–35 places',
  big: '45–55 places',
};

export const BUS_SIZE_ICON: Record<BusSize, string> = {
  small: 'car-sport',
  medium: 'bus',
  big: 'bus-outline',
};

export type City = {
  id: string;
  name: string;
  region: string;
  stops: string[];
};

export const DISTANCES_KM: Record<string, Record<string, number>> = {
  nkt: { ndb: 470, kif: 600, atr: 450, zrt: 1100, ros: 200 },
  ndb: { nkt: 470, kif: 1060, atr: 850, zrt: 640, ros: 670 },
  kif: { nkt: 600, ndb: 1060, atr: 850, zrt: 1700, ros: 800 },
  atr: { nkt: 450, ndb: 850, kif: 850, zrt: 700, ros: 650 },
  zrt: { nkt: 1100, ndb: 640, kif: 1700, atr: 700, ros: 1300 },
  ros: { nkt: 200, ndb: 670, kif: 800, atr: 650, zrt: 1300 },
};

export function distanceBetween(fromId?: string, toId?: string): number | undefined {
  if (!fromId || !toId) return undefined;
  return DISTANCES_KM[fromId]?.[toId];
}

export type Company = {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  logoColor: string;
  services: string[];
};

export type Trip = {
  id: string;
  companyId: string;
  fromCityId: string;
  toCityId: string;
  fromStop: string;
  toStop: string;
  departure: string;
  arrival: string;
  durationMin: number;
  distanceKm?: number;
  price: number;
  seatsTotal: number;
  seatsLeft: number;
  busSize: BusSize;
  type: TransportType;
  direct: boolean;
  amenities: string[];
  cancelable: boolean;
};

export const CITIES: City[] = [
  { id: 'nkt', name: 'Nouakchott', region: 'Littoral', stops: ['Gare du Ksar', 'Carrefour Madrid', 'Arafat', 'Tevragh Zeina'] },
  { id: 'ndb', name: 'Nouadhibou', region: 'Nord-Ouest', stops: ['Gare centrale', 'Numérowatt', 'Cansado'] },
  { id: 'kif', name: 'Kiffa', region: 'Assaba', stops: ['Gare routière', 'Marché central'] },
  { id: 'atr', name: 'Atar', region: 'Adrar', stops: ['Gare d\'Atar', 'Aéroport'] },
  { id: 'zrt', name: 'Zouérate', region: 'Tiris Zemmour', stops: ['Gare SNIM'] },
  { id: 'ros', name: 'Rosso', region: 'Trarza', stops: ['Gare de Rosso', 'Pont Rosso'] },
];

export const COMPANIES: Company[] = [
  {
    id: 'sonef',
    name: 'SONEF',
    rating: 4.3,
    reviews: 1240,
    logoColor: '#1E40AF',
    services: ['Climatisation', 'WiFi', 'Bagages inclus'],
  },
  {
    id: 'el-bouraq',
    name: 'El Bouraq',
    rating: 4.1,
    reviews: 860,
    logoColor: '#047857',
    services: ['Climatisation', 'Collation'],
  },
  {
    id: 'al-ain',
    name: 'Al Ain Express',
    rating: 4.6,
    reviews: 520,
    logoColor: '#B45309',
    services: ['Climatisation', 'WiFi', 'Sièges inclinables', 'Prise USB'],
  },
  {
    id: 'saharienne',
    name: 'Saharienne Transport',
    rating: 3.9,
    reviews: 310,
    logoColor: '#7C2D12',
    services: ['Climatisation'],
  },
];

function baseDate(offsetDays: number, hours: number, minutes = 0): string {
  const d = new Date('2026-04-24T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + offsetDays);
  d.setUTCHours(hours, minutes, 0, 0);
  return d.toISOString();
}

function addMinutes(iso: string, mins: number): string {
  const d = new Date(iso);
  d.setUTCMinutes(d.getUTCMinutes() + mins);
  return d.toISOString();
}

export const TRIPS: Trip[] = [
  {
    id: 't-001',
    companyId: 'sonef',
    fromCityId: 'nkt',
    toCityId: 'ndb',
    fromStop: 'Gare du Ksar',
    toStop: 'Gare centrale',
    departure: baseDate(0, 6, 30),
    arrival: addMinutes(baseDate(0, 6, 30), 360),
    durationMin: 360,
    distanceKm: 470,
    price: 1800,
    seatsTotal: 55,
    seatsLeft: 12,
    busSize: 'big',
    type: 'interurbain',
    direct: true,
    amenities: ['Climatisation', 'WiFi', 'Bagages 20kg'],
    cancelable: true,
  },
  {
    id: 't-002',
    companyId: 'el-bouraq',
    fromCityId: 'nkt',
    toCityId: 'ndb',
    fromStop: 'Carrefour Madrid',
    toStop: 'Numérowatt',
    departure: baseDate(0, 8, 0),
    arrival: addMinutes(baseDate(0, 8, 0), 400),
    durationMin: 400,
    distanceKm: 470,
    price: 1500,
    seatsTotal: 45,
    seatsLeft: 3,
    busSize: 'medium',
    type: 'interurbain',
    direct: false,
    amenities: ['Climatisation'],
    cancelable: true,
  },
  {
    id: 't-003',
    companyId: 'al-ain',
    fromCityId: 'nkt',
    toCityId: 'ndb',
    fromStop: 'Gare du Ksar',
    toStop: 'Gare centrale',
    departure: baseDate(0, 14, 0),
    arrival: addMinutes(baseDate(0, 14, 0), 330),
    durationMin: 330,
    distanceKm: 470,
    price: 2200,
    seatsTotal: 40,
    seatsLeft: 22,
    busSize: 'big',
    type: 'interurbain',
    direct: true,
    amenities: ['Climatisation', 'WiFi', 'Sièges inclinables', 'Prise USB'],
    cancelable: true,
  },
  {
    id: 't-004',
    companyId: 'sonef',
    fromCityId: 'nkt',
    toCityId: 'kif',
    fromStop: 'Gare du Ksar',
    toStop: 'Gare routière',
    departure: baseDate(0, 7, 0),
    arrival: addMinutes(baseDate(0, 7, 0), 480),
    durationMin: 480,
    distanceKm: 600,
    price: 2400,
    seatsTotal: 55,
    seatsLeft: 28,
    busSize: 'big',
    type: 'interurbain',
    direct: true,
    amenities: ['Climatisation', 'WiFi'],
    cancelable: true,
  },
  {
    id: 't-005',
    companyId: 'al-ain',
    fromCityId: 'nkt',
    toCityId: 'atr',
    fromStop: 'Gare du Ksar',
    toStop: 'Gare d\'Atar',
    departure: baseDate(1, 6, 0),
    arrival: addMinutes(baseDate(1, 6, 0), 450),
    durationMin: 450,
    distanceKm: 450,
    price: 2800,
    seatsTotal: 40,
    seatsLeft: 15,
    busSize: 'medium',
    type: 'interurbain',
    direct: true,
    amenities: ['Climatisation', 'WiFi', 'Sièges inclinables'],
    cancelable: true,
  },
  {
    id: 't-006',
    companyId: 'saharienne',
    fromCityId: 'nkt',
    toCityId: 'ros',
    fromStop: 'Arafat',
    toStop: 'Gare de Rosso',
    departure: baseDate(0, 10, 30),
    arrival: addMinutes(baseDate(0, 10, 30), 240),
    durationMin: 240,
    distanceKm: 200,
    price: 900,
    seatsTotal: 50,
    seatsLeft: 40,
    busSize: 'small',
    type: 'minibus',
    direct: false,
    amenities: ['Climatisation'],
    cancelable: false,
  },
  {
    id: 't-007',
    companyId: 'el-bouraq',
    fromCityId: 'nkt',
    toCityId: 'zrt',
    fromStop: 'Gare du Ksar',
    toStop: 'Gare SNIM',
    departure: baseDate(1, 5, 30),
    arrival: addMinutes(baseDate(1, 5, 30), 720),
    durationMin: 720,
    distanceKm: 1100,
    price: 3600,
    seatsTotal: 45,
    seatsLeft: 8,
    busSize: 'big',
    type: 'interurbain',
    direct: true,
    amenities: ['Climatisation', 'Collation', 'Bagages 25kg'],
    cancelable: true,
  },
  {
    id: 't-008',
    companyId: 'sonef',
    fromCityId: 'ndb',
    toCityId: 'nkt',
    fromStop: 'Gare centrale',
    toStop: 'Gare du Ksar',
    departure: baseDate(0, 7, 0),
    arrival: addMinutes(baseDate(0, 7, 0), 360),
    durationMin: 360,
    distanceKm: 470,
    price: 1800,
    seatsTotal: 55,
    seatsLeft: 19,
    busSize: 'big',
    type: 'interurbain',
    direct: true,
    amenities: ['Climatisation', 'WiFi', 'Bagages 20kg'],
    cancelable: true,
  },
  {
    id: 't-009',
    companyId: 'al-ain',
    fromCityId: 'ndb',
    toCityId: 'nkt',
    fromStop: 'Gare centrale',
    toStop: 'Gare du Ksar',
    departure: baseDate(0, 15, 30),
    arrival: addMinutes(baseDate(0, 15, 30), 330),
    durationMin: 330,
    distanceKm: 470,
    price: 2200,
    seatsTotal: 40,
    seatsLeft: 25,
    busSize: 'medium',
    type: 'interurbain',
    direct: true,
    amenities: ['Climatisation', 'WiFi', 'Sièges inclinables', 'Prise USB'],
    cancelable: true,
  },
  {
    id: 't-010',
    companyId: 'saharienne',
    fromCityId: 'kif',
    toCityId: 'nkt',
    fromStop: 'Gare routière',
    toStop: 'Gare du Ksar',
    departure: baseDate(0, 9, 0),
    arrival: addMinutes(baseDate(0, 9, 0), 500),
    durationMin: 500,
    distanceKm: 600,
    price: 2300,
    seatsTotal: 50,
    seatsLeft: 30,
    busSize: 'small',
    type: 'interurbain',
    direct: false,
    amenities: ['Climatisation'],
    cancelable: true,
  },
  {
    id: 't-011',
    companyId: 'saharienne',
    fromCityId: 'nkt',
    toCityId: 'ndb',
    fromStop: 'Carrefour Madrid',
    toStop: 'Numérowatt',
    departure: baseDate(0, 5, 0),
    arrival: addMinutes(baseDate(0, 5, 0), 300),
    durationMin: 300,
    distanceKm: 470,
    price: 2500,
    seatsTotal: 14,
    seatsLeft: 4,
    busSize: 'small',
    type: 'minibus',
    direct: true,
    amenities: ['Climatisation', 'Rapide'],
    cancelable: false,
  },
  {
    id: 't-012',
    companyId: 'al-ain',
    fromCityId: 'nkt',
    toCityId: 'ndb',
    fromStop: 'Gare du Ksar',
    toStop: 'Gare centrale',
    departure: baseDate(0, 22, 0),
    arrival: addMinutes(baseDate(0, 22, 0), 390),
    durationMin: 390,
    distanceKm: 470,
    price: 1900,
    seatsTotal: 33,
    seatsLeft: 16,
    busSize: 'medium',
    type: 'interurbain',
    direct: true,
    amenities: ['Climatisation', 'WiFi', 'Nuit'],
    cancelable: true,
  },
];

export function getCity(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}
export function getCompany(id: string): Company | undefined {
  return COMPANIES.find((c) => c.id === id);
}
export function getTrip(id: string): Trip | undefined {
  return TRIPS.find((t) => t.id === id);
}

export type TripFilters = {
  companyIds?: string[];
  maxPrice?: number;
  minDepartHour?: number;
  maxDepartHour?: number;
  directOnly?: boolean;
  busSize?: BusSize;
};

export type TripRank = 'cheapest' | 'fastest' | '2nd-cheapest' | '2nd-fastest' | 'alternative';

export function rankTrips(trips: Trip[]): Record<string, TripRank[]> {
  const byPrice = [...trips].sort((a, b) => a.price - b.price);
  const byDuration = [...trips].sort((a, b) => a.durationMin - b.durationMin);
  const ranks: Record<string, TripRank[]> = {};
  const push = (id: string, r: TripRank) => {
    (ranks[id] ||= []).push(r);
  };
  if (byPrice[0]) push(byPrice[0].id, 'cheapest');
  if (byPrice[1]) push(byPrice[1].id, '2nd-cheapest');
  if (byDuration[0]) push(byDuration[0].id, 'fastest');
  if (byDuration[1]) push(byDuration[1].id, '2nd-fastest');
  for (const t of trips) {
    if (!ranks[t.id]) ranks[t.id] = ['alternative'];
  }
  return ranks;
}
export type TripSort = 'early' | 'price-asc' | 'price-desc' | 'duration-asc' | 'rating-desc';

export function searchTrips(
  params: { fromCityId?: string; toCityId?: string; date?: string },
  filters: TripFilters = {},
  sort: TripSort = 'early',
): Trip[] {
  const targetDay = params.date ? new Date(params.date).toISOString().slice(0, 10) : undefined;
  const filtered = TRIPS.filter((t) => {
    if (params.fromCityId && t.fromCityId !== params.fromCityId) return false;
    if (params.toCityId && t.toCityId !== params.toCityId) return false;
    if (targetDay) {
      const tripDay = t.departure.slice(0, 10);
      if (tripDay !== targetDay) return false;
    }
    if (filters.companyIds?.length && !filters.companyIds.includes(t.companyId)) return false;
    if (filters.maxPrice != null && t.price > filters.maxPrice) return false;
    if (filters.directOnly && !t.direct) return false;
    if (filters.busSize && t.busSize !== filters.busSize) return false;
    if (filters.minDepartHour != null || filters.maxDepartHour != null) {
      const h = new Date(t.departure).getUTCHours();
      if (filters.minDepartHour != null && h < filters.minDepartHour) return false;
      if (filters.maxDepartHour != null && h > filters.maxDepartHour) return false;
    }
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
    case 'duration-asc':
      sorted.sort((a, b) => a.durationMin - b.durationMin);
      break;
    case 'rating-desc':
      sorted.sort(
        (a, b) => (getCompany(b.companyId)?.rating ?? 0) - (getCompany(a.companyId)?.rating ?? 0),
      );
      break;
    case 'early':
    default:
      sorted.sort((a, b) => a.departure.localeCompare(b.departure));
  }
  return sorted;
}
