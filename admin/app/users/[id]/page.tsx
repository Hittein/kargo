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

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [data, setData] = useState<ApiAdminUserDetail | null>(null);
  const [activity, setActivity] = useState<ApiUserActivityRow[]>([]);
  const [viewsGiven, setViewsGiven] = useState<ApiUserGivenView[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  return (
    <>
      <PageHeader
        title={user.name || user.phone}
        subtitle={`Inscrit le ${formatDate(user.createdAt)}`}
        actions={
          <Link
            href="/users"
            className="px-3 py-1.5 rounded-md bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            ← Tous les utilisateurs
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profil détail */}
        <Card>
          <div className="p-5 flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-navy text-white flex items-center justify-center text-3xl font-bold">
              {(user.name || '?').slice(0, 1).toUpperCase()}
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{user.name || '—'}</div>
              <div className="text-xs text-slate-500 mt-1">{user.phone}</div>
              {user.email ? (
                <div className="text-xs text-slate-500">{user.email}</div>
              ) : null}
              {user.city ? (
                <div className="text-xs text-slate-500">📍 {user.city}</div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1 justify-center">
              <Badge tone={user.phoneVerified ? 'success' : 'neutral'}>
                {user.phoneVerified ? 'Tél. vérifié' : 'Tél. non vérifié'}
              </Badge>
              {user.emailVerified ? <Badge tone="success">Email OK</Badge> : null}
              <Badge
                tone={
                  user.kycLevel >= 2 ? 'success' : user.kycLevel === 1 ? 'warn' : 'neutral'
                }
              >
                KYC niveau {user.kycLevel}
              </Badge>
              {user.hasPin ? <Badge tone="neutral">PIN</Badge> : null}
              {user.hasBiometric ? <Badge tone="neutral">Biométrie</Badge> : null}
              {user.role !== 'user' ? <Badge tone="warn">{user.role}</Badge> : null}
            </div>
            <div className="w-full pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Trust score</span>
                <span className="tabular-nums font-semibold text-slate-700">
                  {user.trustScore}/100
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    user.trustScore >= 70
                      ? 'bg-emerald-500'
                      : user.trustScore >= 40
                        ? 'bg-amber'
                        : 'bg-rose-500'
                  }`}
                  style={{ width: `${user.trustScore}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Stats agrégées */}
        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile label="Annonces totales" value={listings.length} />
          <StatTile label="Publiées" value={activeCount} tone="success" />
          <StatTile label="En attente" value={pendingCount} tone="warn" />
          <StatTile label="Vues totales" value={totalViews} />
          <StatTile
            label="Contacts générés"
            value={totalContacts}
            subtitle="Tap WhatsApp / Contacter"
          />
          <StatTile
            label="Conversion"
            value={totalViews > 0 ? `${((totalContacts / totalViews) * 100).toFixed(1)}%` : '—'}
            subtitle="Contacts / Vues"
          />
          <StatTile label="Identifiant" value={user.id.slice(0, 8) + '…'} mono />
          <StatTile
            label="Rôle"
            value={user.role}
            tone={user.role === 'admin' ? 'warn' : 'neutral'}
          />
        </div>
      </div>

      {/* Liste des annonces du user */}
      <Card>
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="font-semibold">
            Annonces publiées ({listings.length})
            {pendingCount > 0 ? (
              <span className="ml-2 text-xs text-amber-700 font-normal">
                · {pendingCount} à modérer
              </span>
            ) : null}
          </h3>
        </div>
        {listings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Cet utilisateur n'a publié aucune annonce.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3 text-left">Véhicule</th>
                <th className="px-5 py-3 text-right">Prix</th>
                <th className="px-5 py-3 text-right">Km</th>
                <th className="px-5 py-3 text-left">Ville</th>
                <th className="px-5 py-3 text-center">Photos</th>
                <th className="px-5 py-3 text-right">Vues</th>
                <th className="px-5 py-3 text-right">Contacts</th>
                <th className="px-5 py-3 text-center">Statut</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings.map((l) => (
                <tr key={l.id} className={l.status === 'pending' ? 'bg-amber-50/40' : ''}>
                  <td className="px-5 py-3">
                    <div className="font-medium">
                      {l.brand} {l.model}
                    </div>
                    <div className="text-xs text-slate-500">
                      {l.year} · {l.fuel} · {l.transmission}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-mono">
                    {l.priceMru.toLocaleString('fr-FR')}
                  </td>
                  <td className="px-5 py-3 text-right">{l.km.toLocaleString('fr-FR')}</td>
                  <td className="px-5 py-3">{l.city}</td>
                  <td className="px-5 py-3 text-center">{l.photos}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{l.viewCount ?? 0}</td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {l.contactCount ?? 0}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Badge tone={statusTone(l.status)}>
                      {STATUS_LABEL[l.status] ?? l.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {l.status === 'pending' ? (
                        <>
                          <button
                            disabled={busyId === l.id}
                            onClick={() => changeStatus(l.id, 'active')}
                            className="text-xs px-2 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 font-semibold"
                          >
                            Publier
                          </button>
                          <button
                            disabled={busyId === l.id}
                            onClick={() => changeStatus(l.id, 'rejected')}
                            className="text-xs px-2 py-1 rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-50 font-semibold"
                          >
                            Refuser
                          </button>
                        </>
                      ) : l.status === 'active' ? (
                        <button
                          disabled={busyId === l.id}
                          onClick={() => changeStatus(l.id, 'pending')}
                          className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 font-semibold"
                        >
                          Dépublier
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Journal d'activité */}
      <Card>
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="font-semibold">
            Journal d'activité
            <span className="ml-2 text-xs text-slate-500 font-normal">
              · {activity.length} événement{activity.length > 1 ? 's' : ''} récent
              {activity.length > 1 ? 's' : ''}
            </span>
          </h3>
        </div>
        {activity.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Aucune activité enregistrée pour cet utilisateur (logs créés depuis le déploiement du journal).
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {activity.map((a) => (
              <li key={a.id} className="px-5 py-3 flex items-start gap-3">
                <span
                  className={`mt-0.5 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${activityTypeColor(a.type)}`}
                >
                  {activityTypeLabel(a.type)}
                </span>
                <div className="flex-1">
                  <div className="text-sm">{a.summary ?? '—'}</div>
                  {a.metadataJson ? (
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-xl">
                      {a.metadataJson}
                    </div>
                  ) : null}
                </div>
                <div className="text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(a.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Annonces consultées */}
      <Card>
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="font-semibold">
            Annonces consultées
            <span className="ml-2 text-xs text-slate-500 font-normal">
              · {viewsGiven.length} vue{viewsGiven.length > 1 ? 's' : ''}
            </span>
          </h3>
        </div>
        {viewsGiven.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Cet utilisateur n'a ouvert aucune fiche annonce.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-2 text-left">Annonce</th>
                <th className="px-5 py-2 text-left">Ville</th>
                <th className="px-5 py-2 text-right">Prix</th>
                <th className="px-5 py-2 text-left">Vue le</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {viewsGiven.map((v, i) => (
                <tr key={`${v.listingId}-${i}`}>
                  <td className="px-5 py-2">
                    <div className="font-medium">{v.listingLabel}</div>
                    <div className="text-xs text-slate-500">{v.year}</div>
                  </td>
                  <td className="px-5 py-2">{v.city}</td>
                  <td className="px-5 py-2 text-right font-mono">
                    {v.priceMru.toLocaleString('fr-FR')} MRU
                  </td>
                  <td className="px-5 py-2 text-xs text-slate-500">
                    {formatDate(v.viewedAt)}
                  </td>
                  <td className="px-5 py-2 text-right">
                    <Link
                      href={`/listings/${v.listingId}/viewers`}
                      className="text-xs text-amber hover:underline"
                    >
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
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

function StatTile({
  label,
  value,
  subtitle,
  tone,
  mono,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  tone?: 'success' | 'warn' | 'danger' | 'neutral';
  mono?: boolean;
}) {
  const toneColor =
    tone === 'success'
      ? 'text-emerald-700'
      : tone === 'warn'
        ? 'text-amber-700'
        : tone === 'danger'
          ? 'text-rose-700'
          : 'text-slate-800';
  return (
    <Card>
      <div className="p-4">
        <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
        <div
          className={`mt-1 text-2xl font-bold tabular-nums ${toneColor} ${
            mono ? 'font-mono text-base' : ''
          }`}
        >
          {value}
        </div>
        {subtitle ? (
          <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
        ) : null}
      </div>
    </Card>
  );
}
