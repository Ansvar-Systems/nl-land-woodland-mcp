#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { createDatabase } from './db.js';
import { handleAbout } from './tools/about.js';
import { handleListSources } from './tools/list-sources.js';
import { handleCheckFreshness } from './tools/check-freshness.js';
import { handleSearchLandRules } from './tools/search-land-rules.js';
import { handleCheckHedgerowRules } from './tools/check-hedgerow-rules.js';
import { handleGetFellingLicenceRules } from './tools/get-felling-licence-rules.js';
import { handleCheckSSSIConsent } from './tools/check-sssi-consent.js';
import { handleGetRightsOfWayRules } from './tools/get-rights-of-way-rules.js';
import { handleGetCommonLandRules } from './tools/get-common-land-rules.js';
import { handleGetPlantingGuidance } from './tools/get-planting-guidance.js';
import { handleGetTPORules } from './tools/get-tpo-rules.js';

const SERVER_NAME = 'nl-land-woodland-mcp';
const SERVER_VERSION = '0.1.0';

const TOOLS = [
  {
    name: 'about',
    description: 'Get server metadata: name, version, coverage, data sources, and links.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'list_sources',
    description: 'List all data sources with authority, URL, license, and freshness info.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'check_data_freshness',
    description: 'Check when data was last ingested, staleness status, and how to trigger a refresh.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'search_land_rules',
    description: 'Full-text search across all Dutch land and woodland management rules. Use for broad queries about houtopstanden, kap, Natura 2000, pachtrecht, openbare paden, or bosaanleg.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Free-text search query' },
        topic: { type: 'string', description: 'Filter by topic (hedgerow, felling, sssi, rights_of_way, common_land, planting)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: NL)' },
        limit: { type: 'number', description: 'Max results (default: 20, max: 50)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'check_hedgerow_rules',
    description: 'Check houtopstand/bomenrij regulations by action type. Returns meldingsplicht, uitzonderingen, herplantplicht, and boetes under the Wet natuurbescherming art. 4.2-4.6.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        action: { type: 'string', description: 'Action type (e.g. Kappen, Snoeien, Herplant, Melding, Monumentale)' },
        hedgerow_type: { type: 'string', description: 'Houtopstand classification' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: NL)' },
      },
      required: ['action'],
    },
  },
  {
    name: 'get_felling_licence_rules',
    description: 'Get kapvergunning requirements by volume, area, or reason. Returns whether a vergunning/melding is needed, exemptions, process, and strafmaat under the Wet natuurbescherming.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        volume_m3: { type: 'number', description: 'Volume of timber in cubic metres' },
        area_ha: { type: 'number', description: 'Area of houtopstand in hectares' },
        reason: { type: 'string', description: 'Reason for kap (e.g. Gevaarlijke, Fruit, Herplant, Dunning)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: NL)' },
      },
    },
  },
  {
    name: 'check_sssi_consent',
    description: 'Check whether an activity in or near a Natura 2000-gebied requires a Wnb vergunning. Returns process, conditions (AERIUS, KDW), and penalties.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        activity: { type: 'string', description: 'Proposed activity (e.g. Nieuwbouw, Uitbreiding, Bemesting, Grondverzet, Recreatief)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: NL)' },
      },
      required: ['activity'],
    },
  },
  {
    name: 'get_rights_of_way_rules',
    description: 'Get rules for openbare paden by path type and issue. Returns minimum widths, rules, reinstatement deadlines, and obstruction liability.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path_type: { type: 'string', description: 'Path type (Klompenpad, LAW-route, Openbaar voetpad, Fietspad, Jaagpad, Ruiterpad)' },
        issue: { type: 'string', description: 'Issue type (e.g. bestuursdwang, blokkade, onderhoud)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: NL)' },
      },
    },
  },
  {
    name: 'get_common_land_rules',
    description: 'Get pachtrecht rules for land lease in the Netherlands. Returns consent requirements and responsible authority (Grondkamer/RVO).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        activity: { type: 'string', description: 'Pacht type (e.g. Reguliere, Geliberaliseerde, Teelt, Erfpacht, Pachtnormen)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: NL)' },
      },
    },
  },
  {
    name: 'get_planting_guidance',
    description: 'Get bosaanleg guidance including provincial subsidies, Bossenstrategie targets, soortenkeuze, and LULUCF compensatie.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tree_type: { type: 'string', description: 'Species group (e.g. loofhout, naaldhout, inheems, gemengd)' },
        purpose: { type: 'string', description: 'Planting purpose (e.g. Bosaanleg, Agroforestry, Oeverbegroeiing, Natuurcompensatie)' },
        area_ha: { type: 'number', description: 'Planned planting area in hectares (triggers EIA note if >5ha)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: NL)' },
      },
    },
  },
  {
    name: 'get_tpo_rules',
    description: 'Get rules for monumentale bomen (beschermde bomen). Returns consent requirements, exemptions, process, and penalties.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        scenario: { type: 'string', description: 'Scenario (e.g. Werkzaamheden, Dode, Bouw, Beschermde)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: NL)' },
      },
    },
  },
];

const SearchArgsSchema = z.object({
  query: z.string(),
  topic: z.string().optional(),
  jurisdiction: z.string().optional(),
  limit: z.number().optional(),
});

const HedgerowArgsSchema = z.object({
  action: z.string(),
  hedgerow_type: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const FellingArgsSchema = z.object({
  volume_m3: z.number().optional(),
  area_ha: z.number().optional(),
  reason: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const SSSIArgsSchema = z.object({
  activity: z.string(),
  jurisdiction: z.string().optional(),
});

const RoWArgsSchema = z.object({
  path_type: z.string().optional(),
  issue: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const CommonLandArgsSchema = z.object({
  activity: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const PlantingArgsSchema = z.object({
  tree_type: z.string().optional(),
  purpose: z.string().optional(),
  area_ha: z.number().optional(),
  jurisdiction: z.string().optional(),
});

const TPOArgsSchema = z.object({
  scenario: z.string().optional(),
  jurisdiction: z.string().optional(),
});

function textResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function errorResult(message: string) {
  return { content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }], isError: true };
}

const db = createDatabase();

const server = new Server(
  { name: SERVER_NAME, version: SERVER_VERSION },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case 'about':
        return textResult(handleAbout());
      case 'list_sources':
        return textResult(handleListSources(db));
      case 'check_data_freshness':
        return textResult(handleCheckFreshness(db));
      case 'search_land_rules':
        return textResult(handleSearchLandRules(db, SearchArgsSchema.parse(args)));
      case 'check_hedgerow_rules':
        return textResult(handleCheckHedgerowRules(db, HedgerowArgsSchema.parse(args)));
      case 'get_felling_licence_rules':
        return textResult(handleGetFellingLicenceRules(db, FellingArgsSchema.parse(args)));
      case 'check_sssi_consent':
        return textResult(handleCheckSSSIConsent(db, SSSIArgsSchema.parse(args)));
      case 'get_rights_of_way_rules':
        return textResult(handleGetRightsOfWayRules(db, RoWArgsSchema.parse(args)));
      case 'get_common_land_rules':
        return textResult(handleGetCommonLandRules(db, CommonLandArgsSchema.parse(args)));
      case 'get_planting_guidance':
        return textResult(handleGetPlantingGuidance(db, PlantingArgsSchema.parse(args)));
      case 'get_tpo_rules':
        return textResult(handleGetTPORules(db, TPOArgsSchema.parse(args)));
      default:
        return errorResult(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return errorResult(err instanceof Error ? err.message : String(err));
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err.message}\n`);
  process.exit(1);
});
