import { beforeEach, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { sharedRateLimit } from "./shared-rate-limit";
import { getLocalAccount } from "./db";
import type { TrpcContext } from "./_core/context";
vi.mock("./shared-rate-limit", () => ({ sharedRateLimit: vi.fn() }));
vi.mock("./db", () => ({ getLocalAccount: vi.fn(), createLocalAccount: vi.fn() }));
beforeEach(() => vi.clearAllMocks());
function caller(ip: string) {
  return appRouter.createCaller({ user: null, req: { ip, headers: {} }, res: {} } as TrpcContext);
}
it("uses the same normalized account budget across different IPs", async () => {
  vi.mocked(getLocalAccount).mockResolvedValue(undefined);
  for (const ip of ["192.0.2.1", "192.0.2.2"]) {
    await expect(caller(ip).auth.login({ email: "Learner@example.test", password: "incorrect-password" }))
      .rejects.toMatchObject({ code: "UNAUTHORIZED", message: "Invalid email or password." });
  }
  expect(sharedRateLimit).toHaveBeenNthCalledWith(1, "auth-account", "learner@example.test", 20, 3600);
  expect(sharedRateLimit).toHaveBeenNthCalledWith(2, "auth-account", "learner@example.test", 20, 3600);
});
it("fails closed before password lookup if account protection is unavailable", async () => {
  vi.mocked(sharedRateLimit).mockRejectedValueOnce(new Error("unavailable"));
  await expect(caller("192.0.2.3").auth.login({ email: "learner@example.test", password: "incorrect-password" })).rejects.toThrow();
  expect(getLocalAccount).not.toHaveBeenCalled();
});
