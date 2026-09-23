# DataPath validation record

Validated on September 19, 2026 with Node 24.20.0 and pnpm 10.4.1.

## Automated checks

- `pnpm check`: passed with strict TypeScript checking.
- `pnpm test`: 5 files and 29 tests passed.
- `pnpm build`: passed; client and server production bundles were generated.
- MySQL integration: all committed migrations applied to an isolated `datapath_integration_test` database. Arabic state round-tripped correctly; different users remained isolated; stale revisions were rejected; deleting one user's learning state left the other user's state intact.

The automated suite covers all 18 roles, 28 skills and 252 topics; unique and valid curriculum references; acyclic prerequisites; deterministic planning; transitive prerequisites; deadline feasibility; self-assessment and diagnostic behavior; topic, skill and cumulative quiz generation; weak-topic reopening; completion effort; career discovery; authenticated ownership; bounded inputs; password constraints; AI consent and authentication; rejection of invented AI topic IDs; session cookie clearing; same-origin writes; and production configuration.

## Browser checks

- Completed guest onboarding and confirmed the custom completion period affects the dashboard without removing curriculum requirements.
- Confirmed the undecided-career discovery path.
- Confirmed the advanced/expert selection opens the expertise and tools follow-up.
- Reviewed desktop English and Arabic right-to-left dashboards.
- Confirmed the nested roadmap renders prerequisites, three levels, resources, evidence fields and optional checks.
- Confirmed guest progress persists in the browser across reloads.
- Confirmed the workspace breadcrumb returns to Overview, the sidebar collapses to icons, Tools setup opens, and the resource library changes YouTube recommendations with the learning language.
- Confirmed five-question lesson quizzes gate completion, ten-question assessments appear after each level, twenty-question skill exams require 19/20, and cumulative review blocks appear after skill pairs.
- Confirmed every SQL topic opens three authored technical questions, Egyptian Arabic keeps technical terminology in English, submitted answers receive immediate explanations, and the theme toggle persists dark/light mode.
- Confirmed lesson panels include an explanation, outcomes, hands-on task, official guide and YouTube discovery link. Checked Interview Studio answer fields, rubric cards and review/coach surfaces for readable dark-mode contrast.
- Confirmed the daily queue exposes learn, review, validate and apply actions from real learner state. Confirmed the proof ledger links each skill back to the roadmap and never labels self-report alone as proven.
- Confirmed the product now renders in English only for both new and legacy profiles. Verified all nine sector choices in profile setup, a banking-specific roadmap lens, career-path guidance, and purpose explanations for every recommended tool.

## Production smoke check

Started the production bundle with an HTTPS canonical origin and a temporary strong session secret. `/api/health` returned HTTP 200. Responses included CSP, HSTS, frame denial, no-sniff, permissions policy, strict referrer policy and no-store headers for API responses. The built landing page was served successfully.

## Integration limits

No live MySQL instance, real OAuth account or AI-provider credential is currently running on this machine, so the account UI stays hidden in the active guest server. The local account implementation, migration and compile boundary were verified; a configured database is still needed for an end-to-end registration check. Guest mode and every deterministic learning feature were tested without those services. The project has not been deployed to a public domain.


## SQL upgrade validation — September 19, 2026

- TypeScript check passed.
- 61 tests across seven files passed, including all 12 reference solutions, all four broken debugging starters, hard-coded output rejection, threshold edge cases, equivalent SQL, history retention and backward-compatible state parsing.
- Worker lifecycle tests cover success, termination after eight seconds, loading failure and unavailable worker support.
- Security regression test confirms main-page expression compilation remains prohibited while the SQL worker has no network or child-worker access.
- Production build passed. The generated worker bundle was executed in an isolated JavaScript context to verify its message protocol and real SQL result checks.
- Browser acceptance and visual review for this upgrade were **not completed**: the browser tool could not verify the admin-enforced policy. Earlier browser records above refer to previous builds.
- The build reports a bundle-size advisory: the main bundle and on-demand SQL worker each exceed 500 kB before compression.


## Practice Studio and dark-mode update — September 19, 2026

