export type SqlLabRow = Record<string, string | number | null>;

export type SqlLabChallenge = {
  id: string;
  topicId: string;
  title: string;
  level: "Beginner" | "Intermediate";
  brief: string;
  task: string;
  starterSql: string;
  hints: string[];
  mode?: "Build" | "Debug";
  referenceSql: string;
  expectedColumns: string[];
  expectedRows: SqlLabRow[];
};

export const sqlLabTables = {
  customers: [
    { customer_id: 1, customer_name: "Nour", segment: "Retail" },
    { customer_id: 2, customer_name: "Omar", segment: "SME" },
    { customer_id: 3, customer_name: "Mariam", segment: "Retail" },
    { customer_id: 4, customer_name: "Youssef", segment: "Corporate" },
    { customer_id: 5, customer_name: "Salma", segment: null },
  ],
  transactions: [
    {
      transaction_id: 101,
      customer_id: 1,
      amount: 720,
      status: "completed",
      transaction_date: "2026-08-02",
    },
    {
      transaction_id: 102,
      customer_id: 2,
      amount: 340,
      status: "completed",
      transaction_date: "2026-08-03",
    },
    {
      transaction_id: 103,
      customer_id: 1,
      amount: 180,
      status: "declined",
      transaction_date: "2026-08-03",
    },
    {
      transaction_id: 104,
      customer_id: 3,
      amount: 950,
      status: "completed",
      transaction_date: "2026-08-05",
    },
    {
      transaction_id: 105,
      customer_id: 2,
      amount: 510,
      status: "completed",
      transaction_date: "2026-08-07",
    },
    {
      transaction_id: 106,
      customer_id: 4,
      amount: 1250,
      status: "pending",
      transaction_date: "2026-08-08",
    },
  ],
} satisfies Record<string, SqlLabRow[]>;

