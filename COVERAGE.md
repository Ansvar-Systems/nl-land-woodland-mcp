# Coverage

## What Is Included

- **Houtopstand rules (21)** from the Wet natuurbescherming art. 4.2-4.6: meldingsplicht kap (>10 are buiten bebouwde kom), herplantplicht (soortenkeuze, plantafstand, controle termijnen, financiele compensatie), uitzonderingen (fruitbomen, kwekerij, dunning), boetes, provinciale handhaving. Landschapselementen per type: houtwal, singel, elzensingel, knotbomenrij. Bescherming per provincie: Gelderland, Overijssel, Friesland. Groenblauwe dooradering subsidie. Beschermde boomsoorten.
- **Kapvergunning (24)** from gemeentelijke APV and Wnb: vergunningplicht binnen/buiten bebouwde kom, stedelijk vs landelijk, noodkap (storm, iepziekte, essentaksterfte), dunning regels (onder/boven 20%), boscompensatie (landelijk compensatiefonds), Boswet-ontheffingen (woningbouw, infrastructuur, natuurontwikkeling), per boomsoort (vleermuisverblijfplaats, invasieve exoten, erven)
- **Natura 2000 vergunningen (27)** under Wnb art. 2.7: alle vergunningplichtige activiteiten (bemesting, grondverzet, wateronttrekking, bouw, sloop, begrazing intensivering, drainage, ontgronding, aanplant exoten, recreatie uitbreiding, evenementen, verlichting/vleermuizen). AERIUS (wanneer verplicht, afkapgrens). ADC-toets. Intern en extern salderen. Beheerplannen (inhoud, procedure, participatie). Soortenbescherming (ontheffing, gedragscodes). Stikstofregistratiesysteem.
- **Openbare paden (14)**: klompenpaden, LAW-routes, openbaar voetpad, fietspad, jaagpad, ruiterpad, dijkpad, kerkepad, schoolpad, trekkerpad. Openbaar vs privaat (Wegenwet art. 4). Onderhoud (wie betaalt, verplichtingen, aansprakelijkheid). Toegankelijkheid (mobiliteit, hekken, overstapjes).
- **Pachtrecht (27)** from RVO Pachtbeleid: reguliere pacht, geliberaliseerde pacht, teeltpacht, erfpacht. Alle 14 pachtprijsgebieden met normen (Bouwhoek/Hogeland 800, Veenkolonieen/Oldambt 650, Noordelijk weidegebied 750, Oostelijk veehouderijgebied 700, Centraal veehouderijgebied 750, IJsselmeerpolders 900, Westelijk Holland 600, Waterland/Droogmakerijen 400, Hollandse/Utrechtse waarden 700, Rivierengebied 750, Zuidwestelijk akkerbouw 800, Zuidelijk veehouderijgebied 750, Zuid-Limburg 700, Overig Noord-Holland 650 EUR/ha). Pachtcontract inhoud, tussentijdse beeindiging, geschillen (Grondkamer/Pachthof). Erfpacht: canon berekening, eeuwigdurend vs tijdelijk. Verpachtersonderhoud.
- **Bosaanleg guidance (21)** from Nationale Bossenstrategie / Staatsbosbeheer: Bossenstrategie 2030 (37.000 ha, binnen/buiten NNN). Subsidie per provincie (Gelderland, Noord-Brabant). Soortenkeuze (klimaatbestendig, inheems, productiebos). Agroforestry varianten (voedselbos, silvopasture, silvoarable, regelgeving perceelstatus). Bosbeheer (kap, dunning, verjonging, hakhout, middenbos). Bosbrandpreventie (risicogebieden, maatregelen). LULUCF-compensatie, oeverbegroeiing, natuurcompensatie.
- **Monumentale bomen / TPO (6)**: werkzaamheden, noodkap, bouw nabij, bestemmingsplan, bomenverordening vs APV, NVTB-waardebepaling.
- **Full-text search index (58)**: covering all topics above for cross-domain search.

## Record Counts

| Table | Count |
|-------|-------|
| hedgerow_rules | 21 |
| felling_rules | 24 |
| sssi_operations (Natura 2000) | 27 |
| rights_of_way | 14 |
| common_land_rules (pacht) | 27 |
| planting_guidance | 21 |
| tpo_rules | 6 |
| search_index (FTS5) | 58 |
| **Total** | **198** |

## Jurisdictions

| Code | Country | Status |
|------|---------|--------|
| NL | Netherlands | Supported |

## What Is NOT Included

- **Provinciale verordeningen** -- covered for Gelderland, Overijssel, and Friesland, but not all 12 provinces
- **Gemeentelijke bomenverordeningen** -- APV rules vary per municipality (393 gemeenten)
- **Omgevingswet specifics** -- referenced where relevant, but the full new Omgevingswet (per 2024) regime is not covered
- **Waterwet details** -- jaagpad/watergang access and drainage near Natura 2000 are covered, but not the full water permit regime
- **Meststoffenwet** -- referenced for Natura 2000 bemesting, but the full mest/nitrogen regime is separate
- **Subsidie details per provincie** -- rates given for Gelderland and Noord-Brabant; other provinces have different rates
- **Bestemmingsplan specifics** -- referenced for tree protection, but zoning law itself is not covered
- **Wildschade** -- faunaschade (wildschaderegeling) is a separate domain

## Known Gaps

1. Subsidie rates change annually -- current data reflects 2025-2026 provincial averages
2. Pachtnormen are updated annually by ministerial decree -- data reflects 2026 norms
3. Stikstofbeleid is evolving rapidly -- AERIUS thresholds and salderingsregels may change with new legislation
4. Natura 2000 beheerplannen are site-specific -- data shows common operations, but each area has specific rules
5. Gemeentelijke kapvergunning rules vary significantly between municipalities
6. Agroforestry regelgeving (GLB perceelstatus) is subject to annual RVO interpretation updates

## Data Freshness

Run `check_data_freshness` to see when data was last updated. The ingestion pipeline runs on a schedule; manual triggers available via `gh workflow run ingest.yml`.
