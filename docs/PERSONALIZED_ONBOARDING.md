# Personalized entry flow — 2026-10-06

Implemented locally on `ui/welcome-account-access`.

The welcome screen has sign-in, account creation, and a guest path action. Successful registration opens the guided setup. Existing learners retain their saved workspace. Account capability failures display an unavailable/retry state rather than silently hiding authentication.

First-time setup uses four steps: goal (career or skill, preferred work, coding preference, motivation, industry), starting point (experience and optional per-skill self-ratings), constraints (weekly hours, recommended or custom duration, resource budget, language), and review (suggested role, reasons, skill requirements, workload, override).

Career ranking is deterministic: work-family match, coding preference, and overlap with self-rated skills. Motivation and overall experience are saved as context; they do not independently score roles. Industry changes practice context, not career eligibility. No AI call, job-success probability or verified proficiency claim is made. Interest and coding answers are transient; the accepted role, assessment, constraints, industry and profile persist through the existing save system. The recommendation can be overridden.

Existing makePlan rules determine lessons and prerequisites. Self-ratings may omit lower-level lessons, but do not grant passed assessments or completed topics. Recommended weeks use remaining workload plus 15% at the learner's chosen weekly hours, capped at the existing 104-week profile limit; an infeasible workload remains visibly flagged. Existing learner profile editing retains its detailed controls.

Validation: TypeScript and 318 Vitest tests passed. Production build passed. The signup smoke test was updated for the new flow but not executed. Local browser visual acceptance remains blocked by the previously reported browser URL-policy restriction; no alternate browser surface was used to bypass it. Live account availability still depends on the Vercel DATABASE_URL configuration and applied PostgreSQL migrations. These UI changes have not been deployed.
