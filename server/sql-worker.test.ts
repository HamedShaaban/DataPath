import { afterEach, describe, expect, it, vi } from "vitest";
import { runSqlInWorker } from "../client/src/lib/run-sql";

class FakeWorker {
  static latest: FakeWorker;
  onmessage?: (event: { data: unknown }) => void;
  onerror?: () => void;
  terminate = vi.fn();
  postMessage = vi.fn();
  constructor() {
    FakeWorker.latest = this;
  }
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe("SQL worker lifecycle", () => {
  it("terminates an expensive query and reports a recoverable timeout", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("Worker", FakeWorker);
    const promise = runSqlInWorker(
      "sql-select-filter",
      "SELECT * FROM transactions"
    );
    await vi.advanceTimersByTimeAsync(8000);
    expect((await promise).error).toContain("8-second");
    expect(FakeWorker.latest.terminate).toHaveBeenCalledOnce();
  });
  it("returns successful results and cleans up the worker", async () => {
    vi.stubGlobal("Worker", FakeWorker);
    const promise = runSqlInWorker("sql-select-filter", "SELECT 1");
    const result = {
      passed: true,
      executed: true,
      columns: [],
      rows: [],
      checks: [],
      message: "Passed",
    };
    FakeWorker.latest.onmessage?.({ data: result });
    expect(await promise).toEqual(result);
    expect(FakeWorker.latest.terminate).toHaveBeenCalledOnce();
  });
  it("handles worker load errors", async () => {
    vi.stubGlobal("Worker", FakeWorker);
    const promise = runSqlInWorker("sql-select-filter", "SELECT 1");
    FakeWorker.latest.onerror?.();
    expect((await promise).error).toContain("could not load");
    expect(FakeWorker.latest.terminate).toHaveBeenCalledOnce();
  });
  it("handles unavailable worker support", async () => {
    vi.stubGlobal(
      "Worker",
      class {
        constructor() {
          throw new Error("unavailable");
        }
      }
    );
    expect(
      (await runSqlInWorker("sql-select-filter", "SELECT 1")).error
    ).toContain("could not start");
  });
});
