// Simulated dataset for the Kargo admin back-office.
// Matches shapes used in the mobile app (lib/mocks + lib/stores) but kept
// independent so the admin can run standalone.

export type AdminUser = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  createdAt: string;
  trustScore: number;
  kycLevel: 0 | 1 | 2 | 3;
  walletBalance: number;
  status: 'active' | 'suspended' | 'pending_review';
  totalListings: number;
  totalTransactions: number;
};

export type AdminListing = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  city: string;
  sellerName: string;
  sellerType: 'particulier' | 'pro';
  status: 'pending_review' | 'active' | 'sold' | 'rejected' | 'flagged';
  createdAt: string;
  views: number;
  contacts: number;
  flags: number;
};

export type AdminTrip = {
  id: string;
  company: string;
  from: string;
  to: string;
  departure: string;
  price: number;
  seatsTotal: number;
  seatsLeft: number;
  status: 'scheduled' | 'boarding' | 'in_transit' | 'arrived' | 'cancelled';
};

export type AdminDispute = {
  id: string;
  subject: string;
  user: string;
  amount: number;
  status: 'open' | 'mediation' | 'resolved' | 'rejected';
  createdAt: string;
  updates: { at: string; from: 'user' | 'kargo' | 'partner'; text: string }[];
};

export type AdminTransaction = {
  id: string;
  user: string;
  type:
    | 'topup_bankily'
    | 'topup_masrvi'
    | 'topup_sedad'
    | 'topup_card'
    | 'p2p_sent'
    | 'p2p_received'
    | 'ticket_transit'
    | 'rental_payment'
    | 'marketplace_deposit';
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  at: string;
  reference: string;
};

export type AdminCompany = {
  id: string;
  name: string;
  type: 'transit' | 'rental';
  city: string;
  rating: number;
  fleetSize: number;
  contact: string;
  status: 'active' | 'paused' | 'kyc_pending';
};

export type AdminInspection = {
  id: string;
  vehicleId: string;
  city: string;
  requestedAt: string;
  status: 'requested' | 'scheduled' | 'completed';
  scheduledAt?: string;
  inspector?: string;
};

const now = Date.now();
const iso = (offsetHours: number) => new Date(now - offsetHours * 3_600_000).toISOString();

export const USERS: AdminUser[] = [
  { id: 'usr_001', name: 'Aminetou Mint Ahmed', phone: '+222 22 11 22 33', email: 'aminetou@example.com', city: 'Nouakchott', createdAt: iso(24 * 30), trustScore: 78, kycLevel: 2, walletBalance: 128450, status: 'active', totalListings: 3, totalTransactions: 24 },
  { id: 'usr_002', name: 'Mohamed Vall', phone: '+222 33 22 11 44', city: 'Nouadhibou', createdAt: iso(24 * 65), trustScore: 92, kycLevel: 3, walletBalance: 540000, status: 'active', totalListings: 7, totalTransactions: 51 },
  { id: 'usr_003', name: 'Cheikh Sidiya', phone: '+222 44 11 22 55', city: 'Kiffa', createdAt: iso(24 * 12), trustScore: 45, kycLevel: 1, walletBalance: 8200, status: 'pending_review', totalListings: 1, totalTransactions: 4 },
  { id: 'usr_004', name: 'Mariem El Hacen', phone: '+222 22 33 44 55', email: 'mariem@example.com', city: 'Atar', createdAt: iso(24 * 90), trustScore: 67, kycLevel: 2, walletBalance: 32100, status: 'active', totalListings: 2, totalTransactions: 18 },
  { id: 'usr_005', name: 'Sidi Bouna', phone: '+222 55 66 77 88', city: 'Rosso', createdAt: iso(24 * 5), trustScore: 22, kycLevel: 0, walletBalance: 0, status: 'pending_review', totalListings: 0, totalTransactions: 0 },
  { id: 'usr_006', name: 'Fatma Beibou', phone: '+222 22 99 88 77', city: 'Nouakchott', createdAt: iso(24 * 200), trustScore: 88, kycLevel: 3, walletBalance: 215300, status: 'active', totalListings: 5, totalTransactions: 73 },
  { id: 'usr_007', name: 'Yahya Ould Salem', phone: '+222 33 11 22 99', city: 'Zouérate', createdAt: iso(24 * 3), trustScore: 18, kycLevel: 0, walletBalance: 1500, status: 'suspended', totalListings: 1, totalTransactions: 2 },
];

