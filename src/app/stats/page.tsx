import Link from "next/link";
import { getStats, getAllScripts } from "@/lib/queries";
import { ENDANGERMENT_LABELS } from "@/lib/db";
import { formatNumber, formatCompactNumber } from "@/lib/format";
import StatsCharts from "@/components/StatsCharts";

export const metadata = {
  title: "Statistics",
  description: "Global statistics on the world's languages — top speakers, endangered languages, largest families, sign languages, isolates, writing systems.",
};

export default async function StatsPage() {
  const s = getStats();
  const scripts = getAllScripts().slice(0, 30);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">World languages, by the numbers</h1>
      <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
        Aggregated from Glottolog {s.glottologVersion} and Wikidata. Speaker counts reflect the sum of languages where Wikidata provides an estimate and are an underestimate of the real total.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <Stat label="Total languoids" value={formatNumber(s.totals.total)} />
        <Stat label="Languages" value={formatNumber(s.totals.language)} />
        <Stat label="Dialects" value={formatNumber(s.totals.dialect)} />
        <Stat label="Families" value={formatNumber(s.totals.family)} />
      </div>

      <StatsCharts byMacroarea={s.byMacroarea} byEndangerment={s.byEndangerment.map((e) => ({ ...e, label: ENDANGERMENT_LABELS[e.aes]?.label ?? e.label }))} />

      <section className="mt-12" id="top">
        <h2 className="text-2xl font-bold mb-4">Top 20 most-spoken languages</h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Language</th>
                <th className="px-4 py-2 font-medium">Region</th>
                <th className="px-4 py-2 font-medium text-right">L1+L2 speakers</th>
                <th className="px-4 py-2 font-medium">Script</th>
              </tr>
            </thead>
            <tbody>
              {s.topLanguages.map((l, i) => (
                <tr key={l.id} className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                  <td className="px-4 py-2 font-mono text-xs text-zinc-500">{i + 1}</td>
                  <td className="px-4 py-2">
                    <Link href={`/languages/${l.id}`} className="font-medium hover:underline">{l.name}</Link>
                    {l.iso639_3 && <span className="ml-2 text-[10px] font-mono uppercase text-zinc-500">{l.iso639_3}</span>}
                  </td>
                  <td className="px-4 py-2 text-zinc-500">{l.macroarea ?? '—'}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatCompactNumber(l.speaker_count)}</td>
                  <td className="px-4 py-2 text-zinc-500 max-w-[200px] truncate">{l.script ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Largest language families</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {s.topFamilies.map((f) => (
            <Link key={f.family.id} href={`/families/${f.family.id}`} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-sky-400 flex items-center justify-between">
              <div>
                <div className="font-semibold">{f.family.name}</div>
                <div className="text-xs text-zinc-500">{f.family.macroarea ?? 'multi-region'}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{formatNumber(f.size)}</div>
                <div className="text-xs text-zinc-500">languages</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Critically endangered</h2>
          <p className="text-sm text-zinc-500 mb-3">Nearly-extinct languages with few remaining speakers.</p>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {s.mostEndangered.map((l) => (
                <li key={l.id}>
                  <Link href={`/languages/${l.id}`} className="block px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                    <span className="font-medium">{l.name}</span>
                    <span className="text-xs text-zinc-500 ml-2">{l.macroarea ?? ''}</span>
                    {l.speaker_count !== null && <span className="text-xs text-zinc-500 ml-2">· {formatNumber(l.speaker_count)} speakers</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Best-documented languages</h2>
          <p className="text-sm text-zinc-500 mb-3">Languages with comprehensive grammars (300+ pages).</p>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {s.mostDocumented.map((l) => (
                <li key={l.id}>
                  <Link href={`/languages/${l.id}`} className="block px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                    <span className="font-medium">{l.name}</span>
                    <span className="text-xs text-zinc-500 ml-2">{l.macroarea ?? ''}</span>
                    {l.speaker_count !== null && <span className="text-xs text-zinc-500 ml-2">· {formatCompactNumber(l.speaker_count)} speakers</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Language isolates</h2>
          <p className="text-sm text-zinc-500 mb-3">Languages with no known genealogical relatives.</p>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {s.isolates.map((l) => (
                <li key={l.id}>
                  <Link href={`/languages/${l.id}`} className="block px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                    <span className="font-medium">{l.name}</span>
                    <span className="text-xs text-zinc-500 ml-2">{l.macroarea ?? ''}</span>
                    {l.speaker_count !== null && <span className="text-xs text-zinc-500 ml-2">· {formatCompactNumber(l.speaker_count)} speakers</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Sign languages</h2>
          <p className="text-sm text-zinc-500 mb-3">Documented sign languages of the world.</p>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {s.signLanguages.map((l) => (
                <li key={l.id}>
                  <Link href={`/languages/${l.id}`} className="block px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                    <span className="font-medium">{l.name}</span>
                    <span className="text-xs text-zinc-500 ml-2">{l.macroarea ?? ''}</span>
                    {l.speaker_count !== null && <span className="text-xs text-zinc-500 ml-2">· {formatCompactNumber(l.speaker_count)} signers</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Writing systems</h2>
        <p className="text-sm text-zinc-500 mb-4">Most common scripts across the world&apos;s languages.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {scripts.map((s) => (
            <Link key={s.script} href={`/languages?script=${encodeURIComponent(s.script)}`} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 hover:border-sky-400">
              <div className="font-medium text-sm truncate">{s.script}</div>
              <div className="text-xl font-bold mt-1">{formatNumber(s.count)}</div>
              <div className="text-xs text-zinc-500">languages</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
