import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleSearchLandRules } from '../../src/tools/search-land-rules.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-search-land.db';

describe('search_land_rules tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns results for houtopstand query', () => {
    const result = handleSearchLandRules(db, { query: 'houtopstand' });
    expect(result).toHaveProperty('results_count');
    expect((result as { results_count: number }).results_count).toBeGreaterThan(0);
  });

  test('returns results for kap query', () => {
    const result = handleSearchLandRules(db, { query: 'kap' });
    expect(result).toHaveProperty('results_count');
    expect((result as { results_count: number }).results_count).toBeGreaterThan(0);
  });

  test('respects topic filter', () => {
    const result = handleSearchLandRules(db, { query: 'vergunning', topic: 'sssi' });
    const typedResult = result as { results: { topic: string }[] };
    expect(typedResult.results.length).toBeGreaterThan(0);
    for (const r of typedResult.results) {
      expect(r.topic).toBe('sssi');
    }
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleSearchLandRules(db, { query: 'houtopstand', jurisdiction: 'FR' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });

  test('limits results', () => {
    const result = handleSearchLandRules(db, { query: 'kap OR pacht OR natura OR bos OR pad OR subsidie', limit: 3 });
    const typedResult = result as { results: unknown[] };
    expect(typedResult.results.length).toBeLessThanOrEqual(3);
  });
});
