'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Card, PageHeader } from '@/components/Page';
import { apiGet, apiDelete, type ApiListing } from '@/lib/api';

export default function ListingsPage() {
  const [items, setItems] = useState<ApiListing[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setItems(await apiGet<ApiListing[]>('/listings'));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return;
    await apiDelete(`/listings/${id}`);
    load();
  };

  const filtered = items.filter((l) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return `${l.brand} ${l.model}`.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.sellerName.toLowerCase().includes(q);
  });

  return (
    <>
      <PageHeader
        title="Annonces marketplace"
        subtitle="Voitures à vendre publiées sur l'app mobile."
        actions={
          <Link href="/listings/new" className="px-4 py-2 bg-amber text-white rounded-lg text-sm font-semibold">
            + Nouvelle annonce
          </Link>
        }
      />

      {loading ? <Card><div className="p-6 text-slate-500">Chargement…</div></Card> : null}
      {err ? <Card><div className="p-6 text-rose-600">Erreur API : {err}</div></Card> : null}

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
              <th className="px-5 py-3 text-center">Photos</th>
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
                <td className="px-5 py-3 text-right font-mono">{l.priceMru.toLocaleString('fr-FR')} MRU</td>
                <td className="px-5 py-3 text-center">{l.photos}</td>
                <td className="px-5 py-3 text-center">
                  <Badge tone={l.status === 'active' ? 'success' : 'warn'}>{l.status}</Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => remove(l.id)} className="text-xs text-rose-600 hover:underline">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">Aucune annonce.</td></tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </>
  );
}
