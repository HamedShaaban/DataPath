# Career and industry Practice Studio

## Delivered

- Career/tool-requirement filtering with valid roadmap-topic links across all 18 roles.
- Nine industry contexts: banking, finance, marketing, healthcare, retail, technology, telecom, government and general. Synthetic data uses relevant entities, categories, units, decision briefs and limitations.
- Twelve SQL challenges adapted to each industry; execution checks cover all 108 challenge/industry combinations. SQL difficulty follows the role's required proficiency.
- Three real Python exercises: filtered totals, missing-value detection and debugging an average. Exercises appear only for relevant Python/cleaning skills. Four datasets check altered values, empty input, zero, missing values and pending records.
- Focused Excel SUMIF and DAX CALCULATE/SUM exercises plus metric calculations. These are intentionally limited formula exercises, not full Excel or Power BI runtimes.
- Twenty-eight authored applied case templates spanning BI, engineering, AI, governance and business skills. Each case includes a selected-industry brief, tool-ready CSV data, hints, an explanation and a self-review rubric.
- Case submissions retain revisions and artifact links. Self-assessed submissions never become automatically verified skills.
- Executable pass records remain distinct by industry; non-SQL exercises also retain career context. The Proof Ledger summarises checked exercises and self-reviewed submissions separately.
- Twelve roadmap lessons now include authored explanations, worked examples and common mistakes. SQL parser/table/column errors include corrective guidance.
- Dark-mode repair for the period-summary card, career headings, input placeholders, dropdown options, step labels, warning text and related panels. New practice surfaces use paired theme colors.

## Validation

Type checking, 102 automated tests and the production build passed. Checks include all 18 roles across nine industries, 108 SQL variants, real Pyodide execution, worker timeout/failure cleanup, backward-compatible persisted state, industry isolation, and WCAG AA normal-text contrast calculations for the reported onboarding areas. The built SQL worker and all generated Python runtime assets were also verified.

Browser visual and end-to-end acceptance remain outstanding: the browser tool could not verify its admin-enforced policy, so it denied access. No alternate browser-control mechanism was used to bypass that restriction. Static contrast calculations are not a complete visual or accessibility audit.

## Runtime and limitations

Python uses Pyodide 314.0.7, copied from the installed npm package to local runtime assets by scripts/prepare-python.mjs. Runtime assets total approximately 15 MB and are requested only when Python is started. The worker has a 45-second startup limit and an eight-second execution limit. Production CSP permits only same-origin runtime-directory downloads from that worker, not account API requests; the main document retains its strict script policy.

Official runtime references: https://pyodide.org/en/stable/usage/quickstart.html and https://pyodide.org/en/stable/usage/webworker.html. Pyodide source and license information: https://github.com/pyodide/pyodide (MPL-2.0 package; bundled Python components retain their respective licenses).

No pandas installation, arbitrary external packages, R, JavaScript, full Power BI/Excel engine, external reviewer assignment or public deployment is included. Applied cases provide downloadable data for work in those native tools where relevant. Client-side tests and learner-entered evidence are practice feedback rather than tamper-proof certification.

The latest 30 non-SQL attempts/submission revisions and 50 SQL attempts are retained. Completed exercise IDs persist separately. SQL records from versions without an industry field are treated as banking records, which was the old dataset. Existing self-entered evidence is preserved.

The production build retains a bundle-size advisory for the main application and SQL worker; lazy loading further learning sections is a future performance improvement.


## Next-exercise and workspace update

A deterministic recommendation now considers the selected career and skill, next unfinished topic, review topics, recent failures, prerequisites and already passed/submitted work. Each recommendation explains why it was chosen and opens the specific exercise. The complete catalogue remains available in a collapsible section.

The focused desktop layout places task reference, dataset and progressive hints beside the editor and feedback; narrow screens stack the panels. Difficulty follows the topic level; displayed time estimates are editorial estimates, not predictions from learner telemetry. SQL also has progressive hints and time estimates.

Validation: 124 tests and the production build passed. Browser acceptance remains outstanding. The four-page user guide in output/pdf/DataPath_Practice_Lab_User_Guide.pdf was rendered and visually inspected on all pages.


## In-app guide and industry missions

Practice Lab now includes a Download user guide (PDF) link to /guides/practice-lab-user-guide.pdf. The guide was updated and all four rendered pages visually reviewed.

A 45-minute intermediate reconciliation mission is available in each of nine industries, mapped to a relevant skill for all 18 careers. Sixteen synthetic export rows include duplicate IDs, late corrections, missing/negative/zero values, cancellation changes and events outside the reporting window. Three numerical checkpoints verify deduplication, eligible-record count and the final total. Learners download the CSV for their own tools or reconcile it manually, then save methodology, interpretation and self-review. This is not an in-browser execution environment for the mission CSV, and correct numeric answers do not independently verify the narrative.

Checkpoint answers persist in submission revisions and restore with the saved narrative. Unfinished mission calculations feed the next-exercise recommendation. Industry-specific context and units remain visible.

Validation: 137 automated tests, type checking and production build passed; tests cover all nine expected reconciliations, all career mappings, checkpoint persistence, recommendation remediation and exact PDF asset matching. Browser visual acceptance remains outstanding due to the browser tool policy-verification failure.
