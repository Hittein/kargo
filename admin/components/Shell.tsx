'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAdminAuth } from '@/lib/auth';

const NAV: { href: string; label: string; icon: string }[] = [
  { href: '/', label: 'Tableau de bord', icon: '◐' },
  { href: '/users', label: 'Utilisateurs', icon: '◯' },
  { href: '/listings', label: 'Annonces marketplace', icon: '◇' },
  { href: '/rentals', label: 'Véhicules location', icon: '◆' },
  { href: '/transit', label: 'Trajets', icon: '◈' },
  { href: '/companies', label: 'Compagnies & agences', icon: '◉' },
  { href: '/wallets', label: 'Wallet & paiements', icon: '◊' },
  { href: '/disputes', label: 'Litiges', icon: '◍' },
  { href: '/inspections', label: 'Inspections', icon: '◎' },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthed, email, signOut, hydrate } = useAdminAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isAuthed && pathname !== '/login') router.replace('/login');
    if (isAuthed && pathname === '/login') router.replace('/');
  }, [isAuthed, pathname, router]);

  if (pathname === '/login') return <>{children}</>;
  if (!isAuthed) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-ink text-white p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-amber flex items-center justify-center font-bold">K</div>
          <div>
            <div className="font-bold leading-tight">Kargo</div>
            <div className="text-xs opacity-60">Admin Console</div>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? 'bg-amber text-white' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 pt-4 border-t border-white/10 text-xs">
          <div className="opacity-60 mb-2">{email}</div>
          <button
            onClick={() => {
              signOut();
              router.replace('/login');
            }}
            className="text-white/80 hover:text-white"
          >
            Se déconnecter
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-mist overflow-auto">
        <div className="p-8 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
