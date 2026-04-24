'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const signIn = useAdminAuth((s) => s.signIn);
  const [email, setEmail] = useState('admin@kargo.mr');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = signIn(email, password);
    if (!ok) {
      setError('Identifiants invalides. Mot de passe simulé : admin / kargo / demo.');
      return;
    }
    router.replace('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber flex items-center justify-center text-white font-bold">K</div>
          <div>
            <div className="text-xl font-bold text-ink">Kargo Admin</div>
            <div className="text-xs text-slate-500">Console d'administration</div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>
          {error ? <div className="text-sm text-rose-600 bg-rose-50 rounded-lg p-3">{error}</div> : null}
          <button
            type="submit"
            className="w-full bg-amber text-white font-semibold py-3 rounded-lg hover:opacity-90"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 text-center">
          Mode démo — mot de passe simulé : <code>admin</code>, <code>kargo</code> ou <code>demo</code>.
        </div>
      </div>
    </div>
  );
}
