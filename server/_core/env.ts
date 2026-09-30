import "dotenv/config";
import { environmentWithOrigin } from "../deployment";
import { z } from "zod";
import { aiConfigSchema } from "../ai-config";
const optionalText = z.preprocess(
  value => (value === "" ? undefined : value),
  z.string().optional()
);
const optionalUrl = z.preprocess(
  value => (value === "" ? undefined : value),
  z.string().url().optional()
);
const schema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    TRUST_PROXY: z.enum(["0", "1"]).default("0"),
    APP_ORIGIN: optionalUrl,
    DATABASE_URL: optionalUrl,
    DATABASE_MIGRATION_URL: optionalUrl,
    VITE_APP_ID: optionalText,
    VITE_OAUTH_PORTAL_URL: optionalUrl,
    OAUTH_SERVER_URL: optionalUrl,
    OWNER_OPEN_ID: optionalText,
    BUILT_IN_FORGE_API_URL: optionalUrl,
    BUILT_IN_FORGE_API_KEY: optionalText,
    SENTRY_DSN: optionalUrl,
    VITE_SENTRY_DSN: optionalUrl,
  })
  .superRefine((env, ctx) => {
    const issue = (key: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [key], message });
    if (
      env.NODE_ENV === "production" &&
      (!env.APP_ORIGIN || !env.APP_ORIGIN.startsWith("https://"))
    )
      issue("APP_ORIGIN", "Production requires an HTTPS origin");
    if (
      env.APP_ORIGIN &&
      URL.canParse(env.APP_ORIGIN) &&
      new URL(env.APP_ORIGIN).origin !== env.APP_ORIGIN
    )
      issue(
        "APP_ORIGIN",
        "Use a canonical origin without a path or trailing slash"
      );
    for (const key of ["DATABASE_URL", "DATABASE_MIGRATION_URL"] as const) {
      const value = env[key];
      if (
        value &&
        URL.canParse(value) &&
        !["postgres:", "postgresql:"].includes(new URL(value).protocol)
      )
        issue(key, "Must be a PostgreSQL URL");
    }
    for (const key of [
      "OAUTH_SERVER_URL",
      "VITE_OAUTH_PORTAL_URL",
      "BUILT_IN_FORGE_API_URL",
      "SENTRY_DSN",
      "VITE_SENTRY_DSN",
    ] as const) {
      const value = env[key];
      if (
        value &&
        URL.canParse(value) &&
        ![
          "https:",
          ...(env.NODE_ENV === "production" ? [] : ["http:"]),
        ].includes(new URL(value).protocol)
      )
        issue(key, "Use HTTPS in production and HTTP(S) in development");
    }
    if (
      [env.OAUTH_SERVER_URL, env.VITE_OAUTH_PORTAL_URL, env.VITE_APP_ID].some(
        Boolean
      ) &&
      ![
        env.OAUTH_SERVER_URL,
        env.VITE_OAUTH_PORTAL_URL,
        env.VITE_APP_ID,
        env.DATABASE_URL,
      ].every(Boolean)
    )
      issue(
        "OAUTH_SERVER_URL",
        "OAuth requires both URLs, app ID and database"
      );
  });
export function parseEnv(source: NodeJS.ProcessEnv) {
  source = environmentWithOrigin(source);
  const parsed = schema.safeParse(source);
  const ai = source.BUILT_IN_FORGE_API_KEY
    ? aiConfigSchema.safeParse(source)
    : null;
  const issues = [
    ...(!parsed.success ? parsed.error.issues : []),
    ...(ai && !ai.success ? ai.error.issues : []),
  ];
  if (source.VERCEL === "1" && !source.DATABASE_URL)
    issues.push({ code: "custom", path: ["DATABASE_URL"], message: "Vercel requires PostgreSQL for accounts and shared rate limits" });
  if (source.BUILT_IN_FORGE_API_KEY && !source.DATABASE_URL)
    issues.push({
      code: "custom",
      path: ["DATABASE_URL"],
      message: "AI requires a database for accounting",
    });
  if (issues.length)
    throw new Error(
      `Invalid environment: ${issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`
    );
  return parsed.data!;
}
export const config = parseEnv(process.env);
export const ENV = {
  appId: config.VITE_APP_ID ?? "",
  databaseUrl: config.DATABASE_URL ?? "",
  oAuthServerUrl: config.OAUTH_SERVER_URL ?? "",
  ownerOpenId: config.OWNER_OPEN_ID ?? "",
  isProduction: config.NODE_ENV === "production",
  forgeApiUrl: config.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: config.BUILT_IN_FORGE_API_KEY ?? "",
};
