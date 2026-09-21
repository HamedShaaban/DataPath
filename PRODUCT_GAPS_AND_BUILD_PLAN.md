# DataPath product gaps and build plan

## Current position

DataPath already provides personalised onboarding, 18 career paths, 28 skill areas, 252 curated topics, nine industry lenses, lesson guidance, technical quiz layers, remediation, project planning, interview practice, CV and application tools, a Proof Ledger, guest persistence, optional accounts and bounded AI assistance.

The product can explain a path and record progress. Its next stage must prove that learners can perform the work, return regularly and use their evidence in a real career process.

## SQL upgrade delivered — September 19, 2026

- Twelve challenges spanning filters, dates, aggregation, joins, missing matches, subqueries, CTEs, ranking, DISTINCT and NULL handling.
- Four debugging challenges with deliberately incorrect starter queries.
- Each challenge runs against visible data plus three alternate datasets covering boundaries, duplicate values, changed IDs/input ordering and absent transactions.
- Per-challenge history with saved SQL, timestamps, check counts, failed requirements, first/latest check percentages and query restoration. The latest 50 attempts are retained.
- Passed challenge IDs survive history rotation; legacy saved progress remains readable.
- Failed executable results add the relevant topic to the review queue. Failed checks link directly to the expanded, focused lesson; lesson practice links select an appropriate lab.
- Challenge switching preserves drafts during the lab session. Returning to the lab restores the last attempted query.
- Background worker execution with an eight-second timeout, worker cleanup and recoverable loading errors. Production expression compilation is permitted only inside the network-disabled SQL worker; the main page retains its strict policy.

These are learning checks, not independently verified certification. Fixtures and reference queries ship to the client and can be inspected. Twelve exercises provide broader foundation/intermediate coverage, not exhaustive SQL mastery. The engine remains AlaSQL rather than PostgreSQL.

Validation: type checking, 61 automated tests, production build and bundled worker execution passed. Browser visual/navigation testing was blocked by the browser tool's unavailable policy check and remains outstanding.

## Practice Studio expansion delivered

Career- and industry-filtered practice now includes real Python, focused Excel/DAX formulas, metric calculations and applied cases for every skill, alongside industry-aware SQL. Twelve lessons have deeper examples and mistake guidance. Case submissions support saved revisions and self-review; independent expert review remains future work. Dark-mode onboarding and related contrast issues were repaired. See PRACTICE_STUDIO_NOTES.md for scope, 102-test validation and the outstanding browser acceptance review.

## Missing capabilities, in priority order

### P0 — Required before a serious public pilot

1. **Expand and harden SQL execution**
   - Expand beyond the delivered 12 exercises into larger datasets, advanced window frames and dialect-specific cases.
   - Add independently reviewed challenge banks and more precise syntax-error coaching.
   - Add a server-side PostgreSQL sandbox later when PostgreSQL-specific behaviour, execution plans and strict resource timeouts are required.

2. **Deep authored content for the first path**
   - Complete expert lessons, examples, misconceptions and technical question banks for Data Analyst in Banking.
   - Add exercises that require interpretation and debugging, not recognition alone.
   - Review each assessment for ambiguity, difficulty and answer leakage.

3. **Production identity and persistence**
   - Deploy the database, account recovery, email verification and session operations.
   - Add backups, restore testing, monitoring and an incident process.
   - Complete an end-to-end ownership and privacy review.

4. **Product analytics and feedback**
   - Measure onboarding completion, first useful action, first evidence, lab success, review recovery and weekly return.
   - Add in-product feedback attached to a lesson, quiz or lab challenge.
   - Establish a small consented validation cohort.

### P1 — Required to create defensible learner outcomes

5. **Expand Python and notebook labs**
   - Delivered: three real Python exercises with deterministic alternate-dataset checks and capped worker execution.
   - Next: pandas, multi-cell notebooks, richer analysis and machine-learning exercises.

6. **Adaptive review scheduling**
   - Schedule topics using attempt history, recency, confidence and prerequisite impact.
   - Explain why a topic returned and what must improve.

7. **Project review workflow**
   - Delivered: artifact-link submissions, rubric self-review and revision history.
   - Next: assigned reviewers, reviewer notes and independently verified review states.
   - Separate self-recorded evidence from expert or peer-reviewed evidence.

8. **Public proof profile**
   - Let users share selected skills, labs, assessments and projects.
   - Include privacy controls, evidence provenance and revocation.

9. **Stronger interview simulation**
   - Add timed technical cases, follow-up questions, scoring rubrics and weak-topic links.
   - Connect interview weaknesses back to roadmap practice.

### P2 — Distribution and commercial readiness

10. **Institution and cohort workspace**
    - Assign paths, monitor consented progress and review evidence without opaque rankings.

11. **Employer challenges**
    - Publish role-specific tasks with clear rubrics and candidate-controlled sharing.

12. **Content operations**
    - Add curriculum versioning, reviewer approval, question-quality analysis and change history.

13. **Accessibility and localisation review**
    - Complete keyboard, screen-reader, contrast and mobile audits.
    - Reintroduce additional languages only after professional terminology and editorial review.

