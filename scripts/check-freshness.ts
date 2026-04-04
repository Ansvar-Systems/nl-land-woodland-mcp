#!/usr/bin/env tsx
import { createDatabase } from '../src/db.js';
import { handleCheckFreshness } from '../src/tools/check-freshness.js';

const db = createDatabase();
const result = handleCheckFreshness(db);
db.close();

console.log(JSON.stringify(result, null, 2));

if (result.status === 'stale') {
  console.error('WARNING: Data is stale. Run `npm run ingest` to refresh.');
  process.exit(1);
}
