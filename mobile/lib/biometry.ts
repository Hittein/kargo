import * as LocalAuthentication from 'expo-local-authentication';
import { storage } from '@/lib/storage';

const KEY = 'kargo:biometry-enabled';

export async function isBiometryAvailable(): Promise<boolean> {
  try {
    const has = await LocalAuthentication.hasHardwareAsync();
    if (!has) return false;
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  } catch {
    return false;
  }
}

export function isBiometryOptedIn(): boolean {
  return storage.getString(KEY) === '1';
}

export function setBiometryOptedIn(value: boolean): void {
  if (value) storage.set(KEY, '1');
  else storage.delete(KEY);
}

export async function authenticate(reason: string): Promise<boolean> {
  try {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Annuler',
      fallbackLabel: 'Utiliser le code',
      disableDeviceFallback: false,
    });
    return res.success;
  } catch {
    return false;
  }
}
