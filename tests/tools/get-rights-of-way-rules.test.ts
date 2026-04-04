import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleGetRightsOfWayRules } from '../../src/tools/get-rights-of-way-rules.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-rights-of-way.db';

describe('get_rights_of_way_rules tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns all path types when no filter', () => {
    const result = handleGetRightsOfWayRules(db, {});
    const typed = result as { results_count: number };
    expect(typed.results_count).toBeGreaterThan(3);
  });

  test('filters by Klompenpad type', () => {
    const result = handleGetRightsOfWayRules(db, { path_type: 'Klompenpad' });
    const typed = result as { results: { path_type: string; min_width_m: number }[] };
    expect(typed.results.length).toBeGreaterThan(0);
    expect(typed.results[0].min_width_m).toBe(1.0);
  });

  test('Ruiterpad has correct minimum width', () => {
    const result = handleGetRightsOfWayRules(db, { path_type: 'Ruiterpad' });
    const typed = result as { results: { min_width_m: number }[] };
    expect(typed.results.length).toBeGreaterThan(0);
    expect(typed.results[0].min_width_m).toBe(3.0);
  });

  test('reinstatement deadline is present for openbaar voetpad', () => {
    const result = handleGetRightsOfWayRules(db, { path_type: 'Openbaar voetpad' });
    const typed = result as { results: { reinstatement_deadline: string }[] };
    expect(typed.results[0].reinstatement_deadline).toContain('14 dagen');
  });

  test('filters by issue keyword', () => {
    const result = handleGetRightsOfWayRules(db, { issue: 'bestuursdwang' });
    const typed = result as { results: { obstruction_liability: string }[] };
    expect(typed.results.length).toBeGreaterThan(0);
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleGetRightsOfWayRules(db, { jurisdiction: 'GB' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });
});
