import Link from "next/link";
import { ArrowRight, Map, BarChart3, GitCompare, Globe2, Code2, Download } from "lucide-react";
import { getStats } from "@/lib/queries";
import { formatCompactNumber, formatNumber } from "@/lib/format";
import { ENDANGERMENT_LABELS } from "@/lib/db";

export default async function HomePage() {
  const s = getStats();
  const endangeredCount = s.byEndangerment.filter((r) => r.aes >= 3).reduce((a, b) => a + b.count, 0);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900" />
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Every language on Earth,
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
              open and comprehensive.
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-zinc-600 dark:text-zinc-300 max-w-3xl">
            Linguaverse is a free, open atlas of {formatNumber(s.totals.language)} living and
            historic languages across {formatNumber(s.byMacroarea.length)} world regions —
            with speaker counts, endangerment status, writing systems, genealogical trees,
            interactive maps, side-by-side comparisons, and a public API.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/languages" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium">
              Browse languages <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/map" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-zinc-300 dark:border-zinc-700 font-medium hover:bg-white dark:hover:bg-zinc-900">
              Open world map
            </Link>
            <Link href="/api" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-zinc-300 dark:border-zinc-700 font-medium hover:bg-white dark:hover:bg-zinc-900">
              Read API docs
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Languages" value={formatNumber(s.totals.language)} hint="living, historic, sign" />
            <StatCard label="Dialects" value={formatNumber(s.totals.dialect)} />
            <StatCard label="Families"  value={formatNumber(s.totals.family)} />
            <StatCard label="L1+L2 speakers" value={formatCompactNumber(s.totalSpeakers)} hint="(languages with Wikidata data)" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Interactive world map"
            icon={<Map className="w-5 h-5" />}
            href="/map"
            body={`${formatNumber(s.totals.language)} geolocated points — filter by family, region, or endangerment status.`}
          />
          <FeatureCard
            title="Rich statistics"
            icon={<BarChart3 className="w-5 h-5" />}
            href="/stats"
            body={`Top 20 languages, largest families, ${formatNumber(endangeredCount)} endangered languages, sign languages, isolates, scripts, and more.`}
          />
          <FeatureCard
            title="Side-by-side comparisons"
            icon={<GitCompare className="w-5 h-5" />}
            href="/compare"
            body="Pit two or more languages against each other — speakers, endangerment, genealogy, coordinates, and alternative names."
          />
          <FeatureCard
            title="Genealogical trees"
            icon={<Globe2 className="w-5 h-5" />}
            href="/families"
            body={`${formatNumber(s.totals.family)} families including ${formatNumber(s.topFamilies.length)} of the largest super-families. Click any family to drill into sub-branches.`}
          />
          <FeatureCard
            title="Free public API"
            icon={<Code2 className="w-5 h-5" />}
            href="/api"
            body="REST endpoints for languages, families, countries, stats, and search. No API keys. No rate limits for sensible use."
          />
          <FeatureCard
            title="Open data, always exportable"
            icon={<Download className="w-5 h-5" />}
            href="/about"
            body="All data is derived from open sources (Glottolog 5.3, Wikidata, ISO 639-3). Download CSV/JSON from any page."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">The world&apos;s most-spoken languages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {s.topLanguages.slice(0, 12).map((l, i) => (
            <Link key={l.id} href={`/languages/${l.id}`}
              className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-sky-400 hover:shadow-sm transition">
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-semibold text-sm truncate">{i + 1}. {l.name}</div>
                {l.iso639_3 && <div className="text-[10px] font-mono uppercase text-zinc-500">{l.iso639_3}</div>}
              </div>
              <div className="text-lg font-bold mt-1">{formatCompactNumber(l.speaker_count)}</div>
              <div className="text-xs text-zinc-500 truncate">speakers · {l.macroarea ?? '—'}</div>
            </Link>
          ))}
        </div>
        <Link href="/stats#top" className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-sky-600 hover:underline">
          See the full top 20 <ArrowRight className="w-3 h-3" />
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Endangered languages</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {s.byEndangerment.map((b) => {
            const info = ENDANGERMENT_LABELS[b.aes];
            return (
              <Link key={b.aes} href={`/languages?endangerment=${b.aes}`}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-sky-400 transition">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${info?.color ?? 'bg-zinc-400'} mr-2 align-middle`} />
                <span className="font-semibold text-sm">{info?.label ?? b.label}</span>
                <div className="text-2xl font-bold mt-2">{formatNumber(b.count)}</div>
                <div className="text-xs text-zinc-500">languages</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Largest language families</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {s.topFamilies.slice(0, 12).map((f) => (
            <Link key={f.family.id} href={`/families/${f.family.id}`}
              className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-sky-400 transition">
              <div className="font-semibold">{f.family.name}</div>
              <div className="text-xs text-zinc-500 mt-1">{f.family.macroarea ?? 'multi-region'}</div>
              <div className="text-xl font-bold mt-2">{formatNumber(f.size)}</div>
              <div className="text-xs text-zinc-500">member languages</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {hint && <div className="text-xs text-zinc-500 mt-0.5">{hint}</div>}
    </div>
  );
}

function FeatureCard({ title, body, icon, href }: { title: string; body: string; icon: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-sky-400 hover:shadow-sm transition">
      <div className="flex items-center gap-2 font-semibold">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-sky-500/20 to-emerald-500/20 flex items-center justify-center text-sky-600">
          {icon}
        </div>
        {title}
      </div>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{body}</p>
      <div className="mt-3 text-sm text-sky-600 flex items-center gap-1 group-hover:translate-x-0.5 transition">
        Open <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}
