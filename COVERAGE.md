# Coverage

## What Is Included

- **Hedgerow regulations** from the Hedgerow Regulations 1997: removal notices, 42-day notice period, important hedgerow criteria, exemptions, cross-compliance buffer requirements, penalties
- **Tree felling licence rules** from the Forestry Act 1967: 5 m3/quarter threshold, exemptions (fruit, garden, dangerous, TPO, planning), application process, penalties
- **SSSI operations** from the Wildlife and Countryside Act 1981: 9 operation types requiring Natural England consent, 28-day process, conditions, penalties
- **Public rights of way** from the Highways Act 1980 and CRoW Act 2000: footpath, bridleway, restricted byway, BOAT minimum widths, reinstatement deadlines, cropping rules, obstruction liability
- **Common land** from the Commons Act 2006: fencing, building, vehicles, public access, agricultural works consent requirements
- **Woodland planting guidance** from Forestry Commission EWCO: broadleaf and conifer grant rates, EIA screening thresholds, ancient woodland buffers, agroforestry, riparian, community woodland

## Jurisdictions

| Code | Country | Status |
|------|---------|--------|
| GB | Great Britain | Supported |

## What Is NOT Included

- **Devolved administration specifics** -- Scotland (Scottish Forestry) and Wales (NRW) have separate arrangements for some of these topics
- **Northern Ireland** -- separate legislation (no Hedgerow Regulations equivalent)
- **Tree Preservation Orders** -- mentioned as a felling exemption, but TPO-specific rules are a local authority matter
- **Planning permission** -- referenced where relevant, but planning law itself is not covered
- **Environmental permits** -- pollution, waste, and water abstraction licences are separate regimes
- **Countryside Stewardship scheme details** -- only EWCO woodland creation rates are included
- **SFI payment rates** -- agroforestry options referenced but rates not included
- **Ancient woodland inventory** -- the 15m buffer rule is included, but mapping of ancient woodland sites is not

## Known Gaps

1. Grant rates change annually -- current data reflects 2025-2026 EWCO rates
2. SSSI operations lists are site-specific -- the data shows common operations, but each SSSI notification lists the specific operations requiring consent for that site
3. Cross-compliance rules are being replaced by delinked payments -- GAEC references may become outdated
4. Local planning authority variations are not captured -- hedgerow retention decisions vary by LPA

## Data Freshness

Run `check_data_freshness` to see when data was last updated. The ingestion pipeline runs on a schedule; manual triggers available via `gh workflow run ingest.yml`.
