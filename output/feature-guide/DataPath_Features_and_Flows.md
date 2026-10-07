# DataPath features and user flows

Product specification and implementation reference for reviewing the application and planning a new interface. Prepared for the DataPath project owner on 6 October 2026.

This document explains what the current application contains, what each feature is for, how learners move through it, and what is actually saved or verified. It describes implemented behavior, including local changes; it does not imply that every feature is available on the deployed site.

### Current status

The most recent reported checks passed 318 automated tests, TypeScript, and a production build. The latest local horizontal-navigation changes remain uncommitted at the time of this reference. Personalized onboarding and the earlier minimal workspace changes are committed locally but have not been confirmed deployed. Visual acceptance of those local changes remains blocked by browser URL policy.

The public landing page was observed online. The account API returned FUNCTION_INVOCATION_FAILED; the supplied Vercel log identified a missing DATABASE_URL. A replacement database connection and production migrations have not been verified. The database password shared during troubleshooting must be rotated; this document contains no credentials.

The UI redesign is paused at the owner’s request. Treat this document as the feature inventory for deciding the next design, not as approval of the current layout.

### Reading guide

Sections cover entry and accounts, recommendation logic, planning, lessons, practice, assessments, progress and review, portfolio projects, career preparation, resources, AI, settings and saving, architecture, and outstanding work. Appendices list the careers, skills, topics and industry contexts directly from the current catalog.

Current catalog inventory: 22 careers, 28 skills, 254 topics, and 9 industry contexts. These are content counts, not measures of course completeness or employment outcomes.

## The complete learner journey

> Welcome → Create account or explore as guest → Goal → Starting skills → Study constraints → Review recommendation → Dashboard → Lesson → Practice → Quiz → Review → Project → Career preparation

Returning learners sign in and restore their saved workspace rather than repeat setup. A learner can edit the path later. Changing a path changes relevant content and views; it is not an instruction to delete existing evidence.

### Welcome and account entry

Introduce the product and make the next choice clear.

> Create account → registration → guided setup; Sign in → existing workspace; Find my path → guest setup.

The local welcome page uses a short introduction and a compact explanation of the next steps. Authentication is currently a dialog rather than an independently routed login page. If account availability fails, the local update keeps account controls visible, explains the failure and offers a retry. Guest exploration remains possible.

Source: client/src/components/CareerLanding.tsx; client/src/pages/Home.tsx

### Guest or account

Let learners try the product while explaining the persistence boundary.

> Guest learning → browser save; Account learning → explicit save → server snapshot.

Guest progress belongs to this browser and origin. Clearing browser data or switching browsers can lose access to it. An account needs working PostgreSQL connectivity. When a new account has no workspace, the app can offer to import existing guest progress; it does not silently overwrite account work.

Source: client/src/lib/guest-storage.ts; client/src/pages/Home.tsx; server/learning-store.ts

## Personalized setup and recommendation

### Four step setup

Collect enough information to propose a curriculum without turning sign-in into a long questionnaire.

> Goal → Starting point → Study time → Recommended path.

Goal collects career versus skill mode, preferred work, coding preference, motivation and industry; skill mode collects a target skill and depth. Starting point collects overall experience and optional per-skill self-ratings. Study time collects weekly hours, automatic or manual duration, resource budget and language. Review shows the recommended role, reasons, skills, workload and an override. New account registration opens this setup automatically.

Source: client/src/components/GuidedSetup.tsx

### Exact ranking rules

Each catalog career receives +8 for matching the preferred work family; +3 for a low-coding preference when neither Python nor Java is required; +3 for a coding-focused preference with engineering or AI careers; +2 for a balanced coding preference with analytics careers; and up to +3 for overlap with self-rated skills. Candidates sort by score, then career ID. The function returns three candidates; the UI initially selects the first and allows any catalog career to be chosen.

This is deterministic matching, not a learned recommendation model. It uses no job-market feed, embedding search or AI call. Scores are not calibrated suitability percentages. Motivation and overall experience are retained as context but do not independently rank careers. Industry changes practice context rather than determining career eligibility. Interest and coding answers are transient; the chosen role, skill assessments, industry and constraints persist in the profile.

### Plan assembly and scheduling

> Chosen goal → skill requirements → prerequisite expansion → topic ordering → starting-level filtering → saved-progress reconciliation → project workload → schedule

requirements() resolves career or focused-skill depth. makePlan() orders skill dependencies, filters topics to required levels above the reported starting level, and accounts for completed topics and topics due for review. A weak existing diagnostic can restore foundations. Self-rating never grants a passed quiz or credential. Automatic duration is ceil(remaining hours × 1.15 / weekly hours), bounded to 1–104 weeks; it preserves the learner’s weekly commitment. An infeasible target is shown rather than silently increasing hours.

