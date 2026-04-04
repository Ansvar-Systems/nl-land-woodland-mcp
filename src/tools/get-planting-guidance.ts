import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface PlantingArgs {
  tree_type?: string;
  purpose?: string;
  area_ha?: number;
  jurisdiction?: string;
}

export function handleGetPlantingGuidance(db: Database, args: PlantingArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = 'SELECT * FROM planting_guidance WHERE jurisdiction = ?';
  const params: unknown[] = [jv.jurisdiction];

  if (args.tree_type) {
    sql += ' AND LOWER(species_group) LIKE LOWER(?)';
    params.push(`%${args.tree_type}%`);
  }

  if (args.purpose) {
    sql += ' AND LOWER(purpose) LIKE LOWER(?)';
    params.push(`%${args.purpose}%`);
  }

  sql += ' ORDER BY id';

  const guidance = db.all<{
    id: number;
    purpose: string;
    species_group: string;
    min_area_ha: number | null;
    eia_screening_required: number;
    grant_available: string;
    ancient_woodland_buffer_m: number;
    jurisdiction: string;
  }>(sql, params);

  // Add EIA flag if area is provided
  let eia_note: string | null = null;
  if (args.area_ha !== undefined && args.area_ha > 5) {
    eia_note = `At ${args.area_ha} ha, Environmental Impact Assessment screening is likely required under the EIA (Forestry) Regulations 1999, especially on semi-natural habitat or sensitive areas.`;
  }

  return {
    query: {
      tree_type: args.tree_type ?? null,
      purpose: args.purpose ?? null,
      area_ha: args.area_ha ?? null,
    },
    jurisdiction: jv.jurisdiction,
    eia_note,
    results_count: guidance.length,
    results: guidance.map(g => ({
      purpose: g.purpose,
      species_group: g.species_group,
      min_area_ha: g.min_area_ha,
      eia_screening_required: g.eia_screening_required === 1,
      grant_available: g.grant_available,
      ancient_woodland_buffer_m: g.ancient_woodland_buffer_m,
    })),
    _meta: buildMeta({ source_url: 'https://www.gov.uk/guidance/england-woodland-creation-offer' }),
  };
}
