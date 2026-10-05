# Vercel + Neon deployment

Status: prepared for preview deployment; actual Vercel execution and production Neon connectivity remain unverified. Local tests do not establish live availability or AI accuracy.

## Architecture

Vercel serves the built React application and self-hosted SQL/Python runtime assets. One Node 24 function handles Express/tRPC and public proof pages. Neon stores accounts, sessions, progress, AI accounting and shared request limits. Docker remains available for other hosts; Vercel uses `vercel.json` and the Build Output API instead.

The SQL grading worker, its dependencies and WASM assets are explicitly packaged. Browser SQL and Python execute in browser workers. Server-side SQL grading still needs a real Vercel cold-start/resource acceptance check. The per-process worker concurrency cap is not a global queue.

## 1. Prepare the database

Use a separate Neon branch/database for previews; do not connect pull-request previews to learner production data.

Migration `0006_aspiring_liz_osborn.sql` adds only `rateLimitBuckets` (hashed key, request count, expiry and expiry index). It does not rewrite existing learner tables. The current schema has 12 tables. Migration files are additive; review and back up an existing database before applying them.

From a trusted local terminal, set `DATABASE_MIGRATION_URL` to Neon's direct/unpooled connection string and run:

```sh
pnpm db:migrate
```

Keep the connection string private. Use TLS with certificate verification (`sslmode=verify-full`). Migrations are intentionally not run during Vercel builds. Deploying without this migration causes protected requests to fail closed.

## 2. Import the repository

Import `HamedShaaban/DataPath` into Vercel. Select the branch containing this preparation (`security/launch-hardening`) for the first preview. The older `main` branch does not automatically receive these changes.

Use the repository root, framework **Other**, Node **24.x**. The checked-in configuration sets installation to `pnpm install --frozen-lockfile` and the build to `pnpm build:vercel`. Do not override the output directory or set a Docker/start command. Enable Vercel's system environment variables so `VERCEL_URL` is available. Choose a function region close to the Neon database.

## 3. Set environment variables

| Variable | Value / scope |
| --- | --- |
| `DATABASE_URL` | Neon pooled TLS URL, separate values for Preview and Production. Required on Vercel. |
| `APP_ORIGIN` | Exact production HTTPS origin without trailing slash. For Preview, leave unset to derive the deployment origin. |
| `NODE_ENV` | `production` |

The platform deployment and branch URLs are accepted as exact origins, not wildcard subdomains. Cookies remain secure and httpOnly. Browser assets receive explicit security policies; SQL/Python workers retain their restricted runtime access.

Do not copy the entire local `.env` into Vercel. Never prefix database credentials or AI secrets with `VITE_`. `DATABASE_MIGRATION_URL` is for the trusted migration environment, not necessary in the app runtime.

AI is optional. Leave its variables unset until you have a provider, verified model ID, prices and monthly budget. See `.env.example` for the complete AI configuration. Sentry is optional: `SENTRY_DSN` is server-side; `VITE_SENTRY_DSN` is public and used at build time. Existing OAuth requires its specific provider configuration; email/password accounts do not need it.

## 4. Verify the preview before promoting

- Open `/api/health`; expect the DataPath status response.
- Create a test account, sign out/in, and check saved progress after a refresh.
- Complete a SQL and Python exercise; check the browser console for missing assets or security-policy errors.
- Verify account progress from another browser and exercise the save-conflict flow.
- Create SQL proof, enable its public page, hide a credential and disable sharing; verify anonymous visibility follows these settings.
- Check small-screen layout, keyboard navigation and both themes.
- Confirm database connection limits and cold-start behaviour under realistic load.

Do not describe the app as live until these checks pass on the actual deployment. AI quality and provider connectivity require separate acceptance if enabled.

## Reproduce local validation

```sh
pnpm check
pnpm test
APP_ORIGIN=https://datapath.example pnpm build:vercel
```

With disposable local PostgreSQL databases only:

```sh
DATAPATH_TEST_DATABASE_URL=postgresql://USER@localhost:PORT/datapath_integration_test pnpm test:integration
DATAPATH_SMOKE_DATABASE_URL=postgresql://USER@localhost:PORT/datapath_smoke_test pnpm test:vercel
DATAPATH_SMOKE_DATABASE_URL=postgresql://USER@localhost:PORT/datapath_smoke_test pnpm test:smoke
```

Apply migrations to the disposable smoke database first. `test:vercel` copies the generated function into an isolated temporary directory, starts it locally, and checks signup, cookie flags, origin rejection, real SQL grading, public proof privacy and generated static policies. This is not a cloud-runtime test. Playwright requires an installed browser (or `PLAYWRIGHT_EXECUTABLE_PATH`). Trace warnings are recorded in `dist/vercel-trace-warnings.txt`; optional native PostgreSQL/WebSocket/debug dependencies are not required for the tested path.

Shared rate limits use atomic PostgreSQL counters on Vercel so separate instances cannot independently reset allowances. Expired buckets are removed opportunistically. Database failures return an unavailable response rather than bypass protection. AI budget accounting remains database-backed. These protections add database traffic and do not replace platform-level abuse protection.

## Cost and rollback

Vercel Hobby is for personal, non-commercial use; check the [current terms and limits](https://vercel.com/docs/plans/hobby) before public/commercial launch. Free hosting does not guarantee free AI calls or unlimited database usage.

Rollback by restoring the previous deployment. Leave the additive rate-limit table in place; dropping it is unnecessary and would break the newer deployment. Never roll back by deleting learner data.

## Recorded acceptance — 2026-09-30

- TypeScript check: passed.
- Vitest: 308/308 tests passed across 47 files; none skipped.
- Production and Vercel output builds: passed. Generated backend approximately 34 MB, static files 47 MB on the local filesystem.
- Real local PostgreSQL integration: passed, including repeat migrations, session lifecycle, account isolation, saved guest workspace and revision races.
- Browser smoke: passed signup → SQL exercise → Python exercise → saved progress.
- Isolated Vercel artifact: passed cookie flags, origin rejection, PostgreSQL signup, server SQL worker grading, proof privacy and static route/header configuration.
- Still unverified: Vercel cloud routing/worker execution, live Neon connectivity, production load/cold starts, and optional live AI/Sentry/OAuth integrations.

## Security hardening update — 2026-10-05

See [SECURITY_READINESS.md](SECURITY_READINESS.md) for current validation, 24-hour new sessions, dependency updates, and remaining public-launch gates. Do not launch from an older branch that lacks these fixes.
