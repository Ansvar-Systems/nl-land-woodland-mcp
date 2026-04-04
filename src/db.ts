import BetterSqlite3 from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export interface Database {
  get<T>(sql: string, params?: unknown[]): T | undefined;
  all<T>(sql: string, params?: unknown[]): T[];
  run(sql: string, params?: unknown[]): void;
  close(): void;
  readonly instance: BetterSqlite3.Database;
}

export function createDatabase(dbPath?: string): Database {
  const resolvedPath =
    dbPath ??
    join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'database.db');
  const db = new BetterSqlite3(resolvedPath);

  db.pragma('journal_mode = DELETE');
  db.pragma('foreign_keys = ON');

  initSchema(db);

  return {
    get<T>(sql: string, params: unknown[] = []): T | undefined {
      return db.prepare(sql).get(...params) as T | undefined;
    },
    all<T>(sql: string, params: unknown[] = []): T[] {
      return db.prepare(sql).all(...params) as T[];
    },
    run(sql: string, params: unknown[] = []): void {
      db.prepare(sql).run(...params);
    },
    close(): void {
      db.close();
    },
    get instance() {
      return db;
    },
  };
}

function initSchema(db: BetterSqlite3.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS hedgerow_rules (
      id INTEGER PRIMARY KEY,
      action TEXT NOT NULL,
      notice_required INTEGER,
      exemptions TEXT,
      important_hedgerow_criteria TEXT,
      penalties TEXT,
      regulation_ref TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'NL'
    );

    CREATE TABLE IF NOT EXISTS felling_rules (
      id INTEGER PRIMARY KEY,
      scenario TEXT NOT NULL,
      licence_required INTEGER,
      threshold_m3 REAL,
      threshold_ha REAL,
      exemptions TEXT,
      application_process TEXT,
      penalties TEXT,
      regulation_ref TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'NL'
    );

    CREATE TABLE IF NOT EXISTS sssi_operations (
      id INTEGER PRIMARY KEY,
      operation TEXT NOT NULL,
      consent_required INTEGER,
      process TEXT,
      typical_conditions TEXT,
      penalties TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'NL'
    );

    CREATE TABLE IF NOT EXISTS rights_of_way (
      id INTEGER PRIMARY KEY,
      path_type TEXT NOT NULL,
      obligation TEXT NOT NULL,
      min_width_m REAL,
      cropping_rules TEXT,
      reinstatement_deadline TEXT,
      obstruction_liability TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'NL'
    );

    CREATE TABLE IF NOT EXISTS common_land_rules (
      id INTEGER PRIMARY KEY,
      activity TEXT NOT NULL,
      consent_required INTEGER,
      consent_authority TEXT,
      process TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'NL'
    );

    CREATE TABLE IF NOT EXISTS planting_guidance (
      id INTEGER PRIMARY KEY,
      purpose TEXT,
      species_group TEXT,
      min_area_ha REAL,
      eia_screening_required INTEGER,
      grant_available TEXT,
      ancient_woodland_buffer_m INTEGER,
      jurisdiction TEXT NOT NULL DEFAULT 'NL'
    );

    CREATE TABLE IF NOT EXISTS tpo_rules (
      id INTEGER PRIMARY KEY,
      scenario TEXT NOT NULL,
      consent_required INTEGER,
      consent_authority TEXT,
      exemptions TEXT,
      process TEXT,
      penalties TEXT,
      regulation_ref TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'NL'
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
      title, body, topic, jurisdiction
    );

    CREATE TABLE IF NOT EXISTS db_metadata (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    INSERT OR IGNORE INTO db_metadata (key, value) VALUES ('schema_version', '1.0');
    INSERT OR IGNORE INTO db_metadata (key, value) VALUES ('mcp_name', 'Netherlands Land & Woodland Management MCP');
    INSERT OR IGNORE INTO db_metadata (key, value) VALUES ('jurisdiction', 'NL');
  `);
}

export function ftsSearch(
  db: Database,
  query: string,
  limit: number = 20
): { title: string; body: string; topic: string; jurisdiction: string; rank: number }[] {
  return db.all(
    `SELECT title, body, topic, jurisdiction, rank
     FROM search_index
     WHERE search_index MATCH ?
     ORDER BY rank
     LIMIT ?`,
    [query, limit]
  );
}
