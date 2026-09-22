import * as Sentry from "@sentry/react";
import { z } from "zod";
import { sanitizeTelemetry } from "@shared/telemetry";
const dsn = z
  .string()
  .url()
  .optional()
  .parse(import.meta.env.VITE_SENTRY_DSN || undefined);
Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: import.meta.env.MODE,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: sanitizeTelemetry,
});
export { Sentry };
