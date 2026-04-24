import 'server-only';
import { getDb, type Languoid, type AltName, MACROAREAS } from './db';

export interface LanguageSearchParams {
  q?: string;
  level?: 'family' | 'language' | 'dialect';
  macroarea?: string;
  country?: string;
  family?: string;
  endangerment?: number;
  minSpeakers?: number;
  maxSpeakers?: number;
  script?: string;
  hasCoordinates?: boolean;
  isolate?: boolean;
  orderBy?: 'name' | 'speakers' | 'endangerment';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  items: Languoid[];
  total: number;
}

function escapeFtsQuery(q: string): string {
  // Match any token prefix.
  return q
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `"${w.replace(/"/g, '""')}"*`)
    .join(' ');
}

export function searchLanguoids(params: LanguageSearchParams): SearchResult {
  const db = getDb();
  const where: string[] = [];
  const args: Record<string, unknown> = {};

  if (params.q && params.q.trim()) {
    where.push(`l.id IN (SELECT id FROM languoids_fts WHERE languoids_fts MATCH @q)`);
    args.q = escapeFtsQuery(params.q);
  }
  if (params.level) {
    where.push('l.level = @level');
    args.level = params.level;
  }
  if (params.macroarea) {
    where.push('l.macroarea = @macroarea');
    args.macroarea = params.macroarea;
  }
  if (params.country) {
    where.push('EXISTS (SELECT 1 FROM languoid_countries lc WHERE lc.languoid_id = l.id AND lc.country_code = @country)');
    args.country = params.country;
  }
  if (params.family) {
    where.push('l.family_id = @family');
    args.family = params.family;
  }
  if (params.endangerment !== undefined) {
    where.push('l.aes = @endangerment');
    args.endangerment = params.endangerment;
  }
  if (params.minSpeakers !== undefined) {
    where.push('l.speaker_count >= @minSpeakers');
    args.minSpeakers = params.minSpeakers;
  }
  if (params.maxSpeakers !== undefined) {
    where.push('l.speaker_count <= @maxSpeakers');
    args.maxSpeakers = params.maxSpeakers;
  }
  if (params.script) {
    where.push("(l.script LIKE @script)");
    args.script = `%${params.script}%`;
  }
  if (params.hasCoordinates) {
    where.push('l.latitude IS NOT NULL AND l.longitude IS NOT NULL');
  }
  if (params.isolate) {
    where.push('l.is_isolate = 1');
  }

  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

  let orderSql = 'ORDER BY l.name ASC';
  if (params.orderBy === 'speakers') {
    orderSql = `ORDER BY l.speaker_count ${params.order === 'asc' ? 'ASC' : 'DESC'} NULLS LAST`;
  } else if (params.orderBy === 'endangerment') {
    orderSql = `ORDER BY l.aes ${params.order === 'asc' ? 'ASC' : 'DESC'} NULLS LAST`;
  } else if (params.order === 'desc') {
    orderSql = 'ORDER BY l.name DESC';
  }

  const limit = Math.min(params.limit ?? 50, 500);
  const offset = params.offset ?? 0;

  const items = db.prepare(
    `SELECT l.* FROM languoids l ${whereSql} ${orderSql} LIMIT ${limit} OFFSET ${offset}`
  ).all(args) as Languoid[];

  const total = (db.prepare(
    `SELECT COUNT(*) AS n FROM languoids l ${whereSql}`
  ).get(args) as { n: number }).n;

  return { items, total };
}

export function getLanguoid(id: string): Languoid | null {
  const db = getDb();
  return db.prepare('SELECT * FROM languoids WHERE id = ?').get(id) as Languoid | null;
}

export function getLanguoidByIso(iso: string): Languoid | null {
  const db = getDb();
  return db.prepare("SELECT * FROM languoids WHERE iso639_3 = ? AND level='language' LIMIT 1").get(iso) as Languoid | null;
}

export function getChildren(id: string): Languoid[] {
  const db = getDb();
  return db.prepare('SELECT * FROM languoids WHERE parent_id = ? ORDER BY level, name').all(id) as Languoid[];
}

export function getAncestors(id: string): Languoid[] {
  const db = getDb();
  const rec = db.prepare('SELECT classification FROM languoids WHERE id = ?').get(id) as { classification: string } | undefined;
  if (!rec?.classification) return [];
  const ids = rec.classification.split('/').filter(Boolean);
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  const rows = db.prepare(`SELECT * FROM languoids WHERE id IN (${placeholders})`).all(...ids) as Languoid[];
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.map((i) => byId.get(i)).filter(Boolean) as Languoid[];
}

