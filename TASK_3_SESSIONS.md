# Task 3 — database-backed sessions

Adds sessions(id, userId, expiresAt, revokedAt), indexed by user and expiry, with a cascading user foreign key. Migration 0002 is additive; run pnpm db:migrate before deploying. No passwords or learning data change. No new dependency.

Cookies now contain 32 random bytes encoded as base64url; only their SHA-256 digest is stored. Local and OAuth login issue the same database sessions. Context authenticates by joining an unexpired, unrevoked session to its user. There is no JWT or Authorization-header fallback. Existing JWT cookies require reauthentication. httpOnly, SameSite=Lax, secure-cookie rules and the existing one-year maximum lifetime are preserved.

Logout revokes the current token before clearing the cookie. Protected auth.revokeAllSessions revokes the authenticated user's sessions, including the current device; Settings exposes this action. Revocation affects subsequent requests, not already-running requests. Database failures fail closed. Expired/revoked rows may be periodically deleted by an operator; no automatic destructive cleanup was added.

Rollback: deploy the previous application and require fresh login; leave the additive table intact. Old JWTs could become valid again under old application code, so rotate its signing secret if rolling back.

Validation: 202/202 tests pass, TypeScript passes, production build passes. Real PostgreSQL integration applies migrations twice and verifies hashed storage, cookie authentication in tRPC context, legacy JWT rejection, expiry, single logout, revoke-all, and isolation from another account. Existing persistence/account checks also pass. Browser acceptance is not claimed.
