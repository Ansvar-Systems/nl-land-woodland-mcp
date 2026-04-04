#!/usr/bin/env tsx
/**
 * Build the production database.
 * Reuses the test seed data (same data, just written to data/database.db).
 */
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, unlinkSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'database.db');

// Remove existing DB
if (existsSync(DB_PATH)) {
  unlinkSync(DB_PATH);
  console.log('Removed existing database');
}

// Import and run seed
const { createSeededDatabase } = await import('../tests/helpers/seed-db.js');
const db = createSeededDatabase(DB_PATH);
db.close();

console.log(`Database built at ${DB_PATH}`);
