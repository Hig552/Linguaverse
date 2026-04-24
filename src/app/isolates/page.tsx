import Link from "next/link";
import { searchLanguoids } from "@/lib/queries";
import { formatNumber, formatCompactNumber } from "@/lib/format";
import { EndangermentBadge } from "@/components/LangBadges";

export const metadata = { title: "Language isolates" };

export default async function IsolatesPage() {
  const { items, total } = searchLanguoids({ isolate: true, level: 'language', orderBy: 'speakers', order: 'desc', limit: 200 });
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Language isolates</h1>
      <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
        {formatNumber(total)} languages with no known genealogical relatives — the loneliest branches of the world&apos;s linguistic tree.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((l) => (
          <Link key={l.id} href={`/languages/${l.id}`} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 hover:border-sky-400">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">{l.name}</div>
              <EndangermentBadge aes={l.aes} label={l.aes_label} compact />
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {l.macroarea ?? ''}{l.speaker_count !== null ? ` · ${formatCompactNumber(l.speaker_count)} speakers` : ''}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
