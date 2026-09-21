import type { Request, Response, NextFunction } from "express";
const traffic = new Map<string, { count: number; until: number }>();
export function validateProduction() {
  if (process.env.NODE_ENV !== "production") return;
  const secret = process.env.JWT_SECRET || "";
  if (secret.length < 32 || /replace|paste|secret_here/i.test(secret))
    throw new Error(
      "Production requires a random JWT_SECRET of at least 32 characters"
    );
  if (
    !process.env.APP_ORIGIN?.startsWith("https://") ||
    new URL(process.env.APP_ORIGIN).origin !== process.env.APP_ORIGIN
  )
    throw new Error("Production requires an HTTPS APP_ORIGIN");
}
export function securityMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
    // AlaSQL compiles expressions inside a disposable worker. Only that worker
    // may compile code; its policy disallows network access and child workers.
    const isSqlWorker = /^\/assets\/sql-worker-[A-Za-z0-9_-]+\.js$/.test(
      req.path
    );
    const isPythonWorker = req.path === "/python-worker.js";
    // Only runtime downloads are allowed; learner code cannot request account APIs.
    const host = req.get("host") || "localhost";
    const runtimeOrigin = /^[a-z0-9.:[\]-]+$/i.test(host)
      ? `${req.protocol}://${host}`
      : "https://localhost";
    res.setHeader(
      "Content-Security-Policy",
      isPythonWorker
        ? `default-src 'none'; script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'; connect-src ${runtimeOrigin}/python-runtime/; worker-src 'none'`
        : isSqlWorker
          ? "default-src 'none'; script-src 'self' 'unsafe-eval'; connect-src 'none'; worker-src 'none'"
          : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
    );
  }
  if (!req.path.startsWith("/api/")) return next();
  res.setHeader("Cache-Control", "no-store");
  const now = Date.now(),
    key = req.ip || "unknown",
    entry = traffic.get(key);
  if (traffic.size > 10000)
    for (const [id, v] of traffic) if (v.until < now) traffic.delete(id);
  const current =
    entry && entry.until > now ? entry : { count: 0, until: now + 60000 };
  current.count++;
  traffic.set(key, current);
  if (current.count > 120) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ error: "Too many requests" });
    return;
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const expected =
      process.env.APP_ORIGIN || `${req.protocol}://${req.get("host")}`;
    const origin = req.get("origin");
    if (
      (origin && origin !== expected) ||
      req.get("sec-fetch-site") === "cross-site"
    ) {
      res.status(403).json({ error: "Cross-origin write rejected" });
      return;
    }
    if (
      process.env.NODE_ENV === "production" &&
      !origin &&
      !req.get("authorization")
    ) {
      res.status(403).json({ error: "Origin required" });
      return;
    }
  }
  next();
}
