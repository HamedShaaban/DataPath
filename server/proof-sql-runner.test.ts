import { EventEmitter } from "node:events";
import { afterEach, expect, it, vi } from "vitest";
vi.mock("node:worker_threads", () => ({ Worker: vi.fn() }));
import { Worker } from "node:worker_threads";
import { executeServerSql } from "./proof-sql-runner";
const input = { challengeId: "sql-select-filter", query: "SELECT 1", sector: "banking" as const };
afterEach(() => vi.useRealTimers());
it("terminates stalled workers and releases capacity after a timeout", async () => {
  vi.useFakeTimers();
  const worker = Object.assign(new EventEmitter(), { terminate: vi.fn(async () => 0) });
  vi.mocked(Worker).mockImplementation(function () { return worker; } as any);
  const pending = executeServerSql(input);
  const rejection = expect(pending).rejects.toMatchObject({ code: "TIMEOUT" });
  await vi.advanceTimersByTimeAsync(15_000);
  await rejection;
  expect(worker.terminate).toHaveBeenCalledOnce();
  const retry = executeServerSql(input);
  worker.emit("message", { passed: false, executed: true, checks: [] });
  await expect(retry).resolves.toMatchObject({ executed: true });
});
it("cleans up a failed worker without returning internal errors", async () => {
  const worker = Object.assign(new EventEmitter(), { terminate: vi.fn(async () => 0) });
  vi.mocked(Worker).mockImplementation(function () { return worker; } as any);
  const pending = executeServerSql(input);
  worker.emit("error", new Error("private internal detail"));
  await expect(pending).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE", message: "SQL verification could not finish. Try again." });
  expect(worker.terminate).toHaveBeenCalledOnce();
});
