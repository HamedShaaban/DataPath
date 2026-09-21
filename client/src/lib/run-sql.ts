import type { Sector } from "@shared/industry-practice";
import type { SqlExecutionResult } from "@shared/sql-engine";

// A fresh worker keeps expensive queries off the UI thread and can be terminated.
export function runSqlInWorker(
  challengeId: string,
  query: string,
  sector: Sector = "banking"
): Promise<SqlExecutionResult> {
  return new Promise(resolve => {
    let worker: Worker;
    let timer: ReturnType<typeof setTimeout>;
    const finish = (result: SqlExecutionResult) => {
      clearTimeout(timer);
      worker?.terminate();
      resolve(result);
    };
    const failure = (message: string) =>
      finish({
        passed: false,
        executed: false,
        columns: [],
        rows: [],
        checks: [],
        message,
        error: message,
      });
    try {
      worker = new Worker(new URL("./sql-worker.ts", import.meta.url), {
        type: "module",
      });
      timer = setTimeout(
        () =>
          failure(
            "The query exceeded the 8-second limit. Check joins and simplify the query before trying again."
          ),
        8000
      );
      worker.onmessage = event => finish(event.data);
      worker.onerror = () =>
        failure(
          "The SQL engine could not load. Reload the page and try again."
        );
      worker.postMessage({ challengeId, query, sector });
    } catch {
      failure(
        "This browser could not start the SQL lab. Try reloading the page."
      );
    }
  });
}
