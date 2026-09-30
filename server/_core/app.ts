import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { securityMiddleware, validateProduction } from "../security";
import { registerOAuthRoutes } from "./oauth";
import { registerProofPage } from "../proof-page";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { Sentry } from "./instrument.js";

export function createApp() {
  validateProduction();
  const app = express();
  app.disable("x-powered-by");
  if (process.env.VERCEL === "1" || process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
  app.use(securityMiddleware);
  app.get("/api/health", (_req, res) =>
    res.json({ status: "ok", app: "DataPath" })
  );
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "128kb" }));
  app.use(express.urlencoded({ limit: "128kb", extended: true }));

  registerOAuthRoutes(app);
  registerProofPage(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError({ error }) {
        if (error.code === "INTERNAL_SERVER_ERROR")
          Sentry.captureException(error.cause ?? error);
      },
    })
  );
  return app;
}