export const sqlLabChallenges: SqlLabChallenge[] = [
  {
    id: "sql-select-filter",
    referenceSql:
      "SELECT transaction_id, amount FROM transactions WHERE status = 'completed' AND amount >= 500 ORDER BY amount DESC",
    topicId: "sql-1",
    title: "Filter high-value completed transactions",
    level: "Beginner",
    brief:
      "A fraud operations analyst needs a review queue without declined or pending payments.",
    task: "Return transaction_id and amount for completed transactions with amount at least 500. Sort the largest amount first.",
    starterSql:
      "SELECT transaction_id, amount\nFROM transactions\nWHERE \nORDER BY amount DESC;",
    hints: [
      "Filter status with an exact string comparison.",
      "Use >= so a transaction worth exactly 500 is included.",
    ],
    expectedColumns: ["transaction_id", "amount"],
    expectedRows: [
      {
        transaction_id: 104,
        amount: 950,
      },
      {
        transaction_id: 101,
        amount: 720,
      },
      {
        transaction_id: 105,
        amount: 510,
      },
    ],
  },
  {
    id: "sql-group-revenue",
    referenceSql:
      "SELECT customer_id, SUM(amount) AS total_revenue FROM transactions WHERE status = 'completed' GROUP BY customer_id ORDER BY total_revenue DESC",
    topicId: "sql-2",
    title: "Calculate completed revenue by customer",
    level: "Beginner",
    brief:
      "The relationship team needs one completed-revenue figure per customer.",
    task: "Return customer_id and SUM(amount) as total_revenue for completed transactions. Group by customer_id and sort revenue descending.",
    starterSql:
      "SELECT customer_id, SUM(amount) AS total_revenue\nFROM transactions\nWHERE \nGROUP BY \nORDER BY total_revenue DESC;",
    hints: [
      "Filter completed rows before aggregation.",
      "Every selected non-aggregate column belongs in GROUP BY.",
    ],
    expectedColumns: ["customer_id", "total_revenue"],
    expectedRows: [
      {
        customer_id: 3,
        total_revenue: 950,
      },
      {
        customer_id: 2,
        total_revenue: 850,
      },
      {
        customer_id: 1,
        total_revenue: 720,
      },
    ],
  },
  {
    id: "sql-join-customer-value",
    referenceSql:
      "SELECT c.customer_name, SUM(t.amount) AS total_revenue FROM customers c JOIN transactions t ON c.customer_id = t.customer_id WHERE t.status = 'completed' GROUP BY c.customer_name HAVING SUM(t.amount) >= 700 ORDER BY total_revenue DESC",
    topicId: "sql-3",
    title: "Build a customer-value review list",
    level: "Intermediate",
    brief:
      "A banking analyst needs names, not IDs, for customers with at least 700 in completed transaction value.",
    task: "Join customers to transactions, return customer_name and SUM(amount) as total_revenue, keep completed transactions, group by customer_name, filter totals of at least 700, and sort descending.",
    starterSql:
      "SELECT c.customer_name, SUM(t.amount) AS total_revenue\nFROM customers c\nJOIN transactions t ON \nWHERE \nGROUP BY \nHAVING \nORDER BY total_revenue DESC;",
    hints: [
      "Join the two customer_id columns.",
      "WHERE filters rows; HAVING filters the calculated groups.",
    ],
    expectedColumns: ["customer_name", "total_revenue"],
    expectedRows: [
      {
        customer_name: "Mariam",
        total_revenue: 950,
      },
      {
        customer_name: "Omar",
        total_revenue: 850,
      },
      {
        customer_name: "Nour",
        total_revenue: 720,
      },
    ],
  },
  {
    id: "sql-date-range",
    topicId: "sql-1",
    title: "Find payments in a date range",
    level: "Beginner",
    mode: "Build",
    brief:
      "A banking operations team needs a reliable report. Check the business rule before writing SQL.",
    task: "Return transaction_id and transaction_date for completed payments from 2026-08-03 through 2026-08-07 inclusive. Sort by transaction_id.",
    referenceSql:
      "SELECT transaction_id, transaction_date FROM transactions WHERE status = 'completed' AND transaction_date BETWEEN '2026-08-03' AND '2026-08-07' ORDER BY transaction_id",
    starterSql:
      "SELECT transaction_id, transaction_date\nFROM transactions\nWHERE ",
    hints: [
      "Use ISO dates so lexical and chronological order agree.",
      "Both boundary dates must be included.",
    ],
    expectedColumns: ["transaction_id", "transaction_date"],
    expectedRows: [
      {
        transaction_id: 102,
        transaction_date: "2026-08-03",
      },
      {
        transaction_id: 104,
        transaction_date: "2026-08-05",
      },
      {
        transaction_id: 105,
        transaction_date: "2026-08-07",
      },
    ],
  },
  {
    id: "sql-distinct-segments",
    topicId: "sql-6",
    title: "Remove duplicate customer segments",
    level: "Beginner",
    mode: "Build",
    brief:
      "A banking operations team needs a reliable report. Check the business rule before writing SQL.",
    task: "Return each non-NULL segment once, in alphabetical order.",
    referenceSql:
      "SELECT DISTINCT segment FROM customers WHERE segment IS NOT NULL ORDER BY segment",
    starterSql: "SELECT segment FROM customers;",
    hints: [
      "DISTINCT removes duplicate output rows.",
      "Use IS NOT NULL to exclude unknown segments.",
    ],
    expectedColumns: ["segment"],
    expectedRows: [
      {
        segment: "Corporate",
      },
      {
        segment: "Retail",
      },
      {
        segment: "SME",
      },
    ],
  },
  {
    id: "sql-debug-boolean",
    topicId: "sql-1",
    title: "Debug an overly broad payment filter",
    level: "Beginner",
    mode: "Debug",
    brief:
      "A banking operations team needs a reliable report. Check the business rule before writing SQL.",
    task: "Fix the query: return transaction_id and amount for completed payments of at least 500, largest amount first.",
    referenceSql:
      "SELECT transaction_id, amount FROM transactions WHERE status = 'completed' AND amount >= 500 ORDER BY amount DESC",
    starterSql:
      "SELECT transaction_id, amount FROM transactions WHERE status = 'completed' OR amount >= 500 ORDER BY amount DESC",
    hints: [
      "Does OR require both conditions to hold?",
      "Pending payments must never enter this queue.",
    ],
    expectedColumns: ["transaction_id", "amount"],
    expectedRows: [
      {
        transaction_id: 104,
        amount: 950,
      },
      {
        transaction_id: 101,
        amount: 720,
      },
      {
        transaction_id: 105,
        amount: 510,
      },
    ],
  },
  {
    id: "sql-debug-count",
    topicId: "sql-2",
    title: "Debug payment counts",
    level: "Beginner",
    mode: "Debug",
    brief:
      "A banking operations team needs a reliable report. Check the business rule before writing SQL.",
    task: "Return customer_id and COUNT(*) as payment_count for completed transactions only. Sort by customer_id.",
    referenceSql:
      "SELECT customer_id, COUNT(*) AS payment_count FROM transactions WHERE status = 'completed' GROUP BY customer_id ORDER BY customer_id",
    starterSql:
      "SELECT customer_id, COUNT(*) AS payment_count FROM transactions GROUP BY customer_id ORDER BY customer_id",
    hints: [
      "Filter the input before counting.",
      "A declined attempt is not a completed payment.",
    ],
    expectedColumns: ["customer_id", "payment_count"],
    expectedRows: [
      {
        customer_id: 1,
        payment_count: 1,
      },
      {
        customer_id: 2,
        payment_count: 2,
      },
      {
        customer_id: 3,
        payment_count: 1,
      },
    ],
  },
  {
    id: "sql-left-join",
    topicId: "sql-3",
    title: "Find customers without completed payments",
    level: "Intermediate",
    mode: "Debug",
    brief:
      "A banking operations team needs a reliable report. Check the business rule before writing SQL.",
    task: "Return customer_id and customer_name for customers with no completed transactions, including customers with no transactions at all. Sort by customer_id.",
    referenceSql:
      "SELECT c.customer_id, c.customer_name FROM customers c LEFT JOIN transactions t ON c.customer_id = t.customer_id AND t.status = 'completed' WHERE t.transaction_id IS NULL ORDER BY c.customer_id",
    starterSql:
      "SELECT c.customer_id, c.customer_name FROM customers c LEFT JOIN transactions t ON c.customer_id = t.customer_id WHERE t.status = 'completed' ORDER BY c.customer_id",
    hints: [
      "Put the completed condition in the join to preserve unmatched customers.",
      "Test the joined transaction key with IS NULL.",
    ],
    expectedColumns: ["customer_id", "customer_name"],
    expectedRows: [
      {
        customer_id: 4,
        customer_name: "Youssef",
      },
      {
        customer_id: 5,
        customer_name: "Salma",
      },
    ],
  },
  {
    id: "sql-subquery",
    topicId: "sql-4",
    title: "Find above-average payments",
    level: "Intermediate",
    mode: "Build",
    brief:
      "A banking operations team needs a reliable report. Check the business rule before writing SQL.",
    task: "Return transaction_id and amount for completed payments above the average completed payment amount. Sort by amount descending.",
    referenceSql:
      "SELECT transaction_id, amount FROM transactions WHERE status = 'completed' AND amount > (SELECT AVG(amount) FROM transactions WHERE status = 'completed') ORDER BY amount DESC",
    starterSql: "SELECT transaction_id, amount FROM transactions\nWHERE ",
    hints: [
      "Calculate the average using completed rows only.",
      "Compare each completed payment with the scalar subquery.",
    ],
    expectedColumns: ["transaction_id", "amount"],
    expectedRows: [
      {
        transaction_id: 104,
        amount: 950,
      },
      {
        transaction_id: 101,
        amount: 720,
      },
    ],
  },
  {
    id: "sql-cte",
    topicId: "sql-4",
    title: "Create a reusable revenue stage",
    level: "Intermediate",
    mode: "Build",
    brief:
      "A banking operations team needs a reliable report. Check the business rule before writing SQL.",
    task: "Use a CTE to calculate completed revenue per customer, then return customer_id and total_revenue where total_revenue is at least 700. Sort by customer_id.",
    referenceSql:
      "WITH revenue AS (SELECT customer_id, SUM(amount) AS total_revenue FROM transactions WHERE status = 'completed' GROUP BY customer_id) SELECT customer_id, total_revenue FROM revenue WHERE total_revenue >= 700 ORDER BY customer_id",
    starterSql:
      "WITH revenue AS (\n  SELECT customer_id, SUM(amount) AS total_revenue\n  FROM transactions\n)\nSELECT customer_id, total_revenue FROM revenue;",
    hints: [
      "Finish the filter and grouping inside the CTE.",
      "Filter the named result in the outer query.",
    ],
    expectedColumns: ["customer_id", "total_revenue"],
    expectedRows: [
      {
        customer_id: 1,
        total_revenue: 720,
      },
      {
        customer_id: 2,
        total_revenue: 850,
      },
      {
        customer_id: 3,
        total_revenue: 950,
      },
    ],
  },
  {
    id: "sql-window",
    topicId: "sql-5",
    title: "Rank completed payments",
    level: "Intermediate",
    mode: "Build",
    brief:
      "A banking operations team needs a reliable report. Check the business rule before writing SQL.",
    task: "Return transaction_id, amount and ROW_NUMBER() as payment_rank for completed payments. Rank by amount descending, breaking ties with transaction_id ascending. Return rows in that same order.",
    referenceSql:
      "SELECT transaction_id, amount, ROW_NUMBER() OVER (ORDER BY amount DESC, transaction_id ASC) AS payment_rank FROM transactions WHERE status = 'completed' ORDER BY amount DESC, transaction_id ASC",
    starterSql: "SELECT transaction_id, amount,\nFROM transactions;",
    hints: [
      "OVER defines the order used by ROW_NUMBER.",
      "Use the same deterministic ordering for the final result.",
    ],
    expectedColumns: ["transaction_id", "amount", "payment_rank"],
    expectedRows: [
      {
        transaction_id: 104,
        amount: 950,
        payment_rank: 1,
      },
      {
        transaction_id: 101,
        amount: 720,
        payment_rank: 2,
      },
      {
        transaction_id: 105,
        amount: 510,
        payment_rank: 3,
      },
      {
        transaction_id: 102,
        amount: 340,
        payment_rank: 4,
      },
    ],
  },
  {
    id: "sql-null",
    topicId: "sql-6",
    title: "Debug missing segment detection",
    level: "Intermediate",
    mode: "Debug",
    brief:
      "A banking operations team needs a reliable report. Check the business rule before writing SQL.",
    task: "Return customer_id and customer_name for customers whose segment is NULL. Sort by customer_id.",
    referenceSql:
      "SELECT customer_id, customer_name FROM customers WHERE segment IS NULL ORDER BY customer_id",
    starterSql:
      "SELECT customer_id, customer_name FROM customers WHERE segment = NULL ORDER BY customer_id",
    hints: [
      "NULL represents unknown information.",
      "Use IS NULL instead of equality.",
    ],
    expectedColumns: ["customer_id", "customer_name"],
    expectedRows: [
      {
        customer_id: 5,
        customer_name: "Salma",
      },
    ],
  },
];
