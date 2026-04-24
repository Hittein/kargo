'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Card, PageHeader } from '@/components/Page';
import { apiGet, apiDelete, type ApiRentalListing } from '@/lib/api';

export default function RentalsPage() {
  const [items, setItems] = useState<ApiRentalListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setItems(await apiGet<ApiRentalListing[]>('/rental-listings'));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce véhicule de location ?')) return;
    await apiDelete(`/rental-listings/${id}`);
    load();
  };

  return (
    <>
      <PageHeader
        title="Véhicules de location"
        subtitle="Parc de location publié sur l'app mobile."
        actions={
          <Link href="/rentals/new" className="px-4 py-2 bg-amber text-white rounded-lg text-sm font-semibold">
            + Nouveau véhicule
          </Link>
        }
      />

      {loading ? <Card><div className="p-6 text-slate-500">Chargement…</div></Card> : null}
      {err ? <Card><div className="p-6 text-rose-600">Erreur API : {err}</div></Card> : null}

      <Card>
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
            {items.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3">
                  <div className="font-medium">{r.brand} {r.model}</div>
                  <div className="text-xs text-slate-500">{r.year}</div>
                </td>
                <td className="px-5 py-3">{r.companyName ?? '—'}</td>
                <td className="px-5 py-3 capitalize">{r.category}</td>
                <td className="px-5 py-3 text-right font-mono">{r.pricePerDayMru.toLocaleString('fr-FR')} MRU</td>
                <td className="px-5 py-3 text-center">{r.city}</td>
                <td className="px-5 py-3 text-center">
                  <Badge tone={r.status === 'active' ? 'success' : 'warn'}>{r.status}</Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => remove(r.id)} className="text-xs text-rose-600 hover:underline">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500">Aucun véhicule de location.</td></tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </>
  );
}
