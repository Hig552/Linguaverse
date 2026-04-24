import Link from "next/link";
import { getAllCountries } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

export const metadata = { title: "Countries" };

export default async function CountriesPage() {
  const countries = getAllCountries();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Languages by country</h1>
      <p className="text-sm text-zinc-500 mt-1">
        {formatNumber(countries.length)} countries/territories with at least one documented language.
      </p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {countries.map((c) => (
          <Link key={c.code} href={`/countries/${c.code}`} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 hover:border-sky-400 flex items-center justify-between">
            <span>
              <span className="font-mono text-[10px] text-zinc-500 mr-2">{c.code}</span>
              <span className="font-medium">{c.name}</span>
            </span>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">{formatNumber(c.languages)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
