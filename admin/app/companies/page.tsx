'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Card, PageHeader } from '@/components/Page';
import { apiGet, apiDelete, type ApiCompany } from '@/lib/api';

export default function CompaniesPage() {
  const [items, setItems] = useState<ApiCompany[]>([]);
  const [tab, setTab] = useState<'all' | 'transit' | 'rental'>('all');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiGet<ApiCompany[]>('/companies');
      setItems(data);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter((c) => tab === 'all' || c.type === tab);

  const remove = async (id: string) => {
    if (!confirm('Supprimer cette compagnie ?')) return;
    await apiDelete(`/companies/${id}`);
    load();
  };

  return (
    <>
      <PageHeader
        title="Compagnies partenaires"
        subtitle="Compagnies de transport et agences de location."
        actions={
          <Link
            href="/companies/new"
            className="px-4 py-2 bg-amber text-white rounded-lg text-sm font-semibold"
          >
            + Nouvelle compagnie
          </Link>
        }
      />

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

      {loading ? <Card><div className="p-6 text-slate-500">Chargement…</div></Card> : null}
      {err ? <Card><div className="p-6 text-rose-600">Erreur API : {err}</div></Card> : null}

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
                    <div className="text-xs text-slate-500">
                      {c.type === 'transit' ? 'Transport' : 'Location'} · {c.city}
                    </div>
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
                  <div className="font-medium text-xs">{c.contact || '—'}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => remove(c.id)} className="text-xs text-rose-600 hover:underline">
                  Supprimer
                </button>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && !loading ? (
          <Card><div className="p-6 text-slate-500">Aucune compagnie. Cliquez sur "Nouvelle compagnie".</div></Card>
        ) : null}
      </div>
    </>
  );
}
