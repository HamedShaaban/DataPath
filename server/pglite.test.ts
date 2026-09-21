import { describe, expect, it } from "vitest";
import { executeSqlChallenge } from "../shared/sql-engine";
import { sqlContext } from "../shared/sql-context";

describe("PostgreSQL practice semantics", () => {
  it("uses PostgreSQL DATE columns and preserves ISO date strings in replies", async () => {
    const types = await executeSqlChallenge(
      "sql-select-filter",
      "SELECT pg_typeof(transaction_date)::text AS date_type FROM transactions LIMIT 1"
    );
    expect(types.executed).toBe(true);
    expect(types.rows).toEqual([{ date_type: "date" }]);
    const challenge = sqlContext("banking").challenges.find(c =>
      c.expectedColumns.includes("transaction_date")
    )!;
    expect(
      (await executeSqlChallenge(challenge.id, challenge.referenceSql)).rows
    ).toEqual(challenge.expectedRows);
  });
  it("enforces grouped-column rules and recovers after a database error", async () => {
    const bad = await executeSqlChallenge(
      "sql-select-filter",
      "SELECT customer_id, SUM(amount) FROM transactions"
    );
    expect(bad.executed).toBe(false);
    expect(bad.error).toContain("GROUP BY");
    const challenge = sqlContext("banking").challenges[0];
    expect(
      (await executeSqlChallenge(challenge.id, challenge.referenceSql)).passed
    ).toBe(true);
  });
  it("returns field metadata for empty results instead of inventing expected columns", async () => {
    const result = await executeSqlChallenge(
      "sql-select-filter",
      "SELECT amount AS wrong_column FROM transactions WHERE FALSE"
    );
    expect(result.rows).toEqual([]);
    expect(result.columns).toEqual(["wrong_column"]);
    expect(
      result.checks.find(c => c.label === "Returns the required columns")
        ?.passed
    ).toBe(false);
  });
  it("uses real integer division, numeric AVG and SQL NULL semantics", async () => {
    const result = await executeSqlChallenge(
      "sql-select-filter",
      "SELECT 5 / 2 AS integer_division, AVG(amount)::double precision AS average, NULL = NULL AS unknown FROM (VALUES (1), (2)) AS samples(amount)"
    );
    expect(result.executed).toBe(true);
    expect(result.rows[0]).toEqual({
      integer_division: 2,
      average: 1.5,
      unknown: null,
    });
  });
  it.each([
    "SELECT set_config('role', 'postgres', true)",
    "SELECT set_config('transaction_read_only', 'off', true)",
    "SELECT pg_read_file('/pglite/data/PG_VERSION')",
  ])("denies privileged session or filesystem operations: %s", async query => {
    const result = await executeSqlChallenge("sql-select-filter", query);
    expect(result.executed).toBe(false);
    expect(result.error).toContain("permission denied");
  });
  it("keeps concurrent industry datasets isolated", async () => {
    const results = await Promise.all(
      (["banking", "retail", "telecom"] as const).map(sector => {
        const c = sqlContext(sector).challenges[2];
        return executeSqlChallenge(c.id, c.referenceSql, sector);
      })
    );
    expect(results.every(result => result.passed)).toBe(true);
  });
});
