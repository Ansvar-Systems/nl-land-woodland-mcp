import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleGetFellingLicenceRules } from '../../src/tools/get-felling-licence-rules.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-felling.db';

describe('get_felling_licence_rules tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns all rules when no filters', () => {
    const result = handleGetFellingLicenceRules(db, {});
    const typed = result as { results_count: number };
    expect(typed.results_count).toBeGreaterThan(5);
  });

  test('filters by reason (gevaarlijk/noodkap)', () => {
    const result = handleGetFellingLicenceRules(db, { reason: 'Gevaarlijke' });
    const typed = result as { results: { scenario: string }[] };
    expect(typed.results.length).toBeGreaterThan(0);
    expect(typed.results[0].scenario.toLowerCase()).toContain('gevaarlijke');
  });

  test('filters by reason (fruit)', () => {
    const result = handleGetFellingLicenceRules(db, { reason: 'Fruit' });
    const typed = result as { results: { scenario: string; licence_required: boolean }[] };
    expect(typed.results.length).toBeGreaterThan(0);
    // Fruitbomen are exempt
    expect(typed.results[0].licence_required).toBe(false);
  });

  test('returns herplantplicht rules', () => {
    const result = handleGetFellingLicenceRules(db, { reason: 'Herplant' });
    const typed = result as { results: { scenario: string }[] };
    expect(typed.results.length).toBeGreaterThan(0);
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleGetFellingLicenceRules(db, { jurisdiction: 'DE' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });
});
