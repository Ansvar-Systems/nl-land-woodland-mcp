import { buildMeta } from '../metadata.js';
import { buildCitation } from '../citation.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface TPOArgs {
  scenario?: string;
  jurisdiction?: string;
}

export function handleGetTPORules(db: Database, args: TPOArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = 'SELECT * FROM tpo_rules WHERE jurisdiction = ?';
  const params: unknown[] = [jv.jurisdiction];

  if (args.scenario) {
    sql += ' AND LOWER(scenario) LIKE LOWER(?)';
    params.push(`%${args.scenario}%`);
  }

  sql += ' ORDER BY id';

  const rules = db.all<{
    id: number;
    scenario: string;
    consent_required: number;
    consent_authority: string;
    exemptions: string;
    process: string;
    penalties: string;
    regulation_ref: string;
    jurisdiction: string;
  }>(sql, params);

  return {
    query: args.scenario ?? null,
    jurisdiction: jv.jurisdiction,
    results_count: rules.length,
    results: rules.map(r => ({
      scenario: r.scenario,
      consent_required: r.consent_required === 1,
      consent_authority: r.consent_authority,
      exemptions: r.exemptions,
      process: r.process,
      penalties: r.penalties,
      regulation_ref: r.regulation_ref,
    })),
    _meta: buildMeta({ source_url: 'https://lokaleregelgeving.overheid.nl' }),
    _citation: buildCitation(
      args.scenario ? `TPO rules: ${args.scenario}` : 'Tree preservation order rules (NL)',
      args.scenario ? `TPO rules for ${args.scenario}` : 'Tree preservation order rules',
      'get_tpo_rules',
      { ...(args.scenario ? { scenario: args.scenario } : {}) },
      'https://lokaleregelgeving.overheid.nl',
    ),
  };
}
