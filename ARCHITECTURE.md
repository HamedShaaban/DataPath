# DataPath architecture and changes

## Product model

The source of truth is authored code in `shared/catalog.ts`: 18 roles → required skill levels → 28 skills → 252 topics. Each topic has a stable ID, English title, level, estimated hours and prerequisite IDs. Cross-skill prerequisites are explicit. Nine business-sector lenses add industry concepts, metrics, controls and project directions without changing the technical curriculum. Resources have fixed provider URLs, price categories and language labels. Role families provide portfolio briefs; `shared/interview-cases.ts` supplies authored technical cases.

These are representative career paths, not a ranked claim about 18 equally in-demand jobs. Role selection was informed by the [WEF Future of Jobs 2025](https://www.weforum.org/publications/the-future-of-jobs-report-2025/digest/) and [Microsoft career paths](https://learn.microsoft.com/en-us/training/career-paths/). The catalog also links directly to official tool documentation and public educational materials. The taxonomy and Arabic translations are authored for this product, not copied curricula.

## Planning and state

`shared/learning.ts` contains the versioned Zod schema and pure planning functions. The planner merges role requirements with optional interests, expands dependencies transitively, orders skills topologically, and excludes levels declared already known. A failed foundation check can restore beginner gaps. Self-report and practice checks are not professional certifications.

Remaining topics are scheduled sequentially using hours/week. The desired period is a feasibility constraint, not a fixed curriculum length. A 12-hour portfolio allowance remains until the project is explicitly completed. Changing role or pace recalculates the plan while stable topic IDs preserve prior learning evidence. Estimated hours are editorial planning estimates.

Guest state lives under `datapath.guest.v1` in localStorage, validated when loading/importing. Signed-in state stays in memory until the user saves; it is not written to the guest browser store. Explicit guest import prevents silent mixing. Account-scoped query keys prevent cache reuse between identities. Save revisions reject stale-tab writes instead of overwriting newer work.

## Frontend

React 19 + TypeScript + Vite, using existing tRPC/React Query infrastructure. `client/src/pages/Home.tsx` renders onboarding, dashboard, roadmap, proof ledger, resource library, interview studio, projects, career toolkit, coach and settings. `client/src/index.css` implements the responsive desktop/mobile layout. The active product experience is English-only; legacy Arabic catalog strings remain internal data so older saved state and authored content stay compatible.

Topic completion requires learner evidence. Interview answers persist independently by stable case ID. The dashboard reports actual recorded topics, study minutes and answer counts; it does not invent activity or assign unsupported readiness scores. CV export is a plain-text draft; no automated hiring decisions are made.

Each lesson quiz has five deterministic questions. Every level has a ten-question assessment, and every skill has a twenty-question final with a 95% threshold (19/20). Authored technical banks override the fallback and can include code, output interpretation, debugging and trade-off questions; SQL currently has three authored scenarios for every topic plus validation and debugging variants. The UI keeps submitted answers visible and explains the technical reason for each result. Cumulative reviews pair completed required skills. Wrong answers name their topic and place its ID in `reviewTopics`, so the planner reopens it even if it was previously completed. Passing a skill exam adds a separate certification marker; lesson completion alone does not certify the skill.

Lesson content is assembled from the curated skill/topic record: an editorial brief, three observable outcomes, a hands-on task, the official resource, a topic-specific YouTube discovery link, evidence capture and the assessment. Links support the explanation rather than replacing it.

The roadmap presents a Learn → Practice → Assess → Review cycle. This follows patterns used by established learning products: role and skill tracks, practice projects, repeated assessment and targeted review. Resources remain separate from proof of mastery; watching a video never marks a topic complete.

The dashboard turns that cycle into a daily queue: learn the next available topic, revisit a failed topic, validate a completed skill, and apply the work in a portfolio project. The proof ledger derives each row from required lessons, saved evidence, passed level checks and the skill exam. A skill is only labelled proven when its exam is certified and every required gap lesson has evidence. The ledger can be exported as Markdown for a portable, inspectable record.

## Backend and persistence

Express serves the Vite development app or production assets. `server/routers.ts` exposes authentication, public capabilities/catalog, authenticated state operations and the coach. Local passwords use per-account random salts and Node's scrypt; only the hash is stored in `localAccounts`. Sessions use the existing signed HttpOnly cookie. `server/learning-store.ts` performs owner-scoped PostgreSQL operations via Drizzle/node-postgres and atomic revision checks. `learningStates` and `localAccounts` are additive tables; earlier schema/history tables are retained for compatibility and backup access.

The original generic roadmap, skill and resource generation endpoints were removed. The old UI, patch scripts and template snapshot were replaced/removed. No automatic conversion from unstructured old plans to verified new topic completion is performed.

## AI boundary

Only the server invokes the existing AI adapter. The model receives a bounded set of outstanding catalog topics and context relevant to the chosen assistance mode. Structured output is parsed and validated, and every returned topic ID must belong to that supplied set. The model cannot mutate the plan, add resources or mark skills complete. Plain-text feedback is displayed as text rather than rendered HTML.

Provider configuration and user consent are explicit. Core features have a deterministic, credential-free path. Request limits, finite provider timeouts and sanitized errors prevent unlimited anonymous model usage and avoid exposing provider errors to users. AI guidance is advisory, not proof of skill or factual CV experience.

## Security retained and strengthened

- Preserved OAuth nonce binding, JWT verification and authenticated user ownership.
- Removed unrestricted shared demo login, synthetic `id: 1` fallback and cron identities from learner account access.
- Required strong session secrets; checked session app IDs; kept HttpOnly/Secure cookies and tightened SameSite to Lax.
- Added same-origin write checks, request limits, body bounds, CSP, HSTS, frame protection and no-store API responses.
- Disabled registration of the unused storage proxy and removed debug/session-replay assets and runtime plugins.
- Bounded all submitted learning fields with Zod and validated backups.
- Used per-account optimistic concurrency and authenticated deletion.
- Kept credentials server-side and added production configuration checks.

The existing OAuth service is Manus-specific, not generic OIDC. Deployment needs valid provider configuration. Process-local rate limits are intentionally documented as a single-instance constraint. This delivery does not claim a penetration test or a production integration with external credentials.

## Extending the platform

Add a skill to the catalog, supply its translated levels and topics, define a diagnostic and interview case, and reference it in role requirements. Keep IDs stable. Add a schema migration for structural state changes; bump the state/catalog version when compatibility requires it. Use deterministic tests for curriculum references and prerequisites before publishing new curriculum content.
