'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge, Card, PageHeader } from '@/components/Page';
import { apiGet, type ApiAdminUserRow } from '@/lib/api';

function initial(name: string) {
  return (name || '?').slice(0, 1).toUpperCase();
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function UsersPage() {
  const [rows, setRows] = useState<ApiAdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'with_listings' | 'pending_review'>('all');

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      setRows(await apiGet<ApiAdminUserRow[]>('/admin/users'));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = rows;
    if (filter === 'with_listings') list = list.filter((r) => r.listingsTotal > 0);
    if (filter === 'pending_review') list = list.filter((r) => r.listingsPending > 0);
    const q = query.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (r) =>
          r.user.name.toLowerCase().includes(q) ||
          r.user.phone.includes(q) ||
          (r.user.city ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [rows, filter, query]);

  const pendingReviewUsers = rows.filter((r) => r.listingsPending > 0).length;

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        subtitle={`${rows.length} compte${rows.length > 1 ? 's' : ''}${
          pendingReviewUsers > 0
            ? ` — ${pendingReviewUsers} avec annonce(s) à modérer`
            : ''
        }`}
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
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, téléphone, ville…"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-200 text-sm"
          />
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 text-xs">
            {(
              [
                { key: 'all', label: 'Tous' },
                { key: 'with_listings', label: 'Avec annonces' },
                {
                  key: 'pending_review',
                  label: `À modérer${pendingReviewUsers > 0 ? ` (${pendingReviewUsers})` : ''}`,
                },
              ] as { key: typeof filter; label: string }[]
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`px-3 py-1.5 rounded-md font-semibold transition ${
                  filter === t.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Utilisateur</th>
              <th className="px-5 py-3 text-left">Ville</th>
              <th className="px-5 py-3 text-center">KYC</th>
              <th className="px-5 py-3 text-center">Trust</th>
              <th className="px-5 py-3 text-right">Annonces</th>
              <th className="px-5 py-3 text-right">Vues</th>
              <th className="px-5 py-3 text-right">Contacts</th>
              <th className="px-5 py-3 text-left">Inscrit</th>
              <th className="px-5 py-3 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <tr
                key={r.user.id}
                className={r.listingsPending > 0 ? 'bg-amber-50/40' : undefined}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
                      {initial(r.user.name)}
                    </div>
                    <div>
                      <div className="font-medium">{r.user.name || '—'}</div>
                      <div className="text-xs text-slate-500">{r.user.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-700">{r.user.city ?? '—'}</td>
                <td className="px-5 py-3 text-center">
                  <Badge
                    tone={
                      r.user.kycLevel >= 2
                        ? 'success'
                        : r.user.kycLevel === 1
                          ? 'warn'
                          : 'neutral'
                    }
                  >
                    Niveau {r.user.kycLevel}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          r.user.trustScore >= 70
                            ? 'bg-emerald-500'
                            : r.user.trustScore >= 40
                              ? 'bg-amber'
                              : 'bg-rose-500'
                        }`}
                        style={{ width: `${r.user.trustScore}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums">{r.user.trustScore}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end items-center gap-2">
                    <span className="tabular-nums font-medium">{r.listingsTotal}</span>
                    {r.listingsPending > 0 ? (
                      <Badge tone="warn">{r.listingsPending} pending</Badge>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {r.totalViews.toLocaleString('fr-FR')}
                </td>
                <td className="px-5 py-3 text-right tabular-nums">{r.totalContacts}</td>
                <td className="px-5 py-3 text-xs text-slate-500">
                  {formatDate(r.user.createdAt)}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/users/${r.user.id}`}
                    className="text-xs font-semibold text-amber hover:underline"
                  >
                    Voir profil →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading ? (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-slate-500">
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
