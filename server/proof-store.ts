import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { learningStates, users, verifiedCredentials } from "../drizzle/schema";
import { careerById, sectorById, skillById } from "../shared/catalog";
import { learningStateSchema } from "../shared/learning";
import { sqlLabChallenges } from "../shared/sql-lab";
import { getDb } from "./db";
import { evidenceHash } from "./proof-grading";
import { TRPCError } from "@trpc/server";

export type CredentialType = "skill_cert" | "lab_pass" | "project";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
  return db;
}

export async function saveVerifiedCredential(
  userId: number,
  type: CredentialType,
  refId: string,
  serverScore: unknown
) {
  const db = await requireDb();
  const values = {
    id: randomUUID(),
    userId,
    type,
    refId,
    serverScore,
    evidenceHash: evidenceHash(serverScore),
    verifiedAt: new Date(),
  };
  const [credential] = await db
    .insert(verifiedCredentials)
    .values(values)
    .onConflictDoUpdate({
      target: [
        verifiedCredentials.userId,
        verifiedCredentials.type,
        verifiedCredentials.refId,
      ],
      set: {
        serverScore: values.serverScore,
        evidenceHash: values.evidenceHash,
        verifiedAt: values.verifiedAt,
      },
    })
    .returning({ id: verifiedCredentials.id });
  return credential;
}

export async function enableProofPage(userId: number, handle: string) {
  const db = await requireDb();
  try {
    const [profile] = await db
      .update(users)
      .set({ publicHandle: handle, proofPageEnabled: true })
      .where(eq(users.id, userId))
      .returning({
        handle: users.publicHandle,
        enabled: users.proofPageEnabled,
      });
    if (!profile) throw new TRPCError({ code: "NOT_FOUND" });
    return profile;
  } catch (error) {
    if (
      (error as { cause?: { code?: string } }).cause?.code === "23505" ||
      (error as { code?: string }).code === "23505"
    )
      throw new TRPCError({
        code: "CONFLICT",
        message: "That public handle is already in use.",
      });
    throw error;
  }
}

export async function disableProofPage(userId: number) {
  const db = await requireDb();
  await db
    .update(users)
    .set({ proofPageEnabled: false })
    .where(eq(users.id, userId));
  return { success: true } as const;
}

export async function setTargetVisibility(userId: number, visible: boolean) {
  const db = await requireDb();
  await db
    .update(users)
    .set({ showProofTargets: visible })
    .where(eq(users.id, userId));
  return { success: true } as const;
}

export async function setCredentialVisibility(
  userId: number,
  credentialId: string,
  visible: boolean
) {
  const db = await requireDb();
  const rows = await db
    .update(verifiedCredentials)
    .set({ visible })
    .where(
      and(
        eq(verifiedCredentials.id, credentialId),
        eq(verifiedCredentials.userId, userId)
      )
    )
    .returning({ id: verifiedCredentials.id });
  if (!rows.length) throw new TRPCError({ code: "NOT_FOUND" });
  return { success: true } as const;
}

function credentialTitle(type: string, refId: string, serverScore?: unknown) {
  if (type === "skill_cert") {
    const level = (serverScore as { targetLevel?: unknown } | null)?.targetLevel;
    const label = level === 1 ? "Beginner" : level === 2 ? "Intermediate" : level === 3 ? "Advanced" : "Level unspecified";
    return `${skillById[refId]?.title.en ?? refId} · ${label}`;
  }
  if (type === "lab_pass")
    return (
      sqlLabChallenges.find(challenge => challenge.id === refId)?.title ?? refId
    );
  return refId;
}

export async function getPublicProof(handle: string) {
  const db = await requireDb();
  const [owner] = await db
    .select({
      id: users.id,
      name: users.name,
      showTargets: users.showProofTargets,
      stateJson: learningStates.stateJson,
    })
    .from(users)
    .leftJoin(learningStates, eq(learningStates.userId, users.id))
    .where(
      and(eq(users.publicHandle, handle), eq(users.proofPageEnabled, true))
    )
    .limit(1);
  if (!owner) return null;
  const rows = await db
    .select({
      id: verifiedCredentials.id,
      type: verifiedCredentials.type,
      refId: verifiedCredentials.refId,
      verifiedAt: verifiedCredentials.verifiedAt,
      serverScore: verifiedCredentials.serverScore,
    })
    .from(verifiedCredentials)
    .where(
      and(
        eq(verifiedCredentials.userId, owner.id),
        eq(verifiedCredentials.visible, true)
      )
    );
  return shapePublicProof(owner, rows);
}

export async function getProofPreview(userId: number) {
  const db = await requireDb();
  const [owner] = await db
    .select({
      name: users.name,
      showTargets: users.showProofTargets,
      stateJson: learningStates.stateJson,
    })
    .from(users)
    .leftJoin(learningStates, eq(learningStates.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);
  if (!owner) throw new TRPCError({ code: "NOT_FOUND" });
  const rows = await db
    .select({
      id: verifiedCredentials.id,
      type: verifiedCredentials.type,
      refId: verifiedCredentials.refId,
      verifiedAt: verifiedCredentials.verifiedAt,
      serverScore: verifiedCredentials.serverScore,
    })
    .from(verifiedCredentials)
    .where(
      and(
        eq(verifiedCredentials.userId, userId),
        eq(verifiedCredentials.visible, true)
      )
    );
  return shapePublicProof(owner, rows);
}

export function shapePublicProof(
  owner: {
    name: string | null;
    showTargets: boolean;
    stateJson: string | null;
  },
  rows: Array<{
    id: string;
    type: string;
    refId: string;
    verifiedAt: Date;
    serverScore?: unknown;
  }>
) {
  let targetRole: string | null = null;
  let industry: string | null = null;
  let profileDisplayName = "";
  if (owner.stateJson) {
    try {
      const state = learningStateSchema.parse(JSON.parse(owner.stateJson));
      profileDisplayName = state.profile.displayName.trim();
      if (owner.showTargets) {
        targetRole = careerById[state.profile.role]?.title.en ?? null;
        industry = sectorById[state.profile.sector]?.title ?? null;
      }
    } catch {
      // A corrupt private state must not leak or break the public page.
    }
  }
  return {
    displayName: profileDisplayName || owner.name || "DataPath learner",
    targetRole,
    industry,
    credentials: rows.map(row => ({
      id: row.id,
      type: row.type,
      refId: row.refId,
      verifiedAt: row.verifiedAt,
      title: credentialTitle(row.type, row.refId, row.serverScore),
    })),
  };
}

export async function getProofSettings(userId: number) {
  const db = await requireDb();
  const [profile] = await db
    .select({
      handle: users.publicHandle,
      enabled: users.proofPageEnabled,
      showTargets: users.showProofTargets,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const credentials = await db
    .select({
      id: verifiedCredentials.id,
      type: verifiedCredentials.type,
      refId: verifiedCredentials.refId,
      verifiedAt: verifiedCredentials.verifiedAt,
      serverScore: verifiedCredentials.serverScore,
      visible: verifiedCredentials.visible,
    })
    .from(verifiedCredentials)
    .where(eq(verifiedCredentials.userId, userId));
  return { ...profile, credentials };
}
