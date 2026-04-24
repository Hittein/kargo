'use client';
import { useState } from 'react';
import { Badge, Card, PageHeader } from '@/components/Page';
import { INSPECTIONS, formatRel } from '@/lib/data';
import type { AdminInspection } from '@/lib/data';

const INSPECTORS = ['Inspecteur Boubou', 'Inspecteur Salem', 'Inspecteur Aïcha', 'Inspecteur Mohamed'];

export default function InspectionsPage() {
  const [items, setItems] = useState<AdminInspection[]>(INSPECTIONS);

  const schedule = (id: string) => {
    const inspector = INSPECTORS[Math.floor(Math.random() * INSPECTORS.length)];
    const at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString();
    setItems(items.map((i) => (i.id === id ? { ...i, status: 'scheduled', scheduledAt: at, inspector } : i)));
  };

  const complete = (id: string) =>
    setItems(items.map((i) => (i.id === id ? { ...i, status: 'completed' } : i)));

  const counts = {
    requested: items.filter((i) => i.status === 'requested').length,
    scheduled: items.filter((i) => i.status === 'scheduled').length,
    completed: items.filter((i) => i.status === 'completed').length,
  };

  return (
    <>
      <PageHeader title="Inspections Kargo Verified" subtitle="Demandes, planning, rapports d'inspection 80 points." />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {([
          ['requested', 'À programmer', 'warn'],
          ['scheduled', 'Programmées', 'info'],
          ['completed', 'Terminées', 'success'],
        ] as const).map(([k, label, tone]) => (
          <div key={k} className="bg-white rounded-xl p-5 border border-slate-100">
            <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
            <div className={`text-3xl font-bold mt-2 ${tone === 'warn' ? 'text-amber' : tone === 'info' ? 'text-sky-600' : 'text-emerald-600'}`}>
              {counts[k]}
            </div>
          </div>
        ))}
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Véhicule</th>
              <th className="px-5 py-3 text-left">Ville</th>
              <th className="px-5 py-3 text-left">Demandée</th>
              <th className="px-5 py-3 text-left">Inspecteur</th>
              <th className="px-5 py-3 text-left">Programmée</th>
              <th className="px-5 py-3 text-center">Statut</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((i) => (
              <tr key={i.id}>
                <td className="px-5 py-3 font-mono">{i.vehicleId}</td>
                <td className="px-5 py-3">{i.city}</td>
                <td className="px-5 py-3 text-xs text-slate-500">{formatRel(i.requestedAt)}</td>
                <td className="px-5 py-3">{i.inspector ?? <span className="text-slate-400">—</span>}</td>
                <td className="px-5 py-3 text-xs text-slate-500">
                  {i.scheduledAt ? new Date(i.scheduledAt).toLocaleString('fr-FR') : '—'}
                </td>
                <td className="px-5 py-3 text-center">
                  <Badge tone={i.status === 'completed' ? 'success' : i.status === 'scheduled' ? 'info' : 'warn'}>
                    {i.status === 'requested' ? 'À programmer' : i.status === 'scheduled' ? 'Programmée' : 'Terminée'}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {i.status === 'requested' ? (
                      <button onClick={() => schedule(i.id)} className="text-xs text-emerald-600 hover:underline">
                        Programmer
                      </button>
                    ) : null}
                    {i.status === 'scheduled' ? (
                      <button onClick={() => complete(i.id)} className="text-xs text-amber hover:underline">
                        Marquer effectuée
                      </button>
                    ) : null}
                    {i.status === 'completed' ? (
                      <button className="text-xs text-slate-500 hover:underline">Rapport PDF</button>
                    ) : null}
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