export function getAltNames(id: string): AltName[] {
  const db = getDb();
  return db.prepare('SELECT * FROM alt_names WHERE languoid_id = ? ORDER BY provider, lang, name').all(id) as AltName[];
}

export function getCountries(id: string): Array<{ code: string; name: string }> {
  const db = getDb();
  return db.prepare(`
    SELECT c.code, c.name FROM languoid_countries lc
    JOIN countries c ON c.code = lc.country_code
    WHERE lc.languoid_id = ?
    ORDER BY c.name
  `).all(id) as Array<{ code: string; name: string }>;
}

export function getSubtreeLanguages(familyId: string): Languoid[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM languoids
    WHERE (classification LIKE ? OR family_id = ?)
      AND level='language'
    ORDER BY name
  `).all(`%${familyId}%`, familyId) as Languoid[];
}

export function getTopLevelFamilies(): Languoid[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM languoids
    WHERE level='family' AND (classification IS NULL OR classification='')
    ORDER BY name
  `).all() as Languoid[];
}

export function getStats(): {
  totals: Record<string, number>;
  byMacroarea: Array<{ macroarea: string; count: number }>;
  byEndangerment: Array<{ aes: number; label: string; count: number }>;
  topLanguages: Languoid[];
  topFamilies: Array<{ family: Languoid; size: number }>;
  mostEndangered: Languoid[];
  mostDocumented: Languoid[];
  isolates: Languoid[];
  signLanguages: Languoid[];
  totalSpeakers: number;
  glottologVersion: string;
} {
  const db = getDb();
  const totalsRows = db.prepare(`SELECT level, COUNT(*) AS n FROM languoids GROUP BY level`).all() as Array<{ level: string; n: number }>;
  const totals: Record<string, number> = {};
  for (const r of totalsRows) totals[r.level] = r.n;
  totals.total = totalsRows.reduce((a, b) => a + b.n, 0);

  const byMacroarea = db.prepare(`
    SELECT macroarea, COUNT(*) AS count
    FROM languoids
    WHERE level='language' AND macroarea IS NOT NULL
    GROUP BY macroarea
    ORDER BY count DESC
  `).all() as Array<{ macroarea: string; count: number }>;

  const byEndangerment = db.prepare(`
    SELECT aes, aes_label AS label, COUNT(*) AS count
    FROM languoids
    WHERE level='language' AND aes IS NOT NULL
    GROUP BY aes
    ORDER BY aes
  `).all() as Array<{ aes: number; label: string; count: number }>;

  const topLanguages = db.prepare(`
    SELECT * FROM languoids
    WHERE level='language' AND speaker_count IS NOT NULL
    ORDER BY speaker_count DESC
    LIMIT 20
  `).all() as Languoid[];

  const topFamiliesRaw = db.prepare(`
    SELECT family_id, COUNT(*) AS size
    FROM languoids
    WHERE level='language' AND family_id IS NOT NULL
    GROUP BY family_id
    ORDER BY size DESC
    LIMIT 20
  `).all() as Array<{ family_id: string; size: number }>;
  const famIds = topFamiliesRaw.map((r) => r.family_id);
  const famRows = famIds.length ? db.prepare(`SELECT * FROM languoids WHERE id IN (${famIds.map(() => '?').join(',')})`).all(...famIds) as Languoid[] : [];
  const famById = new Map(famRows.map((r) => [r.id, r]));
  const topFamilies = topFamiliesRaw.map((r) => ({ family: famById.get(r.family_id)!, size: r.size })).filter((x) => x.family);

  const mostEndangered = db.prepare(`
    SELECT * FROM languoids
    WHERE level='language' AND aes = 5
    ORDER BY speaker_count ASC NULLS FIRST, name
    LIMIT 20
  `).all() as Languoid[];

  const mostDocumented = db.prepare(`
    SELECT * FROM languoids
    WHERE level='language' AND med = 0
    ORDER BY speaker_count DESC NULLS LAST
    LIMIT 20
  `).all() as Languoid[];

  const isolates = db.prepare(`
    SELECT * FROM languoids
    WHERE is_isolate = 1 AND level='language'
    ORDER BY speaker_count DESC NULLS LAST
    LIMIT 20
  `).all() as Languoid[];

  const signLanguages = db.prepare(`
    SELECT * FROM languoids
    WHERE category='Sign Language'
    ORDER BY speaker_count DESC NULLS LAST, name
    LIMIT 20
  `).all() as Languoid[];

  const totalSpeakers = (db.prepare(`
    SELECT COALESCE(SUM(speaker_count), 0) AS n FROM languoids WHERE level='language'
  `).get() as { n: number }).n;

  const glottologVersion = (db.prepare(`SELECT value FROM meta WHERE key='glottolog_version'`).get() as { value: string } | undefined)?.value ?? 'unknown';

  return {
    totals, byMacroarea, byEndangerment,
    topLanguages, topFamilies, mostEndangered, mostDocumented,
    isolates, signLanguages, totalSpeakers, glottologVersion,
  };
}

