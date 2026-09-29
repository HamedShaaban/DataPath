# Proof profile review — 2026-09-28

Branch: `fix/proof-profile-review`. Scope: review and harden the existing uncommitted proof-profile implementation. The PDF/deck deliverables have not been regenerated.

## Changes made during this review

- Public `/p/:handle` responses, including unavailable pages, use `Cache-Control: no-store`. This prevents new browser/CDN caching after visibility changes; it cannot retract screenshots or copies already taken.
- SQL server verification runs in a disposable Node worker, with a 15-second wall-clock deadline, one active job per process, no waiting queue, and cleanup on success/failure/timeout. The production build includes the worker entry. Worker heap limits do not impose a hard limit on WebAssembly memory; process/container memory isolation remains a launch consideration.
- Verification submissions are limited to 20 per account per minute in process memory. Public lookup limits now prune expired entries and bound map size. These are process-local controls, not distributed quotas.
- Quiz input errors remain BAD_REQUEST; database/storage failures retain their original classification instead of being mislabeled as bad answers.
- Skill credentials retain their assessed target level in existing `serverScore` JSON. Public titles label beginner/intermediate/advanced; previously recorded grades lacking a level show “Level unspecified.” No schema change was needed. A repeated pass replaces the prior score for that skill, keeping the existing one-record-per-skill behavior and visibility setting.
- Proof queries have account-specific client cache keys; the server always derives ownership from the authenticated session. Sign-in/out clears proof queries, and stale verification callbacks are ignored after a workspace change.
- Practice UI distinguishes local results from pending/failed server verification. Visibility mutation failures display feedback without unhandled promise rejections.
- Public/preview copy explains that answers and SQL were checked at submission time. Questions, answer keys, fixtures and reference solutions ship with the app. These credentials are practice evidence, not proctored exams, identity verification, or independent professional certification.

## Verification performed

- Baseline: 291 tests passed across 43 files before fixes.
- Final: `pnpm test` — 302 tests passed across 45 files; no deleted or skipped tests.
- `pnpm check` — passed.
- `pnpm build` — passed; Vite retains its advisory about large chunks.
- Built `dist/proof-sql-worker.js` executed the SQL filter solution successfully against all seven checks.
- `git diff --check` — passed.
- Disposable PGlite integration tests execute every current Postgres migration in an in-memory engine, then verify default privacy, handle uniqueness, credential ownership, hidden-state preservation during upsert, and disabling public lookup.
- Additional regressions cover failed/forged grades, answer-set validation, assessed-level recording, storage-error classification, unauthenticated SQL calls, rate limits, public-page escaping/cache headers, worker timeout/error cleanup, and concurrent SQL rejection.

## Database boundary and remaining acceptance work

The inherited schema changes and migrations 0004/0005 were not edited or applied to a user database during this review. Their addition brings the schema to 11 tables, including verifiedCredentials. The existing PDF describes the older 10-table baseline and remains unchanged.

The initial review exercised migrations against disposable PGlite. The follow-up below additionally verified local PostgreSQL and the signed-in browser flow. Production/Neon DB connectivity, multi-instance operation, actual production memory usage and deployment remain unverified. No new dependencies were installed, and no deployment was performed.

Project verification remains unimplemented: the type exists in the table, but the application does not issue server-verified project credentials. Python results remain local practice feedback. Public lookup does not rerun historical submissions on each page visit. Public profile access does not expose emails, CVs, applications, notes, or full learning snapshots.


## Follow-up: local PostgreSQL and browser acceptance

Completed on 2026-09-28 using installed PostgreSQL 17.11, an isolated cluster on loopback port 55439, and disposable databases named datapath_integration_test and datapath_smoke_test. No existing account data or configured database was used. Existing migrations were applied without schema edits. Docker was not running; no installation was needed.

- `pnpm test:integration` passed against PostgreSQL: applying migrations twice, Unicode persistence, account ownership, revision races, account rollback, legacy upserts, timestamps/history, identity sequence, guest-work import, fresh login, opaque sessions, hashed-token storage, expiry, logout and revoke-all.
- The expanded Playwright smoke test passed (5.3 seconds test execution) against the production build using the installed Brave Chromium browser in isolated contexts. It covers signup, httpOnly cookie, current path explorer, SQL local pass plus server verification, Python pass with lazy self-hosted runtime assets, account save/reload, proof-page publication, anonymous viewing, email exclusion, hide/show credential, no-store response headers, and HTTP 404 after disabling publication.
- Existing smoke selectors had drifted: password helper text is part of the accessible label, and path selection now requires “Use this path.” The test now matches the current UI and handles the beginner practice introduction. Visibility assertions wait for server-confirmed state changes.
- Playwright config optionally accepts PLAYWRIGHT_EXECUTABLE_PATH; default CI browser selection is unchanged. A 15-second action timeout makes obsolete controls fail promptly.
- All 302 unit/regression tests passed again across 45 files; TypeScript checks and production build passed. No tests were skipped or deleted.

To reproduce, use an explicitly disposable PostgreSQL database named datapath_smoke_test, run `pnpm build`, then run `DATAPATH_SMOKE_DATABASE_URL=<disposable-url> pnpm test:smoke`. Set PLAYWRIGHT_EXECUTABLE_PATH only when using an already-installed compatible browser. The runner migrates only the explicitly supplied test database and serves the app on port 3111.

These results establish local acceptance, not a production deployment or Neon connectivity claim. The original PDFs/deck remain unchanged.
