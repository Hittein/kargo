'use client';
import { useMemo, useState } from 'react';
import { Badge, Card, PageHeader } from '@/components/Page';
import { LISTINGS, formatMRU, formatRel } from '@/lib/data';
import type { AdminListing } from '@/lib/data';

type Filter = 'all' | 'pending_review' | 'active' | 'flagged' | 'sold' | 'rejected';

export default function ListingsPage() {
  const [items, setItems] = useState(LISTINGS);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = items;
    if (filter !== 'all') list = list.filter((l) => l.status === filter);
    const q = query.toLowerCase().trim();
    if (q) list = list.filter((l) => `${l.brand} ${l.model}`.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.sellerName.toLowerCase().includes(q));
    return list;
  }, [items, filter, query]);

  const decide = (id: string, status: AdminListing['status']) => {
    setItems(items.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  return (
    <>
      <PageHeader title="Annonces" subtitle="Modération marketplace, signalements et statistiques." />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          ['all', 'Tous'],
          ['pending_review', 'À modérer'],
          ['flagged', 'Signalés'],
          ['active', 'Publiés'],
          ['sold', 'Vendus'],
        ].map(([k, label]) => {
          const count = k === 'all' ? items.length : items.filter((l) => l.status === k).length;
          const active = filter === k;
          return (
            <button
              key={k}
              onClick={() => setFilter(k as Filter)}
              className={`p-4 rounded-xl text-left transition-colors ${active ? 'bg-ink text-white' : 'bg-white text-ink border border-slate-100'}`}
            >
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs opacity-80">{label}</div>
            </button>
          );
        })}
      </div>

      <Card>
        <div className="px-5 py-3 border-b border-slate-100">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher marque, modèle, ville, vendeur…"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
          />
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Véhicule</th>
              <th className="px-5 py-3 text-left">Vendeur</th>
              <th className="px-5 py-3 text-right">Prix</th>
              <th className="px-5 py-3 text-center">Vues</th>
              <th className="px-5 py-3 text-center">Contacts</th>
              <th className="px-5 py-3 text-center">Signalements</th>
              <th className="px-5 py-3 text-center">Publié</th>
              <th className="px-5 py-3 text-center">Statut</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((l) => (
              <tr key={l.id}>
                <td className="px-5 py-3">
                  <div className="font-medium">{l.brand} {l.model}</div>
                  <div className="text-xs text-slate-500">{l.year} · {l.city}</div>
                </td>
                <td className="px-5 py-3">
                  <div className="font-medium">{l.sellerName}</div>
                  <div className="text-xs text-slate-500">{l.sellerType === 'pro' ? 'Pro' : 'Particulier'}</div>
                </td>
                <td className="px-5 py-3 text-right font-mono">{formatMRU(l.price)} MRU</td>
                <td className="px-5 py-3 text-center">{l.views}</td>
                <td className="px-5 py-3 text-center">{l.contacts}</td>
                <td className="px-5 py-3 text-center">
                  {l.flags > 0 ? <Badge tone="danger">{l.flags}</Badge> : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-5 py-3 text-center text-xs text-slate-500">{formatRel(l.createdAt)}</td>
                <td className="px-5 py-3 text-center">
                  <Badge
                    tone={
                      l.status === 'active' ? 'success'
                        : l.status === 'sold' ? 'info'
                          : l.status === 'rejected' ? 'danger'
                            : l.status === 'flagged' ? 'danger'
                              : 'warn'
                    }
                  >
                    {l.status}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {l.status === 'pending_review' || l.status === 'flagged' ? (
                      <>
                        <button onClick={() => decide(l.id, 'active')} className="text-xs text-emerald-600 hover:underline">
                          Approuver
                        </button>
                        <button onClick={() => decide(l.id, 'rejected')} className="text-xs text-rose-600 hover:underline">
                          Rejeter
                        </button>
                      </>
                    ) : (
                      <button className="text-xs text-slate-500 hover:underline">Voir</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
