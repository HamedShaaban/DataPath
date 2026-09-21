# Task 5 — AI hardening

Migration 0003 adds aiBudgets and aiRequests only. Apply before enabling AI. Existing learner data is untouched. No dependencies added. AI remains off without credentials.

Configuration requires AI_MODEL (an exact provider-supported ID), verified input/output USD-per-million-token rates, and an application-wide UTC monthly USD cap. No implicit provider-selected model or invented pricing default. Set AI_REQUESTS_PER_HOUR (1–20, default 20) and AI_TIMEOUT_MS (100–60000, default 25000). Provider base URL/key and Chat Completions payloads remain swappable. Only bounded text requests are accepted by the priced application path; images/files would require separate accounting.

A PostgreSQL transaction and shared advisory lock atomically check the rolling per-user hourly limit and monthly budget, and persist a reservation before any provider call. Reservations cover two attempts using UTF-8 payload bytes plus framing allowance and maximum completion tokens. One retry is allowed for network/timeout, 429 and 5xx failures; authentication and other permanent failures are not retried. Each timeout covers response-body consumption. Retry delay is bounded at two seconds.

Successful reported usage reconciles the reservation using configured prices. Unknown usage and failed attempts remain conservatively charged; crashes leave the reservation counted. Duplicate settlement cannot subtract twice. Operators may reconcile unknown reservations against provider invoices. Changing model/prices affects new reservations only. Structured ai_usage logs contain request/account IDs, model, tokens, attempts, status and micro-USD; no prompts, CVs, responses or API keys.

The cap is an application control based on configured token prices and conservative text-token estimates, not a provider billing guarantee: use a provider-side spend cap too, and reconcile any provider-specific extra charges. If a provider reports unexpectedly higher usage it is recorded and subsequent requests are blocked at the cap. No live billed provider calls were made.

Validation: 209 tests (all original 202 plus seven provider-hardening cases), TypeScript and production build. PostgreSQL verification covers simultaneous requests competing for the last reservation, actual-cost refund, idempotent settlement, retained unknown usage, and persistent per-user limits. Run scripts/verify-ai-budget.ts only with DATAPATH_TEST_DATABASE_URL pointing to disposable datapath_integration_test.
