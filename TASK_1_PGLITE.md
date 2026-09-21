# Task 1 — PostgreSQL practice worker

Branch: `task-1-pglite`. The supplied folder had no Git history; commit `230cfcf` records the original working tree before this task.

## Scope

Replaced AlaSQL with exactly `@electric-sql/pglite@0.5.8` (PostgreSQL 18.3, verified by querying the installed runtime). Removed AlaSQL and its unused transitive dependency tree. The lockfile's Drizzle peer annotation now includes PGlite because it is installed; the account database still uses MySQL. No Drizzle schema, migration, account/session or AI changes were made.

The worker still receives `{ challengeId, query, sector? }` and returns `SqlExecutionResult` with the same fields. `runSqlInWorker` and UI callers are unchanged. The eight-second worker termination limit is unchanged and includes cold runtime loading.

## Implementation

- Practice-only tables use PostgreSQL `INTEGER`, `TEXT` and `DATE`. Inserts are parameterized; industry identifiers come from the existing controlled mapping. No persistent learner database is migrated.
- One in-memory PGlite instance per worker; visible and three alternate datasets are reseeded in sequence. Concurrent engine calls are queued to avoid cross-industry contamination.
- Learner queries run as a non-superuser with SELECT grants inside a read-only transaction, rolled back after each query. `set_config` execution is revoked to prevent role/read-only changes through a SELECT. Existing single-statement validation remains; PostgreSQL casts, array syntax and `!=` are no longer rejected as scripting punctuation.
- Dates are parsed as ISO strings so the existing result-table and stored-attempt API remains compatible. Field metadata supplies columns even for empty results, fixing the old incorrect acceptance of empty results with wrong columns.
- Three self-hosted assets (`pglite.wasm`, `initdb.wasm`, `pglite.data`, approximately 16 MB uncompressed total) are prepared before dev/build and fetched only when the SQL worker starts. Vite excludes PGlite from dependency optimization and emits an ES-module worker. Vite additionally emits hashed copies of the dependency's default assets; the explicit worker loader downloads only the three `/sql-runtime/` assets.
- Production SQL-worker CSP permits WASM compilation and only those three runtime fetch URLs; it does not permit JavaScript string evaluation, account API fetches or child workers. Main-page policy remains unchanged. Header tests cover this policy; browser enforcement still needs a real-browser acceptance check.
- SQL syntax coaching and the date exercise hint now describe PostgreSQL. All reference queries were already valid PostgreSQL, so no answer-key rewrites were necessary.

## Exercise output report

| Exercise | Visible expected output under PostgreSQL |
|---|---|
| sql-select-filter | Unchanged |
| sql-group-revenue | Unchanged |
| sql-join-customer-value | Unchanged |
| sql-date-range | Unchanged; DATE values serialized as ISO date strings |
| sql-distinct-segments | Unchanged |
| sql-debug-boolean | Unchanged |
| sql-debug-count | Unchanged |
| sql-left-join | Unchanged |
| sql-subquery | Unchanged |
| sql-cte | Unchanged |
| sql-window | Unchanged |
| sql-null | Unchanged |

All nine industry adaptations also pass. Intentional debugging starters remain broken; PostgreSQL enforces grouping, NULL and integer-division behavior rather than emulating AlaSQL. Invalid-query error wording now comes from PostgreSQL. Empty result sets retain actual field names instead of fabricated expected names.

## Validation

- `pnpm check`: passed.
- `pnpm test`: 202 tests in 25 files passed. All 194 original tests remain; the existing SQL CSP test was updated for WASM and runtime-only downloads. No tests were deleted or skipped.
- `pnpm build`: passed. Existing bundle-size advisory remains. PGlite emits bundler warnings for unused Node filesystem branches and eval-containing optional code; the exercised browser runtime succeeds with JavaScript string code generation disabled.
- `pnpm test:sql-worker`: production ES worker run in Node worker_threads, using the browser runtime branch and only local runtime assets. All 108 exercise/industry combinations and the invalid-challenge response passed. Each request is bounded by the caller's eight-second budget. This is a bundle/protocol check, not a browser UI test.
- Browser acceptance remains unavailable because the browser tool cannot verify its administrator policy. No alternate browser mechanism bypassed that restriction. Slow-network/cold-start performance on actual devices remains unverified.

## Runtime references

- https://pglite.dev/docs/api
- https://pglite.dev/docs/bundler-support

Task 2 and later tasks have not started.
