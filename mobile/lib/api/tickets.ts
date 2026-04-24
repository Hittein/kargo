import { api } from './client';

export type ApiTicket = {
  id: string;
  userId: string;
  tripId: string;
  seatsBooked: number;
  totalPaidMru: number;
  paymentMethod: string;
  status: string;
  qrToken?: string;
  createdAt: string;
  usedAt?: string;
  fromCityId: string;
  toCityId: string;
  departure: string;
};

export type CreateTicketPayload = {
  tripId: string;
  seatsBooked: number;
  totalPaidMru: number;
  paymentMethod: string;
  qrToken?: string;
};

export async function createTicket(body: CreateTicketPayload) {
  return api.post<ApiTicket>('/tickets', body);
}

export async function listMyTickets() {
  return api.get<ApiTicket[]>('/tickets/me');
}
