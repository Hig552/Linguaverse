export function formatNumber(n: number | null | undefined, locale = 'en-US'): string {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString(locale);
}

export function formatCompactNumber(n: number | null | undefined, locale = 'en-US'): string {
  if (n === null || n === undefined) return '—';
  if (Math.abs(n) < 1000) return n.toLocaleString(locale);
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function glottocodeUrl(id: string): string {
  return `https://glottolog.org/resource/languoid/id/${id}`;
}

export function isoUrl(iso: string): string {
  return `https://iso639-3.sil.org/code/${iso}`;
}

export function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}
