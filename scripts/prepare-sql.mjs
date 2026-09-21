import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { mkdirSync, copyFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const source = dirname(require.resolve("@electric-sql/pglite"));
const target = resolve("client/public/sql-runtime");
mkdirSync(target, { recursive: true });
for (const file of ["pglite.wasm", "initdb.wasm", "pglite.data"]) {
  copyFileSync(resolve(source, file), resolve(target, file));
}
console.log("Prepared self-hosted PostgreSQL runtime.");
