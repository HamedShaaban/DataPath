import {
  pythonErrorFeedback,
  pythonOutputFeedback,
} from "@shared/python-feedback";
import {
  pythonFixtures,
  expectedPython,
  pythonHarnessFor,
} from "@shared/python-practice";
import type { Sector } from "@shared/industry-practice";
import type { PracticeResult } from "@shared/practice";
export function runPythonPractice(
  id: string,
  source: string,
  sector: Sector
): Promise<PracticeResult> {
  return new Promise(resolve => {
    let worker: Worker;
    let ready = false;
    let timer: ReturnType<typeof setTimeout>;
    const finish = (result: PracticeResult) => {
      clearTimeout(timer);
      worker?.terminate();
      resolve(result);
    };
    const fail = (message: string, unavailable = false) =>
      finish({ passed: false, message, checks: [], unavailable });
    try {
      worker = new Worker("/python-worker.js", { type: "module" });
      timer = setTimeout(
        () =>
          fail(
            "Python did not finish loading within 45 seconds. Check the connection and retry.", true
          ),
        45000
      );
      const fixtures = pythonFixtures(sector, id);
      worker.onmessage = ({ data }) => {
        if (data.stage === "ready") {
          ready = true;
          clearTimeout(timer);
          timer = setTimeout(
            () =>
              fail(
                "Python exceeded the 8-second execution limit. Check loops and simplify the function."
              ),
            8000
          );
          return;
        }
        if (data.error) {
          fail(
            ready ? `${pythonErrorFeedback(String(data.error))}\n${String(data.error).slice(-250)}` : "The Python runtime could not start. Check the connection and retry.", !ready
          );
          return;
        }
        try {
          const outputs = JSON.parse(data.output);
          const checks = fixtures.map((rows, index) => {
            const expected = expectedPython(id, rows);
            const actual = outputs[index];
            return {
              label: [
                "Practice dataset",
                "Changed values and input order",
                "Empty input",
                id === "python-stream-summary" ? "Zero, negatives, missing values and pending records" : "Zero, missing values and pending records",
                "Category groups, ties and negative adjustments",
              ][index] || `Dataset ${index + 1}`,
              passed:
                typeof expected === "number"
                  ? typeof actual === "number" &&
                    Math.abs(actual - expected) < 1e-8
                  : JSON.stringify(actual) === JSON.stringify(expected),
            };
          });
          const passed = checks.every(check => check.passed);
          finish({
            passed,
            checks,
            output: JSON.stringify(outputs[0]),
            message: passed
              ? `Your Python function passed all ${fixtures.length} datasets.`
              : pythonOutputFeedback(
                  outputs,
                  fixtures.map(rows => expectedPython(id, rows)),
                  checks.map(check => check.passed),
                  id
                ),
          });
        } catch {
          fail("Return a JSON-compatible number or list from solve(rows).");
        }
      };
      worker.onerror = () =>
        fail("The Python runtime could not load. Check the connection and retry.", true);
      worker.postMessage({
        source,
        fixtures: JSON.stringify(fixtures),
        harness: pythonHarnessFor(id),
      });
    } catch {
      fail("This browser could not start Python practice.", true);
    }
  });
}
