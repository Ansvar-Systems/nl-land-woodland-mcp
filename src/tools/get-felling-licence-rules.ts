import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface FellingArgs {
  volume_m3?: number;
  area_ha?: number;
  reason?: string;
  jurisdiction?: string;
}

export function handleGetFellingLicenceRules(db: Database, args: FellingArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = 'SELECT * FROM felling_rules WHERE jurisdiction = ?';
  const params: unknown[] = [jv.jurisdiction];

  if (args.reason) {
    sql += ' AND LOWER(scenario) LIKE LOWER(?)';
    params.push(`%${args.reason}%`);
  }

  sql += ' ORDER BY id';

  const rules = db.all<{
    id: number;
    scenario: string;
    licence_required: number;
    threshold_m3: number | null;
    threshold_ha: number | null;
    exemptions: string;
    application_process: string;
    penalties: string;
    regulation_ref: string;
    jurisdiction: string;
  }>(sql, params);

  // If volume provided, flag whether licence is needed
  let licence_assessment: string | null = null;
  if (args.volume_m3 !== undefined) {
    if (args.volume_m3 <= 5) {
      licence_assessment = args.volume_m3 <= 2
        ? `${args.volume_m3} m3 is within the small felling exemption (up to 5 m3/quarter, max 2 m3 for sale). No felling licence needed.`
        : `${args.volume_m3} m3 is within the small felling exemption (up to 5 m3/quarter) but exceeds the 2 m3 sale limit. Licence not needed if timber is not sold.`;
    } else {
      licence_assessment = `${args.volume_m3} m3 exceeds the 5 m3/quarter exemption. A felling licence from the Forestry Commission is required.`;
    }
  }

  return {
    query: {
      volume_m3: args.volume_m3 ?? null,
      area_ha: args.area_ha ?? null,
      reason: args.reason ?? null,
    },
    jurisdiction: jv.jurisdiction,
    licence_assessment,
    results_count: rules.length,
    results: rules.map(r => ({
      scenario: r.scenario,
      licence_required: r.licence_required === 1,
      threshold_m3: r.threshold_m3,
      threshold_ha: r.threshold_ha,
      exemptions: r.exemptions,
      application_process: r.application_process,
      penalties: r.penalties,
      regulation_ref: r.regulation_ref,
    })),
    _meta: buildMeta({ source_url: 'https://www.legislation.gov.uk/ukpga/1967/10/contents' }),
  };
}
