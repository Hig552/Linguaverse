import Link from "next/link";
import { searchLanguoids, getAllScripts } from "@/lib/queries";
import { MACROAREAS, ENDANGERMENT_LABELS } from "@/lib/db";
import { formatCompactNumber, formatNumber } from "@/lib/format";
import { EndangermentBadge, LevelBadge, IsoBadge } from "@/components/LangBadges";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

type Search = Record<string, string | string[] | undefined>;
function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export const metadata = {
  title: "Languages",
  description: "Browse and filter all 27,000+ languoids in the Linguaverse catalog.",
};

export default async function LanguagesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = first(sp.q) ?? '';
  const level = (first(sp.level) as 'language' | 'family' | 'dialect' | undefined) ?? 'language';
  const macroarea = first(sp.macroarea);
  const aes = first(sp.endangerment);
  const minSp = first(sp.minSpeakers);
  const script = first(sp.script);
  const orderBy = (first(sp.orderBy) as 'name' | 'speakers' | 'endangerment' | undefined) ?? 'name';
  const order = (first(sp.order) as 'asc' | 'desc' | undefined) ?? (orderBy === 'speakers' ? 'desc' : 'asc');
  const page = Math.max(1, Number(first(sp.page) ?? '1'));
  const pageSize = 50;

  const result = searchLanguoids({
    q, level, macroarea,
    endangerment: aes ? Number(aes) : undefined,
    minSpeakers: minSp ? Number(minSp) : undefined,
    script,
    orderBy, order,
    limit: pageSize, offset: (page - 1) * pageSize,
  });

  const allScripts = getAllScripts().slice(0, 30);

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries({ q, level, macroarea, endangerment: aes, minSpeakers: minSp, script, orderBy, order })) {
    if (v !== undefined && v !== '' && v !== null) qs.set(k, String(v));
  }
  const exportQs = new URLSearchParams(qs);
  exportQs.set('format', 'csv');

  const totalPages = Math.ceil(result.total / pageSize);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Languages</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {formatNumber(result.total)} {level}{result.total !== 1 ? 's' : ''} matching your filters.
          </p>
        </div>
        <a href={`/api/languages?${exportQs.toString()}`} className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </a>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <label className="text-sm">
          <div className="text-zinc-500 mb-1">Search</div>
          <input name="q" defaultValue={q} placeholder="name, alt name, or ISO 639-3…"
            className="w-full px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800" />
        </label>
        <label className="text-sm">
          <div className="text-zinc-500 mb-1">Type</div>
          <select name="level" defaultValue={level} className="w-full px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
            <option value="language">Language</option>
            <option value="family">Family</option>
            <option value="dialect">Dialect</option>
          </select>
        </label>
        <label className="text-sm">
          <div className="text-zinc-500 mb-1">Region</div>
          <select name="macroarea" defaultValue={macroarea ?? ''} className="w-full px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
            <option value="">Any</option>
            {MACROAREAS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <div className="text-zinc-500 mb-1">Endangerment</div>
          <select name="endangerment" defaultValue={aes ?? ''} className="w-full px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
            <option value="">Any</option>
            {Object.entries(ENDANGERMENT_LABELS).map(([v, info]) => (
              <option key={v} value={v}>{info.label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <div className="text-zinc-500 mb-1">Min speakers</div>
          <input name="minSpeakers" type="number" defaultValue={minSp ?? ''} placeholder="e.g. 100000"
            className="w-full px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800" />
        </label>
        <label className="text-sm">
          <div className="text-zinc-500 mb-1">Writing system</div>
          <input name="script" defaultValue={script ?? ''} placeholder="Latin, Arabic, Cyrillic…"
            list="scripts-list"
            className="w-full px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800" />
          <datalist id="scripts-list">
            {allScripts.map((s) => <option key={s.script} value={s.script} />)}
          </datalist>
        </label>
        <label className="text-sm">
          <div className="text-zinc-500 mb-1">Sort by</div>
          <select name="orderBy" defaultValue={orderBy} className="w-full px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
            <option value="name">Name</option>
            <option value="speakers">Speakers</option>
            <option value="endangerment">Endangerment</option>
          </select>
        </label>
        <div className="text-sm flex items-end gap-2">
          <button className="px-4 py-1.5 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium w-full">Apply filters</button>
        </div>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Region</th>
              <th className="px-4 py-2 font-medium">Family</th>
              <th className="px-4 py-2 font-medium text-right">Speakers</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Script</th>
              <th className="px-4 py-2 font-medium">Code</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((l) => (
              <tr key={l.id} className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                <td className="px-4 py-2">
                  <Link href={`/languages/${l.id}`} className="font-medium hover:underline">{l.name}</Link>
                  <div className="flex items-center gap-1 mt-0.5">
                    <LevelBadge level={l.level} />
                    {l.category && <span className="text-[10px] text-zinc-500">{l.category}</span>}
                  </div>
                </td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{l.macroarea ?? '—'}</td>
                <td className="px-4 py-2">
                  {l.family_id ? (
                    <Link href={`/families/${l.family_id}`} className="text-sky-600 hover:underline">{l.family_id}</Link>
                  ) : l.is_isolate ? <span className="text-zinc-500 italic">isolate</span> : '—'}
                </td>
                <td className="px-4 py-2 text-right font-mono">{formatCompactNumber(l.speaker_count)}</td>
                <td className="px-4 py-2"><EndangermentBadge aes={l.aes} label={l.aes_label} /></td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400 max-w-[160px] truncate">{l.script ?? '—'}</td>
                <td className="px-4 py-2 font-mono text-xs"><IsoBadge iso={l.iso639_3} /><div className="text-zinc-500 text-[10px] mt-1">{l.id}</div></td>
              </tr>
            ))}
            {!result.items.length && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-500">No results — try relaxing your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <div className="text-zinc-500">
            Page {page} of {totalPages} ({formatNumber(result.total)} total)
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/languages?${new URLSearchParams({ ...Object.fromEntries(qs), page: String(page - 1) }).toString()}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <ChevronLeft className="w-4 h-4" /> Previous
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/languages?${new URLSearchParams({ ...Object.fromEntries(qs), page: String(page + 1) }).toString()}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                Next <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
