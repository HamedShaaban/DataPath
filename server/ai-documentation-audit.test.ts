import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { invokeLLM } from "./_core/llm";
import { newState, makePlan, interviewBank } from "../shared/learning";
import type { TrpcContext } from "./_core/context";
vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn() }));
let userId = 8000;
const caller = () =>
  appRouter.createCaller({
    user: { id: ++userId },
    req: { headers: {} },
    res: {},
  } as TrpcContext);
const response = (value: unknown) =>
  ({ choices: [{ message: { content: JSON.stringify(value) } }] }) as Awaited<
    ReturnType<typeof invokeLLM>
  >;
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("BUILT_IN_FORGE_API_KEY", "audit-mock-key");
  vi.stubEnv("AI_MODEL", "pinned-test-model-v1");
  vi.mocked(invokeLLM).mockResolvedValue(
    response({ message: "Guidance", topicIds: [] })
  );
});
afterEach(() => vi.unstubAllEnvs());
describe("AI documentation contract audit (mock provider)", () => {
  it("sends bounded curated context with a pinned model and no tools", async () => {
    const state = newState();
    await caller().datapath.coach({
      state,
      mode: "coach",
      message: "Help me learn",
      consent: true,
    });
    const call = vi.mocked(invokeLLM).mock.calls[0][0];
    expect(call.model).toBe("pinned-test-model-v1");
    expect(call.userId).toBeGreaterThan(0);
    expect(call.tools).toBeUndefined();
    expect(call.max_tokens).toBe(1800);
    expect(call.messages).toHaveLength(2);
    const payload = JSON.parse(call.messages[1].content as string);
    expect(payload.topics).toEqual(
      makePlan(state)
        .topics.filter(t => !t.done)
        .slice(0, 40)
        .map(t => ({ id: t.id, title: t.title }))
    );
    expect(Object.keys(payload).sort()).toEqual(
      [
        "mode",
        "request",
        "role",
        "learningMode",
        "targetLevels",
        "experience",
        "goals",
        "roleDescription",
        "motivation",
        "interestedTools",
        "expertise",
        "assessment",
        "topics",
        "question",
      ].sort()
    );
    expect(payload.cv).toBeUndefined();
    expect(payload.sector).toBeUndefined();
    expect(payload.question).toBeNull();
  });
  it("sends the focused skill and depth instead of the retained career choice", async () => {
    const state = newState();
    Object.assign(state.profile, { learningMode: "skill", focusSkill: "sql", targetLevel: 3 });
    await caller().datapath.coach({ state, mode: "coach", message: "Help with recursive SQL", consent: true });
    const payload = JSON.parse(vi.mocked(invokeLLM).mock.calls[0][0].messages[1].content as string);
    expect(payload.learningMode).toBe("skill");
    expect(payload.focusSkill).toBe("sql");
    expect(payload.targetLevels).toEqual({ sql: 3 });
    expect(payload.role).toBeUndefined();
    expect(payload.topics.every((topic: { id: string }) => topic.id.startsWith("sql-"))).toBe(true);
  });
  it("sends the full CV object only in CV mode", async () => {
    const state = newState();
    await caller().datapath.coach({
      state,
      mode: "cv",
      message: "Improve wording",
      consent: true,
    });
    const payload = JSON.parse(
      vi.mocked(invokeLLM).mock.calls[0][0].messages[1].content as string
    );
    expect(payload.cv).toEqual(state.cv);
  });
  it("sends a curated interview question and rubric with the submitted answer", async () => {
    const state = newState();
    const question = interviewBank(state.profile)[0];
    await caller().datapath.coach({
      state,
      mode: "interview",
      questionId: question.id,
      message: "My answer",
      consent: true,
    });
    const payload = JSON.parse(
      vi.mocked(invokeLLM).mock.calls[0][0].messages[1].content as string
    );
    expect(payload.question).toEqual(question);
    expect(payload.request).toBe("My answer");
  });
  it.each([
    { message: "x".repeat(6001), topicIds: [] },
    { message: "ok", topicIds: Array(6).fill("sql-1") },
  ])("rejects output beyond server bounds", async result => {
    vi.mocked(invokeLLM).mockResolvedValue(response(result));
    await expect(
      caller().datapath.coach({
        state: newState(),
        mode: "coach",
        message: "Help me",
        consent: true,
      })
    ).rejects.toMatchObject({ code: "BAD_GATEWAY" });
  });
  it("does not semantically verify prose", async () => {
    const message =
      "An unverified factual assertion and https://example.invalid/";
    vi.mocked(invokeLLM).mockResolvedValue(response({ message, topicIds: [] }));
    expect(
      (
        await caller().datapath.coach({
          state: newState(),
          mode: "coach",
          message: "Help me",
          consent: true,
        })
      ).message
    ).toBe(message);
  });
  it("rejects a 2001-character request before contacting the provider", async () => {
    await expect(
      caller().datapath.coach({
        state: newState(),
        mode: "coach",
        message: "x".repeat(2001),
        consent: true,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(invokeLLM).not.toHaveBeenCalled();
  });
  it("limits one account to 20 accepted calls in the process window", async () => {
    const c = caller();
    const input = {
      state: newState(),
      mode: "coach" as const,
      message: "Help me",
      consent: true as const,
    };
    for (let i = 0; i < 20; i++) await c.datapath.coach(input);
    await expect(c.datapath.coach(input)).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
    });
    expect(invokeLLM).toHaveBeenCalledTimes(20);
  });
});
