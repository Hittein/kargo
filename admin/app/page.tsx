'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  apiGet,
  type ApiAdminUserRow,
  type ApiListing,
  type ApiRentalListing,
  type ApiTrip,
} from '@/lib/api';

function formatMRU(n: number) {
  return n.toLocaleString('fr-FR');
}

function formatRel(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'à l\'instant';
    if (mins < 60) return `il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `il y a ${days}j`;
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } catch {
    return iso;
  }
}

export default function Dashboard() {
  const [users, setUsers] = useState<ApiAdminUserRow[]>([]);
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [rentals, setRentals] = useState<ApiRentalListing[]>([]);
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [u, l, r, t] = await Promise.all([
          apiGet<ApiAdminUserRow[]>('/admin/users').catch(() => []),
          apiGet<ApiListing[]>('/admin/listings').catch(() => []),
          apiGet<ApiRentalListing[]>('/admin/rental-listings').catch(() => []),
          apiGet<ApiTrip[]>('/trips').catch(() => []),
        ]);
        setUsers(u);
        setListings(l);
        setRentals(r);
        setTrips(t);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pendingListings = listings.filter((l) => l.status === 'pending');
  const activeListings = listings.filter((l) => l.status === 'active');
  const pendingRentals = rentals.filter((r) => r.status === 'pending');
  const totalVehicleGMV = activeListings.reduce((s, l) => s + l.priceMru, 0);
  const totalViews = listings.reduce((s, l) => s + (l.viewCount ?? 0), 0);
  const totalContacts = listings.reduce((s, l) => s + (l.contactCount ?? 0), 0);
  const tripsActive = trips.filter((t) => t.status === 'scheduled' || t.status === 'boarding' || t.status === 'in_transit');
  const usersWithListings = users.filter((u) => u.listingsTotal > 0).length;
  const avgTrust = users.length
    ? Math.round(users.reduce((s, r) => s + r.user.trustScore, 0) / users.length)
    : 0;

  const recentListings = [...listings]
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
    .slice(0, 8);
  const recentUsers = [...users]
    .sort((a, b) => (b.user.createdAt || '').localeCompare(a.user.createdAt || ''))
    .slice(0, 8);

  return (
    <>
      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-[#1c2f5e] to-[#0A1E5B] p-8 text-white shadow-lg">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-[#4DB8D6]/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/60 font-semibold mb-2">
              Vue d&apos;ensemble
            </div>
            <h1 className="text-4xl font-bold">Tableau de bord</h1>
            <div className="mt-2 text-white/70 text-sm">
              {loading ? 'Chargement des données en direct…' : 'Données temps réel du backend Kargo.'}
            </div>
          </div>
          {pendingListings.length + pendingRentals.length > 0 ? (
            <Link
              href="/listings"
              className="px-4 py-2.5 rounded-xl bg-amber text-white font-semibold text-sm hover:bg-amber/90 shadow-lg flex items-center gap-2"
            >
              <span>⚠</span>
              {pendingListings.length + pendingRentals.length} annonce
              {pendingListings.length + pendingRentals.length > 1 ? 's' : ''} à modérer
            </Link>
          ) : (
            <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 font-semibold text-sm">
              ✓ Aucune annonce en attente
            </div>
          )}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Metric
          label="Utilisateurs"
          value={users.length}
          subtitle={`${usersWithListings} avec annonces`}
          icon="👥"
          tone="primary"
          href="/users"
        />
        <Metric
          label="Annonces publiées"
          value={activeListings.length}
          subtitle={`${pendingListings.length} en attente`}
          icon="🚗"
          tone="success"
          href="/listings"
        />
        <Metric
          label="Véhicules location"
          value={rentals.filter((r) => r.status === 'active').length}
          subtitle={`${pendingRentals.length} en attente`}
          icon="🔑"
          href="/rentals"
        />
        <Metric
          label="Trajets actifs"
          value={tripsActive.length}
          subtitle={`${trips.length} au total`}
          icon="🚌"
          href="/transit"
        />
        <Metric
          label="GMV véhicules actifs"
          value={`${formatMRU(totalVehicleGMV)}`}
          subtitle="MRU en ligne"
          icon="💰"
        />
        <Metric
          label="Vues cumulées"
          value={totalViews}
          subtitle={`${totalContacts} contacts`}
          icon="👁"
        />
        <Metric
          label="Trust moyen"
          value={`${avgTrust}/100`}
          subtitle="Score utilisateurs"
          icon="🛡"
          tone={avgTrust >= 60 ? 'success' : avgTrust >= 40 ? 'warn' : 'danger'}
        />
        <Metric
          label="Conversion"
          value={totalViews > 0 ? `${((totalContacts / totalViews) * 100).toFixed(1)}%` : '—'}
          subtitle="Contacts / vues"
          icon="📈"
        />
      </div>

      {/* Queue moderation + derniers users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Queue de modération</h3>
              <div className="text-xs text-slate-500 mt-0.5">
                Annonces à approuver ou refuser
              </div>
            </div>
            {pendingListings.length > 0 ? (
              <span className="px-2.5 py-1 rounded-full bg-amber/15 text-amber-700 text-xs font-bold">
                {pendingListings.length}
              </span>
            ) : null}
          </div>
          {pendingListings.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">
              <div className="text-3xl mb-2">✓</div>
              Rien à modérer — tout est à jour.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {pendingListings.slice(0, 6).map((l) => (
                <Link
                  key={l.id}
                  href={`/listings`}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-amber-50 transition-colors"
                >
                  <div className="w-14 h-14 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                    {l.photoUrls?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.photoUrls[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl text-slate-300">
                        🚗
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {l.brand} {l.model} {l.year}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {l.sellerName} · {l.city} · {formatRel(l.publishedAt)}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-amber tabular-nums">
                    {formatMRU(l.priceMru)}
                  </div>
                </Link>
              ))}
              {pendingListings.length > 6 ? (
                <Link
                  href="/listings"
                  className="block px-6 py-3 text-center text-xs font-semibold text-amber hover:bg-amber-50"
                >
                  Voir les {pendingListings.length - 6} autres →
                </Link>
              ) : null}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Nouveaux utilisateurs</h3>
              <div className="text-xs text-slate-500 mt-0.5">
                Derniers inscrits
              </div>
            </div>
            <Link
              href="/users"
              className="text-xs font-semibold text-amber hover:underline"
            >
              Tous →
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">
              Aucun utilisateur.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {recentUsers.map((r) => (
                <Link
                  key={r.user.id}
                  href={`/users/${r.user.id}`}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-amber-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber to-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {(r.user.name || r.user.phone || '?').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {r.user.name || <span className="text-slate-400">Sans nom</span>}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{r.user.phone}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold tabular-nums">
                      {r.listingsTotal}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      annonces
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activité récente annonces */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Dernières annonces publiées</h3>
            <div className="text-xs text-slate-500 mt-0.5">
              Tous statuts confondus
            </div>
          </div>
          <Link
            href="/listings"
            className="text-xs font-semibold text-amber hover:underline"
          >
            Tout voir →
          </Link>
        </div>
        {recentListings.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            Aucune annonce.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-0 divide-x divide-y divide-slate-100">
            {recentListings.map((l) => (
              <div key={l.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="aspect-video rounded-lg bg-slate-100 overflow-hidden mb-3">
                  {l.photoUrls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.photoUrls[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-slate-300">
                      🚗
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-bold text-sm truncate">
                    {l.brand} {l.model}
                  </div>
                  <StatusPill status={l.status} />
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  {l.year} · {l.city} · {formatRel(l.publishedAt)}
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-lg font-bold text-amber tabular-nums">
                    {formatMRU(l.priceMru)}
                  </div>
                  <div className="text-[11px] text-slate-400 flex gap-2">
                    <span>👁 {l.viewCount ?? 0}</span>
                    <span>💬 {l.contactCount ?? 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Metric({
  label,
  value,
  subtitle,
  icon,
  tone = 'neutral',
  href,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  tone?: 'primary' | 'success' | 'warn' | 'danger' | 'neutral';
  href?: string;
}) {
  const accent =
    tone === 'primary'
      ? 'from-amber/20 to-amber/5'
      : tone === 'success'
        ? 'from-emerald-500/15 to-emerald-500/0'
        : tone === 'warn'
          ? 'from-amber/15 to-amber/0'
          : tone === 'danger'
            ? 'from-rose-500/15 to-rose-500/0'
            : 'from-slate-500/10 to-slate-500/0';
  const inner = (
    <div
      className={`relative h-full bg-white rounded-2xl border border-slate-100 p-5 shadow-sm overflow-hidden ${
        href ? 'hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer' : ''
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-60 pointer-events-none`}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            {label}
          </div>
          {icon ? <span className="text-xl">{icon}</span> : null}
        </div>
        <div className="text-3xl font-bold tabular-nums text-ink">{value}</div>
        {subtitle ? <div className="text-xs text-slate-500 mt-1">{subtitle}</div> : null}
      </div>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: 'Publiée', cls: 'bg-emerald-100 text-emerald-700' },
    pending: { label: 'Attente', cls: 'bg-amber-100 text-amber-700' },
    rejected: { label: 'Refusée', cls: 'bg-rose-100 text-rose-700' },
    sold: { label: 'Vendue', cls: 'bg-slate-100 text-slate-700' },
    draft: { label: 'Brouillon', cls: 'bg-slate-100 text-slate-600' },
  };
  const s = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${s.cls}`}>
      {s.label}
    </span>
  );
}