14. **Commercial experiments**
    - Test paid labs, mentor review and cohort services after the free core demonstrates repeat value.

## Recommended 90-day build

### Weeks 1–4: practical depth

- Delivered: 12 SQL challenges, alternate-dataset tests, debugging, progress history and linked remediation.
- Next: browser acceptance testing and deeper authored lessons for the first path.
- Deeply author the first six Data Analyst in Banking topics.
- Instrument onboarding, first mission, first lab and first saved evidence.

### Weeks 5–8: proof quality

- Add project submission and review states.
- Add adaptive review dates and a review queue.
- Create the first privacy-controlled shareable proof profile.
- Run usability sessions with the first learner cohort.

### Weeks 9–12: production pilot

- Configure production accounts, persistence, recovery and monitoring.
- Complete security, privacy, accessibility and mobile checks.
- Launch the focused Data Analyst in Banking pilot.
- Review activation, lab completion, learning improvement and weekly retention before expanding roles.

## Decision gates

- **Usability:** Can a new learner reach and complete a useful technical task without assistance?
- **Learning:** Do failed attempts, remediation and later attempts show improvement?
- **Evidence:** Do learners produce work they are willing to show in an application or interview?
- **Retention:** Do learners return for the next meaningful task without artificial streak pressure?
- **Demand:** Do learners, universities or employers request more execution, review or cohort capability?

The immediate product priority is depth in one complete path. Broad role coverage remains useful for discovery, but investment should concentrate on Data Analyst in Banking until the full learn–practise–validate–prove–apply loop is strong.

## Enhancements identified in this review

1. **Complete browser acceptance testing:** desktop/mobile layout, keyboard navigation, lesson-to-lab round trips and actual browser worker/CSP behavior.
2. **Explain SQL errors more precisely:** map common alias, grouping and parser errors to short corrective examples.
3. **Expand first-path teaching depth:** authored worked examples, interpretation tasks and additional window-function practice.
4. **Strengthen evidence quality:** reviewed project submissions and privacy-controlled sharing; browser checks alone cannot verify professional competence.
5. **Prepare production accounts:** recovery, verification, backups and restore tests before the public pilot.

The review also fixed lost pass badges after history rotation, generic lesson navigation, discarded per-challenge drafts during switching, empty-result ambiguity and main-thread query execution.


## Delivered: next exercise and focused workspace

Recommendations now explain why an exercise is next and reflect path requirements, selected skills, unfinished topics, reviews and attempts. The catalogue collapses around a focused task/dataset/editor/feedback layout with progressive hints, difficulty and estimated time. Remaining priorities are richer industry scenarios, notebooks/pandas, broader formula support and independent project review.


## Delivered: first multi-step industry mission

Added an industry-specific reconciliation mission with three checked calculations, messy synthetic CSV data, saved checkpoints and a self-reviewed explanation. The next content expansion is larger datasets and multiple mission types per industry. In-app PDF help is now available from the Practice Lab header.

## Delivered: SQL debugging guidance

Execution failures now include a next-step coaching panel for ambiguous columns, grouping errors, missing fields or tables, and general syntax. Examples use the selected industry's table and column names. Guidance is conditional rather than claiming a certain diagnosis; original error details remain available. Blocked statements and successful queries do not receive this coaching. Next remaining priorities: deeper first-path authored lessons, broader SQL exercises, pandas/notebook practice, and adaptive review scheduling.

## Delivered: six more authored foundation lessons

Expanded Excel tables/types, sorting/filtering, pivot tables, sampling/bias, types/parsing and duplicates/outliers. Each now provides an explanation, worked example and specific misconception guidance through the existing lesson view. The authored library now contains 18 lessons. This is an incremental teaching-depth expansion; independent expert review and a complete first-path question bank remain outstanding.

## Delivered: initial adaptive review scheduling
Cumulative reviews now show suggested dates using successful attempts on distinct UTC days, with 1/3/7/14/30-day intervals. Failures and relevant unresolved weak topics bring a review forward. Same-day retries do not advance multiple intervals. Existing prerequisite locks remain respected, and a final single-skill review can unlock. Confidence and prerequisite-impact weighting remain future work; this is a transparent practice heuristic, not a mastery estimate.

## Quality gate — September 21, 2026
Feature expansion was stopped for a bounded quality pass. See QUALITY_PASS_2026-09-21.md. Automated validation is green (173 tests); browser and live-database acceptance remain outstanding. Resolve these before treating the project as public-pilot ready. The former feature-building automation is paused after this pass.

## Foundations development started — September 21, 2026
Unit 1 now teaches reliable totals and averages through a worked example, guided calculation and independent dataset. It integrates industry context and per-industry saved progress, with path-relevant SQL/Excel continuation. Validation: 186 passing tests, type check and production build. Next curriculum work remains data types and grain, duplicates/missing-data cleaning, SQL foundations, spreadsheet foundations, then a substantial industry project and pandas exercises. The full five-phase recommendation is not yet delivered. See VALIDATION.md for browser/account acceptance limits. PDF guide unchanged.
