import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface CommonLandArgs {
  activity?: string;
  jurisdiction?: string;
}

export function handleGetCommonLandRules(db: Database, args: CommonLandArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = 'SELECT * FROM common_land_rules WHERE jurisdiction = ?';
  const params: unknown[] = [jv.jurisdiction];

  if (args.activity) {
    sql += ' AND LOWER(activity) LIKE LOWER(?)';
    params.push(`%${args.activity}%`);
  }

  sql += ' ORDER BY id';

  const rules = db.all<{
    id: number;
    activity: string;
    consent_required: number;
    consent_authority: string;
    process: string;
    jurisdiction: string;
  }>(sql, params);

  return {
    query: args.activity ?? null,
    jurisdiction: jv.jurisdiction,
    results_count: rules.length,
    results: rules.map(r => ({
      activity: r.activity,
      consent_required: r.consent_required === 1,
      consent_authority: r.consent_authority,
      process: r.process,
    })),
    _meta: buildMeta({ source_url: 'https://www.rvo.nl/onderwerpen/pacht' }),
  };
}
