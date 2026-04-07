import { buildMeta } from '../metadata.js';
import { buildCitation } from '../citation.js';
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
    eia_note = `Bij ${args.area_ha} ha is een milieueffectrapportage (MER) beoordeling waarschijnlijk nodig, vooral bij aanplant op halfnatuurlijke habitats of nabij Natura 2000-gebieden.`;
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
    _meta: buildMeta({ source_url: 'https://www.rijksoverheid.nl/onderwerpen/natuur-en-biodiversiteit/bossenstrategie' }),
    _citation: buildCitation(
      args.tree_type ? `Planting guidance: ${args.tree_type}` : 'Planting guidance (NL)',
      args.purpose ? `Planting guidance for ${args.purpose}` : 'Tree planting guidance',
      'get_planting_guidance',
      { ...(args.tree_type ? { tree_type: args.tree_type } : {}), ...(args.purpose ? { purpose: args.purpose } : {}) },
      'https://www.rijksoverheid.nl/onderwerpen/natuur-en-biodiversiteit/bossenstrategie',
    ),
  };
}
