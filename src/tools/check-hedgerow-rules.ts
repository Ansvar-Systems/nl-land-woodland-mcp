import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface HedgerowArgs {
  action: string;
  hedgerow_type?: string;
  jurisdiction?: string;
}

export function handleCheckHedgerowRules(db: Database, args: HedgerowArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = 'SELECT * FROM hedgerow_rules WHERE LOWER(action) LIKE LOWER(?) AND jurisdiction = ?';
  const params: unknown[] = [`%${args.action}%`, jv.jurisdiction];

  const rules = db.all<{
    id: number;
    action: string;
    notice_required: number;
    exemptions: string;
    important_hedgerow_criteria: string;
    penalties: string;
    regulation_ref: string;
    jurisdiction: string;
  }>(sql, params);

  if (rules.length === 0) {
    // Fall back to broader search
    const allRules = db.all<{
      id: number;
      action: string;
      notice_required: number;
      exemptions: string;
      important_hedgerow_criteria: string;
      penalties: string;
      regulation_ref: string;
      jurisdiction: string;
    }>('SELECT * FROM hedgerow_rules WHERE jurisdiction = ? ORDER BY id', [jv.jurisdiction]);

    return {
      query: args.action,
      jurisdiction: jv.jurisdiction,
      note: `No exact match for '${args.action}'. Showing all hedgerow rules.`,
      results_count: allRules.length,
      results: allRules.map(r => ({
        action: r.action,
        notice_required: r.notice_required === 1,
        exemptions: r.exemptions,
        important_hedgerow_criteria: r.important_hedgerow_criteria,
        penalties: r.penalties,
        regulation_ref: r.regulation_ref,
      })),
      _meta: buildMeta({ source_url: 'https://www.legislation.gov.uk/uksi/1997/1160/contents/made' }),
    };
  }

  return {
    query: args.action,
    hedgerow_type: args.hedgerow_type ?? null,
    jurisdiction: jv.jurisdiction,
    results_count: rules.length,
    results: rules.map(r => ({
      action: r.action,
      notice_required: r.notice_required === 1,
      exemptions: r.exemptions,
      important_hedgerow_criteria: r.important_hedgerow_criteria,
      penalties: r.penalties,
      regulation_ref: r.regulation_ref,
    })),
    _meta: buildMeta({ source_url: 'https://www.legislation.gov.uk/uksi/1997/1160/contents/made' }),
  };
}