Type checking and production build passed; 102 automated tests across ten files passed. New coverage checks all 18 careers and nine industries, 108 SQL variants, real Python execution and edge cases, limited formula validation, saved case revisions, legacy-state parsing, industry-specific progress, worker lifecycle and production Python CSP. Static contrast regression checks for onboarding summary text, role-card headings/descriptions, input placeholders and select options meet 4.5:1.

Built SQL worker execution and all five self-hosted Python runtime assets were verified. Browser visual/end-to-end checks remain blocked by the browser tool's unavailable policy verification. These checks do not replace browser acceptance or a full accessibility audit.


## Recommendation and workspace update

124 tests across eleven files pass, including recommendation coverage for all 18 careers, recent-failure handling, industry isolation, passed-work progression, skill filters and prerequisite-aware review ordering. Type checking and production build passed. Browser visual acceptance remains outstanding. The four-page user PDF passed text extraction and visual review of every rendered page.


## In-app guide and industry missions

Practice Lab now includes a Download user guide (PDF) link to /guides/practice-lab-user-guide.pdf. The guide was updated and all four rendered pages visually reviewed.

A 45-minute intermediate reconciliation mission is available in each of nine industries, mapped to a relevant skill for all 18 careers. Sixteen synthetic export rows include duplicate IDs, late corrections, missing/negative/zero values, cancellation changes and events outside the reporting window. Three numerical checkpoints verify deduplication, eligible-record count and the final total. Learners download the CSV for their own tools or reconcile it manually, then save methodology, interpretation and self-review. This is not an in-browser execution environment for the mission CSV, and correct numeric answers do not independently verify the narrative.

Checkpoint answers persist in submission revisions and restore with the saved narrative. Unfinished mission calculations feed the next-exercise recommendation. Industry-specific context and units remain visible.

Validation: 137 automated tests, type checking and production build passed; tests cover all nine expected reconciliations, all career mappings, checkpoint persistence, recommendation remediation and exact PDF asset matching. Browser visual acceptance remains outstanding due to the browser tool policy-verification failure.

## Career mission UI refresh — 2026-09-19
- Added a guest discovery page with a self-contained retail challenge, career journey preview, and illustrative portfolio direction.
- Existing learners retain their dashboard; new guests can enter or cancel setup without recording demo progress.
- Updated shared theme tokens and added blue/orange landing, dashboard milestone navigation, and practice surface styling; saved theme preferences remain respected.
- Type checking, 137 existing tests (including dark-mode contrast), and production build passed.
- Browser visual review remains outstanding: the browser security policy could not be verified by the browser tool. No alternate browser workaround was used.
- User guide unchanged at the user's request.

## Structural studio redesign — 2026-09-19
Replaced the dashboard component composition: focused session, three working-space destinations, compact skill route list, and separate progress journal with real progress metrics and navigation timeline. Removed the old hero, repeated queues, statistics cards, coach quotation, and duplicated continue-learning section. Desktop navigation is now a labeled vertical rail throughout the workspace. Practice Lab uses an exercise-browser column beside the active workspace, stacking on smaller screens. Existing learning actions and saved progress are preserved.

Type checking, all 137 tests, and production build passed. Browser visual review is still outstanding due to the previously reported browser policy restriction. PDF guide unchanged.

## SQL debugging guidance — 2026-09-19
Type checking, 145 tests across 13 files, and production build passed. Eight new checks cover guidance categories, industry vocabulary, actual execution failure/success, and blocked statements. Browser visual review remains outstanding under the existing browser policy restriction. Guide unchanged.

## Authored foundation expansion — 2026-09-20
Added six lessons with reconciled numeric examples and interpretation guidance. Existing lesson rendering consumes these entries without schema changes. Type checking, 145 tests and production build passed after correcting multiline string formatting during implementation. Browser visual review remains outstanding. Guide unchanged.

## Beginner feedback implementation — 2026-09-20
- Added a four-step no-code lesson: read a table, filter completed orders, calculate a total, and explain the eligibility rule. Incorrect answers get specific hints; saved steps resume through the existing persistence flow.
- Added a complete-beginner onboarding shortcut with a provisional Data Analyst/general industry path, three-hour suggested weekly pace, and no required tool assessment or deadline choice. Career catalogue and skill assessment are expandable.
- Beginner navigation shows the next lesson, practice and progress; all other destinations remain available under Explore all. Independent labs are optional until the guided exercise is complete.
- Added contextual vocabulary, completion recap, guest-storage/account-save guidance, and a landing-demo continuation action.
- Schema accepts legacy saves and rejects inconsistent guided completion states. Type checking, all 147 tests, and production build passed. Local preview restarted for the new save schema.
- Browser visual review remains blocked by its security policy. Guided mode currently covers the first exercise; it is not a replacement for every advanced lab or a complete authored foundation curriculum. Guide unchanged.

