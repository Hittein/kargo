'use client';
import { useState } from 'react';
import { Badge, Card, PageHeader } from '@/components/Page';
import { COMPANIES } from '@/lib/data';
import type { AdminCompany } from '@/lib/data';

export default function CompaniesPage() {
  const [items, setItems] = useState(COMPANIES);
  const [tab, setTab] = useState<'all' | 'transit' | 'rental'>('all');

  const filtered = items.filter((c) => tab === 'all' || c.type === tab);

  const setStatus = (id: string, status: AdminCompany['status']) =>
    setItems(items.map((c) => (c.id === id ? { ...c, status } : c)));

  return (
    <>
      <PageHeader title="Compagnies partenaires" subtitle="Compagnies de transport et agences de location." />

      <div className="flex gap-2 mb-4">
        {([
          ['all', 'Toutes'],
          ['transit', 'Transport'],
          ['rental', 'Location'],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === k ? 'bg-ink text-white' : 'bg-white text-ink border border-slate-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <Card key={c.id}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center font-bold">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.type === 'transit' ? 'Transport' : 'Location'} · {c.city}</div>
                  </div>
                </div>
                <Badge tone={c.status === 'active' ? 'success' : c.status === 'paused' ? 'warn' : 'danger'}>
                  {c.status === 'kyc_pending' ? 'KYC en attente' : c.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500">Note</div>
                  <div className="font-bold">★ {c.rating.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Flotte</div>
                  <div className="font-bold">{c.fleetSize}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Contact</div>
                  <div className="font-medium text-xs">{c.contact}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                {c.status !== 'active' ? (
                  <button onClick={() => setStatus(c.id, 'active')} className="text-xs text-emerald-600 hover:underline">
                    Activer
                  </button>
                ) : (
                  <button onClick={() => setStatus(c.id, 'paused')} className="text-xs text-amber hover:underline">
                    Mettre en pause
                  </button>
                )}
                <button className="text-xs text-slate-500 hover:underline">Voir le détail</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