export const LISTINGS: AdminListing[] = [
  { id: 'lst_001', brand: 'Toyota', model: 'Hilux', year: 2019, price: 2_850_000, city: 'Nouakchott', sellerName: 'Mohamed Vall', sellerType: 'particulier', status: 'active', createdAt: iso(48), views: 1240, contacts: 38, flags: 0 },
  { id: 'lst_002', brand: 'Hyundai', model: 'Tucson', year: 2020, price: 1_650_000, city: 'Nouadhibou', sellerName: 'Sahara Auto', sellerType: 'pro', status: 'active', createdAt: iso(72), views: 856, contacts: 22, flags: 0 },
  { id: 'lst_003', brand: 'Toyota', model: 'Corolla', year: 2018, price: 480_000, city: 'Kiffa', sellerName: 'Cheikh Sidiya', sellerType: 'particulier', status: 'pending_review', createdAt: iso(6), views: 0, contacts: 0, flags: 0 },
  { id: 'lst_004', brand: 'Mercedes', model: 'Classe C', year: 2021, price: 4_200_000, city: 'Nouakchott', sellerName: 'Premium Cars', sellerType: 'pro', status: 'active', createdAt: iso(120), views: 4321, contacts: 87, flags: 0 },
  { id: 'lst_005', brand: 'Nissan', model: 'Patrol', year: 2015, price: 950_000, city: 'Rosso', sellerName: 'Yahya Ould Salem', sellerType: 'particulier', status: 'flagged', createdAt: iso(96), views: 521, contacts: 12, flags: 5 },
  { id: 'lst_006', brand: 'Renault', model: 'Duster', year: 2017, price: 380_000, city: 'Atar', sellerName: 'Mariem El Hacen', sellerType: 'particulier', status: 'sold', createdAt: iso(720), views: 3120, contacts: 64, flags: 0 },
  { id: 'lst_007', brand: 'Peugeot', model: '208', year: 2019, price: 520_000, city: 'Nouakchott', sellerName: 'Aminetou', sellerType: 'particulier', status: 'rejected', createdAt: iso(240), views: 84, contacts: 1, flags: 0 },
];

export const TRIPS: AdminTrip[] = [
  { id: 'trp_001', company: 'El Bourrak', from: 'Nouakchott', to: 'Nouadhibou', departure: iso(-6), price: 4500, seatsTotal: 55, seatsLeft: 12, status: 'scheduled' },
  { id: 'trp_002', company: 'SONEF', from: 'Nouakchott', to: 'Kiffa', departure: iso(-2), price: 3500, seatsTotal: 45, seatsLeft: 4, status: 'boarding' },
  { id: 'trp_003', company: 'STPN', from: 'Nouakchott', to: 'Atar', departure: iso(2), price: 5500, seatsTotal: 30, seatsLeft: 0, status: 'in_transit' },
  { id: 'trp_004', company: 'El Bourrak', from: 'Nouadhibou', to: 'Nouakchott', departure: iso(8), price: 4500, seatsTotal: 55, seatsLeft: 22, status: 'arrived' },
  { id: 'trp_005', company: 'Sahel Express', from: 'Rosso', to: 'Nouakchott', departure: iso(-1), price: 2500, seatsTotal: 25, seatsLeft: 25, status: 'cancelled' },
];

export const DISPUTES: AdminDispute[] = [
  {
    id: 'dsp_001',
    subject: 'Caution non remboursée',
    user: 'Aminetou Mint Ahmed',
    amount: 25000,
    status: 'mediation',
    createdAt: iso(96),
    updates: [
      { at: iso(96), from: 'user', text: 'Voiture rendue propre, caution toujours bloquée 7 jours après.' },
      { at: iso(72), from: 'kargo', text: 'Médiation ouverte. Contact agence en cours.' },
      { at: iso(48), from: 'partner', text: 'Vérification interne en cours, retour sous 48h.' },
    ],
  },
  {
    id: 'dsp_002',
    subject: 'Annonce trompeuse — Hilux 2019',
    user: 'Cheikh Sidiya',
    amount: 0,
    status: 'open',
    createdAt: iso(12),
    updates: [{ at: iso(12), from: 'user', text: 'Voiture présentée comme neuve mais accident antérieur visible.' }],
  },
  {
    id: 'dsp_003',
    subject: 'Billet El Bourrak non honoré',
    user: 'Fatma Beibou',
    amount: 4500,
    status: 'resolved',
    createdAt: iso(240),
    updates: [
      { at: iso(240), from: 'user', text: 'Bus parti sans moi malgré billet valide.' },
      { at: iso(216), from: 'partner', text: 'Erreur de comptage, remboursement immédiat.' },
      { at: iso(212), from: 'kargo', text: 'Remboursement effectué sur wallet.' },
    ],
  },
];

