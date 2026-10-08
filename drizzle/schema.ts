import {
  integer,
  bigint,
  boolean,
  check,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRole = pgEnum("user_role", ["user", "admin"]);

export const users = pgTable(
  "users",
  {
    id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: userRole("role").default("user").notNull(),
    publicHandle: varchar("publicHandle", { length: 48 }),
    proofPageEnabled: boolean("proofPageEnabled").notNull().default(false),
    showProofTargets: boolean("showProofTargets").notNull().default(false),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastSignedIn: timestamp("lastSignedIn", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  table => [uniqueIndex("users_public_handle_idx").on(table.publicHandle)]
);

export const workspaces = pgTable("workspaces", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  userId: integer("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  profileJson: text("profileJson").notNull(),
  skillsJson: text("skillsJson").notNull(),
  projectsJson: text("projectsJson").notNull(),
  sqlJson: text("sqlJson").notNull(),
  studyLogJson: text("studyLogJson").notNull(),
  weeklyGoal: integer("weeklyGoal").notNull().default(5),
  theme: varchar("theme", { length: 16 }).notNull().default("light"),
  timerRemaining: integer("timerRemaining").notNull().default(1500),
  timerSessions: integer("timerSessions").notNull().default(0),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const interviewQuestions = pgTable(
  "interviewQuestions",
  {
    id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
    userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    questionKey: varchar("questionKey", { length: 64 }).notNull(),
    category: varchar("category", { length: 120 }).notNull(),
    question: text("question").notNull(),
    why: text("why").notNull(),
    followUp: text("followUp").notNull(),
    answerNote: text("answerNote"),
    feedbackJson: text("feedbackJson"),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  table => ({
    ownerQuestionIdx: uniqueIndex("interview_owner_question_idx").on(
      table.userId,
      table.questionKey
    ),
  })
);

export const studySessions = pgTable("studySessions", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionDate: varchar("sessionDate", { length: 10 }).notNull(),
  minutes: integer("minutes").notNull().default(25),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const skillProgressHistory = pgTable("skillProgressHistory", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  skillId: integer("skillId").notNull(),
  skillName: varchar("skillName", { length: 180 }).notNull(),
  status: varchar("status", { length: 40 }).notNull(),
  recordedAt: timestamp("recordedAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Workspace = typeof workspaces.$inferSelect;
export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type SkillProgressHistory = typeof skillProgressHistory.$inferSelect;

// Versioned DataPath state is separate from legacy workspaces; upgrades are non-destructive.
export const learningStates = pgTable("learningStates", {
  userId: integer("userId").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  stateJson: text("stateJson").notNull(),
  revision: integer("revision").notNull().default(1),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const verifiedCredentials = pgTable(
  "verifiedCredentials",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 20 }).notNull(),
    refId: varchar("refId", { length: 180 }).notNull(),
    verifiedAt: timestamp("verifiedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    evidenceHash: varchar("evidenceHash", { length: 64 }).notNull(),
    serverScore: jsonb("serverScore").notNull(),
    visible: boolean("visible").default(true).notNull(),
  },
  table => [
    index("verified_credentials_user_idx").on(table.userId),
    uniqueIndex("verified_credentials_user_type_ref_idx").on(
      table.userId,
      table.type,
      table.refId
    ),
    check(
      "verified_credentials_type_check",
      sql`${table.type} in ('skill_cert', 'lab_pass', 'project')`
    ),
  ]
);

export type VerifiedCredential = typeof verifiedCredentials.$inferSelect;

export const localAccounts = pgTable("localAccounts", {
  userId: integer("userId").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type LocalAccount = typeof localAccounts.$inferSelect;

// Only a SHA-256 hash of the opaque cookie token is persisted.
export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revokedAt", { withTimezone: true }),
  },
  table => [
    index("sessions_user_idx").on(table.userId),
    index("sessions_expiry_idx").on(table.expiresAt),
  ]
);

// Cost is integer micro-USD; the monthly total includes unsettled reservations.
export const aiBudgets = pgTable("aiBudgets", {
  month: varchar("month", { length: 7 }).primaryKey(),
  spentMicros: bigint("spentMicros", { mode: "number" }).notNull().default(0),
});
export const aiRequests = pgTable("aiRequests", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  month: varchar("month", { length: 7 }).notNull(),
  model: varchar("model", { length: 200 }).notNull(),
  reservedMicros: bigint("reservedMicros", { mode: "number" }).notNull(),
  chargedMicros: bigint("chargedMicros", { mode: "number" }),
  status: varchar("status", { length: 20 }).notNull().default("reserved"),
  promptTokens: integer("promptTokens"),
  completionTokens: integer("completionTokens"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
}, table => [index("ai_requests_user_time_idx").on(table.userId, table.createdAt)]);

// Shared, expiring counters for multi-instance/serverless deployments.
export const rateLimitBuckets = pgTable("rateLimitBuckets", {
  key: varchar("key", { length: 64 }).primaryKey(),
  count: integer("count").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
}, table => [index("rate_limit_expiry_idx").on(table.expiresAt)]);
