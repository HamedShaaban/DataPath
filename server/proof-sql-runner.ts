import { Worker } from "node:worker_threads";
import { TRPCError } from "@trpc/server";
import { sqlLabChallenges } from "../shared/sql-lab";
import type { Sector } from "../shared/industry-practice";
import type { SqlExecutionResult } from "../shared/sql-engine";

let active = false;
// No unbounded queue: at most one disposable WASM engine per server process.
export async function executeServerSql(input: {
  challengeId: string;
  query: string;
  sector: Sector;
}): Promise<Pick<SqlExecutionResult, "passed" | "executed" | "checks">> {
  if (!sqlLabChallenges.some(challenge => challenge.id === input.challengeId))
    throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown SQL lab challenge" });
  if (active)
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "SQL verification is busy. Try again shortly." });
  active = true;
  let worker: Worker | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const source = new URL("./proof-sql-worker.ts", import.meta.url);
    worker = import.meta.url.endsWith(".ts")
      ? new Worker(`import('tsx/esm/api').then(({ tsImport }) => tsImport(${JSON.stringify(source.href)}, ${JSON.stringify(import.meta.url)}))`, {
          eval: true, workerData: input, execArgv: [],
          resourceLimits: { maxOldGenerationSizeMb: 128 },
        })
      : new Worker(new URL("./proof-sql-worker.js", import.meta.url), {
          workerData: input, execArgv: [],
          resourceLimits: { maxOldGenerationSizeMb: 128 },
        });
    return await new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new TRPCError({ code: "TIMEOUT", message: "SQL verification took too long. Simplify the query and try again." })), 15_000);
      worker!.once("message", resolve);
      worker!.once("error", () => reject(new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "SQL verification could not finish. Try again." })));
      worker!.once("exit", () => reject(new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "SQL verification stopped before returning a result." })));
    });
  } finally {
    clearTimeout(timer);
    await worker?.terminate();
    active = false;
  }
}
