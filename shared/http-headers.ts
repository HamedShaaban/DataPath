export const baselineHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};
export function contentPolicy(path: string, origins: string[], sentryDsn = "") {
  if (path === "/python-worker.js")
    return `default-src 'none'; script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'; connect-src ${origins.map(origin => `${origin}/python-runtime/`).join(" ")}; worker-src 'none'`;
  if (/^\/assets\/sql-worker-[A-Za-z0-9_-]+\.js$/.test(path))
    return `default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; connect-src ${origins.flatMap(origin => ["pglite.wasm", "initdb.wasm", "pglite.data"].map(file => `${origin}/sql-runtime/${file}`)).join(" ")}; worker-src 'none'`;
  const telemetry = sentryDsn ? new URL(sentryDsn).origin : "";
  return `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' ${telemetry}; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`;
}
