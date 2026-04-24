import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { Search } from "lucide-react";
import "./globals.css";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Linguaverse — Comprehensive Language Atlas",
    template: "%s · Linguaverse",
  },
  description:
    "An open, free atlas of the world's languages. Browse 27,000+ languoids, 8,500+ languages, 240+ language families with speaker counts, endangerment status, writing systems, maps, comparisons and a free public API.",
  keywords: [
    "languages", "linguistics", "language atlas", "ethnologue alternative",
    "glottolog", "endangered languages", "language families",
  ],
};

const NAV_LINKS = [
  { href: "/languages", label: "Languages" },
  { href: "/families",  label: "Families" },
  { href: "/countries", label: "Countries" },
  { href: "/map",       label: "Map" },
  { href: "/stats",     label: "Statistics" },
  { href: "/compare",   label: "Compare" },
  { href: "/api",       label: "API" },
  { href: "/about",     label: "About" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col">
        <header className="sticky top-0 z-30 border-b border-zinc-200/70 dark:border-zinc-800/70 backdrop-blur bg-white/75 dark:bg-zinc-950/75">
          <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-6">
            <Link href="/" className="font-bold tracking-tight text-lg flex items-center gap-2">
              <span className="inline-block w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 via-sky-400 to-indigo-500" />
              Linguaverse
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-sm">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href}
                  className="px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/80">
                  {l.label}
                </Link>
              ))}
            </nav>
            <form action="/languages" className="ml-auto flex-1 max-w-xs">
              <label className="relative flex items-center">
                <Search className="absolute left-2.5 w-4 h-4 text-zinc-400" />
                <input
                  name="q"
                  placeholder="Search 27,000+ languages…"
                  className="w-full pl-8 pr-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none focus:ring-2 ring-sky-500/40"
                />
              </label>
            </form>
          </div>
          <nav className="md:hidden border-t border-zinc-200 dark:border-zinc-800 overflow-x-auto">
            <div className="mx-auto max-w-7xl px-4 flex items-center gap-1 text-sm whitespace-nowrap py-1">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href}
                  className="px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/80">
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
            <div>
              <div className="font-semibold mb-2">Linguaverse</div>
              <p className="text-zinc-600 dark:text-zinc-400">
                A free, open atlas of the world&apos;s languages. Richer than the paywalled
                alternatives — with maps, statistics, comparisons, and a public API.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-2">Browse</div>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                <li><Link href="/languages">All languages</Link></li>
                <li><Link href="/families">Language families</Link></li>
                <li><Link href="/countries">Countries</Link></li>
                <li><Link href="/map">World map</Link></li>
                <li><Link href="/stats">Statistics</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2">Tools</div>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                <li><Link href="/compare">Language comparison</Link></li>
                <li><Link href="/api">Public REST API</Link></li>
                <li><Link href="/endangered">Endangered languages</Link></li>
                <li><Link href="/isolates">Language isolates</Link></li>
                <li><Link href="/sign-languages">Sign languages</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2">Data sources</div>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                <li><a href="https://glottolog.org" target="_blank" rel="noreferrer">Glottolog 5.3</a> (CC-BY-4.0)</li>
                <li><a href="https://www.wikidata.org" target="_blank" rel="noreferrer">Wikidata</a> (CC0)</li>
                <li><a href="https://iso639-3.sil.org" target="_blank" rel="noreferrer">ISO 639-3</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-800 py-4 text-xs text-center text-zinc-500">
            Linguaverse is an independent project. Not affiliated with SIL International or Ethnologue.
          </div>
        </footer>
      </body>
    </html>
  );
}