Sources: shared/path-recommendation.ts; shared/catalog.ts; shared/learning.ts.

## Dashboard roadmap and lessons

### Learning overview

Provide a clear next action and a view of weekly activity.

> Open overview → continue next lesson or introductory unit → return to overview.

The next topic is selected from unfinished topics with satisfied prerequisites. Introductory learning takes precedence for new learners. Weekly activity uses logged study sessions. The local design groups weekly planning and detailed evidence into expandable sections and retains practice, review and project shortcuts.

Source: client/src/components/LearningDashboard.tsx; shared/dashboard-progress.ts; shared/intro-progress.ts

### Weekly plan and catch up

Translate the learning path into activities that fit the time budget.

> Review suggested weekly activities → start lesson, practice or project → adjust pace when needed.

WeeklyStudyPlan selects activities from the current learning state. Catch-up controls preview a revised pace without treating unfinished work as failure or resetting learning history. Estimated time is planning guidance, not a job-readiness deadline.

Source: client/src/components/WeeklyStudyPlan.tsx; client/src/components/CatchUpPace.tsx; shared/weekly-plan.ts; shared/catch-up.ts

### Roadmap and lesson reading

Explain what to study and how topics connect.

> Choose skill → expand level → open topic → read explanation and example → practice → quiz.

The roadmap groups topics by skill and level, includes prerequisites and target depth, and links to lessons and assessments. Lessons combine authored material, examples and relevant resource links. Introductory units explain basic data concepts before independent labs. Content depth and Arabic coverage vary; catalog presence does not mean a fully authored course for every topic.

Source: client/src/pages/Home.tsx; client/src/components/LessonSteps.tsx; shared/authored-lessons.ts; shared/learning.ts

## Practice lab

### Exercise discovery

Show practice relevant to the accepted path and industry.

> Open lab → recommended exercise or browse → filter by skill or search → select exercise → attempt → inspect feedback.

The catalog combines SQL challenges and other practice formats within path requirements. Recommendation logic considers the current topic and retained attempts. Difficulty and time labels are estimates. Focus mode reduces surrounding controls. Engine startup failures are unavailable states rather than incorrect answers and do not count as learner attempts.

Source: client/src/components/PracticeHub.tsx; shared/practice-recommendation.ts; shared/practice.ts

### SQL workbench

Practise real PostgreSQL-style querying on synthetic industry data.

> Read task and tables → enter one read-only query → run → inspect rows and checks → revise or pass.

PGlite runs PostgreSQL in a browser Web Worker. Datasets are seeded locally; queries are restricted and execute through a read-only role/transaction. Authenticated server verification reruns the submitted SQL in a disposable server worker before creating server-verified evidence. The practice database is separate from the account database. No learner query is run against Neon account tables.

Source: shared/sql-engine.ts; shared/sql-lab.ts; server/proof-sql-runner.ts; server/proof-grading.ts

### Python practice

Practise executable data transformations and calculations.

> Read function contract → implement solve → run sample and alternate checks → inspect failed cases → revise.

Self-hosted Pyodide loads lazily in a browser worker. Exercises check results on multiple datasets and provide feedback/hints. A browser pass is practice evidence, not independent server-certified Python execution. Runtime loading failure is separated from learner syntax or logic errors.

Source: shared/python-practice.ts; shared/python-feedback.ts; client/public/python-worker.js

### Other practice formats

Support data work beyond SQL and Python.

> Select relevant task → calculate, write, design or use an external tool → check available criteria → record evidence.

Formats include checked spreadsheet/calculation work, metric reasoning, decision briefs, modeling and pipeline cases, and industry missions. Power BI, Tableau, dbt, cloud and distributed-system tasks may require external tools. Written artifacts and checklists are not equivalent to executing or verifying those external environments.

Source: shared/practice.ts; shared/industry-challenge.ts

## Assessment progress and review

### Quizzes and skill assessments

Check understanding at topic, level, skill and cumulative-review stages.

> Complete required learning → answer quiz → inspect result → revisit weak topics → retry or move on.

Question banks and answer keys are authored in shared code. Server grading reconstructs the expected answer set and rejects mismatched submissions. Server thresholds are 80% for topic, level and cumulative quizzes and 95% for skill quizzes. Questions are visible to the client and are not proctored; a server-graded result is not an independent professional certification.

Source: shared/learning.ts; shared/quiz-progress.ts; server/proof-grading.ts

### Progress and evidence

Separate learning activity from demonstrated and verified work.

> Open progress → inspect skills, quiz results, practice and project evidence → export selected summaries.

