import { buildMeta } from '../metadata.js';
import type { Database } from '../db.js';

interface Source {
  name: string;
  authority: string;
  official_url: string;
  retrieval_method: string;
  update_frequency: string;
  license: string;
  coverage: string;
  last_retrieved?: string;
}

export function handleListSources(db: Database): { sources: Source[]; _meta: ReturnType<typeof buildMeta> } {
  const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);

  const sources: Source[] = [
    {
      name: 'Hedgerow Regulations 1997',
      authority: 'UK Government',
      official_url: 'https://www.legislation.gov.uk/uksi/1997/1160/contents/made',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'as_amended',
      license: 'Open Government Licence v3',
      coverage: 'Hedgerow removal notices, important hedgerow criteria, exemptions, penalties',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Forestry Act 1967 (as amended)',
      authority: 'UK Government',
      official_url: 'https://www.legislation.gov.uk/ukpga/1967/10/contents',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'as_amended',
      license: 'Open Government Licence v3',
      coverage: 'Felling licence thresholds, exemptions, application process, penalties',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Wildlife and Countryside Act 1981',
      authority: 'UK Government',
      official_url: 'https://www.legislation.gov.uk/ukpga/1981/69/contents',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'as_amended',
      license: 'Open Government Licence v3',
      coverage: 'SSSI operations requiring consent, notification process, penalties',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Countryside and Rights of Way Act 2000',
      authority: 'UK Government',
      official_url: 'https://www.legislation.gov.uk/ukpga/2000/37/contents',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'as_amended',
      license: 'Open Government Licence v3',
      coverage: 'Rights of way obligations, SSSI enforcement, open access land',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Commons Act 2006',
      authority: 'UK Government',
      official_url: 'https://www.legislation.gov.uk/ukpga/2006/26/contents',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'as_amended',
      license: 'Open Government Licence v3',
      coverage: 'Common land works consent, fencing, public access',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Forestry Commission EWCO Guidance',
      authority: 'Forestry Commission',
      official_url: 'https://www.gov.uk/guidance/england-woodland-creation-offer',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'annual',
      license: 'Open Government Licence v3',
      coverage: 'Woodland creation grants, EIA thresholds, ancient woodland buffers, species guidance',
      last_retrieved: lastIngest?.value,
    },
  ];

  return {
    sources,
    _meta: buildMeta({ source_url: 'https://www.legislation.gov.uk' }),
  };
}
