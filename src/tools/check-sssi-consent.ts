import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface SSSIArgs {
  activity: string;
  jurisdiction?: string;
}

export function handleCheckSSSIConsent(db: Database, args: SSSIArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = 'SELECT * FROM sssi_operations WHERE LOWER(operation) LIKE LOWER(?) AND jurisdiction = ?';
  const params: unknown[] = [`%${args.activity}%`, jv.jurisdiction];

  const ops = db.all<{
    id: number;
    operation: string;
    consent_required: number;
    process: string;
    typical_conditions: string;
    penalties: string;
    jurisdiction: string;
  }>(sql, params);

  if (ops.length === 0) {
    // Fall back to showing all operations
    const allOps = db.all<{
      id: number;
      operation: string;
      consent_required: number;
      process: string;
      typical_conditions: string;
      penalties: string;
      jurisdiction: string;
    }>('SELECT * FROM sssi_operations WHERE jurisdiction = ? ORDER BY id', [jv.jurisdiction]);

    return {
      query: args.activity,
      jurisdiction: jv.jurisdiction,
      note: `No exact match for '${args.activity}'. Showing all SSSI operations requiring consent.`,
      results_count: allOps.length,
      results: allOps.map(r => ({
        operation: r.operation,
        consent_required: r.consent_required === 1,
        process: r.process,
        typical_conditions: r.typical_conditions,
        penalties: r.penalties,
      })),
      _meta: buildMeta({ source_url: 'https://www.legislation.gov.uk/ukpga/1981/69/contents' }),
    };
  }

  return {
    query: args.activity,
    jurisdiction: jv.jurisdiction,
    results_count: ops.length,
    results: ops.map(r => ({
      operation: r.operation,
      consent_required: r.consent_required === 1,
      process: r.process,
      typical_conditions: r.typical_conditions,
      penalties: r.penalties,
    })),
    _meta: buildMeta({ source_url: 'https://www.legislation.gov.uk/ukpga/1981/69/contents' }),
  };
}
