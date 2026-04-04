# UK Land & Woodland Management MCP

[![CI](https://github.com/Ansvar-Systems/nl-land-woodland-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/nl-land-woodland-mcp/actions/workflows/ci.yml)
[![GHCR](https://github.com/Ansvar-Systems/nl-land-woodland-mcp/actions/workflows/ghcr-build.yml/badge.svg)](https://github.com/Ansvar-Systems/nl-land-woodland-mcp/actions/workflows/ghcr-build.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

UK land and woodland management regulations via the [Model Context Protocol](https://modelcontextprotocol.io). Query hedgerow regulations, felling licences, SSSI consent, public rights of way, common land rules, and woodland planting guidance -- all from your AI assistant.

Part of [Ansvar Open Agriculture](https://ansvar.eu/open-agriculture).

## Why This Exists

Landowners, farmers, and land agents need to check regulatory requirements before managing hedgerows, felling trees, working on SSSIs, or planting woodland. These rules are spread across multiple Acts of Parliament, statutory instruments, and Forestry Commission guidance documents. This MCP server brings them together in a single queryable source.

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "uk-land-woodland": {
      "command": "npx",
      "args": ["-y", "@ansvar/nl-land-woodland-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add uk-land-woodland npx @ansvar/nl-land-woodland-mcp
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

- "Do I need permission to remove a hedgerow?"
- "How much timber can I fell without a licence?"
- "What consent do I need to fertilise an SSSI?"
- "What is the minimum width for a public footpath?"
- "Can I put a fence on common land?"
- "What grants are available for broadleaf woodland planting?"

## Stats

| Metric | Value |
|--------|-------|
| Tools | 10 (3 meta + 7 domain) |
| Jurisdiction | GB |
| Data sources | Hedgerow Regs 1997, Forestry Act 1967, Wildlife & Countryside Act 1981, CRoW Act 2000, Commons Act 2006, EWCO Guidance |
| License (data) | Open Government Licence v3 |
| License (code) | Apache-2.0 |
| Transport | stdio + Streamable HTTP |

## Tools

| Tool | Description |
|------|-------------|
| `about` | Server metadata and links |
| `list_sources` | Data sources with freshness info |
| `check_data_freshness` | Staleness status and refresh command |
| `search_land_rules` | FTS5 search across all land/woodland rules |
| `check_hedgerow_rules` | Hedgerow removal notices, exemptions, penalties |
| `get_felling_licence_rules` | Felling licence thresholds, exemptions, process |
| `check_sssi_consent` | SSSI operations requiring Natural England consent |
| `get_rights_of_way_rules` | Path widths, reinstatement deadlines, obstruction |
| `get_common_land_rules` | Common land consent requirements |
| `get_planting_guidance` | EWCO grants, EIA thresholds, ancient woodland buffers |

See [TOOLS.md](TOOLS.md) for full parameter documentation.

## Security Scanning

This repository runs security checks on every push:

- **CodeQL** -- static analysis for JavaScript/TypeScript
- **Gitleaks** -- secret detection across full history
- **Dependency review** -- via Dependabot
- **Container scanning** -- via GHCR build pipeline

See [SECURITY.md](SECURITY.md) for reporting policy.

## Disclaimer

This tool provides reference data for informational purposes only. It is not professional legal or land management advice. Requirements vary by local planning authority and site-specific designations. See [DISCLAIMER.md](DISCLAIMER.md).

## Contributing

Issues and pull requests welcome. For security vulnerabilities, email security@ansvar.eu (do not open a public issue).

## License

Apache-2.0. Data sourced under Open Government Licence v3.
