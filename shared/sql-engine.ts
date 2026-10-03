import { PGlite, types, type PGliteOptions } from "@electric-sql/pglite";
import { sqlResultFeedback } from "./sql-result-feedback";
import { coachSqlError, type SqlCoaching } from "./sql-coaching";
import { sqlContext, sqlVocabulary, mapSqlRows } from "./sql-context";
import type { Sector } from "./industry-practice";
import { sqlLabChallenges, sqlLabTables, type SqlLabRow } from "./sql-lab";

const blockedSql =
  /\b(insert|update|delete|drop|alter|create|truncate|replace|merge|attach|detach|use|source|require|eval|script|into|set|transaction|commit|rollback)\b|\b(csv|txt|json|xlsx?|sqlite)\s*\(/i;

export type SqlExecutionResult = {
  unavailable?: boolean;
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
  if (/[`{}\\@$]|->/.test(trimmed))
    return "Use standard SQL expressions only; scripting and external access are unavailable.";
  const statements = trimmed
    .split(";")
    .map(value => value.trim())
    .filter(Boolean);
  if (statements.length !== 1) return "Run one read-only statement at a time.";
  return null;
}

type LabTables = Record<"customers" | "transactions", SqlLabRow[]>;

// Each worker owns one disposable, in-memory Postgres instance. The queue also
// isolates concurrent calls in Node tests; no learner data is persisted here.
let database: Promise<PGlite> | undefined;
let pending: Promise<unknown> = Promise.resolve();
async function getDatabase(options?: PGliteOptions) {
  if (!database) {
    database = (async () => {
      const db = await PGlite.create({
        ...options,
        parsers: { ...options?.parsers, [types.DATE]: value => value },
      });
      await db.exec(`
        CREATE ROLE lab_reader NOLOGIN NOSUPERUSER;
        REVOKE CREATE ON SCHEMA public FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION pg_catalog.set_config(text, text, boolean) FROM PUBLIC;
      `);
      return db;
    })().catch(error => {
      database = undefined;
      throw error;
    });
  }
  return database;
}
async function seedDatabase(db: PGlite, dataset: LabTables, sector: Sector) {
  await db.exec(
    `DROP TABLE IF EXISTS transactions, customers, events, entities;`
  );
  await db.exec(
    sqlVocabulary(
      `
    CREATE TABLE customers (customer_id INTEGER, customer_name TEXT, segment TEXT);
    CREATE TABLE transactions (transaction_id INTEGER, customer_id INTEGER,
      amount INTEGER, status TEXT, transaction_date DATE);
    GRANT SELECT ON customers, transactions TO lab_reader;
  `,
      sector
    )
  );
  for (const table of ["customers", "transactions"] as const) {
    const rows = mapSqlRows(dataset[table], sector);
    if (!rows.length) continue;
    const columns = Object.keys(rows[0]);
    const values: unknown[] = [];
    const placeholders = rows.map(
      row =>
        `(${columns
          .map(column => {
            values.push(row[column]);
            return `$${values.length}`;
          })
          .join(", ")})`
    );
    await db.query(
      `INSERT INTO ${sqlVocabulary(table, sector)} (${columns.join(", ")}) VALUES ${placeholders.join(", ")}`,
      values
    );
  }
}
async function readQuery(db: PGlite, query: string) {
  await db.exec(
    "BEGIN READ ONLY; SET LOCAL ROLE lab_reader; SET LOCAL statement_timeout = '2000ms';"
  );
  try {
    return await db.query<SqlLabRow>(query);
  } finally {
    await db.exec("ROLLBACK");
  }
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

async function executeChallenge(
  challengeId: string,
  query: string,
  sector: Sector = "banking",
  options?: PGliteOptions
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

  let ready = false;
  try {
    const db = await getDatabase(options);
    await seedDatabase(db, sqlLabTables, sector);
    ready = true;
    const result = await readQuery(db, query);
    const raw = result.rows;
    if (!Array.isArray(raw)) throw new Error("The query did not return rows.");
    const expected = (
      sector === "banking"
        ? challenge.expectedRows
        : (await readQuery(db, challenge.referenceSql)).rows
    ) as SqlLabRow[];
    const rows = raw.slice(0, 200) as SqlLabRow[];
    const columns = result.fields.map(field => field.name);
    const checks: SqlExecutionResult["checks"] = [
      { label: "Query executed successfully", passed: true },
      {
        label: "Returns the required columns",
        passed:
          columns.length === challenge.expectedColumns.length &&
          challenge.expectedColumns.every(
            (column, index) => columns[index] === column
          ),
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
        await seedDatabase(db, dataset, sector);
        const actual = (await readQuery(db, query)).rows;
        const target = (await readQuery(db, challenge.referenceSql)).rows;
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
    if (!ready) return { unavailable: true, passed: false, executed: false,
      columns: [], rows: [], checks: [], message: "The SQL engine could not start. Retry when the connection is available." };
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

export function executeSqlChallenge(
  challengeId: string,
  query: string,
  sector: Sector = "banking",
  options?: PGliteOptions
): Promise<SqlExecutionResult> {
  const result = pending.then(() =>
    executeChallenge(challengeId, query, sector, options)
  );
  pending = result.catch(() => undefined);
  return result;
}
