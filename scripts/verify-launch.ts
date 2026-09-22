// Server packaging check only. Does not automate or replace browser acceptance.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
const port = 3122;
const child = spawn(process.execPath, ["--import", "./dist/instrument.js", "dist/index.js"], {
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(port),
    APP_ORIGIN: "https://localhost:3122",
    DATABASE_URL: "",
    DATABASE_MIGRATION_URL: "",
    BUILT_IN_FORGE_API_KEY: "",
    OAUTH_SERVER_URL: "",
    VITE_APP_ID: "",
    VITE_OAUTH_PORTAL_URL: "",
    SENTRY_DSN: "",
    VITE_SENTRY_DSN: "",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
try {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Server startup timed out")),
      10000
    );
    child.stdout.on("data", chunk => {
      if (String(chunk).includes("Server running")) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.once("exit", code => {
      clearTimeout(timer);
      reject(new Error(`Server exited ${code}`));
    });
    child.once("error", reject);
  });
  const origin = `http://127.0.0.1:${port}`;
  const health = await fetch(origin + "/api/health");
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, "ok");
  for (const path of [
    "/python-runtime/pyodide.asm.wasm",
    "/sql-runtime/pglite.wasm",
    "/sql-runtime/initdb.wasm",
  ]) {
    const asset = await fetch(origin + path, { method: "HEAD" });
    assert.equal(asset.status, 200);
    assert.match(asset.headers.get("content-type") ?? "", /application\/wasm/);
    assert.ok(Number(asset.headers.get("content-length")) > 0);
  }
  const worker = await fetch(origin + "/python-worker.js");
  assert.equal(worker.status, 200);
  assert.match(await worker.text(), /from "\/python-runtime\/pyodide.mjs"/);
  assert.match(
    worker.headers.get("content-security-policy") ?? "",
    /worker-src 'none'/
  );
  const exited = once(child, "exit");
  child.kill("SIGTERM");
  const [code] = await exited;
  assert.equal(code, 0);
  console.log(
    "PASS: production boot, health, WASM asset MIME/availability, local Python loader, worker CSP and graceful shutdown"
  );
} finally {
  if (child.exitCode === null) child.kill("SIGKILL");
}
