export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string;
  copyright: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'This server provides general guidance on Dutch land and woodland management regulations. ' +
  'Requirements vary by gemeente (municipality), provincie, and site-specific designations ' +
  '(Natura 2000, monumentale bomen, etc.). Always consult your gemeente, provincie, or ' +
  'RVO for site-specific requirements.';

export function buildMeta(overrides?: Partial<Meta>): Meta {
  return {
    disclaimer: DISCLAIMER,
    data_age: overrides?.data_age ?? 'unknown',
    source_url: overrides?.source_url ?? 'https://wetten.overheid.nl',
    copyright: 'Data: Dutch Government Open Data. Server: Apache-2.0 Ansvar Systems.',
    server: 'nl-land-woodland-mcp',
    version: '0.1.0',
    ...overrides,
  };
}
