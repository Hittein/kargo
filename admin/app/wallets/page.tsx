'use client';
import { useMemo, useState } from 'react';
import { Badge, Card, PageHeader, StatCard } from '@/components/Page';
import { TRANSACTIONS, USERS, formatMRU, formatRel } from '@/lib/data';
import type { AdminTransaction } from '@/lib/data';

type Filter = 'all' | 'completed' | 'pending' | 'failed' | 'refunded';

export default function WalletsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = TRANSACTIONS as AdminTransaction[];
    if (filter !== 'all') list = list.filter((t) => t.status === filter);
    const q = query.toLowerCase().trim();
    if (q) list = list.filter((t) => t.user.toLowerCase().includes(q) || t.reference.toLowerCase().includes(q));
    return list;
  }, [filter, query]);

  const totalIn = TRANSACTIONS.filter((t) => t.amount > 0 && t.status === 'completed').reduce((a, b) => a + b.amount, 0);
  const totalOut = TRANSACTIONS.filter((t) => t.amount < 0 && t.status === 'completed').reduce((a, b) => a + Math.abs(b.amount), 0);
  const totalWalletBalance = USERS.reduce((a, b) => a + b.walletBalance, 0);
  const pending = TRANSACTIONS.filter((t) => t.status === 'pending').length;

  return (
    <>
      <PageHeader title="Wallet & paiements" subtitle="Flux entrants/sortants, suivi des transactions Bankily/Masrvi/Sedad/cartes." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Solde total wallets" value={`${formatMRU(totalWalletBalance)} MRU`} />
        <StatCard label="Entrées (jour)" value={`${formatMRU(totalIn)} MRU`} tone="success" />
        <StatCard label="Sorties (jour)" value={`${formatMRU(totalOut)} MRU`} />
        <StatCard label="En attente" value={String(pending)} tone={pending > 0 ? 'warn' : 'success'} />
      </div>

      <Card>
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher utilisateur, référence…"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-200 text-sm"
          />
          {(['all', 'completed', 'pending', 'failed', 'refunded'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${filter === f ? 'bg-ink text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Référence</th>
              <th className="px-5 py-3 text-left">Utilisateur</th>
              <th className="px-5 py-3 text-left">Type</th>
              <th className="px-5 py-3 text-right">Montant</th>
              <th className="px-5 py-3 text-center">Statut</th>
              <th className="px-5 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((t) => (
              <tr key={t.id}>
                <td className="px-5 py-3 font-mono text-xs">{t.reference}</td>
                <td className="px-5 py-3">{t.user}</td>
                <td className="px-5 py-3 capitalize">{t.type.replace(/_/g, ' ')}</td>
                <td className={`px-5 py-3 text-right font-mono font-bold ${t.amount > 0 ? 'text-emerald-600' : 'text-ink'}`}>
                  {t.amount > 0 ? '+' : '−'}{formatMRU(t.amount)} MRU
                </td>
                <td className="px-5 py-3 text-center">
                  <Badge tone={t.status === 'completed' ? 'success' : t.status === 'failed' ? 'danger' : t.status === 'refunded' ? 'info' : 'warn'}>
                    {t.status}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-right text-xs text-slate-500">{formatRel(t.at)}</td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">Aucune transaction.</td></tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </>
  );
}
