import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { invokeLLM } from "./_core/llm";
import { newState } from "../shared/learning";
import type { TrpcContext } from "./_core/context";
vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn() }));
const ctx = { user: { id: 42 }, req: { headers: {} }, res: {} } as TrpcContext;
const response = (content: unknown) =>
  ({ choices: [{ message: { content: JSON.stringify(content) } }] }) as Awaited<
    ReturnType<typeof invokeLLM>
  >;
describe("Grounded AI coach", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("BUILT_IN_FORGE_API_KEY", "test-provider-key");
  });
  afterEach(() => vi.unstubAllEnvs());
  it("requires authentication and consent before contacting the provider", async () => {
    const c = appRouter.createCaller({ ...ctx, user: null });
    await expect(
      c.datapath.coach({
        state: newState(),
        mode: "coach",
        message: "Help me",
        consent: true,
      })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(
      appRouter
        .createCaller(ctx)
        .datapath.coach({
          state: newState(),
          mode: "coach",
          message: "Help me",
          consent: false as true,
        })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(invokeLLM).not.toHaveBeenCalled();
  });
  it("returns guidance with valid curated IDs without modifying the plan", async () => {
    vi.mocked(invokeLLM).mockResolvedValue(
      response({ message: "Start with SELECT.", topicIds: ["sql-1"] })
    );
    const state = newState();
    const original = JSON.stringify(state);
    const result = await appRouter
      .createCaller(ctx)
      .datapath.coach({
        state,
        mode: "coach",
        message: "Where do I start?",
        consent: true,
      });
    expect(result.topicIds).toEqual(["sql-1"]);
    expect(JSON.stringify(state)).toBe(original);
    expect(JSON.stringify(vi.mocked(invokeLLM).mock.calls[0])).toContain(
      "Never invent a curriculum"
    );
  });
  it("rejects hallucinated curriculum references", async () => {
    vi.mocked(invokeLLM).mockResolvedValue(
      response({
        message: "Use this invented course",
        topicIds: ["quantum-data-999"],
      })
    );
    await expect(
      appRouter
        .createCaller(ctx)
        .datapath.coach({
          state: newState(),
          mode: "coach",
          message: "Help me",
          consent: true,
        })
    ).rejects.toMatchObject({ code: "BAD_GATEWAY" });
  });
  it("validates interview question IDs before evaluation", async () => {
    await expect(
      appRouter
        .createCaller(ctx)
        .datapath.coach({
          state: newState(),
          mode: "interview",
          questionId: "invented",
          message: "My answer",
          consent: true,
        })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(invokeLLM).not.toHaveBeenCalled();
  });
  it("fails clearly without an AI key", async () => {
    vi.stubEnv("BUILT_IN_FORGE_API_KEY", "");
    await expect(
      appRouter
        .createCaller(ctx)
        .datapath.coach({
          state: newState(),
          mode: "coach",
          message: "Help me",
          consent: true,
        })
    ).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  });
});
