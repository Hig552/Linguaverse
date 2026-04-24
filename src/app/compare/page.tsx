import Link from "next/link";
import { getLanguoid, getAncestors, getCountries, searchLanguoids } from "@/lib/queries";
import { formatNumber } from "@/lib/format";
import { ENDANGERMENT_LABELS, MED_LABELS, type Languoid } from "@/lib/db";
import { X, Plus } from "lucide-react";

type Search = Record<string, string | string[] | undefined>;
function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export const metadata = {
  title: "Compare languages",
  description: "Side-by-side comparison of 2 or more languages.",
};

export default async function ComparePage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const idsRaw = first(sp.ids) ?? '';
  const ids = idsRaw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 5);
  const langs = ids.map((id) => getLanguoid(id)).filter((l): l is Languoid => !!l);

  // Suggested seeds if the user hasn't picked yet
  const suggestions = langs.length === 0 ? searchLanguoids({ orderBy: 'speakers', order: 'desc', level: 'language', limit: 10 }).items : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Compare languages</h1>
      <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
        Put up to five languages side-by-side. Add by ISO 639-3 code or Glottocode.
      </p>

      <AddLanguageForm currentIds={ids} />

      {langs.length === 0 ? (
        <section className="mt-10">
          <div className="text-sm text-zinc-500 mb-3">Popular starting points:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((l) => (
              <Link key={l.id} href={`/compare?ids=${l.id}`} className="text-sm px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 hover:border-sky-400">{l.name}</Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-zinc-50 dark:bg-zinc-900 text-left px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 w-48">Attribute</th>
                {langs.map((l) => (
                  <th key={l.id} className="text-left align-top px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 min-w-[220px]">
                    <Link href={`/languages/${l.id}`} className="text-lg font-bold hover:underline">{l.name}</Link>
                    <div className="flex items-center gap-2 mt-1">
                      {l.iso639_3 && <span className="text-[10px] font-mono uppercase text-zinc-500">{l.iso639_3}</span>}
                      <span className="text-[10px] font-mono uppercase text-zinc-400">{l.id}</span>
                      <Link href={`/compare?ids=${ids.filter((x) => x !== l.id).join(',')}`} className="ml-auto text-zinc-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="Speaker count (L1+L2)" langs={langs} render={(l) => l.speaker_count ? formatNumber(l.speaker_count) : '—'} />
              <Row label="Region" langs={langs} render={(l) => l.macroarea ?? '—'} />
              <Row label="Countries" langs={langs} render={(l) => getCountries(l.id).map((c) => c.name).join(', ') || '—'} />
              <Row label="Type" langs={langs} render={(l) => l.category ?? l.level} />
              <Row label="Writing system" langs={langs} render={(l) => l.script ?? '—'} />
              <Row label="Endangerment" langs={langs} render={(l) => l.aes ? ENDANGERMENT_LABELS[l.aes]?.label : '—'} />
              <Row label="Documentation" langs={langs} render={(l) => l.med !== null && l.med !== undefined ? MED_LABELS[l.med]?.label : '—'} />
              <Row label="Is isolate?" langs={langs} render={(l) => l.is_isolate ? 'Yes' : 'No'} />
              <Row label="Family" langs={langs} render={(l) => {
                if (!l.family_id) return l.is_isolate ? 'isolate' : '—';
                const anc = getAncestors(l.id);
                const top = anc[0];
                return top ? <Link href={`/families/${top.id}`} className="text-sky-600 hover:underline">{top.name}</Link> : l.family_id;
              }} />
              <Row label="Coordinates" langs={langs} render={(l) => l.latitude !== null && l.longitude !== null ? `${l.latitude.toFixed(2)}°, ${l.longitude.toFixed(2)}°` : '—'} />
              <Row label="First documented" langs={langs} render={(l) => l.first_year_doc ? String(l.first_year_doc) : '—'} />
              <Row label="Classification depth" langs={langs} render={(l) => String(l.depth ?? 0)} />
              <Row label="Wikipedia" langs={langs} render={(l) => l.wikipedia_url ? <a href={l.wikipedia_url} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">{new URL(l.wikipedia_url).pathname.replace('/wiki/', '')}</a> : '—'} />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, langs, render }: { label: string; langs: Languoid[]; render: (l: Languoid) => React.ReactNode | string }) {
  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800">
      <td className="sticky left-0 bg-white dark:bg-zinc-900 px-4 py-2 font-medium text-zinc-600 dark:text-zinc-400">{label}</td>
      {langs.map((l) => <td key={l.id} className="px-4 py-2">{render(l)}</td>)}
    </tr>
  );
}

function AddLanguageForm({ currentIds }: { currentIds: string[] }) {
  return (
    <form className="mt-4 flex gap-2" action="/compare">
      <input type="hidden" name="ids" value={currentIds.join(',')} />
      <input name="add" placeholder="Add by Glottocode (e.g., stan1288) or ISO 639-3 (e.g., spa)…"
        className="flex-1 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm" />
      <button formAction="/compare/add" className="inline-flex items-center gap-1 px-4 py-2 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm font-medium">
        <Plus className="w-4 h-4" /> Add
      </button>
    </form>
  );
}
