import Link from "next/link";
import { getTopLevelFamilies, getSubtreeStats } from "@/lib/queries";
import { formatNumber, formatCompactNumber } from "@/lib/format";

export const metadata = {
  title: "Language families",
  description: "Browse the 240+ top-level genealogical groupings of the world's languages.",
};

export default async function FamiliesPage() {
  const families = getTopLevelFamilies();
  // Only include families (not isolates listed at level='language' with is_isolate=1)
  const allFamilies = families.filter((f) => f.level === 'family');
  const enriched = allFamilies.map((f) => ({
    family: f,
    stats: getSubtreeStats(f.id),
  })).sort((a, b) => (b.stats.languages + b.stats.subfamilies) - (a.stats.languages + a.stats.subfamilies));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Language families</h1>
      <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
        {formatNumber(enriched.length)} top-level genealogical groupings. Each family links out
        to all its member languages and sub-branches.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {enriched.map(({ family, stats }) => (
          <Link key={family.id} href={`/families/${family.id}`}
            className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-sky-400 hover:shadow-sm transition">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-lg leading-tight">{family.name}</div>
              <span className="text-[10px] font-mono uppercase text-zinc-500">{family.id}</span>
            </div>
            {family.macroarea && <div className="text-xs text-zinc-500 mt-1">{family.macroarea}</div>}
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <Stat label="Languages" value={formatNumber(stats.languages)} />
              <Stat label="Subfamilies" value={formatNumber(stats.subfamilies)} />
              <Stat label="Speakers" value={formatCompactNumber(stats.speakers)} />
            </div>
            {stats.endangered > 0 && (
              <div className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                {formatNumber(stats.endangered)} endangered {stats.endangered === 1 ? 'language' : 'languages'}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-zinc-500">{label}</div>
      <div className="font-semibold text-sm">{value}</div>
    </div>
  );
}
