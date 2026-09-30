import { build } from "esbuild";
import { nodeFileTrace } from "@vercel/nft";
import { cp, mkdir, readFile, readdir, realpath, rm, lstat, readlink, symlink, copyFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { baselineHeaders, contentPolicy } from "../shared/http-headers";
import { deploymentOrigins } from "../server/deployment";

const root = process.cwd();
const output = path.join(root, ".vercel/output");
const fn = path.join(output, "functions/backend.func");
const origins = deploymentOrigins(process.env);
if (!origins.length || origins.some(origin => new URL(origin).protocol !== "https:" || new URL(origin).origin !== origin))
  throw new Error("Set APP_ORIGIN to the exact HTTPS site origin, or build inside Vercel with VERCEL_URL available.");
await build({
  entryPoints: ["server/vercel.ts"], outfile: "dist/vercel.js", bundle: true,
  platform: "node", format: "esm", packages: "external", external: ["./instrument.js"],
});
// Output only; never copy .env, source documents, or the full working directory.
await rm(output, { recursive: true, force: true });
await mkdir(fn, { recursive: true });
await cp("dist/public", path.join(output, "static"), { recursive: true });
const { fileList, warnings } = await nodeFileTrace(["dist/vercel.js", "dist/instrument.js", "dist/proof-sql-worker.js"], { base: root, processCwd: root });
for (const file of fileList) {
  if (!(file.startsWith("node_modules/") || file.startsWith("dist/") || file === "package.json"))
    throw new Error(`Unexpected backend dependency path: ${file}`);
  const dest = path.join(fn, file);
  await mkdir(path.dirname(dest), { recursive: true });
  if ((await lstat(file)).isSymbolicLink()) {
    const target = await readlink(file);
    await symlink(path.isAbsolute(target) ? path.relative(path.dirname(path.resolve(file)), target) : target, dest);
  } else {
    await copyFile(file, dest);
  }
}
// PGlite loads these by runtime-computed paths, so include them explicitly.
const require = createRequire(import.meta.url);
const pgliteDist = path.dirname(await realpath(require.resolve("@electric-sql/pglite")));
for (const name of await readdir(pgliteDist)) {
  if (/\.(wasm|data)$/.test(name)) {
    const rel = path.relative(root, path.join(pgliteDist, name));
    await mkdir(path.dirname(path.join(fn, rel)), { recursive: true });
    await copyFile(path.join(pgliteDist, name), path.join(fn, rel));
  }
}
await writeFile(path.join(fn, ".vc-config.json"), JSON.stringify({ runtime: "nodejs24.x", handler: "dist/vercel.js", launcherType: "Nodejs", shouldAddHelpers: false, maxDuration: 60 }, null, 2));
const sqlPattern = "/assets/sql-worker-[A-Za-z0-9_-]+\\.js";
const policy = (pathname: string) => ({ ...baselineHeaders, "Content-Security-Policy": contentPolicy(pathname, origins, process.env.VITE_SENTRY_DSN) });
await writeFile(path.join(output, "config.json"), JSON.stringify({ version: 3, routes: [
  { src: `^${sqlPattern}$`, headers: policy("/assets/sql-worker-runtime.js"), continue: true },
  { src: "^/python-worker\\.js$", headers: policy("/python-worker.js"), continue: true },
  { src: "^/(?!python-worker\\.js$|assets/sql-worker-[A-Za-z0-9_-]+\\.js$).*", headers: policy("/"), continue: true },
  { src: "^/(?:api(?:/.*)?|p(?:/.*)?)$", headers: { "Cache-Control": "no-store" }, dest: "/backend" },
  { handle: "filesystem" },
  { src: "^/(?:assets|python-runtime|sql-runtime)/.*$", status: 404 },
  { src: "^/.*$", dest: "/index.html" },
] }, null, 2));
// Optional native modules commonly produce trace warnings. Record them for review.
await writeFile("dist/vercel-trace-warnings.txt", [...warnings].map(warning => warning.message).join("\n"));
console.log(`Vercel output ready: ${fileList.size} traced files; SQL worker + WASM included. ${warnings.size} trace warnings recorded in dist/vercel-trace-warnings.txt.`);
