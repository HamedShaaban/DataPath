import { afterEach, describe, expect, it, vi } from "vitest";
import { runSqlInWorker } from "../client/src/lib/run-sql";
import { runPythonPractice } from "../client/src/lib/run-python";
import { sqlLabChallenges } from "../shared/sql-lab";
import { newState } from "../shared/learning";
import { recordLabAttempt } from "../shared/sql-progress";
import { practiceChallenges, recordPractice } from "../shared/practice";

class FakeWorker {
  static latest: FakeWorker;
  onmessage?: (event: { data: unknown }) => void;
  onerror?: () => void;
  terminate = vi.fn();
  postMessage = vi.fn();
  constructor() { FakeWorker.latest = this; }
}
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe("practice runtime failures", () => {
  it("does not record a worker load failure as a SQL attempt", async () => {
    vi.stubGlobal("Worker", FakeWorker);
    const pending = runSqlInWorker(sqlLabChallenges[0].id, "SELECT 1");
    FakeWorker.latest.onerror?.();
    const result = await pending;
    expect(result.unavailable).toBe(true);
    const state = newState();
    expect(recordLabAttempt(state, sqlLabChallenges[0].id, "SELECT 1", result)).toBe(state);
    expect(FakeWorker.latest.terminate).toHaveBeenCalled();
  });
  it("does not record Python initialization errors or mark skills weak", async () => {
    vi.stubGlobal("Worker", FakeWorker);
    const challenge = practiceChallenges(newState().profile).find(item => item.kind === "python")!;
    const pending = runPythonPractice(challenge.id, "def solve(rows): return 0", "banking");
    FakeWorker.latest.onmessage?.({ data: { error: "failed to fetch runtime" } });
    const result = await pending;
    expect(result.unavailable).toBe(true);
    const state = newState();
    expect(recordPractice(state, challenge, "my answer", result)).toBe(state);
  });
  it("keeps Python syntax errors after runtime readiness as learning attempts", async () => {
    vi.stubGlobal("Worker", FakeWorker);
    const challenge = practiceChallenges(newState().profile).find(item => item.kind === "python")!;
    const pending = runPythonPractice(challenge.id, "broken", "banking");
    FakeWorker.latest.onmessage?.({ data: { stage: "ready" } });
    FakeWorker.latest.onmessage?.({ data: { error: "SyntaxError: invalid syntax" } });
    const result = await pending;
    expect(result.unavailable).toBe(false);
    expect(recordPractice(newState(), challenge, "broken", result).practiceAttempts).toHaveLength(1);
  });
  it("excludes Python startup timeouts from grading", async () => {
    vi.useFakeTimers(); vi.stubGlobal("Worker", FakeWorker);
    const challenge = practiceChallenges(newState().profile).find(item => item.kind === "python")!;
    const pending = runPythonPractice(challenge.id, "answer", "banking");
    await vi.advanceTimersByTimeAsync(45000);
    expect((await pending).unavailable).toBe(true);
  });
});
