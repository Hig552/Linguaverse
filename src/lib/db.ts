import 'server-only';
import Database, { type Database as DB } from 'better-sqlite3';
import path from 'node:path';

/**
 * better-sqlite3 is synchronous. We open the database once per process and
 * reuse it across Server Component requests. Next.js dev mode may hot-reload,
 * so we stash the handle on globalThis to avoid leaking file handles.
 */

declare global {
  var __linguaverseDb: DB | undefined;
}

const DB_PATH = process.env.LINGUAVERSE_DB_PATH
  ?? path.join(process.cwd(), 'data/linguaverse.db');

export function getDb(): DB {
  if (!globalThis.__linguaverseDb) {
    const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
    db.pragma('journal_mode = WAL');
    db.pragma('query_only = ON');
    globalThis.__linguaverseDb = db;
  }
  return globalThis.__linguaverseDb;
}

export type { Languoid, AltName } from './constants';
export { LEVELS, MACROAREAS, ENDANGERMENT_LABELS, MED_LABELS } from './constants';
