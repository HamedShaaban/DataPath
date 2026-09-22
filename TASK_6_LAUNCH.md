# Task 6 — launch preparation

## Implemented

- Zod validates environment at import/startup, with named configuration errors and no secret values. It validates mode, port, proxy setting, canonical HTTPS production origin, PostgreSQL URLs, complete OAuth configuration, and required AI model/prices/cap/database when AI is enabled. Guest development needs no external service. JWT_SECRET is obsolete after Task 3.
- Python was already lazy and self-hosted. The locked Pyodide package's loader/WASM/stdlib are copied at build time; the Python worker is created only when an exercise runs. Verified the built assets independently across all 27 exercise/industry combinations. No runtime CDN added.
- One multi-stage Dockerfile, non-root runtime, production dependencies, health check and one long-running Node process. Development-only Vite imports are isolated from the production bundle. Production binds the configured port without silently selecting another. SIGTERM closes HTTP, database connections and Sentry.
- @sentry/node and @sentry/react 10.75.2. Server Express/unexpected tRPC exceptions and React 19 root errors are captured when configured. Requests, user details, breadcrumbs, contexts, extra fields and free-form exception text are stripped; diagnostic types/stacks remain. No tracing or session replay. Client errors show a recovery screen rather than an internal stack.
- @playwright/test 1.63.0 as a development dependency. One test covers signup, choosing a Data Scientist path, running SQL and Python, saving, and reloading the account. It uses a dedicated disposable database and synthetic credentials. Runtime downloads are checked for same-origin and lazy Python loading.

## Deployment

Run pnpm install --frozen-lockfile, pnpm check, pnpm test, pnpm build, then pnpm db:migrate from the source release/CI before deploying. The runtime image deliberately does not include migration tooling. Migrations 0002 and 0003 must be applied for sessions and AI accounting. Back up production data first; no production database was modified here.

Build: docker build --build-arg VITE_SENTRY_DSN="$VITE_SENTRY_DSN" -t datapath .
Run: docker run --rm --env-file .env.production -p 3000:3000 datapath

Set APP_ORIGIN to the public HTTPS origin and DATABASE_URL to the Neon TLS URL. Set TRUST_PROXY=1 only behind exactly one trusted proxy and block direct public access to the service port. The health endpoint checks the process, not database readiness.

SENTRY_DSN is server-only runtime configuration. VITE_SENTRY_DSN is a public build-time DSN; also supply the same value at runtime so CSP permits its ingest origin. Empty DSNs disable reporting. Never place API keys in VITE_ variables. Live delivery requires your Sentry project; no real DSN or event transmission was used in validation.

## Smoke test setup

Create a disposable PostgreSQL database named datapath_smoke_test. Set DATAPATH_SMOKE_DATABASE_URL to its connection string. Run pnpm build, pnpm exec playwright install chromium, then pnpm test:smoke in an environment authorized for browser execution. The test server migrates this database and serves built assets on 127.0.0.1:3111. It refuses other database names and does not reuse an existing server. AI, OAuth and Sentry are disabled. Synthetic test accounts remain only in this disposable database.

This smoke server uses NODE_ENV=test and local HTTP cookies; it is not a production HTTPS/browser-CSP acceptance check. Test discovery passed; browser execution did not run because the browser security tool denied access when it could not verify administrator policy. No alternative browser was used to bypass that restriction.

## Verification

- TypeScript: pass.
- Vitest: 225 tests / 27 files pass, preserving all original 194 cases.
- Production build: pass (existing bundle-size/PGlite advisories remain).
- PostgreSQL persistence/session and AI-budget integrations: pass.
- Built SQL worker: 108 combinations pass.
- Built self-hosted Python runtime: 27 combinations pass.
- Invalid production port fails before listening: pass.
- Temporary production server health, WASM MIME/availability, local Python loader, worker CSP and SIGTERM shutdown: pass (scripts/verify-launch.ts).
- Playwright test discovery: one test. Execution pending the browser-policy restriction being resolved.
- Docker image build/run: not executed; Docker is unavailable on this host.
- Browser visual/keyboard/light-dark acceptance and live Sentry delivery: pending.

Task 6 implementation is committed, but launch acceptance is not complete until those external checks pass. No PDF changes.
