export function formatMRU(amount: number, opts?: { compact?: boolean }): string {
  if (opts?.compact && amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `${m.toFixed(m >= 10 ? 0 : 1).replace('.0', '')} M`;
  }
  if (opts?.compact && amount >= 1_000) {
    const k = amount / 1_000;
    return `${k.toFixed(k >= 100 ? 0 : 0)} K`;
  }
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount);
}

export function formatKm(km: number): string {
  if (km >= 1000) return `${Math.round(km / 1000)}K km`;
  return `${km} km`;
}

export function formatRelativeDate(isoDate: string, locale: 'fr' | 'ar' = 'fr'): string {
  const d = new Date(isoDate);
  const diff = Date.now() - d.getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(hours / 24);
  if (locale === 'ar') {
    if (hours < 1) return 'الآن';
    if (hours < 24) return `منذ ${hours} س`;
    if (days < 7) return `منذ ${days} ي`;
    return d.toLocaleDateString('ar');
  }
  if (hours < 1) return "à l'instant";
  if (hours < 24) return `il y a ${hours} h`;
  if (days < 7) return `il y a ${days} j`;
  return d.toLocaleDateString('fr-FR');
}
