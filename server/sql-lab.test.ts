import { describe, expect, it } from "vitest";
import { sqlLabChallenges } from "../shared/sql-lab";
import { executeSqlChallenge } from "../shared/sql-engine";
import { newState, learningStateSchema } from "../shared/learning";
import { passedLabIds, recordLabAttempt } from "../shared/sql-progress";

describe("SQL practice progression", () => {
  it.each(sqlLabChallenges)(
    "executes $id on visible and hidden data",
    async challenge => {
      const result = await executeSqlChallenge(
        challenge.id,
        challenge.referenceSql
      );
      expect(result.error).toBeUndefined();
      expect(result.passed).toBe(true);
      expect(
        result.checks.filter(check => check.label.startsWith("Hidden"))
      ).toHaveLength(3);
      expect(result.rows).toEqual(challenge.expectedRows);
    }
  );
  it.each(sqlLabChallenges.filter(challenge => challenge.mode === "Debug"))(
    "rejects the broken $id starter",
    async challenge => {
      expect(
        (await executeSqlChallenge(challenge.id, challenge.starterSql)).passed
      ).toBe(false);
    }
  );
  it("rejects a hard-coded answer that matches the visible data", async () => {
    const result = await executeSqlChallenge(
      "sql-select-filter",
      "SELECT 104 AS transaction_id, 950 AS amount UNION ALL SELECT 101 AS transaction_id, 720 AS amount UNION ALL SELECT 105 AS transaction_id, 510 AS amount"
    );
    expect(result.executed).toBe(true);
    expect(
      result.checks.find(check => check.label.startsWith("Values"))?.passed
    ).toBe(true);
    expect(result.passed).toBe(false);
  });
  it("detects an exclusive threshold that passes visible rows", async () => {
    const result = await executeSqlChallenge(
      "sql-select-filter",
      sqlLabChallenges[0].referenceSql.replace(">= 500", "> 500")
    );
    expect(
      result.checks.find(check => check.label.startsWith("Values"))?.passed
    ).toBe(true);
    expect(result.passed).toBe(false);
  });
  it("accepts a semantically equivalent query", async () => {
    expect(
      (
        await executeSqlChallenge(
          "sql-select-filter",
          "SELECT t.transaction_id, t.amount FROM transactions t WHERE t.amount >= 500 AND t.status = 'completed' ORDER BY t.amount DESC"
        )
      ).passed
    ).toBe(true);
  });
  it.each([
    "DELETE FROM transactions",
    "SELECT * FROM transactions; DROP TABLE customers",
    "SELECT * FROM CSV('https://example.org/data')",
    "SELECT VALUE OF 1",
    "SELECT * FROM transactions WHERE amount = `alert(1)`",
  ])("rejects unsupported or unsafe input: %s", async query => {
    expect((await executeSqlChallenge("sql-select-filter", query)).passed).toBe(
      false
    );
  });
  it("records useful feedback, preserves proof after history rotation and parses legacy state", async () => {
    const challenge = sqlLabChallenges[0];
    const good = await executeSqlChallenge(
      challenge.id,
      challenge.referenceSql
    );
    const bad = await executeSqlChallenge(
      challenge.id,
      "SELECT transaction_id, amount FROM transactions"
    );
    let state = recordLabAttempt(
      newState(),
      challenge.id,
      challenge.referenceSql,
      good
    );
    const proof = state.evidence[challenge.topicId];
    for (let i = 0; i < 51; i++)
      state = recordLabAttempt(
        state,
        challenge.id,
        "SELECT transaction_id, amount FROM transactions",
        bad
      );
    expect(state.labAttempts).toHaveLength(50);
    expect(passedLabIds(state).has(challenge.id)).toBe(true);
    expect(state.evidence[challenge.topicId]).toBe(proof);
    expect(state.reviewTopics).toEqual([challenge.topicId]);
    expect(state.labAttempts[0].checksTotal).toBeGreaterThan(0);
    expect(learningStateSchema.parse(state)).toEqual(state);
    const legacy: any = newState();
    delete legacy.passedLabIds;
    expect(learningStateSchema.parse(legacy).passedLabIds).toEqual([]);
  });
});
