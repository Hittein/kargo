import { create } from 'zustand';

export type PassengerCategory = 'adult' | 'child' | 'student';

export type BookingPassenger = {
  name: string;
  phone: string;
  category: PassengerCategory;
  seatLabel: string;
};

export type PaymentMethod = 'kargo_wallet' | 'bankily' | 'masrvi' | 'sedad' | 'card';

export const CATEGORY_LABELS: Record<PassengerCategory, { label: string; discount: number }> = {
  adult: { label: 'Adulte', discount: 0 },
  child: { label: 'Enfant', discount: 0.5 },
  student: { label: 'Étudiant', discount: 0.2 },
};

export const PAYMENT_LABELS: Record<PaymentMethod, { label: string; icon: string; color: string }> = {
  kargo_wallet: { label: 'Kargo Wallet', icon: 'wallet', color: '#FF6B35' },
  bankily: { label: 'Bankily', icon: 'phone-portrait', color: '#1E40AF' },
  masrvi: { label: 'Masrvi', icon: 'cellular', color: '#047857' },
  sedad: { label: 'Sedad', icon: 'card', color: '#B45309' },
  card: { label: 'Carte bancaire', icon: 'card-outline', color: '#475569' },
};

type State = {
  tripId?: string;
  selectedSeats: string[];
  passengers: BookingPassenger[];
  method?: PaymentMethod;
  cgvAccepted: boolean;
  lockExpiresAt?: number;
  start: (tripId: string) => void;
  toggleSeat: (label: string) => void;
  setPassenger: (index: number, patch: Partial<BookingPassenger>) => void;
  syncPassengersFromSeats: () => void;
  setMethod: (m: PaymentMethod) => void;
  setCgv: (v: boolean) => void;
  reset: () => void;
};

const MAX_SEATS_PER_BOOKING = 6;

export const useBookingStore = create<State>((set, get) => ({
  tripId: undefined,
  selectedSeats: [],
  passengers: [],
  method: undefined,
  cgvAccepted: false,
  lockExpiresAt: undefined,

  start: (tripId) =>
    set({
      tripId,
      selectedSeats: [],
      passengers: [],
      method: undefined,
      cgvAccepted: false,
      lockExpiresAt: Date.now() + 10 * 60_000,
    }),

  toggleSeat: (label) => {
    const { selectedSeats } = get();
    if (selectedSeats.includes(label)) {
      set({ selectedSeats: selectedSeats.filter((s) => s !== label) });
    } else if (selectedSeats.length < MAX_SEATS_PER_BOOKING) {
      set({ selectedSeats: [...selectedSeats, label] });
    }
    get().syncPassengersFromSeats();
  },

  syncPassengersFromSeats: () => {
    const { selectedSeats, passengers } = get();
    const next: BookingPassenger[] = selectedSeats.map((label, idx) => {
      const existing = passengers.find((p) => p.seatLabel === label);
      return (
        existing ?? {
          name: idx === 0 ? '' : '',
          phone: idx === 0 ? '' : '',
          category: 'adult' as PassengerCategory,
          seatLabel: label,
        }
      );
    });
    set({ passengers: next });
  },

  setPassenger: (index, patch) => {
    const { passengers } = get();
    const copy = [...passengers];
    if (!copy[index]) return;
    copy[index] = { ...copy[index], ...patch };
    set({ passengers: copy });
  },

  setMethod: (method) => set({ method }),
  setCgv: (cgvAccepted) => set({ cgvAccepted }),

  reset: () =>
    set({
      tripId: undefined,
      selectedSeats: [],
      passengers: [],
      method: undefined,
      cgvAccepted: false,
      lockExpiresAt: undefined,
    }),
}));
