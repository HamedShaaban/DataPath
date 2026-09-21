import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { parse } from "cookie";
import type { Request } from "express";
import { sessions, users } from "../drizzle/schema";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { getDb } from "./db";

const validToken = (token: unknown): token is string =>
  typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);
export const hashSessionToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export function requestSessionToken(req: Pick<Request, "headers">) {
  return parse(req.headers.cookie ?? "")[COOKIE_NAME];
}
async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Account database unavailable");
  return db;
}
export async function createSession(userId: number, lifetime = ONE_YEAR_MS) {
  if (!Number.isFinite(lifetime) || lifetime <= 0 || lifetime > ONE_YEAR_MS)
    throw new Error("Invalid session lifetime");
  const db = await requireDb();
  const token = randomBytes(32).toString("base64url");
  await db
    .insert(sessions)
    .values({
      id: hashSessionToken(token),
      userId,
      expiresAt: new Date(Date.now() + lifetime),
    });
  return token;
}
export async function lookupSession(token: string | undefined) {
  if (!validToken(token)) return null;
  const db = await requireDb();
  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.id, hashSessionToken(token)),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);
  return row?.user ?? null;
}
export async function revokeSession(token: string | undefined) {
  if (!validToken(token)) return;
  const db = await requireDb();
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(sessions.id, hashSessionToken(token)), isNull(sessions.revokedAt))
    );
}
export async function revokeAllSessions(userId: number) {
  const db = await requireDb();
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}
