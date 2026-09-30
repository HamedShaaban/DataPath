// Only deployment-provided, exact origins are accepted; never *.vercel.app.
export function deploymentOrigins(env: NodeJS.ProcessEnv): string[] {
  const origins = env.APP_ORIGIN ? [env.APP_ORIGIN] : [];
  if (env.VERCEL === "1") {
    for (const host of [env.VERCEL_URL, env.VERCEL_BRANCH_URL]) {
      if (host && /^[a-z0-9-]+\.vercel\.app$/i.test(host))
        origins.push(`https://${host}`);
    }
  }
  return [...new Set(origins)];
}
export function environmentWithOrigin(env: NodeJS.ProcessEnv) {
  return {
    ...env,
    APP_ORIGIN: env.APP_ORIGIN || deploymentOrigins(env)[0],
  };
}
