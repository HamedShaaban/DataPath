import { parentPort, workerData } from "node:worker_threads";
import { executeSqlChallenge } from "../shared/sql-engine";

const result = await executeSqlChallenge(workerData.challengeId, workerData.query, workerData.sector);
// Do not transfer learner result rows, SQL errors or arbitrary query output.
parentPort!.postMessage({ passed: result.passed, executed: result.executed, checks: result.checks });
