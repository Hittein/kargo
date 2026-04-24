'use client';
import { Card, PageHeader, StatCard, Badge } from '@/components/Page';
import { dashboardStats, formatMRU, USERS, LISTINGS, DISPUTES, TRANSACTIONS, TRIPS, formatRel } from '@/lib/data';

export default function Dashboard() {
  const s = dashboardStats();

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de l'activité Kargo aujourd'hui." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Utilisateurs actifs" value={String(s.activeUsers)} delta={`${USERS.length} au total`} />
        <StatCard label="Annonces à modérer" value={String(s.pendingListings)} tone={s.pendingListings > 0 ? 'warn' : 'success'} />
        <StatCard label="Litiges ouverts" value={String(s.openDisputes)} tone={s.openDisputes > 0 ? 'danger' : 'success'} />
        <StatCard label="Trajets aujourd'hui" value={String(s.tripsToday)} delta={`${TRIPS.filter((t) => t.status === 'in_transit').length} en cours`} />
        <StatCard label="Recettes du jour" value={`${formatMRU(s.todayRevenue)} MRU`} tone="success" />
        <StatCard label="GMV cumulé" value={`${formatMRU(s.totalGMV)} MRU`} delta="Toutes transactions confondues" />
        <StatCard label="Annonces signalées" value={String(s.flaggedListings)} tone={s.flaggedListings > 0 ? 'danger' : 'success'} />
        <StatCard label="Trust moyen" value={`${Math.round(USERS.reduce((a, b) => a + b.trustScore, 0) / USERS.length)} / 100`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Derniers utilisateurs">
          <div className="divide-y divide-slate-100">
            {USERS.slice(0, 5).map((u) => (
              <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center text-sm font-bold">
                  {u.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.phone} · {u.city}</div>
                </div>
                <Badge tone={u.status === 'active' ? 'success' : u.status === 'suspended' ? 'danger' : 'warn'}>
                  {u.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Litiges récents">
          <div className="divide-y divide-slate-100">
            {DISPUTES.slice(0, 5).map((d) => (
              <div key={d.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-sm">{d.subject}</div>
                  <Badge tone={d.status === 'resolved' ? 'success' : d.status === 'mediation' ? 'warn' : 'danger'}>{d.status}</Badge>
                </div>
                <div className="text-xs text-slate-500">{d.user} · {formatRel(d.createdAt)}{d.amount ? ` · ${formatMRU(d.amount)} MRU` : ''}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Annonces à modérer">
          <div className="divide-y divide-slate-100">
            {LISTINGS.filter((l) => l.status === 'pending_review' || l.status === 'flagged').map((l) => (
              <div key={l.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-medium text-sm">{l.brand} {l.model} {l.year}</div>
                  <div className="text-xs text-slate-500">{l.sellerName} · {l.city} · {formatMRU(l.price)} MRU</div>
                </div>
                <Badge tone={l.status === 'flagged' ? 'danger' : 'warn'}>{l.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Transactions récentes">
          <div className="divide-y divide-slate-100">
            {TRANSACTIONS.slice(0, 6).map((t) => (
              <div key={t.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{t.user}</div>
                  <div className="text-xs text-slate-500">{t.type.replace(/_/g, ' ')} · {formatRel(t.at)}</div>
                </div>
                <div className={`font-bold text-sm ${t.amount > 0 ? 'text-emerald-600' : 'text-ink'}`}>
                  {t.amount > 0 ? '+' : '−'}{formatMRU(t.amount)}
                </div>
                <Badge tone={t.status === 'completed' ? 'success' : t.status === 'failed' ? 'danger' : 'warn'}>{t.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