Exercise attempts, latest topic quiz results and self-reviewed project records represent different evidence categories. Counts are not interchangeable completion percentages. Skill matrices summarize current-path evidence. Export selection produces a summary without automatically publishing private notes, personal identifiers or interview answers.

Source: shared/progress-evidence.ts; shared/proof-export.ts; client/src/pages/Home.tsx

### Spaced review

Return learners to material that needs reinforcement.

> Pass prerequisite skills → review becomes available → complete cumulative check → weak topics return to learning.

Review readiness groups required skills in pairs, retaining a final single skill. Missing prerequisite passes keep a review locked and are shown to the learner. Review filters distinguish ready, scheduled and locked items. This is authored scheduling logic, not a model trained on individual memory decay.

Source: shared/review-readiness.ts; shared/review-schedule.ts; client/src/pages/Home.tsx

### Public proof page

Publish selected server-verified evidence with learner control.

> Earn supported verified evidence → choose handle → preview → enable visibility → share → hide or disable later.

Public proof is served at /p/:handle. The server controls credential issuance and binds settings to the authenticated user. Only selected public fields and credentials should be exposed. Public pages explicitly distinguish server checking from proctored certification. Guest/self-reported results do not become verified simply by editing local state.

Source: server/proof-store.ts; server/proof-page.ts; server/routers.ts; drizzle/schema.ts

## Projects and career preparation

### Portfolio projects

Turn a learning path into a concrete demonstration.

> Open project → read brief and milestones → obtain synthetic starter data → complete work → add evidence and links → self-review → export.

Project blueprints supply scoped deliverables and criteria. Completion depends on learner-entered evidence and self-review; the app does not automatically inspect an external dashboard, repository or artifact. Exported project material supports a portfolio but does not prove professional experience.

Source: client/src/components/ProjectBlueprint.tsx; client/src/components/ProjectChecklist.tsx; shared/project-blueprint.ts; shared/learning.ts

### Interview studio

Practise explaining reasoning for the selected direction.

> Choose a question or case → draft answer → use rubric and follow-up → optionally request AI feedback → retain/export journal.

Authored questions and contextual cases work without AI. Optional AI feedback requires an authenticated account, configuration and consent. There is no verified recruiter assessment or guarantee of hiring outcomes.

Source: client/src/components/InterviewGuide.tsx; shared/interview-cases.ts; shared/interview-export.ts; server/routers.ts

### CV and applications

Organize career preparation and application follow-up.

> Enter CV summary, achievements and links → review/export → add an application → update status and follow-up.

Application statuses include saved, applied, interview, offer and closed. Records are learner-maintained. The toolkit is not an applicant-tracking integration, automatic job application service or live job board. Optional AI may improve wording but must not invent qualifications or work history.

Source: client/src/pages/Home.tsx; shared/learning.ts; server/routers.ts

### Resources and tool setup

Help learners find supporting material and prepare external tools.

> Select skill/resource → inspect language/cost → open external material; select tool → follow setup guidance → return to learning.

The resource library uses curated links. Availability, external pricing and provider content may change independently of DataPath. Tool setup guidance does not install software on the learner’s behalf or create cloud accounts.

Source: client/src/pages/Home.tsx; shared/catalog.ts

## Optional AI capabilities

### Learning coach

Explain gaps, recommend existing topics and support interview/CV work.

> Open coach → enter request → consent to sharing relevant context → server authenticates → reserve budget → call provider → validate response → display feedback.

The coach can return plain-text guidance and up to five supplied topic IDs. It does not create a new curriculum, change the plan automatically, award proficiency or issue credentials. Provider output is parsed and checked against allowed topic IDs. There is no retrieval/vector database or bespoke trained model in this flow.

Source: server/routers.ts; server/_core/llm.ts

### Data sent and safeguards

The bounded prompt can include the request, path context, goals, expertise, assessment data and selected curriculum topics. Interview mode includes an authored question; CV mode includes CV content. Users should understand that this context leaves the app for the configured provider. Consent is required by the endpoint, but it is not a guarantee about a provider’s retention policy.

The API uses a Chat-Completions-compatible interface, an explicitly configured model, timeout and at most one retry. PostgreSQL accounting reserves for two attempts before calling the provider. Shared accounting enforces a per-user hourly allowance and an application-wide monthly budget. Missing or uncertain token usage retains conservative charges. Provider prices must be configured correctly; application accounting is not a substitute for a provider-side hard billing limit.

AI is optional. Without configuration, core lessons, planning and practice remain available. Production provider connectivity, output quality and accuracy have not been verified. The path-selection recommender does not depend on this AI service.

Sources: server/ai-config.ts; server/ai-budget.ts; server/_core/llm.ts; server/routers.ts.

## Saving account settings and recovery

### Account lifecycle

Keep progress scoped to its owner.

