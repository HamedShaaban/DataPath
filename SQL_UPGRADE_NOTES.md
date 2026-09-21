# DataPath SQL practice upgrade

Delivered the five requested improvements: 12 challenges, hidden alternate-dataset tests, debugging exercises, attempt/improvement history and direct weak-topic lesson links.

Additional fixes preserve pass records beyond history rotation, retain per-challenge drafts while switching, restore previous attempted queries, display NULL and empty results clearly, and prevent slow SQL from blocking the page. Lesson practice links now select a matching challenge. Failed executed queries enter the topic review queue without erasing existing evidence or clearing unrelated assessment failures.

## Validation

Type checking, 61 tests and the production build passed. The actual built worker bundle also passed an execution/message-protocol smoke test. Browser acceptance testing remains blocked by the browser tool's unavailable policy verification; visual layout and actual browser CSP execution have not been signed off.

## Limits

- Latest 50 attempts are retained; challenge pass records persist separately. First/latest percentages describe retained checks, not an independent mastery score.
- Client-side fixtures and reference SQL are inspectable. These are practice checks, not secure exams.
- AlaSQL supports the authored exercises; PostgreSQL-specific behavior is outside this release.
- The production SQL worker needs expression compilation. Only its hashed worker asset receives that permission, with network and child workers disabled. The main page policy remains strict.
- The eight-second timeout includes worker startup. A slow device may need to retry.
- Unsaved drafts survive challenge switching within a mounted lab session; executed attempts persist through the existing learning-state storage.
- No public deployment or production database configuration was performed.

Next enhancements: browser acceptance review, deeper authored lessons and SQL error coaching, reviewed project evidence, and production account recovery/verification.
