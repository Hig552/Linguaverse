#!/usr/bin/env node
// Enriches the Linguaverse database with speaker counts, writing systems,
// Wikipedia URLs, and native names from Wikidata.
// Uses the Wikidata Query Service (SPARQL). CC0 data.
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.join(process.cwd(), 'data/linguaverse.db');
const CACHE_DIR = path.join(process.cwd(), 'data-raw/wikidata-cache');
fs.mkdirSync(CACHE_DIR, { recursive: true });

const endpoint = 'https://query.wikidata.org/sparql';
const UA = 'Linguaverse/0.1 (https://github.com/Hig552/linguaverse; linguistic data aggregator)';

async function sparql(query, cacheKey) {
  const cacheFile = path.join(CACHE_DIR, cacheKey + '.json');
  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }
  const res = await fetch(endpoint + '?query=' + encodeURIComponent(query) + '&format=json', {
    headers: { 'User-Agent': UA, 'Accept': 'application/sparql-results+json' },
  });
  if (!res.ok) throw new Error(`SPARQL ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  const json = await res.json();
  fs.writeFileSync(cacheFile, JSON.stringify(json));
  return json;
}

// Query 1: everything linked to a Glottocode on Wikidata
const QUERY_MAIN = `
SELECT ?item ?glotto ?speakers ?enwiki ?itemLabel ?itemLabelAr WHERE {
  ?item wdt:P1394 ?glotto .
  OPTIONAL { ?item wdt:P1098 ?speakers . }
  OPTIONAL {
    ?enwiki schema:about ?item ;
            schema:isPartOf <https://en.wikipedia.org/> .
  }
  OPTIONAL { ?item rdfs:label ?itemLabel   FILTER(LANG(?itemLabel)   = "en") }
  OPTIONAL { ?item rdfs:label ?itemLabelAr FILTER(LANG(?itemLabelAr) = "ar") }
}
`;

// Query 2: writing systems per language
const QUERY_SCRIPTS = `
SELECT ?glotto ?scriptLabel WHERE {
  ?item wdt:P1394 ?glotto .
  ?item wdt:P282 ?script .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
`;

console.log('Fetching main Wikidata dataset...');
const main = await sparql(QUERY_MAIN, 'main');
const rows = main.results.bindings;
console.log(`  ${rows.length} rows returned`);

console.log('Fetching scripts...');
const scripts = await sparql(QUERY_SCRIPTS, 'scripts');
console.log(`  ${scripts.results.bindings.length} script rows`);

// Aggregate by glotto
const byGlotto = new Map();
for (const r of rows) {
  const g = r.glotto?.value;
  if (!g) continue;
  let entry = byGlotto.get(g);
  if (!entry) { entry = { speakers: null, wikipedia: null, labels: { en: null, ar: null }, scripts: new Set() }; byGlotto.set(g, entry); }
  if (r.speakers?.value) {
    const n = Number(r.speakers.value);
    if (!isNaN(n) && (entry.speakers === null || n > entry.speakers)) entry.speakers = n;
  }
  if (r.enwiki?.value && !entry.wikipedia) entry.wikipedia = r.enwiki.value;
  if (r.itemLabel?.value) entry.labels.en = r.itemLabel.value;
  if (r.itemLabelAr?.value) entry.labels.ar = r.itemLabelAr.value;
}
for (const r of scripts.results.bindings) {
  const g = r.glotto?.value;
  if (!g) continue;
  let entry = byGlotto.get(g);
  if (!entry) { entry = { speakers: null, wikipedia: null, labels: { en: null, ar: null }, scripts: new Set() }; byGlotto.set(g, entry); }
  if (r.scriptLabel?.value) entry.scripts.add(r.scriptLabel.value);
}

console.log(`Glottocodes with Wikidata info: ${byGlotto.size}`);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

const update = db.prepare(`UPDATE languoids
  SET speaker_count = COALESCE(?, speaker_count),
      script        = COALESCE(?, script),
      wikipedia_url = COALESCE(?, wikipedia_url)
  WHERE id = ?`);
const insertAlt = db.prepare(`INSERT OR IGNORE INTO alt_names (languoid_id, provider, lang, name) VALUES (?, ?, ?, ?)`);

// Only keep glottocodes that exist in our languoids table
const existing = new Set(db.prepare('SELECT id FROM languoids').all().map((r) => r.id));
let matched = 0;
const tx = db.transaction(() => {
  for (const [g, e] of byGlotto) {
    if (!existing.has(g)) continue;
    const scripts = [...e.scripts].sort().join(', ') || null;
    const r = update.run(e.speakers, scripts, e.wikipedia, g);
    if (r.changes) matched++;
    if (e.labels.en) insertAlt.run(g, 'wikidata', 'en', e.labels.en);
    if (e.labels.ar) insertAlt.run(g, 'wikidata', 'ar', e.labels.ar);
  }
});
tx();

console.log(`Updated ${matched} languoids with Wikidata info.`);

const top = db.prepare(`SELECT id, name, speaker_count, script FROM languoids WHERE level='language' AND speaker_count IS NOT NULL ORDER BY speaker_count DESC LIMIT 20`).all();
console.log('Top 20 languages by speakers:');
for (const l of top) console.log(`  ${l.name} (${l.id}): ${l.speaker_count?.toLocaleString()} speakers, script=${l.script || '—'}`);

db.close();
