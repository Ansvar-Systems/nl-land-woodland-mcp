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
 *   - Provinciale verordeningen — landschapselementen, groenblauwe dooradering
 *   - Wegenwet — openbare paden, onderhoud, toegankelijkheid
 *   - Pachtbesluit / Grondkamer — 14 pachtprijsgebieden, geschillen
 *   - Bossenstrategie 2030 — 37.000 ha extra bos
 *   - Bosbrandpreventie — risicogebieden Veluwe, Brabant
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
// Wet natuurbescherming art. 4.2-4.6 + gemeentelijke APV + provinciale verordeningen
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
  // ── NEW: Landschapselementen per type ──
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
  // ── NEW: Bescherming per provincie ──
  [
    'Provinciale verordening Gelderland — houtopstanden',
    1,
    'Gelderland kent aanvullende regels via de Omgevingsverordening Gelderland voor landschapselementen in het Gelders Natuurnetwerk',
    'In Gelderland geldt naast de Wnb ook de provinciale Omgevingsverordening. Beschermde landschapselementen (houtwallen, singels, lanen) in het Gelders Natuurnetwerk mogen niet zonder ontheffing worden verwijderd. Aparte compensatieplicht bovenop Wnb-herplantplicht.',
    'Bestuurlijke boete provincie Gelderland. Aanvullende compensatieplicht in oppervlakte en kwaliteit.',
    'Omgevingsverordening Gelderland; Wnb art. 4.2',
    'NL',
  ],
  [
    'Provinciale verordening Overijssel — groene dooradering',
    1,
    'Beperkte vrijstelling voor regulier onderhoud (dunning <20%, knotten) mits passend binnen beheerplan',
    'Overijssel beschermt houtwallen, singels, boomgroepen en lanen als onderdeel van de groene dooradering. Vergunning vereist voor kap of verwijdering. Compensatie verplicht bij ontheffing.',
    'Bestuurlijke boete tot 10.000 EUR. Herstelverplichting binnen 2 plantseizonen.',
    'Omgevingsverordening Overijssel; Wnb art. 4.2',
    'NL',
  ],
  [
    'Provinciale verordening Friesland — elzensingels Friese Wouden',
    1,
    'Regulier onderhoud (knotten, periodiek terugzetten) is vrijgesteld mits binnen ANLb-beheerovereenkomst',
    'Friesland kent bijzondere bescherming voor elzensingels in het Nationaal Landschap Noardlike Fryske Walden. Verwijdering verboden zonder ontheffing. ANLb-subsidie beschikbaar voor beheer (circa 200-350 EUR/ha/jaar).',
    'Bestuurlijke boete. Terugvordering ANLb-subsidie bij niet-naleving beheerovereenkomst.',
    'Omgevingsverordening Friesland; ANLb subsidieregeling',
    'NL',
  ],
  // ── NEW: Groenblauwe dooradering ──
  [
    'Groenblauwe dooradering — subsidie en voorwaarden',
    0,
    null,
    'Groenblauwe dooradering: netwerk van groene (houtwallen, singels, bosjes) en blauwe (sloten, poelen, beken) landschapselementen. Subsidie via ANLb (collectieve agrarische natuurverenigingen). Voorwaarden: minimaal 6 jaar beheerovereenkomst, beheerplan volgens ecologische normen, monitoring door collectief.',
    'Geen boete maar verlies subsidie en terugvordering bij niet-naleving. Collectief kan deelnemer uitsluiten.',
    'ANLb; Gemeenschappelijk Landbouwbeleid (GLB)',
    'NL',
  ],
  // ── NEW: Verplichte herplant details ──
  [
    'Herplant — soortenkeuze en plantafstand',
    1,
    'Provincie kan afwijkende soortenkeuze voorschrijven bij herplant op andere locatie',
    'Bij herplantplicht (Wnb art. 4.3) geldt: soortenkeuze in overleg met provincie, voorkeur inheems loofhout. Plantafstand afhankelijk van soort: eik 4-6 m, berk 3-4 m, beuk 5-7 m, els 2-3 m. Minimale plantkwaliteit: 2-jarig beworteld plantgoed. Aanplant in plantseizoen (november-maart).',
    'Bij niet-nakoming: bestuursdwang. Provincie kan na 3 jaar zelf herplanten op kosten eigenaar.',
    'Wet natuurbescherming art. 4.3; Besluit natuurbescherming',
    'NL',
  ],
  [
    'Herplant — controle en handhaving termijnen',
    1,
    'Verlenging herplanttermijn mogelijk bij zwaarwegend belang (max 1 jaar extra)',
    'Controle op herplantplicht door provincie: inspectie na 3 jaar (einde herplanttermijn). Geslaagde herplant: minimaal 80% van geplante bomen moet aangeslagen zijn. Bij onvoldoende hergroei: aanvullende aanplant binnen 1 jaar. Provincie houdt register van uitstaande herplantverplichtingen.',
    'Bestuursdwang na 3 jaar + 1 jaar hersteltermijn. Dwangsom per maand tot maximaal 50.000 EUR.',
    'Wet natuurbescherming art. 4.3-4.4; Besluit natuurbescherming',
    'NL',
  ],
  [
    'Herplant — financiele compensatie (boscompensatie)',
    1,
    'Alleen mogelijk bij bewezen onmogelijkheid van fysieke herplant',
    'Als fysieke herplant niet mogelijk is (bijv. door bestemmingswijziging), kan de provincie financiele compensatie opleggen. Storting in het provinciale groenfonds of landelijk Boscompensatiefonds. Bedrag gebaseerd op aanlegkosten vergelijkbaar bos: circa 15.000-25.000 EUR/ha inclusief beheer eerste 10 jaar.',
    'Verplichting tot betaling. Bij niet-betaling: bestuursrechtelijke invordering.',
    'Wet natuurbescherming art. 4.4; Provinciale beleidsregels compensatie',
    'NL',
  ],
  [
    'Beschermde boomsoorten — bijzondere status',
    1,
    'Geen vrijstelling voor beschermde soorten, ook niet bij noodkap (achteraf ontheffing vereist)',
    'Sommige boomsoorten genieten extra bescherming via soortenbescherming (Wnb art. 3.1-3.5). Bomen met vleermuisverblijfplaatsen, nestelende roofvogels, of als standplaats van beschermde mossen/korstmossen vereisen quickscan ecologie voor kap. Essentaksterfte (Hymenoscyphus fraxineus) geeft geen automatische kapvrijstelling voor essen.',
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
  // ── NEW: Kapvergunning per gemeente-type ──
  [
    'Kapvergunning stedelijk gebied',
    1,
    null,
    null,
    'In stedelijk gebied geldt doorgaans een lagere drempel voor de kapvergunning: stamomtrek >30 cm of stamdiameter >10 cm op 1,3 m hoogte. Sommige gemeenten (Amsterdam, Utrecht, Rotterdam) vereisen vergunning voor elke boom buiten eigen achtertuin.',
    'Aanvraag via Omgevingsloket Online. Behandeltermijn 8 weken (regulier). Bezwaar- en beroepsmogelijkheid. Herplantplicht als voorwaarde in vergunning.',
    'Bestuursdwang, boete per gemeentelijke APV (vaak 5.000-20.000 EUR). Last onder dwangsom bij herplantplicht.',
    'Gemeentelijke APV; Omgevingswet',
    'NL',
  ],
  [
    'Kapvergunning landelijk gebied',
    1,
    null,
    0.1,
    'In landelijk gebied buiten de bebouwde kom geldt primair de Wnb-meldingsplicht. Gemeentelijke APV kan aanvullend gelden. Lagere handhavingsdruk dan stedelijk, maar provinciale controle op herplant.',
    'Melding bij provincie via meldingsformulier. Aanvullend: check gemeentelijke kapverordening landelijk gebied. Sommige gemeenten hebben geen eigen kapverordening buiten de kom.',
    'Wnb-boete tot 21.750 EUR. Gemeentelijke boete afhankelijk van APV.',
    'Wet natuurbescherming art. 4.2; gemeentelijke APV',
    'NL',
  ],
  // ── NEW: Noodkap procedures ──
  [
    'Noodkap na stormschade',
    0,
    null,
    null,
    'Bij stormschade (windkracht 9+) mag direct worden opgeruimd zonder voorafgaande melding. Achteraf melding bij provincie binnen 1 week. Herplantplicht blijft gelden. Bij grootschalige stormschade kan provincie generieke ontheffing van wachttijd verlenen.',
    'Achteraf melden bij provincie. Fotodocumentatie stormschade bewaren. Geen wachttijd van 1 maand bij aantoonbare stormschade.',
    null,
    'Wet natuurbescherming art. 4.2; provinciale beleidsregels noodkap',
    'NL',
  ],
  [
    'Noodkap bij iepziekte (Ophiostoma)',
    1,
    null,
    null,
    'Iepziekte (Ophiostoma novo-ulmi) vereist snelle verwijdering om verspreiding te voorkomen. Veel gemeenten hebben een iepziekte-bestrijdingsplan. Versnelde procedure voor kap van besmette iepen.',
    'Melding bij gemeente iepziekte-coordinator. Versnelde vergunning (vaak binnen 1-2 weken). Geen reguliere wachttijd bij bevestigde besmetting. Herplant met resistente iepsoort of alternatief loofhout.',
    'Boete bij niet-melden van iepziekte: gemeentelijke APV. Dwangsom bij weigering kap van besmette boom.',
    'Gemeentelijke APV; Plantenziektenwet',
    'NL',
  ],
  [
    'Noodkap bij essentaksterfte (Hymenoscyphus fraxineus)',
    1,
    null,
    null,
    'Essentaksterfte is een wijdverbreide schimmelziekte bij essen. Geen automatische kapvrijstelling. Beoordeling per boom: stabiliteit, fase van aantasting, locatie (langs weg = hogere urgentie). Collectieve kapmeldingen mogelijk bij grote aantallen.',
    'Boomveiligheidscontrole (BVC) door gecertificeerd boomverzorger. Melding bij provincie voor bomen buiten bebouwde kom. Gemeentelijke vergunning voor bomen binnen bebouwde kom. Wachttijd kan verkort worden bij aantoonbaar veiligheidsrisico.',
    'Reguliere boetes bij kap zonder melding/vergunning. Aansprakelijkheid eigenaar bij letsel door vallende takken (art. 6:174 BW).',
    'Wet natuurbescherming art. 4.2; gemeentelijke APV; BW art. 6:174',
    'NL',
  ],
  // ── NEW: Dunning regels ──
  [
    'Dunning boven 20% — meldingsplichtig',
    1,
    null,
    null,
    'Dunning boven 20% van het stamtal is meldingsplichtig als reguliere kap. Registreer het uitgangsstamtal en de dunningspercentage. Na dunning >20% geldt herplantplicht voor het verschil boven 20%.',
    'Melding bij provincie conform reguliere procedure. Wachttijd 1 maand. Bosbeheerplan overleggen als onderbouwing.',
    'Reguliere boete tot 21.750 EUR bij overtreding.',
    'Wet natuurbescherming art. 4.2',
    'NL',
  ],
  // ── NEW: Boscompensatie ──
  [
    'Boscompensatie — landelijk compensatiefonds',
    1,
    null,
    null,
    'Bij ontheffing van herplantplicht (art. 4.4 Wnb) kan de provincie storting in een compensatiefonds eisen. Provinciale groenfondsen of het landelijk Boscompensatiefonds (bij nationale projecten). Compensatiebedrag: circa 15.000-25.000 EUR/ha.',
    'Aanvraag ontheffing herplantplicht bij Gedeputeerde Staten. Onderbouwing waarom fysieke herplant onmogelijk is. Afkoopbedrag wordt vastgesteld op basis van aanleg- en beheerkosten.',
    'Verplichting tot betaling bij toekenning ontheffing. Bestuursrechtelijke invordering bij niet-betaling.',
    'Wet natuurbescherming art. 4.4; Provinciale beleidsregels compensatie',
    'NL',
  ],
  // ── NEW: Boswet-ontheffingen ──
  [
    'Ontheffing Wnb — woningbouw',
    1,
    null,
    null,
    'Ontheffing herplantplicht mogelijk bij woningbouwprojecten van zwaarwegend maatschappelijk belang. Voorwaarde: compensatie elders binnen de provincie. Aanvrager betaalt compensatiekosten.',
    'Aanvraag bij Gedeputeerde Staten met bestemmingsplan, ruimtelijke onderbouwing, en compensatieplan. Behandeltermijn circa 13 weken.',
    null,
    'Wet natuurbescherming art. 4.4',
    'NL',
  ],
  [
    'Ontheffing Wnb — infrastructuur (rijkswegen, spoor)',
    1,
    null,
    null,
    'Bij aanleg of verbreding van rijkswegen of spoorwegen kan de minister ontheffing verlenen. Compensatie via het Kwaliteitsimpuls Natuur en Landschap of Boscompensatiefonds. Vaak 1:1 compensatie plus kwaliteitstoeslag.',
    'Aanvraag via Rijkswaterstaat of ProRail bij het ministerie van LNV. Passende beoordeling Natura 2000 vaak ook vereist.',
    null,
    'Wet natuurbescherming art. 4.4; Tracewet',
    'NL',
  ],
  [
    'Ontheffing Wnb — natuurontwikkeling',
    0,
    null,
    null,
    'Omvorming van bos naar andere natuur (heide, stuifzand, moeras) kan worden vrijgesteld van herplantplicht als dit past binnen een goedgekeurd natuurbeheerplan. Geen netto verlies van natuur.',
    'Aanvraag bij provincie met ecologische onderbouwing. Beheerplan moet zijn goedgekeurd. Monitoring verplicht.',
    null,
    'Wet natuurbescherming art. 4.4; Subsidieverordening Natuur en Landschap',
    'NL',
  ],
  // ── NEW: Per boomsoort ──
  [
    'Beschermde boom — vleermuisverblijfplaats',
    1,
    null,
    null,
    'Bomen met vleermuisverblijfplaatsen (kraamkolonies, overwinteringsplaatsen) zijn extra beschermd via soortenbescherming (Wnb art. 3.5). Kap vereist ontheffing soortenbescherming naast kapmelding/vergunning. Vleermuisonderzoek (quickscan + nader onderzoek) verplicht.',
    'Quickscan ecologie bij vermoeden vleermuizen. Nader onderzoek in actief seizoen (mei-september). Ontheffingsaanvraag bij RVO. Mitigerende maatregelen (vleermuiskasten) als voorwaarde.',
    'Boete tot 21.750 EUR per overtreding soortenbescherming. Strafrechtelijke vervolging bij opzet (WED).',
    'Wet natuurbescherming art. 3.5; art. 4.2',
    'NL',
  ],
  [
    'Exoten verwijdering — invasieve soorten',
    0,
    null,
    null,
    'Verwijdering van invasieve exoten (Amerikaanse vogelkers Prunus serotina, Amerikaanse eik Quercus rubra in natuurgebieden) wordt gestimuleerd door provincies. Geen meldingsplicht als verwijdering plaatsvindt in het kader van een goedgekeurd natuurbeheerplan.',
    'Overleg met terreinbeheerder en provincie. Bij verwijdering buiten beheerplan geldt reguliere Wnb-procedure. Herplant met inheemse soorten aanbevolen.',
    null,
    'Wet natuurbescherming art. 4.2; EU-verordening 1143/2014 (invasieve exoten)',
    'NL',
  ],
  [
    'Bomen op erven — vrijstelling',
    0,
    null,
    null,
    'Bomen op erven bij woningen en bedrijfsgebouwen zijn uitgezonderd van de Wnb-meldingsplicht. Definitie erf: grond die functioneel bij de woning of het bedrijfsgebouw hoort (niet het landbouwperceel). Gemeentelijke APV kan alsnog kapvergunning vereisen.',
    'Check gemeentelijke APV voor drempels (stamdiameter, boomsoort, aantal). Sommige gemeenten vereisen vergunning voor bomen >30 cm stamomtrek ook op erven.',
    'Geen Wnb-boete. Gemeentelijke boete als APV-vergunningsplicht geldt.',
    'Wet natuurbescherming art. 4.2 lid 3; gemeentelijke APV',
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
  // ── NEW: Wateronttrekking ──
  [
    'Wateronttrekking nabij Natura 2000',
    1,
    'Vergunning vereist bij grondwateronttrekking die effect kan hebben op grondwaterafhankelijke Natura 2000-habitats (vochtige heide, trilvenen, blauwgraslanden). Waterschap en provincie beoordelen gezamenlijk. AERIUS-berekening niet van toepassing, maar hydrologische effectbeoordeling verplicht.',
    'Maximaal onttrekkingsdebiet, peilmonitoring, compenserende wateraanvoer, seizoensbeperkingen',
    'Bestuurlijke boete waterschap. Dwangsom. Intrekking watervergunning bij herhaalde overtreding.',
    'NL',
  ],
  // ── NEW: Bouw en sloop ──
  [
    'Bouwactiviteit nabij Natura 2000',
    1,
    'Vergunning vereist voor bouwactiviteiten (woningbouw, bedrijfsgebouwen, infrastructuur) nabij Natura 2000 als stikstofdepositie, geluidsverstoring, trillingen, of lichtverstoring mogelijk is. AERIUS-berekening voor bouwfase (tijdelijk) en gebruiksfase (structureel). Passende beoordeling bij overschrijding KDW.',
    'Emissiearm bouwmaterieel (Stage V), bouwperiode buiten broedseizoen, geluidschermen, verlichting afgeschermd',
    'Stillegging bouw, bestuurlijke boete, dwangsom per dag. Bouwvergunning kan worden ingetrokken.',
    'NL',
  ],
  [
    'Sloopactiviteit nabij Natura 2000',
    1,
    'Sloop kan stikstofdepositie veroorzaken door bouwmaterieel en stofemissie. AERIUS-berekening nodig als sloop >1 week duurt of zwaar materieel vereist. Asbesthoudende sloop vereist apart traject (asbestverwijdering).',
    'Natte sloop (stofbeperking), werkperiode beperking, emissiearm materieel',
    'Bestuurlijke boete, stillegging werkzaamheden',
    'NL',
  ],
  // ── NEW: Begrazing intensivering ──
  [
    'Begrazing intensivering nabij Natura 2000',
    1,
    'Toename van begrazingsdruk (meer vee per hectare) nabij Natura 2000 kan leiden tot hogere ammoniakemissie en overbegrazing van habitattypen. Vergunning vereist als toename significant is. AERIUS-berekening voor ammoniakdepositie door extra vee.',
    'Maximaal aantal dieren per hectare, seizoensbegrazing, afrastering Natura 2000-grens',
    'Bestuurlijke boete, dwangsom, intrekking vergunning veehouderij',
    'NL',
  ],
  // ── NEW: Drainage en ontgronding ──
  [
    'Drainage nabij Natura 2000',
    1,
    'Aanleg of verdieping van drainage nabij Natura 2000 met grondwaterafhankelijke habitats vereist vergunning. Effectbeoordeling op grondwaterstand en kwelstromen. Waterschap en provincie beoordelen gezamenlijk.',
    'Maximale drainagediepte, monitoring grondwaterstanden, compenserende maatregelen',
    'Bestuurlijke boete, herstelplicht (dempen drainage), dwangsom waterschap',
    'NL',
  ],
  [
    'Ontgronding nabij Natura 2000',
    1,
    'Ontgronding (zand-, grind-, of kleiwinning) nabij Natura 2000 vereist vergunning provincie (Ontgrondingenwet) plus Wnb-vergunning. Effectbeoordeling op hydrologisch systeem, bodemstabiliteit, en habitattypen. Passende beoordeling verplicht.',
    'Afstand tot Natura 2000-grens, werkperiode, grondwatermonitoring, landschapsherstel na ontgronding',
    'Bestuurlijke boete beide vergunningen. Herstelplicht. Illegale ontgronding: economisch delict.',
    'NL',
  ],
  // ── NEW: Aanplant exoten ──
  [
    'Aanplant exoten nabij Natura 2000',
    1,
    'Aanplant van niet-inheemse boomsoorten of struiken nabij Natura 2000 kan effect hebben op habitats door verdringing van inheemse flora. Vergunning vereist als aanplant significante verspreiding naar Natura 2000-habitat kan veroorzaken. Invasieve exoten (EU-lijst) zijn verboden.',
    'Soortenkeuze: alleen inheems binnen 500 m van Natura 2000. Monitoring op uitbreiding. Verwijderplicht bij ongewenste verspreiding.',
    'Bestuurlijke boete, verwijderplicht op kosten aanplanter',
    'NL',
  ],
  // ── NEW: Recreatie uitbreiding en evenementen ──
  [
    'Recreatie-uitbreiding nabij Natura 2000',
    1,
    'Uitbreiding van recreatieve voorzieningen (campings, golfbanen, parkeerterreinen, mountainbikeroutes) nabij Natura 2000 vereist vergunning als dit leidt tot meer verstoring (geluid, licht, betreding). Voortoets verplicht. Beheerplannen kunnen bestaande extensieve recreatie vrijstellen.',
    'Seizoensbeperkingen, zonering (kernzone/bufferzone), maximale capaciteit, lichtbeperking',
    'Bestuurlijke boete, stillegging uitbreiding, dwangsom',
    'NL',
  ],
  [
    'Evenementen in of nabij Natura 2000',
    1,
    'Eenmalige of terugkerende evenementen (festivals, motorcross, vuurwerk, drones) in of nabij Natura 2000 vereisen voortoets. Bij significant effect: passende beoordeling en vergunning. Geluids- en lichtverstoring zijn hoofdfactoren.',
    'Maximale geluidsniveaus, afstand tot broedkolonies, tijdstip (niet tijdens broedseizoen), opruimplicht',
    'Bestuurlijke boete bij evenement zonder vergunning. Last onder dwangsom bij herhaling.',
    'NL',
  ],
  // ── NEW: Verlichting (vleermuizen) ──
  [
    'Verlichting nabij Natura 2000 — vleermuizen',
    1,
    'Kunstmatige verlichting nabij Natura 2000-gebieden met vleermuispopulaties (meervleermuis, laatvlieger, watervleermuis) vereist beoordeling. Lichtverstoring verstoort foerageerroutes en kolonie-uitvlieg. Vergunning soortenbescherming (Wnb art. 3.5) en/of gebiedsbescherming.',
    'Vleermuisvriendelijke verlichting (amberkleur, <2700K, neerwaarts gericht), geen verlichting richting vliegroutes, uitschakeling na 23:00',
    'Bestuurlijke boete soortenbescherming. Dwangsom per dag bij voortdurende overtreding.',
    'NL',
  ],
  // ── NEW: ADC-toets ──
  [
    'ADC-toets (Alternatieven, Dwingende redenen, Compensatie)',
    1,
    'Als een passende beoordeling concludeert dat significante negatieve effecten op Natura 2000-gebieden niet kunnen worden uitgesloten, kan een vergunning alleen worden verleend via de ADC-toets: (A) geen Alternatieven beschikbaar, (D) Dwingende redenen van groot openbaar belang, (C) Compenserende maatregelen voldoende. Europese Commissie adviseert bij prioritaire habitats.',
    'Compensatie: extra natuurareaal van vergelijkbare kwaliteit, voor aanvang project gerealiseerd. Financiele zekerheid voor langjarig beheer compensatienatuur.',
    'Vergunning geweigerd als ADC-toets niet wordt gehaald. Bij illegale uitvoering: economisch delict, herstelplicht, boete.',
    'NL',
  ],
  // ── NEW: Intern en extern salderen ──
  [
    'Intern salderen stikstofdepositie',
    0,
    'Intern salderen: nieuwe activiteit wordt gesaldeerd met bestaande vergunde activiteiten op hetzelfde bedrijf. Netto geen toename van stikstofdepositie. Sinds 2022 geen vergunningplicht voor intern salderen, maar wel melding bij provincie. AERIUS-berekening verplicht als bewijs.',
    null,
    'Geen boete bij correcte melding. Bij onjuiste berekening: risico dat vergunning achteraf ongeldig is.',
    'NL',
  ],
  [
    'Extern salderen stikstofdepositie',
    1,
    'Extern salderen: stikstofdepositieruimte overnemen van een ander bedrijf (dat stopt of inkrimpt). Afroming van 30% van de overgenomen ruimte. Alleen feitelijk gerealiseerde capaciteit mag worden gesaldeerd (niet slapende vergunningen). Provinciale beleidsregels bepalen voorwaarden.',
    'Overeenkomst tussen saldogever en saldonemer, goedkeuring provincie, AERIUS-berekening, intrekking vergunning saldogever',
    'Vergunning geweigerd bij onvoldoende onderbouwing. Illegale activiteit zonder extern salderen: economisch delict.',
    'NL',
  ],
  // ── NEW: Beheerplannen procedure ──
  [
    'Beheerplan Natura 2000 — procedure en inhoud',
    0,
    'Beheerplan wordt opgesteld door de provincie (of Rijkswaterstaat voor grote wateren) in overleg met grondeigenaren, gebruikers, en belangenorganisaties. Inhoud: (1) beschrijving instandhoudingsdoelen per habitat en soort, (2) huidige staat van instandhouding, (3) benodigde maatregelen, (4) lijst van vrijgestelde activiteiten, (5) monitoring en evaluatie. Looptijd 6 jaar met evaluatie en herziening.',
    null,
    null,
    'NL',
  ],
  [
    'Beheerplan Natura 2000 — participatie en bezwaar',
    0,
    'Ontwerp-beheerplan ligt 6 weken ter inzage. Zienswijzen mogelijk. Definitief beheerplan vatbaar voor beroep bij de rechter. Grondeigenaren en gebruikers worden betrokken via klankbordgroepen. Provinciale Staten stellen het beheerplan vast.',
    null,
    null,
    'NL',
  ],
  // ── NEW: Ruimtelijke ingrepen soortenbescherming ──
  [
    'Ontheffing soortenbescherming — ruimtelijke ingrepen',
    1,
    'Bij ruimtelijke ingrepen (bouw, kap, grondverzet) die beschermde dier- of plantensoorten verstoren, is een ontheffing Wnb art. 3.3/3.5 vereist. Aanvraag bij RVO. Drie criteria: (1) geen andere bevredigende oplossing, (2) dwingende redenen van groot openbaar belang of volksgezondheid, (3) geen afbreuk aan gunstige staat van instandhouding.',
    'Mitigatieplan, ecologisch werkprotocol, compensatie leefgebied, monitoring na ingreep (minimaal 3 jaar)',
    'Boete tot 21.750 EUR per overtreding. Strafrechtelijke vervolging bij opzet of grove nalatigheid.',
    'NL',
  ],
  [
    'Gedragscodes soortenbescherming',
    0,
    'Gedragscodes (goedgekeurd door minister van LNV) bieden een generieke vrijstelling van de verbodsbepalingen soortenbescherming voor specifieke werkzaamheden. Voorbeelden: Gedragscode Bosbeheer, Gedragscode Bestendig Beheer en Onderhoud. Bij werken volgens de gedragscode is geen individuele ontheffing nodig. Wel quickscan verplicht.',
    null,
    'Bij niet-naleving gedragscode: terugval op individuele ontheffingsplicht. Boete bij overtreding verbodsbepalingen.',
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
  // ── NEW: Dijkpad ──
  [
    'Dijkpad',
    'Pad langs of op een waterkering (dijk). Beheer door waterschap. Veel dijkpaden zijn openbaar toegankelijk voor wandelen en fietsen. Berijden met motorvoertuigen niet toegestaan tenzij specifiek aangewezen.',
    2.5,
    'Geen activiteiten die de waterkering verzwakken: geen graafwerk, geen zware voertuigen, geen verankering. Waterschap stelt gebruiksregels vast in de keur.',
    'Waterschap kan direct handhaven bij schade aan waterkering. Spoedherstel vereist.',
    'Overtreding keur waterschap: bestuurlijke boete. Beschadiging waterkering: strafbaar feit (Waterwet). Waterschap kan bestuursdwang opleggen.',
    'NL',
  ],
  // ── NEW: Kerkepad ──
  [
    'Kerkepad',
    'Historisch voetpad (vaak onverhard) dat oorspronkelijk leidde naar de dorpskerk. Veel kerkepaden zijn verloren gegaan maar worden heropend via klompenpadprojecten. Status afhankelijk van Wegenlegger gemeente: openbaar of privaat.',
    1.0,
    'Geen bebouwing of afsluiting als pad op de Wegenlegger staat als openbaar pad. Aanliggende eigenaar moet doorgang gedogen.',
    'Gemeente kan pad opnemen in Wegenlegger na verzoek. Procedure via raadsbesluit. Bezwaar door grondeigenaar mogelijk.',
    'Afsluiting openbaar kerkepad: bestuursdwang gemeente. Verwijdering van pad uit Wegenlegger vereist raadsbesluit.',
    'NL',
  ],
  // ── NEW: Schoolpad ──
  [
    'Schoolpad',
    'Historisch pad naar school, vergelijkbaar met kerkepad. Status bepaald door Wegenlegger. Veel schoolpaden zijn verdwenen door ruilverkaveling. Heropening mogelijk via gemeentelijk besluit.',
    1.2,
    'Geen blokkade door grondeigenaar als pad openbaar is. Gemeente verantwoordelijk voor onderhoud als het pad op de Wegenlegger staat.',
    'Herstel door gemeente na melding. Geen specifieke wettelijke hersteltermijn maar zorgplicht gemeente.',
    'Illegale afsluiting: bestuursdwang gemeente. Strafrechtelijk: art. 427 Wetboek van Strafrecht.',
    'NL',
  ],
  // ── NEW: Openbaar vs privaat — Wegenwet ──
  [
    'Openbaar pad — Wegenwet (status en bewijs)',
    'Pad is openbaar als: (a) opgenomen in Wegenlegger gemeente, (b) 30 jaar onafgebroken openbaar toegankelijk en door gemeente onderhouden, of (c) 10 jaar openbaar met onderhoud door rechthebbende. Wegenwet art. 4. Bewijs: Wegenlegger is hoofdbewijs. Privaat pad wordt niet automatisch openbaar door feitelijk gebruik.',
    0,
    null,
    'Opname in Wegenlegger via procedure bij gemeente (raadsbesluit). Bezwaar door rechthebbende binnen 6 weken. Beroep bij rechtbank.',
    'Gemeente verantwoordelijk voor onderhoud openbaar pad. Rechthebbende privépad heeft geen onderhoudsplicht jegens publiek. Afsluiting openbaar pad: strafbaar (art. 427 Sr).',
    'NL',
  ],
  // ── NEW: Onderhoud — wie betaalt ──
  [
    'Onderhoud openbaar pad — verantwoordelijkheid en kosten',
    'Wegbeheerder (gemeente, provincie, of waterschap) is verantwoordelijk voor onderhoud van openbare paden. Kosten ten laste van beheerder. Aanliggende eigenaren hebben geen wettelijke onderhoudsplicht maar mogen ook niet belemmeren. Bij gebrekkig onderhoud: aansprakelijkheid wegbeheerder (art. 6:174 BW).',
    0,
    'Aanliggende eigenaar moet overhangende takken en wortels verwijderen als deze het pad belemmeren (art. 5:44 BW). Kosten voor eigenaar. Gemeente kan last onder bestuursdwang opleggen.',
    'Herstel na melding: geen wettelijke termijn, maar zorgplicht. Bij gevaar: direct handelen. Aansprakelijkheidsclaim bij letsel door gebrekkig onderhoud (art. 6:174 BW).',
    'Gemeente/waterschap draagt kosten. Bij ernstig letsel door gebrekkig onderhoud: schadevergoeding aan slachtoffer.',
    'NL',
  ],
  // ── NEW: Toegankelijkheid ──
  [
    'Toegankelijkheid openbaar pad — mobiliteit en hekken',
    'Openbare paden moeten toegankelijk zijn voor alle gebruikers. Plaatsing van hekken, klaphekken, of overstapjes op openbare paden is alleen toegestaan met toestemming wegbeheerder. Overstapjes (stiles) en klaphekken moeten passeerbaar zijn voor minder validen waar redelijkerwijs mogelijk (VN-Verdrag rechten personen met een handicap).',
    1.5,
    'Minimale doorgang bij hekken: 0,9 m (rolstoeltoegankelijk). Klaphekken: zelfsluitend, bediening met een hand. Overstapjes: waar mogelijk vervangen door klaphek of poort. Wegbeheerder bepaalt.',
    'Geen specifieke hersteltermijn. Gemeente kan overleggen met grondeigenaar over aanpassing.',
    'Illegale blokkade (inclusief te smal hekwerk): bestuursdwang gemeente. Discriminatie op grond van handicap: klacht via College voor de Rechten van de Mens.',
    'NL',
  ],
  // ── NEW: Trekkerpad ──
  [
    'Trekkerpad (trekkersveld/trekkersroute)',
    'Langeafstandswandelroute met overnachtingsmogelijkheden (trekkersvelden). Beheer door Staatsbosbeheer of Natuurmonumenten. Paden veelal door natuurgebieden met specifieke toegangsregels.',
    1.5,
    'Alleen wandelen op aangewezen paden. Kamperen alleen op trekkersvelden. Vuur niet toegestaan buiten aangewezen plekken. Honden aangelijnd.',
    'Geen wettelijke hersteltermijn. Beheerder bepaalt onderhoudsniveau.',
    'Overtreding toegangsregels: boete via APV of Wet natuurbescherming. BOA bevoegd. Schade aan natuur: schadeclaim beheerder.',
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
  // ── NEW: Alle 14 pachtprijsgebieden met normen ──
  [
    'Pachtprijsgebied 1: Bouwhoek en Hogeland',
    0,
    'RVO',
    'Bouwhoek en Hogeland (Groningen): akkerbouwgebied met kleigrond. Pachtnorm circa 800 EUR/ha. Voornamelijk graan, aardappelen, suikerbieten. Hoge bodemkwaliteit.',
    'NL',
  ],
  [
    'Pachtprijsgebied 2: Veenkoloniën en Oldambt',
    0,
    'RVO',
    'Veenkoloniën en Oldambt (Groningen/Drenthe): dalgrond en klei. Pachtnorm circa 650 EUR/ha. Akkerbouw (zetmeelaardappelen, graan). Lagere norm door mindere bodemkwaliteit.',
    'NL',
  ],
  [
    'Pachtprijsgebied 3: Noordelijk weidegebied',
    0,
    'RVO',
    'Noordelijk weidegebied (Friesland/Groningen): grasland voor melkveehouderij. Pachtnorm circa 750 EUR/ha. Klei- en veengrond. Overwegend weidebouw.',
    'NL',
  ],
  [
    'Pachtprijsgebied 4: Oostelijk veehouderijgebied',
    0,
    'RVO',
    'Oostelijk veehouderijgebied (Overijssel/Gelderland): gemengd bedrijf met grasland en mais. Pachtnorm circa 700 EUR/ha. Zandgrond. Intensieve veehouderij en akkerbouw.',
    'NL',
  ],
  [
    'Pachtprijsgebied 5: Centraal veehouderijgebied',
    0,
    'RVO',
    'Centraal veehouderijgebied (Utrecht/Gelderland): grasland voor rundveehouderij. Pachtnorm circa 750 EUR/ha. Rivierklei en zandgrond. Hoge gronddruk door nabijheid Randstad.',
    'NL',
  ],
  [
    'Pachtprijsgebied 6: IJsselmeerpolders',
    0,
    'RVO',
    'IJsselmeerpolders (Flevoland): jonge zeekleigrond, hoogproductief akkerbouwgebied. Pachtnorm circa 900 EUR/ha (hoogste van Nederland). Aardappelen, suikerbieten, graan, uien. Grote kavels.',
    'NL',
  ],
  [
    'Pachtprijsgebied 7: Westelijk Holland',
    0,
    'RVO',
    'Westelijk Holland (Zuid-Holland/Noord-Holland): bollenteelt, tuinbouw, glastuinbouw. Pachtnorm circa 600 EUR/ha. Hoge grondprijzen maar lage pachtnormen door veengrond en stedelijke druk.',
    'NL',
  ],
  [
    'Pachtprijsgebied 8: Waterland en Droogmakerijen',
    0,
    'RVO',
    'Waterland en Droogmakerijen (Noord-Holland): veenweidegebied met bodemdaling. Pachtnorm circa 400 EUR/ha (laagste van Nederland). Extensieve veehouderij, weidevogelbeheer. Beperkte draagkracht bodem.',
    'NL',
  ],
  [
    'Pachtprijsgebied 9: Hollandse/Utrechtse waarden',
    0,
    'RVO',
    'Hollands/Utrechts weidegebied: rivierklei en veengrond. Pachtnorm circa 700 EUR/ha. Grasland voor melkveehouderij. Uiterwaarden: overstromingrisico beperkt intensief gebruik.',
    'NL',
  ],
  [
    'Pachtprijsgebied 10: Rivierengebied',
    0,
    'RVO',
    'Rivierengebied (Gelderland/Zuid-Holland): vruchtbare rivierklei. Pachtnorm circa 750 EUR/ha. Akkerbouw en fruitteelt (Betuwe). Uiterwaarden onder Natura 2000-bescherming.',
    'NL',
  ],
  [
    'Pachtprijsgebied 11: Zuidwestelijk akkerbouwgebied',
    0,
    'RVO',
    'Zuidwestelijk akkerbouwgebied (Zeeland/Zuid-Holland): zeekleigrond, akkerbouw. Pachtnorm circa 800 EUR/ha. Aardappelen, graan, suikerbieten, uien. Grote bedrijven.',
    'NL',
  ],
  [
    'Pachtprijsgebied 12: Zuidelijk veehouderijgebied',
    0,
    'RVO',
    'Zuidelijk veehouderijgebied (Noord-Brabant/Limburg): zandgrond, intensieve veehouderij. Pachtnorm circa 750 EUR/ha. Hoge mestdruk, veel glastuinbouw. Stikstofproblematiek prominent.',
    'NL',
  ],
  [
    'Pachtprijsgebied 13: Zuid-Limburg',
    0,
    'RVO',
    'Zuid-Limburg: lossgrond (vruchtbare leemgrond). Pachtnorm circa 700 EUR/ha. Akkerbouw (graan, suikerbieten). Heuvelland met erosieproblematiek. Kleinschalig landschap.',
    'NL',
  ],
  [
    'Pachtprijsgebied 14: Overig Noord-Holland',
    0,
    'RVO',
    'Overig Noord-Holland (boven het IJ): klei- en zavelgrond. Pachtnorm circa 650 EUR/ha. Akkerbouw (pootaardappelen, bloembollen), grasland. Droogmakerijen en polders.',
    'NL',
  ],
  // ── NEW: Pachtcontract inhoud en geschillen ──
  [
    'Pachtcontract — verplichte inhoud',
    1,
    'Grondkamer',
    'Reguliere pachtovereenkomst moet schriftelijk en bevat: partijen, kadastrale aanduiding, oppervlakte, pachtprijs, ingangsdatum, duur, bestemming (landbouw). Grondkamer toetst op: redelijke pachtprijs (niet boven regionorm), billijke voorwaarden, geen strijd met de wet. Mondelinge pachtovereenkomst is nietig sinds 2007.',
    'NL',
  ],
  [
    'Tussentijdse beeindiging pacht',
    1,
    'Grondkamer / Pachtkamer',
    'Tussentijdse beeindiging reguliere pacht alleen in uitzonderingsgevallen: (1) wederzijds goedvinden (schriftelijk), (2) wanprestatie pachter (ernstige verwaarlozing), (3) bestemmingswijziging (onteigening). Grondkamer behandelt verzoek. Pachter heeft recht op schadevergoeding bij vroegtijdige beeindiging door verpachter.',
    'NL',
  ],
  [
    'Geschillenbeslechting — Grondkamer en Pachthof',
    1,
    'Grondkamer (eerste aanleg) / Pachthof Arnhem (hoger beroep)',
    'Pachtgeschillen worden behandeld door de Grondkamer (regionale kamers bij RVO). Hoger beroep bij het Pachthof (onderdeel van Gerechtshof Arnhem-Leeuwarden). Geschillen over: pachtprijs, onderhoud, opzegging, medepacht, indeplaatsstelling. Procedure: verzoekschrift bij Grondkamer, zitting, uitspraak. Griffierecht circa 100-500 EUR.',
    'NL',
  ],
  // ── NEW: Erfpacht details ──
  [
    'Erfpacht — canon berekening',
    1,
    'Kadaster; notariele akte',
    'Canon (jaarlijkse vergoeding) wordt berekend op basis van grondwaarde en rendementspercentage (vaak 2-5%). Bij eeuwigdurende erfpacht: canon periodiek herzien (elke 10, 25, of 50 jaar). Bij tijdelijke erfpacht (bijv. 99 jaar): canon vast of geindexeerd. Herziening geschiedt door drie deskundigen of conform erfpachtvoorwaarden. Gemeentelijke erfpacht (Amsterdam, Den Haag, Leiden) kent eigen canonberekeningsregels.',
    'NL',
  ],
  [
    'Erfpacht — eeuwigdurend vs tijdelijk',
    1,
    'Kadaster',
    'Eeuwigdurende erfpacht: loopt onbeperkt, canon periodiek herzien, erfpachter kan niet worden verplicht grond te verlaten behalve bij ernstige verwaarlozing. Tijdelijke erfpacht: bepaalde duur (vaak 50 of 99 jaar), na afloop terugkeer grond naar eigenaar, erfpachter heeft recht op vergoeding voor aangebrachte verbeteringen. Omzetting van tijdelijk naar eeuwigdurend: via overeenkomst met grondeigenaar, vaak tegen afkoopsom.',
    'NL',
  ],
  // ── NEW: Verpachtersonderhoud ──
  [
    'Verpachtersonderhoud en pachterslasten',
    1,
    'Grondkamer',
    'Verpachter draagt groot onderhoud (drainage, waterbeheersing, gebouwen). Pachter draagt klein onderhoud en dagelijks gebruik. Grondkamer kan geschil over onderhoudsverdeling beslechten. Bij hoevepacht: verpachter verantwoordelijk voor woonhuis en bedrijfsgebouwen. Pachter mag geen ingrijpende veranderingen aanbrengen zonder toestemming verpachter.',
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
  // ── NEW: Bossenstrategie details ──
  [
    'Bossenstrategie 2030 — bos binnen NNN',
    'Gemengd (klimaatbestendig)',
    5.0,
    1,
    'Bosaanleg binnen het Natuur Netwerk Nederland (NNN, voorheen EHS): circa 15.000 ha van de 37.000 ha doelstelling. Hogere subsidie (tot 7.000 EUR/ha). Voorkeur voor ecologische verbindingszones. Provincies kopen grond op of sluiten overeenkomsten met grondeigenaren.',
    0,
    'NL',
  ],
  [
    'Bossenstrategie 2030 — bos buiten NNN',
    'Gemengd (productie + biodiversiteit)',
    1.0,
    0,
    'Bosaanleg buiten NNN: circa 22.000 ha. Combinatie met landbouw (agroforestry), langs wegen, in stedelijk gebied (tiny forests). Lagere subsidie (2.000-4.000 EUR/ha). Minder strikte soorteisen maar inheems loofhout aanbevolen.',
    0,
    'NL',
  ],
  // ── NEW: Subsidie bosaanleg per provincie ──
  [
    'Subsidie bosaanleg — Gelderland',
    'Inheems loofhout',
    0.5,
    0,
    'Provincie Gelderland: subsidie bosaanleg via Subsidieregeling Vitaal Gelderland. Circa 3.000-5.000 EUR/ha voor loofhout, 2.000-3.000 EUR/ha voor gemengd bos. Aanvullende subsidie voor landschapselementen (houtwallen, singels). Aanvraag via provincieloket.',
    0,
    'NL',
  ],
  [
    'Subsidie bosaanleg — Noord-Brabant',
    'Gemengd (klimaatbestendig)',
    1.0,
    0,
    'Provincie Noord-Brabant: subsidie via Subsidieregeling Natuur Noord-Brabant. Circa 3.500-6.000 EUR/ha voor bosaanleg. Extra premie voor bosaanleg in stikstofgevoelige gebieden. Focus op klimaatbos (gemengd, inheems). Grondverwerving door provincie of via Brabants Landschap.',
    0,
    'NL',
  ],
  // ── NEW: Klimaatbestendig sortiment ──
  [
    'Soortenkeuze klimaatbestendig — toekomstbomen',
    'Klimaatbestendig sortiment',
    null,
    0,
    'Klimaatscenario\'s (KNMI 2023) vereisen aanpassing soortenkeuze. Toekomstbomen: wintereik (droogteresistent), zoete kers (Prunus avium), tamme kastanje (Castanea sativa), elsbes (Sorbus torminalis), winterlinde (Tilia cordata). Vermijden: beuk (droogtegevoelig op zandgrond), fijnspar (borkevergevoelig). Stichting Probos en Staatsbosbeheer publiceren sortimentsadviezen.',
    0,
    'NL',
  ],
  [
    'Soortenkeuze — productiebos',
    'Productiehout (douglas, lariks, populier, eik)',
    2.0,
    0,
    'Productiebos voor duurzame houtoogst. Douglasspar (Pseudotsuga menziesii): hoogwaardig constructiehout, 60-80 jaar omlooptijd. Lariks: duurzaam hout zonder behandeling. Populier: snelgroeiend, 20-30 jaar omlooptijd, verpakkingshout. Eik: langzaam, hoogwaardig, 120+ jaar. FSC/PEFC-certificering aanbevolen. Subsidie productiebos lager dan biodiversiteitsbos.',
    0,
    'NL',
  ],
  // ── NEW: Agroforestry varianten ──
  [
    'Voedselbos (food forest)',
    'Meerlagig (boom, struik, kruid, bodembedekker)',
    0.25,
    0,
    'Voedselbos: meerlagig systeem van eetbare gewassen (noten, fruit, bessen, kruiden). Geen subsidie als landbouwgrond (telt als natuur). GLB eco-regeling mogelijk als agroforestry-element. Stichting Voedselbosbouw adviseert. Circa 10.000-20.000 EUR/ha aanlegkosten. Geen kapvergunning nodig voor oogst.',
    0,
    'NL',
  ],
  [
    'Silvopasture (bomen met begrazing)',
    'Loofhout (eik, wilg, els) met grasland',
    1.0,
    0,
    'Silvopasture: combinatie van bomen met veeweiden. Bomen bieden schaduw (dierwelzijn), windluwte, en extra inkomen (hout, noten). GLB eco-regeling: circa 200-300 EUR/ha/jaar. Boomkeuze: eik, wilg, els (bestand tegen vraat). Bescherming jonge bomen met boomkokers of afrastering nodig. Maximaal 100 bomen/ha voor behoud graslandsubsidie.',
    0,
    'NL',
  ],
  [
    'Silvoarable (bomen met akkerbouw)',
    'Rijenbeplanting (walnoot, populier, kers)',
    2.0,
    0,
    'Silvoarable: bomenrijen op akkerbouwpercelen. Bomen in rijen op 25-50 m afstand, gewassen ertussen. Walnoot en populier meest gangbaar. GLB eco-regeling: circa 200-400 EUR/ha/jaar. Aanlegsubsidie: circa 1.500-3.000 EUR/ha. Geen kapverordening voor geoogste bomen (bedrijfsmatige teelt). Opbrengstverlies akkerbouw circa 10-15% gecompenseerd door boomopbrengst op termijn.',
    0,
    'NL',
  ],
  [
    'Agroforestry — regelgeving en perceelstatus',
    'Gemengd',
    null,
    0,
    'Agroforestry-percelen met >50 bomen/ha of >20% kroonbedekking tellen als bos (Wnb). Gevolg: meldingsplicht bij kap, herplantplicht. GLB-betaalrechten alleen bij <100 bomen/ha op grasland of <50 bomen/ha op bouwland. RVO beoordeelt perceelstatus per luchtfoto. Omzetting landbouwgrond naar bos is definitief (geen terugzetting zonder ontheffing).',
    0,
    'NL',
  ],
  // ── NEW: Bosbeheer ──
  [
    'Bosbeheer — kap en verjonging',
    'Inheems (natuurlijke verjonging prioriteit)',
    null,
    0,
    'Kaalkap van <0,5 ha is regulier bosbeheer (geen meldingsplicht als herplant volgt). Schermkap en groepenkap stimuleren natuurlijke verjonging. Gedragscode Bosbeheer biedt vrijstelling soortenbescherming bij werken volgens protocol. Rijksbijdrage bosbeheer via SNL: circa 50-100 EUR/ha/jaar.',
    0,
    'NL',
  ],
  [
    'Bosbeheer — hakhout en middenbos',
    'Inheems loofhout (eik, es, hazelaar, els)',
    null,
    0,
    'Hakhout: periodiek afzetten (cyclus 7-25 jaar) van loofhout dat weer uitloopt. Traditioneel bosbeheer, bevordert biodiversiteit. Middenbos: combinatie van hakhout (onderlaag) met overstaanders (bovenlaag). Subsidie via SNL beheertype N16.01 (droog bos met productie). Geen herplantplicht bij regulier hakhoutbeheer.',
    0,
    'NL',
  ],
  // ── NEW: Bosbrandpreventie ──
  [
    'Bosbrandpreventie — risicogebieden en maatregelen',
    'Naaldhout en gemengd',
    null,
    0,
    'Risicogebieden: Veluwe, Noord-Brabant (zandgronden met naaldbos), Drenthe. Natuurbrandrisico neemt toe door klimaatverandering en droogte. Maatregelen: brandstroken (10-30 m breed), laubholzstreifen (loofhoutstrook als brandrem), waterpunten voor blushelikopters, rookverbod (1 april-1 november in bos). Veiligheidsregio bepaalt natuurbrandrisicoclassificatie. Beheersubsidie voor preventieve maatregelen via provincie.',
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
  // ── NEW: Extra TPO entries ──
  [
    'Bomenverordening versus APV',
    1,
    'Gemeente',
    null,
    'Sommige gemeenten hebben een aparte Bomenverordening naast de APV. De Bomenverordening bevat specifieke regels voor beschermde bomen, monumentale-bomenlijst, herplantplicht, en schadevergoeding. Andere gemeenten regelen alles via de APV.',
    'Boete per verordening. Variatie per gemeente: 5.000-25.000 EUR.',
    'Gemeentelijke Bomenverordening; APV',
    'NL',
  ],
  [
    'Waardebepaling monumentale boom',
    0,
    'Gemeente / taxateur',
    null,
    'Waarde van een monumentale boom wordt bepaald via de NVTB-methode (Nederlandse Vereniging van Taxateurs van Bomen). Factoren: stamomtrek, soort, conditie, levensverwachting, beeldbepalende waarde, cultuurhistorie. Waarde kan oplopen tot 50.000-100.000 EUR voor oude eiken of beuken. Schadeclaim bij illegale kap gebaseerd op deze waarde.',
    null,
    'NVTB-methode; gemeentelijke APV',
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
  [
    'Landschapselementen per type: houtwal singel elzensingel knotbomenrij',
    'Beschermde landschapselementen: houtwallen (aarden wal met opgaande begroeiing), singels (rij bomen als perceelscheiding), elzensingels (zwarte els langs sloten, kenmerkend Friese Wouden), knotbomenrijen (periodiek geknot, cultuurhistorisch). Bescherming via provinciale verordening en ANLb-subsidie.',
    'hedgerow',
    'NL',
  ],
  [
    'Provinciale bescherming landschapselementen',
    'Provincies (Gelderland, Overijssel, Friesland) hebben aanvullende regels voor bescherming van landschapselementen bovenop de Wet natuurbescherming. Omgevingsverordening per provincie bepaalt beschermde elementen, vergunningplicht, en compensatieverplichtingen.',
    'hedgerow',
    'NL',
  ],
  [
    'Groenblauwe dooradering subsidie voorwaarden',
    'Groenblauwe dooradering: netwerk van groene (houtwallen, singels) en blauwe (sloten, poelen) landschapselementen. Subsidie via ANLb, minimaal 6 jaar beheerovereenkomst, beheerplan volgens ecologische normen, monitoring door agrarisch collectief.',
    'hedgerow',
    'NL',
  ],
  [
    'Herplant soortenkeuze plantafstand controle',
    'Bij herplantplicht: soortenkeuze in overleg met provincie (voorkeur inheems loofhout). Plantafstand per soort: eik 4-6 m, berk 3-4 m, beuk 5-7 m. Controle na 3 jaar: 80% moet aangeslagen zijn. Financiele compensatie (15.000-25.000 EUR/ha) als fysieke herplant onmogelijk.',
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
  [
    'Kapvergunning stedelijk versus landelijk gebied',
    'In stedelijk gebied lagere kapdrempel (stamomtrek >30 cm). In landelijk gebied primair Wnb-meldingsplicht bij provincie. Gemeentelijke APV kan aanvullend gelden in beide gevallen. Amsterdam, Utrecht, Rotterdam vereisen vergunning voor bijna elke boom.',
    'felling',
    'NL',
  ],
  [
    'Noodkap bij iepziekte en essentaksterfte',
    'Iepziekte (Ophiostoma): snelle verwijdering nodig, versnelde vergunningprocedure via gemeentelijke iepziekte-coordinator. Essentaksterfte (Hymenoscyphus): geen automatische vrijstelling, beoordeling per boom op stabiliteit. Beide: herplantplicht blijft gelden.',
    'felling',
    'NL',
  ],
  [
    'Boscompensatie financieel compensatiefonds',
    'Bij onmogelijkheid fysieke herplant: storting in provinciaal groenfonds of landelijk Boscompensatiefonds. Compensatiebedrag circa 15.000-25.000 EUR/ha inclusief beheer eerste 10 jaar. Aanvraag bij Gedeputeerde Staten.',
    'felling',
    'NL',
  ],
  [
    'Boswet-ontheffingen woningbouw infrastructuur natuur',
    'Ontheffing herplantplicht bij: woningbouw (compensatie elders), infrastructuur (Boscompensatiefonds), natuurontwikkeling (omvorming bos naar heide/moeras mits in goedgekeurd beheerplan). Aanvraag bij Gedeputeerde Staten of minister van LNV.',
    'felling',
    'NL',
  ],
  [
    'Beschermde boomsoorten exoten vleermuizen',
    'Bomen met vleermuisverblijfplaatsen extra beschermd (Wnb art. 3.5): ontheffing soortenbescherming naast kapmelding vereist. Invasieve exoten (Prunus serotina, Quercus rubra): verwijdering gestimuleerd, geen meldingsplicht in goedgekeurd beheerplan.',
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
  [
    'Wateronttrekking drainage ontgronding nabij Natura 2000',
    'Grondwateronttrekking, drainage-aanleg, en ontgronding (zand/grind/klei) nabij Natura 2000 vereisen vergunning als hydrologisch effect verwacht. Waterschap en provincie beoordelen gezamenlijk. Ontgronding ook Ontgrondingenwet-vergunning nodig.',
    'sssi',
    'NL',
  ],
  [
    'Bouw sloop begrazing nabij Natura 2000',
    'Bouw en sloop nabij Natura 2000: AERIUS-berekening voor bouwfase (tijdelijk) en gebruiksfase (structureel). Emissiearm materieel vereist. Begrazing-intensivering: vergunning als extra ammoniakemissie significant. Maximaal vee per hectare.',
    'sssi',
    'NL',
  ],
  [
    'Evenementen verlichting recreatie nabij Natura 2000',
    'Evenementen (festivals, vuurwerk), recreatie-uitbreiding, en kunstmatige verlichting nabij Natura 2000 vereisen voortoets. Geluid, licht, en betreding zijn hoofdfactoren. Vleermuisvriendelijke verlichting: amberkleur, <2700K, neerwaarts gericht.',
    'sssi',
    'NL',
  ],
  [
    'ADC-toets Alternatieven Dwingende redenen Compensatie',
    'Als passende beoordeling significant negatief effect concludeert: vergunning alleen via ADC-toets. Geen Alternatieven, Dwingende redenen groot openbaar belang, Compenserende maatregelen voldoende. Compensatienatuur voor aanvang gerealiseerd.',
    'sssi',
    'NL',
  ],
  [
    'Intern extern salderen stikstofdepositie',
    'Intern salderen: nieuwe activiteit gesaldeerd met bestaande op zelfde bedrijf, geen vergunningplicht sinds 2022 maar wel melding. Extern salderen: stikstofdepositieruimte overnemen van ander bedrijf, 30% afroming, alleen feitelijk gerealiseerde capaciteit.',
    'sssi',
    'NL',
  ],
  [
    'Soortenbescherming ontheffing gedragscode ruimtelijke ingrepen',
    'Bij ruimtelijke ingrepen die beschermde soorten verstoren: ontheffing Wnb art. 3.3/3.5 bij RVO. Gedragscodes (Bosbeheer, Bestendig Beheer) bieden generieke vrijstelling voor specifieke werkzaamheden. Quickscan ecologie altijd verplicht.',
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
  [
    'Jaagpaden dijkpaden kerkepad schoolpad',
    'Jaagpaden: historische paden langs kanalen, nu recreatief. Dijkpaden: op of langs waterkeringen, beheer waterschap. Kerkepaden: historische voetpaden naar dorpskerk, status via Wegenlegger. Schoolpaden: vergelijkbaar, veel verdwenen door ruilverkaveling.',
    'rights_of_way',
    'NL',
  ],
  [
    'Openbaar versus privaat pad Wegenwet',
    'Pad is openbaar als: opgenomen in Wegenlegger, 30 jaar onafgebroken openbaar, of 10 jaar openbaar met onderhoud door rechthebbende (Wegenwet art. 4). Wegenlegger is hoofdbewijs. Privaat pad wordt niet automatisch openbaar door feitelijk gebruik.',
    'rights_of_way',
    'NL',
  ],
  [
    'Onderhoud wie betaalt verplichtingen aansprakelijkheid',
    'Wegbeheerder (gemeente, provincie, waterschap) verantwoordelijk voor onderhoud openbare paden. Aanliggende eigenaren: overhangende takken verwijderen (art. 5:44 BW). Gebrekkig onderhoud: aansprakelijkheid wegbeheerder (art. 6:174 BW).',
    'rights_of_way',
    'NL',
  ],
  [
    'Toegankelijkheid mobiliteit hekken overstapjes',
    'Openbare paden moeten toegankelijk zijn. Hekken en overstapjes alleen met toestemming wegbeheerder. Minimale doorgang bij hekken: 0,9 m (rolstoeltoegankelijk). Overstapjes waar mogelijk vervangen door klaphek. VN-Verdrag rechten personen met handicap van toepassing.',
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
  [
    'Pachtprijsgebieden 14 regio normen',
    'De 14 pachtprijsgebieden met normen: Bouwhoek/Hogeland 800, Veenkoloniën/Oldambt 650, Noordelijk weidegebied 750, Oostelijk veehouderijgebied 700, Centraal veehouderijgebied 750, IJsselmeerpolders 900, Westelijk Holland 600, Waterland/Droogmakerijen 400, Hollandse/Utrechtse waarden 700, Rivierengebied 750, Zuidwestelijk akkerbouw 800, Zuidelijk veehouderijgebied 750, Zuid-Limburg 700, Overig Noord-Holland 650 EUR/ha.',
    'common_land',
    'NL',
  ],
  [
    'Pachtcontract inhoud geschillen Grondkamer Pachthof',
    'Pachtovereenkomst schriftelijk verplicht: partijen, kadastrale aanduiding, pachtprijs, duur, bestemming. Grondkamer toetst redelijke prijs en voorwaarden. Geschillen: Grondkamer (eerste aanleg), Pachthof Arnhem (hoger beroep). Tussentijdse beeindiging alleen bij wanprestatie, wederzijds goedvinden, of bestemmingswijziging.',
    'common_land',
    'NL',
  ],
  [
    'Erfpacht canon berekening eeuwigdurend tijdelijk',
    'Canon berekend op grondwaarde x rendementspercentage (2-5%). Eeuwigdurende erfpacht: loopt onbeperkt, canon periodiek herzien. Tijdelijke erfpacht: bepaalde duur (50 of 99 jaar), na afloop terugkeer grond. Gemeentelijke erfpacht (Amsterdam, Den Haag) kent eigen canonregels.',
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
  [
    'Bossenstrategie binnen en buiten NNN',
    'Bosaanleg binnen NNN: circa 15.000 ha, hogere subsidie (tot 7.000 EUR/ha), ecologische verbindingszones. Bosaanleg buiten NNN: circa 22.000 ha, combinatie met landbouw, langs wegen, stedelijk (tiny forests), lagere subsidie (2.000-4.000 EUR/ha).',
    'planting',
    'NL',
  ],
  [
    'Klimaatbestendig sortiment toekomstbomen',
    'Klimaatadaptatie soortenkeuze: wintereik (droogteresistent), zoete kers, tamme kastanje, elsbes, winterlinde. Vermijden: beuk (droogtegevoelig op zand), fijnspar (borkevergevoelig). Probos en Staatsbosbeheer publiceren sortimentsadviezen per grondsoort.',
    'planting',
    'NL',
  ],
  [
    'Voedselbos silvopasture silvoarable agroforestry varianten',
    'Voedselbos: meerlagig eetbaar systeem (10.000-20.000 EUR/ha aanleg). Silvopasture: bomen met begrazing, schaduw voor vee, max 100 bomen/ha. Silvoarable: bomenrijen op akkers, 25-50 m afstand. Agroforestry >50 bomen/ha telt als bos (Wnb-herplantplicht).',
    'planting',
    'NL',
  ],
  [
    'Bosbeheer hakhout middenbos verjonging',
    'Regulier bosbeheer: kaalkap <0,5 ha (geen meldingsplicht als herplant volgt), schermkap, groepenkap. Hakhout: periodiek afzetten (cyclus 7-25 jaar). Middenbos: hakhout + overstaanders. Gedragscode Bosbeheer: generieke vrijstelling soortenbescherming.',
    'planting',
    'NL',
  ],
  [
    'Bosbrandpreventie risicogebieden Veluwe Brabant',
    'Natuurbrandrisico: Veluwe, Noord-Brabant, Drenthe (zandgronden met naaldbos). Maatregelen: brandstroken 10-30 m, loofhoutstroken als brandrem, waterpunten, rookverbod april-november. Beheersubsidie via provincie voor preventieve maatregelen.',
    'planting',
    'NL',
  ],

  // TPO
  [
    'Monumentale boom werkzaamheden boomeffectanalyse',
    'Werkzaamheden aan monumentale bomen: alleen door gecertificeerd boomverzorger (ETW/ETT). Boomeffectanalyse (BEA) vaak vereist bij kap of bouw. Waardebepaling via NVTB-methode: tot 50.000-100.000 EUR voor oude eiken of beuken.',
    'tpo',
    'NL',
  ],
  [
    'Beschermde bomen bestemmingsplan bomenverordening',
    'Bescherming via bestemmingsplan (groenelement/landschapselement) of aparte Bomenverordening. Wijziging vereist planherziening. Overtreding: bestuursrechtelijke handhaving, dwangsom, bestuursdwang. Boete variatie per gemeente: 5.000-25.000 EUR.',
    'tpo',
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
        'Provinciale verordeningen natuur en landschap',
        'Wegenwet (openbare paden)',
        'ANLb (agrarisch natuur- en landschapsbeheer)',
        'Pachtbesluit / Grondkamer / Pachthof',
        'GLB eco-regelingen (agroforestry)',
        'EU LULUCF-verordening',
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