export const TRANSACTIONS: AdminTransaction[] = [
  { id: 'tx_001', user: 'Aminetou Mint Ahmed', type: 'topup_bankily', amount: 25000, status: 'completed', at: iso(2), reference: 'BNK-5821-0923' },
  { id: 'tx_002', user: 'Mohamed Vall', type: 'p2p_sent', amount: -15000, status: 'completed', at: iso(6), reference: 'P2P-009123' },
  { id: 'tx_003', user: 'Mariem El Hacen', type: 'ticket_transit', amount: -4500, status: 'completed', at: iso(12), reference: 'TKT-883201' },
  { id: 'tx_004', user: 'Cheikh Sidiya', type: 'topup_card', amount: 50000, status: 'pending', at: iso(0.5), reference: 'CRD-001029' },
  { id: 'tx_005', user: 'Aminetou Mint Ahmed', type: 'rental_payment', amount: -85000, status: 'completed', at: iso(36), reference: 'RNT-204812' },
  { id: 'tx_006', user: 'Fatma Beibou', type: 'topup_masrvi', amount: 80000, status: 'completed', at: iso(72), reference: 'MSV-779210' },
  { id: 'tx_007', user: 'Yahya Ould Salem', type: 'topup_card', amount: 5000, status: 'failed', at: iso(8), reference: 'CRD-009211' },
  { id: 'tx_008', user: 'Mohamed Vall', type: 'marketplace_deposit', amount: -250000, status: 'completed', at: iso(120), reference: 'MKT-882910' },
];

export const COMPANIES: AdminCompany[] = [
  { id: 'cmp_001', name: 'El Bourrak', type: 'transit', city: 'Nouakchott', rating: 4.6, fleetSize: 22, contact: '+222 45 25 18 18', status: 'active' },
  { id: 'cmp_002', name: 'SONEF', type: 'transit', city: 'Nouakchott', rating: 4.2, fleetSize: 35, contact: '+222 45 25 12 12', status: 'active' },
  { id: 'cmp_003', name: 'STPN', type: 'transit', city: 'Atar', rating: 3.9, fleetSize: 12, contact: '+222 46 32 11 11', status: 'active' },
  { id: 'cmp_004', name: 'Sahara Rent', type: 'rental', city: 'Nouakchott', rating: 4.7, fleetSize: 28, contact: '+222 45 88 77 66', status: 'active' },
  { id: 'cmp_005', name: 'Atlantic Drive', type: 'rental', city: 'Nouadhibou', rating: 4.3, fleetSize: 15, contact: '+222 45 77 66 55', status: 'kyc_pending' },
  { id: 'cmp_006', name: 'Sahel Express', type: 'transit', city: 'Rosso', rating: 3.4, fleetSize: 8, contact: '+222 45 33 22 11', status: 'paused' },
];

export const INSPECTIONS: AdminInspection[] = [
  { id: 'isp_001', vehicleId: 'KARG2345NKT', city: 'Nouakchott', requestedAt: iso(48), status: 'scheduled', scheduledAt: iso(-24), inspector: 'Inspecteur Boubou' },
  { id: 'isp_002', vehicleId: 'KARG7891NDB', city: 'Nouadhibou', requestedAt: iso(12), status: 'requested' },
  { id: 'isp_003', vehicleId: 'KARG4520ATR', city: 'Atar', requestedAt: iso(120), status: 'completed', scheduledAt: iso(72), inspector: 'Inspecteur Salem' },
];

export function dashboardStats() {
  const activeUsers = USERS.filter((u) => u.status === 'active').length;
  const pendingListings = LISTINGS.filter((l) => l.status === 'pending_review').length;
  const flaggedListings = LISTINGS.filter((l) => l.status === 'flagged').length;
  const openDisputes = DISPUTES.filter((d) => d.status !== 'resolved' && d.status !== 'rejected').length;
  const todayRevenue = TRANSACTIONS.filter((t) => t.amount > 0 && t.status === 'completed').reduce((a, b) => a + b.amount, 0);
  const tripsToday = TRIPS.length;
  const totalGMV = TRANSACTIONS.filter((t) => t.status === 'completed').reduce((a, b) => a + Math.abs(b.amount), 0);
  return { activeUsers, pendingListings, flaggedListings, openDisputes, todayRevenue, tripsToday, totalGMV };
}

export function formatMRU(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.abs(amount));
}

export function formatRel(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (Math.abs(min) < 60) return `${min < 0 ? 'dans ' : 'il y a '}${Math.abs(min)} min`;
  const h = Math.floor(min / 60);
  if (Math.abs(h) < 24) return `${h < 0 ? 'dans ' : 'il y a '}${Math.abs(h)} h`;
  const d = Math.floor(h / 24);
  return `${d < 0 ? 'dans ' : 'il y a '}${Math.abs(d)} j`;
}
