#!/usr/bin/env tsx
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createDatabase } from '../src/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = createDatabase();

const hedgerowCount = db.get<{ c: number }>('SELECT COUNT(*) as c FROM hedgerow_rules')?.c ?? 0;
const fellingCount = db.get<{ c: number }>('SELECT COUNT(*) as c FROM felling_rules')?.c ?? 0;
const sssiCount = db.get<{ c: number }>('SELECT COUNT(*) as c FROM sssi_operations')?.c ?? 0;
const rowCount = db.get<{ c: number }>('SELECT COUNT(*) as c FROM rights_of_way')?.c ?? 0;
const commonCount = db.get<{ c: number }>('SELECT COUNT(*) as c FROM common_land_rules')?.c ?? 0;
const plantingCount = db.get<{ c: number }>('SELECT COUNT(*) as c FROM planting_guidance')?.c ?? 0;
const ftsCount = db.get<{ c: number }>('SELECT COUNT(*) as c FROM search_index')?.c ?? 0;

const coverage = {
  mcp_name: 'UK Land & Woodland Management MCP',
  jurisdiction: 'GB',
  build_date: new Date().toISOString().split('T')[0],
  hedgerow_rules: hedgerowCount,
  felling_rules: fellingCount,
  sssi_operations: sssiCount,
  rights_of_way: rowCount,
  common_land_rules: commonCount,
  planting_guidance: plantingCount,
  fts_entries: ftsCount,
};

db.close();

const outPath = join(__dirname, '..', 'data', 'coverage.json');
writeFileSync(outPath, JSON.stringify(coverage, null, 2) + '\n');
console.log(`Coverage written to ${outPath}`);
console.log(JSON.stringify(coverage, null, 2));
