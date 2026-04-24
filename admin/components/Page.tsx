export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">{title}</h1>
        {subtitle ? <p className="text-slate2 mt-1">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, delta, tone = 'default' }: { label: string; value: string; delta?: string; tone?: 'default' | 'success' | 'warn' | 'danger' }) {
  const toneClass = {
    default: 'text-ink',
    success: 'text-emerald-600',
    warn: 'text-amber',
    danger: 'text-rose-500',
  }[tone];
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
      <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">{label}</div>
      <div className={`text-2xl font-bold ${toneClass}`}>{value}</div>
      {delta ? <div className="text-xs text-slate-500 mt-1">{delta}</div> : null}
    </div>
  );
}

export function Card({ children, title, action }: { children: React.ReactNode; title?: string; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {title ? (
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-ink">{title}</h3>
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'success' | 'warn' | 'danger' | 'info' }) {
  const cls = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warn: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    info: 'bg-sky-100 text-sky-700',
  }[tone];
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{children}</span>;
}
