'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Card, PageHeader } from '@/components/Page';
import { apiDelete, apiGet, apiPatch, type ApiListing } from '@/lib/api';

type StatusFilter = 'all' | 'pending' | 'active' | 'rejected' | 'sold';

const STATUS_LABEL: Record<string, string> = {
  pending: 'En modération',
  active: 'Publiée',
  rejected: 'Refusée',
  sold: 'Vendue',
  draft: 'Brouillon',
};

function statusTone(s: string): 'success' | 'warn' | 'danger' | 'neutral' {
  if (s === 'active') return 'success';
  if (s === 'pending') return 'warn';
  if (s === 'rejected') return 'danger';
  return 'neutral';
}

export default function ListingsPage() {
  const [items, setItems] = useState<ApiListing[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      // Endpoint admin: retourne toutes les annonces tous statuts confondus.
      setItems(await apiGet<ApiListing[]>('/admin/listings'));
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
      await apiPatch<ApiListing>(`/admin/listings/${id}/status`, { status: next });
      await load();
    } catch (e) {
      alert(`Erreur: ${e instanceof Error ? e.message : 'status_update_failed'}`);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return;
    try {
      await apiDelete(`/listings/${id}`);
      await load();
    } catch (e) {
      alert(`Erreur: ${e instanceof Error ? e.message : 'delete_failed'}`);
    }
  };

  const filtered = items.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      `${l.brand} ${l.model}`.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.sellerName.toLowerCase().includes(q)
    );
  });

  const pendingCount = items.filter((l) => l.status === 'pending').length;

  return (
    <>
      <PageHeader
        title="Annonces marketplace"
        subtitle={
          pendingCount > 0
            ? `${pendingCount} annonce${pendingCount > 1 ? 's' : ''} en attente de modération.`
            : "Voitures à vendre publiées sur l'app mobile."
        }
        actions={
          <Link
            href="/listings/new"
            className="px-4 py-2 bg-amber text-white rounded-lg text-sm font-semibold"
          >
            + Nouvelle annonce
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
            placeholder="Rechercher marque, modèle, ville, vendeur…"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-200 text-sm"
          />
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 text-xs">
            {(
              [
                { key: 'all', label: 'Tout' },
                { key: 'pending', label: `À modérer${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
                { key: 'active', label: 'Publiées' },
                { key: 'rejected', label: 'Refusées' },
                { key: 'sold', label: 'Vendues' },
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
              <th className="px-5 py-3 text-left">Vendeur</th>
              <th className="px-5 py-3 text-right">Prix</th>
              <th className="px-5 py-3 text-center">Photos</th>
              <th className="px-5 py-3 text-center">Vues</th>
              <th className="px-5 py-3 text-center">Statut</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((l) => (
              <tr key={l.id} className={l.status === 'pending' ? 'bg-amber-50/40' : ''}>
                <td className="px-5 py-3">
                  <div className="font-medium">
                    {l.brand} {l.model}
                  </div>
                  <div className="text-xs text-slate-500">
                    {l.year} · {l.city}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="font-medium">{l.sellerName}</div>
                  <div className="text-xs text-slate-500">
                    {l.sellerType === 'pro' ? 'Pro' : 'Particulier'}
                  </div>
                </td>
                <td className="px-5 py-3 text-right font-mono">
                  {l.priceMru.toLocaleString('fr-FR')} MRU
                </td>
                <td className="px-5 py-3 text-center">{l.photos}</td>
                <td className="px-5 py-3 text-center text-xs text-slate-500">
                  {l.viewCount ?? 0}
                </td>
                <td className="px-5 py-3 text-center">
                  <Badge tone={statusTone(l.status)}>{STATUS_LABEL[l.status] ?? l.status}</Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {l.status === 'pending' ? (
                      <>
                        <button
                          disabled={busyId === l.id}
                          onClick={() => changeStatus(l.id, 'active')}
                          className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 font-semibold"
                        >
                          Publier
                        </button>
                        <button
                          disabled={busyId === l.id}
                          onClick={() => changeStatus(l.id, 'rejected')}
                          className="text-xs px-3 py-1.5 rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-50 font-semibold"
                        >
                          Refuser
                        </button>
                      </>
                    ) : l.status === 'active' ? (
                      <button
                        disabled={busyId === l.id}
                        onClick={() => changeStatus(l.id, 'pending')}
                        className="text-xs px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 font-semibold"
                      >
                        Dépublier
                      </button>
                    ) : l.status === 'rejected' ? (
                      <button
                        disabled={busyId === l.id}
                        onClick={() => changeStatus(l.id, 'pending')}
                        className="text-xs px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 font-semibold"
                      >
                        Remettre en modération
                      </button>
                    ) : null}
                    <button
                      onClick={() => remove(l.id)}
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
                  Aucune annonce.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </>
  );
}
