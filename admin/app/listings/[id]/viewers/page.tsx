'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, PageHeader } from '@/components/Page';
import {
  apiGet,
  type ApiListing,
  type ApiListingViewers,
} from '@/lib/api';

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

export default function ListingViewersPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [viewers, setViewers] = useState<ApiListingViewers | null>(null);
  const [listing, setListing] = useState<ApiListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setErr(null);
      const [v, l] = await Promise.all([
        apiGet<ApiListingViewers>(`/admin/listings/${id}/viewers`),
        apiGet<ApiListing>(`/listings/${id}`).catch(() => null),
      ]);
      setViewers(v);
      setListing(l);
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

  return (
    <>
      <PageHeader
        title={listing ? `Qui a vu cette annonce — ${listing.brand} ${listing.model}` : 'Viewers de l\'annonce'}
        subtitle={listing ? `${listing.year} · ${listing.city} · ${listing.priceMru.toLocaleString('fr-FR')} MRU` : ''}
        actions={
          <Link
            href="/listings"
            className="px-3 py-1.5 rounded-md bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            ← Toutes les annonces
          </Link>
        }
      />

      {loading ? (
        <Card>
          <div className="p-6 text-slate-500">Chargement…</div>
        </Card>
      ) : null}
      {err ? (
        <Card>
          <div className="p-6 text-rose-600">Erreur : {err}</div>
        </Card>
      ) : null}

      {viewers ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card>
              <div className="p-4">
                <div className="text-xs uppercase tracking-wider text-slate-500">Vues totales</div>
                <div className="mt-1 text-3xl font-bold tabular-nums">{viewers.totalViewCount}</div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="text-xs uppercase tracking-wider text-slate-500">
                  Utilisateurs identifiés
                </div>
                <div className="mt-1 text-3xl font-bold tabular-nums text-emerald-700">
                  {viewers.distinctAuthenticatedViewers}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">distincts, connectés</div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="text-xs uppercase tracking-wider text-slate-500">Vues anonymes</div>
                <div className="mt-1 text-3xl font-bold tabular-nums text-slate-500">
                  {viewers.anonymousViewCount}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">visiteurs non connectés</div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="px-5 py-3 border-b border-slate-100">
              <h3 className="font-semibold">
                Liste des utilisateurs connectés ayant consulté cette annonce
              </h3>
            </div>
            {viewers.viewers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Aucun utilisateur authentifié n'a encore consulté cette annonce.
                {viewers.anonymousViewCount > 0
                  ? ` (${viewers.anonymousViewCount} vue${viewers.anonymousViewCount > 1 ? 's' : ''} anonyme${viewers.anonymousViewCount > 1 ? 's' : ''})`
                  : ''}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Utilisateur</th>
                    <th className="px-5 py-3 text-left">Ville</th>
                    <th className="px-5 py-3 text-center">KYC</th>
                    <th className="px-5 py-3 text-right">Nb vues</th>
                    <th className="px-5 py-3 text-left">Dernière vue</th>
                    <th className="px-5 py-3 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewers.viewers.map((v) => (
                    <tr key={v.user.id}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
                            {(v.user.name || '?').slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{v.user.name || '—'}</div>
                            <div className="text-xs text-slate-500">{v.user.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">{v.user.city ?? '—'}</td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            v.user.kycLevel >= 2
                              ? 'bg-emerald-100 text-emerald-700'
                              : v.user.kycLevel === 1
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          KYC {v.user.kycLevel}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-semibold">
                        {v.viewCount}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {formatDate(v.lastViewedAt)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/users/${v.user.id}`}
                          className="text-xs font-semibold text-amber hover:underline"
                        >
                          Profil →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      ) : null}
    </>
  );
}