> Register/login → server creates opaque session → cookie authenticates requests → save/load own state → logout or revoke all sessions.

Passwords use salted scrypt. Session tokens are random and stored as hashes in PostgreSQL. New sessions expire after 24 hours. Production cookies are httpOnly and Secure with SameSite=Lax. Earlier long-lived sessions were not bulk-revoked by the hardening change. Email ownership verification and password reset are still missing.

Source: server/sessions.ts; server/routers.ts; server/_core/cookies.ts

### Save conflicts

Prevent one tab from silently overwriting another tab’s saved work.

> Load snapshot and revision → edit → save with expected revision → update on match or reject on conflict.

The server uses authenticated user identity, not a client-selected owner. A stale revision returns a conflict; users can export local work and reload before retrying. This is optimistic concurrency, not an automatic field-level merge. The learning snapshot has a 60 KB server limit.

Source: server/learning-store.ts; server/persistence.test.ts; client/src/pages/Home.tsx

### Settings and backups

Let learners maintain their profile and control local/public data.

> Open settings → edit profile/theme/language or path → export/import backup → review account and public-proof controls.

Imports pass state validation. Profile settings include a display name and bounded avatar data. Guest imports are explicit. Export files can contain personal learning material and must be handled as private. Account logout failures are surfaced rather than falsely claiming the session ended.

Source: client/src/pages/Home.tsx; shared/learning.ts; client/src/lib/guest-storage.ts

## Architecture and implementation boundaries

> React browser workspace → same-origin tRPC API → Express server → PostgreSQL

> Browser SQL editor → PGlite worker → practice result; Browser Python editor → Pyodide worker → practice result

> Authenticated SQL proof → server worker → checked result → verified credential → optional public page

Technology: TypeScript, React 19, Vite 7, Tailwind 4, Radix-backed UI components, Lucide icons, TanStack Query, tRPC 11, Express 4, Zod, Drizzle and node-postgres. Vitest provides automated domain tests; Playwright scripts cover selected browser journeys. Vercel packaging separates static assets from the Node backend function; Docker remains another deployment option.

Catalog and curriculum are source-controlled TypeScript, primarily shared/catalog.ts and shared/learning.ts. PostgreSQL stores accounts, snapshots and server evidence, not the curriculum authoring source. Adding or updating content requires a code change and deployment. Most internal screen navigation is React state inside Home.tsx rather than independent URL routes.

### Current database tables

users; localAccounts; sessions; learningStates; verifiedCredentials; aiBudgets; aiRequests; rateLimitBuckets; workspaces; interviewQuestions; studySessions; skillProgressHistory. The last four include legacy storage helpers; their presence does not mean every current UI action writes to each table. Current account learning primarily uses the validated learning-state snapshot.

### API groups

auth: me, login, register, logout, revokeAllSessions. datapath: catalog, capabilities, load, save, remove, coach. grading: sql, quiz. proof: enable, disable, settings, preview, setTargetVisibility, setCredentialVisibility, getPublic. Account and grading writes use protected procedures; public catalog/capability reads and intentionally public proof reads do not require an account.

Sources: package.json; client/src/App.tsx; server/routers.ts; drizzle/schema.ts; scripts/build-vercel.ts; docs/VERCEL_DEPLOYMENT.md.

## Limits and decisions for the next design

Confirmed local implementation is not the same as verified production availability. The known deployment failure requires a valid DATABASE_URL and applied migrations. Live signup, saving, SQL verification, Python downloads and public proof must be checked after deployment. Do not use a preview connected to real learner production data for destructive tests.

The latest reported production dependency audit had zero advisories; that is a point-in-time package scan, not a penetration test. Browser visual verification of the recent local design was not completed. The updated signup smoke script was not rerun after onboarding changed. No claims of live AI accuracy, full mobile coverage or universal course completeness are made.

### Missing or limited features

Email verification and password recovery; durable storage of interest/coding questionnaire answers; a curriculum content-management interface; empirically evaluated career matching; full language/content parity; automated review of arbitrary external projects; production backup restoration acceptance; and verified end-to-end cloud deployment. These are gaps or future work, not shipped functionality.

### Suggested design structure for review

Entry: explain the product and offer sign-in, account creation and guest exploration. Setup: one focused question group at a time. Learning: one primary next action, with roadmap and planning available when needed. Practice: clearly separate instructions, input and results. Progress: distinguish activity, self-review and verified evidence. Career: keep projects, interview preparation and applications understandable without implying external integrations.

This proposal preserves functional scope. No further UI edits were made while producing this reference. Screenshots of the disputed layout are deliberately not presented as an approved design.

## Career catalog

### Data Analyst

Turn data into clear business decisions.

