// Run the actual production worker with Node's worker_threads. This verifies
// packaging and the message protocol, not browser UI/CSP enforcement.
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { Worker } from "node:worker_threads";
import assert from "node:assert/strict";
import { sqlContext } from "../shared/sql-context";
import { businessSectors } from "../shared/catalog";
import type { SqlExecutionResult } from "../shared/sql-engine";

const root = resolve("dist/public");
const bundle = (await readdir(resolve(root, "assets"))).find(name =>
  /^sql-worker-.*\.js$/.test(name)
);
assert(bundle, "Build the worker before running this check");
const worker = new Worker(
  `
  const { parentPort, workerData } = require('node:worker_threads');
  const { readFile } = require('node:fs/promises');
  const { pathToFileURL } = require('node:url');
  const { resolve } = require('node:path');
  globalThis.self = globalThis;
  globalThis.location = new URL('https://datapath.test/assets/' + workerData.bundle);
  globalThis.importScripts = () => { throw new Error('Unexpected script download'); };
  globalThis.fetch = async url => {
    if (!/^\\/sql-runtime\\/(pglite\\.wasm|initdb\\.wasm|pglite\\.data)$/.test(url)) throw new Error('Unexpected fetch: ' + url);
    return new Response(await readFile(resolve(workerData.root, url.slice(1))));
  };
  globalThis.postMessage = result => parentPort.postMessage(result);
  // Exercise the browser branch of PGlite in a real isolated JS realm.
  globalThis.process = undefined;
  import(pathToFileURL(resolve(workerData.root, 'assets', workerData.bundle)).href).then(() => {
    parentPort.on('message', data => self.onmessage({data}));
    parentPort.postMessage('ready');
  }).catch(error => { throw error; });
`,
  { eval: true, workerData: { root, bundle } }
);
await new Promise<void>((res, reject) => {
  worker.once("message", () => res());
  worker.once("error", reject);
});
const send = (data: unknown) =>
  new Promise<SqlExecutionResult>((res, reject) => {
    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error("Worker exceeded unchanged eight-second budget"));
    }, 8000);
    worker.once("message", result => {
      clearTimeout(timeout);
      res(result);
    });
    worker.postMessage(data);
  });
try {
  const start = performance.now();
  for (const sector of businessSectors) {
    for (const challenge of sqlContext(sector.id).challenges) {
      const result = await send({
        challengeId: challenge.id,
        query: challenge.referenceSql,
        sector: sector.id,
      });
      assert.equal(
        result.passed,
        true,
        `${sector.id}/${challenge.id}: ${result.error || result.message}`
      );
      assert.deepEqual(
        Object.keys(result).sort(),
        [
          "passed",
          "executed",
          "resultFeedback",
          "columns",
          "rows",
          "checks",
          "message",
        ].sort()
      );
    }
  }
  const invalid = await send({ challengeId: "missing", query: "SELECT 1" });
  assert.equal(invalid.executed, false);
  assert.equal(invalid.message, "The lab could not start. Please try again.");
  console.log(
    `Built worker: 108 challenge/industry combinations passed using only local runtime assets; ${Math.round(performance.now() - start)} ms. Public message shape retained.`
  );
} finally {
  await worker.terminate();
}
