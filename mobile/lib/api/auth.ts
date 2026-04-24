import { api } from './client';
import type { ApiAuthResponse, ApiStartOtp, ApiUser } from './types';

export async function startOtp(phone: string) {
  return api.post<ApiStartOtp>('/auth/start', { phone }, { auth: false });
}

export async function verifyOtp(phone: string, code: string) {
  return api.post<ApiAuthResponse>('/auth/verify', { phone, code }, { auth: false });
}

export async function getMe() {
  return api.get<ApiUser>('/users/me');
}

export async function updateMe(patch: { name?: string; email?: string; city?: string }) {
  return api.patch<ApiUser>('/users/me', patch);
}