Family: analytics. Required skills: SQL level 2, Excel level 2, Statistics level 2, Data cleaning level 2, Power BI level 2, Data storytelling level 2, Business analysis level 1.

### BI Analyst

Build trusted metrics and dashboards.

Family: analytics. Required skills: SQL level 2, Data modeling level 2, Power BI level 3, Excel level 2, Data quality level 1, Data storytelling level 2.

### Data Business Analyst

Connect stakeholder needs to data solutions.

Family: business. Required skills: Business analysis level 3, Excel level 2, SQL level 1, Data storytelling level 3, Data product management level 1, Data modeling level 1.

### Product Analyst

Understand behavior and evaluate experiments.

Family: analytics. Required skills: SQL level 3, Statistics level 3, Experimentation level 3, Python level 2, Data storytelling level 2, Data product management level 2.

### Analytics Engineer

Build tested, reusable analytical models.

Family: engineering. Required skills: SQL level 3, Data modeling level 3, dbt level 3, Git, Linux & Docker level 2, Data quality level 2, Cloud platforms level 2.

### Data Engineer

Deliver reliable pipelines and data platforms.

Family: engineering. Required skills: SQL level 3, Python level 3, Data modeling level 2, ETL / ELT level 3, Airflow level 2, Apache Spark level 2, Streaming / Kafka level 2, Cloud platforms level 2, Git, Linux & Docker level 2.

### Cloud Data Engineer

Design resilient cloud data workloads.

Family: engineering. Required skills: SQL level 2, Python level 2, ETL / ELT level 3, Cloud platforms level 3, Git, Linux & Docker level 3, Data architecture level 2, Data governance level 1.

### Data Architect

Design systems, standards and integration patterns.

Family: engineering. Required skills: SQL level 3, Data modeling level 3, Data architecture level 3, Cloud platforms level 3, Data governance level 2, ETL / ELT level 2, Business analysis level 2.

### Database Administrator

Protect availability, recovery and performance.

Family: engineering. Required skills: SQL level 3, Database administration level 3, Git, Linux & Docker level 2, Cloud platforms level 2, Privacy & responsible AI level 2, Data modeling level 2.

### Data Scientist

Use statistics and models to solve problems.

Family: ai. Required skills: Python level 3, SQL level 2, Statistics level 3, Data cleaning level 2, Machine learning level 3, Experimentation level 2, Data storytelling level 2.

### Machine Learning Engineer

Build and deploy reliable prediction systems.

Family: ai. Required skills: Python level 3, Statistics level 2, Machine learning level 3, Deep learning level 2, MLOps level 3, Git, Linux & Docker level 3, Cloud platforms level 2.

### AI Engineer

Build useful AI applications with evaluation.

Family: ai. Required skills: Python level 3, Machine learning level 2, Generative AI / RAG level 3, Git, Linux & Docker level 2, Cloud platforms level 2, Privacy & responsible AI level 2, MLOps level 2.

### Generative AI Engineer

Build retrieval, evaluation and safe AI workflows.

Family: ai. Required skills: Python level 3, Deep learning level 2, Generative AI / RAG level 3, MLOps level 2, Git, Linux & Docker level 2, Privacy & responsible AI level 3.

### MLOps Engineer

Operate and monitor production models.

Family: ai. Required skills: Python level 3, Machine learning level 2, MLOps level 3, Cloud platforms level 3, Git, Linux & Docker level 3, ETL / ELT level 2.

### Data Governance Specialist

Create ownership, policies and trusted data.

Family: governance. Required skills: Data governance level 3, Data quality level 3, Privacy & responsible AI level 3, Business analysis level 2, Data modeling level 1, SQL level 1.

### Data Quality Analyst

Measure, investigate and prevent data defects.

Family: governance. Required skills: SQL level 2, Data cleaning level 3, Data quality level 3, Python level 2, Data governance level 2, Data storytelling level 2.

### Data Steward

Maintain definitions, ownership and quality.

Family: governance. Required skills: Data governance level 3, Data quality level 2, Business analysis level 2, Privacy & responsible AI level 2, Excel level 2, SQL level 1.

### Data / AI Product Manager

Lead useful, responsible data and AI products.

Family: business. Required skills: Data product management level 3, Business analysis level 3, Data storytelling level 3, Experimentation level 2, Data governance level 2, Generative AI / RAG level 1, Privacy & responsible AI level 2.

### Marketing Data Analyst

Measure funnels, campaigns and retention with validated experiments.

Family: analytics. Required skills: SQL level 3, Statistics level 2, Experimentation level 3, Excel level 2, Data storytelling level 3, Power BI level 2.

### Risk Data Analyst

Analyze risk indicators, validate assumptions and document controls.

Family: analytics. Required skills: SQL level 3, Python level 2, Statistics level 3, Data quality level 3, Data governance level 2, Data storytelling level 2.

