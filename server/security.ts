import { contentPolicy } from "../shared/http-headers";
import { deploymentOrigins } from "./deployment";
import { sharedRateLimit } from "./shared-rate-limit";
import { parseEnv } from "./_core/env";
import type { Request, Response, NextFunction } from "express";
const traffic = new Map<string, { count: number; until: number }>();
export function validateProduction() {
  parseEnv(process.env);
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
    const host = req.get("host") || "localhost";
    const origin = /^[a-z0-9.:[\]-]+$/i.test(host) ? `${req.protocol}://${host}` : "https://localhost";
    res.setHeader("Content-Security-Policy", contentPolicy(req.path, [origin], process.env.VITE_SENTRY_DSN));
  }
  if (!req.path.startsWith("/api/")) return next();
  res.setHeader("Cache-Control", "no-store");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const allowed = deploymentOrigins(process.env);
    if (!allowed.length) allowed.push(`${req.protocol}://${req.get("host")}`);
    const origin = req.get("origin");
    if (
      (origin && !allowed.includes(origin)) ||
      req.get("sec-fetch-site") === "cross-site"
    ) {
      res.status(403).json({ error: "Cross-origin write rejected" });
      return;
    }
    if (
      process.env.NODE_ENV === "production" &&
      !origin
    ) {
      res.status(403).json({ error: "Origin required" });
      return;
    }
  }
  if (process.env.VERCEL === "1" && req.path !== "/api/health") {
    void sharedRateLimit("api", req.ip || "unknown", 120, 60).then(() => next()).catch(error => {
      const limited = error?.code === "TOO_MANY_REQUESTS";
      if (limited) res.setHeader("Retry-After", "60");
      res.status(limited ? 429 : 503).json({ error: limited ? "Too many requests" : "Service temporarily unavailable" });
    });
    return;
  }
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
  next();
}
