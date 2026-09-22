# DataPath

See [PRODUCT_GAPS_AND_BUILD_PLAN.md](./PRODUCT_GAPS_AND_BUILD_PLAN.md) for the prioritised public-pilot backlog and the 90-day delivery plan.

A free, bilingual English/Arabic learning platform for data and AI careers. This is a rebuild of banking-fintech-roadmap on its existing React + Express + tRPC + PostgreSQL stack. The old generic 12-week plan and AI curriculum generators have been removed.

## Run locally

Requires Node 22.12+ (tested with Node 24) and pnpm 10.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by the server (normally http://localhost:3000; the next available port is used in development). Guest mode works immediately without an account, database or AI key. Guest progress is automatically saved in that browser; use Settings to export a backup.

## Practice Studio

Practice now follows the selected career, tool interests, skill topic and industry. The catalogue includes SQL execution, real Python exercises, focused Excel SUMIF and DAX measure exercises, metric calculations, and authored applied cases for all 28 skills. Only relevant skills are shown. The nine industries have contextual datasets, units, decision briefs and risk notes.

SQL exercises run against industry-specific vocabulary and three alternate datasets. Python runs locally using self-hosted Pyodide in a disposable worker, with four datasets and an eight-second execution limit after startup. The first Python load can take longer; no external CDN or AI key is needed. `pnpm dev` and `pnpm build` prepare the runtime files automatically.

Excel and DAX support the specific formula forms described in each exercise, not the full desktop products. Applied cases save artifact links, revisions and self-review rubrics; they are not expert-verified. Successful executable exercises attach evidence to the relevant topic. See [PRACTICE_STUDIO_NOTES.md](PRACTICE_STUDIO_NOTES.md) for validation and scope.

## What is included

- 18 career paths, from Data Analyst and Data Engineer to Generative AI Engineer, Data Steward and Data/AI Product Manager.
- Career discovery for undecided learners; optional role description and tool interests; experience, expert follow-up questions, career-change motivation and improvement goals.
- A curated graph of 28 skills and 252 bilingual topics, with three proficiency levels, prerequisites, estimated effort and official learning resources.
- Self-assessment plus optional foundational checks. A failed check restores foundation topics; a correct answer never certifies advanced proficiency.
- A deterministic skill-gap planner using a chosen 1–104 week goal and available weekly hours. Unrealistic deadlines produce a workload comparison rather than silently discarding topics.
- Progress dashboard, nested skill roadmaps, evidence notes, completion tracking and study-session logging.
- Five-question technical checks after every lesson, ten-question assessments after each Beginner/Intermediate/Advanced level, twenty-question skill exams, and cumulative reviews after skill pairs. The SQL path includes authored query, debugging, output, performance and transaction scenarios with immediate explanations. A skill requires 19/20; every wrong answer names and reopens its related lesson.
- Every lesson includes an original bilingual brief, clear outcomes, a hands-on task, official documentation, a topic-specific YouTube search and required evidence before completion.
- Free-only / free-and-paid resource filtering. DataPath itself collects no payment; external paid courses are optional.
- English/Arabic YouTube recommendations chosen for the learner's language, plus a tools setup area linking to the software needed by the selected path.
- Interview studio with authored technical cases, behavioral practice, a timer, answer journal, review rubrics and optional AI feedback.
- Role-family portfolio projects, skill/tool requirements, evidence and explicit completion criteria.
- CV drafting/export, job readiness checklist and application tracker.
- Optional AI coach restricted to the curated topic IDs, plus interview and CV feedback with explicit consent.
- Egyptian-friendly Arabic text and right-to-left layouts while product names and common technical terms such as Python, SQL, JOIN, Index and Query remain in English. Resource languages are labeled honestly.
- Light/dark themes, collapsible navigation, reliable workspace return, editable profile name/photo, guest JSON export/import and learning-data deletion.
- Local email/password accounts with scrypt password hashing and account persistence with conflict detection; the existing OAuth connector remains optional.

## Enable accounts

1. Create a dedicated PostgreSQL database (Neon in production) and a database user restricted to it. For existing MySQL data, follow `TASK_2_POSTGRES.md` before switching connections.
2. Copy `.env.example` to `.env`. Set `DATABASE_URL` (Neon TLS URL in production), optionally `DATABASE_MIGRATION_URL` for direct migration access. Never commit `.env`.
3. Run `pnpm db:migrate` (the existing `pnpm db:push` alias also applies committed migrations). `drizzle.config.ts` loads `.env` automatically.
4. Restart the server. The sign-in button appears when the database is configured. Learners can register with a name, email and password of at least 10 characters. Signed-in users use **Save progress**; unsaved changes remain visibly marked.
5. Optional: configure `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL` and `OAUTH_SERVER_URL` for the existing **Manus-compatible OAuth service**. Register your exact `/api/oauth/callback` URL. This connector requires HTTPS and its existing service contract; entering a Google/Auth0 issuer alone will not work.

There is no shared demo account or identity fallback. Local password accounts work without OAuth. Production OAuth sign-in requires real provider credentials and has not been exercised against an external account in this delivery.

New learning data goes into `learningStates`, keyed by authenticated user ID. PostgreSQL migrations live in `drizzle/postgres`; historical MySQL migrations remain in `drizzle` and must not be run against PostgreSQL. Schema migrations do not transfer MySQL rows. Existing users and legacy workspaces/interview history remain in their original tables; legacy arbitrary 12-week plans are not automatically converted into curated learning evidence. Keep database backups if the old history is needed.

## Enable the AI coach

Set the server-only `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` for the existing chat-completions service. The base URL must support `/v1/chat/completions` and structured JSON responses. The existing adapter defaults to its Forge service when no URL is supplied. Do not place secrets in client variables.

Also configure `AI_MODEL`, verified `AI_INPUT_USD_PER_MILLION` and `AI_OUTPUT_USD_PER_MILLION`, and `AI_MONTHLY_CAP_USD`. See `TASK_5_AI_HARDENING.md` for reservation accounting and timeout/retry behavior.

AI requires a signed-in account, explicit user consent and server-side limits (20 requests per user/hour). Only necessary profile information, the current request, curated topics, and the selected interview rubric or CV fields are sent. The AI cannot write learning state or change the curriculum. Unknown topic IDs in responses are rejected. The response is plain text; model advice still needs learner judgment.

All core planning, assessment, projects, resources and interview practice work without AI. Running AI is an operator cost even though learners pay nothing. Live provider calls were not tested without credentials.

## Production deployment

Recommended initial release: one Node service behind HTTPS plus Neon PostgreSQL, as a public beta. Make guest learning available immediately; enable account sync and AI once their integrations are configured and exercised. This project has not been deployed to a public domain.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm db:migrate  # when enabling accounts / upgrading a database
NODE_ENV=production pnpm start
```

Set `APP_ORIGIN` to the canonical HTTPS origin with no trailing slash. Zod validation rejects invalid configuration before startup. JWT_SECRET is no longer used: sessions are revocable database records. Set `TRUST_PROXY=1` only behind one trusted reverse proxy. Ensure the public hostname cannot bypass that proxy. Use `/api/health` for a process health check (it is not a database readiness check).

The production CSP permits self-hosted assets and, when configured, the public Sentry ingest origin for error reporting. Worker policies remain restricted to local runtime downloads. No session replay is enabled. Request bodies are limited to 128 KB and account state to 60 KB. Export and shorten old notes when approaching the account limit.

General HTTP/auth throttles are process-local; AI request and monthly-budget limits are persisted in PostgreSQL. Use a shared rate-limit store and an edge limit before scaling to multiple instances. Configure database backups, operational monitoring, a support contact and your operator-specific privacy/retention policy before public launch.

## Verify

```sh
pnpm check
pnpm test
pnpm build
```

For real database verification, create a **disposable** database named `datapath_integration_test`, set `DATAPATH_TEST_DATABASE_URL`, and run `pnpm test:integration`. This applies all migrations and checks Arabic persistence, account isolation, optimistic concurrency and deletion isolation. It touches only reserved test IDs 900001/900002 in that explicitly selected database.

See [ARCHITECTURE.md](ARCHITECTURE.md) for design and [VALIDATION.md](VALIDATION.md) for the delivery checks.

## بالعربية

DataPath منصة مجانية لمسارات البيانات والذكاء الاصطناعي. ابدأ بالأوامر `pnpm install --frozen-lockfile` ثم `pnpm dev` وافتح العنوان الذي يظهر. يمكنك استخدام وضع الزائر فوراً دون إعداد قاعدة بيانات أو ذكاء اصطناعي. غيّر اللغة من أعلى الصفحة، ثم اختر الدور والخبرة والمدة والوقت الأسبوعي. تُحفظ بيانات الزائر في المتصفح؛ صدّر نسخة من الإعدادات.

تسجيل الدخول بالبريد وكلمة المرور يحتاج إعداد قاعدة PostgreSQL وسر جلسة قوي فقط، بينما OAuth اختياري. بعد كل موضوع يوجد اختبار، وبعد كل مهارة اختبار أكبر، مع مراجعات تراكمية تعيد نقاط الضعف إلى الخطة. المدرب الذكي اختياري ويحتاج مفتاح خدمة في الخادم. جميع مسارات التعلم والتدريب المنسقة تعمل بدونه.
The product benchmark and the reasoning behind the evidence-first workflow are documented in [`BENCHMARK.md`](./BENCHMARK.md).


## Launch package (Task 6)

See `TASK_6_LAUNCH.md` for Docker, Sentry, smoke-test setup and verification limits. Runtime Python assets are copied from the locked Pyodide package at build time and requested only when Python practice runs. There is no runtime CDN dependency.

The current test baseline is 225 tests; the original 194 remain. Browser smoke and Docker execution are separate acceptance checks and are not included in that count.
