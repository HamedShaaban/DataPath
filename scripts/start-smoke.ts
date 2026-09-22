// Explicit disposable DB only. This does not read/use the production DATABASE_URL.
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
const url = process.env.DATAPATH_SMOKE_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith("/datapath_smoke_test"))
  throw new Error(
    "Set DATAPATH_SMOKE_DATABASE_URL to disposable datapath_smoke_test"
  );
Object.assign(process.env, {
  NODE_ENV: "test",
  PORT: "3111",
  APP_ORIGIN: "http://127.0.0.1:3111",
  TRUST_PROXY: "0",
  DATABASE_URL: url,
  BUILT_IN_FORGE_API_KEY: "",
  SENTRY_DSN: "",
  VITE_SENTRY_DSN: "",
  OAUTH_SERVER_URL: "",
  VITE_OAUTH_PORTAL_URL: "",
  VITE_APP_ID: "",
});
const pool = new Pool({ connectionString: url });
await migrate(drizzle(pool), { migrationsFolder: "./drizzle/postgres" });
await pool.end();
// Build before running. Test mode serves the production assets with local HTTP cookies.
await import("../dist/index.js");
