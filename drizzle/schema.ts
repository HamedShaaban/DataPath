import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin"]);

export const users = pgTable("users", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRole("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const workspaces = pgTable("workspaces", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  userId: integer("userId").notNull().unique(),
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
    userId: integer("userId").notNull(),
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
  userId: integer("userId").notNull(),
  sessionDate: varchar("sessionDate", { length: 10 }).notNull(),
  minutes: integer("minutes").notNull().default(25),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const skillProgressHistory = pgTable("skillProgressHistory", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  userId: integer("userId").notNull(),
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
  userId: integer("userId").primaryKey(),
  stateJson: text("stateJson").notNull(),
  revision: integer("revision").notNull().default(1),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const localAccounts = pgTable("localAccounts", {
  userId: integer("userId").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type LocalAccount = typeof localAccounts.$inferSelect;
