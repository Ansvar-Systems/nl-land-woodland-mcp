import { buildMeta } from '../metadata.js';
import { SUPPORTED_JURISDICTIONS } from '../jurisdiction.js';

export function handleAbout() {
  return {
    name: 'Netherlands Land & Woodland Management MCP',
    description:
      'Dutch land and woodland management regulations via MCP. Covers houtopstanden ' +
      '(kapvergunning, herplantplicht), Natura 2000 vergunningen, pachtrecht, openbare paden, ' +
      'and bosaanleg guidance. Based on Wet natuurbescherming, RVO pachtbeleid, and provincial regulations.',
    version: '0.1.0',
    jurisdiction: [...SUPPORTED_JURISDICTIONS],
    data_sources: [
      'Wet natuurbescherming (Wnb) art. 4.2-4.6',
      'Gemeentelijke APV (kapvergunning)',
      'Natura 2000 beheerplannen',
      'RVO Pachtbeleid / pachtnormen',
      'Kadaster (erfpacht)',
      'Staatsbosbeheer / Nationale Bossenstrategie',
      'AERIUS Calculator (stikstof)',
      'Stichting Wandelnet (klompenpaden)',
      'Wegenwet / Waterwet',
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