## Review scheduling and workspace polish — 2026-09-20
Added review readiness checks, exact missing-assessment messaging, interval scheduling and weak-topic overrides. Type checking, 153 tests and production build passed. Also applied responsive exercise-picker, roadmap-skill and shared panel styling in recent UI work. Browser visual acceptance remains outstanding; guide unchanged.

## Learning support, evidence export and accessibility — 2026-09-21
Added bilingual searchable glossary (24 terms), interview structure prompts and journal export, lesson/practice links from technical interviews, project self-review checklist export, manual lesson-feedback report downloads, selective proof export with exact preview, beginner milestone recap, and review-category filters.

Privacy-focused export tests ensure private fields and unselected skills stay out of selected proof reports. Interview tests cover relevant answered questions and lesson priorities. All 159 tests, type checking and production build passed. Added keyboard skip link, active-page semantics, reduced-motion-aware lesson/lab scrolling, and larger common touch targets. These code changes do not constitute a completed browser accessibility audit; browser review remains blocked. Guide unchanged.

## Quality pass — 2026-09-21
See QUALITY_PASS_2026-09-21.md for fixes and exact acceptance limits. Type checking, 173 tests across 22 files and production build passed. Guest recovery, setup cancellation, SQL deep links, quiz recovery, practice review signals, account-transition guards and keyboard dialog behaviour were hardened. Browser access remains denied by the admin-policy check; no disposable database is configured. Neither rendered UI acceptance nor live database persistence is claimed complete. Guide unchanged.

## Foundations unit 1 — 2026-09-21
Delivered a no-code unit on eligible records, totals, averages, zero and missing values. A worked example leads to supported practice and a changed dataset for an independent check. Each industry uses its own vocabulary/categories and interpretation caution. Numeric feedback and an explanation check gate completion. Progress and answer drafts are stored per industry in the existing workspace state; guest autosave and explicit account Save progress apply. Legacy states remain valid. Completion does not award skill assessments or certifications.

Available after the beginner first lesson on Dashboard/Practice Lab, and from the foundations disclosure on My roadmap for all learners. Follow-up SQL/Excel links appear only when relevant to the selected path. This is one English-language foundations unit, not the complete foundation curriculum or guided coverage for all practice languages.

Validation: Type checking, 186 tests across 23 files, and production build passed. Thirteen new tests cover nine industries, changed answers, eligibility mistakes, explanation requirements, invalid input and state round-tripping. Preview restarted with the updated schema. Browser visual/keyboard acceptance remains blocked by the existing browser policy; live account database persistence remains unverified without a disposable database. Build retains the existing large-bundle warning. PDF guide unchanged.

## AI documentation audit — 2026-09-21
Inspected the three-mode coach endpoint, provider transport, client consent/display, deterministic recommendations and review schedule. Added eight mocked-provider contract tests covering exact context, CV/interview data, absent model/tools, output bounds, unverified prose, request length and per-process quota. Type checking and all 194 tests in 24 files passed. No runtime implementation changes or live AI calls. Technical supplement: output/pdf/DataPath_AI_Technical_Review.pdf (six pages, rendered and inspected). Current-UI screenshot guide remains incomplete: browser policy verification denied capture again. The older illustrated guide must not be represented as the current screenshot edition.

## Tasks 3–6 — 2026-09-22

Stacked task branches implement PostgreSQL-backed revocable sessions, the existing shadcn layer's Tailwind 4 theme and account-dialog integration, bounded AI calls with persistent budget reservations, and launch preparation. See TASK_3_SESSIONS.md through TASK_6_LAUNCH.md for scope and operational details.

