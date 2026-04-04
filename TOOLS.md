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

Full-text search across all land and woodland management rules. Use for broad queries about hedgerows, felling, SSSI, rights of way, common land, or planting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Free-text search query |
| `topic` | string | No | Filter by topic (hedgerow, felling, sssi, rights_of_way, common_land, planting) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |
| `limit` | number | No | Max results (default: 20, max: 50) |

**Example:** `{ "query": "hedgerow removal notice" }`

---

### `check_hedgerow_rules`

Check hedgerow regulations by action type. Returns notice requirements, exemptions, important hedgerow criteria, and penalties under the Hedgerow Regulations 1997.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | Action type (e.g. remove, trim, lay, coppice, replace) |
| `hedgerow_type` | string | No | Hedgerow classification (e.g. important, standard) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Notice requirement (boolean), exemptions, important hedgerow criteria, penalties, regulation reference.

**Example:** `{ "action": "remove" }`

---

### `get_felling_licence_rules`

Get tree felling licence requirements by volume, area, or reason. Returns whether a licence is needed, exemptions, application process, and penalties under the Forestry Act 1967.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `volume_m3` | number | No | Volume of timber to fell in cubic metres |
| `area_ha` | number | No | Area of woodland in hectares |
| `reason` | string | No | Reason for felling (e.g. dangerous, planning, garden, fruit) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Licence assessment (if volume provided), matching rules with licence requirement, thresholds, exemptions, application process, penalties.

**Example:** `{ "volume_m3": 8 }` -- returns assessment that licence is required (>5 m3/quarter)

---

### `check_sssi_consent`

Check whether an activity on a Site of Special Scientific Interest requires Natural England consent. Returns process, typical conditions, and penalties.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `activity` | string | Yes | Proposed activity (e.g. grazing, drainage, fertiliser, planting, burning, construction) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Consent required (boolean), process (how to apply), typical conditions, penalties.

**Example:** `{ "activity": "fertiliser" }`

---

### `get_rights_of_way_rules`

Get public rights of way obligations by path type and issue. Returns minimum widths, cropping rules, reinstatement deadlines, and obstruction liability.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path_type` | string | No | Path type (footpath, bridleway, restricted_byway, byway) |
| `issue` | string | No | Issue type (e.g. width, crops, ploughing, obstruction, gates, stiles) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Path type, obligation, minimum width (metres), cropping rules, reinstatement deadline, obstruction liability.

**Example:** `{ "path_type": "footpath" }` -- returns 1m field-edge / 1.5m cross-field minimum, 14-day reinstatement

---

### `get_common_land_rules`

Get rules for activities on common land. Returns consent requirements and responsible authority under the Commons Act 2006.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `activity` | string | No | Proposed activity (e.g. fencing, building, vehicles) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Activity, consent required (boolean), consent authority, process.

**Example:** `{ "activity": "fencing" }`

---

### `get_planting_guidance`

Get woodland planting guidance including grants (EWCO), EIA screening thresholds, ancient woodland buffers, and species recommendations.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tree_type` | string | No | Species group (e.g. broadleaf, conifer, mixed) |
| `purpose` | string | No | Planting purpose (e.g. woodland creation, agroforestry, riparian, community) |
| `area_ha` | number | No | Planned planting area in hectares (triggers EIA note if >5ha) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Purpose, species group, minimum area, EIA screening required, grant available (with rates), ancient woodland buffer distance.

**Example:** `{ "tree_type": "broadleaf", "purpose": "woodland creation", "area_ha": 10 }`
