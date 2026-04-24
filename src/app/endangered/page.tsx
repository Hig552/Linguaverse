import { searchLanguoids } from "@/lib/queries";
import { ENDANGERMENT_LABELS } from "@/lib/db";
import { formatNumber, formatCompactNumber } from "@/lib/format";
import { EndangermentBadge } from "@/components/LangBadges";
import Link from "next/link";

export const metadata = { title: "Endangered languages" };

export default async function EndangeredPage() {
  const buckets = [3, 4, 5, 6].map((aes) => ({
    aes,
    info: ENDANGERMENT_LABELS[aes],
    result: searchLanguoids({ level: 'language', endangerment: aes, orderBy: 'speakers', order: 'asc', limit: 20 }),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Endangered languages of the world</h1>
      <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
        Classification follows the Agglomerated Endangerment Status (EGIDS + UNESCO + ElCat). Languages at levels 3-6 need urgent documentation.
      </p>

      <div className="mt-8 space-y-10">
        {buckets.map(({ aes, info, result }) => (
          <section key={aes}>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${info.color}`} />
              {info.label} <span className="text-sm font-normal text-zinc-500">· {formatNumber(result.total)} languages</span>
            </h2>
            <p className="text-sm text-zinc-500 mt-1">{info.description}</p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {result.items.map((l) => (
                <Link key={l.id} href={`/languages/${l.id}`} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 hover:border-sky-400">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{l.name}</div>
                    <EndangermentBadge aes={l.aes} label={l.aes_label} compact />
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {l.macroarea ?? ''}{l.speaker_count !== null ? ` · ${formatCompactNumber(l.speaker_count)} speakers` : ''}
                  </div>
                </Link>
              ))}
            </div>
            {result.total > result.items.length && (
              <Link href={`/languages?endangerment=${aes}`} className="text-sm text-sky-600 hover:underline mt-2 inline-block">
                See all {formatNumber(result.total)} →
              </Link>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
