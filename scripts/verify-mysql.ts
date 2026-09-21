/** Integration check. Run ONLY against an explicitly supplied disposable database. */
import assert from "node:assert/strict";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { newState } from "../shared/learning";
const url = process.env.DATAPATH_TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith("/datapath_integration_test"))
  throw new Error(
    "Set DATAPATH_TEST_DATABASE_URL to a disposable database named datapath_integration_test"
  );
process.env.DATABASE_URL = url;
const conn = await mysql.createConnection(url);
await migrate(drizzle(conn), { migrationsFolder: "./drizzle" });
const { loadLearning, saveLearning, deleteLearning } = await import(
  "../server/learning-store"
);
try {
  await deleteLearning(900001);
  await deleteLearning(900002);
  const state = newState();
  state.onboarded = true;
  state.profile.language = "ar";
  state.cv.summary = "ملخص مهني تجريبي";
  assert.deepEqual(await saveLearning(900001, state, 0), { revision: 1 });
  const loaded = await loadLearning(900001);
  assert.equal(loaded?.state.cv.summary, "ملخص مهني تجريبي");
  assert.equal(await loadLearning(900002), null);
  await assert.rejects(
    () => saveLearning(900001, state, 0),
    (e: any) => e.code === "CONFLICT"
  );
  state.completed = ["sql-1"];
  state.evidence["sql-1"] = "Validated a SELECT query";
  assert.deepEqual(await saveLearning(900001, state, 1), { revision: 2 });
  await assert.rejects(
    () => saveLearning(900001, state, 1),
    (e: any) => e.code === "CONFLICT"
  );
  await saveLearning(900002, newState(), 0);
  await deleteLearning(900001);
  assert.equal(await loadLearning(900001), null);
  assert.ok(await loadLearning(900002));
  console.log(
    "PASS: all migrations, Arabic roundtrip, user isolation, revision conflicts, deletion isolation"
  );
} finally {
  await deleteLearning(900001);
  await deleteLearning(900002);
  await conn.end();
}
process.exit(0);
