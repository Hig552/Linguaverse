import Link from "next/link";
import { notFound } from "next/navigation";
import { getLanguoid, getAncestors, getChildren, getSubtreeLanguages, getSubtreeStats } from "@/lib/queries";
import { formatNumber, formatCompactNumber } from "@/lib/format";
import { LevelBadge, EndangermentBadge, IsoBadge } from "@/components/LangBadges";
import { ArrowRight, Download, Users, Globe, TreePine, AlertTriangle } from "lucide-react";
import FamilyTree from "@/components/FamilyTree";

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const f = getLanguoid(id);
  if (!f) return { title: "Not found" };
  const s = getSubtreeStats(f.id);
  return {
    title: f.name,
    description: `${f.name} is a ${f.level} grouping ${s.languages} languages${s.speakers ? ` spoken by ${formatCompactNumber(s.speakers)} people` : ''}.`,
  };
}

export default async function FamilyPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const family = getLanguoid(id);
  if (!family) notFound();

  const ancestors = getAncestors(family.id);
  const children = getChildren(family.id);
  const languages = getSubtreeLanguages(family.id);
  const stats = getSubtreeStats(family.id);

  const childFamilies = children.filter((c) => c.level === 'family');
  const sortedLanguages = languages.sort((a, b) => (b.speaker_count ?? 0) - (a.speaker_count ?? 0));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {ancestors.length > 0 && (
        <nav className="text-sm text-zinc-500 mb-4 flex flex-wrap items-center gap-1">
          <Link href="/families" className="hover:underline">Families</Link>
          <ArrowRight className="w-3 h-3" />
          {ancestors.map((a) => (
            <span key={a.id} className="inline-flex items-center gap-1">
              <Link href={`/families/${a.id}`} className="hover:underline">{a.name}</Link>
              <ArrowRight className="w-3 h-3" />
            </span>
          ))}
          <span className="text-zinc-900 dark:text-zinc-100 font-medium">{family.name}</span>
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <LevelBadge level={family.level} />
            {family.category && <span className="text-xs text-zinc-500">{family.category}</span>}
          </div>
          <h1 className="text-4xl font-bold">{family.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-mono uppercase text-zinc-500">glotto: {family.id}</span>
            {family.macroarea && <span className="text-xs text-zinc-500">· {family.macroarea}</span>}
          </div>
        </div>
        <a href={`/api/families/${family.id}?format=csv`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm">
          <Download className="w-4 h-4" /> Export member languages (CSV)
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
        <Fact icon={<Globe className="w-4 h-4" />} label="Languages" value={formatNumber(stats.languages)} />
        <Fact icon={<TreePine className="w-4 h-4" />} label="Sub-families" value={formatNumber(stats.subfamilies)} />
        <Fact icon={<Users className="w-4 h-4" />} label="Speakers" value={formatCompactNumber(stats.speakers)} />
        <Fact icon={<AlertTriangle className="w-4 h-4" />} label="Endangered" value={formatNumber(stats.endangered)} />
      </div>

      <section className="mt-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <h2 className="text-lg font-semibold mb-3">Genealogical tree</h2>
        <FamilyTree root={family} initialChildren={children} />
      </section>

      {childFamilies.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Immediate sub-families ({childFamilies.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {childFamilies.map((c) => {
              const s = getSubtreeStats(c.id);
              return (
                <Link key={c.id} href={`/families/${c.id}`} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 hover:border-sky-400">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {formatNumber(s.languages)} language{s.languages === 1 ? '' : 's'}
                    {s.subfamilies ? ` · ${formatNumber(s.subfamilies)} sub-familie${s.subfamilies === 1 ? '' : 's'}` : ''}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">All member languages ({languages.length})</h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
                <th className="px-4 py-2 font-medium">Language</th>
                <th className="px-4 py-2 font-medium">Region</th>
                <th className="px-4 py-2 font-medium text-right">Speakers</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Code</th>
              </tr>
            </thead>
            <tbody>
              {sortedLanguages.slice(0, 300).map((l) => (
                <tr key={l.id} className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                  <td className="px-4 py-2">
                    <Link href={`/languages/${l.id}`} className="font-medium hover:underline">{l.name}</Link>
                  </td>
                  <td className="px-4 py-2 text-zinc-500">{l.macroarea ?? '—'}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatCompactNumber(l.speaker_count)}</td>
                  <td className="px-4 py-2"><EndangermentBadge aes={l.aes} label={l.aes_label} /></td>
                  <td className="px-4 py-2 font-mono text-xs"><IsoBadge iso={l.iso639_3} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedLanguages.length > 300 && (
            <div className="px-4 py-3 text-sm text-zinc-500">
              Showing 300 of {formatNumber(sortedLanguages.length)}.{' '}
              <Link href={`/languages?family=${family.id}`} className="text-sky-600 hover:underline">See all in the language browser →</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
      <div className="text-xs text-zinc-500 flex items-center gap-1">{icon} {label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
