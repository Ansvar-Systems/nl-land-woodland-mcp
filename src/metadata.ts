export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string;
  copyright: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'This server provides general guidance on UK land and woodland management regulations. ' +
  'Requirements vary by local planning authority, devolved administration, and site-specific ' +
  'designations (SSSI, conservation area, TPO, etc.). Always consult your local planning ' +
  'authority, Natural England, or Forestry Commission for site-specific requirements.';

export function buildMeta(overrides?: Partial<Meta>): Meta {
  return {
    disclaimer: DISCLAIMER,
    data_age: overrides?.data_age ?? 'unknown',
    source_url: overrides?.source_url ?? 'https://www.legislation.gov.uk',
    copyright: 'Data: Crown Copyright. Server: Apache-2.0 Ansvar Systems.',
    server: 'nl-land-woodland-mcp',
    version: '0.1.0',
    ...overrides,
  };
}
