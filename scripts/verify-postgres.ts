/** Integration check. Run ONLY against an explicitly supplied disposable database. */
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import type { TrpcContext } from "../server/_core/context";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { newState } from "../shared/learning";
const url = process.env.DATAPATH_TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith("/datapath_integration_test"))
  throw new Error(
    "Set DATAPATH_TEST_DATABASE_URL to a disposable database named datapath_integration_test"
  );
process.env.DATABASE_URL = url;
process.env.JWT_SECRET = randomBytes(32).toString("hex");
const conn = new Pool({ connectionString: url });
await migrate(drizzle(conn), { migrationsFolder: "./drizzle/postgres" });
await migrate(drizzle(conn), { migrationsFolder: "./drizzle/postgres" });
const db = await import("../server/db");
const { loadLearning, saveLearning, deleteLearning } = await import(
  "../server/learning-store"
);
const prefix = "task2-" + Date.now();
try {
  await deleteLearning(900001);
  await deleteLearning(900002);
  const state = newState();
  state.onboarded = true;
  state.profile.language = "ar";
  state.cv.summary = "ملخص مهني تجريبي";
  assert.deepEqual(await saveLearning(900001, state, 0), { revision: 1 });
  const loaded = await loadLearning(900001);
  assert.equal(loaded?.state.cv.summary, "ملخص مهني تجريبي");
  assert.equal(await loadLearning(900002), null);
  await assert.rejects(
    () => saveLearning(900001, state, 0),
    (e: any) => e.code === "CONFLICT"
  );
  state.completed = ["sql-1"];
  state.evidence["sql-1"] = "Validated a SELECT query";
  assert.deepEqual(await saveLearning(900001, state, 1), { revision: 2 });
  await assert.rejects(
    () => saveLearning(900001, state, 1),
    (e: any) => e.code === "CONFLICT"
  );
  await saveLearning(900002, newState(), 0);
  await deleteLearning(900001);
  assert.equal(await loadLearning(900001), null);
  assert.ok(await loadLearning(900002));
  const first = await db.createLocalAccount({
    openId: prefix,
    name: "مستخدم",
    email: prefix + "@example.test",
    passwordHash: "scrypt$preserved$hash",
  });
  const account = await db.getLocalAccount(prefix + "@example.test");
  assert.equal(account?.passwordHash, "scrypt$preserved$hash");
  assert.equal(account?.userId, first.userId);
  await assert.rejects(() =>
    db.createLocalAccount({
      openId: prefix + "-duplicate",
      name: "Duplicate",
      email: prefix + "@example.test",
      passwordHash: "unused",
    })
  );
  assert.equal(
    await db.getUserByOpenId(prefix + "-duplicate"),
    undefined,
    "duplicate account must roll back the user insert"
  );
  await db.upsertUser({ openId: prefix, name: "Updated name" });
  assert.equal((await db.getUserByOpenId(prefix))?.name, "Updated name");
  const workspace = {
    profileJson: "{}",
    skillsJson: "[]",
    projectsJson: "[]",
    sqlJson: "{}",
    studyLogJson: "[]",
    weeklyGoal: 5,
    theme: "light",
    timerRemaining: 1500,
    timerSessions: 0,
  };
  await db.saveWorkspace(first.userId, workspace);
  const before = await db.getWorkspace(first.userId);
  await db.saveWorkspace(first.userId, { ...workspace, theme: "dark" });
  const after = await db.getWorkspace(first.userId);
  assert.equal(after?.theme, "dark");
  assert.ok(
    after!.updatedAt > before!.updatedAt,
    "trigger must update timestamp"
  );
  const question = {
    questionKey: "sql",
    category: "Technical",
    question: "Why?",
    why: "Reason",
    followUp: "How?",
    answerNote: "First",
  };
  await db.saveInterviewQuestion(first.userId, question);
  await db.saveInterviewQuestion(first.userId, {
    ...question,
    answerNote: "Revised",
  });
  const questions = await db.listSavedQuestions(first.userId);
  assert.equal(questions.length, 1);
  assert.equal(questions[0].answerNote, "Revised");
  await db.deleteSavedQuestion(first.userId + 1, "sql");
  assert.equal((await db.listSavedQuestions(first.userId)).length, 1);
  await db.recordStudySession(first.userId, "2026-09-21", 25);
  assert.equal((await db.listStudySessions(first.userId))[0].minutes, 25);
  await db.recordSkillChanges(first.userId, [
    { skillId: 1, skillName: "SQL", status: "checked" },
  ]);
  assert.equal((await db.listSkillHistory(first.userId))[0].skillName, "SQL");
  const race = await Promise.allSettled([
    saveLearning(900002, state, 1),
    saveLearning(900002, state, 1),
  ]);
  assert.equal(race.filter(r => r.status === "fulfilled").length, 1);
  assert.equal(race.filter(r => r.status === "rejected").length, 1);
  const cookies: string[] = [];
  const { appRouter } = await import("../server/routers");
  const auth = appRouter.createCaller({
    user: null,
    req: { ip: "127.0.0.1", protocol: "http", headers: {} },
    res: { cookie: (_name: string, value: string) => cookies.push(value) },
  } as unknown as TrpcContext).auth;
  const credentials = {
    name: "Local test",
    email: prefix + "-auth@example.test",
    password: "Disposable-test-password-123",
  };
  await auth.register(credentials);
  await auth.login({
    email: credentials.email.toUpperCase(),
    password: credentials.password,
  });
  assert.equal(cookies.length, 2);
  const sessionStore = await import("../server/sessions");
  const signedIn = await sessionStore.lookupSession(cookies[0]);
  assert.ok(signedIn);
  const stored = await conn.query('SELECT id FROM sessions WHERE "userId"=$1', [signedIn.id]);
  assert.ok(stored.rows.every(row => !cookies.includes(row.id)));
  assert.equal(await sessionStore.lookupSession("legacy.jwt.value"), null);
  const otherToken = await sessionStore.createSession(first.userId);
  const ctx = { user: signedIn, req: { protocol: "http", headers: { cookie: `app_session_id=${cookies[0]}` } }, res: { clearCookie() {} } } as unknown as TrpcContext;
  const { COOKIE_NAME } = await import("../shared/const");
  ctx.req.headers.cookie = `${COOKIE_NAME}=${cookies[0]}`;
  const { createContext } = await import("../server/_core/context");
  assert.equal((await createContext({ req: ctx.req, res: ctx.res, info: {} as any })).user?.id, signedIn.id);
  // A guest workspace explicitly imported and saved survives logout and re-login.
  const journey = newState();
  journey.onboarded = true;
  journey.completed = ["sql-1"];
  journey.evidence["sql-1"] = "Checked filtered results";
  await appRouter.createCaller(ctx).datapath.save({ state: journey, revision: 0 });
  await appRouter.createCaller(ctx).auth.logout();
  assert.equal(await sessionStore.lookupSession(cookies[0]), null);
  assert.ok(await sessionStore.lookupSession(cookies[1]));
  await auth.login({ email: credentials.email, password: credentials.password });
  const returningReq = { ...ctx.req, headers: { cookie: `${COOKIE_NAME}=${cookies.at(-1)}` } };
  const returningContext = await createContext({ req: returningReq, res: ctx.res, info: {} as any });
  const restored = await appRouter.createCaller(returningContext).datapath.load();
  assert.deepEqual(restored?.state, journey);
  assert.equal(restored?.revision, 1);
  console.log("PASS: explicit guest workspace save survives logout and fresh login");
  ctx.req.headers.cookie = `${COOKIE_NAME}=${cookies[1]}`;
  await appRouter.createCaller(ctx).auth.revokeAllSessions();
  assert.equal((await createContext({ req: ctx.req, res: ctx.res, info: {} as any })).user, null);
  assert.ok(await sessionStore.lookupSession(otherToken), "other account must remain signed in");
  await conn.query(`UPDATE sessions SET "expiresAt"=now() - interval '1 second' WHERE id=$1`, [sessionStore.hashSessionToken(otherToken)]);
  assert.equal(await sessionStore.lookupSession(otherToken), null);
  console.log("PASS: opaque sessions, hashed storage, context lookup, expiry, logout, revoke-all and account isolation");

  assert.ok(
    (await db.getLocalAccount(credentials.email))?.passwordHash.startsWith(
      "scrypt$"
    )
  );
  await assert.rejects(
    () =>
      auth.login({
        email: credentials.email,
        password: "Incorrect-password-123",
      }),
    (error: any) => error.code === "UNAUTHORIZED"
  );
  // Preserve explicit historical timestamps and let identity values follow imported IDs.
  const importedId = Number(
    (await conn.query("SELECT COALESCE(MAX(id), 0) + 100 AS id FROM users"))
      .rows[0].id
  );
  await conn.query(
    `INSERT INTO users (id, "openId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $3)`,
    [importedId, prefix + "-imported", "2020-01-02T03:04:05Z"]
  );
  await conn.query(
    `SELECT setval(pg_get_serial_sequence('users','id'), (SELECT MAX(id) FROM users))`
  );
  const imported = await db.getUserByOpenId(prefix + "-imported");
  assert.equal(imported?.createdAt.toISOString(), "2020-01-02T03:04:05.000Z");
  const next = await db.createLocalAccount({
    openId: prefix + "-next",
    name: "Next",
    email: prefix + "-next@example.test",
    passwordHash: "unchanged",
  });
  assert.ok(next.userId > importedId);
  console.log(
    "PASS: migrations twice, Unicode, ownership, revision races, accounts/rollback, legacy upserts, timestamps, history, preserved IDs and identity sequence"
  );
} finally {
  await deleteLearning(900001);
  await deleteLearning(900002);
  const ids = (
    await conn.query(
      'SELECT id FROM users WHERE "openId" LIKE $1 OR email LIKE $1',
      [prefix + "%"]
    )
  ).rows.map(row => row.id);
  for (const table of [
    "localAccounts",
    "workspaces",
    "interviewQuestions",
    "studySessions",
    "skillProgressHistory",
    "learningStates",
  ]) {
    await conn.query(
      `DELETE FROM "${table}" WHERE "userId" = ANY($1::integer[])`,
      [ids]
    );
  }
  await conn.query("DELETE FROM users WHERE id = ANY($1::integer[])", [ids]);
  await db.closeDb();
  await conn.end();
}
