'use client';
import { useState } from 'react';
import { Badge, Card, PageHeader } from '@/components/Page';
import { DISPUTES, formatMRU, formatRel } from '@/lib/data';
import type { AdminDispute } from '@/lib/data';

export default function DisputesPage() {
  const [items, setItems] = useState<AdminDispute[]>(DISPUTES);
  const [tab, setTab] = useState<'all' | 'open' | 'mediation' | 'resolved' | 'rejected'>('all');
  const [reply, setReply] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);

  const filtered = tab === 'all' ? items : items.filter((d) => d.status === tab);
  const selected = items.find((d) => d.id === selectedId);

  const send = () => {
    if (!selected || !reply.trim()) return;
    setItems(
      items.map((d) =>
        d.id === selected.id
          ? { ...d, updates: [...d.updates, { at: new Date().toISOString(), from: 'kargo' as const, text: reply.trim() }] }
          : d,
      ),
    );
    setReply('');
  };

  const resolve = (status: 'resolved' | 'rejected') => {
    if (!selected) return;
    setItems(
      items.map((d) =>
        d.id === selected.id
          ? {
              ...d,
              status,
              updates: [...d.updates, { at: new Date().toISOString(), from: 'kargo' as const, text: status === 'resolved' ? 'Litige résolu.' : 'Litige rejeté.' }],
            }
          : d,
      ),
    );
  };

  return (
    <>
      <PageHeader title="Litiges & médiation" subtitle="Suivi des conflits utilisateur ↔ partenaire avec messagerie intégrée." />

      <div className="flex gap-2 mb-4">
        {(['all', 'open', 'mediation', 'resolved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setTab(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${tab === f ? 'bg-ink text-white' : 'bg-white text-ink border border-slate-200'}`}
          >
            {f === 'all' ? 'Tous' : f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {filtered.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedId(d.id)}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                selectedId === d.id ? 'bg-white border-amber shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-sm">{d.subject}</div>
                <Badge tone={d.status === 'resolved' ? 'success' : d.status === 'rejected' ? 'danger' : d.status === 'mediation' ? 'warn' : 'info'}>
                  {d.status}
                </Badge>
              </div>
              <div className="text-xs text-slate-500">{d.user} · {formatRel(d.createdAt)}</div>
              {d.amount > 0 ? <div className="text-xs text-slate-700 mt-1">{formatMRU(d.amount)} MRU en jeu</div> : null}
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <Card>
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selected.subject}</h2>
                    <div className="text-sm text-slate-500 mt-1">
                      {selected.user} · ouvert {formatRel(selected.createdAt)}
                      {selected.amount > 0 ? ` · ${formatMRU(selected.amount)} MRU` : ''}
                    </div>
                  </div>
                  <Badge tone={selected.status === 'resolved' ? 'success' : selected.status === 'rejected' ? 'danger' : 'warn'}>
                    {selected.status}
                  </Badge>
                </div>
              </div>

              <div className="p-5 space-y-3 max-h-[400px] overflow-y-auto">
                {selected.updates.map((u, i) => (
                  <div key={i} className={`flex gap-3 ${u.from === 'kargo' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      u.from === 'kargo' ? 'bg-amber text-white' : u.from === 'user' ? 'bg-navy text-white' : 'bg-slate-300 text-white'
                    }`}>
                      {u.from === 'kargo' ? 'K' : u.from === 'user' ? 'U' : 'P'}
                    </div>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${u.from === 'kargo' ? 'bg-amber/10' : 'bg-slate-100'}`}>
                      <div className="text-xs text-slate-500 mb-1">
                        {u.from === 'kargo' ? 'Médiateur Kargo' : u.from === 'user' ? selected.user : 'Partenaire'} · {formatRel(u.at)}
                      </div>
                      <div className="text-sm">{u.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              {selected.status !== 'resolved' && selected.status !== 'rejected' ? (
                <div className="px-5 py-4 border-t border-slate-100 space-y-3">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Répondre au litige…"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                  <div className="flex gap-2">
                    <button onClick={send} disabled={!reply.trim()} className="px-4 py-2 bg-amber text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                      Envoyer
                    </button>
                    <button onClick={() => resolve('resolved')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold">
                      Marquer résolu
                    </button>
                    <button onClick={() => resolve('rejected')} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold">
                      Rejeter
                    </button>
                  </div>
                </div>
              ) : null}
            </Card>
          ) : (
            <Card>
              <div className="p-8 text-center text-slate-500">Sélectionnez un litige pour voir le détail.</div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
