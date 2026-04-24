import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getCountryLanguages } from "@/lib/queries";
import { formatNumber, formatCompactNumber } from "@/lib/format";
import { EndangermentBadge, IsoBadge } from "@/components/LangBadges";

export async function generateMetadata(props: { params: Promise<{ code: string }> }) {
  const { code } = await props.params;
  const c = getDb().prepare("SELECT * FROM countries WHERE code = ?").get(code) as { code: string; name: string } | undefined;
  if (!c) return { title: "Country not found" };
  return { title: `Languages of ${c.name}` };
}

export default async function CountryPage(props: { params: Promise<{ code: string }> }) {
  const { code } = await props.params;
  const country = getDb().prepare("SELECT * FROM countries WHERE code = ?").get(code) as { code: string; name: string } | undefined;
  if (!country) notFound();

  const languages = getCountryLanguages(code);
  const totalSpeakers = languages.reduce((a, l) => a + (l.speaker_count ?? 0), 0);
  const endangered = languages.filter((l) => l.aes && l.aes >= 3).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <div className="text-sm text-zinc-500"><Link href="/countries" className="hover:underline">Countries</Link></div>
          <h1 className="text-4xl font-bold">{country.name}</h1>
          <div className="text-sm text-zinc-500 mt-1">ISO code: <span className="font-mono">{country.code}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <Stat label="Languages" value={formatNumber(languages.length)} />
        <Stat label="Endangered" value={formatNumber(endangered)} />
        <Stat label="Total speakers" value={formatCompactNumber(totalSpeakers)} hint="(known)" />
      </div>

      <div className="mt-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
              <th className="px-4 py-2 font-medium">Language</th>
              <th className="px-4 py-2 font-medium">Family</th>
              <th className="px-4 py-2 font-medium text-right">Speakers</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Code</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((l) => (
              <tr key={l.id} className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                <td className="px-4 py-2"><Link href={`/languages/${l.id}`} className="font-medium hover:underline">{l.name}</Link></td>
                <td className="px-4 py-2 text-zinc-500">
                  {l.family_id ? <Link href={`/families/${l.family_id}`} className="hover:underline">{l.family_id}</Link> : (l.is_isolate ? 'isolate' : '—')}
                </td>
                <td className="px-4 py-2 text-right font-mono">{formatCompactNumber(l.speaker_count)}</td>
                <td className="px-4 py-2"><EndangermentBadge aes={l.aes} label={l.aes_label} /></td>
                <td className="px-4 py-2 font-mono text-xs"><IsoBadge iso={l.iso639_3} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {hint && <div className="text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}
