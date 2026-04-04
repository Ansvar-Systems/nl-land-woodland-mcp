# Tools Reference

## Meta Tools

### `about`

Get server metadata: name, version, coverage, data sources, and links.

**Parameters:** None

**Returns:** Server name, version, jurisdiction list, data source names, tool count, homepage/repository links.

---

### `list_sources`

List all data sources with authority, URL, license, and freshness info.

**Parameters:** None

**Returns:** Array of data sources, each with `name`, `authority`, `official_url`, `retrieval_method`, `update_frequency`, `license`, `coverage`, `last_retrieved`.

---

### `check_data_freshness`

Check when data was last ingested, staleness status, and how to trigger a refresh.

**Parameters:** None

**Returns:** `status` (fresh/stale/unknown), `last_ingest`, `days_since_ingest`, `staleness_threshold_days`, `refresh_command`.

---

## Domain Tools

### `search_land_rules`

Full-text search across all Dutch land and woodland management rules. Use for broad queries about houtopstanden, kap, Natura 2000, pachtrecht, openbare paden, or bosaanleg.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Free-text search query |
| `topic` | string | No | Filter by topic (hedgerow, felling, sssi, rights_of_way, common_land, planting) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: NL) |
| `limit` | number | No | Max results (default: 20, max: 50) |

**Example:** `{ "query": "kapvergunning herplantplicht" }`

---

### `check_hedgerow_rules`

Check houtopstand/bomenrij regulations by action type. Returns meldingsplicht, uitzonderingen, herplantplicht, and boetes under the Wet natuurbescherming art. 4.2-4.6.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | Action type (e.g. Kappen, Snoeien, Herplant, Melding, Monumentale) |
| `hedgerow_type` | string | No | Houtopstand classification |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: NL) |

**Returns:** Notice requirement (boolean), exemptions, criteria, penalties, regulation reference.

**Example:** `{ "action": "Kappen" }`

---

### `get_felling_licence_rules`

Get kapvergunning requirements by reason. Returns whether a vergunning/melding is needed, exemptions, application process, and strafmaat.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `volume_m3` | number | No | Volume of timber in cubic metres |
| `area_ha` | number | No | Area of houtopstand in hectares |
| `reason` | string | No | Reason for kap (e.g. Gevaarlijke, Fruit, Herplant, Dunning) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: NL) |

**Returns:** Matching rules with vergunning requirement, thresholds, exemptions, application process, penalties.

**Example:** `{ "reason": "Fruit" }` -- returns that fruitbomen are exempt from meldingsplicht

---

### `check_sssi_consent`

Check whether an activity in or near a Natura 2000-gebied requires a Wnb vergunning. Returns process, typical conditions (AERIUS, KDW), and boetes.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `activity` | string | Yes | Proposed activity (e.g. Nieuwbouw, Uitbreiding, Bemesting, Grondverzet, Recreatief) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: NL) |

**Returns:** Vergunning required (boolean), process (including AERIUS berekening), typical conditions, penalties.

**Example:** `{ "activity": "Bemesting" }`

---

### `get_rights_of_way_rules`

Get rules for openbare paden by path type and issue. Returns minimum widths, cropping rules, reinstatement deadlines, and obstruction liability.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path_type` | string | No | Path type (Klompenpad, LAW-route, Openbaar voetpad, Fietspad, Jaagpad, Ruiterpad) |
| `issue` | string | No | Issue type (e.g. bestuursdwang, blokkade, onderhoud) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: NL) |

**Returns:** Path type, obligation, minimum width (metres), cropping rules, reinstatement deadline, obstruction liability.

**Example:** `{ "path_type": "Klompenpad" }` -- returns 1.0m minimum, voluntary participation rules

---

### `get_common_land_rules`

Get pachtrecht rules for land lease in the Netherlands. Returns consent requirements, responsible authority (Grondkamer/RVO), and process.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `activity` | string | No | Pacht type (e.g. Reguliere, Geliberaliseerde, Teelt, Erfpacht, Pachtnormen) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: NL) |

**Returns:** Activity, consent required (boolean), consent authority, process.

**Example:** `{ "activity": "Reguliere" }`

---

### `get_planting_guidance`

Get bosaanleg guidance including provincial subsidies, Bossenstrategie targets, soortenkeuze, and LULUCF compensatie.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tree_type` | string | No | Species group (e.g. loofhout, naaldhout, inheems, gemengd) |
| `purpose` | string | No | Planting purpose (e.g. Bosaanleg, Agroforestry, Oeverbegroeiing, Natuurcompensatie) |
| `area_ha` | number | No | Planned planting area in hectares (triggers EIA note if >5ha) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: NL) |

**Returns:** Purpose, species group, minimum area, EIA screening required, grant available (with rates).

**Example:** `{ "tree_type": "loofhout", "purpose": "Bosaanleg" }`

---

### `get_tpo_rules`

Get rules for monumentale bomen (beschermde bomen) including consent requirements, boomeffectanalyse, and penalties.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `scenario` | string | No | Scenario (e.g. Werkzaamheden, Dode, Bouw, Beschermde) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: NL) |

**Returns:** Scenario, consent required (boolean), consent authority, exemptions, process, penalties, regulation reference.

**Example:** `{ "scenario": "Werkzaamheden" }`
