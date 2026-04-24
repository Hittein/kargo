import { api } from './client';
import type { ApiTransaction, ApiWallet } from './types';

export async function getWallet() {
  return api.get<ApiWallet>('/wallet');
}

export async function listTransactions() {
  return api.get<ApiTransaction[]>('/wallet/transactions');
}

export async function topup(source: string, amountMru: number) {
  return api.post<{ wallet: ApiWallet; transaction: ApiTransaction }>('/wallet/topup', {
    source,
    amountMru,
  });
}

export async function transfer(toPhone: string, amountMru: number, note?: string) {
  return api.post<{ wallet: ApiWallet; transaction: ApiTransaction }>('/wallet/transfer', {
    toPhone,
    amountMru,
    note,
  });
}