225 tests in 27 files, TypeScript and production build pass; all original 194 cases remain. PostgreSQL migration/persistence/session/budget checks pass. Built SQL worker: 108 combinations; built self-hosted Python: 27. Temporary production server health, asset delivery and shutdown pass. One Playwright smoke test is authored and discovered but not executed: browser policy verification remains blocked. Docker is unavailable. Live Sentry delivery and browser acceptance remain pending; launch readiness is not claimed. PDF unchanged.

## Dashboard and navigation — 2026-09-22

New learning dashboard replaces the previous mission/journal layout with a specific next-lesson action, Monday-based weekly goal from logged study sessions, practice/review/project shortcuts, and expandable per-skill progress cards. Beginners see the dashboard plus their existing guided lessons; their first action focuses the first-lesson section. Lesson actions set both the skill and exact lesson target. Navigation groups learning, resources and career destinations. No dependencies or database changes.

TypeScript, all 227 tests and the production build pass. Two new tests cover week boundaries, future-session exclusion and exceeding the weekly goal. Light/dark and narrow-screen styles are implemented, but rendered visual/keyboard acceptance remains unverified: an attempt to open the local preview was denied by the browser's administrator-policy verification. Deployment remains paused; this work is on ui-dashboard-navigation, not pushed to Render's main branch.

## Practice Lab workspace — phase 2, 2026-09-22

Redesigned Practice Lab into a compact searchable exercise sidebar and a larger workspace. Skill filtering now lives with exercise search; clear filters and a guided empty state help navigation. Focus mode hides exercise navigation and recommendations while keeping an explicit exit control. Instructions/datasets/hints and the SQL challenge list use keyboard-operable native disclosures. Task requirements remain visible above the editor. Editors resize vertically; non-SQL results show passed-check counts and preserve the distinction between execution checks and self-review. Narrow layouts stack the bounded exercise browser above the workspace.

No dependencies, database, execution engine or saved-state schema changed. All 227 tests, TypeScript and production build pass. Browser visual, keyboard and responsive acceptance remain pending because administrator-policy verification blocks browser access. Local branch ui-practice-workspace; deployment remains paused.

## Interactive roadmap — phase 3, 2026-09-22

Added a roadmap overview with progress, workload and a specific next-lesson action. The default skill selection follows the next available lesson. Skill cards identify where that lesson sits, and lesson rows distinguish completed, ready, prerequisite-needed and exploratory content. Unmet prerequisites have direct lesson links and retain existing completion/assessment gates. Industry context is collapsible to prioritize learning navigation. Styles cover narrow layouts and existing light/dark tokens. No dependencies, data model or assessment-rule changes.

All 227 tests, TypeScript and the production build pass. Browser visual/keyboard acceptance is still outstanding under the previously observed administrator-policy block. Changes are local on ui-interactive-roadmap; deployment remains paused.

## Lesson experience — phase 4, 2026-09-22

Added bilingual Understand → Try it → Check yourself navigation with focusable section targets and reduced-motion-aware scrolling. Objectives precede worked examples; practice and evidence prompts guide learners toward recording results. A completion checklist reflects existing prerequisite, evidence and passed-quiz requirements without changing the gates. Quizzes show answered counts and correct answers alongside explanations after submission. Styles use existing theme tokens and responsive layouts. No dependencies, database or saved-state schema changes.

All 227 tests, TypeScript and production build pass. Rendered visual/keyboard acceptance remains unverified because browser administrator-policy verification denied access. Work is local on ui-lesson-experience; deployment remains paused and the PDF guide is unchanged.

## Shared UI polish — phase 5, 2026-09-23

Added resource-guide result counts, whitespace-normalized search, clear-search action and a bilingual empty state. Shared workspace styles improve keyboard focus contrast using theme tokens, wrapping of long resource/coach/project text, flexible filter controls, small-screen resource cards and button sizing. Resource-card hover motion respects reduced-motion preferences. No dependencies, database or persistence changes.

All 227 tests across 28 files, TypeScript, production build and diff whitespace checks pass. Local preview was unavailable because no server was listening on port 3010; restarted the built app in local test mode and verified HTTP 200. Opening the preview was requested through Codex. Browser visual/keyboard acceptance remains unverified under the existing browser-policy limitation; this is not a completed visual audit of every page. Work is local on ui-site-polish, with deployment paused and PDF unchanged.
