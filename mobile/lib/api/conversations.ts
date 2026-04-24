import { api } from './client';

export type ApiConversation = {
  id: string;
  kind: 'LISTING' | 'RENTAL' | 'TRIP' | 'SUPPORT' | string;
  listingId?: string | null;
  partnerId?: string | null;
  partnerName: string;
  partnerAvatarUrl?: string | null;
  lastMessagePreview?: string | null;
  lastMessageAt: string;
  unread: number;
  createdAt: string;
};

export type ApiMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  fromMe: boolean;
  text: string;
  createdAt: string;
  readAt?: string | null;
};

export type StartPayload =
  | { kind: 'LISTING'; listingId: string }
  | { kind: 'SUPPORT' };

export function list() {
  return api.get<ApiConversation[]>('/conversations');
}

export function start(body: StartPayload) {
  return api.post<ApiConversation>('/conversations', body);
}

export function listMessages(id: string) {
  return api.get<ApiMessage[]>(`/conversations/${encodeURIComponent(id)}/messages`);
}

export function sendMessage(id: string, text: string) {
  return api.post<ApiMessage>(`/conversations/${encodeURIComponent(id)}/messages`, { text });
}

export function markRead(id: string) {
  return api.post<ApiConversation>(`/conversations/${encodeURIComponent(id)}/read`);
}
