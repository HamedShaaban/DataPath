import { Sentry } from "./instrument.js";
import { config } from "./env";
import { closeDb } from "../db";
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { securityMiddleware, validateProduction } from "../security";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.on("error", error => {
      Sentry.captureException(error);
      console.error("Server could not listen", error.message);
      process.exitCode = 1;
    });
    const shutdown = () => {
      const deadline = setTimeout(() => process.exit(1), 10000);
      deadline.unref();
      server.close(async () => {
        await closeDb();
        await Sentry.close(2000);
        clearTimeout(deadline);
      });
    };
    process.once("SIGTERM", shutdown);
    process.once("SIGINT", shutdown);
    server.listen(port, "0.0.0.0", () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  validateProduction();
  const app = express();
  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
  app.use(securityMiddleware);
  app.get("/api/health", (_req, res) =>
    res.json({ status: "ok", app: "DataPath" })
  );
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "128kb" }));
  app.use(express.urlencoded({ limit: "128kb", extended: true }));

  registerOAuthRoutes(app);
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
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./dev-server");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  Sentry.setupExpressErrorHandler(app);
  const preferredPort = config.PORT;
  const port =
    config.NODE_ENV !== "development"
      ? preferredPort
      : await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.on("error", error => {
    Sentry.captureException(error);
    console.error("Server could not listen", error.message);
    process.exitCode = 1;
  });
  const shutdown = () => {
    const deadline = setTimeout(() => process.exit(1), 10000);
    deadline.unref();
    server.close(async () => {
      await closeDb();
      await Sentry.close(2000);
      clearTimeout(deadline);
    });
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
