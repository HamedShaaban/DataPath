# DataPath quality pass — September 21, 2026

## Outcome
Completed the available source, domain-workflow, persistence-boundary and build review. Fixed concrete defects rather than adding feature scope. This is not a completed browser or live-database acceptance test.

## Fixes
- Onboarding edits now live in a cloned draft. Finishing commits the profile; cancelling discards the draft without changing saved progress.
- Explicit lesson/interview practice links bypass the introductory gate and resolve SQL exercises from their topic, ahead of stale previous selections.
- Switching roadmap skills remounts the assessment panel so answers and open quiz state do not carry into a different skill.
- Quiz errors enter the review queue even if the overall score reaches the pass threshold. Successful retries clear only recovered topics. Wrong answers invalidate affected completion and stale skill-pass status without deleting history or written evidence.
- Failed automatically checked non-SQL exercises now add their topic to review. Self-reviewed cases and runtime-startup failures do not create false weak-topic signals.
- Practice self-review checkbox drafts survive switching exercises during a visit.
- Unreadable guest saves are copied to a unique recovery key before any replacement. If preservation fails, the original is left untouched and the storage warning is shown. Existing recovery copies are never overwritten.
- Unavailable theme storage no longer prevents the app from opening.
- Workspace changes invalidate stale asynchronous updates. Account changes clear transient coaching, review, selection and export state; practice and first-lesson panels are keyed by owner. Cloud-save responses are ignored after an ownership change.
- Unsaved changes receive a browser unload warning. Existing sign-out confirmation remains in place.
- Sign-in dialog now has a named dialog role, Escape dismissal, keyboard focus containment and focus return to its trigger.
- Hidden onboarding controls remain hidden despite general label display rules.

## Validation completed
- TypeScript check passed.
- 173 automated tests across 22 files passed.
- Production build passed. Existing >500 KB chunk-size warning remains; no claim of performance optimisation.
- Added workflow coverage for onboarding state, guided completion, actual SQL execution, failed quiz, recovered topic and guest reload.
- Added regression coverage for corrupt-save preservation, quota failure, SQL topic routing, partial-pass weaknesses and non-SQL review signals.
- Existing authenticated API ownership and input-boundary tests passed using mocked storage. These do not replace a live database test.
- Palette tests check text, muted text and accent against page, surface and soft-surface backgrounds in both themes at a minimum 4.5:1 contrast ratio. These checks do not prove every rendered component's contrast.
- Source-level review covered responsive layout rules, keyboard focus and current onboarding → lesson → lab → review → persistence paths.
- No user account, browser progress or database records were modified during testing. PDF guide unchanged.

## Blocked acceptance checks
1. Browser inspection of localhost:3010 was attempted through the authorised browser tool. Access was denied because the admin-enforced browser security policy could not be verified. No alternate browser or indirect workaround was used. Desktop/mobile visual layout, actual keyboard interactions and in-browser worker behaviour remain unverified.
2. No DATAPATH_TEST_DATABASE_URL was configured. The live MySQL integration script intentionally requires an explicitly disposable database named datapath_integration_test. No production database was used. Live save/reload, conflict and deletion-isolation acceptance remains outstanding.

## Follow-up acceptance checklist
- Complete new-user setup, cancel a profile edit, and confirm the original profile remains.
- Follow a SQL and a Python lesson/interview link to the intended exercise; retry a failed assessment and confirm review recovery.
- Switch skills during an open quiz and confirm no prior answer selections appear.
- Verify desktop and narrow mobile layouts in both themes, including skill navigation, expanded exercise picker, review filters and the sign-in dialog.
- Test a guest reload and account sign-in/save/reload/logout with separate disposable users.
- Run the existing MySQL integration script only with an explicitly configured disposable test database.

The automation is paused after this bounded pass so it does not resume adding small features. Remaining acceptance work requires the browser policy issue to be resolved and/or a disposable test database to be supplied.
