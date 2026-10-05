import { describe, expect, it, vi, afterEach } from "vitest";
import { securityMiddleware, validateProduction } from "./security";
import type { Request, Response } from "express";
const run = (
  headers: Record<string, string>,
  method = "POST",
  path = "/api/trpc"
) => {
  const res = {
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  const next = vi.fn();
  securityMiddleware(
    {
      path,
      protocol: "https",
      method,
      ip: "test",
      get: (k: string) => headers[k],
    } as unknown as Request,
    res,
    next
  );
  return { res, next };
};
afterEach(() => vi.unstubAllEnvs());
describe("HTTP security", () => {
  it("rejects cross-site writes", () => {
    const { res, next } = run({
      host: "datapath.example",
      origin: "https://evil.example",
    });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
  it("allows same-origin writes", () => {
    const { next } = run({
      host: "datapath.example",
      origin: "https://datapath.example",
    });
    expect(next).toHaveBeenCalled();
  });
  it("rejects missing Origin in production cookie requests", () => {
    vi.stubEnv("NODE_ENV", "production");
    const { res } = run({ host: "datapath.example" });
    expect(res.status).toHaveBeenCalledWith(403);
  });
  it("does not let an arbitrary Authorization header bypass the Origin check", () => {
    vi.stubEnv("NODE_ENV", "production");
    const { res, next } = run({ host: "datapath.example", authorization: "Bearer unused" });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
  it("allows WASM only in the SQL worker with runtime-only network access", () => {
    vi.stubEnv("NODE_ENV", "production");
    const main = run({}, "GET", "/").res;
    const worker = run(
      { host: "datapath.example" },
      "GET",
      "/assets/sql-worker-abc123.js"
    ).res;
    const mainPolicy = vi
      .mocked(main.setHeader)
      .mock.calls.find(call => call[0] === "Content-Security-Policy")?.[1];
    const workerPolicy = vi
      .mocked(worker.setHeader)
      .mock.calls.find(call => call[0] === "Content-Security-Policy")?.[1];
    expect(mainPolicy).not.toContain("unsafe-eval");
    expect(workerPolicy).toContain("'wasm-unsafe-eval'");
    expect(workerPolicy).not.toContain("'unsafe-eval'");
    expect(workerPolicy).toContain(
      "connect-src https://datapath.example/sql-runtime/pglite.wasm https://datapath.example/sql-runtime/initdb.wasm https://datapath.example/sql-runtime/pglite.data;"
    );
    expect(workerPolicy).not.toContain("connect-src 'self'");
    expect(workerPolicy).toContain("worker-src 'none'");
  });
  it("limits Python network access to self-hosted runtime assets", () => {
    vi.stubEnv("NODE_ENV", "production");
    const { res } = run(
      { host: "datapath.example" },
      "GET",
      "/python-worker.js"
    );
    const policy = vi
      .mocked(res.setHeader)
      .mock.calls.find(call => call[0] === "Content-Security-Policy")?.[1];
    expect(policy).toContain(
      "connect-src https://datapath.example/python-runtime/"
    );
    expect(policy).not.toContain("connect-src 'self'");
    expect(policy).toContain("worker-src 'none'");
  });
  it("refuses insecure production configuration", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ORIGIN", "http://datapath.example");
    expect(validateProduction).toThrow();
    vi.stubEnv("APP_ORIGIN", "https://datapath.example");
    expect(validateProduction).not.toThrow();
  });
});
