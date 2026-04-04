import { buildMeta } from '../metadata.js';
import { SUPPORTED_JURISDICTIONS } from '../jurisdiction.js';

export function handleAbout() {
  return {
    name: 'UK Land & Woodland Management MCP',
    description:
      'UK land and woodland management regulations via MCP. Covers hedgerow regulations, ' +
      'tree felling licences, SSSI consent, public rights of way, common land, and woodland ' +
      'planting guidance. Based on published UK legislation and Forestry Commission guidance.',
    version: '0.1.0',
    jurisdiction: [...SUPPORTED_JURISDICTIONS],
    data_sources: [
      'Hedgerow Regulations 1997',
      'Forestry Act 1967',
      'Town and Country Planning Act 1990 Part VIII',
      'Wildlife and Countryside Act 1981',
      'Countryside and Rights of Way Act 2000',
      'Commons Act 2006',
      'Highways Act 1980',
      'Anti-social Behaviour Act 2003 Part 8',
      'Forestry Commission EWCO Guidance',
    ],
    tools_count: 11,
    links: {
      homepage: 'https://ansvar.eu/open-agriculture',
      repository: 'https://github.com/Ansvar-Systems/nl-land-woodland-mcp',
      mcp_network: 'https://ansvar.ai/mcp',
    },
    _meta: buildMeta(),
  };
}
