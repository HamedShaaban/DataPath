# Local accounts

Run from the project directory:

```sh
pnpm local:accounts
pnpm dev
```

Open http://localhost:3010 and select **Sign in**, then **New here? Create an account**. Use your own chosen password (at least 10 characters). No deployment, Neon account or AI key is required.

The setup uses existing PostgreSQL 17 binaries at `/opt/homebrew/opt/postgresql@17/bin`. For a different installation set `DATAPATH_PG_BIN` to its bin directory. It does not install dependencies.

## Persistence and boundaries

- PostgreSQL listens only on `127.0.0.1:55440`, with password authentication; database and role are named `datapath_local`.
- Data and the generated database password live in `.local-data/`. The application connection is in `.env`. Both are ignored by Git; never publish or delete them casually.
- Setup applies existing migrations only and can be rerun. It does not reset data or replace a different existing `.env`.
- This database is independent of the disposable test database on port 55439 and of any production database.
- Guest progress remains browser-local. Signing up does not itself prove guest-to-account transfer; use the app's offered transfer/save flow and verify your data before clearing browser storage.
- `pnpm local:accounts:stop` stops PostgreSQL without deleting accounts. After reboot, rerun the two startup commands above. No automatic system startup is installed.
- Back up the database before relocating or deleting the checkout. An application progress export is not a complete account/database backup.

## Verification — 2026-10-04

Verified through the local HTTP API: accounts capability enabled, signup, authenticated identity, saved learning state, logout, PostgreSQL stop/start, login with the same account, and retrieval of the saved state. Verification used synthetic `@example.test` accounts; they are not user login credentials. Existing schema migrations applied successfully. Browser visual verification remained blocked by the in-app browser URL policy.
