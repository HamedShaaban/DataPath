import type { Sector } from "@shared/industry-practice";
import { executeSqlChallenge } from "@shared/sql-engine";
// Explicit assets avoid bundler-dependent import.meta.url resolution. Nothing
// is fetched from a CDN; CSP restricts this worker to these runtime downloads.
const runtime = Promise.all([
  loadRuntime("pglite.wasm")
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.compile(bytes)),
  loadRuntime("initdb.wasm")
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.compile(bytes)),
  loadRuntime("pglite.data").then(response => response.blob()),
]).then(([pgliteWasmModule, initdbWasmModule, fsBundle]) => ({
  pgliteWasmModule,
  initdbWasmModule,
  fsBundle,
}));
// Attach a handler immediately if the assets fail before the first message.
void runtime.catch(() => undefined);
async function loadRuntime(file: string) {
  const response = await fetch(`/sql-runtime/${file}`);
  if (!response.ok) throw new Error("PostgreSQL runtime download failed");
  return response;
}
self.onmessage = async (
  event: MessageEvent<{ challengeId: string; query: string; sector?: Sector }>
) => {
  try {
    self.postMessage(
      await executeSqlChallenge(
        event.data.challengeId,
        event.data.query,
        event.data.sector,
        await runtime
      )
    );
  } catch {
    self.postMessage({
      passed: false,
      executed: false,
      columns: [],
      rows: [],
      checks: [],
      message: "The lab could not start. Please try again.",
    });
  }
};
