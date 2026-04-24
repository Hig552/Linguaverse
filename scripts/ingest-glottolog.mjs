#!/usr/bin/env node
// Ingests Glottolog 5.3 CLDF data into a SQLite database.
// Sources: https://github.com/glottolog/glottolog-cldf (CC-BY-4.0)
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import Database from 'better-sqlite3';

const DATA_DIR = path.join(process.cwd(), 'data-raw/glottolog-cldf-5.3/cldf');
const DB_PATH = path.join(process.cwd(), 'data/linguaverse.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

console.log('Creating schema...');
db.exec(`
CREATE TABLE languoids (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  iso639_3 TEXT,
  level TEXT NOT NULL,          -- family | language | dialect
  category TEXT,                -- Language | Dialect | Sign Language | Pidgin | Mixed Language | Artificial Language | Unattested | etc.
  macroarea TEXT,
  latitude REAL,
  longitude REAL,
  countries TEXT,               -- semicolon-separated country codes
  family_id TEXT,
  parent_id TEXT,               -- immediate parent in genealogical tree
  closest_iso TEXT,
  is_isolate INTEGER,           -- 0/1
  first_year_doc INTEGER,
  last_year_doc INTEGER,
  aes INTEGER,                  -- Agglomerated Endangerment Status 1 (safe) - 6 (extinct)
  aes_label TEXT,               -- not endangered | threatened | shifting | moribund | nearly extinct | extinct
  med INTEGER,                  -- Most Extensive Description 0 (long grammar) - 4 (wordlist or less)
  med_label TEXT,
  classification TEXT,          -- slash-separated glottocode path
  depth INTEGER,                -- classification depth (0 = top-level family/isolate)
  speaker_count INTEGER,        -- L1+L2 speakers (from Wikidata if available)
  speakers_l1 INTEGER,
  speakers_l2 INTEGER,
  script TEXT,                  -- primary writing system
  wikipedia_url TEXT,
  description TEXT
);
CREATE INDEX idx_lang_level ON languoids(level);
CREATE INDEX idx_lang_family ON languoids(family_id);
CREATE INDEX idx_lang_parent ON languoids(parent_id);
CREATE INDEX idx_lang_macro ON languoids(macroarea);
CREATE INDEX idx_lang_name ON languoids(name);
CREATE INDEX idx_lang_iso ON languoids(iso639_3);
CREATE INDEX idx_lang_aes ON languoids(aes);
CREATE INDEX idx_lang_speakers ON languoids(speaker_count);

CREATE TABLE alt_names (
  languoid_id TEXT NOT NULL,
  provider TEXT NOT NULL,       -- e.g. glottolog, iso, ethnologue, wikipedia, cldr
  lang TEXT,                    -- language of the name (e.g. 'en', 'ar')
  name TEXT NOT NULL,
  PRIMARY KEY (languoid_id, provider, lang, name),
  FOREIGN KEY (languoid_id) REFERENCES languoids(id)
);
CREATE INDEX idx_altname_lang ON alt_names(languoid_id);
CREATE INDEX idx_altname_name ON alt_names(name);

CREATE TABLE countries (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE languoid_countries (
  languoid_id TEXT NOT NULL,
  country_code TEXT NOT NULL,
  PRIMARY KEY (languoid_id, country_code)
);
CREATE INDEX idx_lc_country ON languoid_countries(country_code);

-- Materialised helper table for FTS-ish lookups
CREATE VIRTUAL TABLE languoids_fts USING fts5(
  id UNINDEXED,
  name,
  iso639_3,
  names,
  content=''
);

CREATE TABLE meta (
  key TEXT PRIMARY KEY,
  value TEXT
);
`);

function readCsv(name) {
  const raw = fs.readFileSync(path.join(DATA_DIR, name));
  return parse(raw, { columns: true, skip_empty_lines: true, bom: true });
}

console.log('Loading languages.csv...');
const languages = readCsv('languages.csv');
console.log(`  ${languages.length} languoid rows`);

console.log('Loading values.csv...');
const values = readCsv('values.csv');
console.log(`  ${values.length} value rows`);

// Build value map: Language_ID -> { Parameter_ID -> Value }
const valueMap = new Map();
for (const v of values) {
  let m = valueMap.get(v.Language_ID);
  if (!m) { m = {}; valueMap.set(v.Language_ID, m); }
  m[v.Parameter_ID] = v.Value;
}

console.log('Loading codes.csv...');
const codes = readCsv('codes.csv');
const codeLabels = new Map();
for (const c of codes) codeLabels.set(c.ID, { name: c.Name, numeric: c.numerical_value });

function classifyDepth(cls) {
  if (!cls) return 0;
  return cls.split('/').length - 1;
}

console.log('Inserting languoids...');
const insertLang = db.prepare(`INSERT INTO languoids (
  id, name, iso639_3, level, category, macroarea, latitude, longitude, countries,
  family_id, parent_id, closest_iso, is_isolate, first_year_doc, last_year_doc,
  aes, aes_label, med, med_label, classification, depth
) VALUES (
  @id, @name, @iso639_3, @level, @category, @macroarea, @latitude, @longitude, @countries,
  @family_id, @parent_id, @closest_iso, @is_isolate, @first_year_doc, @last_year_doc,
  @aes, @aes_label, @med, @med_label, @classification, @depth
)`);

const insertAlt = db.prepare(`INSERT OR IGNORE INTO alt_names (languoid_id, provider, lang, name) VALUES (?, ?, ?, ?)`);
const insertCountry = db.prepare(`INSERT OR IGNORE INTO countries (code, name) VALUES (?, ?)`);
const insertLC = db.prepare(`INSERT OR IGNORE INTO languoid_countries (languoid_id, country_code) VALUES (?, ?)`);
const insertFts = db.prepare(`INSERT INTO languoids_fts(id, name, iso639_3, names) VALUES (?, ?, ?, ?)`);

// ISO 3166-1 alpha-2 country names (minimal subset – populated later).
// We only really need the set to preserve codes; we will fill names from a static lookup.
const countryNames = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts/country-names.json'), 'utf-8'));

const tx = db.transaction(() => {
  for (const L of languages) {
    const vm = valueMap.get(L.ID) ?? {};
    const aesValue = vm.aes ?? null; // value like 'not endangered'
    const medValue = vm.med ?? null;
    const classification = vm.classification ?? null;

    const aesCode = codes.find((c) => c.Parameter_ID === 'aes' && c.Name === aesValue);
    const medCode = codes.find((c) => c.Parameter_ID === 'med' && c.Name === medValue);

    const categoryValue = vm.category ?? null;
    const level = L.Level || 'language';

    const parts = classification ? classification.split('/') : [];
    const parent_id = parts.length ? parts[parts.length - 1] : null;

    insertLang.run({
      id: L.ID,
      name: L.Name,
      iso639_3: L.ISO639P3code || null,
      level,
      category: categoryValue,
      macroarea: L.Macroarea || null,
      latitude: L.Latitude ? Number(L.Latitude) : null,
      longitude: L.Longitude ? Number(L.Longitude) : null,
      countries: L.Countries || null,
      family_id: L.Family_ID || null,
      parent_id: parent_id && parent_id !== L.ID ? parent_id : (L.Family_ID || null),
      closest_iso: L.Closest_ISO369P3code || null,
      is_isolate: Number(L.Is_Isolate) ? 1 : 0,
      first_year_doc: L.First_Year_Of_Documentation ? Number(L.First_Year_Of_Documentation) : null,
      last_year_doc: L.Last_Year_Of_Documentation ? Number(L.Last_Year_Of_Documentation) : null,
      aes: aesCode ? Number(aesCode.numerical_value) : null,
      aes_label: aesValue,
      med: medCode ? Number(medCode.numerical_value) : null,
      med_label: medValue,
      classification,
      depth: classifyDepth(classification),
    });

    // Countries: Glottolog "Countries" field may be semicolon-separated "Code (Name)".
    if (L.Countries) {
      for (const part of String(L.Countries).split(';').map((s) => s.trim()).filter(Boolean)) {
        const code = part.replace(/\s*\(.*\)$/, '').trim();
        const name = countryNames[code] ?? code;
        if (code) {
          insertCountry.run(code, name);
          insertLC.run(L.ID, code);
        }
      }
    }

    insertFts.run(L.ID, L.Name, L.ISO639P3code || '', L.Name);
  }
});
tx();

console.log('Loading names.csv (this is large)...');
const names = readCsv('names.csv');
console.log(`  ${names.length} alt names`);

const altTx = db.transaction(() => {
  for (const n of names) {
    if (!n.Language_ID || !n.Name) continue;
    insertAlt.run(n.Language_ID, n.Provider || 'glottolog', n.lang || '', n.Name);
  }
});
altTx();

// Rebuild FTS including alt names per languoid
console.log('Building FTS index...');
db.exec(`DROP TABLE languoids_fts;
CREATE VIRTUAL TABLE languoids_fts USING fts5(id UNINDEXED, name, iso639_3, names);`);
const buildFts = db.prepare(`
  INSERT INTO languoids_fts(id, name, iso639_3, names)
  SELECT l.id, l.name, COALESCE(l.iso639_3, ''), COALESCE(GROUP_CONCAT(DISTINCT a.name), '')
  FROM languoids l
  LEFT JOIN alt_names a ON a.languoid_id = l.id
  GROUP BY l.id
`);
buildFts.run();

// Meta
db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run('glottolog_version', '5.3');
db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run('ingested_at', new Date().toISOString());

// Summary
const counts = db.prepare(`SELECT level, COUNT(*) AS n FROM languoids GROUP BY level`).all();
console.log('Counts by level:', counts);
const macros = db.prepare(`SELECT macroarea, COUNT(*) AS n FROM languoids WHERE level='language' GROUP BY macroarea ORDER BY n DESC`).all();
console.log('Languages by macroarea:', macros);

db.close();
console.log('Done. Database at', DB_PATH);
