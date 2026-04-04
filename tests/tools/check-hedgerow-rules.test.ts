import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleCheckHedgerowRules } from '../../src/tools/check-hedgerow-rules.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-hedgerow.db';

describe('check_hedgerow_rules tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns rules for remove action', () => {
    const result = handleCheckHedgerowRules(db, { action: 'remove' });
    const typed = result as { results_count: number; results: { action: string; notice_required: boolean }[] };
    expect(typed.results_count).toBeGreaterThan(0);
    // At least one removal rule requires notice
    const noticeRequired = typed.results.some(r => r.notice_required === true);
    expect(noticeRequired).toBe(true);
  });

  test('returns rules for trim action', () => {
    const result = handleCheckHedgerowRules(db, { action: 'trim' });
    const typed = result as { results: { notice_required: boolean }[] };
    expect(typed.results.length).toBeGreaterThan(0);
    // Trimming does not require notice
    expect(typed.results[0].notice_required).toBe(false);
  });

  test('returns all rules for unknown action', () => {
    const result = handleCheckHedgerowRules(db, { action: 'xyz_nonexistent' });
    const typed = result as { note: string; results_count: number };
    expect(typed.note).toContain('No exact match');
    expect(typed.results_count).toBeGreaterThan(0);
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleCheckHedgerowRules(db, { action: 'remove', jurisdiction: 'SE' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });

  test('penalty data is present', () => {
    const result = handleCheckHedgerowRules(db, { action: 'remove' });
    const typed = result as { results: { penalties: string }[] };
    const withPenalty = typed.results.filter(r => r.penalties && r.penalties.includes('25,000'));
    expect(withPenalty.length).toBeGreaterThan(0);
  });
});
