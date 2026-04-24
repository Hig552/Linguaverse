import { getLanguagesWithCoordinates, getTopLevelFamilies } from "@/lib/queries";
import { MACROAREAS, ENDANGERMENT_LABELS } from "@/lib/db";
import { formatNumber } from "@/lib/format";
import WorldMap from "@/components/WorldMap";

type Search = Record<string, string | string[] | undefined>;
function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export const metadata = {
  title: "World language map",
  description: "Interactive map of 8,500+ world languages. Filter by family, region, or endangerment status.",
};

export default async function MapPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const macroarea = first(sp.macroarea);
  const family = first(sp.family);
  const aes = first(sp.endangerment);

  const points = getLanguagesWithCoordinates({
    macroarea,
    family,
    endangerment: aes ? Number(aes) : undefined,
  });

  const families = getTopLevelFamilies();

  return (
    <div className="mx-auto max-w-[95rem] px-3 py-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">World language map</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {formatNumber(points.length)} languages plotted. Marker color = endangerment;
            size = speaker count.
          </p>
        </div>
        <form className="flex items-end gap-2 flex-wrap">
          <label className="text-xs">
            <div className="text-zinc-500 mb-1">Region</div>
            <select name="macroarea" defaultValue={macroarea ?? ''} className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
              <option value="">Any</option>
              {MACROAREAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="text-xs">
            <div className="text-zinc-500 mb-1">Family</div>
            <select name="family" defaultValue={family ?? ''} className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 max-w-[220px]">
              <option value="">Any</option>
              {families.filter((f) => f.level === 'family').map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </label>
          <label className="text-xs">
            <div className="text-zinc-500 mb-1">Endangerment</div>
            <select name="endangerment" defaultValue={aes ?? ''} className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
              <option value="">Any</option>
              {Object.entries(ENDANGERMENT_LABELS).map(([v, info]) => <option key={v} value={v}>{info.label}</option>)}
            </select>
          </label>
          <button className="px-4 py-1.5 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm font-medium">Apply</button>
        </form>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden" style={{ height: '70vh', minHeight: 500 }}>
        <WorldMap points={points} />
      </div>

      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs p-3 mt-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <span className="text-zinc-500 font-medium">Legend:</span>
      {Object.entries(ENDANGERMENT_LABELS).map(([aes, info]) => {
        const colors: Record<number, string> = { 1: '#10b981', 2: '#eab308', 3: '#f97316', 4: '#ef4444', 5: '#b91c1c', 6: '#52525b' };
        return (
          <span key={aes} className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: colors[Number(aes)] }} />
            {info.label}
          </span>
        );
      })}
    </div>
  );
}
