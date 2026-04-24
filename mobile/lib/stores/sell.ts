import { create } from 'zustand';
import type { FuelType, Transmission } from '@/lib/mocks/vehicles';

export type ContactMethod = 'call' | 'whatsapp' | 'sms' | 'chat';
export type AccidentHistory = 'none' | 'minor' | 'major';

export type SellDraft = {
  vin?: string;
  vinDecoded?: boolean;

  brand?: string;
  model?: string;
  year?: number;
  fuel?: FuelType;
  transmission?: Transmission;
  bodyType?: string;

  km?: number;
  importYear?: number;
  ownersInCountry?: number;
  accidents?: AccidentHistory;
  serviced?: boolean;
  insuranceActive?: boolean;

  price?: number;
  negotiable?: boolean;
  city?: string;
  district?: string;

  photoUrls: string[];

  contactPhone?: string;
  contactMethods: ContactMethod[];
  availabilityHours?: string;
};

const EMPTY: SellDraft = {
  photoUrls: [],
  contactMethods: [],
};

export type SellMode = 'sell' | 'rent';

type State = {
  mode: SellMode;
  draft: SellDraft;
  setMode: (mode: SellMode) => void;
  patch: (p: Partial<SellDraft>) => void;
  addPhoto: (url: string) => void;
  removePhoto: (url: string) => void;
  movePhotoFirst: (url: string) => void;
  toggleContactMethod: (m: ContactMethod) => void;
  reset: () => void;
};

export const useSellStore = create<State>((set, get) => ({
  mode: 'sell',
  draft: EMPTY,
  setMode: (mode) => set({ mode, draft: EMPTY }),
  patch: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),
  addPhoto: (url) => {
    const d = get().draft;
    if (d.photoUrls.includes(url)) return;
    set({ draft: { ...d, photoUrls: [...d.photoUrls, url] } });
  },
  removePhoto: (url) => {
    const d = get().draft;
    set({ draft: { ...d, photoUrls: d.photoUrls.filter((u) => u !== url) } });
  },
  movePhotoFirst: (url) => {
    const d = get().draft;
    const rest = d.photoUrls.filter((u) => u !== url);
    set({ draft: { ...d, photoUrls: [url, ...rest] } });
  },
  toggleContactMethod: (m) => {
    const d = get().draft;
    const active = d.contactMethods.includes(m);
    set({
      draft: {
        ...d,
        contactMethods: active
          ? d.contactMethods.filter((x) => x !== m)
          : [...d.contactMethods, m],
      },
    });
  },
  reset: () => set({ draft: EMPTY, mode: 'sell' }),
}));

export function sellProgress(draft: SellDraft): number {
  let n = 0;
  if (draft.brand && draft.model && draft.year) n++;
  if (draft.km != null && draft.ownersInCountry != null) n++;
  if (draft.price != null && draft.city) n++;
  if (draft.photoUrls.length >= 3) n++;
  if (draft.contactMethods.length > 0 && draft.contactPhone) n++;
  return n;
}

export const SELL_STEP_COUNT = 5;
