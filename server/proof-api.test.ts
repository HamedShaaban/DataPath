import { beforeEach, describe, expect, it, vi } from "vitest";
import { newState } from "../shared/learning";
import type { TrpcContext } from "./_core/context";
import { shapePublicProof } from "./proof-store";

vi.mock("./proof-store", async importOriginal => {
  const original = await importOriginal<typeof import("./proof-store")>();
  return {
    ...original,
    enableProofPage: vi.fn(async (_userId: number, handle: string) => ({
      handle,
      enabled: true,
    })),
    disableProofPage: vi.fn(async () => ({ success: true })),
    getProofSettings: vi.fn(async () => ({
      handle: null,
      enabled: false,
      showTargets: false,
      credentials: [],
    })),
    getPublicProof: vi.fn(async () => null),
    saveVerifiedCredential: vi.fn(async () => ({ id: "credential" })),
    setCredentialVisibility: vi.fn(async () => ({ success: true })),
    setTargetVisibility: vi.fn(async () => ({ success: true })),
  };
});

import { appRouter } from "./routers";
import { enableProofPage, saveVerifiedCredential } from "./proof-store";

const context = (userId?: number, ip = "198.51.100.1") =>
  ({
    user: userId ? { id: userId } : null,
    req: { headers: {}, protocol: "https", ip },
    res: {},
  }) as TrpcContext;

describe("proof API boundaries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requires ownership for mutations and validates normalized handles", async () => {
    await expect(
      appRouter.createCaller(context()).proof.enable({ handle: "learner-one" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(
      appRouter.createCaller(context(7)).proof.enable({ handle: "Bad Handle" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await appRouter
      .createCaller(context(7))
      .proof.enable({ handle: "learner-one" });
    expect(enableProofPage).toHaveBeenCalledWith(7, "learner-one");
    await expect(
      appRouter.createCaller(context()).proof.preview()
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("never writes a skill credential for a failed server grade", async () => {
    const questions = (await import("../shared/learning")).skillQuiz("sql", 1);
    const answers = Object.fromEntries(
      questions.map(question => [
        question.id,
        (question.answer + 1) % question.options.length,
      ])
    );
    const result = await appRouter.createCaller(context(7)).grading.quiz({
      kind: "skill",
      targetId: "sql",
      targetLevel: 1,
      answers,
      clientPassed: true,
    });
    expect(result.passed).toBe(false);
    expect(saveVerifiedCredential).not.toHaveBeenCalled();
  });

  it("whitelists public fields even when private data is present", () => {
    const state = newState();
    state.cv.summary = "private CV";
    const output = shapePublicProof(
      {
        name: "Mina",
        showTargets: false,
        stateJson: JSON.stringify(state),
        email: "private@example.com",
      } as any,
      [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          type: "skill_cert",
          refId: "sql",
          verifiedAt: new Date("2026-09-01T00:00:00Z"),
          evidenceHash: "secret",
          serverScore: { answers: "private" },
        } as any,
      ]
    );
    expect(output).toEqual({
      displayName: "Mina",
      targetRole: null,
      industry: null,
      credentials: [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          type: "skill_cert",
          refId: "sql",
          verifiedAt: new Date("2026-09-01T00:00:00Z"),
          title: "SQL · Level unspecified",
        },
      ],
    });
    expect(JSON.stringify(output)).not.toContain("private");
  });

  it("rate limits the public endpoint independently", async () => {
    const caller = appRouter.createCaller(context(undefined, "203.0.113.77"));
    for (let index = 0; index < 60; index++)
      await caller.proof.getPublic({ handle: "learner-one" });
    await expect(
      caller.proof.getPublic({ handle: "learner-one" })
    ).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });
});


describe("proof verification regressions", () => {
  beforeEach(() => vi.clearAllMocks());
  it("keeps storage failures distinct from invalid quiz answers", async () => {
    const { TRPCError } = await import("@trpc/server");
    const questions = (await import("../shared/learning")).skillQuiz("sql", 1);
    vi.mocked(saveVerifiedCredential).mockRejectedValueOnce(new TRPCError({ code: "SERVICE_UNAVAILABLE" }));
    await expect(appRouter.createCaller(context(17)).grading.quiz({ kind: "skill", targetId: "sql", targetLevel: 1,
      answers: Object.fromEntries(questions.map(q => [q.id, q.answer]))
    })).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  });
  it("records the assessed level with a passing credential", async () => {
    const questions = (await import("../shared/learning")).skillQuiz("sql", 1);
    await appRouter.createCaller(context(18)).grading.quiz({ kind: "skill", targetId: "sql", targetLevel: 1,
      answers: Object.fromEntries(questions.map(q => [q.id, q.answer])) });
    expect(saveVerifiedCredential).toHaveBeenCalledWith(18, "skill_cert", "sql", expect.objectContaining({ targetLevel: 1, passed: true }));
  });
  it("rejects unauthenticated SQL execution", async () => {
    await expect(appRouter.createCaller(context()).grading.sql({ challengeId: "sql-select-filter", query: "SELECT 1", sector: "banking" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
  it("limits verification attempts per account", async () => {
    const caller = appRouter.createCaller(context(99));
    for (let index = 0; index < 20; index++)
      await expect(caller.grading.quiz({ kind: "topic", targetId: "missing", answers: {} })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.grading.quiz({ kind: "topic", targetId: "missing", answers: {} })).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });
});
