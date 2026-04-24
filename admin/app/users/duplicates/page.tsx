'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Card, PageHeader } from '@/components/Page';
import { apiGet, apiPost, type ApiAdminUser } from '@/lib/api';

type DuplicateUser = {
  user: ApiAdminUser;
  listingsCount: number;
};

type DuplicateGroup = {
  normalizedPhone: string;
  users: DuplicateUser[];
};

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

export default function DuplicatesPage() {
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      setGroups(await apiGet<DuplicateGroup[]>('/admin/users/duplicates'));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const merge = async (primary: ApiAdminUser, secondary: ApiAdminUser) => {
    const msg = `Fusionner « ${secondary.name || secondary.phone} » dans « ${
      primary.name || primary.phone
    } » ?\n\nToutes les annonces, conversations, tickets et soldes du 2e compte seront transférés au 1er. Le 2e compte sera supprimé. Opération irréversible.`;
    if (!confirm(msg)) return;
    setBusy(secondary.id);
    try {
      await apiPost('/admin/users/merge', {
        primaryId: primary.id,
        secondaryId: secondary.id,
      });
      await load();
    } catch (e) {
      alert(`Erreur: ${e instanceof Error ? e.message : 'merge_failed'}`);
    } finally {
      setBusy(null);
    }
  };

  const totalDupes = groups.reduce((n, g) => n + g.users.length - 1, 0);

  return (
    <>
      <PageHeader
        title="Comptes doublons"
        subtitle={
          groups.length === 0
            ? 'Aucun doublon détecté.'
            : `${groups.length} groupe${groups.length > 1 ? 's' : ''} — ${totalDupes} compte${
                totalDupes > 1 ? 's' : ''
              } à fusionner.`
        }
        actions={
          <Link
            href="/users"
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold"
          >
            ← Utilisateurs
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
          <div className="p-6 text-rose-600">Erreur API : {err}</div>
        </Card>
      ) : null}

      {!loading && groups.length === 0 && !err ? (
        <Card>
          <div className="p-8 text-center text-slate-500">
            Aucun doublon — tous les numéros normalisent vers une valeur unique.
          </div>
        </Card>
      ) : null}

      <div className="flex flex-col gap-4">
        {groups.map((g) => {
          const primary = g.users[0];
          const others = g.users.slice(1);
          return (
            <Card key={g.normalizedPhone}>
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold">Numéro normalisé : {g.normalizedPhone}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {g.users.length} comptes — classés par nb d'annonces puis ancienneté
                  </div>
                </div>
                <Badge tone="warn">{g.users.length} comptes</Badge>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-2 text-left">Rôle</th>
                    <th className="px-5 py-2 text-left">Nom</th>
                    <th className="px-5 py-2 text-left">Téléphone saisi</th>
                    <th className="px-5 py-2 text-center">KYC</th>
                    <th className="px-5 py-2 text-right">Annonces</th>
                    <th className="px-5 py-2 text-left">Inscrit</th>
                    <th className="px-5 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-emerald-50/40">
                    <td className="px-5 py-3">
                      <Badge tone="success">Primary</Badge>
                    </td>
                    <td className="px-5 py-3 font-medium">{primary.user.name || '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs">{primary.user.phone}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge tone={primary.user.kycLevel >= 1 ? 'success' : 'neutral'}>
                        N{primary.user.kycLevel}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold">
                      {primary.listingsCount}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {formatDate(primary.user.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-slate-400 italic">
                      Compte cible
                    </td>
                  </tr>
                  {others.map((u) => (
                    <tr key={u.user.id}>
                      <td className="px-5 py-3">
                        <Badge tone="warn">À fusionner</Badge>
                      </td>
                      <td className="px-5 py-3">{u.user.name || <span className="text-slate-400 italic">sans nom</span>}</td>
                      <td className="px-5 py-3 font-mono text-xs">{u.user.phone}</td>
                      <td className="px-5 py-3 text-center">
                        <Badge tone={u.user.kycLevel >= 1 ? 'success' : 'neutral'}>
                          N{u.user.kycLevel}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{u.listingsCount}</td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {formatDate(u.user.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          disabled={busy === u.user.id}
                          onClick={() => merge(primary.user, u.user)}
                          className="text-xs px-3 py-1.5 rounded-md bg-amber text-white hover:opacity-90 disabled:opacity-50 font-semibold"
                        >
                          {busy === u.user.id ? 'Fusion…' : `→ Fusionner dans primary`}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          );
        })}
      </div>
    </>
  );
}
