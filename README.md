# Linguaverse

A free, open atlas of the world's languages — the proprietary-free alternative to Ethnologue.

Linguaverse aggregates data from **Glottolog 5.3** (CC-BY-4.0), **Wikidata** (CC0) and the
**ISO 639-3** registry into a single fast website and public REST API, with features no
paid alternative offers for free:

- 27,000+ languoids — **8,600+ languages**, **13,700+ dialects**, **4,850+ families**
- Interactive world map with filter by family/region/endangerment
- Full-text search with typeahead
- Advanced filters (region, family, endangerment, speakers, writing system, isolates…)
- Side-by-side comparison of up to 5 languages
- Per-country language browser (240+ countries/territories)
- Genealogical tree viewer for every family
- Global stats dashboard with charts
- Free, CORS-enabled **public REST API** at `/api/*`
- CSV export on every list page

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4** for styling
- **better-sqlite3** — single-file, read-only SQLite for deploy-anywhere data access
- **Leaflet** for the interactive maps
- **Recharts** for stats visualisations

The production build uses React Server Components to query SQLite directly —
no API layer, no client-side hydration for data, sub-100ms TTFB.

## Getting started

```bash
npm install

# Rebuild the SQLite database from upstream sources (one-time, ~5 min):
node scripts/ingest-glottolog.mjs   # downloads & ingests Glottolog CLDF 5.3 → data/linguaverse.db
node scripts/enrich-wikidata.mjs    # adds speaker counts, scripts, Wikipedia URLs from Wikidata SPARQL

npm run dev   # http://localhost:3000
```

The repository ships with a pre-built `data/linguaverse.db`, so you can skip the ingest
scripts for local development.

## Deploy

Linguaverse deploys cleanly on any Node.js host with a persistent filesystem:

```bash
npm run build
npm run start
```

Works on Fly.io, Railway, Render, a Docker container, or a classic VPS.
Vercel is not recommended because better-sqlite3 needs a real filesystem.

## API

See [`/api`](https://YOUR-DEPLOYED-HOST/api) for full docs. Quick examples:

```bash
# Top 5 languages by speakers
curl 'https://.../api/languages?orderBy=speakers&order=desc&limit=5'

# Every language in the Indo-European family, as CSV
curl 'https://.../api/families/indo1319?format=csv' > indo-european.csv

# Global statistics
curl 'https://.../api/stats' | jq '.totals'
```

CORS is open to all origins. No API key, no rate limit — please cache responses.

## Data & licensing

- **Code:** MIT
- **Data:** inherits upstream licenses — Glottolog is CC-BY-4.0, Wikidata is CC0.
  Please credit Glottolog and Wikidata when republishing Linguaverse data.

Linguaverse is **not** affiliated with or endorsed by SIL International or Ethnologue.

## Contributing

Open a GitHub issue or PR. Good first issues: additional data-source integrations
(PHOIBLE phonology data, WALS grammatical features, OpenStreetMap country polygons).
