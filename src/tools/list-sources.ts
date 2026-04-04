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
      name: 'Wet natuurbescherming (Wnb) art. 4.2-4.6',
      authority: 'Rijksoverheid',
      official_url: 'https://wetten.overheid.nl/BWBR0037552',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'as_amended',
      license: 'Dutch Government Open Data',
      coverage: 'Houtopstanden, meldingsplicht kap, herplantplicht, uitzonderingen',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Gemeentelijke APV (kapvergunning)',
      authority: 'Gemeenten',
      official_url: 'https://lokaleregelgeving.overheid.nl',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'varies_by_municipality',
      license: 'Dutch Government Open Data',
      coverage: 'Kapvergunning binnen bebouwde kom, monumentale bomen, bomenverordening',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Natura 2000 beheerplannen',
      authority: 'Ministerie van LNV / Provincies',
      official_url: 'https://www.natura2000.nl',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'per_plan_cycle',
      license: 'Dutch Government Open Data',
      coverage: 'Natura 2000 vergunningplicht, AERIUS stikstofdepositie, passende beoordeling',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'RVO Pachtbeleid / pachtnormen',
      authority: 'RVO (Rijksdienst voor Ondernemend Nederland)',
      official_url: 'https://www.rvo.nl/onderwerpen/pacht',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'annual',
      license: 'Dutch Government Open Data',
      coverage: 'Reguliere pacht, geliberaliseerde pacht, teeltpacht, pachtnormen per regio',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Kadaster (erfpacht)',
      authority: 'Kadaster',
      official_url: 'https://www.kadaster.nl',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'continuous',
      license: 'Dutch Government Open Data',
      coverage: 'Erfpacht registratie, zakelijke rechten, grondregistratie',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Nationale Bossenstrategie',
      authority: 'Staatsbosbeheer / Ministerie van LNV',
      official_url: 'https://www.rijksoverheid.nl/onderwerpen/natuur-en-biodiversiteit/bossenstrategie',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'periodic',
      license: 'Dutch Government Open Data',
      coverage: 'Bosaanleg subsidies, soortenkeuze, klimaatadaptatie, 37.000 ha doelstelling',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'AERIUS Calculator',
      authority: 'RIVM',
      official_url: 'https://www.aerius.nl',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'annual',
      license: 'Dutch Government Open Data',
      coverage: 'Stikstofdepositie berekeningen, KDW (Kritische Depositie Waarde)',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Stichting Wandelnet',
      authority: 'Stichting Wandelnet',
      official_url: 'https://www.wandelnet.nl',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'periodic',
      license: 'Public information',
      coverage: 'Klompenpaden, LAW-routes, NSWP (Nationaal Strategisch Wandelpadenplan)',
      last_retrieved: lastIngest?.value,
    },
  ];

  return {
    sources,
    _meta: buildMeta({ source_url: 'https://wetten.overheid.nl' }),
  };
}
