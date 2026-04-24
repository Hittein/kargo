'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Card, PageHeader } from '@/components/Page';
import { apiDelete, apiGet, apiPatch, type ApiRentalListing } from '@/lib/api';

type StatusFilter = 'all' | 'pending' | 'active' | 'rejected' | 'archived';

const STATUS_LABEL: Record<string, string> = {
  pending: 'En modération',
  active: 'Publiée',
  rejected: 'Refusée',
  archived: 'Archivée',
};

function statusTone(s: string): 'success' | 'warn' | 'danger' | 'neutral' {
  if (s === 'active') return 'success';
  if (s === 'pending') return 'warn';
  if (s === 'rejected') return 'danger';
  return 'neutral';
}

export default function RentalsPage() {
  const [items, setItems] = useState<ApiRentalListing[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      setItems(await apiGet<ApiRentalListing[]>('/admin/rental-listings'));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id: string, next: string) => {
    setBusyId(id);
    try {
      await apiPatch<ApiRentalListing>(`/admin/rental-listings/${id}/status`, { status: next });
      await load();
    } catch (e) {
      alert(`Erreur: ${e instanceof Error ? e.message : 'status_update_failed'}`);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce véhicule de location ?')) return;
    try {
      await apiDelete(`/rental-listings/${id}`);
      await load();
    } catch (e) {
      alert(`Erreur: ${e instanceof Error ? e.message : 'delete_failed'}`);
    }
  };

  const filtered = items.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      `${r.brand} ${r.model}`.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      (r.companyName ?? '').toLowerCase().includes(q)
    );
  });

  const pendingCount = items.filter((r) => r.status === 'pending').length;

  return (
    <>
      <PageHeader
        title="Véhicules de location"
        subtitle={
          pendingCount > 0
            ? `${pendingCount} annonce${pendingCount > 1 ? 's' : ''} en attente de modération.`
            : "Parc de location publié sur l'app mobile."
        }
        actions={
          <Link
            href="/rentals/new"
            className="px-4 py-2 bg-amber text-white rounded-lg text-sm font-semibold"
          >
            + Nouveau véhicule
          </Link>
        }
      />

      {loading ? (
        <Card>
          <div className="p-6 text-slate-500">Chargement…</div>
        </Card>
      ) : null}
      {err ? (
        <Card>
          <div className="p-6 text-rose-600">Erreur API : {err}</div>
        </Card>
      ) : null}

      <Card>
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher marque, modèle, ville, agence…"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-200 text-sm"
          />
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 text-xs">
            {(
              [
                { key: 'all', label: 'Tout' },
                { key: 'pending', label: `À modérer${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
                { key: 'active', label: 'Publiées' },
                { key: 'rejected', label: 'Refusées' },
                { key: 'archived', label: 'Archivées' },
              ] as { key: StatusFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-md font-semibold transition ${
                  statusFilter === tab.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Véhicule</th>
              <th className="px-5 py-3 text-left">Agence</th>
              <th className="px-5 py-3 text-left">Catégorie</th>
              <th className="px-5 py-3 text-right">Prix/jour</th>
              <th className="px-5 py-3 text-center">Ville</th>
              <th className="px-5 py-3 text-center">Statut</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <tr key={r.id} className={r.status === 'pending' ? 'bg-amber-50/40' : ''}>
                <td className="px-5 py-3">
                  <div className="font-medium">
                    {r.brand} {r.model}
                  </div>
                  <div className="text-xs text-slate-500">{r.year}</div>
                </td>
                <td className="px-5 py-3">{r.companyName ?? '—'}</td>
                <td className="px-5 py-3 capitalize">{r.category}</td>
                <td className="px-5 py-3 text-right font-mono">
                  {r.pricePerDayMru.toLocaleString('fr-FR')} MRU
                </td>
                <td className="px-5 py-3 text-center">{r.city}</td>
                <td className="px-5 py-3 text-center">
                  <Badge tone={statusTone(r.status)}>{STATUS_LABEL[r.status] ?? r.status}</Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {r.status === 'pending' ? (
                      <>
                        <button
                          disabled={busyId === r.id}
                          onClick={() => changeStatus(r.id, 'active')}
                          className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 font-semibold"
                        >
                          Publier
                        </button>
                        <button
                          disabled={busyId === r.id}
                          onClick={() => changeStatus(r.id, 'rejected')}
                          className="text-xs px-3 py-1.5 rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-50 font-semibold"
                        >
                          Refuser
                        </button>
                      </>
                    ) : r.status === 'active' ? (
                      <button
                        disabled={busyId === r.id}
                        onClick={() => changeStatus(r.id, 'pending')}
                        className="text-xs px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 font-semibold"
                      >
                        Dépublier
                      </button>
                    ) : r.status === 'rejected' ? (
                      <button
                        disabled={busyId === r.id}
                        onClick={() => changeStatus(r.id, 'pending')}
                        className="text-xs px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 font-semibold"
                      >
                        Remettre en modération
                      </button>
                    ) : null}
                    <button
                      onClick={() => remove(r.id)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                  Aucun véhicule de location.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </>
  );
}
