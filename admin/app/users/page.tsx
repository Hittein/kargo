'use client';
import { useMemo, useState } from 'react';
import { Badge, Card, PageHeader } from '@/components/Page';
import { USERS, formatMRU } from '@/lib/data';
import type { AdminUser } from '@/lib/data';

type Filter = 'all' | 'active' | 'pending_review' | 'suspended';

export default function UsersPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState(USERS);

  const filtered = useMemo(() => {
    let list = users;
    if (filter !== 'all') list = list.filter((u) => u.status === filter);
    const q = query.toLowerCase().trim();
    if (q) list = list.filter((u) => u.name.toLowerCase().includes(q) || u.phone.includes(q) || u.city.toLowerCase().includes(q));
    return list;
  }, [users, filter, query]);

  const updateStatus = (id: string, status: AdminUser['status']) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, status } : u)));
  };

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        subtitle={`${USERS.length} comptes — KYC, Trust, suspensions`}
        actions={
          <button className="px-4 py-2 bg-amber text-white rounded-lg text-sm font-semibold">+ Nouvel utilisateur</button>
        }
      />

      <Card>
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, téléphone, ville…"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-200 text-sm"
          />
          {(['all', 'active', 'pending_review', 'suspended'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                filter === f ? 'bg-ink text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : f === 'pending_review' ? 'À vérifier' : 'Suspendus'}
            </button>
          ))}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Utilisateur</th>
              <th className="px-5 py-3 text-left">Ville</th>
              <th className="px-5 py-3 text-left">KYC</th>
              <th className="px-5 py-3 text-left">Trust</th>
              <th className="px-5 py-3 text-right">Wallet</th>
              <th className="px-5 py-3 text-center">Statut</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
                      {u.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">{u.city}</td>
                <td className="px-5 py-3">
                  <Badge tone={u.kycLevel >= 2 ? 'success' : u.kycLevel === 1 ? 'warn' : 'danger'}>
                    Niveau {u.kycLevel}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${u.trustScore >= 70 ? 'bg-emerald-500' : u.trustScore >= 40 ? 'bg-amber' : 'bg-rose-500'}`}
                        style={{ width: `${u.trustScore}%` }}
                      />
                    </div>
                    <span className="text-xs">{u.trustScore}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right font-mono">{formatMRU(u.walletBalance)} MRU</td>
                <td className="px-5 py-3 text-center">
                  <Badge tone={u.status === 'active' ? 'success' : u.status === 'suspended' ? 'danger' : 'warn'}>{u.status}</Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {u.status !== 'active' ? (
                      <button onClick={() => updateStatus(u.id, 'active')} className="text-xs text-emerald-600 hover:underline">
                        Activer
                      </button>
                    ) : null}
                    {u.status !== 'suspended' ? (
                      <button onClick={() => updateStatus(u.id, 'suspended')} className="text-xs text-rose-600 hover:underline">
                        Suspendre
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                  Aucun utilisateur correspondant.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </>
  );
}
