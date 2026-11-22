/**
 * Creates the `lead_manager` database + `leads` table.
 *
 *   npm run db:init      → schema only
 *   npm run db:seed      → schema + demo rows
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createServerConnection } from './pool.js';
import { env } from '../config/env.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const withSeed = process.argv.includes('--seed');

async function main() {
  console.log(`→ Connecting to MySQL at ${env.db.host}:${env.db.port} as ${env.db.user}`);
  const connection = await createServerConnection();

  try {
    const schema = await readFile(path.join(here, 'schema.sql'), 'utf8');
    // mysql2 does not run multiple statements by default.
    for (const statement of schema.split(';')) {
      const sql = statement.trim();
      if (sql) await connection.query(sql);
    }
    console.log(`✓ Database "${env.db.database}" and table "leads" are ready`);

    if (withSeed) {
      const [rows] = await connection.query(
        `SELECT COUNT(*) AS total FROM \`${env.db.database}\`.leads`,
      );
      if (rows[0].total > 0) {
        console.log(`ℹ Skipped seeding — leads table already contains ${rows[0].total} row(s)`);
      } else {
        const seed = await readFile(path.join(here, 'seed.sql'), 'utf8');
        await connection.query(seed);
        console.log('✓ Demo leads inserted');
      }
    }
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('✗ Database initialisation failed:', error.message);
  process.exitCode = 1;
});
