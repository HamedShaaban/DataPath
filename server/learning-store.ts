import { and, eq } from "drizzle-orm";
import { learningStates } from "../drizzle/schema";
import { getDb } from "./db";
import { learningStateSchema, type LearningState } from "../shared/learning";
import { TRPCError } from "@trpc/server";
export async function loadLearning(userId: number) {
  const db = await getDb();
  if (!db)
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: "Database is not configured",
    });
  const [row] = await db
    .select()
    .from(learningStates)
    .where(eq(learningStates.userId, userId))
    .limit(1);
  return row
    ? {
        state: learningStateSchema.parse(JSON.parse(row.stateJson)),
        revision: row.revision,
      }
    : null;
}
export async function saveLearning(
  userId: number,
  state: LearningState,
  revision: number
) {
  const db = await getDb();
  if (!db)
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: "Database is not configured",
    });
  const stateJson = JSON.stringify(state);
  if (Buffer.byteLength(stateJson) > 60000)
    throw new TRPCError({
      code: "PAYLOAD_TOO_LARGE",
      message: "Workspace exceeds 60 KB; export and shorten older notes.",
    });
  if (revision === 0) {
    try {
      await db
        .insert(learningStates)
        .values({ userId, stateJson, revision: 1 });
    } catch (error) {
      if (
        (error as { cause?: { code?: string } }).cause?.code ===
          "ER_DUP_ENTRY" ||
        (error as { code?: string }).code === "ER_DUP_ENTRY"
      )
        throw new TRPCError({
          code: "CONFLICT",
          message: "Workspace changed in another tab. Reload before saving.",
        });
      throw error;
    }
  } else {
    const [result] = await db
      .update(learningStates)
      .set({ stateJson, revision: revision + 1 })
      .where(
        and(
          eq(learningStates.userId, userId),
          eq(learningStates.revision, revision)
        )
      );
    if (!result.affectedRows)
      throw new TRPCError({
        code: "CONFLICT",
        message: "Workspace changed in another tab. Reload before saving.",
      });
  }
  return { revision: revision + 1 };
}
export async function deleteLearning(userId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
  await db.delete(learningStates).where(eq(learningStates.userId, userId));
  return { success: true };
}
