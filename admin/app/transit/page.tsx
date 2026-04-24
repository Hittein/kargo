'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Card, PageHeader } from '@/components/Page';
import { apiGet, apiDelete, type ApiTrip } from '@/lib/api';

export default function TransitPage() {
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setTrips(await apiGet<ApiTrip[]>('/trips'));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce trajet ?')) return;
    await apiDelete(`/trips/${id}`);
    load();
  };

  return (
    <>
      <PageHeader
        title="Trajets inter-villes"
        subtitle="Plannings et taux de remplissage."
        actions={
          <Link href="/transit/new" className="px-4 py-2 bg-amber text-white rounded-lg text-sm font-semibold">
            + Nouveau trajet
          </Link>
        }
      />

      {loading ? <Card><div className="p-6 text-slate-500">Chargement…</div></Card> : null}
      {err ? <Card><div className="p-6 text-rose-600">Erreur API : {err}</div></Card> : null}

      <Card>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Trajet</th>
              <th className="px-5 py-3 text-center">Départ</th>
              <th className="px-5 py-3 text-right">Prix</th>
              <th className="px-5 py-3 text-center">Remplissage</th>
              <th className="px-5 py-3 text-center">Statut</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trips.map((t) => {
              const sold = t.seatsTotal - t.seatsLeft;
              const ratio = sold / t.seatsTotal;
              return (
                <tr key={t.id}>
                  <td className="px-5 py-3">
                    <div className="font-medium">{t.fromCityId.toUpperCase()} → {t.toCityId.toUpperCase()}</div>
                    <div className="text-xs text-slate-500">{t.fromStop} → {t.toStop}</div>
                  </td>
                  <td className="px-5 py-3 text-center text-xs">{new Date(t.departure).toLocaleString('fr-FR')}</td>
                  <td className="px-5 py-3 text-right font-mono">{t.priceMru.toLocaleString('fr-FR')} MRU</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${ratio > 0.8 ? 'bg-emerald-500' : ratio > 0.4 ? 'bg-amber' : 'bg-rose-500'}`} style={{ width: `${ratio * 100}%` }} />
                      </div>
                      <span className="text-xs">{sold}/{t.seatsTotal}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Badge tone={t.status === 'in_transit' ? 'info' : t.status === 'cancelled' ? 'danger' : 'warn'}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => remove(t.id)} className="text-xs text-rose-600 hover:underline">
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}
            {trips.length === 0 && !loading ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">Aucun trajet programmé.</td></tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </>
  );
}
