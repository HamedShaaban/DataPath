import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { loadLearning, saveLearning, deleteLearning } from "./learning-store";
import { newState } from "../shared/learning";
import type { TrpcContext } from "./_core/context";
vi.mock("./learning-store", () => ({
  loadLearning: vi.fn(),
  saveLearning: vi.fn(),
  deleteLearning: vi.fn(),
}));
const context = (userId?: number) =>
  ({
    user: userId ? { id: userId } : null,
    req: { headers: {}, protocol: "https" },
    res: {},
  }) as TrpcContext;
describe("DataPath ownership and input boundaries", () => {
  beforeEach(() => vi.clearAllMocks());
  it("rejects anonymous reads, writes and deletion", async () => {
    const c = appRouter.createCaller(context());
    await expect(c.datapath.load()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(
      c.datapath.save({ state: newState(), revision: 0 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(c.datapath.remove()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(saveLearning).not.toHaveBeenCalled();
  });
  it("binds storage to the authenticated identity and carries the revision", async () => {
    const c = appRouter.createCaller(context(42));
    vi.mocked(saveLearning).mockResolvedValue({ revision: 8 });
    await c.datapath.load();
    const state = newState();
    await expect(c.datapath.save({ state, revision: 7 })).resolves.toEqual({
      revision: 8,
    });
    await c.datapath.remove();
    expect(loadLearning).toHaveBeenCalledWith(42);
    expect(saveLearning).toHaveBeenCalledWith(42, state, 7);
    expect(deleteLearning).toHaveBeenCalledWith(42);
  });
  it("rejects unknown roles/topics and unbounded profile text", async () => {
    const c = appRouter.createCaller(context(7));
    const state = newState();
    state.completed = ["invented"];
    await expect(c.datapath.save({ state, revision: 0 })).rejects.toMatchObject(
      { code: "BAD_REQUEST" }
    );
    state.completed = [];
    state.profile.role = "made-up";
    await expect(c.datapath.save({ state, revision: 0 })).rejects.toMatchObject(
      { code: "BAD_REQUEST" }
    );
    expect(saveLearning).not.toHaveBeenCalled();
  });
  it("requires a strong password for local sign-in", async () => {
    await expect(
      appRouter
        .createCaller(context())
        .auth.login({ email: "learner@example.com", password: "short" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
