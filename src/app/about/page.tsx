import Link from "next/link";
import { getStats } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const s = getStats();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 prose prose-zinc dark:prose-invert">
      <h1>About Linguaverse</h1>
      <p>
        <strong>Linguaverse</strong> is a free, open atlas of the world&apos;s languages.
        It is an independent project built on top of open, CC-licensed linguistic datasets, with
        richer filtering, statistics, maps, and a public API than proprietary alternatives.
      </p>

      <h2>What you can do here</h2>
      <ul>
        <li>Browse {formatNumber(s.totals.total)} languoids — {formatNumber(s.totals.language)} languages, {formatNumber(s.totals.dialect)} dialects and {formatNumber(s.totals.family)} families.</li>
        <li>See every language&apos;s family, countries, writing system, endangerment status, and coordinates.</li>
        <li>Compare languages <Link href="/compare">side-by-side</Link>.</li>
        <li>Visualise the world&apos;s languages on an <Link href="/map">interactive map</Link>.</li>
        <li>Drill into <Link href="/families">genealogical trees</Link> of every language family.</li>
        <li>Query everything through a free <Link href="/api">public REST API</Link>.</li>
        <li>Export filtered datasets to CSV from any list page.</li>
      </ul>

      <h2>Data sources</h2>
      <ul>
        <li><a href="https://glottolog.org">Glottolog 5.3</a> (CC-BY-4.0) — the master catalog of languoids, families, coordinates, classification trees, endangerment status, and documentation quality.</li>
        <li><a href="https://www.wikidata.org">Wikidata</a> (CC0) — speaker counts, writing systems, and Wikipedia links.</li>
        <li><a href="https://iso639-3.sil.org">ISO 639-3</a> — standardised 3-letter language codes.</li>
      </ul>

      <h2>Not Ethnologue</h2>
      <p>
        Linguaverse is <strong>not</strong> affiliated with or endorsed by SIL International or the
        Ethnologue. Ethnologue is a paid, proprietary resource. Linguaverse is free and open —
        all data, code, and APIs are available without registration.
      </p>

      <h2>Citing this site</h2>
      <p>
        If you use Linguaverse in a published work, please cite the upstream sources (above) in
        addition to this site. A BibTeX snippet for Glottolog:
      </p>
      <pre className="whitespace-pre-wrap text-xs">
{`@misc{glottolog,
  author       = {Hammarström, Harald and Forkel, Robert and Haspelmath, Martin and Bank, Sebastian},
  year         = {2026},
  title        = {{Glottolog 5.3}},
  publisher    = {Max Planck Institute for Evolutionary Anthropology},
  url          = {https://glottolog.org}
}`}
      </pre>

      <h2>Contact</h2>
      <p>
        Open an issue on the GitHub repository to report a bug, propose a new feature, or
        contribute data patches.
      </p>
    </div>
  );
}
