// Persistent development database only. Never reads a production connection URL.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
const root = resolve(import.meta.dirname, '..');
const dir = join(root, '.local-data');
const data = join(dir, 'postgres');
const bin = process.env.DATAPATH_PG_BIN || '/opt/homebrew/opt/postgresql@17/bin';
const run = (name, args, allowFailure = false) => {
  const result = spawnSync(join(bin, name), args, { encoding: 'utf8' });
  if (result.status !== 0 && !allowFailure) throw new Error(`${name} failed: ${result.stderr || result.error || 'see .local-data/postgres.log'}`);
  return result.status === 0;
};
if (!existsSync(join(bin, 'pg_ctl'))) throw new Error('PostgreSQL is required. Set DATAPATH_PG_BIN to its bin directory.');
if (process.argv.includes('--stop')) {
  if (existsSync(data)) run('pg_ctl', ['-D', data, '-m', 'fast', 'stop']);
  console.log('Local database stopped; saved accounts remain on disk.');
  process.exit(0);
}
mkdirSync(dir, { recursive: true, mode: 0o700 });
const secretFile = join(dir, 'password');
if (!existsSync(secretFile)) {
  if (existsSync(data)) throw new Error('Existing database has no saved password. Restore it; do not recreate the database.');
  writeFileSync(secretFile, randomBytes(32).toString('hex'), { mode: 0o600 });
}
const password = readFileSync(secretFile, 'utf8').trim();
if (!existsSync(join(data, 'PG_VERSION'))) {
  run('initdb', ['-D', data, '-U', 'datapath_local', '--auth=scram-sha-256', `--pwfile=${secretFile}`]);
}
if (!run('pg_ctl', ['-D', data, 'status'], true)) {
  run('pg_ctl', ['-D', data, '-l', join(dir, 'postgres.log'), '-o', "-h 127.0.0.1 -p 55440 -k ''", 'start']);
}
const base = { host: '127.0.0.1', port: 55440, user: 'datapath_local', password };
const admin = new Pool({ ...base, database: 'postgres' });
try {
  if (!(await admin.query("SELECT 1 FROM pg_database WHERE datname = 'datapath_local'")).rowCount) await admin.query('CREATE DATABASE datapath_local');
} finally { await admin.end(); }
const pool = new Pool({ ...base, database: 'datapath_local' });
try { await migrate(drizzle(pool), { migrationsFolder: join(root, 'drizzle/postgres') }); }
finally { await pool.end(); }
const envFile = join(root, '.env');
const url = `postgresql://datapath_local:${password}@127.0.0.1:55440/datapath_local`;
if (!existsSync(envFile)) {
  writeFileSync(envFile, `NODE_ENV=development\nPORT=3010\nDATABASE_URL=${url}\n`, { mode: 0o600 });
} else if (!readFileSync(envFile, 'utf8').includes(`DATABASE_URL=${url}`)) {
  throw new Error('Existing .env was preserved. Configure it for the local database before starting the app.');
}
console.log('Persistent local accounts ready. Start the app with pnpm dev; open http://localhost:3010.');
