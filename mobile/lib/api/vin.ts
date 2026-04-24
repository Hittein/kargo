import type { FuelType, Transmission } from '@/lib/mocks/vehicles';

const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues';
const TIMEOUT_MS = 15_000;

export type VinDecodeResult = {
  brand?: string;
  model?: string;
  year?: number;
  fuel?: FuelType;
  transmission?: Transmission;
  bodyType?: string;
  trim?: string;
  engineCylinders?: number;
  displacementL?: number;
  driveType?: string;
  vehicleType?: string;
  errorCode?: string;
  errorText?: string;
  raw: Record<string, string>;
};

export class VinDecodeError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'VinDecodeError';
  }
}

function titleCase(s: string): string {
  if (!s) return s;
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function mapFuel(v?: string): FuelType | undefined {
  if (!v) return undefined;
  const s = v.toLowerCase();
  if (s.includes('electric') && !s.includes('hybrid')) return 'electric';
  if (s.includes('hybrid')) return 'hybrid';
  if (s.includes('diesel')) return 'diesel';
  if (
    s.includes('gasoline') ||
    s.includes('petrol') ||
    s.includes('ethanol') ||
    s.includes('flex')
  ) {
    return 'petrol';
  }
  return undefined;
}

function mapTransmission(v?: string): Transmission | undefined {
  if (!v) return undefined;
  const s = v.toLowerCase();
  if (s.includes('manual') && !s.includes('automated')) return 'manual';
  if (
    s.includes('automatic') ||
    s.includes('cvt') ||
    s.includes('automated') ||
    s.includes('dct')
  ) {
    return 'auto';
  }
  return undefined;
}

function mapBodyClass(v?: string): string | undefined {
  if (!v) return undefined;
  const s = v.toLowerCase();
  if (s.includes('pickup')) return 'Pick-up';
  if (s.includes('sport utility') || s.includes('suv')) return 'SUV';
  if (s.includes('sedan') || s.includes('saloon')) return 'Berline';
  if (s.includes('hatchback')) return 'Citadine';
  if (s.includes('coupe')) return 'Coupé';
  if (s.includes('convertible') || s.includes('cabriolet')) return 'Cabriolet';
  if (s.includes('wagon') || s.includes('estate')) return 'Break';
  if (s.includes('van') || s.includes('minivan')) return 'Monospace';
  return titleCase(v);
}

export async function decodeVin(vin: string, signal?: AbortSignal): Promise<VinDecodeResult> {
  const clean = vin.trim().toUpperCase();
  if (clean.length !== 17) {
    throw new VinDecodeError('Le VIN doit comporter 17 caractères.');
  }

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  if (signal) signal.addEventListener('abort', () => ctrl.abort());

  try {
    const res = await fetch(`${NHTSA_BASE}/${encodeURIComponent(clean)}?format=json`, {
      signal: ctrl.signal,
      headers: { accept: 'application/json' },
    });
    if (!res.ok) {
      throw new VinDecodeError(`Service VIN indisponible (HTTP ${res.status})`);
    }
    const json = (await res.json()) as { Results?: Array<Record<string, string>> };
    const r = json.Results?.[0];
    if (!r) throw new VinDecodeError('Réponse VIN vide.');

    const errorCode = r.ErrorCode ?? '';
    const errorText = r.ErrorText ?? '';
    // NHTSA ErrorCode 0 = clean. "1" = check-digit mismatch, common on non-US VINs
    // yet fields often still decode — only reject when the API gives us nothing usable.
    if (!r.Make && errorCode && errorCode !== '0') {
      throw new VinDecodeError(
        errorText ? `VIN non reconnu: ${errorText}` : 'VIN non reconnu.',
        errorCode,
      );
    }

    const yearNum = r.ModelYear ? parseInt(r.ModelYear, 10) : NaN;
    const cylNum = r.EngineCylinders ? parseInt(r.EngineCylinders, 10) : NaN;
    const displNum = r.DisplacementL ? parseFloat(r.DisplacementL) : NaN;

    return {
      brand: r.Make ? titleCase(r.Make) : undefined,
      model: r.Model || undefined,
      year: Number.isFinite(yearNum) ? yearNum : undefined,
      fuel: mapFuel(r.FuelTypePrimary),
      transmission: mapTransmission(r.TransmissionStyle),
      bodyType: mapBodyClass(r.BodyClass),
      trim: r.Trim || undefined,
      engineCylinders: Number.isFinite(cylNum) ? cylNum : undefined,
      displacementL: Number.isFinite(displNum) ? displNum : undefined,
      driveType: r.DriveType || undefined,
      vehicleType: r.VehicleType || undefined,
      errorCode: errorCode || undefined,
      errorText: errorText || undefined,
      raw: r,
    };
  } catch (e) {
    if (e instanceof VinDecodeError) throw e;
    if ((e as Error).name === 'AbortError') {
      throw new VinDecodeError('Délai dépassé. Vérifiez votre connexion.');
    }
    throw new VinDecodeError('Impossible de décoder le VIN. Vérifiez votre connexion.');
  } finally {
    clearTimeout(timeout);
  }
}
