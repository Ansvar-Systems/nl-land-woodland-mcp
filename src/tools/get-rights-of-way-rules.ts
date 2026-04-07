import { buildMeta } from '../metadata.js';
import { buildCitation } from '../citation.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface RoWArgs {
  path_type?: string;
  issue?: string;
  jurisdiction?: string;
}

export function handleGetRightsOfWayRules(db: Database, args: RoWArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = 'SELECT * FROM rights_of_way WHERE jurisdiction = ?';
  const params: unknown[] = [jv.jurisdiction];

  if (args.path_type) {
    sql += ' AND LOWER(path_type) LIKE LOWER(?)';
    params.push(`%${args.path_type}%`);
  }

  if (args.issue) {
    sql += ' AND (LOWER(obligation) LIKE LOWER(?) OR LOWER(cropping_rules) LIKE LOWER(?) OR LOWER(obstruction_liability) LIKE LOWER(?))';
    params.push(`%${args.issue}%`, `%${args.issue}%`, `%${args.issue}%`);
  }

  sql += ' ORDER BY id';

  const rules = db.all<{
    id: number;
    path_type: string;
    obligation: string;
    min_width_m: number;
    cropping_rules: string;
    reinstatement_deadline: string;
    obstruction_liability: string;
    jurisdiction: string;
  }>(sql, params);

  return {
    query: {
      path_type: args.path_type ?? null,
      issue: args.issue ?? null,
    },
    jurisdiction: jv.jurisdiction,
    results_count: rules.length,
    results: rules.map(r => ({
      path_type: r.path_type,
      obligation: r.obligation,
      min_width_m: r.min_width_m,
      cropping_rules: r.cropping_rules,
      reinstatement_deadline: r.reinstatement_deadline,
      obstruction_liability: r.obstruction_liability,
    })),
    _meta: buildMeta({ source_url: 'https://wetten.overheid.nl/BWBR0001948' }),
    _citation: buildCitation(
      args.path_type ? `Rights of way: ${args.path_type}` : 'Rights of way rules (NL)',
      args.issue ? `Rights of way rules: ${args.issue}` : 'Rights of way rules',
      'get_rights_of_way_rules',
      { ...(args.path_type ? { path_type: args.path_type } : {}), ...(args.issue ? { issue: args.issue } : {}) },
      'https://wetten.overheid.nl/BWBR0001948',
    ),
  };
}
