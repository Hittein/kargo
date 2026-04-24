'use client';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Card, PageHeader } from '@/components/Page';
import { apiGet } from '@/lib/api';

type AdminTicket = {
  id: string;
  userId: string;
  tripId: string;
  seatsBooked: number;
  totalPaidMru: number;
  paymentMethod: string;
  status: string;
  qrToken?: string;
  createdAt: string;
  usedAt?: string;
  fromCityId: string;
  toCityId: string;
  departure: string;
};

const STATUS_LABEL: Record<string, string> = {
  paid: 'Payé',
  reserved: 'Réservé',
  used: 'Utilisé',
  cancelled: 'Annulé',
  refunded: 'Remboursé',
};

function statusTone(s: string): 'success' | 'warn' | 'danger' | 'neutral' {
  if (s === 'paid' || s === 'used') return 'success';
  if (s === 'reserved') return 'warn';
  if (s === 'cancelled' || s === 'refunded') return 'danger';
  return 'neutral';
}

function formatMRU(n: number) {
  return n.toLocaleString('fr-FR');
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function TicketsPage() {
  const [items, setItems] = useState<AdminTicket[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setItems(await apiGet<AdminTicket[]>('/admin/tickets'));
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'load_failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (t) =>
        t.fromCityId.toLowerCase().includes(q) ||
        t.toCityId.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q),
    );
  }, [items, query]);

  const totalGMV = items
    .filter((t) => t.status === 'paid' || t.status === 'used')
    .reduce((s, t) => s + t.totalPaidMru, 0);

  return (
    <>
      <PageHeader
        title="Billets transport"
        subtitle={`${items.length} billet${items.length > 1 ? 's' : ''} · ${formatMRU(totalGMV)} MRU encaissés`}
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
        <div className="px-5 py-3 border-b border-slate-100">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par ville, méthode, statut…"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
          />
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Trajet</th>
              <th className="px-5 py-3 text-left">Départ</th>
              <th className="px-5 py-3 text-center">Places</th>
              <th className="px-5 py-3 text-right">Payé</th>
              <th className="px-5 py-3 text-left">Méthode</th>
              <th className="px-5 py-3 text-center">Statut</th>
              <th className="px-5 py-3 text-left">Acheté le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((t) => (
              <tr key={t.id}>
                <td className="px-5 py-3">
                  <div className="font-medium uppercase">
                    {t.fromCityId} → {t.toCityId}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {t.id.slice(0, 8)}…
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-slate-600">
                  {formatDate(t.departure)}
                </td>
                <td className="px-5 py-3 text-center tabular-nums">{t.seatsBooked}</td>
                <td className="px-5 py-3 text-right font-mono font-semibold text-amber">
                  {formatMRU(t.totalPaidMru)}
                </td>
                <td className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500">
                  {t.paymentMethod.replace(/_/g, ' ')}
                </td>
                <td className="px-5 py-3 text-center">
                  <Badge tone={statusTone(t.status)}>
                    {STATUS_LABEL[t.status] ?? t.status}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-xs text-slate-500">
                  {formatDate(t.createdAt)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  {items.length === 0
                    ? 'Aucun billet acheté pour le moment.'
                    : 'Aucun résultat pour cette recherche.'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </>
  );
}