export interface GeoLanguage {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  macroarea: string | null;
  aes: number | null;
  aes_label: string | null;
  speaker_count: number | null;
  iso639_3: string | null;
}

export function getLanguagesWithCoordinates(opts: { macroarea?: string; family?: string; endangerment?: number } = {}): GeoLanguage[] {
  const db = getDb();
  const where = [`l.level='language'`, `l.latitude IS NOT NULL`, `l.longitude IS NOT NULL`];
  const args: Record<string, unknown> = {};
  if (opts.macroarea) { where.push('l.macroarea = @macroarea'); args.macroarea = opts.macroarea; }
  if (opts.family) { where.push('l.family_id = @family'); args.family = opts.family; }
  if (opts.endangerment !== undefined) { where.push('l.aes = @endangerment'); args.endangerment = opts.endangerment; }
  return db.prepare(`
    SELECT id, name, latitude, longitude, macroarea, aes, aes_label, speaker_count, iso639_3
    FROM languoids l
    WHERE ${where.join(' AND ')}
  `).all(args) as GeoLanguage[];
}

export function getAllMacroareas(): string[] {
  return MACROAREAS.slice();
}

export function getSubtreeStats(familyId: string): { languages: number; dialects: number; subfamilies: number; speakers: number; endangered: number } {
  const db = getDb();
  const rows = db.prepare(`
    SELECT level, COUNT(*) AS n, COALESCE(SUM(speaker_count), 0) AS speakers,
           SUM(CASE WHEN aes IS NOT NULL AND aes >= 3 THEN 1 ELSE 0 END) AS endangered
    FROM languoids
    WHERE (classification LIKE ? OR id = ?)
      AND id <> ?
    GROUP BY level
  `).all(`%${familyId}%`, familyId, familyId) as Array<{ level: string; n: number; speakers: number; endangered: number }>;
  const out = { languages: 0, dialects: 0, subfamilies: 0, speakers: 0, endangered: 0 };
  for (const r of rows) {
    if (r.level === 'language') { out.languages = r.n; out.speakers += r.speakers; out.endangered += r.endangered; }
    else if (r.level === 'dialect') out.dialects = r.n;
    else if (r.level === 'family') out.subfamilies = r.n;
  }
  return out;
}

export function getCountryLanguages(code: string): Languoid[] {
  const db = getDb();
  return db.prepare(`
    SELECT l.* FROM languoids l
    JOIN languoid_countries lc ON lc.languoid_id = l.id
    WHERE lc.country_code = ? AND l.level='language'
    ORDER BY l.speaker_count DESC NULLS LAST, l.name
  `).all(code) as Languoid[];
}

export function getAllCountries(): Array<{ code: string; name: string; languages: number }> {
  const db = getDb();
  return db.prepare(`
    SELECT c.code, c.name, COUNT(DISTINCT lc.languoid_id) AS languages
    FROM countries c
    JOIN languoid_countries lc ON lc.country_code = c.code
    JOIN languoids l ON l.id = lc.languoid_id AND l.level='language'
    GROUP BY c.code, c.name
    ORDER BY c.name
  `).all() as Array<{ code: string; name: string; languages: number }>;
}

export function getAllScripts(): Array<{ script: string; count: number }> {
  const db = getDb();
  const rows = db.prepare(`
    SELECT script FROM languoids WHERE script IS NOT NULL AND level='language'
  `).all() as Array<{ script: string }>;
  const map = new Map<string, number>();
  for (const r of rows) {
    for (const s of String(r.script).split(',').map((x) => x.trim()).filter(Boolean)) {
      map.set(s, (map.get(s) ?? 0) + 1);
    }
  }
  return [...map.entries()].map(([script, count]) => ({ script, count })).sort((a, b) => b.count - a.count);
}
