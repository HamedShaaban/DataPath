import { randomUUID } from "node:crypto";
import { and, count, eq, gt, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { aiBudgets, aiRequests } from "../drizzle/schema";
import { getDb } from "./db";
import { aiConfig } from "./ai-config";

export type Usage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};
export async function reserveAI(
  userId: number,
  inputBytes: number,
  outputTokens: number
) {
  const config = aiConfig();
  const db = await getDb();
  if (!db) throw new Error("AI accounting database unavailable");
  // UTF-8 byte length + framing/schema allowance is conservative for text prompts.
  const perAttempt = Math.ceil(
    (inputBytes + 1024) * config.AI_INPUT_USD_PER_MILLION +
      outputTokens * config.AI_OUTPUT_USD_PER_MILLION
  );
  const reservedMicros = perAttempt * 2; // initial request + at most one retry
  const month = new Date().toISOString().slice(0, 7);
  const id = randomUUID();
  await db.transaction(async tx => {
    // Global transaction lock also serializes a user's rate check across month boundaries.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(4815162342)`);
    const [recent] = await tx
      .select({ value: count() })
      .from(aiRequests)
      .where(
        and(
          eq(aiRequests.userId, userId),
          gt(aiRequests.createdAt, new Date(Date.now() - 3600000))
        )
      );
    if (recent.value >= config.AI_REQUESTS_PER_HOUR)
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "AI request limit reached. Please try again later.",
      });
    await tx.insert(aiBudgets).values({ month }).onConflictDoNothing();
    const [budget] = await tx
      .select()
      .from(aiBudgets)
      .where(eq(aiBudgets.month, month));
    if (
      budget.spentMicros + reservedMicros >
      Math.floor(config.AI_MONTHLY_CAP_USD * 1e6)
    )
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message:
          "The monthly AI budget has been reached. Practice and lessons remain available.",
      });
    await tx
      .update(aiBudgets)
      .set({ spentMicros: budget.spentMicros + reservedMicros })
      .where(eq(aiBudgets.month, month));
    await tx
      .insert(aiRequests)
      .values({ id, userId, month, model: config.AI_MODEL, reservedMicros });
  });
  return { id, userId, month, perAttempt, reservedMicros, config };
}
export async function settleAI(
  reservation: Awaited<ReturnType<typeof reserveAI>>,
  attempts: number,
  usage?: Usage
) {
  const { config, id, month, reservedMicros, perAttempt, userId } = reservation;
  const valid =
    usage &&
    [usage.prompt_tokens, usage.completion_tokens, usage.total_tokens].every(
      n => Number.isSafeInteger(n) && n >= 0
    );
  // Unknown usage is retained conservatively, including failed/timed-out attempts.
  const chargedMicros = valid
    ? Math.ceil(
        usage.prompt_tokens * config.AI_INPUT_USD_PER_MILLION +
          usage.completion_tokens * config.AI_OUTPUT_USD_PER_MILLION
      ) +
      (attempts - 1) * perAttempt
    : reservedMicros;
  const status = valid ? "settled" : "unknown";
  const db = await getDb();
  if (!db) throw new Error("AI accounting database unavailable");
  const changed = await db.transaction(async tx => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(4815162342)`);
    const [request] = await tx
      .select()
      .from(aiRequests)
      .where(eq(aiRequests.id, id));
    if (request.status !== "reserved") return false;
    await tx
      .update(aiBudgets)
      .set({
        spentMicros: sql`${aiBudgets.spentMicros} + ${chargedMicros - reservedMicros}`,
      })
      .where(eq(aiBudgets.month, month));
    await tx
      .update(aiRequests)
      .set({
        chargedMicros,
        status,
        promptTokens: valid ? usage.prompt_tokens : null,
        completionTokens: valid ? usage.completion_tokens : null,
      })
      .where(eq(aiRequests.id, id));
    return true;
  });
  if (changed)
    console.info(
      JSON.stringify({
        event: "ai_usage",
        requestId: id,
        userId,
        month,
        model: config.AI_MODEL,
        attempts,
        status,
        chargedMicros,
        promptTokens: valid ? usage.prompt_tokens : null,
        completionTokens: valid ? usage.completion_tokens : null,
      })
    );
}
