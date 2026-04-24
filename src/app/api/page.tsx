import Link from "next/link";

export const metadata = {
  title: "Public API",
  description: "Linguaverse exposes a free, open, CORS-enabled REST API for programmatic access to all language data.",
};

const ENDPOINTS: Array<{ method: string; path: string; desc: string; params?: Array<[string, string]>; example?: string }> = [
  {
    method: "GET",
    path: "/api/languages",
    desc: "Search languages, families, and dialects. Supports the same filters as the UI.",
    params: [
      ["q", "Full-text search across names, ISO codes and alternative names."],
      ["level", "language | family | dialect"],
      ["macroarea", "Africa | Eurasia | Papunesia | North America | South America | Australia"],
      ["country", "ISO 3166-1 alpha-2 country code."],
      ["family", "Glottocode of the parent family."],
      ["endangerment", "1..6 (not endangered → extinct)."],
      ["minSpeakers / maxSpeakers", "Speaker count range."],
      ["script", "Substring match of the writing system."],
      ["isolate", "true to restrict to language isolates."],
      ["hasCoordinates", "true to restrict to geolocated languages."],
      ["orderBy", "name | speakers | endangerment"],
      ["order", "asc | desc"],
      ["limit / offset", "Paging (default limit=50, max=500)."],
      ["format", "json (default) or csv for bulk exports."],
    ],
    example: "/api/languages?q=arabic&level=language&limit=5",
  },
  {
    method: "GET",
    path: "/api/languages/{id}",
    desc: "Full record for a language, including ancestors, children, alternative names, and countries.",
    example: "/api/languages/stan1318",
  },
  {
    method: "GET",
    path: "/api/families/{id}",
    desc: "A family with all its subtree languages and aggregated stats.",
    params: [["format", "json (default) or csv."]],
    example: "/api/families/indo1319",
  },
  {
    method: "GET",
    path: "/api/children/{id}",
    desc: "Immediate children of a languoid (used by the tree view).",
    example: "/api/children/indo1319",
  },
  {
    method: "GET",
    path: "/api/search?q=…",
    desc: "Lightweight typeahead search (max 12 results).",
    example: "/api/search?q=swahili",
  },
  {
    method: "GET",
    path: "/api/stats",
    desc: "Global stats: counts by level and macroarea, endangerment breakdown, top languages/families/isolates/sign languages, writing systems and countries.",
    example: "/api/stats",
  },
];

export default function ApiPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl font-bold">Linguaverse Public API</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400 max-w-2xl">
        A free, open, CORS-enabled REST API for every piece of data on this site. No keys. No
        registration. Be kind and cache responses when possible.
      </p>

      <div className="mt-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-sm">
        <div className="font-semibold">Base URL</div>
        <code className="text-xs font-mono mt-1 block break-all text-sky-700 dark:text-sky-300">{/* user's deployed host */}/api</code>
        <div className="text-xs text-zinc-500 mt-2">All responses are JSON by default (UTF-8). CSV output is available on list endpoints via <code>?format=csv</code>.</div>
      </div>

      <div className="mt-8 space-y-6">
        {ENDPOINTS.map((e) => (
          <section key={e.path} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">{e.method}</span>
              <code className="text-sm font-mono">{e.path}</code>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">{e.desc}</p>
            {e.params && (
              <div className="mt-3">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Query parameters</div>
                <ul className="mt-1 text-xs space-y-1">
                  {e.params.map(([k, v]) => (
                    <li key={k}><code className="font-mono text-sky-700 dark:text-sky-300">{k}</code> — <span className="text-zinc-600 dark:text-zinc-400">{v}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {e.example && (
              <div className="mt-3">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Example</div>
                <Link href={e.example} className="text-xs font-mono text-sky-700 dark:text-sky-300 hover:underline break-all block mt-1">{e.example}</Link>
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-sm">
        <h2 className="font-semibold">Attribution</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          When you use Linguaverse data in a published work, please credit the upstream sources:
          Hammarström et al. (<a className="underline" href="https://glottolog.org">Glottolog 5.3</a>, CC-BY-4.0),
          the <a className="underline" href="https://www.wikidata.org">Wikidata contributors</a> (CC0),
          and the <a className="underline" href="https://iso639-3.sil.org">ISO 639-3 registry</a>.
        </p>
      </div>
    </div>
  );
}
