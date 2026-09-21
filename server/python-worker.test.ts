import { afterEach, describe, it, expect, vi } from "vitest";
import { runPythonPractice } from "../client/src/lib/run-python";
class WorkerStub {
  static latest: WorkerStub;
  onmessage?: (event: { data: any }) => void;
  onerror?: () => void;
  terminate = vi.fn();
  postMessage = vi.fn();
  constructor() {
    WorkerStub.latest = this;
  }
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe("Python worker lifecycle", () => {
  it("checks returned output against all fixtures and terminates the interpreter", async () => {
    vi.stubGlobal("Worker", WorkerStub);
    const promise = runPythonPractice(
      "python-total",
      "def solve(rows): return 0",
      "general"
    );
    WorkerStub.latest.onmessage?.({ data: { stage: "ready" } });
    WorkerStub.latest.onmessage?.({ data: { output: "[380,431,0,0]" } });
    expect((await promise).passed).toBe(true);
    expect(WorkerStub.latest.terminate).toHaveBeenCalledOnce();
  });
  it("rejects a constant answer even when the visible output is correct", async () => {
    vi.stubGlobal("Worker", WorkerStub);
    const promise = runPythonPractice(
      "python-total",
      "def solve(rows): return 380",
      "general"
    );
    WorkerStub.latest.onmessage?.({ data: { output: "[380,380,380,380]" } });
    expect((await promise).passed).toBe(false);
  });
  it("allows startup time but interrupts an infinite learner program", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("Worker", WorkerStub);
    const promise = runPythonPractice(
      "python-total",
      "while True: pass",
      "general"
    );
    WorkerStub.latest.onmessage?.({ data: { stage: "ready" } });
    await vi.advanceTimersByTimeAsync(8000);
    expect((await promise).message).toContain("8-second");
    expect(WorkerStub.latest.terminate).toHaveBeenCalledOnce();
  });
  it("reports unavailable runtime files without leaving a worker running", async () => {
    vi.stubGlobal("Worker", WorkerStub);
    const promise = runPythonPractice("python-total", "", "general");
    WorkerStub.latest.onerror?.();
    expect((await promise).message).toContain("could not load");
    expect(WorkerStub.latest.terminate).toHaveBeenCalledOnce();
  });
});
