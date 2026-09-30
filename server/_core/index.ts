import { createApp } from "./app";
import { Sentry } from "./instrument.js";
import { config } from "./env";
import { closeDb } from "../db";
import "dotenv/config";
import { createServer } from "http";
import net from "net";
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
  const app = createApp();
  const server = createServer(app);
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
