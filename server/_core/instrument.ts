import * as Sentry from "@sentry/node";
import { config } from "./env";
import { sanitizeTelemetry } from "../../shared/telemetry";
Sentry.init({
  dsn: config.SENTRY_DSN,
  enabled: Boolean(config.SENTRY_DSN),
  environment: config.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: sanitizeTelemetry,
});
export { Sentry };