### BI Developer

Build governed semantic models and reliable reporting products.

Family: analytics. Required skills: SQL level 3, Data modeling level 3, Power BI level 3, dbt level 2, Data quality level 2, Data storytelling level 2.

### Data Platform Engineer

Build reliable shared data infrastructure, orchestration and access controls.

Family: engineering. Required skills: SQL level 3, Python level 3, ETL / ELT level 3, Cloud platforms level 3, Airflow level 3, Git, Linux & Docker level 3, Data governance level 2.

## Skill and topic catalog

Levels 1, 2 and 3 represent foundations, intermediate and advanced catalog depth. Hours below are authored estimates. The personalized plan selects a subset and may include prerequisite skills.

### SQL

Level 1: SELECT and WHERE (3 h); GROUP BY and HAVING (3 h); INNER and LEFT JOIN (3 h).

Level 2: Subqueries and CTEs (5 h); Window functions (5 h); NULLs and deduplication (5 h).

Level 3: Execution plans (8 h); Indexes and optimization (8 h); Transactions and isolation (8 h); Recursive queries and cycle safety (8 h).

Resource: PostgreSQL tutorial — https://www.postgresql.org/docs/current/tutorial.html

### Python

Level 1: Variables and collections (3 h); Functions and control flow (3 h); Files and exceptions (3 h).

Level 2: Pandas transformations (5 h); Testing functions (5 h); APIs and environments (5 h).

Level 3: Profiling and memory (8 h); Packaging reusable code (8 h); Concurrency patterns (8 h); Streaming data and lazy pipelines (8 h).

Resource: Python tutorial — https://docs.python.org/3/tutorial/

### Excel

Level 1: Tables and data types (3 h); Formulas and references (3 h); Sorting and filtering (3 h).

Level 2: Pivot tables (5 h); Lookups and validation (5 h); Power Query transformations (5 h).

Level 3: Data models and measures (8 h); Scenario analysis (8 h); Auditable reporting (8 h).

Resource: Microsoft Excel help — https://support.microsoft.com/en-us/excel

### Statistics

Level 1: Distributions and summaries (3 h); Sampling and bias (3 h); Probability fundamentals (3 h).

Level 2: Confidence intervals (5 h); Hypothesis tests (5 h); Regression and assumptions (5 h).

Level 3: Causal inference (8 h); Bayesian reasoning (8 h); Time series diagnostics (8 h).

Resource: OpenIntro Statistics — https://www.openintro.org/book/os/

### Data cleaning

Level 1: Missing values (3 h); Types and parsing (3 h); Duplicates and outliers (3 h).

Level 2: Validation rules (5 h); Reproducible transformations (5 h); Reconciliation (5 h).

Level 3: Quality monitoring (8 h); Schema drift (8 h); Root cause analysis (8 h).

Resource: Pandas tutorials — https://pandas.pydata.org/docs/getting_started/intro_tutorials/

### Power BI

Level 1: Import and transform (3 h); Relationships and grain (3 h); Visual selection (3 h).

Level 2: DAX measures (5 h); Filter context (5 h); Accessible dashboards (5 h).

Level 3: Row-level security (8 h); Performance tuning (8 h); Deployment and refresh (8 h).

Resource: Microsoft Learn Power BI — https://learn.microsoft.com/en-us/training/powerplatform/power-bi

### Tableau

Level 1: Connect data (3 h); Dimensions and measures (3 h); Charts and filters (3 h).

Level 2: Calculated fields (5 h); Table calculations (5 h); Dashboard actions (5 h).

Level 3: Level of detail expressions (8 h); Extract performance (8 h); Governed publishing (8 h).

Resource: Tableau documentation — https://help.tableau.com/current/pro/desktop/en-us/default.htm

### Data storytelling

Level 1: Audience and decision (3 h); Chart selection (3 h); Context and comparison (3 h).

Level 2: Narrative structure (5 h); Uncertainty communication (5 h); Executive summaries (5 h).

Level 3: Persuasive recommendations (8 h); Stakeholder critique (8 h); Decision impact measurement (8 h).

Resource: UK Analysis Function chart guidance — https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts/

### Business analysis

Level 1: Stakeholder discovery (3 h); Requirements and scope (3 h); KPIs and metric definitions (3 h).

Level 2: Process mapping (5 h); Acceptance criteria (5 h); Prioritization and tradeoffs (5 h).

Level 3: Benefits realization (8 h); Operating models (8 h); Strategy and measurement (8 h).

Resource: IIBA business analysis articles — https://www.iiba.org/business-analysis-blogs/

### Experimentation

Level 1: Hypotheses and metrics (3 h); Random assignment (3 h); Control groups (3 h).

