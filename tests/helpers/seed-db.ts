import { createDatabase, type Database } from '../../src/db.js';

export function createSeededDatabase(dbPath: string): Database {
  const db = createDatabase(dbPath);

  // --- Hedgerow / Houtopstand Rules ---
  const hedgerowData: [string, number, string | null, string | null, string | null, string | null, string][] = [
    [
      'Kappen houtopstand (>10 are buiten bebouwde kom)',
      1,
      'Fruitbomen en notenbomen, windschermen langs landbouwgronden, kwekerij-beplanting, dunning tot 20% van de stammen, bomen op erven',
      'Houtopstand groter dan 10 are (1.000 m2) of bomenrij van 20 of meer bomen buiten de bebouwde kom',
      'Bestuurlijke boete tot 25.000 EUR. Bestuursdwang: gemeente of provincie kan herplant afdwingen.',
      'Wet natuurbescherming art. 4.2',
      'NL',
    ],
    [
      'Herplantplicht na kap',
      1,
      'Geen ontheffing tenzij aangevraagd bij provincie; ontheffing bij zwaarwegend maatschappelijk belang',
      'Herplantplicht geldt voor elke gevelde houtopstand waarvoor meldingsplicht geldt. Herbeplanting op zelfde grond of op andere grond binnen de provincie. Zelfde oppervlakte als gevelde houtopstand.',
      'Bij niet-nakoming herplantplicht: bestuursdwang en dwangsom door provincie',
      'Wet natuurbescherming art. 4.3',
      'NL',
    ],
    [
      'Melding kap bij provincie',
      1,
      'Uitzondering als kap valt onder gemeentelijke APV (binnen bebouwde kom)',
      'Melding tenminste 1 maand (4 weken) voor de geplande kap bij de provincie. Na melding geldt een wachttijd van 1 maand voordat gekapt mag worden.',
      'Kappen zonder melding: bestuurlijke boete en herplantplicht',
      'Wet natuurbescherming art. 4.2 lid 1',
      'NL',
    ],
    [
      'Kapvergunning binnen bebouwde kom (APV)',
      1,
      'Per gemeente verschillend: soms vrijstelling voor bepaalde soorten, stamdiameter, of erfbeplanting',
      'Binnen de bebouwde kom regelt de gemeente de kapvergunning via de Algemene Plaatselijke Verordening (APV). Regels variëren per gemeente.',
      'Boete per gemeente, veelal bestuursdwang en herplantplicht',
      'Gemeentelijke APV (Algemene Plaatselijke Verordening)',
      'NL',
    ],
    [
      'Snoeien houtopstand',
      0,
      null,
      null,
      'Geen boete mits geen beschermde soorten worden verstoord (check Wet natuurbescherming art. 3.1-3.5 voor soortenbescherming)',
      'Wet natuurbescherming art. 3.1-3.5 (soortenbescherming)',
      'NL',
    ],
    [
      'Monumentale bomen',
      1,
      'Alleen kap bij direct gevaar voor personen of gebouwen, met voorafgaande toestemming gemeente',
      'Gemeentelijke monumentale-bomenlijst. Bomen met bijzondere cultuurhistorische, wetenschappelijke of beeldbepalende waarde. Bescherming via APV of bestemmingsplan.',
      'Boete tot 25.000 EUR plus herplantplicht. Gemeente kan bestuursdwang opleggen.',
      'Gemeentelijke APV; Erfgoedwet (indirect)',
      'NL',
    ],
    [
      'Bomenrij onder 20 bomen',
      0,
      'Geen meldingsplicht onder Wet natuurbescherming, maar check altijd de gemeentelijke APV — veel gemeenten hanteren een lagere drempel',
      null,
      'Geen boete onder Wnb. APV-boete kan wel van toepassing zijn.',
      'Wet natuurbescherming art. 4.2 lid 2',
      'NL',
    ],
    [
      'Dunning (minder dan 20%)',
      0,
      'Dunning van minder dan 20% van de stammen in een houtopstand is uitgezonderd van de meldingsplicht',
      null,
      null,
      'Wet natuurbescherming art. 4.2 lid 3',
      'NL',
    ],
    [
      'Verwijderen houtwal of houtsingel',
      1,
      'Uitzondering als kleiner dan 10 are en minder dan 20 bomen',
      'Houtwallen en houtsingels (lijnvormige beplanting) vallen onder de bescherming als ze groter zijn dan 10 are of 20+ bomen bevatten. Ecologisch waardevolle landschapselementen.',
      'Bestuurlijke boete tot 25.000 EUR plus herplantplicht',
      'Wet natuurbescherming art. 4.2; provinciale verordening',
      'NL',
    ],
    [
      'Houtwal bescherming',
      1,
      'Kleine houtwallen (<10 are, <20 bomen) zijn vrijgesteld van Wnb-meldingsplicht maar kunnen onder provinciaal beleid vallen',
      'Houtwal: aarden wal met opgaande begroeiing, historisch perceelscheidend element. Beschermd als landschapselement in meerdere provincies (Overijssel, Gelderland, Drenthe). Bescherming via provinciale verordening natuur en landschap.',
      'Bestuurlijke boete provincie. Herplantplicht of herstelinspanning. In Overijssel tot 10.000 EUR per overtreding.',
      'Provinciale verordening natuur en landschap; Wnb art. 4.2',
      'NL',
    ],
    [
      'Singel en elzensingel bescherming',
      1,
      'Eenrijige singels met minder dan 20 bomen zijn vrijgesteld onder Wnb, maar provinciale regels kunnen strenger zijn',
      'Singel: rij van bomen of struiken als perceelscheiding. Elzensingel: specifiek met zwarte els (Alnus glutinosa) langs sloten, kenmerkend voor Friese Wouden en Groninger landschap. Beschermd als landschapselement.',
      'Boete bij ongeoorloofde verwijdering. Subsidie voor onderhoud via ANLb (Agrarisch Natuur- en Landschapsbeheer).',
      'Provinciale verordening; ANLb subsidieregeling',
      'NL',
    ],
    [
      'Knotbomenrij bescherming',
      1,
      'Vrijstelling als minder dan 20 bomen en geen monumentale status',
      'Knotbomenrij: bomen die periodiek geknot worden (wilg, es, els). Cultuurhistorisch landschapselement. Beschermd in meerdere provincies als onderdeel van het landschappelijk erfgoed. Onderhoud (knotten) is verplicht voor behoud subsidie.',
      'Verlies subsidie bij verwaarlozing. Boete bij verwijdering van beschermde knotbomenrij.',
      'Provinciale verordening; ANLb beheersubsidie',
      'NL',
    ],
    [
      'Houtopstand: definitie en afbakening',
      0,
      null,
      'Houtopstand in de zin van Wnb art. 4.1: zelfstandige eenheid van bomen, boomvormers, struiken, hakhout of griend, niet zijnde beplanting van erven en tuinen. Minimaal 10 are of 20+ bomen in een rijbeplanting.',
      null,
      'Wet natuurbescherming art. 4.1 (definitie)',
      'NL',
    ],
    [
      'Provinciale verordening Gelderland — houtopstanden',
      1,
      'Gelderland kent aanvullende regels via de Omgevingsverordening Gelderland voor landschapselementen in het Gelders Natuurnetwerk',
      'In Gelderland geldt naast de Wnb ook de provinciale Omgevingsverordening. Beschermde landschapselementen (houtwallen, singels, lanen) in het Gelders Natuurnetwerk mogen niet zonder ontheffing worden verwijderd.',
      'Bestuurlijke boete provincie Gelderland. Aanvullende compensatieplicht in oppervlakte en kwaliteit.',
      'Omgevingsverordening Gelderland; Wnb art. 4.2',
      'NL',
    ],
    [
      'Provinciale verordening Overijssel — groene dooradering',
      1,
      'Beperkte vrijstelling voor regulier onderhoud (dunning <20%, knotten) mits passend binnen beheerplan',
      'Overijssel beschermt houtwallen, singels, boomgroepen en lanen als onderdeel van de groene dooradering. Vergunning vereist voor kap of verwijdering.',
      'Bestuurlijke boete tot 10.000 EUR. Herstelverplichting binnen 2 plantseizonen.',
      'Omgevingsverordening Overijssel; Wnb art. 4.2',
      'NL',
    ],
    [
      'Provinciale verordening Friesland — elzensingels Friese Wouden',
      1,
      'Regulier onderhoud (knotten, periodiek terugzetten) is vrijgesteld mits binnen ANLb-beheerovereenkomst',
      'Friesland kent bijzondere bescherming voor elzensingels in het Nationaal Landschap Noardlike Fryske Walden.',
      'Bestuurlijke boete. Terugvordering ANLb-subsidie bij niet-naleving beheerovereenkomst.',
      'Omgevingsverordening Friesland; ANLb subsidieregeling',
      'NL',
    ],
    [
      'Groenblauwe dooradering — subsidie en voorwaarden',
      0,
      null,
      'Groenblauwe dooradering: netwerk van groene (houtwallen, singels, bosjes) en blauwe (sloten, poelen, beken) landschapselementen. Subsidie via ANLb. Voorwaarden: minimaal 6 jaar beheerovereenkomst.',
      'Geen boete maar verlies subsidie en terugvordering bij niet-naleving.',
      'ANLb; Gemeenschappelijk Landbouwbeleid (GLB)',
      'NL',
    ],
    [
      'Herplant — soortenkeuze en plantafstand',
      1,
      'Provincie kan afwijkende soortenkeuze voorschrijven bij herplant op andere locatie',
      'Bij herplantplicht (Wnb art. 4.3) geldt: soortenkeuze in overleg met provincie, voorkeur inheems loofhout. Plantafstand afhankelijk van soort: eik 4-6 m, berk 3-4 m, beuk 5-7 m, els 2-3 m.',
      'Bij niet-nakoming: bestuursdwang. Provincie kan na 3 jaar zelf herplanten op kosten eigenaar.',
      'Wet natuurbescherming art. 4.3; Besluit natuurbescherming',
      'NL',
    ],
    [
      'Herplant — controle en handhaving termijnen',
      1,
      'Verlenging herplanttermijn mogelijk bij zwaarwegend belang (max 1 jaar extra)',
      'Controle op herplantplicht door provincie: inspectie na 3 jaar. Geslaagde herplant: minimaal 80% aangeslagen.',
      'Bestuursdwang na 3 jaar + 1 jaar hersteltermijn. Dwangsom per maand tot maximaal 50.000 EUR.',
      'Wet natuurbescherming art. 4.3-4.4; Besluit natuurbescherming',
      'NL',
    ],
    [
      'Herplant — financiele compensatie (boscompensatie)',
      1,
      'Alleen mogelijk bij bewezen onmogelijkheid van fysieke herplant',
      'Als fysieke herplant niet mogelijk is, kan de provincie financiele compensatie opleggen. Storting in provinciaal groenfonds of Boscompensatiefonds. Circa 15.000-25.000 EUR/ha.',
      'Verplichting tot betaling. Bij niet-betaling: bestuursrechtelijke invordering.',
      'Wet natuurbescherming art. 4.4; Provinciale beleidsregels compensatie',
      'NL',
    ],
    [
      'Beschermde boomsoorten — bijzondere status',
      1,
      'Geen vrijstelling voor beschermde soorten, ook niet bij noodkap',
      'Sommige boomsoorten genieten extra bescherming via soortenbescherming (Wnb art. 3.1-3.5). Bomen met vleermuisverblijfplaatsen of nestelende roofvogels vereisen quickscan ecologie.',
      'Boete tot 21.750 EUR per overtreding soortenbescherming. Strafrechtelijke vervolging mogelijk bij opzet.',
      'Wet natuurbescherming art. 3.1-3.5; art. 4.2',
      'NL',
    ],
  ];

  for (const [action, notice, exemptions, criteria, penalties, ref, jur] of hedgerowData) {
    db.run(
      `INSERT INTO hedgerow_rules (action, notice_required, exemptions, important_hedgerow_criteria, penalties, regulation_ref, jurisdiction)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [action, notice, exemptions, criteria, penalties, ref, jur],
    );
  }

  // --- Felling Rules ---
  const fellingData: [string, number, number | null, number | null, string | null, string | null, string | null, string | null, string][] = [
    ['Standaard kap buiten bebouwde kom', 1, null, 0.1, null, 'Melding bij provincie (Wet natuurbescherming art. 4.2). Minimaal 1 maand wachttijd na melding. Herplantplicht binnen 3 jaar.', 'Bestuurlijke boete tot 21.750 EUR. Bestuursdwang: provincie kan herplant afdwingen.', 'Wet natuurbescherming art. 4.2-4.6', 'NL'],
    ['Kap binnen bebouwde kom (APV)', 1, null, null, 'Regels per gemeente: stamdiameter-drempels (vaak >15 cm op 1,3 m hoogte), soortvrijstellingen, erfbeplanting', 'Kapvergunning aanvragen bij gemeente. Behandeltermijn 8 weken (regulier) of 26 weken (uitgebreid).', 'Bestuursdwang en bestuurlijke boete per gemeentelijke APV', 'Gemeentelijke APV', 'NL'],
    ['Fruitbomen en notenbomen', 0, null, null, 'Fruitbomen en notenbomen zijn uitgezonderd van de meldingsplicht onder de Wet natuurbescherming.', null, null, 'Wet natuurbescherming art. 4.2 lid 3', 'NL'],
    ['Gevaarlijke boom (noodkap)', 0, null, null, 'Noodkap bij direct gevaar voor personen of gebouwen. Achteraf melden bij gemeente of provincie. Herplantplicht blijft gelden.', 'Zo spoedig mogelijk melden na kap. Fotodocumentatie bewaren.', null, 'Wet natuurbescherming art. 4.2; gemeentelijke APV', 'NL'],
    ['Dunning onder 20%', 0, null, null, 'Dunning van minder dan 20% van het stamtal per 10 jaar is uitgezonderd van de meldingsplicht.', null, null, 'Wet natuurbescherming art. 4.2 lid 3', 'NL'],
    ['Kwekerij-beplanting', 0, null, null, 'Bomen op kwekerijen en boomgaarden (bedrijfsmatige teelt) zijn uitgezonderd van de meldingsplicht.', null, null, 'Wet natuurbescherming art. 4.2 lid 3', 'NL'],
    ['Windschermen langs landbouwgrond', 0, null, null, 'Windschermen langs landbouwgronden (niet breder dan 2 rijen) zijn uitgezonderd van de meldingsplicht.', null, null, 'Wet natuurbescherming art. 4.2 lid 3', 'NL'],
    ['Herplantplicht (algemeen)', 1, null, null, null, 'Na kap: herplant binnen 3 jaar op zelfde oppervlakte. Mag op andere locatie binnen provincie mits goedgekeurd.', 'Bij niet nakomen: bestuursdwang door provincie', 'Wet natuurbescherming art. 4.3', 'NL'],
    ['Ontheffing herplantplicht', 1, null, null, 'Ontheffing bij zwaarwegend maatschappelijk belang.', 'Aanvragen bij Gedeputeerde Staten.', null, 'Wet natuurbescherming art. 4.4', 'NL'],
    ['Boswet-melding wachttijd', 1, null, null, null, 'Na melding bij provincie geldt een wachttijd van 1 maand (4 weken).', 'Kap tijdens wachttijd: bestuurlijke boete en herplantplicht', 'Wet natuurbescherming art. 4.2 lid 1', 'NL'],
    ['Strafmaat overtreding kapregels', 1, null, null, null, null, 'Maximale boete 21.750 EUR per overtreding (Wet op de economische delicten).', 'Wet op de economische delicten; Wet natuurbescherming', 'NL'],
    ['Kapvergunning stedelijk gebied', 1, null, null, 'In stedelijk gebied lagere drempel: stamomtrek >30 cm of stamdiameter >10 cm op 1,3 m hoogte.', 'Aanvraag via Omgevingsloket Online. Behandeltermijn 8 weken.', 'Bestuursdwang, boete per gemeentelijke APV (5.000-20.000 EUR).', 'Gemeentelijke APV; Omgevingswet', 'NL'],
    ['Kapvergunning landelijk gebied', 1, null, 0.1, 'In landelijk gebied buiten bebouwde kom primair Wnb-meldingsplicht.', 'Melding bij provincie. Check gemeentelijke kapverordening.', 'Wnb-boete tot 21.750 EUR.', 'Wet natuurbescherming art. 4.2; gemeentelijke APV', 'NL'],
    ['Noodkap na stormschade', 0, null, null, 'Bij stormschade (windkracht 9+) mag direct worden opgeruimd. Achteraf melding bij provincie binnen 1 week.', 'Achteraf melden. Fotodocumentatie bewaren.', null, 'Wet natuurbescherming art. 4.2; provinciale beleidsregels noodkap', 'NL'],
    ['Noodkap bij iepziekte (Ophiostoma)', 1, null, null, 'Iepziekte vereist snelle verwijdering. Versnelde procedure via gemeentelijke coordinator.', 'Melding bij gemeente iepziekte-coordinator. Versnelde vergunning.', 'Boete bij niet-melden. Dwangsom bij weigering kap.', 'Gemeentelijke APV; Plantenziektenwet', 'NL'],
    ['Noodkap bij essentaksterfte (Hymenoscyphus fraxineus)', 1, null, null, 'Geen automatische kapvrijstelling. Beoordeling per boom.', 'Boomveiligheidscontrole door gecertificeerd boomverzorger.', 'Reguliere boetes bij kap zonder melding/vergunning.', 'Wet natuurbescherming art. 4.2; gemeentelijke APV; BW art. 6:174', 'NL'],
    ['Dunning boven 20% — meldingsplichtig', 1, null, null, 'Dunning boven 20% is meldingsplichtig als reguliere kap.', 'Melding bij provincie. Bosbeheerplan overleggen.', 'Reguliere boete tot 21.750 EUR.', 'Wet natuurbescherming art. 4.2', 'NL'],
    ['Boscompensatie — landelijk compensatiefonds', 1, null, null, 'Storting in compensatiefonds: circa 15.000-25.000 EUR/ha.', 'Aanvraag ontheffing bij Gedeputeerde Staten.', 'Bestuursrechtelijke invordering bij niet-betaling.', 'Wet natuurbescherming art. 4.4; Provinciale beleidsregels compensatie', 'NL'],
    ['Ontheffing Wnb — woningbouw', 1, null, null, 'Ontheffing mogelijk bij woningbouw van zwaarwegend maatschappelijk belang.', 'Aanvraag bij Gedeputeerde Staten met compensatieplan.', null, 'Wet natuurbescherming art. 4.4', 'NL'],
    ['Ontheffing Wnb — infrastructuur (rijkswegen, spoor)', 1, null, null, 'Ontheffing bij aanleg rijkswegen of spoorwegen.', 'Aanvraag via Rijkswaterstaat of ProRail.', null, 'Wet natuurbescherming art. 4.4; Tracewet', 'NL'],
    ['Ontheffing Wnb — natuurontwikkeling', 0, null, null, 'Omvorming bos naar andere natuur kan worden vrijgesteld van herplantplicht.', 'Aanvraag bij provincie met ecologische onderbouwing.', null, 'Wet natuurbescherming art. 4.4; Subsidieverordening Natuur en Landschap', 'NL'],
    ['Beschermde boom — vleermuisverblijfplaats', 1, null, null, 'Bomen met vleermuisverblijfplaatsen extra beschermd (Wnb art. 3.5).', 'Quickscan ecologie. Nader onderzoek mei-september.', 'Boete tot 21.750 EUR per overtreding soortenbescherming.', 'Wet natuurbescherming art. 3.5; art. 4.2', 'NL'],
    ['Exoten verwijdering — invasieve soorten', 0, null, null, 'Verwijdering invasieve exoten gestimuleerd door provincies.', 'Overleg met terreinbeheerder en provincie.', null, 'Wet natuurbescherming art. 4.2; EU-verordening 1143/2014', 'NL'],
    ['Bomen op erven — vrijstelling', 0, null, null, 'Bomen op erven zijn uitgezonderd van Wnb-meldingsplicht. Gemeentelijke APV kan alsnog gelden.', 'Check gemeentelijke APV voor drempels.', 'Geen Wnb-boete. Gemeentelijke boete als APV-vergunningsplicht geldt.', 'Wet natuurbescherming art. 4.2 lid 3; gemeentelijke APV', 'NL'],
  ];

  for (const [scenario, lic, m3, ha, exemptions, process, penalties, ref, jur] of fellingData) {
    db.run(
      `INSERT INTO felling_rules (scenario, licence_required, threshold_m3, threshold_ha, exemptions, application_process, penalties, regulation_ref, jurisdiction)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [scenario, lic, m3, ha, exemptions, process, penalties, ref, jur],
    );
  }

  // --- Natura 2000 ---
  const natura2000Data: [string, number, string, string | null, string | null, string][] = [
    ['Nieuwbouw stal nabij Natura 2000', 1, 'Vergunningaanvraag bij provincie (Wnb art. 2.7). AERIUS-berekening verplicht.', 'Maximale stikstofdepositie binnen KDW', 'Bestuurlijke boete tot 21.750 EUR. Stillegging bouw.', 'NL'],
    ['Uitbreiding veestapel', 1, 'Vergunning vereist (Wnb art. 2.7). AERIUS-berekening. Intern salderen mogelijk.', 'Emissiereductie per dierplaats, luchtwassers', 'Bestuurlijke boete, intrekking vergunning, dwangsom', 'NL'],
    ['Grondverzet in of nabij Natura 2000', 1, 'Vergunning vereist. AERIUS-berekening voor machinaal grondverzet. Quickscan verplicht.', 'Werkperiode buiten broedseizoen', 'Bestuurlijke boete, dwangsom, herstelplicht', 'NL'],
    ['Recreatief medegebruik Natura 2000', 1, 'Vergunning nodig bij significante verstoring. Beheerplan kan generieke vrijstelling geven.', 'Seizoensbeperkingen, maximale bezoekersaantallen', 'Bestuurlijke boete, last onder dwangsom', 'NL'],
    ['Bemesting nabij Natura 2000', 1, 'Bemesting nabij stikstofgevoelige habitats vereist beoordeling. AERIUS voor ammoniakdepositie.', 'Bufferzone 200-250 m, emissiearme mesttoediening', 'Boete Meststoffenwet tot 50.000 EUR. Wnb tot 21.750 EUR.', 'NL'],
    ['Waterpeilwijziging nabij Natura 2000', 1, 'Vergunning vereist bij hydrologisch effect. Waterschap en provincie beoordelen gezamenlijk.', 'Peilbesluit waterschap, monitoring grondwaterstanden', 'Bestuurlijke boete, dwangsom, herstelplicht waterschap', 'NL'],
    ['Beheerplannen Natura 2000', 0, 'Beheerplan beschrijft instandhoudingsdoelen, toegestane activiteiten, en benodigde maatregelen. Vrijgestelde activiteiten vereisen geen aparte Wnb-vergunning.', null, null, 'NL'],
    ['AERIUS-berekening stikstofdepositie', 1, 'AERIUS Calculator is verplicht rekenmodel. Resultaat in mol/ha/jaar. Bij overschrijding KDW is passende beoordeling nodig.', 'Depositie onder 0,005 mol/ha/jaar verwaarloosbaar', 'Vergunning geweigerd bij onvoldoende onderbouwing.', 'NL'],
    ['Soortenbescherming in Natura 2000', 1, 'Naast gebiedsbescherming (art. 2.7) geldt soortenbescherming (art. 3.1-3.5). Ontheffing vereist.', 'Mitigerende maatregelen, werkprotocol', 'Bestuurlijke boete tot 21.750 EUR per overtreding', 'NL'],
    ['Stikstofregistratiesysteem (SSRS)', 0, 'Registreert vrijgekomen stikstofruimte door bronmaatregelen. Toewijzing aan prioritaire projecten.', null, null, 'NL'],
    ['Wateronttrekking nabij Natura 2000', 1, 'Vergunning vereist bij effect op grondwaterafhankelijke habitats. Hydrologische effectbeoordeling verplicht.', 'Maximaal debiet, peilmonitoring, compenserende wateraanvoer', 'Bestuurlijke boete waterschap. Intrekking watervergunning.', 'NL'],
    ['Bouwactiviteit nabij Natura 2000', 1, 'AERIUS-berekening voor bouwfase en gebruiksfase. Passende beoordeling bij overschrijding KDW.', 'Emissiearm bouwmaterieel, bouwperiode buiten broedseizoen', 'Stillegging bouw, bestuurlijke boete, dwangsom.', 'NL'],
    ['Sloopactiviteit nabij Natura 2000', 1, 'AERIUS-berekening nodig als sloop >1 week duurt of zwaar materieel vereist.', 'Natte sloop, werkperiode beperking', 'Bestuurlijke boete, stillegging werkzaamheden', 'NL'],
    ['Begrazing intensivering nabij Natura 2000', 1, 'Vergunning vereist als toename begrazingsdruk significant. AERIUS voor extra ammoniakdepositie.', 'Maximaal dieren per hectare, seizoensbegrazing', 'Bestuurlijke boete, intrekking vergunning', 'NL'],
    ['Drainage nabij Natura 2000', 1, 'Aanleg of verdieping drainage vereist vergunning bij grondwaterafhankelijke habitats.', 'Maximale drainagediepte, monitoring grondwaterstanden', 'Bestuurlijke boete, herstelplicht waterschap', 'NL'],
    ['Ontgronding nabij Natura 2000', 1, 'Ontgronding vereist Ontgrondingenwet + Wnb-vergunning. Passende beoordeling verplicht.', 'Afstand tot Natura 2000-grens, grondwatermonitoring', 'Boete beide vergunningen. Illegale ontgronding: economisch delict.', 'NL'],
    ['Aanplant exoten nabij Natura 2000', 1, 'Vergunning vereist als aanplant verspreiding naar habitat kan veroorzaken. Invasieve exoten verboden.', 'Alleen inheems binnen 500 m van Natura 2000', 'Bestuurlijke boete, verwijderplicht', 'NL'],
    ['Recreatie-uitbreiding nabij Natura 2000', 1, 'Uitbreiding recreatieve voorzieningen vereist vergunning bij meer verstoring.', 'Seizoensbeperkingen, zonering, maximale capaciteit', 'Bestuurlijke boete, stillegging uitbreiding', 'NL'],
    ['Evenementen in of nabij Natura 2000', 1, 'Eenmalige of terugkerende evenementen vereisen voortoets.', 'Maximale geluidsniveaus, afstand tot broedkolonies', 'Bestuurlijke boete. Last onder dwangsom bij herhaling.', 'NL'],
    ['Verlichting nabij Natura 2000 — vleermuizen', 1, 'Kunstmatige verlichting nabij vleermuispopulaties vereist beoordeling.', 'Vleermuisvriendelijke verlichting: amberkleur, <2700K, neerwaarts', 'Bestuurlijke boete soortenbescherming. Dwangsom.', 'NL'],
    ['ADC-toets (Alternatieven, Dwingende redenen, Compensatie)', 1, 'Bij significant negatief effect: vergunning alleen via ADC-toets.', 'Compensatienatuur voor aanvang gerealiseerd', 'Vergunning geweigerd als ADC-toets niet wordt gehaald.', 'NL'],
    ['Intern salderen stikstofdepositie', 0, 'Intern salderen: nieuwe activiteit gesaldeerd met bestaande op zelfde bedrijf. Sinds 2022 geen vergunningplicht maar wel melding.', null, 'Geen boete bij correcte melding.', 'NL'],
    ['Extern salderen stikstofdepositie', 1, 'Extern salderen: stikstofdepositieruimte overnemen van ander bedrijf. 30% afroming.', 'Overeenkomst saldogever/saldonemer, goedkeuring provincie', 'Vergunning geweigerd bij onvoldoende onderbouwing.', 'NL'],
    ['Beheerplan Natura 2000 — procedure en inhoud', 0, 'Opgesteld door provincie in overleg met grondeigenaren. Looptijd 6 jaar met evaluatie.', null, null, 'NL'],
    ['Beheerplan Natura 2000 — participatie en bezwaar', 0, 'Ontwerp-beheerplan 6 weken ter inzage. Zienswijzen mogelijk. Beroep bij rechter.', null, null, 'NL'],
    ['Ontheffing soortenbescherming — ruimtelijke ingrepen', 1, 'Ontheffing Wnb art. 3.3/3.5 vereist bij verstoring beschermde soorten. Aanvraag bij RVO.', 'Mitigatieplan, ecologisch werkprotocol, compensatie leefgebied', 'Boete tot 21.750 EUR. Strafrechtelijke vervolging bij opzet.', 'NL'],
    ['Gedragscodes soortenbescherming', 0, 'Gedragscodes bieden generieke vrijstelling voor specifieke werkzaamheden. Quickscan verplicht.', null, 'Bij niet-naleving: terugval op individuele ontheffingsplicht.', 'NL'],
  ];

  for (const [op, consent, process, conditions, penalties, jur] of natura2000Data) {
    db.run(
      `INSERT INTO sssi_operations (operation, consent_required, process, typical_conditions, penalties, jurisdiction)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [op, consent, process, conditions, penalties, jur],
    );
  }

  // --- Rights of Way ---
  const rowData: [string, string, number, string | null, string, string, string][] = [
    ['Klompenpad', 'Recreatief wandelpad over boerenland. Vrijwillige deelname grondeigenaar.', 1.0, 'Gewasschade voorkomen door routemarkering langs perceelranden.', 'Geen wettelijke termijn. Overeenkomst Wandelnet bepaalt voorwaarden.', 'Geen wettelijke handhaving — privaatrechtelijke overeenkomst.', 'NL'],
    ['LAW-route (langeafstandswandelpad)', 'Langeafstandswandelpad, onderdeel NSWP.', 1.5, 'Routes volgen openbare wegen en paden.', 'Geen wettelijk afdwingbare hersteltermijn.', 'Gemeente kan handhaven als openbaar pad afgesloten.', 'NL'],
    ['Openbaar voetpad (gemeentelijk)', 'Openbaar pad in eigendom gemeente. Onderhoud door gemeente of waterschap.', 1.5, 'Geen gewassen op openbaar pad.', 'Herstel binnen 14 dagen na melding bij gemeente.', 'Strafbaar feit bij blokkade (art. 427 Sr). Bestuursdwang.', 'NL'],
    ['Fietspad (openbaar)', 'Openbaar fietspad. Wettelijke basis: Wegenwet.', 2.0, 'Minimale doorrijhoogte 2,5 m.', 'Herstel conform CROW-richtlijnen.', 'Bestuursrechtelijke handhaving. Aansprakelijkheid bij letsel.', 'NL'],
    ['Jaagpad (langs waterweg)', 'Historisch pad langs kanalen. Nu recreatief. Beheer waterschap/Rijkswaterstaat.', 2.0, 'Geen obstructie. Toegang onderhoud watergang gewaarborgd.', 'Waterschap kan binnen 48 uur onderhoudstoegang afdwingen.', 'Bestuursdwang waterschap. Overtreding Waterwet.', 'NL'],
    ['Ruiterpad', 'Aangewezen pad voor paardrijden. Beheer Staatsbosbeheer/provincie.', 3.0, 'Ruiters alleen op aangewezen ruiterpaden.', 'Geen specifieke hersteltermijn.', 'Boete bij overtreding toegangsregels. BOA bevoegd.', 'NL'],
    ['Afsluiting openbaar pad', 'Alleen met toestemming gemeente (verkeersbesluit of APV).', 0, 'Alternatieve route verplicht bij langdurige afsluiting.', 'Verkeersbesluit procedure: 6 weken zienswijze.', 'Illegale afsluiting: bestuursdwang gemeente.', 'NL'],
    ['Dijkpad', 'Pad langs of op waterkering. Beheer waterschap.', 2.5, 'Geen activiteiten die waterkering verzwakken.', 'Waterschap kan direct handhaven bij schade.', 'Overtreding keur: bestuurlijke boete. Beschadiging waterkering: strafbaar.', 'NL'],
    ['Kerkepad', 'Historisch voetpad naar dorpskerk. Status via Wegenlegger.', 1.0, 'Geen bebouwing of afsluiting als pad op Wegenlegger staat.', 'Gemeente kan pad opnemen in Wegenlegger via raadsbesluit.', 'Afsluiting openbaar kerkepad: bestuursdwang gemeente.', 'NL'],
    ['Schoolpad', 'Historisch pad naar school. Status via Wegenlegger.', 1.2, 'Geen blokkade als pad openbaar is.', 'Herstel door gemeente na melding. Zorgplicht gemeente.', 'Illegale afsluiting: bestuursdwang. Art. 427 Sr.', 'NL'],
    ['Openbaar pad — Wegenwet (status en bewijs)', 'Pad is openbaar als: opgenomen in Wegenlegger, 30 jaar onafgebroken openbaar, of 10 jaar openbaar met onderhoud (Wegenwet art. 4).', 0, null, 'Opname in Wegenlegger via raadsbesluit. Bezwaar binnen 6 weken.', 'Gemeente verantwoordelijk voor onderhoud. Afsluiting: strafbaar.', 'NL'],
    ['Onderhoud openbaar pad — verantwoordelijkheid en kosten', 'Wegbeheerder verantwoordelijk. Kosten ten laste beheerder. Aansprakelijkheid bij gebrekkig onderhoud (art. 6:174 BW).', 0, 'Aanliggende eigenaar moet overhangende takken verwijderen (art. 5:44 BW).', 'Geen wettelijke termijn, maar zorgplicht. Direct handelen bij gevaar.', 'Schadevergoeding bij letsel door gebrekkig onderhoud.', 'NL'],
    ['Toegankelijkheid openbaar pad — mobiliteit en hekken', 'Openbare paden moeten toegankelijk zijn. Hekken alleen met toestemming wegbeheerder. Minimale doorgang 0,9 m (rolstoel).', 1.5, 'Overstapjes waar mogelijk vervangen door klaphek of poort.', 'Gemeente kan overleggen met grondeigenaar over aanpassing.', 'Illegale blokkade: bestuursdwang. Discriminatie-klacht via College Rechten van de Mens.', 'NL'],
    ['Trekkerpad (trekkersveld/trekkersroute)', 'Langeafstandswandelroute met overnachtingsmogelijkheden. Beheer Staatsbosbeheer/Natuurmonumenten.', 1.5, 'Alleen wandelen op aangewezen paden. Kamperen op trekkersvelden.', 'Geen wettelijke hersteltermijn. Beheerder bepaalt onderhoudsniveau.', 'Boete via APV of Wnb. BOA bevoegd. Schadeclaim beheerder.', 'NL'],
  ];

  for (const [pathType, obligation, width, cropping, reinstatement, obstruction, jur] of rowData) {
    db.run(
      `INSERT INTO rights_of_way (path_type, obligation, min_width_m, cropping_rules, reinstatement_deadline, obstruction_liability, jurisdiction)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pathType, obligation, width, cropping, reinstatement, obstruction, jur],
    );
  }

  // --- Common Land / Pachtrecht ---
  const commonData: [string, number, string, string, string][] = [
    ['Reguliere pacht', 1, 'Grondkamer (RVO)', 'Minimaal 6 jaar voor bouwland, 12 jaar voor hoeve. Pachtnormen vastgesteld door RVO. Opzegging via Grondkamer. Voorkeursrecht pachter bij verkoop.', 'NL'],
    ['Geliberaliseerde pacht', 0, 'Geen Grondkamer-toets', 'Korter dan 6 jaar. Vrije prijsvorming. Geen verlenging van rechtswege. Geen voorkeursrecht pachter.', 'NL'],
    ['Teeltpacht', 0, 'Geen Grondkamer-toets', 'Maximaal 1 jaar (of 1 teeltseizoen). Vrije prijs. Geen verlenging.', 'NL'],
    ['Erfpacht', 1, 'Kadaster (registratie); geen Grondkamer-toets', 'Eeuwigdurend of langjarig zakelijk recht. Canon periodiek herzien.', 'NL'],
    ['Pachtnormen 2026 (regionormen)', 0, 'RVO', 'Pachtnormen per pachtprijsgebied (14 regio\'s). Jaarlijks vastgesteld bij ministerieel besluit.', 'NL'],
    ['Pachtprijsgebieden', 0, 'RVO', '14 pachtprijsgebieden: Bouwhoek/Hogeland, Veenkoloniën/Oldambt, Noordelijk weidegebied, Oostelijk veehouderijgebied, Centraal veehouderijgebied, IJsselmeerpolders, Westelijk Holland, Waterland/Droogmakerijen, Hollands/Utrechts weidegebied, Rivierengebied, Zuidwestelijk akkerbouw, Zuidwest-Brabant, Zuidelijk veehouderijgebied, Zuid-Limburg.', 'NL'],
    ['Opzegging reguliere pacht', 1, 'Grondkamer / Pachtkamer', 'Opzegging via Grondkamer. Gronden: eigen gebruik, slecht pachterschap, bestemmingswijziging. Opzegtermijn 3 jaar hoeve, 1 jaar los land.', 'NL'],
    ['Pachtprijsgebied 1: Bouwhoek en Hogeland', 0, 'RVO', 'Akkerbouw kleigrond Groningen. Pachtnorm circa 800 EUR/ha. Graan, aardappelen, suikerbieten.', 'NL'],
    ['Pachtprijsgebied 2: Veenkoloniën en Oldambt', 0, 'RVO', 'Dalgrond en klei Groningen/Drenthe. Pachtnorm circa 650 EUR/ha. Zetmeelaardappelen, graan.', 'NL'],
    ['Pachtprijsgebied 3: Noordelijk weidegebied', 0, 'RVO', 'Grasland Friesland/Groningen. Pachtnorm circa 750 EUR/ha. Melkveehouderij.', 'NL'],
    ['Pachtprijsgebied 4: Oostelijk veehouderijgebied', 0, 'RVO', 'Overijssel/Gelderland zandgrond. Pachtnorm circa 700 EUR/ha. Grasland en mais.', 'NL'],
    ['Pachtprijsgebied 5: Centraal veehouderijgebied', 0, 'RVO', 'Utrecht/Gelderland. Pachtnorm circa 750 EUR/ha. Rundveehouderij.', 'NL'],
    ['Pachtprijsgebied 6: IJsselmeerpolders', 0, 'RVO', 'Flevoland. Pachtnorm circa 900 EUR/ha (hoogste). Aardappelen, suikerbieten, graan, uien.', 'NL'],
    ['Pachtprijsgebied 7: Westelijk Holland', 0, 'RVO', 'Zuid-Holland/Noord-Holland. Pachtnorm circa 600 EUR/ha. Bollenteelt, tuinbouw.', 'NL'],
    ['Pachtprijsgebied 8: Waterland en Droogmakerijen', 0, 'RVO', 'Noord-Holland veenweidegebied. Pachtnorm circa 400 EUR/ha (laagste). Extensieve veehouderij.', 'NL'],
    ['Pachtprijsgebied 9: Hollandse/Utrechtse waarden', 0, 'RVO', 'Rivierklei en veengrond. Pachtnorm circa 700 EUR/ha. Grasland, uiterwaarden.', 'NL'],
    ['Pachtprijsgebied 10: Rivierengebied', 0, 'RVO', 'Gelderland/Zuid-Holland rivierklei. Pachtnorm circa 750 EUR/ha. Akkerbouw, fruitteelt Betuwe.', 'NL'],
    ['Pachtprijsgebied 11: Zuidwestelijk akkerbouwgebied', 0, 'RVO', 'Zeeland/Zuid-Holland zeeklei. Pachtnorm circa 800 EUR/ha. Aardappelen, graan, uien.', 'NL'],
    ['Pachtprijsgebied 12: Zuidelijk veehouderijgebied', 0, 'RVO', 'Noord-Brabant/Limburg zandgrond. Pachtnorm circa 750 EUR/ha. Intensieve veehouderij.', 'NL'],
    ['Pachtprijsgebied 13: Zuid-Limburg', 0, 'RVO', 'Lossgrond (vruchtbare leem). Pachtnorm circa 700 EUR/ha. Akkerbouw, heuvelland.', 'NL'],
    ['Pachtprijsgebied 14: Overig Noord-Holland', 0, 'RVO', 'Klei- en zavelgrond boven het IJ. Pachtnorm circa 650 EUR/ha. Pootaardappelen, bloembollen.', 'NL'],
    ['Pachtcontract — verplichte inhoud', 1, 'Grondkamer', 'Schriftelijk verplicht: partijen, kadastrale aanduiding, pachtprijs, duur, bestemming. Mondelinge pacht nietig sinds 2007.', 'NL'],
    ['Tussentijdse beeindiging pacht', 1, 'Grondkamer / Pachtkamer', 'Alleen bij wederzijds goedvinden, wanprestatie, of bestemmingswijziging. Schadevergoeding pachter mogelijk.', 'NL'],
    ['Geschillenbeslechting — Grondkamer en Pachthof', 1, 'Grondkamer (eerste aanleg) / Pachthof Arnhem (hoger beroep)', 'Geschillen over pachtprijs, onderhoud, opzegging, medepacht, indeplaatsstelling. Griffierecht circa 100-500 EUR.', 'NL'],
    ['Erfpacht — canon berekening', 1, 'Kadaster; notariele akte', 'Canon gebaseerd op grondwaarde x rendementspercentage (2-5%). Periodiek herzien. Gemeentelijke erfpacht kent eigen regels.', 'NL'],
    ['Erfpacht — eeuwigdurend vs tijdelijk', 1, 'Kadaster', 'Eeuwigdurend: loopt onbeperkt, canon herzien. Tijdelijk: bepaalde duur (50 of 99 jaar), terugkeer grond na afloop.', 'NL'],
    ['Verpachtersonderhoud en pachterslasten', 1, 'Grondkamer', 'Verpachter: groot onderhoud. Pachter: klein onderhoud. Grondkamer beslist bij geschil.', 'NL'],
  ];

  for (const [activity, consent, authority, process, jur] of commonData) {
    db.run(
      `INSERT INTO common_land_rules (activity, consent_required, consent_authority, process, jurisdiction)
       VALUES (?, ?, ?, ?, ?)`,
      [activity, consent, authority, process, jur],
    );
  }

  // --- Planting Guidance ---
  const plantingData: [string, string, number | null, number, string, number, string][] = [
    ['Bosaanleg (loofhout)', 'Inheems loofhout (eik, beuk, es, berk, els)', 1.0, 1, 'Provinciale subsidie circa 2.000-5.000 EUR/ha via SNL.', 0, 'NL'],
    ['Bosaanleg (naaldhout)', 'Naaldhout (grove den, douglasspar, lariks)', 1.0, 1, 'Lagere subsidie dan loofhout. Mix met loofhout aanbevolen.', 0, 'NL'],
    ['Bossenstrategie 2030', 'Gemengd (inheems)', null, 0, 'Nationale Bossenstrategie: circa 37.000 ha extra bos.', 0, 'NL'],
    ['LULUCF-compensatie bij ontbossing', 'Compensatieplicht', null, 1, 'EU LULUCF-regeling: ontbossing compenseren met bosaanleg.', 0, 'NL'],
    ['Agroforestry (boslandbouw)', 'Gemengd (fruit, noten, hout)', 0.5, 0, 'GLB eco-regeling circa 200-400 EUR/ha/jaar.', 0, 'NL'],
    ['Soortenkeuze inheems', 'Inheems (eik, beuk, els, wilg, berk, haagbeuk, linde, iep)', null, 0, 'Inheemse soorten aanbevolen voor biodiversiteit en klimaatbestendigheid.', 0, 'NL'],
    ['Oeverbegroeiing langs watergangen', 'Oeverplanten (els, wilg, riet)', null, 0, 'Subsidie via waterschappen of Groen-Blauwe Diensten.', 0, 'NL'],
    ['Natuurcompensatie bij ruimtelijke ontwikkeling', 'Compensatieplicht', null, 1, 'Compensatiebeginsel: oppervlakte en kwaliteit. Provinciale regels variëren.', 0, 'NL'],
    ['Bossenstrategie 2030 — bos binnen NNN', 'Gemengd (klimaatbestendig)', 5.0, 1, 'Circa 15.000 ha binnen NNN, hogere subsidie tot 7.000 EUR/ha.', 0, 'NL'],
    ['Bossenstrategie 2030 — bos buiten NNN', 'Gemengd (productie + biodiversiteit)', 1.0, 0, 'Circa 22.000 ha buiten NNN, subsidie 2.000-4.000 EUR/ha.', 0, 'NL'],
    ['Subsidie bosaanleg — Gelderland', 'Inheems loofhout', 0.5, 0, 'Subsidieregeling Vitaal Gelderland: circa 3.000-5.000 EUR/ha loofhout.', 0, 'NL'],
    ['Subsidie bosaanleg — Noord-Brabant', 'Gemengd (klimaatbestendig)', 1.0, 0, 'Subsidieregeling Natuur Noord-Brabant: circa 3.500-6.000 EUR/ha.', 0, 'NL'],
    ['Soortenkeuze klimaatbestendig — toekomstbomen', 'Klimaatbestendig sortiment', null, 0, 'Toekomstbomen: wintereik, zoete kers, tamme kastanje, elsbes, winterlinde.', 0, 'NL'],
    ['Soortenkeuze — productiebos', 'Productiehout (douglas, lariks, populier, eik)', 2.0, 0, 'Productiebos: douglas 60-80 jaar, populier 20-30 jaar, eik 120+ jaar. FSC/PEFC aanbevolen.', 0, 'NL'],
    ['Voedselbos (food forest)', 'Meerlagig (boom, struik, kruid, bodembedekker)', 0.25, 0, 'Aanlegkosten circa 10.000-20.000 EUR/ha. Stichting Voedselbosbouw adviseert.', 0, 'NL'],
    ['Silvopasture (bomen met begrazing)', 'Loofhout (eik, wilg, els) met grasland', 1.0, 0, 'GLB eco-regeling 200-300 EUR/ha/jaar. Max 100 bomen/ha voor graslandsubsidie.', 0, 'NL'],
    ['Silvoarable (bomen met akkerbouw)', 'Rijenbeplanting (walnoot, populier, kers)', 2.0, 0, 'Bomenrijen op 25-50 m afstand. Aanlegsubsidie 1.500-3.000 EUR/ha.', 0, 'NL'],
    ['Agroforestry — regelgeving en perceelstatus', 'Gemengd', null, 0, 'Percelen >50 bomen/ha tellen als bos (Wnb). GLB-betaalrechten: <100 bomen/ha grasland, <50 bomen/ha bouwland.', 0, 'NL'],
    ['Bosbeheer — kap en verjonging', 'Inheems (natuurlijke verjonging prioriteit)', null, 0, 'Kaalkap <0,5 ha regulier bosbeheer. Gedragscode Bosbeheer vrijstelling soortenbescherming. SNL circa 50-100 EUR/ha/jaar.', 0, 'NL'],
    ['Bosbeheer — hakhout en middenbos', 'Inheems loofhout (eik, es, hazelaar, els)', null, 0, 'Hakhout cyclus 7-25 jaar. Middenbos: hakhout + overstaanders. SNL beheertype N16.01.', 0, 'NL'],
    ['Bosbrandpreventie — risicogebieden en maatregelen', 'Naaldhout en gemengd', null, 0, 'Risicogebieden: Veluwe, Noord-Brabant, Drenthe. Brandstroken 10-30 m, loofhoutstroken, rookverbod april-november.', 0, 'NL'],
  ];

  for (const [purpose, species, minArea, eia, grant, buffer, jur] of plantingData) {
    db.run(
      `INSERT INTO planting_guidance (purpose, species_group, min_area_ha, eia_screening_required, grant_available, ancient_woodland_buffer_m, jurisdiction)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [purpose, species, minArea, eia, grant, buffer, jur],
    );
  }

  // --- TPO Rules ---
  const tpoData: [string, number, string, string | null, string | null, string | null, string | null, string][] = [
    ['Werkzaamheden aan monumentale boom', 1, 'Gemeente (via APV)', 'Alleen snoei door gecertificeerd boomverzorger.', 'Aanvraag kapvergunning bij gemeente. BEA vaak vereist.', 'Boete tot 25.000 EUR. Herplantplicht.', 'Gemeentelijke APV; Bomenverordening', 'NL'],
    ['Dode of gevaarlijke monumentale boom', 0, 'Gemeente (melding achteraf)', 'Noodkap bij acuut gevaar zonder vergunning. Fotodocumentatie bewaren.', 'Zo snel mogelijk melden na kap.', 'Geen boete bij gerechtvaardigd gevaar.', 'Gemeentelijke APV', 'NL'],
    ['Bouw nabij beschermde boom', 1, 'Gemeente (omgevingsvergunning + APV)', 'Kroonprojectie + 1,5 m als beschermingszone.', 'Omgevingsvergunning bouwen + beoordeling effect.', 'Stillegging bouw. Dwangsom. Boete tot 25.000 EUR.', 'Gemeentelijke APV; Omgevingswet', 'NL'],
    ['Beschermde bomen in bestemmingsplan', 1, 'Gemeente (bestemmingsplan/omgevingsplan)', null, 'Wijziging vereist planherziening.', 'Bestuursrechtelijke handhaving, dwangsom.', 'Wet ruimtelijke ordening; Omgevingswet', 'NL'],
    ['Bomenverordening versus APV', 1, 'Gemeente', null, 'Aparte Bomenverordening naast de APV. Specifieke regels beschermde bomen.', 'Boete per verordening: 5.000-25.000 EUR.', 'Gemeentelijke Bomenverordening; APV', 'NL'],
    ['Waardebepaling monumentale boom', 0, 'Gemeente / taxateur', null, 'NVTB-methode: stamomtrek, soort, conditie, levensverwachting. Waarde tot 50.000-100.000 EUR.', null, 'NVTB-methode; gemeentelijke APV', 'NL'],
  ];

  for (const [scenario, consent, authority, exemptions, process, penalties, ref, jur] of tpoData) {
    db.run(
      `INSERT INTO tpo_rules (scenario, consent_required, consent_authority, exemptions, process, penalties, regulation_ref, jurisdiction)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [scenario, consent, authority, exemptions, process, penalties, ref, jur],
    );
  }

  // --- FTS5 Search Index ---
  const ftsData: [string, string, string, string][] = [
    ['Meldingsplicht kap houtopstand', 'Onder de Wet natuurbescherming (art. 4.2) moet het kappen van een houtopstand groter dan 10 are of een bomenrij van 20+ bomen buiten de bebouwde kom worden gemeld bij de provincie. Minimaal 1 maand voor de geplande kap.', 'hedgerow', 'NL'],
    ['Herplantplicht na kap', 'Na het kappen van een meldingsplichtige houtopstand geldt een herplantplicht: binnen 3 jaar dezelfde oppervlakte herbeplanten. Mag op andere locatie binnen de provincie mits goedgekeurd door Gedeputeerde Staten.', 'hedgerow', 'NL'],
    ['Kapvergunning binnen bebouwde kom', 'Binnen de bebouwde kom regelt de gemeente het kappen van bomen via de APV (Algemene Plaatselijke Verordening). Per gemeente gelden andere drempels (stamdiameter, soort, locatie). Aanvraag kapvergunning bij gemeente.', 'hedgerow', 'NL'],
    ['Uitzonderingen meldingsplicht kap', 'Geen meldingsplicht voor: fruitbomen en notenbomen, windschermen langs landbouwgrond (max 2 rijen), kwekerij-beplanting, dunning tot 20% van stammen, bomenrijen onder 20 bomen. Altijd gemeentelijke APV checken.', 'hedgerow', 'NL'],
    ['Monumentale bomen bescherming', 'Monumentale bomen staan op gemeentelijke lijsten en zijn beschermd via de APV of bomenverordening. Kap alleen bij direct gevaar voor personen of gebouwen. Boete tot 25.000 EUR bij ongeoorloofde kap.', 'hedgerow', 'NL'],
    ['Houtwallen en houtsingels', 'Houtwallen en houtsingels (lijnvormige beplanting) vallen onder de Wet natuurbescherming als ze groter zijn dan 10 are of 20+ bomen bevatten. Ecologisch waardevolle landschapselementen. Meldingsplicht en herplantplicht van toepassing.', 'hedgerow', 'NL'],
    ['Landschapselementen houtwal singel elzensingel knotbomenrij', 'Beschermde landschapselementen: houtwallen, singels, elzensingels (Friese Wouden), knotbomenrijen. Bescherming via provinciale verordening en ANLb-subsidie.', 'hedgerow', 'NL'],
    ['Provinciale bescherming landschapselementen', 'Provincies hebben aanvullende regels bovenop Wnb. Omgevingsverordening per provincie bepaalt beschermde elementen, vergunningplicht, en compensatieverplichtingen.', 'hedgerow', 'NL'],
    ['Groenblauwe dooradering subsidie', 'Netwerk van groene en blauwe landschapselementen. Subsidie via ANLb, minimaal 6 jaar beheerovereenkomst, monitoring door agrarisch collectief.', 'hedgerow', 'NL'],
    ['Herplant soortenkeuze plantafstand controle', 'Bij herplantplicht: voorkeur inheems loofhout. Plantafstand per soort: eik 4-6 m, berk 3-4 m. Controle na 3 jaar: 80% moet aangeslagen zijn.', 'hedgerow', 'NL'],

    ['Boswet-melding en wachttijd', 'Na melding van voorgenomen kap bij de provincie geldt een wachttijd van 1 maand (4 weken). Gedurende deze periode mag niet worden gekapt. Provincie kan bezwaar maken of aanvullende eisen stellen.', 'felling', 'NL'],
    ['Strafmaat illegale kap', 'Kappen zonder vergunning of melding: maximale boete 21.750 EUR per overtreding (Wet op de economische delicten). Bestuursdwang door provincie of gemeente. Herplantplicht blijft altijd gelden.', 'felling', 'NL'],
    ['Uitzonderingen kapvergunning', 'Uitgezonderd van meldingsplicht: fruitbomen, notenbomen, kwekerij-beplanting, windschermen (max 2 rijen), dunning onder 20% per 10 jaar. Noodkap bij gevaar zonder voorafgaande vergunning, maar achteraf melden.', 'felling', 'NL'],
    ['Ontheffing herplantplicht', 'Ontheffing van herplantplicht aanvragen bij Gedeputeerde Staten. Alleen bij zwaarwegend maatschappelijk belang (woningbouw, infrastructuur). Compensatie in de vorm van bosaanleg elders kan worden vereist.', 'felling', 'NL'],
    ['Noodkap gevaarlijke boom', 'Bij direct gevaar voor personen of gebouwen mag een boom zonder voorafgaande vergunning worden geveld (noodkap). Achteraf melden bij gemeente of provincie. Herplantplicht blijft gelden. Fotodocumentatie bewaren als bewijs.', 'felling', 'NL'],
    ['Kapvergunning stedelijk versus landelijk', 'Stedelijk: lagere drempel stamomtrek >30 cm. Landelijk: primair Wnb-meldingsplicht. Gemeentelijke APV kan aanvullend gelden.', 'felling', 'NL'],
    ['Noodkap iepziekte essentaksterfte', 'Iepziekte: versnelde procedure. Essentaksterfte: geen automatische vrijstelling, beoordeling per boom. Herplantplicht blijft gelden.', 'felling', 'NL'],
    ['Boscompensatie compensatiefonds', 'Storting in provinciaal groenfonds of Boscompensatiefonds: circa 15.000-25.000 EUR/ha. Aanvraag bij Gedeputeerde Staten.', 'felling', 'NL'],
    ['Boswet-ontheffingen woningbouw infrastructuur natuur', 'Ontheffing bij woningbouw (compensatie), infrastructuur (Boscompensatiefonds), natuurontwikkeling (omvorming bos naar heide/moeras).', 'felling', 'NL'],
    ['Beschermde boomsoorten exoten vleermuizen', 'Bomen met vleermuisverblijfplaatsen extra beschermd. Invasieve exoten: verwijdering gestimuleerd, geen meldingsplicht in goedgekeurd beheerplan.', 'felling', 'NL'],

    ['Natura 2000 vergunningplicht', 'Nederland heeft 161 Natura 2000-gebieden. Activiteiten met significant effect vereisen vergunning (Wnb art. 2.7). Voortoets bepaalt of passende beoordeling nodig is.', 'sssi', 'NL'],
    ['AERIUS stikstofdepositie berekening', 'AERIUS Calculator: verplicht rekenmodel. Berekent NOx en NH3 depositie op habitats. Bij overschrijding KDW passende beoordeling nodig.', 'sssi', 'NL'],
    ['Stikstofproblematiek en vergunningen', 'PAS-uitspraak 2019 beperkt vergunningverlening. Intern salderen mogelijk. Extern salderen 30% afroming.', 'sssi', 'NL'],
    ['Passende beoordeling Natura 2000', 'Verplicht bij significante effecten. Beoordeelt effecten op instandhoudingsdoelen. Cumulatie met andere plannen.', 'sssi', 'NL'],
    ['Beheerplannen Natura 2000-gebieden', 'Beheerplan per gebied: instandhoudingsdoelen, toegestane activiteiten, vrijstellingen. Vastgesteld door provincie of Rijkswaterstaat.', 'sssi', 'NL'],
    ['Wateronttrekking drainage ontgronding Natura 2000', 'Grondwateronttrekking, drainage, ontgronding nabij Natura 2000 vereisen vergunning bij hydrologisch effect.', 'sssi', 'NL'],
    ['Bouw sloop begrazing Natura 2000', 'AERIUS-berekening voor bouwfase en gebruiksfase. Emissiearm materieel. Begrazing-intensivering: vergunning bij extra ammoniakemissie.', 'sssi', 'NL'],
    ['Evenementen verlichting recreatie Natura 2000', 'Evenementen, recreatie-uitbreiding, verlichting: voortoets verplicht. Vleermuisvriendelijke verlichting aanbevolen.', 'sssi', 'NL'],
    ['ADC-toets Alternatieven Dwingende Compensatie', 'Bij significant negatief effect: vergunning alleen via ADC-toets. Compensatienatuur voor aanvang gerealiseerd.', 'sssi', 'NL'],
    ['Intern extern salderen stikstof', 'Intern: geen vergunningplicht sinds 2022, wel melding. Extern: 30% afroming, alleen feitelijk gerealiseerde capaciteit.', 'sssi', 'NL'],
    ['Soortenbescherming ontheffing gedragscode', 'Ontheffing Wnb art. 3.3/3.5 bij RVO. Gedragscodes voor generieke vrijstelling. Quickscan altijd verplicht.', 'sssi', 'NL'],

    ['Klompenpaden wandelpaden boerenland', 'Recreatieve wandelpaden over boerenland. Vrijwillige deelname. Privaatrechtelijke overeenkomst.', 'rights_of_way', 'NL'],
    ['Langeafstandswandelpaden LAW routes', 'LAW-routes, onderdeel NSWP. Openbare wegen en paden met recht van overpad.', 'rights_of_way', 'NL'],
    ['Afsluiting openbaar pad', 'Alleen met toestemming gemeente (verkeersbesluit). Illegale afsluiting: bestuursdwang.', 'rights_of_way', 'NL'],
    ['Onderhoud openbare paden', 'Gemeente onderhoud. Blokkade verboden. Herstel binnen 14 dagen na melding.', 'rights_of_way', 'NL'],
    ['Jaagpaden dijkpaden kerkepad schoolpad', 'Jaagpaden: langs kanalen. Dijkpaden: waterkeringen. Kerkepaden en schoolpaden: historisch, status via Wegenlegger.', 'rights_of_way', 'NL'],
    ['Openbaar versus privaat Wegenwet', 'Openbaar als: Wegenlegger, 30 jaar openbaar, of 10 jaar met onderhoud. Wegenwet art. 4.', 'rights_of_way', 'NL'],
    ['Onderhoud wie betaalt aansprakelijkheid', 'Wegbeheerder verantwoordelijk. Aanliggende eigenaren: takken verwijderen. Aansprakelijkheid bij letsel (art. 6:174 BW).', 'rights_of_way', 'NL'],
    ['Toegankelijkheid hekken overstapjes mobiliteit', 'Hekken: minimaal 0,9 m doorgang. Overstapjes: vervangen door klaphek. VN-Verdrag handicap.', 'rights_of_way', 'NL'],

    ['Reguliere pacht voorwaarden', 'Minimaal 6 jaar bouwland, 12 jaar hoevepacht. Pachtnormen RVO. Opzegging via Grondkamer. Voorkeursrecht bij verkoop.', 'common_land', 'NL'],
    ['Geliberaliseerde pacht', 'Korter dan 6 jaar, vrije prijsvorming, geen Grondkamer-toets, geen voorkeursrecht pachter.', 'common_land', 'NL'],
    ['Pachtnormen per regio', '14 pachtprijsgebieden: IJsselmeerpolders 900 (hoogste), Waterland 400 (laagste). Jaarlijks bij ministerieel besluit.', 'common_land', 'NL'],
    ['Erfpacht zakelijk recht', 'Erfpacht: canon (2-5% grondwaarde), eeuwigdurend of tijdelijk, Kadaster registratie.', 'common_land', 'NL'],
    ['Pachtprijsgebieden 14 regio normen', 'Bouwhoek 800, Veenkoloniën 650, Noordelijk weide 750, Oostelijk 700, Centraal 750, IJsselmeer 900, Westelijk 600, Waterland 400, Hollands/Utrechts 700, Rivieren 750, Zuidwest 800, Zuidelijk 750, Zuid-Limburg 700, Overig NH 650 EUR/ha.', 'common_land', 'NL'],
    ['Pachtcontract geschillen Grondkamer Pachthof', 'Schriftelijk verplicht. Grondkamer toetst. Geschillen: Grondkamer eerste aanleg, Pachthof Arnhem hoger beroep. Tussentijdse beeindiging beperkt.', 'common_land', 'NL'],
    ['Erfpacht canon eeuwigdurend tijdelijk', 'Eeuwigdurend: onbeperkt, canon herzien. Tijdelijk: 50/99 jaar, terugkeer grond. Gemeentelijke erfpacht eigen regels.', 'common_land', 'NL'],

    ['Subsidie bosaanleg provincie', 'Provinciale subsidies circa 2.000-5.000 EUR/ha via SNL of provinciale regelingen.', 'planting', 'NL'],
    ['Bossenstrategie 37.000 hectare extra bos', '10% meer bos in 2030: circa 37.000 ha. Binnen NNN 15.000 ha (tot 7.000 EUR/ha), buiten NNN 22.000 ha (2.000-4.000 EUR/ha).', 'planting', 'NL'],
    ['Inheemse boomsoorten aanbeveling', 'Zomereik, wintereik, beuk, zwarte els, zachte berk, schietwilg, haagbeuk, winterlinde.', 'planting', 'NL'],
    ['LULUCF compensatieplicht ontbossing', 'EU LULUCF: ontbossing compenseren met bosaanleg. Geldt bovenop nationale herplantplicht.', 'planting', 'NL'],
    ['Agroforestry boslandbouw subsidie varianten', 'Voedselbos (10.000-20.000 EUR/ha), silvopasture (bomen+begrazing), silvoarable (bomenrijen+akkers). GLB eco-regeling 200-400 EUR/ha/jaar.', 'planting', 'NL'],
    ['Klimaatbestendig sortiment toekomstbomen', 'Wintereik, zoete kers, tamme kastanje, elsbes, winterlinde. Vermijden: beuk op zand, fijnspar (borkever).', 'planting', 'NL'],
    ['Bosbeheer hakhout middenbos verjonging', 'Kaalkap <0,5 ha regulier. Hakhout 7-25 jaar cyclus. Middenbos: hakhout + overstaanders. Gedragscode Bosbeheer.', 'planting', 'NL'],
    ['Bosbrandpreventie risicogebieden', 'Veluwe, Noord-Brabant, Drenthe. Brandstroken, loofhoutstroken, rookverbod april-november.', 'planting', 'NL'],

    ['Monumentale boom werkzaamheden waardebepaling', 'Alleen gecertificeerd boomverzorger. BEA vaak vereist. NVTB-waardebepaling: tot 50.000-100.000 EUR.', 'tpo', 'NL'],
    ['Beschermde bomen bestemmingsplan bomenverordening', 'Bescherming via bestemmingsplan of Bomenverordening. Overtreding: dwangsom, bestuursdwang. Boete 5.000-25.000 EUR.', 'tpo', 'NL'],
  ];

  for (const [title, body, topic, jur] of ftsData) {
    db.run(
      `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
      [title, body, topic, jur],
    );
  }

  // --- Metadata ---
  db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', '2026-04-04')", []);
  db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', '2026-04-04')", []);

  return db;
}
