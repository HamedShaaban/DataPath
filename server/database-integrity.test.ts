import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { describe, it, expect } from "vitest";

describe("Database migrations and account ownership", () => {
  it("migrates twice, rejects orphan records, and cascades owned data", async () => {
    const pg = new PGlite();
    try {
      const db = drizzle(pg);
      await migrate(db, { migrationsFolder: "./drizzle/postgres" });
      await migrate(db, { migrationsFolder: "./drizzle/postgres" });
      await pg.exec('INSERT INTO users (id, "openId") VALUES (1, \'owner\'), (2, \'other\')');
      const inserts = [
        'INSERT INTO "learningStates" ("userId", "stateJson") VALUES ($1, \'{}\')',
        'INSERT INTO "localAccounts" ("userId", email, "passwordHash") VALUES ($1, ($1::integer)::text || \'@example.test\', \'test-hash\')',
        'INSERT INTO workspaces ("userId", "profileJson", "skillsJson", "projectsJson", "sqlJson", "studyLogJson") VALUES ($1, \'{}\', \'[]\', \'[]\', \'{}\', \'[]\')',
        'INSERT INTO "interviewQuestions" ("userId", "questionKey", category, question, why, "followUp") VALUES ($1, \'sql\', \'data\', \'Q\', \'W\', \'F\')',
        'INSERT INTO "studySessions" ("userId", "sessionDate") VALUES ($1, \'2026-10-08\')',
        'INSERT INTO "skillProgressHistory" ("userId", "skillId", "skillName", status) VALUES ($1, 1, \'SQL\', \'checked\')',
      ];
      for (const statement of inserts) {
        await expect(pg.query(statement, [999])).rejects.toMatchObject({ code: "23503" });
        await pg.query(statement, [1]);
        await pg.query(statement, [2]);
      }
      await pg.exec("DELETE FROM users WHERE id = 1");
      for (const table of ["learningStates", "localAccounts", "workspaces", "interviewQuestions", "studySessions", "skillProgressHistory"]) {
        const result = await pg.query<{ userId: number }>(`SELECT "userId" FROM "${table}"`);
        expect(result.rows).toEqual([{ userId: 2 }]);
      }
    } finally {
      await pg.close();
    }
  }, 30000);
});
