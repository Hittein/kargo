/**
 * Normalisation des numéros mauritaniens. Miroir de PhoneUtil.java côté backend.
 * MR = 8 chiffres locaux. On stocke/envoie toujours la forme 8-chiffres.
 */

export function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  let digits = raw.replace(/[^0-9+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('222') && digits.length >= 11) digits = digits.slice(3);
  if (digits.length > 8) digits = digits.slice(-8);
  if (digits.length !== 8) return null;
  if (!/^[0-9]{8}$/.test(digits)) return null;
  return digits;
}

export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== null;
}

/** Affiche un numéro MR de façon lisible : "48 88 77 00" (toujours 4×2 chiffres). */
export function formatPhone(raw: string): string {
  const n = normalizePhone(raw);
  if (!n) return raw;
  return `${n.slice(0, 2)} ${n.slice(2, 4)} ${n.slice(4, 6)} ${n.slice(6, 8)}`;
}
