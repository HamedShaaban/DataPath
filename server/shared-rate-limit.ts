import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
let nextCleanup = 0;

export async function sharedRateLimit(scope: string, identity: string, limit: number, seconds: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Request protection is unavailable. Try again later." });
  const key = createHash("sha256").update(`${scope}:${identity}`).digest("hex");
  try {
    if (Date.now() >= nextCleanup) {
      await db.execute(sql`DELETE FROM "rateLimitBuckets" WHERE "key" IN (
        SELECT "key" FROM "rateLimitBuckets" WHERE "expiresAt" <= now() LIMIT 1000
      )`);
      nextCleanup = Date.now() + 60_000;
    }
    const result = await db.execute(sql`
      INSERT INTO "rateLimitBuckets" ("key", "count", "expiresAt")
      VALUES (${key}, 1, now() + ${seconds} * interval '1 second')
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "rateLimitBuckets"."expiresAt" <= now() THEN 1 ELSE "rateLimitBuckets"."count" + 1 END,
        "expiresAt" = CASE WHEN "rateLimitBuckets"."expiresAt" <= now() THEN EXCLUDED."expiresAt" ELSE "rateLimitBuckets"."expiresAt" END
      WHERE "rateLimitBuckets"."expiresAt" <= now() OR "rateLimitBuckets"."count" < ${limit}
      RETURNING "count"
    `);
    if (!result.rows.length) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many requests. Try again later." });
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Request protection is unavailable. Try again later." });
  }
}
