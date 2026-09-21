import assert from "node:assert/strict";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
const url = process.env.DATAPATH_TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith("/datapath_integration_test")) throw new Error("Disposable datapath_integration_test database required");
process.env.DATABASE_URL = url;
Object.assign(process.env, { AI_MODEL: "integration-test-model", AI_INPUT_USD_PER_MILLION: "1", AI_OUTPUT_USD_PER_MILLION: "1", AI_MONTHLY_CAP_USD: "100", AI_REQUESTS_PER_HOUR: "2" });
const pool = new Pool({ connectionString: url });
await migrate(drizzle(pool), { migrationsFolder: "./drizzle/postgres" });
const { reserveAI, settleAI } = await import("../server/ai-budget");
const { closeDb } = await import("../server/db");
const month = new Date().toISOString().slice(0, 7);
const before = (await pool.query('SELECT "spentMicros" FROM "aiBudgets" WHERE month=$1', [month])).rows[0];
const baseline = Number(before?.spentMicros ?? 0);
const user = (await pool.query('INSERT INTO users ("openId") VALUES ($1) RETURNING id', [`ai-test-${Date.now()}`])).rows[0].id;
try {
  // Each reservation = (100 input bytes + 1024 allowance + 100 output) * 2 = 2448 micro-USD.
  process.env.AI_MONTHLY_CAP_USD = String((baseline + 2448) / 1e6);
  const race = await Promise.allSettled([reserveAI(user, 100, 100), reserveAI(user, 100, 100)]);
  assert.equal(race.filter(r => r.status === "fulfilled").length, 1);
  const reservation = (race.find(r => r.status === "fulfilled") as PromiseFulfilledResult<Awaited<ReturnType<typeof reserveAI>>>).value;
  await settleAI(reservation, 1, { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 });
  await settleAI(reservation, 1, { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 });
  assert.equal(Number((await pool.query('SELECT "spentMicros" FROM "aiBudgets" WHERE month=$1', [month])).rows[0].spentMicros), baseline + 30, "settlement is idempotent");
  process.env.AI_MONTHLY_CAP_USD = "100";
  const unknown = await reserveAI(user, 100, 100);
  await settleAI(unknown, 2);
  assert.equal(Number((await pool.query('SELECT "spentMicros" FROM "aiBudgets" WHERE month=$1', [month])).rows[0].spentMicros), baseline + 30 + 2448);
  await assert.rejects(() => reserveAI(user, 100, 100), (error: any) => error.code === "TOO_MANY_REQUESTS");
  console.log("PASS: concurrent cap enforcement, settlement, idempotency, unknown usage retention, persistent per-user rate limit");
} finally {
  await pool.query('DELETE FROM users WHERE id=$1', [user]);
  if (before) await pool.query('UPDATE "aiBudgets" SET "spentMicros"=$1 WHERE month=$2', [baseline, month]);
  else await pool.query('DELETE FROM "aiBudgets" WHERE month=$1', [month]);
  await pool.end(); await closeDb();
}
