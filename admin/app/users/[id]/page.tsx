'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge, Card, PageHeader } from '@/components/Page';
import {
  apiGet,
  apiPatch,
  type ApiAdminUserDetail,
  type ApiListing,
  type ApiUserActivityRow,
  type ApiUserGivenView,
} from '@/lib/api';

const STATUS_LABEL: Record<string, string> = {
  pending: 'En modération',
  active: 'Publiée',
  rejected: 'Refusée',
  sold: 'Vendue',
  draft: 'Brouillon',
};

function statusTone(s: string): 'success' | 'warn' | 'danger' | 'neutral' {
  if (s === 'active') return 'success';
  if (s === 'pending') return 'warn';
  if (s === 'rejected') return 'danger';
  return 'neutral';
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
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

function formatMRU(n: number) {
  return n.toLocaleString('fr-FR');
}

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [data, setData] = useState<ApiAdminUserDetail | null>(null);
  const [activity, setActivity] = useState<ApiUserActivityRow[]>([]);
  const [viewsGiven, setViewsGiven] = useState<ApiUserGivenView[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedListing, setExpandedListing] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ photos: string[]; idx: number } | null>(null);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setErr(null);
      const [detail, acts, views] = await Promise.all([
        apiGet<ApiAdminUserDetail>(`/admin/users/${id}`),
        apiGet<ApiUserActivityRow[]>(`/admin/users/${id}/activity`).catch(() => []),
        apiGet<ApiUserGivenView[]>(`/admin/users/${id}/views-given`).catch(() => []),
      ]);
      setData(detail);
      setActivity(acts);
      setViewsGiven(views);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const changeStatus = async (listingId: string, next: string) => {
    setBusyId(listingId);
    try {
      await apiPatch<ApiListing>(`/admin/listings/${listingId}/status`, { status: next });
      await load();
    } catch (e) {
      alert(`Erreur: ${e instanceof Error ? e.message : 'status_update_failed'}`);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Profil utilisateur" />
        <Card>
          <div className="p-6 text-slate-500">Chargement…</div>
        </Card>
      </>
    );
  }

  if (err || !data) {
    return (
      <>
        <PageHeader title="Profil utilisateur" />
        <Card>
          <div className="p-6 text-rose-600">Erreur : {err ?? 'Utilisateur introuvable'}</div>
        </Card>
      </>
    );
  }

  const { user, listings, totalViews, totalContacts } = data;
  const activeCount = listings.filter((l) => l.status === 'active').length;
  const pendingCount = listings.filter((l) => l.status === 'pending').length;
  const rejectedCount = listings.filter((l) => l.status === 'rejected').length;
  const soldCount = listings.filter((l) => l.status === 'sold').length;
  const isSuspended = user.status === 'suspended';

  const toggleSuspension = async () => {
    if (isSuspended) {
      if (!confirm(`Réactiver le compte de ${user.name || user.phone} ?`)) return;
      try {
        await apiPatch(`/admin/users/${user.id}/status`, { status: 'active' });
        await load();
      } catch (e) {
        alert(`Erreur: ${e instanceof Error ? e.message : 'status_failed'}`);
      }
      return;
    }
    const reason = prompt(
      `Suspendre le compte de ${user.name || user.phone} ?\n\nMotif (visible par l'équipe, pas par l'user) :`,
    );
    if (reason === null) return;
    try {
      await apiPatch(`/admin/users/${user.id}/status`, {
        status: 'suspended',
        reason: reason || 'Non précisé',
      });
      await load();
    } catch (e) {
      alert(`Erreur: ${e instanceof Error ? e.message : 'status_failed'}`);
    }
  };

  return (
    <>
      <div className="mb-6">
        <Link
          href="/users"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          ← Tous les utilisateurs
        </Link>
      </div>

      {/* Suspended banner */}
      {isSuspended ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 flex items-center justify-between gap-4">
          <div>
            <div className="font-bold text-rose-800">🚫 Compte suspendu</div>
            <div className="text-xs text-rose-700 mt-0.5">
              Suspendu le {user.suspendedAt ? formatDate(user.suspendedAt) : '—'}
              {user.suspendReason ? ` — Motif : ${user.suspendReason}` : ''}. L&apos;utilisateur
              reçoit 403 sur toute requête authentifiée et sera déconnecté automatiquement.
            </div>
          </div>
          <button
            onClick={toggleSuspension}
            className="flex-shrink-0 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm"
          >
            ✓ Réactiver le compte
          </button>
        </div>
      ) : null}

      {/* Hero */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-[#1c2f5e] to-[#0A1E5B] p-8 text-white shadow-lg">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-amber/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-20 w-72 h-72 rounded-full bg-[#4DB8D6]/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber to-orange-500 text-white flex items-center justify-center text-4xl font-bold shadow-xl">
            {(user.name || user.phone || '?').slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold">{user.name || 'Sans nom'}</h1>
              {user.role !== 'user' ? (
                <span className="px-2 py-0.5 rounded-full bg-amber/20 text-amber-200 text-xs font-semibold">
                  {user.role}
                </span>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
              <span className="font-mono">{user.phone}</span>
              {user.email ? <span>✉ {user.email}</span> : null}
              {user.city ? <span>📍 {user.city}</span> : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <HeroBadge on={user.phoneVerified}>
                {user.phoneVerified ? 'Tél. vérifié' : 'Tél. non vérifié'}
              </HeroBadge>
              <HeroBadge on={user.emailVerified}>
                {user.emailVerified ? 'Email vérifié' : 'Email non vérifié'}
              </HeroBadge>
              <HeroBadge on={user.kycLevel >= 1}>KYC niveau {user.kycLevel}</HeroBadge>
              {user.hasPin ? <HeroBadge on>PIN configuré</HeroBadge> : null}
              {user.hasBiometric ? <HeroBadge on>Biométrie</HeroBadge> : null}
            </div>
          </div>
          <div className="min-w-[220px]">
            <div className="text-xs uppercase tracking-wider text-white/60 mb-1">Trust score</div>
            <div className="flex items-end gap-2">
              <div className="text-4xl font-bold tabular-nums">{user.trustScore}</div>
              <div className="text-sm text-white/60 mb-1">/ 100</div>
            </div>
            <div className="mt-2 h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  user.trustScore >= 70
                    ? 'bg-emerald-400'
                    : user.trustScore >= 40
                      ? 'bg-amber'
                      : 'bg-rose-400'
                }`}
                style={{ width: `${user.trustScore}%` }}
              />
            </div>
            <div className="mt-3 text-xs text-white/50">
              Inscrit le {formatDate(user.createdAt)}
            </div>
            <div className="text-xs text-white/40 font-mono mt-1 truncate">ID {user.id}</div>
            {!isSuspended ? (
              <button
                onClick={toggleSuspension}
                className="mt-4 w-full px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-100 font-semibold text-xs"
              >
                🚫 Suspendre ce compte
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <Kpi label="Annonces" value={listings.length} icon="📊" />
        <Kpi label="Publiées" value={activeCount} tone="success" icon="✓" />
        <Kpi label="En attente" value={pendingCount} tone="warn" icon="⏱" />
        <Kpi label="Refusées" value={rejectedCount} tone={rejectedCount > 0 ? 'danger' : 'neutral'} icon="✕" />
        <Kpi label="Vues" value={totalViews} icon="👁" />
        <Kpi
          label="Conv."
          value={totalViews > 0 ? `${((totalContacts / totalViews) * 100).toFixed(0)}%` : '—'}
          icon="💬"
          subtitle={`${totalContacts} contacts`}
        />
      </div>

      {/* Annonces */}
      <Card>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Annonces publiées</h3>
            <div className="text-xs text-slate-500 mt-0.5">
              {listings.length} au total
              {pendingCount > 0 ? ` · ${pendingCount} à modérer` : ''}
              {soldCount > 0 ? ` · ${soldCount} vendues` : ''}
            </div>
          </div>
        </div>
        {listings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="text-4xl mb-2">📭</div>
            Cet utilisateur n&apos;a publié aucune annonce.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {listings.map((l) => {
              const photos = l.photoUrls ?? [];
              const mainPhoto = photos[0];
              const isExpanded = expandedListing === l.id;
              return (
                <div key={l.id} className="p-5">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <button
                      onClick={() => mainPhoto && setLightbox({ photos, idx: 0 })}
                      className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden bg-slate-100 relative group"
                    >
                      {mainPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mainPhoto}
                          alt={`${l.brand} ${l.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl text-slate-300">
                          🚗
                        </div>
                      )}
                      {photos.length > 1 ? (
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold">
                          +{photos.length - 1}
                        </div>
                      ) : null}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-bold text-ink">
                            {l.brand} {l.model}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-2">
                            <span>{l.year}</span>
                            <span>·</span>
                            <span>{l.fuel}</span>
                            <span>·</span>
                            <span>{l.transmission}</span>
                            <span>·</span>
                            <span>{l.km.toLocaleString('fr-FR')} km</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            📍 {l.city}
                            {l.district ? ` · ${l.district}` : ''}
                            {l.importYear ? ` · Dédouanée ${l.importYear}` : ''}
                            {typeof l.ownersInCountry === 'number'
                              ? ` · ${l.ownersInCountry} main${l.ownersInCountry > 1 ? 's' : ''}`
                              : ''}
                          </div>
                        </div>
                        <Badge tone={statusTone(l.status)}>
                          {STATUS_LABEL[l.status] ?? l.status}
                        </Badge>
                      </div>

                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div>
                          <div className="text-2xl font-bold text-amber tabular-nums">
                            {formatMRU(l.priceMru)}{' '}
                            <span className="text-xs font-medium text-slate-500">MRU</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex gap-4">
                            <span>👁 {l.viewCount ?? 0}</span>
                            <span>💬 {l.contactCount ?? 0}</span>
                            <span>📸 {l.photos}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {l.status === 'pending' ? (
                            <>
                              <button
                                disabled={busyId === l.id}
                                onClick={() => changeStatus(l.id, 'active')}
                                className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 font-semibold"
                              >
                                ✓ Approuver
                              </button>
                              <button
                                disabled={busyId === l.id}
                                onClick={() => changeStatus(l.id, 'rejected')}
                                className="text-xs px-3 py-1.5 rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-50 font-semibold"
                              >
                                ✕ Refuser
                              </button>
                            </>
                          ) : l.status === 'active' ? (
                            <button
                              disabled={busyId === l.id}
                              onClick={() => changeStatus(l.id, 'pending')}
                              className="text-xs px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 font-semibold"
                            >
                              Dépublier
                            </button>
                          ) : l.status === 'rejected' ? (
                            <button
                              disabled={busyId === l.id}
                              onClick={() => changeStatus(l.id, 'pending')}
                              className="text-xs px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 font-semibold"
                            >
                              ↻ Remettre en modération
                            </button>
                          ) : null}
                          <button
                            onClick={() => setExpandedListing(isExpanded ? null : l.id)}
                            className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                          >
                            {isExpanded ? 'Réduire' : 'Détails'}
                          </button>
                          <Link
                            href={`/listings/${l.id}/viewers`}
                            className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                          >
                            Qui a vu →
                          </Link>
                        </div>
                      </div>

                      {/* Gallery expanded */}
                      {isExpanded && photos.length > 0 ? (
                        <div className="mt-4 grid grid-cols-4 md:grid-cols-6 gap-2">
                          {photos.map((url, i) => (
                            <button
                              key={i}
                              onClick={() => setLightbox({ photos, idx: i })}
                              className="aspect-square rounded-lg overflow-hidden bg-slate-100 group"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={`Photo ${i + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </button>
                          ))}
                        </div>
                      ) : null}

                      {isExpanded ? (
                        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <Detail label="Type vendeur" value={l.sellerType === 'pro' ? 'Pro' : 'Particulier'} />
                          <Detail label="Nom affiché" value={l.sellerName} />
                          <Detail label="Kargo Verified" value={l.kargoVerified ? 'Oui' : 'Non'} />
                          <Detail label="VIN vérifié" value={l.vinVerified ? 'Oui' : 'Non'} />
                          <Detail label="Publié le" value={formatDate(l.publishedAt)} />
                          <Detail label="Listing ID" value={l.id.slice(0, 8) + '…'} mono />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Activité + Vues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold">Journal d&apos;activité</h3>
            <div className="text-xs text-slate-500 mt-0.5">
              {activity.length} événement{activity.length > 1 ? 's' : ''} récent
              {activity.length > 1 ? 's' : ''}
            </div>
          </div>
          {activity.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Aucune activité enregistrée.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {activity.map((a) => (
                <li key={a.id} className="px-6 py-3 flex items-start gap-3">
                  <span
                    className={`mt-0.5 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${activityTypeColor(
                      a.type,
                    )}`}
                  >
                    {activityTypeLabel(a.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{a.summary ?? '—'}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {formatDate(a.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold">Annonces consultées</h3>
            <div className="text-xs text-slate-500 mt-0.5">
              {viewsGiven.length} vue{viewsGiven.length > 1 ? 's' : ''}
            </div>
          </div>
          {viewsGiven.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Cet utilisateur n&apos;a ouvert aucune fiche.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {viewsGiven.map((v, i) => (
                <li key={`${v.listingId}-${i}`} className="px-6 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{v.listingLabel}</div>
                    <div className="text-xs text-slate-500">
                      {v.year} · {v.city} · {formatDate(v.viewedAt)}
                    </div>
                  </div>
                  <div className="text-sm font-mono font-semibold text-amber">
                    {formatMRU(v.priceMru)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Lightbox */}
      {lightbox ? (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.photos[lightbox.idx]}
            alt=""
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {lightbox.photos.length > 1 ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox({
                    photos: lightbox.photos,
                    idx: (lightbox.idx - 1 + lightbox.photos.length) % lightbox.photos.length,
                  });
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox({
                    photos: lightbox.photos,
                    idx: (lightbox.idx + 1) % lightbox.photos.length,
                  });
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl"
              >
                ›
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-xs">
                {lightbox.idx + 1} / {lightbox.photos.length}
              </div>
            </>
          ) : null}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl"
          >
            ✕
          </button>
        </div>
      ) : null}
    </>
  );
}

function HeroBadge({ children, on }: { children: React.ReactNode; on: boolean }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
        on
          ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30'
          : 'bg-white/5 text-white/50 border-white/10'
      }`}
    >
      {on ? '✓ ' : ''}
      {children}
    </span>
  );
}

function Kpi({
  label,
  value,
  subtitle,
  tone = 'neutral',
  icon,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  tone?: 'success' | 'warn' | 'danger' | 'neutral';
  icon?: string;
}) {
  const border =
    tone === 'success'
      ? 'border-l-emerald-500'
      : tone === 'warn'
        ? 'border-l-amber'
        : tone === 'danger'
          ? 'border-l-rose-500'
          : 'border-l-slate-300';
  const valueColor =
    tone === 'success'
      ? 'text-emerald-700'
      : tone === 'warn'
        ? 'text-amber-700'
        : tone === 'danger'
          ? 'text-rose-700'
          : 'text-ink';
  return (
    <div className={`bg-white rounded-xl border border-slate-100 border-l-4 ${border} p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          {label}
        </div>
        {icon ? <span className="text-sm">{icon}</span> : null}
      </div>
      <div className={`text-2xl font-bold tabular-nums ${valueColor}`}>{value}</div>
      {subtitle ? <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div> : null}
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
        {label}
      </div>
      <div className={`text-sm mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}

function activityTypeLabel(type: string): string {
  const map: Record<string, string> = {
    LOGIN: 'Connexion',
    SIGNUP: 'Inscription',
    PUBLISH_LISTING: 'Publication',
    VIEW_LISTING: 'Vue',
    CONTACT_LISTING: 'Contact',
    SEND_MESSAGE: 'Message',
    BOOK_TRIP: 'Billet',
  };
  return map[type] ?? type;
}

function activityTypeColor(type: string): string {
  switch (type) {
    case 'PUBLISH_LISTING':
      return 'bg-emerald-100 text-emerald-700';
    case 'CONTACT_LISTING':
    case 'SEND_MESSAGE':
      return 'bg-blue-100 text-blue-700';
    case 'VIEW_LISTING':
      return 'bg-slate-100 text-slate-600';
    case 'LOGIN':
    case 'SIGNUP':
      return 'bg-amber-100 text-amber-700';
    case 'BOOK_TRIP':
      return 'bg-violet-100 text-violet-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}
