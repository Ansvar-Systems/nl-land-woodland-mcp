# Netherlands Land & Woodland Management MCP

[![CI](https://github.com/Ansvar-Systems/nl-land-woodland-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/nl-land-woodland-mcp/actions/workflows/ci.yml)
[![GHCR](https://github.com/Ansvar-Systems/nl-land-woodland-mcp/actions/workflows/ghcr-build.yml/badge.svg)](https://github.com/Ansvar-Systems/nl-land-woodland-mcp/actions/workflows/ghcr-build.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Dutch land and woodland management regulations via the [Model Context Protocol](https://modelcontextprotocol.io). Query kapvergunning rules, herplantplicht, Natura 2000 vergunningen, pachtrecht, openbare paden, and bosaanleg guidance -- all from your AI assistant.

Part of [Ansvar Open Agriculture](https://ansvar.eu/open-agriculture).

## Why This Exists

Landowners, farmers, and land agents in the Netherlands need to check regulatory requirements before felling trees (houtopstanden), working near Natura 2000 areas, managing pacht agreements, or planting woodland. These rules are spread across the Wet natuurbescherming, gemeentelijke APV, RVO pachtbeleid, and provincial regulations. This MCP server brings them together in a single queryable source.

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nl-land-woodland": {
      "command": "npx",
      "args": ["-y", "@ansvar/nl-land-woodland-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add nl-land-woodland npx @ansvar/nl-land-woodland-mcp
```

### Streamable HTTP (remote)

```
https://mcp.ansvar.eu/nl-land-woodland/mcp
```

### Docker (self-hosted)

```bash
docker run -p 3000:3000 ghcr.io/ansvar-systems/nl-land-woodland-mcp:latest
```

### npm (stdio)

```bash
npx @ansvar/nl-land-woodland-mcp
```

## Example Queries

Ask your AI assistant:

- "Moet ik een kapvergunning aanvragen voor het kappen van bomen?"
- "Wat is de herplantplicht na het vellen van een houtopstand?"
- "Heb ik een Natura 2000-vergunning nodig voor uitbreiding van mijn veestapel?"
- "Wat zijn de pachtnormen per regio in Nederland?"
- "Wat zijn de regels voor klompenpaden?"
- "Welke subsidies zijn er voor bosaanleg?"

## Stats

| Metric | Value |
|--------|-------|
| Tools | 11 (3 meta + 8 domain) |
| Jurisdiction | NL |
| Data sources | Wet natuurbescherming, APV, Natura 2000, RVO Pachtbeleid, Kadaster, Staatsbosbeheer, AERIUS, Wandelnet |
| License (data) | Dutch Government Open Data |
| License (code) | Apache-2.0 |
| Transport | stdio + Streamable HTTP |

## Tools

| Tool | Description |
|------|-------------|
| `about` | Server metadata and links |
| `list_sources` | Data sources with freshness info |
| `check_data_freshness` | Staleness status and refresh command |
| `search_land_rules` | FTS5 search across all land/woodland rules |
| `check_hedgerow_rules` | Houtopstand rules: meldingsplicht, herplantplicht, APV kapvergunning |
| `get_felling_licence_rules` | Kapvergunning thresholds, exemptions, strafmaat |
| `check_sssi_consent` | Natura 2000 vergunningplicht, AERIUS, stikstofdepositie |
| `get_rights_of_way_rules` | Openbare paden: klompenpaden, LAW-routes, jaagpaden |
| `get_common_land_rules` | Pachtrecht: reguliere pacht, geliberaliseerde pacht, erfpacht |
| `get_planting_guidance` | Bosaanleg subsidies, Bossenstrategie, soortenkeuze |
| `get_tpo_rules` | Monumentale bomen bescherming, bomenverordening |

See [TOOLS.md](TOOLS.md) for full parameter documentation.

## Security Scanning

This repository runs security checks on every push:

- **CodeQL** -- static analysis for JavaScript/TypeScript
- **Gitleaks** -- secret detection across full history
- **Dependency review** -- via Dependabot
- **Container scanning** -- via GHCR build pipeline

See [SECURITY.md](SECURITY.md) for reporting policy.

## Disclaimer

This tool provides reference data for informational purposes only. It is not professional legal or land management advice. Requirements vary by gemeente, provincie, and site-specific designations. See [DISCLAIMER.md](DISCLAIMER.md).

## Contributing

Issues and pull requests welcome. For security vulnerabilities, email security@ansvar.eu (do not open a public issue).

## License

Apache-2.0. Data sourced under Dutch Government Open Data licence.
