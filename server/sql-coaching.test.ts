import { describe, expect, it } from "vitest";
import { coachSqlError } from "../shared/sql-coaching";
import { executeSqlChallenge } from "../shared/sql-engine";
import { sqlLabChallenges } from "../shared/sql-lab";

describe("SQL corrective guidance", () => {
  it.each([
    ["Ambiguous column customer_id", "Make the column reference explicit"],
    ["Invalid aggregate in GROUP BY", "Check the level of your summary"],
    ["Cannot read property amount", "Check column names and aliases"],
    ["Table missing does not exist", "Check which dataset you are querying"],
    ["Parse error: expecting TABLE", "Rebuild the query one clause at a time"],
  ])("maps %s to actionable guidance", (error, title) => {
    expect(coachSqlError(error, "banking").title).toBe(title);
  });
  it("uses the selected industry's actual table and column names", () => {
    const advice = coachSqlError("Column missing", "retail");
    expect(advice.example).toContain("events");
    expect(advice.example).toContain("measure_value");
    expect(advice.example).not.toContain("transactions");
  });
  it("attaches coaching to an actual failed execution, not a passed query", async () => {
    const challenge = sqlLabChallenges[0];
    const failed = await executeSqlChallenge(
      challenge.id,
      "SELECT * FROM nonexistent_table"
    );
    expect(failed.executed).toBe(false);
    expect(failed.coaching?.title).toBe("Check which dataset you are querying");
    const passed = await executeSqlChallenge(
      challenge.id,
      challenge.referenceSql
    );
    expect(passed.passed).toBe(true);
    expect(passed.coaching).toBeUndefined();
  });
  it("does not suggest syntax fixes for blocked write statements", async () => {
    const result = await executeSqlChallenge(
      sqlLabChallenges[0].id,
      "DELETE FROM transactions"
    );
    expect(result.executed).toBe(false);
    expect(result.coaching).toBeUndefined();
  });
});