Level 2: Power and sample size (5 h); Guardrail metrics (5 h); Experiment analysis (5 h).

Level 3: Sequential testing (8 h); Interference and bias (8 h); Causal designs (8 h).

Resource: NIST experimental design — https://www.itl.nist.gov/div898/handbook/pri/pri.htm

### Data modeling

Level 1: Entities and keys (3 h); Normalization (3 h); Grain and relationships (3 h).

Level 2: Star schemas (5 h); Slowly changing dimensions (5 h); Semantic models (5 h).

Level 3: Domain modeling (8 h); Schema evolution (8 h); Model performance (8 h).

Resource: Microsoft star schema guidance — https://learn.microsoft.com/en-us/power-bi/guidance/star-schema

### ETL / ELT

Level 1: Batch ingestion (3 h); Transform and load (3 h); Idempotency (3 h).

Level 2: Incremental loads (5 h); Backfills and retries (5 h); Data contracts (5 h).

Level 3: Change data capture (8 h); Lineage and observability (8 h); Recovery design (8 h).

Resource: Microsoft ETL guide — https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/etl

### dbt

Level 1: Sources and models (3 h); References and DAGs (3 h); Schema tests (3 h).

Level 2: Incremental models (5 h); Snapshots (5 h); Documentation and lineage (5 h).

Level 3: Macros and packages (8 h); CI and deployment (8 h); Model optimization (8 h).

Resource: dbt documentation — https://docs.getdbt.com/docs/build/projects

### Airflow

Level 1: DAGs and tasks (3 h); Scheduling (3 h); Task dependencies (3 h).

Level 2: Retries and backfills (5 h); Connections and secrets (5 h); Testing DAGs (5 h).

Level 3: Executor selection (8 h); Monitoring and SLAs (8 h); Scaling orchestration (8 h).

Resource: Apache Airflow tutorials — https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html

### Apache Spark

Level 1: DataFrames and schemas (3 h); Transformations and actions (3 h); Partitions (3 h).

Level 2: Joins and shuffles (5 h); Caching (5 h); Spark SQL (5 h).

Level 3: Skew optimization (8 h); Structured streaming (8 h); Cluster tuning (8 h).

Resource: Apache Spark guide — https://spark.apache.org/docs/latest/sql-getting-started.html

### Streaming / Kafka

Level 1: Topics and partitions (3 h); Producers and consumers (3 h); Offsets (3 h).

Level 2: Consumer groups (5 h); Delivery semantics (5 h); Schema compatibility (5 h).

Level 3: Stream processing (8 h); Failure recovery (8 h); Capacity planning (8 h).

Resource: Apache Kafka documentation — https://kafka.apache.org/documentation/

### Cloud platforms

Level 1: Storage and compute (3 h); Identity and access (3 h); Cost fundamentals (3 h).

Level 2: Warehouses and lakes (5 h); Network boundaries (5 h); Infrastructure as code (5 h).

Level 3: Resilience and DR (8 h); Cost optimization (8 h); Architecture tradeoffs (8 h).

Resource: Microsoft Learn Azure — https://learn.microsoft.com/en-us/training/azure/

### Git, Linux & Docker

Level 1: Git commits and branches (3 h); Shell and files (3 h); Container basics (3 h).

Level 2: Code review and tests (5 h); Images and networks (5 h); CI pipelines (5 h).

Level 3: Reproducible deployments (8 h); Supply chain controls (8 h); Incident response (8 h).

Resource: Docker getting started — https://docs.docker.com/get-started/

### Machine learning

Level 1: Train and test splits (3 h); Baselines and metrics (3 h); Regression and classification (3 h).

Level 2: Cross validation (5 h); Feature engineering (5 h); Imbalance and calibration (5 h).

Level 3: Explainability and fairness (8 h); Hyperparameter search (8 h); Leakage and robustness (8 h).

Resource: scikit-learn user guide — https://scikit-learn.org/stable/user_guide.html

### Deep learning

Level 1: Tensors and gradients (3 h); Neural networks (3 h); Training loops (3 h).

Level 2: Regularization (5 h); Embeddings and attention (5 h); Transfer learning (5 h).

Level 3: Distributed training (8 h); Model compression (8 h); Evaluation and ablations (8 h).

Resource: PyTorch tutorials — https://pytorch.org/tutorials/

### Generative AI / RAG

Level 1: Tokens and context (3 h); Prompt design (3 h); Structured outputs (3 h).

Level 2: Embeddings and retrieval (5 h); RAG evaluation (5 h); Tool calling (5 h).

Level 3: Prompt injection defenses (8 h); Quality and cost evaluation (8 h); Human oversight (8 h).

Resource: Hugging Face LLM course — https://huggingface.co/learn/llm-course/chapter1/1

