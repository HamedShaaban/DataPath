# Security readiness — 2026-10-05

Status: local security hardening implemented; not approved as a verified live deployment.
Branch: `security/launch-hardening`. Production credentials and personal learner data were not modified.

## Changes

- Updated existing Axios, Drizzle, Express, Nano ID and Streamdown dependencies, retaining Express 4 and the existing chart major version. Refreshed affected transitive packages through the lockfile. No new direct dependency or service.
- Production dependency audit now reports zero advisories at scan time. This is not proof of absence of vulnerabilities or application exploitability; development dependencies were outside that audit.
- Login and registration use an atomic PostgreSQL account-identity rate budget (20 attempts/hour), in addition to IP limits. Identity keys are hashed by the existing limiter. Database/protection failures fail closed. An attacker can still temporarily consume a victim's account budget; recovery/email verification remains important.
- Unknown-email login performs a real dummy scrypt check rather than immediately returning. This removes the obvious missing-hash timing branch, not every possible timing difference.
- Local authentication IP entries expire and have a bounded identity count.
- Newly issued password and OAuth sessions expire after 24 hours, including active sessions. Cookie and server expiry agree. Existing year-long sessions are not silently rewritten or revoked; use revoke-all for existing accounts at cutover. No separate idle-time policy was added.
- Production writes require an allowed Origin even if an arbitrary Authorization header is supplied. The app uses cookie authentication, not bearer authentication.
- Development server binds to 127.0.0.1; production retains the externally reachable bind required by its host.
- Existing schema and migrations unchanged.

## Evidence

- Full Vitest suite: 315 passing tests across 49 files, including account-budget isolation/failure and Origin bypass regression tests.
- TypeScript: passed.
- Production/Vercel build: passed. Existing large-chunk and five dependency-trace warnings remain; isolated package validation checks the shipped function.
- Disposable PostgreSQL integration: passed, including migrations applied twice, ownership, save revision races, signup/login/logout/revoke-all, new 24-hour lifetime bound, expiry, and saved progress.
- Isolated Vercel package: passed local signup, secure cookie flags, cross-origin rejection, SQL grading, proof privacy and worker policy checks.
- Production launch test: passed local boot, health, WASM availability/MIME, Python loader, worker policy and graceful shutdown.
- Browser acceptance was not repeated: earlier browser access was blocked by URL policy. No alternate browser surface was used to bypass that restriction.

## Required before public launch

1. Supply/select the actual Vercel project and separate preview Neon database; configure HTTPS origin and TLS-verified connection secrets in the platform, never Git. Apply existing migrations to the intended database after reviewing and backing up any existing data.
2. Test the real preview: signup, logout/login, progress across browsers, SQL and Python, save conflicts, proof visibility, worker cold starts and resource limits. Local success does not establish Vercel/Neon connectivity.
3. Implement email ownership verification and password recovery with a selected transactional email provider and domain. Current immediate signup discloses account existence and permits registration with an unverified email. Neutral error wording alone would not solve this; no misleading success response was substituted.
4. Revoke pre-hardening sessions for existing accounts during the rollout using the existing account control. Any bulk operation requires an explicit rollout decision.
5. Verify backups/restoration and platform abuse controls. Confirm production telemetry policy. Optional AI remains disabled unless provider/model/prices/budget are configured and tested.

The app is prepared for preview validation, not certified secure or confirmed live. No production deployment, schema migration against learner data, or email service provisioning was performed in this pass.
