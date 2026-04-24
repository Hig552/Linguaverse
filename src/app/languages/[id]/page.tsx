import Link from "next/link";
import { notFound } from "next/navigation";
import { getLanguoid, getAncestors, getChildren, getAltNames, getCountries } from "@/lib/queries";
import { ENDANGERMENT_LABELS, MED_LABELS } from "@/lib/db";
import { formatNumber, formatCompactNumber, glottocodeUrl } from "@/lib/format";
import { EndangermentBadge, LevelBadge, IsoBadge, MedBadge } from "@/components/LangBadges";
import { ArrowRight, ExternalLink, GitCompare, Download, MapPin, Users, BookOpen, Languages } from "lucide-react";
import LanguageMap from "@/components/LanguageMap";

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const lang = getLanguoid(id);
  if (!lang) return { title: "Not found" };
  return {
    title: `${lang.name} (${lang.iso639_3 ?? lang.id})`,
    description: `Facts, statistics and data about ${lang.name} — ${lang.level}, ${lang.macroarea ?? 'unknown region'}, ${lang.speaker_count ? formatNumber(lang.speaker_count) + ' speakers' : 'speaker count unknown'}.`,
  };
}

export default async function LanguagePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const lang = getLanguoid(id);
  if (!lang) notFound();

  const ancestors = getAncestors(lang.id);
  const children = getChildren(lang.id);
  const altNames = getAltNames(lang.id);
  const countries = getCountries(lang.id);

  const nativeNames = altNames.filter((n) => n.lang && n.lang !== 'en');
  const englishNames = altNames.filter((n) => !n.lang || n.lang === 'en');
  const dedupEnglish = [...new Set(englishNames.map((n) => n.name))].filter((n) => n !== lang.name).slice(0, 20);

  const aesInfo = lang.aes ? ENDANGERMENT_LABELS[lang.aes] : null;
  const medInfo = lang.med !== null && lang.med !== undefined ? MED_LABELS[lang.med] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb classification */}
      {ancestors.length > 0 && (
        <nav className="text-sm text-zinc-500 mb-4 flex flex-wrap items-center gap-1">
          {ancestors.map((a) => (
            <span key={a.id} className="inline-flex items-center gap-1">
              <Link href={a.level === 'family' ? `/families/${a.id}` : `/languages/${a.id}`} className="hover:underline">
                {a.name}
              </Link>
              <ArrowRight className="w-3 h-3" />
            </span>
          ))}
          <span className="text-zinc-900 dark:text-zinc-100 font-medium">{lang.name}</span>
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <LevelBadge level={lang.level} />
            {lang.category && <span className="text-xs text-zinc-500">{lang.category}</span>}
            {lang.is_isolate ? <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Language isolate</span> : null}
          </div>
          <h1 className="text-4xl font-bold">{lang.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <IsoBadge iso={lang.iso639_3} />
            <span className="text-xs font-mono uppercase text-zinc-500">glotto: {lang.id}</span>
            <EndangermentBadge aes={lang.aes} label={lang.aes_label} />
            <MedBadge med={lang.med} />
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/compare?ids=${lang.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm">
            <GitCompare className="w-4 h-4" /> Compare
          </Link>
          <a href={`/api/languages/${lang.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm">
            <Download className="w-4 h-4" /> JSON
          </a>
        </div>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
        <FactCard icon={<Users className="w-4 h-4" />} label="L1 + L2 speakers" value={formatCompactNumber(lang.speaker_count)} hint={lang.speaker_count ? formatNumber(lang.speaker_count) + ' total' : 'not available'} />
        <FactCard icon={<MapPin className="w-4 h-4" />} label="Region" value={lang.macroarea ?? '—'} hint={countries.length ? `${countries.length} countr${countries.length === 1 ? 'y' : 'ies'}` : ''} />
        <FactCard icon={<BookOpen className="w-4 h-4" />} label="Writing system" value={lang.script ?? '—'} />
        <FactCard icon={<Languages className="w-4 h-4" />} label="Classification depth" value={String(lang.depth ?? 0)} hint="levels from top-level family" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Section title="Overview">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Row label="Official name">{lang.name}</Row>
              <Row label="Glottocode"><a href={glottocodeUrl(lang.id)} className="font-mono hover:underline" target="_blank" rel="noreferrer">{lang.id} <ExternalLink className="inline w-3 h-3" /></a></Row>
              {lang.iso639_3 && <Row label="ISO 639-3">{lang.iso639_3}</Row>}
              {lang.closest_iso && <Row label="Closest ISO">{lang.closest_iso}</Row>}
              <Row label="Level">{lang.level}</Row>
              {lang.category && <Row label="Category">{lang.category}</Row>}
              <Row label="Macro-area">{lang.macroarea ?? '—'}</Row>
              <Row label="Language isolate">{lang.is_isolate ? 'Yes' : 'No'}</Row>
              {aesInfo && <Row label="Endangerment">{aesInfo.label} — {aesInfo.description}</Row>}
              {medInfo && <Row label="Documentation">{medInfo.label} — {medInfo.description}</Row>}
              {lang.first_year_doc && <Row label="First documented">{lang.first_year_doc}</Row>}
              {lang.last_year_doc && <Row label="Latest documentation">{lang.last_year_doc}</Row>}
              {lang.latitude !== null && lang.longitude !== null && (
                <Row label="Coordinates">{lang.latitude.toFixed(3)}°, {lang.longitude.toFixed(3)}°</Row>
              )}
              {lang.wikipedia_url && <Row label="Wikipedia"><a href={lang.wikipedia_url} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">{new URL(lang.wikipedia_url).pathname.replace('/wiki/', '')}</a></Row>}
            </dl>
          </Section>

          {/* Countries */}
          {countries.length > 0 && (
            <Section title={`Spoken in ${countries.length} country${countries.length === 1 ? '' : countries.length > 1 ? 'ies' : ''}`}>
              <div className="flex flex-wrap gap-2">
                {countries.map((c) => (
                  <Link key={c.code} href={`/countries/${c.code}`} className="text-sm px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 hover:border-sky-400">
                    <span className="font-mono text-[10px] text-zinc-500 mr-1">{c.code}</span>{c.name}
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {/* Alternative names */}
          {(dedupEnglish.length > 0 || nativeNames.length > 0) && (
            <Section title="Alternative names">
              {dedupEnglish.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">English / transliterated</div>
                  <div className="flex flex-wrap gap-1.5">
                    {dedupEnglish.map((n) => <span key={n} className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">{n}</span>)}
                  </div>
                </div>
              )}
              {nativeNames.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">In other languages</div>
                  <div className="flex flex-wrap gap-1.5">
                    {nativeNames.slice(0, 40).map((n, i) => (
                      <span key={`${n.provider}-${n.lang}-${i}`} className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                        <span className="font-mono text-[10px] text-zinc-500 mr-1">{n.lang}</span>{n.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Children */}
          {children.length > 0 && (
            <Section title={`Sub-${lang.level === 'family' ? 'branches' : 'varieties'} (${children.length})`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {children.slice(0, 80).map((c) => (
                  <Link key={c.id} href={c.level === 'family' ? `/families/${c.id}` : `/languages/${c.id}`}
                    className="flex items-center justify-between text-sm px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800 hover:border-sky-400">
                    <span>
                      <LevelBadge level={c.level} /> <span className="ml-1">{c.name}</span>
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">{c.iso639_3 ?? c.id}</span>
                  </Link>
                ))}
              </div>
              {children.length > 80 && (
                <Link href={`/languages?family=${lang.id}&level=language`} className="text-sm text-sky-600 hover:underline mt-2 inline-block">
                  See all {children.length} members →
                </Link>
              )}
            </Section>
          )}
        </div>

        <aside className="space-y-6">
          {lang.latitude !== null && lang.longitude !== null && (
            <Section title="Location">
              <div className="-m-4 h-64 rounded-lg overflow-hidden">
                <LanguageMap points={[{ id: lang.id, name: lang.name, latitude: lang.latitude, longitude: lang.longitude, macroarea: lang.macroarea, aes: lang.aes, aes_label: lang.aes_label, speaker_count: lang.speaker_count, iso639_3: lang.iso639_3 }]} center={[lang.latitude, lang.longitude]} zoom={4} />
              </div>
            </Section>
          )}
          <Section title="External references">
            <ul className="text-sm space-y-1">
              <li><a href={glottocodeUrl(lang.id)} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">Glottolog <ExternalLink className="inline w-3 h-3" /></a></li>
              {lang.iso639_3 && <li><a href={`https://iso639-3.sil.org/code/${lang.iso639_3}`} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">ISO 639-3 Registry <ExternalLink className="inline w-3 h-3" /></a></li>}
              {lang.wikipedia_url && <li><a href={lang.wikipedia_url} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">English Wikipedia <ExternalLink className="inline w-3 h-3" /></a></li>}
            </ul>
          </Section>

          <Section title="Citation">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Data for {lang.name} was compiled by Linguaverse from{' '}
              <a href="https://glottolog.org" target="_blank" rel="noreferrer" className="underline">Glottolog 5.3</a>{' '}(CC-BY-4.0),{' '}
              <a href="https://www.wikidata.org" target="_blank" rel="noreferrer" className="underline">Wikidata</a>{' '}(CC0){lang.iso639_3 ? ', and the ISO 639-3 registry' : ''}.
              Please credit those upstream sources when using this data.
            </p>
          </Section>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <h2 className="text-base font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function FactCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
      <div className="text-xs text-zinc-500 flex items-center gap-1">{icon} {label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
      {hint && <div className="text-[11px] text-zinc-500">{hint}</div>}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2">
      <dt className="text-zinc-500">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
