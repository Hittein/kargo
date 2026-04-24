'use client';
import { useState } from 'react';
import { Badge, Card, PageHeader } from '@/components/Page';
import { TRIPS, formatMRU } from '@/lib/data';
import type { AdminTrip } from '@/lib/data';

export default function TransitPage() {
  const [trips, setTrips] = useState(TRIPS);

  const updateStatus = (id: string, status: AdminTrip['status']) => {
    setTrips(trips.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const total = trips.length;
  const active = trips.filter((t) => t.status === 'in_transit' || t.status === 'boarding').length;
  const cancelled = trips.filter((t) => t.status === 'cancelled').length;
  const seatsSold = trips.reduce((a, t) => a + (t.seatsTotal - t.seatsLeft), 0);

  return (
    <>
      <PageHeader title="Trajets inter-villes" subtitle="Plannings, taux de remplissage, incidents." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatTile label="Trajets jour" value={String(total)} />
        <StatTile label="En cours" value={String(active)} tone="success" />
        <StatTile label="Annulés" value={String(cancelled)} tone={cancelled > 0 ? 'danger' : 'success'} />
        <StatTile label="Places vendues" value={String(seatsSold)} />
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Trajet</th>
              <th className="px-5 py-3 text-left">Compagnie</th>
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
                    <div className="font-medium">{t.from} → {t.to}</div>
                    <div className="text-xs text-slate-500">#{t.id}</div>
                  </td>
                  <td className="px-5 py-3">{t.company}</td>
                  <td className="px-5 py-3 text-center text-xs">{new Date(t.departure).toLocaleString('fr-FR')}</td>
                  <td className="px-5 py-3 text-right font-mono">{formatMRU(t.price)} MRU</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${ratio > 0.8 ? 'bg-emerald-500' : ratio > 0.4 ? 'bg-amber' : 'bg-rose-500'}`} style={{ width: `${ratio * 100}%` }} />
                      </div>
                      <span className="text-xs">{sold}/{t.seatsTotal}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Badge
                      tone={
                        t.status === 'arrived' ? 'success'
                          : t.status === 'in_transit' ? 'info'
                            : t.status === 'cancelled' ? 'danger'
                              : 'warn'
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {t.status !== 'cancelled' && t.status !== 'arrived' ? (
                        <button onClick={() => updateStatus(t.id, 'cancelled')} className="text-xs text-rose-600 hover:underline">
                          Annuler
                        </button>
                      ) : null}
                      {t.status === 'scheduled' ? (
                        <button onClick={() => updateStatus(t.id, 'boarding')} className="text-xs text-amber hover:underline">
                          Lancer embarquement
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function StatTile({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' | 'danger' }) {
  const cls = { default: 'text-ink', success: 'text-emerald-600', danger: 'text-rose-600' }[tone];
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100">
      <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">{label}</div>
      <div className={`text-2xl font-bold ${cls}`}>{value}</div>
    </div>
  );
}
