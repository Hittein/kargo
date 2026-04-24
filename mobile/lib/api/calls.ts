import { api } from './client';

export type IssueTokenPayload = {
  conversationId: string;
  mode?: 'audio' | 'video';
};

export type IssueTokenResponse = {
  appId: string;
  channelName: string;
  uid: number;
  token: string;
  ttlSeconds: number;
  mode: 'audio' | 'video';
};

export function issueToken(body: IssueTokenPayload) {
  return api.post<IssueTokenResponse>('/calls/token', body);
}
