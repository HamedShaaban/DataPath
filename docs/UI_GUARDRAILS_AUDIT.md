# Production UI guardrails review

Reviewed 30 September 2026 on `ui/production-guardrails`, using the user-provided `production-web-ui-guardrails` skill.

## Changes

- Centralized graphite neutral surfaces, a teal action accent, semantic feedback colours, radius, font, transition and content-width tokens.
- Replaced the competing legacy literal palettes in the shared stylesheet. Light and dark modes use paired tokens.
- Removed decorative gradients, static shadows, hover lifts, sparkle icons, decorative icon boxes and unused orbit artwork.
- Raised small meaningful text to at least 12px; normalized the type and 4px spacing scales. Monospace remains for code/data where appropriate.
- Limited landing headlines to 48px desktop / 32px mobile. Removed the redundant promotional eyebrow, repeated free badge and decorative project bars.
- Simplified dashboard shortcuts, preserved visible keyboard focus, removed forced equal heights from settings cards and restored accent-coloured progress fills.
- Restyled shared UI primitives so static inputs/buttons do not have shadows and overlays use a single subtle shadow token.
- Rewrote UI em dashes, unavailable-assessment copy and theme labels. SQL keywords, programming identifiers and proper career/tool names retain their technical spelling.
- No database schema changes, new dependencies, account changes or deployment actions belong to this UI task.

## Inspection coverage

Rendered guest-mode review covered overview/first lesson, roadmap, practice entry, progress matrix, resources, tools, interviews, projects, career toolkit, AI coach unavailable state and settings. All 11 destinations were inspected in light/dark at 1440px and 390px. Additional checks covered onboarding direction/levels/pace, expanded roadmap lesson and SQL workbench. Landing and path explorer were inspected in the fresh learner session at 390px.

DOM sampling found no page-wide horizontal overflow at the recorded widths and no meaningful sampled text below 12px. Contrast sampling compared direct text colour with its nearest opaque ancestor background, excluding disabled controls. This is a useful regression check, not a complete WCAG audit: it does not model every alpha-composited surface, assistive technology combination or user-generated content state.

Screenshots and inspection data are stored locally in `output/ui-guardrails/`. The generated contact sheet is an overview; use individual screenshots for inspection. Existing learner progress was not reset. The separate fresh learner session was not submitted as a new learning plan.

## Validation

- Vitest: 308 tests passed across 47 files, none removed or skipped. Existing palette contrast tests now reference the renamed `--accent` token.
- TypeScript check: passed.
- Production + Vercel output build: passed.
- Keyboard activation of navigation and disclosures: manually exercised in browser.
- Added four Playwright regressions for all workspace destinations at desktop/mobile widths in both themes, including text size, contrast, page overflow and focus visibility.
- Browser regression: all 5 Playwright tests passed, including signup → SQL → Python → saved progress and all 11 workspace destinations at 390px / 1440px in light and dark themes. The earlier approval-limit blocker was resolved.
- Real PostgreSQL integration passed: saved guest progress survives logout/login, session expiry and revocation, account isolation, revision races, repeat migrations and rollback checks. Only disposable local databases were used.
- Public proof styling was also simplified and its empty state inspected using an explicitly fictional local fixture, removed after inspection. Account-only loaded states, live AI responses and live published proof records remain outside the completed guest UI inspection. Their live acceptance is not claimed.

## Delivery status

The updated local preview is available at `http://localhost:3010/`. This branch is not a production deployment and the audit does not claim every possible state is fully compliant. The pending browser regression run is now complete. Production connectivity and live optional integrations still require separate deployment acceptance.

## Compact mobile navigation — 2026-10-01

- Mobile workspace navigation is collapsed behind a labeled Menu disclosure; opening it exposes every destination, including for beginner profiles.
- Choosing a destination closes the menu and focuses the main content. Escape restores focus to Menu. Breakpoint changes reset the disclosure and move focus away from hidden navigation.
- Narrow-screen roadmap grid sizing now permits shrinking; the AI navigation badge stays on one line.
- Verified: TypeScript check, 308 unit tests across 47 files, production build, and all 6 Playwright tests against rebuilt production assets. Browser coverage includes 390px/1440px in light/dark themes, 320px overflow, keyboard navigation, resize behavior, and signup → SQL → Python → saved progress against disposable local PostgreSQL.
- Rendered 320px expanded-menu screenshot inspected: `output/ui-guardrails/mobile-menu.png`.
- In-app browser inspection encountered a stale connection-error page followed by a browser URL-policy block; no restriction was bypassed. Visual acceptance used the existing authorized Playwright test workflow. Local development server restarted on port 3010. No production deployment or database changes.

## Comfortable dark palette — 2026-10-01

- Replaced green-tinted dark neutrals with charcoal page, card and inset surfaces. Softened primary and secondary text while retaining tested readable contrast.
- Separated filled-button color from the link/focus accent: dark-mode actions use subdued teal with light text rather than a bright mint fill. Light-mode token values remain unchanged.
- Softened semantic error/warning colors and retained distinct feedback surfaces.
- Verified TypeScript, production build, 308 unit tests and all 6 browser tests. Existing contrast/layout checks cover all 11 workspace destinations at 390px and 1440px in both themes. Inspected dark dashboard, roadmap and practice screenshots saved under `output/ui-guardrails/dark-*.png`.
- This is a visual comfort adjustment, not a medically validated eye-strain claim. No dependencies, database changes or deployment.

## Practice engine failure handling — 2026-10-03

- SQL/Python startup and worker failures now show a neutral engine-unavailable state, preserve the current editor content, and explain retry without learner hints or blame.
- Unavailable results do not enter attempt history, change learning evidence/review topics, or trigger SQL server verification. SQL's combined startup/execution timeout is ungraded because it cannot reliably attribute the delay to the learner. Python errors after its ready signal remain learning feedback.
- Existing historical attempts are preserved; drafts are retained in the current editor, not newly guaranteed across reloads.
- Verified: TypeScript, production build, 312 unit tests (original 308 plus four failure tests), and 8 browser tests. New browser cases block SQL assets/Python worker loading, assert unchanged editor contents and zero recorded attempts, then restore access and verify successful retries. Screenshot inspected under `output/student-review/python-unavailable-fixed.png`.
- No dependencies or schema changes. Account setup remains the next separate task.
