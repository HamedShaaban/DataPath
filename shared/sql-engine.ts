import { sqlResultFeedback } from "./sql-result-feedback";
import { coachSqlError, type SqlCoaching } from "./sql-coaching";
import { sqlContext, sqlVocabulary, mapSqlRows } from "./sql-context";
import type { Sector } from "./industry-practice";
import { sqlLabChallenges, sqlLabTables, type SqlLabRow } from "./sql-lab";

const blockedSql =
  /\b(insert|update|delete|drop|alter|create|truncate|replace|merge|attach|detach|use|source|require|eval|script|into|set|transaction|commit|rollback)\b|\b(csv|txt|json|xlsx?|sqlite)\s*\(/i;

export type SqlExecutionResult = {
  passed: boolean;
  executed: boolean;
  columns: string[];
  rows: SqlLabRow[];
  checks: Array<{ label: string; passed: boolean; topicId?: string }>;
  message: string;
  error?: string;
  coaching?: SqlCoaching;
  resultFeedback?: string[];
};

function safeQuery(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return "Write a query before running the challenge.";
  if (trimmed.length > 4000) return "Keep the query under 4,000 characters.";
  if (!/^(select|with)\b/i.test(trimmed))
    return "This lab accepts read-only SELECT or WITH queries.";
  if (blockedSql.test(trimmed))
    return "This lab blocks database changes, file access and external data sources.";
  if (/[`\[\]{}\\@$!:]|->/.test(trimmed))
    return "Use standard SQL expressions only; scripting and external access are unavailable.";
  const statements = trimmed
    .split(";")
    .map(value => value.trim())
    .filter(Boolean);
  if (statements.length !== 1) return "Run one read-only statement at a time.";
  return null;
}

type LabTables = Record<"customers" | "transactions", SqlLabRow[]>;

async function createLabDatabase(
  dataset: LabTables = sqlLabTables,
  sector: Sector = "banking"
) {
  const { default: alasql } = await import("alasql");
  const db = new alasql.Database();
  db.exec(
    sqlVocabulary(
      "CREATE TABLE customers (customer_id INT, customer_name STRING, segment STRING)",
      sector
    )
  );
  db.exec(
    sqlVocabulary(
      "CREATE TABLE transactions (transaction_id INT, customer_id INT, amount INT, status STRING, transaction_date STRING)",
      sector
    )
  );
  const tables = db.tables as Record<string, { data: SqlLabRow[] }>;
  tables[sqlVocabulary("customers", sector)].data = mapSqlRows(
    dataset.customers,
    sector
  );
  tables[sqlVocabulary("transactions", sector)].data = mapSqlRows(
    dataset.transactions,
    sector
  );
  return db;
}

function rowsEqual(actual: SqlLabRow[], expected: SqlLabRow[]) {
  return (
    actual.length === expected.length &&
    actual.every(
      (row, index) =>
        Object.keys(row).length === Object.keys(expected[index]).length &&
        Object.keys(expected[index]).every(
          key => row[key] === expected[index][key]
        )
    )
  );
}

// Alternate fixtures are not shown in the learner UI. Client-side checks are
// practice feedback, not tamper-proof certification.
function hiddenDatasets(): LabTables[] {
  const boundary: LabTables = {
    customers: [
      ...sqlLabTables.customers,
      { customer_id: 6, customer_name: "Ali", segment: "Retail" },
      { customer_id: 7, customer_name: "Hana", segment: null },
    ],
    transactions: [
      ...sqlLabTables.transactions,
      {
        transaction_id: 107,
        customer_id: 6,
        amount: 500,
        status: "completed",
        transaction_date: "2026-08-03",
      },
      {
        transaction_id: 108,
        customer_id: 6,
        amount: 200,
        status: "completed",
        transaction_date: "2026-08-07",
      },
      {
        transaction_id: 109,
        customer_id: 5,
        amount: 950,
        status: "completed",
        transaction_date: "2026-08-08",
      },
      {
        transaction_id: 110,
        customer_id: 7,
        amount: 9000,
        status: "declined",
        transaction_date: "2026-08-02",
      },
      {
        transaction_id: 111,
        customer_id: 2,
        amount: 499,
        status: "completed",
        transaction_date: "2026-08-02",
      },
    ],
  };
  return [
    boundary,
    {
      customers: boundary.customers.map(row => ({
        ...row,
        customer_id: Number(row.customer_id) + 20,
        customer_name: `Client ${row.customer_id}`,
      })),
      transactions: boundary.transactions
        .map(row => ({
          ...row,
          customer_id: Number(row.customer_id) + 20,
          transaction_id: Number(row.transaction_id) + 100,
          amount: Number(row.amount) + 17,
        }))
        .reverse(),
    },
    { customers: boundary.customers, transactions: [] },
  ];
}

export async function executeSqlChallenge(
  challengeId: string,
  query: string,
  sector: Sector = "banking"
): Promise<SqlExecutionResult> {
  const challenge = sqlContext(sector).challenges.find(
    item => item.id === challengeId
  );
  if (!challenge) throw new Error("Unknown SQL lab challenge");
  const safetyError = safeQuery(query);
  if (safetyError)
    return {
      passed: false,
      executed: false,
      columns: [],
      rows: [],
      checks: [{ label: "Read-only query accepted", passed: false }],
      message: safetyError,
      error: safetyError,
    };

  try {
    const raw = (await createLabDatabase(sqlLabTables, sector)).exec(query);
    if (!Array.isArray(raw)) throw new Error("The query did not return rows.");
    const expected = (
      sector === "banking"
        ? challenge.expectedRows
        : (await createLabDatabase(sqlLabTables, sector)).exec(
            challenge.referenceSql
          )
    ) as SqlLabRow[];
    const rows = raw.slice(0, 200) as SqlLabRow[];
    const columns = rows.length
      ? Object.keys(rows[0])
      : challenge.expectedColumns;
    const checks: SqlExecutionResult["checks"] = [
      { label: "Query executed successfully", passed: true },
      {
        label: "Returns the required columns",
        passed:
          !raw.length ||
          (columns.length === challenge.expectedColumns.length &&
            challenge.expectedColumns.every(
              (column, index) => columns[index] === column
            )),
      },
      {
        label: "Returns the expected number of rows",
        passed: raw.length === expected.length,
      },
      {
        label: "Values and ordering match the business rule",
        passed: rowsEqual(raw, expected),
      },
    ];
    if (challenge.id === "sql-cte")
      checks.push({
        label: "Practises a named CTE",
        passed: /^with\b/i.test(query.trim()),
      });
    if (challenge.id === "sql-window")
      checks.push({
        label: "Practises ROW_NUMBER with OVER",
        passed: /row_number\s*\(\s*\)\s*over\s*\(/i.test(query),
      });
    for (const [index, dataset] of hiddenDatasets().entries()) {
      let passed = false;
      try {
        const actual = (await createLabDatabase(dataset, sector)).exec(query);
        const target = (await createLabDatabase(dataset, sector)).exec(
          challenge.referenceSql!
        );
        passed =
          Array.isArray(actual) &&
          Array.isArray(target) &&
          rowsEqual(actual, target);
      } catch {
        /* A dataset-specific execution error fails this check. */
      }
      checks.push({
        label: [
          "Hidden test: boundaries, duplicates and missing matches",
          "Hidden test: changed values and input order",
          "Hidden test: no transactions",
        ][index],
        passed,
      });
    }
    checks.forEach(check => {
      check.topicId = challenge.topicId;
    });
    const passed = checks.every(check => check.passed);
    return {
      passed,
      executed: true,
      resultFeedback: sqlResultFeedback(
        raw.length,
        expected.length,
        columns,
        challenge.expectedColumns,
        rowsEqual(raw, expected),
        checks
          .filter(check => check.label.startsWith("Hidden test:"))
          .every(check => check.passed)
      ),
      columns,
      rows,
      checks,
      message: passed
        ? "The query matches the business rule on the practice data and all three hidden datasets."
        : "The query ran, but the result does not yet match the required output.",
    };
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "SQL execution failed.";
    return {
      passed: false,
      executed: false,
      columns: [],
      rows: [],
      checks: [
        {
          label: "Query executed successfully",
          passed: false,
          topicId: challenge.topicId,
        },
      ],
      message:
        "The database could not run this query. Review the SQL error and try again.",
      coaching: coachSqlError(detail, sector),
      error:
        sqlErrorGuidance(detail) +
        "\n" +
        detail.replace(/^Error:\s*/i, "").slice(0, 300),
    };
  }
}

export function sqlErrorGuidance(detail: string) {
  if (/column|field|property/i.test(detail))
    return "Check the dataset column names and qualify shared names with table aliases.";
  if (/table|relation/i.test(detail))
    return "Use the table names shown in this industry's dataset; check CTE names and aliases.";
  if (/parse|syntax|unexpected/i.test(detail))
    return "Check commas, quotes and clause order: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY.";
  return "Run a small SELECT first, then add one filter, join or calculation at a time.";
}
