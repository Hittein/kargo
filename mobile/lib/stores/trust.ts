import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';

export type KycDoc = {
  id: string;
  kind: 'id_front' | 'id_back' | 'license' | 'selfie' | 'address' | 'rib';
  fileName: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
};

export type Dispute = {
  id: string;
  subject: string;
  context:
    | { kind: 'listing'; vehicleId: string }
    | { kind: 'rental'; rentalId: string }
    | { kind: 'trip'; tripId: string }
    | { kind: 'wallet'; txId: string };
  amount?: number;
  description: string;
  evidence: string[];
  status: 'open' | 'mediation' | 'resolved' | 'rejected';
  createdAt: string;
  updates: { at: string; text: string; from: 'you' | 'kargo' | 'partner' }[];
};

export type InspectionRequest = {
  id: string;
  vehicleId: string;
  city: string;
  preferredAt: string;
  status: 'requested' | 'scheduled' | 'completed';
  scheduledAt?: string;
  reportUrl?: string;
};

export type GarantieClaim = {
  id: string;
  vehicleId: string;
  reason: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

type State = {
  trustScore: number;
  badges: string[];
  docs: KycDoc[];
  disputes: Dispute[];
  inspections: InspectionRequest[];
  garantieActive: boolean;
  garantieUntil: string | null;
  claims: GarantieClaim[];

  uploadDoc: (kind: KycDoc['kind'], fileName: string) => string;
  removeDoc: (id: string) => void;

  openDispute: (input: Omit<Dispute, 'id' | 'createdAt' | 'status' | 'updates'>) => string;
  postDisputeUpdate: (id: string, text: string, from: Dispute['updates'][number]['from']) => void;
  closeDispute: (id: string, status: 'resolved' | 'rejected') => void;

  requestInspection: (input: Omit<InspectionRequest, 'id' | 'status'>) => string;
  scheduleInspection: (id: string, at: string) => void;
  completeInspection: (id: string, reportUrl: string) => void;

  activateGarantie: (until: string) => void;
  fileClaim: (input: Omit<GarantieClaim, 'id' | 'createdAt' | 'status'>) => string;

  recompute: () => void;
};

const seedDisputes: Dispute[] = [
  {
    id: 'd_seed_1',
    subject: 'Caution non remboursée',
    context: { kind: 'rental', rentalId: 'r_001' },
    amount: 25000,
    description: 'Voiture rendue sans dégâts mais caution toujours retenue après 7 jours.',
    evidence: ['Photos rendu', 'Contrat'],
    status: 'mediation',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updates: [
      {
        at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        text: 'Litige ouvert.',
        from: 'kargo',
      },
      {
        at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        text: 'Médiation en cours, contact agence.',
        from: 'kargo',
      },
    ],
  },
];

export const useTrustStore = create<State>()(
  persist(
    (set, get) => ({
      trustScore: 62,
      badges: ['phone', 'email'],
      docs: [],
      disputes: seedDisputes,
      inspections: [],
      garantieActive: false,
      garantieUntil: null,
      claims: [],

      uploadDoc: (kind, fileName) => {
        const id = `doc_${Date.now()}`;
        const doc: KycDoc = {
          id,
          kind,
          fileName,
          uploadedAt: new Date().toISOString(),
          status: 'pending',
        };
        set((s) => ({ docs: [doc, ...s.docs] }));
        setTimeout(() => {
          useTrustStore.setState((s) => ({
            docs: s.docs.map((d) => (d.id === id ? { ...d, status: 'approved' } : d)),
          }));
          useTrustStore.getState().recompute();
        }, 2500);
        return id;
      },
      removeDoc: (id) => set((s) => ({ docs: s.docs.filter((d) => d.id !== id) })),

      openDispute: (input) => {
        const id = `d_${Date.now()}`;
        const dispute: Dispute = {
          ...input,
          id,
          status: 'open',
          createdAt: new Date().toISOString(),
          updates: [
            {
              at: new Date().toISOString(),
              text: 'Litige ouvert. Notre équipe revient vers vous sous 24h.',
              from: 'kargo',
            },
          ],
        };
        set((s) => ({ disputes: [dispute, ...s.disputes] }));
        return id;
      },
      postDisputeUpdate: (id, text, from) =>
        set((s) => ({
          disputes: s.disputes.map((d) =>
            d.id === id
              ? { ...d, updates: [...d.updates, { at: new Date().toISOString(), text, from }] }
              : d,
          ),
        })),
      closeDispute: (id, status) =>
        set((s) => ({
          disputes: s.disputes.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status,
                  updates: [
                    ...d.updates,
                    {
                      at: new Date().toISOString(),
                      text: status === 'resolved' ? 'Litige résolu.' : 'Litige rejeté.',
                      from: 'kargo',
                    },
                  ],
                }
              : d,
          ),
        })),

      requestInspection: (input) => {
        const id = `insp_${Date.now()}`;
        set((s) => ({
          inspections: [
            { ...input, id, status: 'requested' as const },
            ...s.inspections,
          ],
        }));
        setTimeout(() => {
          const at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString();
          useTrustStore.setState((s) => ({
            inspections: s.inspections.map((i) =>
              i.id === id ? { ...i, status: 'scheduled', scheduledAt: at } : i,
            ),
          }));
        }, 2000);
        return id;
      },
      scheduleInspection: (id, at) =>
        set((s) => ({
          inspections: s.inspections.map((i) =>
            i.id === id ? { ...i, status: 'scheduled', scheduledAt: at } : i,
          ),
        })),
      completeInspection: (id, reportUrl) =>
        set((s) => ({
          inspections: s.inspections.map((i) =>
            i.id === id ? { ...i, status: 'completed', reportUrl } : i,
          ),
        })),

      activateGarantie: (until) => set({ garantieActive: true, garantieUntil: until }),
      fileClaim: (input) => {
        const id = `cl_${Date.now()}`;
        set((s) => ({
          claims: [
            { ...input, id, status: 'pending' as const, createdAt: new Date().toISOString() },
            ...s.claims,
          ],
        }));
        return id;
      },

      recompute: () => {
        const { docs, disputes, garantieActive } = get();
        const approved = docs.filter((d) => d.status === 'approved').length;
        const openLitiges = disputes.filter((d) => d.status === 'open' || d.status === 'mediation').length;
        let score = 50;
        score += approved * 8;
        score += garantieActive ? 5 : 0;
        score -= openLitiges * 4;
        score = Math.min(100, Math.max(0, score));
        const badges: string[] = ['phone', 'email'];
        if (docs.some((d) => d.kind === 'id_front' && d.status === 'approved')) badges.push('id');
        if (docs.some((d) => d.kind === 'license' && d.status === 'approved')) badges.push('license');
        if (docs.some((d) => d.kind === 'selfie' && d.status === 'approved')) badges.push('selfie');
        if (garantieActive) badges.push('garantie');
        set({ trustScore: score, badges });
      },
    }),
    {
      name: 'kargo:trust',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
