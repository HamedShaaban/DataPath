import { afterEach, describe, expect, it, vi } from "vitest";
import { deploymentOrigins } from "./deployment";
import { parseEnv } from "./_core/env";
import { contentPolicy } from "../shared/http-headers";
afterEach(() => vi.unstubAllEnvs());

describe("Vercel deployment boundaries", () => {
  it("accepts only exact deployment origins and keeps local configuration explicit", () => {
    expect(deploymentOrigins({ VERCEL: "1", VERCEL_URL: "data-123.vercel.app", VERCEL_BRANCH_URL: "data-main.vercel.app", APP_ORIGIN: "https://data.example" })).toEqual(["https://data.example", "https://data-123.vercel.app", "https://data-main.vercel.app"]);
    expect(deploymentOrigins({ VERCEL: "1", VERCEL_URL: "evil.example/path", VERCEL_BRANCH_URL: "data.vercel.app.evil.example" })).toEqual([]);
    expect(deploymentOrigins({ VERCEL_URL: "data.vercel.app" })).toEqual([]);
  });
  it("derives a preview origin while requiring a database on Vercel", () => {
    const source = { NODE_ENV: "production", VERCEL: "1", VERCEL_URL: "data-123.vercel.app", DATABASE_URL: "postgresql://localhost/test" };
    expect(parseEnv(source).APP_ORIGIN).toBe("https://data-123.vercel.app");
    expect(() => parseEnv({ ...source, DATABASE_URL: "" })).toThrow(/Vercel requires PostgreSQL/);
    expect(() => parseEnv({ NODE_ENV: "production" })).toThrow(/HTTPS origin/);
  });
  it("restricts worker network access on custom and preview domains", () => {
    const origins = ["https://data.example", "https://data-123.vercel.app"];
    const sql = contentPolicy("/assets/sql-worker-abc.js", origins);
    expect(sql).toContain("https://data-123.vercel.app/sql-runtime/pglite.wasm");
    expect(sql).not.toContain("connect-src 'self'");
    expect(sql).not.toContain("'unsafe-eval'");
    expect(sql).toContain("worker-src 'none'");
    expect(contentPolicy("/python-worker.js", origins)).toContain("https://data.example/python-runtime/");
    expect(contentPolicy("/", origins)).not.toContain("unsafe-eval");
  });
});