### MLOps

Level 1: Experiment tracking (3 h); Model registry (3 h); Serving APIs (3 h).

Level 2: Model pipelines (5 h); Monitoring and drift (5 h); Deployment strategies (5 h).

Level 3: Feature stores (8 h); Rollback and retraining (8 h); Production reliability (8 h).

Resource: MLflow documentation — https://mlflow.org/docs/latest/index.html

### Data governance

Level 1: Ownership and stewardship (3 h); Glossaries and catalogs (3 h); Classification (3 h).

Level 2: Retention and access (5 h); Lineage and policies (5 h); Quality accountability (5 h).

Level 3: Governance operating model (8 h); Risk and audit evidence (8 h); Governance metrics (8 h).

Resource: Microsoft Purview governance — https://learn.microsoft.com/en-us/purview/data-governance-overview

### Data quality

Level 1: Quality dimensions (3 h); Profiling (3 h); Rule definition (3 h).

Level 2: Automated checks (5 h); Issue triage (5 h); Quality scorecards (5 h).

Level 3: Quality SLAs (8 h); Prevention controls (8 h); Continuous monitoring (8 h).

Resource: Great Expectations documentation — https://docs.greatexpectations.io/docs/core/introduction/

### Data architecture

Level 1: Workload requirements (3 h); System boundaries (3 h); Storage patterns (3 h).

Level 2: Lakehouse and warehouse (5 h); Integration patterns (5 h); Security boundaries (5 h).

Level 3: Consistency tradeoffs (8 h); Architecture decisions (8 h); Capacity and resilience (8 h).

Resource: Microsoft data architecture guide — https://learn.microsoft.com/en-us/azure/architecture/data-guide/

### Database administration

Level 1: Roles and permissions (3 h); Backups and restores (3 h); Database monitoring (3 h).

Level 2: Index maintenance (5 h); Replication (5 h); Lock analysis (5 h).

Level 3: Recovery drills (8 h); High availability (8 h); Capacity and upgrades (8 h).

Resource: PostgreSQL administration — https://www.postgresql.org/docs/current/admin.html

### Data product management

Level 1: Problem discovery (3 h); User outcomes (3 h); Product metrics (3 h).

Level 2: Roadmap prioritization (5 h); Experiment decisions (5 h); Delivery and adoption (5 h).

Level 3: Product strategy (8 h); AI risk evaluation (8 h); Portfolio decisions (8 h).

Resource: GOV.UK agile delivery — https://www.gov.uk/service-manual/agile-delivery

### Privacy & responsible AI

Level 1: Data minimization (3 h); Consent and purpose (3 h); Bias awareness (3 h).

Level 2: Privacy by design (5 h); Risk assessments (5 h); Access reviews (5 h).

Level 3: AI risk management (8 h); Assurance evidence (8 h); Incident accountability (8 h).

Resource: NIST AI RMF — https://www.nist.gov/itl/ai-risk-management-framework

## Industry contexts

### Banking

Learn how deposits, lending, payments, credit risk and regulatory reporting create and use data.

Example metrics: approval rate, default rate, net interest margin, fraud loss, customer lifetime value.

### Finance & investment

Understand financial statements, markets, portfolios, forecasting and the controls behind financial decisions.

Example metrics: revenue growth, margin, cash flow, return, volatility.

### Marketing & advertising

Connect acquisition, campaign, channel and customer behavior data to profitable growth decisions.

Example metrics: conversion rate, CAC, ROAS, retention, incremental lift.

### Healthcare

Work with clinical, operational and claims data while protecting patient safety and confidentiality.

Example metrics: readmission rate, length of stay, utilisation, claim denial rate, care outcome.

### Retail & e-commerce

Use product, order, inventory and customer data to improve commercial and fulfilment decisions.

Example metrics: conversion rate, average order value, sell-through, stockout rate, repeat purchase rate.

### Technology & SaaS

Measure digital products, subscriptions and platform reliability across the customer lifecycle.

Example metrics: activation, retention, MRR, churn, service reliability.

### Telecommunications

Connect network, billing and customer data to improve service quality and retention.

Example metrics: churn, ARPU, dropped-call rate, network availability, first-call resolution.

### Government & public services

Use administrative and service data to improve equitable delivery, accountability and policy decisions.

Example metrics: service completion, processing time, coverage, cost per case, equity gap.

### Not sure / cross-industry

Build portable data skills using common business processes before specialising in one industry.

Example metrics: quality, cycle time, cost, growth, customer satisfaction.

Source: shared/catalog.ts. Industry adaptations also use shared/industry-practice.ts, shared/sql-context.ts and shared/industry-challenge.ts. Examples are educational and synthetic; they are not connected to real industry datasets or live company systems.
