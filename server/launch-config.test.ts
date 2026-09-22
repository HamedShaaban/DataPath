import { describe, expect, it } from "vitest";
import { parseEnv } from "./_core/env";
import { sanitizeTelemetry } from "../shared/telemetry";

describe("launch configuration", () => {
  it("supports guest development without external services", () => {
    expect(parseEnv({})).toMatchObject({
      NODE_ENV: "development",
      PORT: 3000,
      TRUST_PROXY: "0",
    });
  });
  it.each([
    { PORT: "bad" },
    { PORT: "0" },
    { PORT: "65536" },
    { TRUST_PROXY: "true" },
    { DATABASE_URL: "mysql://localhost/db" },
    { DATABASE_URL: "not a url" },
    { NODE_ENV: "production" },
    { NODE_ENV: "production", APP_ORIGIN: "http://example.test" },
    { APP_ORIGIN: "https://example.test/path" },
    { OAUTH_SERVER_URL: "https://auth.example.test" },
    { BUILT_IN_FORGE_API_KEY: "private-key" },
    { SENTRY_DSN: "ftp://example.test/1" },
  ])("rejects invalid startup configuration: %j", input => {
    expect(() => parseEnv(input)).toThrow("Invalid environment");
  });
  it("accepts production and explicitly priced AI", () => {
    expect(
      parseEnv({
        NODE_ENV: "production",
        APP_ORIGIN: "https://example.test",
        DATABASE_URL: "postgresql://localhost/db",
        BUILT_IN_FORGE_API_KEY: "test-key",
        AI_MODEL: "provider-versioned-model",
        AI_INPUT_USD_PER_MILLION: "1",
        AI_OUTPUT_USD_PER_MILLION: "2",
        AI_MONTHLY_CAP_USD: "10",
      }).NODE_ENV
    ).toBe("production");
  });
  it("does not include secret values in configuration errors", () => {
    try {
      parseEnv({ BUILT_IN_FORGE_API_KEY: "private-key" });
    } catch (error) {
      expect(String(error)).not.toContain("private-key");
    }
  });
  it("strips learner data while retaining diagnostic stack frames", () => {
    const event = sanitizeTelemetry({
      user: { email: "learner@example.test" },
      request: { data: "password" },
      extra: { cv: "private CV" },
      contexts: { learner: "private" },
      breadcrumbs: [{ message: "SQL draft" }],
      message: "private content",
      exception: {
        values: [
          {
            type: "TypeError",
            value: "private content",
            stacktrace: { frames: [{ filename: "app.js", lineno: 5 }] },
          },
        ],
      },
    });
    const encoded = JSON.stringify(event);
    expect(encoded).not.toMatch(
      /private content|private CV|learner@example|password|SQL draft/
    );
    expect(encoded).toContain("app.js");
    expect(encoded).toContain("TypeError");
  });
});
