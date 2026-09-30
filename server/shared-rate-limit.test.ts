import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { readFile } from "node:fs/promises";
vi.mock("./db", () => ({ getDb: vi.fn() }));
import { getDb } from "./db";
import { sharedRateLimit } from "./shared-rate-limit";
const pg = new PGlite();
beforeAll(async () => {
  await pg.exec(await readFile("drizzle/postgres/0006_aspiring_liz_osborn.sql", "utf8"));
  vi.mocked(getDb).mockResolvedValue(drizzle(pg) as any);
});
afterAll(() => pg.close());
it("atomically admits only the allowed number of parallel submissions", async () => {
  const results = await Promise.allSettled(Array.from({ length: 12 }, () => sharedRateLimit("auth", "learner", 3, 60)));
  expect(results.filter(r => r.status === "fulfilled")).toHaveLength(3);
  expect(results.filter(r => r.status === "rejected")).toHaveLength(9);
  const rows = await pg.query<{ key: string; count: number }>('SELECT * FROM "rateLimitBuckets"');
  expect(rows.rows[0].key).toMatch(/^[a-f0-9]{64}$/);
  expect(rows.rows[0].count).toBe(3);
});
it("isolates subjects and scopes, and resets expired counters", async () => {
  await sharedRateLimit("grading", "learner", 1, 60);
  await sharedRateLimit("grading", "other", 1, 60);
  await expect(sharedRateLimit("grading", "learner", 1, 60)).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  await pg.exec(`UPDATE "rateLimitBuckets" SET "expiresAt" = now() - interval '1 second'`);
  await expect(sharedRateLimit("grading", "learner", 1, 60)).resolves.toBeUndefined();
});
it("fails closed when storage is unavailable without exposing DB errors", async () => {
  vi.mocked(getDb).mockResolvedValueOnce(null);
  await expect(sharedRateLimit("auth", "someone", 1, 60)).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
});
