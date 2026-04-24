import { create } from 'zustand';
import type { BookingPassenger, PaymentMethod } from './booking';

export type TicketStatus = 'upcoming' | 'active' | 'used' | 'cancelled' | 'expired';

export type Ticket = {
  id: string;
  tripId: string;
  passengers: BookingPassenger[];
  totalPaid: number;
  method: PaymentMethod;
  issuedAt: string;
  qrToken: string;
  status: TicketStatus;
};

type State = {
  tickets: Ticket[];
  add: (t: Ticket) => void;
  cancel: (id: string) => void;
  get: (id: string) => Ticket | undefined;
};

function qrToken(): string {
  const rand = () => Math.random().toString(36).slice(2, 10).toUpperCase();
  return `KARGO-${rand()}-${rand()}`;
}

export function makeTicketId(): string {
  return `tkt-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function makeQrToken(): string {
  return qrToken();
}

export const useTicketsStore = create<State>((set, getState) => ({
  tickets: [],
  add: (t) => set((s) => ({ tickets: [t, ...s.tickets] })),
  cancel: (id) =>
    set((s) => ({
      tickets: s.tickets.map((t) => (t.id === id ? { ...t, status: 'cancelled' } : t)),
    })),
  get: (id) => getState().tickets.find((t) => t.id === id),
}));

export function categorizeTickets(tickets: Ticket[], now: number = Date.now()): {
  upcoming: Ticket[];
  active: Ticket[];
  used: Ticket[];
  cancelled: Ticket[];
} {
  const upcoming: Ticket[] = [];
  const active: Ticket[] = [];
  const used: Ticket[] = [];
  const cancelled: Ticket[] = [];
  for (const t of tickets) {
    if (t.status === 'cancelled') cancelled.push(t);
    else if (t.status === 'used' || t.status === 'expired') used.push(t);
    else active.push(t);
  }
  return { upcoming, active, used, cancelled };
}
