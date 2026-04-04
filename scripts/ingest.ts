/**
 * Netherlands Land & Woodland MCP — Data Ingestion Script
 *
 * Sources:
 *   - Wet natuurbescherming (Wnb) art. 4.2-4.6 — houtopstanden, herplantplicht
 *   - Kadaster — grondregistratie, erfpacht
 *   - Staatsbosbeheer — Bossenstrategie, bosaanleg
 *   - RVO Pachtbeleid — pachtnormen, pachtprijsgebieden
 *   - Natura 2000 beheerplannen — vergunningplicht, AERIUS, KDW
 *   - Gemeentelijke APV — kapvergunning binnen bebouwde kom
 *
 * Usage: npm run ingest
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');

const now = new Date().toISOString().split('T')[0];

// ─── Clear existing data ─────────────────────────────────────────────
db.run('DELETE FROM hedgerow_rules', []);
db.run('DELETE FROM felling_rules', []);
db.run('DELETE FROM sssi_operations', []);
db.run('DELETE FROM rights_of_way', []);
db.run('DELETE FROM common_land_rules', []);
db.run('DELETE FROM planting_guidance', []);
db.run('DELETE FROM tpo_rules', []);
db.instance.exec('DELETE FROM search_index');

// ─── Hedgerow / Houtopstand Rules ────────────────────────────────────
// Wet natuurbescherming art. 4.2-4.6 + gemeentelijke APV
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
];

for (const [action, notice, exemptions, criteria, penalties, ref, jur] of hedgerowData) {
  db.run(
    `INSERT INTO hedgerow_rules (action, notice_required, exemptions, important_hedgerow_criteria, penalties, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [action, notice, exemptions, criteria, penalties, ref, jur],
  );
}

console.log(`Inserted ${hedgerowData.length} hedgerow/houtopstand rules`);

// ─── Felling Rules (Kapvergunning) ───────────────────────────────────
const fellingData: [string, number, number | null, number | null, string | null, string | null, string | null, string | null, string][] = [
  [
    'Standaard kap buiten bebouwde kom',
    1,
    null,
    0.1,
    null,
    'Melding bij provincie (Wet natuurbescherming art. 4.2). Minimaal 1 maand wachttijd na melding. Herplantplicht binnen 3 jaar.',
    'Bestuurlijke boete tot 21.750 EUR. Bestuursdwang: provincie kan herplant afdwingen.',
    'Wet natuurbescherming art. 4.2-4.6',
    'NL',
  ],
  [
    'Kap binnen bebouwde kom (APV)',
    1,
    null,
    null,
    'Regels per gemeente: stamdiameter-drempels (vaak >15 cm op 1,3 m hoogte), soortvrijstellingen, erfbeplanting',
    'Kapvergunning aanvragen bij gemeente. Behandeltermijn 8 weken (regulier) of 26 weken (uitgebreid). Bezwaar en beroep mogelijk.',
    'Bestuursdwang en bestuurlijke boete per gemeentelijke APV',
    'Gemeentelijke APV',
    'NL',
  ],
  [
    'Fruitbomen en notenbomen',
    0,
    null,
    null,
    'Fruitbomen en notenbomen zijn uitgezonderd van de meldingsplicht onder de Wet natuurbescherming.',
    null,
    null,
    'Wet natuurbescherming art. 4.2 lid 3',
    'NL',
  ],
  [
    'Gevaarlijke boom (noodkap)',
    0,
    null,
    null,
    'Noodkap bij direct gevaar voor personen of gebouwen. Achteraf melden bij gemeente of provincie. Herplantplicht blijft gelden.',
    'Zo spoedig mogelijk melden na kap. Fotodocumentatie van de gevaarlijke situatie bewaren.',
    null,
    'Wet natuurbescherming art. 4.2; gemeentelijke APV',
    'NL',
  ],
  [
    'Dunning onder 20%',
    0,
    null,
    null,
    'Dunning van minder dan 20% van het stamtal per 10 jaar is uitgezonderd van de meldingsplicht. Geldt als regulier bosbeheer.',
    null,
    null,
    'Wet natuurbescherming art. 4.2 lid 3',
    'NL',
  ],
  [
    'Kwekerij-beplanting',
    0,
    null,
    null,
    'Bomen op kwekerijen en boomgaarden (bedrijfsmatige teelt) zijn uitgezonderd van de meldingsplicht.',
    null,
    null,
    'Wet natuurbescherming art. 4.2 lid 3',
    'NL',
  ],
  [
    'Windschermen langs landbouwgrond',
    0,
    null,
    null,
    'Windschermen langs landbouwgronden (niet breder dan 2 rijen) zijn uitgezonderd van de meldingsplicht onder Wnb.',
    null,
    null,
    'Wet natuurbescherming art. 4.2 lid 3',
    'NL',
  ],
  [
    'Herplantplicht (algemeen)',
    1,
    null,
    null,
    null,
    'Na kap van meldingsplichtige houtopstand: herplant binnen 3 jaar op zelfde oppervlakte. Mag op andere locatie binnen provincie mits goedgekeurd. Aanvragen ontheffing bij provincie.',
    'Bij niet nakomen: bestuursdwang door provincie, kosten voor rekening eigenaar',
    'Wet natuurbescherming art. 4.3',
    'NL',
  ],
  [
    'Ontheffing herplantplicht',
    1,
    null,
    null,
    'Ontheffing bij zwaarwegend maatschappelijk belang (woningbouw, infrastructuur). Compensatie in de vorm van bosaanleg elders kan worden gevraagd.',
    'Aanvragen bij Gedeputeerde Staten van de provincie. Onderbouwing met ruimtelijke plannen of maatschappelijke noodzaak.',
    null,
    'Wet natuurbescherming art. 4.4',
    'NL',
  ],
  [
    'Boswet-melding wachttijd',
    1,
    null,
    null,
    null,
    'Na melding bij provincie geldt een wachttijd van 1 maand (4 weken). Gedurende deze periode mag niet worden gekapt. Provincie kan bezwaar maken.',
    'Kap tijdens wachttijd: bestuurlijke boete en herplantplicht',
    'Wet natuurbescherming art. 4.2 lid 1',
    'NL',
  ],
  [
    'Strafmaat overtreding kapregels',
    1,
    null,
    null,
    null,
    null,
    'Maximale boete 21.750 EUR per overtreding (Wet op de economische delicten). Bij herhaling hogere straf. Bestuursdwang mogelijk.',
    'Wet op de economische delicten; Wet natuurbescherming',
    'NL',
  ],
];

for (const [scenario, lic, m3, ha, exemptions, process, penalties, ref, jur] of fellingData) {
  db.run(
    `INSERT INTO felling_rules (scenario, licence_required, threshold_m3, threshold_ha, exemptions, application_process, penalties, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [scenario, lic, m3, ha, exemptions, process, penalties, ref, jur],
  );
}

console.log(`Inserted ${fellingData.length} felling rules`);

// ─── Natura 2000 (equivalent of SSSI) ───────────────────────────────
const natura2000Data: [string, number, string, string | null, string, string][] = [
  [
    'Nieuwbouw stal nabij Natura 2000',
    1,
    'Vergunningaanvraag bij provincie (Wnb art. 2.7). AERIUS-berekening voor stikstofdepositie verplicht. Passende beoordeling als KDW (Kritische Depositie Waarde) wordt overschreden. Vergunning kan worden geweigerd bij significant negatief effect.',
    'Maximale stikstofdepositie binnen KDW, emissiereducerende maatregelen, compensatieplan indien nodig',
    'Bestuurlijke boete tot 21.750 EUR (economisch delict). Stillegging bouw. Dwangsom per dag overtreding.',
    'NL',
  ],
  [
    'Uitbreiding veestapel',
    1,
    'Vergunning vereist (Wnb art. 2.7). AERIUS-berekening voor extra stikstofdepositie. Intern salderen mogelijk (minder dieren elders). Extern salderen met andere vergunninghouder mogelijk mits 30% afroming.',
    'Emissiereductie per dierplaats, luchtwassers, maximale depositie op Natura 2000-habitat',
    'Bestuurlijke boete, intrekking vergunning, dwangsom',
    'NL',
  ],
  [
    'Grondverzet in of nabij Natura 2000',
    1,
    'Vergunning vereist als grondverzet stikstofdepositie, bodemverstoring, of hydrologisch effect veroorzaakt. AERIUS-berekening voor machinaal grondverzet. Quickscan flora en fauna verplicht.',
    'Werkperiode buiten broedseizoen, geen werkzaamheden in natte periodes, herstelmaatregelen na afronding',
    'Bestuurlijke boete, dwangsom, herstelplicht',
    'NL',
  ],
  [
    'Recreatief medegebruik Natura 2000',
    1,
    'Vergunning nodig als activiteit significante verstoring kan veroorzaken (bijv. evenementen, motorcross, kitesurfen in beschermd gebied). Voortoets of passende beoordeling afhankelijk van omvang. Beheerplan kan generieke vrijstelling geven voor extensieve recreatie (wandelen, fietsen).',
    'Seizoensbeperkingen (broedseizoen), routegebonden recreatie, maximale bezoekersaantallen',
    'Bestuurlijke boete, last onder dwangsom bij herhaalde overtreding',
    'NL',
  ],
  [
    'Bemesting nabij Natura 2000',
    1,
    'Bemesting op of nabij Natura 2000-gebieden met stikstofgevoelige habitats vereist beoordeling. Mestgebruiksnormen gelden (Meststoffenwet). Aanvullende provinciale regels mogelijk. AERIUS-berekening voor ammoniakdepositie.',
    'Bufferzone langs Natura 2000-grens (variabel, vaak 200-250 m), emissiearme mesttoediening, maximale gebruiksnormen',
    'Boete Meststoffenwet tot 50.000 EUR. Bestuurlijke boete Wnb tot 21.750 EUR.',
    'NL',
  ],
  [
    'Waterpeilwijziging nabij Natura 2000',
    1,
    'Vergunning vereist als hydrologisch effect op Natura 2000-habitat verwacht. Waterschap en provincie beoordelen gezamenlijk. Effectbeoordeling op grondwaterafhankelijke habitats (natte heide, venen, beekdalen).',
    'Peilbesluit waterschap, monitoring grondwaterstanden, herstelmaatregelen bij schade',
    'Bestuurlijke boete, dwangsom, herstelplicht waterschap',
    'NL',
  ],
  [
    'Beheerplannen Natura 2000',
    0,
    'Elke Natura 2000-gebied heeft een beheerplan (vastgesteld door provincie of Rijkswaterstaat). Het beheerplan beschrijft instandhoudingsdoelen, toegestane activiteiten, en benodigde maatregelen. Activiteiten die in het beheerplan als vrijgesteld zijn opgenomen vereisen geen aparte Wnb-vergunning.',
    null,
    null,
    'NL',
  ],
  [
    'AERIUS-berekening stikstofdepositie',
    1,
    'AERIUS Calculator is het verplichte rekenmodel voor stikstofdepositieberekeningen bij vergunningaanvragen. Berekent depositie van NOx en NH3 op Natura 2000-habitats. Resultaat in mol/ha/jaar. Bij overschrijding KDW is passende beoordeling nodig.',
    'Depositie onder 0,005 mol/ha/jaar (afkapgrens AERIUS) wordt als verwaarloosbaar beschouwd',
    'Vergunning geweigerd bij onvoldoende onderbouwing. Geen directe boete voor verkeerde berekening, maar illegale activiteit zonder vergunning: economisch delict.',
    'NL',
  ],
  [
    'Soortenbescherming in Natura 2000',
    1,
    'Naast gebiedsbescherming (Wnb art. 2.7) geldt ook soortenbescherming (Wnb art. 3.1-3.5). Verstoring van beschermde soorten (bijv. bruine kiekendief, kamsalamander, vleermuizen) vereist ontheffing. Quickscan ecologie als eerste stap.',
    'Mitigerende maatregelen, werkprotocol beschermde soorten, ecologische begeleiding',
    'Bestuurlijke boete tot 21.750 EUR per overtreding soortenbescherming',
    'NL',
  ],
  [
    'Stikstofregistratiesysteem (SSRS)',
    0,
    'Het Stikstofregistratiesysteem registreert vrijgekomen stikstofruimte door bronmaatregelen (snelheidsverlaging, warme sanering veehouderij, etc.). Beschikbare ruimte wordt toegedeeld aan prioritaire projecten (woningbouw, infrastructuur). Geen directe vergunning nodig, maar toewijzing stikstofruimte vereist goedkeuring minister.',
    null,
    null,
    'NL',
  ],
];

for (const [op, consent, process, conditions, penalties, jur] of natura2000Data) {
  db.run(
    `INSERT INTO sssi_operations (operation, consent_required, process, typical_conditions, penalties, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [op, consent, process, conditions, penalties, jur],
  );
}

console.log(`Inserted ${natura2000Data.length} Natura 2000 operations`);

// ─── Rights of Way (Openbare paden) ──────────────────────────────────
const rowData: [string, string, number, string | null, string, string, string][] = [
  [
    'Klompenpad',
    'Recreatief wandelpad over boerenland. Vrijwillige deelname grondeigenaar. Stichting Wandelnet beheert netwerk.',
    1.0,
    'Gewasschade voorkomen door routemarkering langs perceelranden. Geen recht op schadevergoeding voor grondeigenaar tenzij contractueel vastgelegd.',
    'Geen wettelijke termijn. Overeenkomst tussen Stichting Wandelnet en grondeigenaar bepaalt voorwaarden.',
    'Afsluiting zonder overleg met Stichting Wandelnet kan leiden tot reputatieschade. Geen wettelijke handhaving — privaatrechtelijke overeenkomst.',
    'NL',
  ],
  [
    'LAW-route (langeafstandswandelpad)',
    'Langeafstandswandelpad (LAW), onderdeel van het NSWP (Nationaal Strategisch Wandelpadenplan). Recht van overpad gebaseerd op overeenkomsten met grondeigenaren of openbare wegen.',
    1.5,
    'Routes volgen zoveel mogelijk openbare wegen en paden. Bij doorgang over privégrond: toestemming eigenaar vereist.',
    'Geen wettelijk afdwingbare hersteltermijn. Overleg met gemeente en Wandelnet bij verstoringen.',
    'Geen strafrechtelijke sanctie bij afsluiting privépad. Gemeente kan handhaven als openbaar pad is afgesloten.',
    'NL',
  ],
  [
    'Openbaar voetpad (gemeentelijk)',
    'Openbaar pad in eigendom of beheer van gemeente. Onderhoud door gemeente of waterschap.',
    1.5,
    'Geen gewassen op openbaar pad. Gemeente verantwoordelijk voor onderhoud. Aanliggende eigenaar mag niet blokkeren.',
    'Herstel binnen 14 dagen na melding bij gemeente. Spoedherstel bij gevaarlijke situatie.',
    'Strafbaar feit bij opzettelijke blokkade openbaar pad (Wetboek van Strafrecht art. 427). Gemeente kan bestuursdwang opleggen.',
    'NL',
  ],
  [
    'Fietspad (openbaar)',
    'Openbaar fietspad. Onderhoud door wegbeheerder (gemeente, provincie, of waterschap). Wettelijke basis: Wegenwet.',
    2.0,
    'Geen belemmering door gewassen of materialen. Minimale doorrijhoogte 2,5 m. Verlichting bij onverlichte gebieden aanbevolen.',
    'Herstel conform onderhoudsnormen wegbeheerder. CROW-richtlijnen voor fietspaden.',
    'Blokkade van openbaar fietspad: bestuursrechtelijke handhaving door wegbeheerder. Aansprakelijkheid bij letsel door gebrekkig onderhoud.',
    'NL',
  ],
  [
    'Jaagpad (langs waterweg)',
    'Historisch pad langs kanalen en rivieren, oorspronkelijk voor trekschuiten. Veel jaagpaden zijn nu recreatief wandel- of fietspad. Beheer door waterschap of Rijkswaterstaat.',
    2.0,
    'Geen obstructie door aanliggende eigenaren. Toegang voor onderhoud watergang door waterschap moet gewaarborgd blijven.',
    'Waterschap kan binnen 48 uur onderhoudstoegang afdwingen bij blokkade.',
    'Waterschap kan bestuursdwang opleggen. Blokkade onderhoudstoegang: overtreding Waterwet.',
    'NL',
  ],
  [
    'Ruiterpad',
    'Aangewezen pad voor paardrijden. Veelal in natuurgebieden beheerd door Staatsbosbeheer of provincie. Niet alle wandelpaden zijn open voor ruiters.',
    3.0,
    'Ruiters alleen op aangewezen ruiterpaden. Honden aangelijnd in natuurgebieden. Geen ruiters op voetpaden tenzij specifiek aangewezen.',
    'Geen specifieke hersteltermijn. Beheerder (Staatsbosbeheer/provincie) bepaalt onderhoudsniveau.',
    'Boete bij overtreding toegangsregels natuurgebied (APV of Wet natuurbescherming). Buitengewoon opsporingsambtenaar (BOA) kan bekeuren.',
    'NL',
  ],
  [
    'Afsluiting openbaar pad',
    'Alleen met toestemming gemeente (verkeersbesluit of APV). Tijdelijke afsluiting voor evenementen of werkzaamheden via vergunning.',
    0,
    'Alternatieve route verplicht bij langdurige afsluiting. Bebording conform CROW-richtlijnen.',
    'Verkeersbesluit procedure: 6 weken zienswijze, bezwaar en beroep mogelijk.',
    'Illegale afsluiting: bestuursdwang gemeente. Strafrechtelijke handhaving bij gevaarlijke situatie.',
    'NL',
  ],
];

for (const [pathType, obligation, width, cropping, reinstatement, obstruction, jur] of rowData) {
  db.run(
    `INSERT INTO rights_of_way (path_type, obligation, min_width_m, cropping_rules, reinstatement_deadline, obstruction_liability, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [pathType, obligation, width, cropping, reinstatement, obstruction, jur],
  );
}

console.log(`Inserted ${rowData.length} rights of way rules`);

// ─── Common Land / Pachtrecht ────────────────────────────────────────
const commonData: [string, number, string, string, string][] = [
  [
    'Reguliere pacht',
    1,
    'Grondkamer (RVO)',
    'Langjarige pachtovereenkomst: minimaal 6 jaar voor los bouwland, 12 jaar voor een hoeve. Pachtnormen vastgesteld door RVO. Opzegging alleen via Grondkamer. Pachter heeft voorkeursrecht bij verkoop. Pachtprijs getoetst aan regionormen (14 pachtprijsgebieden).',
    'NL',
  ],
  [
    'Geliberaliseerde pacht',
    0,
    'Geen Grondkamer-toets',
    'Pachtovereenkomst korter dan 6 jaar. Vrije prijsvorming (geen pachtnormen). Geen verlenging van rechtswege. Geen voorkeursrecht pachter bij verkoop. Geschikt voor tijdelijk gebruik of seizoenspacht.',
    'NL',
  ],
  [
    'Teeltpacht',
    0,
    'Geen Grondkamer-toets',
    'Pachtovereenkomst voor maximaal 1 jaar (of 1 teeltseizoen) voor de teelt van een specifiek gewas. Vrije prijs. Geen verlenging. Geen voorkeursrecht pachter.',
    'NL',
  ],
  [
    'Erfpacht',
    1,
    'Kadaster (registratie); geen Grondkamer-toets',
    'Eeuwigdurend of langjarig zakelijk recht om grond te gebruiken tegen betaling van een canon. Geregistreerd bij Kadaster. Geen Grondkamer-toets. Canon wordt periodiek herzien (vaak elke 10 of 25 jaar). Erfpachter heeft vergaande gebruiksrechten maar geen eigendom.',
    'NL',
  ],
  [
    'Pachtnormen 2026 (regionormen)',
    0,
    'RVO (Rijksdienst voor Ondernemend Nederland)',
    'Pachtnormen per pachtprijsgebied (14 regio\'s). Voorbeelden: Bouwhoek en Hogeland circa 800 EUR/ha, Waterland en Droogmakerijen circa 400 EUR/ha, IJsselmeerpolders circa 900 EUR/ha, Zuidwestelijk akkerbouwgebied circa 600 EUR/ha. Normen jaarlijks vastgesteld bij ministerieel besluit.',
    'NL',
  ],
  [
    'Pachtprijsgebieden',
    0,
    'RVO',
    'Nederland is verdeeld in 14 pachtprijsgebieden voor de vaststelling van pachtnormen: (1) Bouwhoek en Hogeland, (2) Veenkoloniën en Oldambt, (3) Noordelijk weidegebied, (4) Oostelijk veehouderijgebied, (5) Centraal veehouderijgebied, (6) IJsselmeerpolders, (7) Westelijk Holland, (8) Waterland en Droogmakerijen, (9) Hollands/Utrechts weidegebied, (10) Rivierengebied, (11) Zuidwestelijk akkerbouwgebied, (12) Zuidwest-Brabant, (13) Zuidelijk veehouderijgebied, (14) Zuid-Limburg.',
    'NL',
  ],
  [
    'Opzegging reguliere pacht',
    1,
    'Grondkamer / Pachtkamer (rechtbank)',
    'Opzegging reguliere pacht alleen via Grondkamer. Gronden voor opzegging: eigen gebruik door verpachter, slecht pachterschap, bestemmingswijziging. Opzegtermijn minimaal 3 jaar voor hoevepacht, 1 jaar voor los land. Pachter kan in beroep bij Pachtkamer van het gerechtshof.',
    'NL',
  ],
];

for (const [activity, consent, authority, process, jur] of commonData) {
  db.run(
    `INSERT INTO common_land_rules (activity, consent_required, consent_authority, process, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    [activity, consent, authority, process, jur],
  );
}

console.log(`Inserted ${commonData.length} pacht/land rules`);

// ─── Planting Guidance (Bosaanleg) ───────────────────────────────────
const plantingData: [string, string, number | null, number, string, number, string][] = [
  [
    'Bosaanleg (loofhout)',
    'Inheems loofhout (eik, beuk, es, berk, els)',
    1.0,
    1,
    'Provinciale subsidie bosaanleg: circa 2.000-5.000 EUR/ha afhankelijk van provincie en type bos. Aanplantsubsidie via Subsidieregeling Natuur en Landschap (SNL).',
    0,
    'NL',
  ],
  [
    'Bosaanleg (naaldhout)',
    'Naaldhout (grove den, douglasspar, lariks)',
    1.0,
    1,
    'Provinciale subsidie beschikbaar maar lager dan voor inheems loofhout. Naaldhout vooral op arme zandgronden. Mix met loofhout aanbevolen voor biodiversiteit.',
    0,
    'NL',
  ],
  [
    'Bossenstrategie 2030',
    'Gemengd (inheems)',
    null,
    0,
    'Nationale Bossenstrategie: 10% meer bos in 2030 (circa 37.000 ha extra). Provincies en Staatsbosbeheer voeren uit. Focus op klimaatadaptatie, biodiversiteit, en houtproductie. Subsidies via provinciale regelingen.',
    0,
    'NL',
  ],
  [
    'LULUCF-compensatie bij ontbossing',
    'Compensatieplicht',
    null,
    1,
    'Bij ontbossing geldt een compensatieplicht onder de LULUCF-regeling (EU). Ontbossing moet worden gecompenseerd met gelijkwaardige bosaanleg elders. Geldt bovenop herplantplicht Wet natuurbescherming.',
    0,
    'NL',
  ],
  [
    'Agroforestry (boslandbouw)',
    'Gemengd (fruit, noten, hout)',
    0.5,
    0,
    'Subsidie via Gemeenschappelijk Landbouwbeleid (GLB) eco-regelingen. Combinatie van bomen met landbouw op zelfde perceel. Geen specifieke minimumomvang. Steun circa 200-400 EUR/ha/jaar als eco-regeling.',
    0,
    'NL',
  ],
  [
    'Soortenkeuze inheems',
    'Inheems (eik, beuk, els, wilg, berk, haagbeuk, linde, iep)',
    null,
    0,
    'Inheemse soorten aanbevolen voor biodiversiteit en klimaatbestendigheid. Eik (Quercus robur/petraea) geschikt op klei en zand. Els (Alnus) op natte gronden. Wilg (Salix) langs watergangen. Beuk (Fagus) op lemig zand.',
    0,
    'NL',
  ],
  [
    'Oeverbegroeiing langs watergangen',
    'Oeverplanten (els, wilg, riet)',
    null,
    0,
    'Subsidie via waterschappen of Groen-Blauwe Diensten. Oeverbegroeiing stabiliseert oever, filtert nutrienten, en bevordert biodiversiteit. Waterschap kan onderhoudsverplichtingen opleggen.',
    0,
    'NL',
  ],
  [
    'Natuurcompensatie bij ruimtelijke ontwikkeling',
    'Compensatieplicht',
    null,
    1,
    'Bij aantasting van beschermde natuur (incl. bos) door bouwprojecten geldt het compensatiebeginsel. Compensatie in oppervlakte en kwaliteit. Vastgelegd in bestemmingsplan of omgevingsvergunning. Provinciale compensatieregels variëren.',
    0,
    'NL',
  ],
];

for (const [purpose, species, minArea, eia, grant, buffer, jur] of plantingData) {
  db.run(
    `INSERT INTO planting_guidance (purpose, species_group, min_area_ha, eia_screening_required, grant_available, ancient_woodland_buffer_m, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [purpose, species, minArea, eia, grant, buffer, jur],
  );
}

console.log(`Inserted ${plantingData.length} planting guidance entries`);

// ─── TPO Rules (Monumentale bomen / beschermde bomen) ────────────────
const tpoData: [string, number, string, string | null, string | null, string | null, string | null, string][] = [
  [
    'Werkzaamheden aan monumentale boom',
    1,
    'Gemeente (via APV)',
    'Alleen snoei door gecertificeerd boomverzorger (ETW/ETT). Geen kap zonder vergunning.',
    'Aanvraag kapvergunning bij gemeente. Boomeffectanalyse (BEA) vaak vereist. Behandeltermijn 8 weken.',
    'Boete tot 25.000 EUR. Herplantplicht. Schadeclaim gemeente voor waardevermindering groen.',
    'Gemeentelijke APV; Bomenverordening',
    'NL',
  ],
  [
    'Dode of gevaarlijke monumentale boom',
    0,
    'Gemeente (melding achteraf)',
    'Noodkap bij acuut gevaar zonder voorafgaande vergunning. Direct melden bij gemeente. Fotodocumentatie bewaren.',
    'Zo snel mogelijk melden na kap. Gemeente beoordeelt achteraf of noodkap gerechtvaardigd was.',
    'Geen boete bij gerechtvaardigd gevaar. Bij onterechte noodkap: reguliere sancties.',
    'Gemeentelijke APV',
    'NL',
  ],
  [
    'Bouw nabij beschermde boom',
    1,
    'Gemeente (omgevingsvergunning + APV)',
    'Kroonprojectie + 1,5 m als beschermingszone. Geen graafwerkzaamheden in wortelzone zonder boomeffectanalyse.',
    'Omgevingsvergunning bouwen + beoordeling effect op beschermde boom. Gemeente kan aanvullende voorwaarden stellen.',
    'Stillegging bouw bij schade aan beschermde boom. Dwangsom. Boete tot 25.000 EUR.',
    'Gemeentelijke APV; Omgevingswet',
    'NL',
  ],
  [
    'Beschermde bomen in bestemmingsplan',
    1,
    'Gemeente (bestemmingsplan/omgevingsplan)',
    null,
    'Bomen kunnen via het bestemmingsplan (straks omgevingsplan) beschermd zijn als groenelement of waardevol landschapselement. Wijziging vereist planherziening.',
    'Overtreding bestemmingsplan: bestuursrechtelijke handhaving, dwangsom, bestuursdwang.',
    'Wet ruimtelijke ordening; Omgevingswet (per 2024)',
    'NL',
  ],
];

for (const [scenario, consent, authority, exemptions, process, penalties, ref, jur] of tpoData) {
  db.run(
    `INSERT INTO tpo_rules (scenario, consent_required, consent_authority, exemptions, process, penalties, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [scenario, consent, authority, exemptions, process, penalties, ref, jur],
  );
}

console.log(`Inserted ${tpoData.length} TPO/monumentale bomen rules`);

// ─── FTS5 Search Index ───────────────────────────────────────────────
const ftsData: [string, string, string, string][] = [
  // Hedgerow / Houtopstand
  [
    'Meldingsplicht kap houtopstand',
    'Onder de Wet natuurbescherming (art. 4.2) moet het kappen van een houtopstand groter dan 10 are of een bomenrij van 20+ bomen buiten de bebouwde kom worden gemeld bij de provincie. Minimaal 1 maand voor de geplande kap.',
    'hedgerow',
    'NL',
  ],
  [
    'Herplantplicht na kap',
    'Na het kappen van een meldingsplichtige houtopstand geldt een herplantplicht: binnen 3 jaar dezelfde oppervlakte herbeplanten. Mag op andere locatie binnen de provincie mits goedgekeurd door Gedeputeerde Staten.',
    'hedgerow',
    'NL',
  ],
  [
    'Kapvergunning binnen bebouwde kom',
    'Binnen de bebouwde kom regelt de gemeente het kappen van bomen via de APV (Algemene Plaatselijke Verordening). Per gemeente gelden andere drempels (stamdiameter, soort, locatie). Aanvraag kapvergunning bij gemeente.',
    'hedgerow',
    'NL',
  ],
  [
    'Uitzonderingen meldingsplicht kap',
    'Geen meldingsplicht voor: fruitbomen en notenbomen, windschermen langs landbouwgrond (max 2 rijen), kwekerij-beplanting, dunning tot 20% van stammen, bomenrijen onder 20 bomen. Altijd gemeentelijke APV checken.',
    'hedgerow',
    'NL',
  ],
  [
    'Monumentale bomen bescherming',
    'Monumentale bomen staan op gemeentelijke lijsten en zijn beschermd via de APV of bomenverordening. Kap alleen bij direct gevaar voor personen of gebouwen. Boete tot 25.000 EUR bij ongeoorloofde kap.',
    'hedgerow',
    'NL',
  ],
  [
    'Houtwallen en houtsingels',
    'Houtwallen en houtsingels (lijnvormige beplanting) vallen onder de Wet natuurbescherming als ze groter zijn dan 10 are of 20+ bomen bevatten. Ecologisch waardevolle landschapselementen. Meldingsplicht en herplantplicht van toepassing.',
    'hedgerow',
    'NL',
  ],

  // Felling
  [
    'Boswet-melding en wachttijd',
    'Na melding van voorgenomen kap bij de provincie geldt een wachttijd van 1 maand (4 weken). Gedurende deze periode mag niet worden gekapt. Provincie kan bezwaar maken of aanvullende eisen stellen.',
    'felling',
    'NL',
  ],
  [
    'Strafmaat illegale kap',
    'Kappen zonder vergunning of melding: maximale boete 21.750 EUR per overtreding (Wet op de economische delicten). Bestuursdwang door provincie of gemeente. Herplantplicht blijft altijd gelden.',
    'felling',
    'NL',
  ],
  [
    'Uitzonderingen kapvergunning',
    'Uitgezonderd van meldingsplicht: fruitbomen, notenbomen, kwekerij-beplanting, windschermen (max 2 rijen), dunning onder 20% per 10 jaar. Noodkap bij gevaar zonder voorafgaande vergunning, maar achteraf melden.',
    'felling',
    'NL',
  ],
  [
    'Ontheffing herplantplicht',
    'Ontheffing van herplantplicht aanvragen bij Gedeputeerde Staten. Alleen bij zwaarwegend maatschappelijk belang (woningbouw, infrastructuur). Compensatie in de vorm van bosaanleg elders kan worden vereist.',
    'felling',
    'NL',
  ],
  [
    'Noodkap gevaarlijke boom',
    'Bij direct gevaar voor personen of gebouwen mag een boom zonder voorafgaande vergunning worden geveld (noodkap). Achteraf melden bij gemeente of provincie. Herplantplicht blijft gelden. Fotodocumentatie bewaren als bewijs.',
    'felling',
    'NL',
  ],

  // Natura 2000 (SSSI equivalent)
  [
    'Natura 2000 vergunningplicht',
    'Nederland heeft 161 Natura 2000-gebieden. Activiteiten die een significant effect kunnen hebben op een Natura 2000-gebied vereisen een vergunning (Wnb art. 2.7). Voortoets bepaalt of passende beoordeling nodig is.',
    'sssi',
    'NL',
  ],
  [
    'AERIUS stikstofdepositie berekening',
    'AERIUS Calculator is het verplichte rekenmodel voor stikstofdepositieberekeningen bij Natura 2000-gebieden. Berekent depositie van NOx en NH3 op habitats. Bij overschrijding KDW (Kritische Depositie Waarde) is een passende beoordeling nodig.',
    'sssi',
    'NL',
  ],
  [
    'Stikstofproblematiek en vergunningen',
    'De stikstofproblematiek (na de PAS-uitspraak Raad van State 2019) beperkt vergunningverlening voor activiteiten nabij Natura 2000. Intern salderen (binnen bestaande vergunning) is mogelijk. Extern salderen vereist afroming van 30%.',
    'sssi',
    'NL',
  ],
  [
    'Passende beoordeling Natura 2000',
    'Een passende beoordeling is verplicht als een activiteit significante effecten op een Natura 2000-gebied kan hebben. Beoordeelt effecten op instandhoudingsdoelen. Inclusief cumulatie met andere plannen en projecten.',
    'sssi',
    'NL',
  ],
  [
    'Beheerplannen Natura 2000-gebieden',
    'Elk Natura 2000-gebied heeft een beheerplan met instandhoudingsdoelen en toegestane activiteiten. Activiteiten in het beheerplan als vrijgesteld opgenomen vereisen geen aparte vergunning. Beheerplannen vastgesteld door provincie of Rijkswaterstaat.',
    'sssi',
    'NL',
  ],

  // Rights of Way
  [
    'Klompenpaden wandelpaden over boerenland',
    'Klompenpaden zijn recreatieve wandelpaden over boerenland. Vrijwillige deelname van grondeigenaren. Beheer door Stichting Wandelnet. Geen wettelijk afdwingbaar recht van overpad — privaatrechtelijke overeenkomst.',
    'rights_of_way',
    'NL',
  ],
  [
    'Langeafstandswandelpaden LAW routes',
    'LAW-routes (langeafstandswandelpaden) maken deel uit van het NSWP (Nationaal Strategisch Wandelpadenplan). Routes volgen openbare wegen en paden met aanvullend recht van overpad via overeenkomsten met grondeigenaren.',
    'rights_of_way',
    'NL',
  ],
  [
    'Afsluiting openbaar pad',
    'Afsluiting van een openbaar pad is alleen toegestaan met toestemming van de gemeente (verkeersbesluit). Tijdelijke afsluiting voor werkzaamheden via vergunning. Illegale afsluiting: bestuursdwang gemeente.',
    'rights_of_way',
    'NL',
  ],
  [
    'Onderhoud openbare paden',
    'Openbare paden in eigendom van de gemeente worden door de gemeente onderhouden. Aanliggende eigenaren mogen paden niet blokkeren. Herstel binnen 14 dagen na melding bij gemeente.',
    'rights_of_way',
    'NL',
  ],

  // Pachtrecht (Common Land)
  [
    'Reguliere pacht voorwaarden',
    'Reguliere pacht: minimaal 6 jaar voor bouwland, 12 jaar voor hoevepacht. Pachtnormen vastgesteld door RVO. Opzegging via Grondkamer. Pachter heeft voorkeursrecht bij verkoop. Pachtprijs getoetst aan regionormen.',
    'common_land',
    'NL',
  ],
  [
    'Geliberaliseerde pacht',
    'Geliberaliseerde pacht: korter dan 6 jaar, vrije prijsvorming, geen Grondkamer-toets, geen verlenging van rechtswege, geen voorkeursrecht pachter. Geschikt voor tijdelijk grondgebruik.',
    'common_land',
    'NL',
  ],
  [
    'Pachtnormen per regio',
    'Nederland kent 14 pachtprijsgebieden met eigen normen. Voorbeelden: Bouwhoek/Hogeland circa 800 EUR/ha, Waterland circa 400 EUR/ha, IJsselmeerpolders circa 900 EUR/ha. Normen jaarlijks vastgesteld bij ministerieel besluit.',
    'common_land',
    'NL',
  ],
  [
    'Erfpacht zakelijk recht',
    'Erfpacht is een zakelijk recht om grond te gebruiken tegen betaling van een canon. Eeuwigdurend of langjarig. Geregistreerd bij Kadaster. Geen Grondkamer-toets. Canon periodiek herzien.',
    'common_land',
    'NL',
  ],

  // Planting
  [
    'Subsidie bosaanleg provincie',
    'Provinciale subsidies voor bosaanleg variëren van circa 2.000 tot 5.000 EUR/ha afhankelijk van provincie, type bos, en locatie. Aanvraag via Subsidieregeling Natuur en Landschap (SNL) of provinciale regelingen.',
    'planting',
    'NL',
  ],
  [
    'Bossenstrategie 37.000 hectare extra bos',
    'De Nationale Bossenstrategie streeft naar 10% meer bos in 2030: circa 37.000 hectare extra. Focus op klimaatadaptatie, biodiversiteit, en duurzame houtproductie. Uitvoering door provincies en Staatsbosbeheer.',
    'planting',
    'NL',
  ],
  [
    'Inheemse boomsoorten aanbeveling',
    'Voor bosaanleg worden inheemse soorten aanbevolen: zomereik (Quercus robur), wintereik (Q. petraea), beuk (Fagus sylvatica), zwarte els (Alnus glutinosa), zachte berk (Betula pubescens), schietwilg (Salix alba), haagbeuk (Carpinus betulus), winterlinde (Tilia cordata).',
    'planting',
    'NL',
  ],
  [
    'LULUCF compensatieplicht bij ontbossing',
    'Bij ontbossing geldt een compensatieplicht onder de EU LULUCF-regeling. CO2-uitstoot door ontbossing moet worden gecompenseerd met gelijkwaardige bosaanleg. Geldt bovenop nationale herplantplicht.',
    'planting',
    'NL',
  ],
  [
    'Agroforestry boslandbouw subsidie',
    'Agroforestry (boslandbouw) combineert bomen met landbouw op hetzelfde perceel. Subsidie via GLB eco-regelingen (circa 200-400 EUR/ha/jaar). Geen specifieke minimumomvang. Bevordert biodiversiteit en bodemkwaliteit.',
    'planting',
    'NL',
  ],
];

for (const [title, body, topic, jur] of ftsData) {
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    [title, body, topic, jur],
  );
}

console.log(`Inserted ${ftsData.length} FTS5 search entries`);

// ─── Metadata ────────────────────────────────────────────────────────
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('mcp_name', 'Netherlands Land & Woodland Management MCP')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('jurisdiction', 'NL')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', ?)", [now]);

writeFileSync(
  'data/coverage.json',
  JSON.stringify(
    {
      mcp_name: 'Netherlands Land Woodland MCP',
      jurisdiction: 'NL',
      build_date: now,
      status: 'populated',
      tables: {
        hedgerow_rules: hedgerowData.length,
        felling_rules: fellingData.length,
        sssi_operations: natura2000Data.length,
        rights_of_way: rowData.length,
        common_land_rules: commonData.length,
        planting_guidance: plantingData.length,
        tpo_rules: tpoData.length,
        search_index: ftsData.length,
      },
      sources: [
        'Wet natuurbescherming (Wnb) art. 4.2-4.6',
        'Gemeentelijke APV (kapvergunning)',
        'Natura 2000 beheerplannen',
        'RVO Pachtbeleid / pachtnormen',
        'Kadaster (erfpacht)',
        'Staatsbosbeheer / Nationale Bossenstrategie',
        'AERIUS Calculator (stikstof)',
        'Stichting Wandelnet (klompenpaden)',
      ],
    },
    null,
    2,
  ),
);

db.close();

console.log(`\nIngestion complete.`);
console.log(`  Hedgerow/houtopstand rules: ${hedgerowData.length}`);
console.log(`  Felling rules:              ${fellingData.length}`);
console.log(`  Natura 2000 operations:      ${natura2000Data.length}`);
console.log(`  Rights of way:               ${rowData.length}`);
console.log(`  Pachtrecht rules:            ${commonData.length}`);
console.log(`  Planting guidance:           ${plantingData.length}`);
console.log(`  TPO / monumentale bomen:     ${tpoData.length}`);
console.log(`  FTS5 search entries:         ${ftsData.length}`);
console.log(`  Total records:               ${hedgerowData.length + fellingData.length + natura2000Data.length + rowData.length + commonData.length + plantingData.length + tpoData.length + ftsData.length}`);
