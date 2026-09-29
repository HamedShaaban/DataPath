import { engineeringLessons } from "./engineering-lessons";
export const authoredLessons: Record<
  string,
  { brief: string; example: string; mistake: string }
> = {
  ...engineeringLessons,
  "sql-10": {
    brief: "A recursive CTE starts with an anchor and repeatedly evaluates a recursive term. Termination is part of correctness: hierarchy data may contain cycles. Track visited keys or use an explicit bound; a depth bound alone does not prove the hierarchy is valid.",
    example: "WITH RECURSIVE walk(n, path) AS (\n  SELECT 1, ARRAY[1]\n  UNION ALL\n  SELECT n + 1, path || (n + 1) FROM walk\n  WHERE n < 4 AND NOT (n + 1 = ANY(path))\n) SELECT n, path FROM walk ORDER BY n;",
    mistake: "UNION only removes identical output rows. If a depth or path column changes on each visit, it does not automatically stop cycles. Test a repeated identifier and inspect termination.",
  },
  "python-10": {
    brief: "Generators yield records lazily so a pipeline need not retain every input row. Memory remains bounded only when consumers avoid collecting all results. Generators are exhausted after traversal, so totals and validation should share a deliberate single pass or recreate the source.",
    example: "def positive_values(rows):\n    for row in rows:\n        if row is not None and row > 0:\n            yield row\n\nvalues = positive_values([3, None, -1, 5])\nassert sum(values) == 8\nassert list(values) == []  # already consumed",
    mistake: "Wrapping a generator in list() materializes its output. An empty second pass may mean exhaustion rather than an empty dataset; test both cases separately.",
  },
  "sql-1": {
    brief:
      "SELECT chooses output fields; WHERE selects rows before aggregation. Combine conditions with AND when every condition is required, and include boundary values deliberately.",
    example:
      "SELECT transaction_id, amount\nFROM transactions\nWHERE status = 'completed' AND amount >= 500\nORDER BY amount DESC;",
    mistake:
      "Using OR includes pending rows whenever their amount exceeds the threshold. Test exactly 500, just below 500 and a pending high-value row.",
  },
  "sql-2": {
    brief:
      "GROUP BY changes the grain from individual events to one row per group. WHERE filters input rows; HAVING filters aggregated groups.",
    example:
      "SELECT customer_id, SUM(amount) AS total_revenue\nFROM transactions\nWHERE status = 'completed'\nGROUP BY customer_id\nHAVING SUM(amount) >= 700;",
    mistake:
      "Filtering after aggregation cannot recover a total that already included the wrong statuses. State which input rows contribute to the metric.",
  },
  "sql-3": {
    brief:
      "INNER JOIN retains matching rows. LEFT JOIN also preserves unmatched rows from the left table. A one-to-many relationship can multiply records and inflate totals.",
    example:
      "SELECT c.customer_id, t.transaction_id\nFROM customers c\nLEFT JOIN transactions t\n  ON c.customer_id = t.customer_id\n  AND t.status = 'completed';",
    mistake:
      "Putting the right-table status condition in WHERE removes unmatched left rows. Check join cardinality and count unmatched entities.",
  },
  "sql-4": {
    brief:
      "A CTE names an intermediate result within one statement. Use it to make filtering, aggregation and final reporting separate steps that can be inspected.",
    example:
      "WITH completed AS (\n  SELECT customer_id, amount\n  FROM transactions WHERE status = 'completed'\n)\nSELECT customer_id, SUM(amount) AS total_revenue\nFROM completed GROUP BY customer_id;",
    mistake:
      "A CTE does not automatically remove duplicates or guarantee performance. Validate its row grain before using its output.",
  },
  "sql-5": {
    brief:
      "Window functions calculate across related rows without collapsing them. The window ORDER BY controls the calculation, while the final ORDER BY controls displayed row order.",
    example:
      "SELECT transaction_id, amount,\n  ROW_NUMBER() OVER (ORDER BY amount DESC, transaction_id) AS payment_rank\nFROM transactions\nWHERE status = 'completed'\nORDER BY amount DESC, transaction_id;",
    mistake:
      "Equal values need a deterministic tie-breaker for ROW_NUMBER. Its window ordering alone does not guarantee final output order.",
  },
  "sql-6": {
    brief:
      "NULL represents missing or unknown information. Test it with IS NULL. DISTINCT removes duplicate output combinations, not necessarily duplicate business entities.",
    example:
      "SELECT DISTINCT segment\nFROM customers\nWHERE segment IS NOT NULL\nORDER BY segment;",
    mistake:
      "NULL is not zero or an empty string. Define a business key and a survival rule before deduplicating complete records.",
  },
  "python-2": {
    brief:
      "A function receives explicit inputs and returns a result. Iterate through records, apply the business rule and accumulate only eligible values.",
    example:
      "def completed_total(rows):\n    total = 0\n    for row in rows:\n        if row['status'] == 'completed' and row['value'] is not None:\n            total += row['value']\n    return total",
    mistake:
      'if row["value"] excludes zero as well as None. Use an explicit missing-value comparison when zero is a valid observation.',
  },
  "python-5": {
    brief:
      "Tests should cover the normal case, boundaries, missing data and empty input. Compare a function result with an independently calculated expectation.",
    example:
      "assert completed_total([]) == 0\nassert completed_total([{'status': 'completed', 'value': 0}]) == 0\nassert completed_total([{'status': 'pending', 'value': 100}]) == 0",
    mistake:
      "Testing only the provided example allows hard-coded answers and boundary errors to survive. Vary both values and row order.",
  },
  "cleaning-1": {
    brief:
      "Identify missing values before transforming them. Keep missing, zero and invalid values separate, and document the effect of any imputation on downstream metrics.",
    example:
      "missing_ids = [row['id'] for row in rows if row['value'] is None]",
    mistake:
      "Replacing every missing value with zero understates averages and erases uncertainty. Choose a rule based on the meaning of the field.",
  },
  "excel-2": {
    brief:
      "A conditional aggregate applies a criterion to one range and totals matching cells in another. Both ranges must align row by row.",
    example: '=SUMIF(E2:E6,"completed",D2:D6)',
    mistake:
      "Selecting mismatched ranges can add values from the wrong records. Check the first and last included row and reconcile to a manual total.",
  },
  "powerbi-4": {
    brief:
      "A DAX measure evaluates in filter context. CALCULATE modifies that context before evaluating its expression; SUM aggregates a numeric column.",
    example:
      'Completed value = CALCULATE(SUM(Events[value]), Events[status] = "completed")',
    mistake:
      "A calculated column and a measure are not interchangeable. Verify totals under different report filters and inspect the model relationships.",
  },
  "statistics-1": {
    brief:
      "A summary describes a defined population. Counts, totals, averages and rates answer different questions, so define the observation unit and exclusions first.",
    example:
      "completion rate = completed record count / all record count × 100",
    mistake:
      "Excluding a record because its value is missing changes the denominator even when its status is known. Specify what each metric measures.",
  },
  "excel-1": {
    brief:
      "Treat a table as a dataset with a declared grain: one row should represent one observation. Keep a single header row, consistent column types and a stable identifier. Store identifiers as text when leading zeros matter; store amounts as numbers so totals behave consistently.",
    example:
      "Source rows: ID 001, amount 120; ID 002, amount 80; ID 003, amount 60.\nExpected checks: 3 rows, 3 distinct IDs, total amount 260.\nIf 001 becomes 1 during import, the identifier has changed even though the amount total still reconciles. Preserve the raw file and compare IDs as well as totals.",
    mistake:
      "A correct grand total does not prove the import is correct. Duplicate and missing records can offset each other. Check row count, distinct business keys, missing fields and totals separately.",
  },
  "excel-3": {
    brief:
      "Sorting changes row order; filtering changes which rows are visible. Sort the complete table so an identifier stays attached to its attributes. Before reporting a filtered total, decide whether the calculation should include hidden rows and state the filter conditions.",
    example:
      "Rows: A / completed / 120; B / pending / 80; C / completed / 60.\nFilter status to completed: A and C remain visible. Their total is 180 across 2 rows.\nSorting only the amount column would attach amounts to the wrong IDs. Sort all columns together, then reconcile the same eligible IDs and total.",
    mistake:
      "Do not assume hiding rows removes them from every formula. A standard SUM can still include filtered-out records. Validate the reported total against the intended eligible rows.",
  },
  "excel-4": {
    brief:
      "A pivot table summarises records at a chosen grain. Define the row labels, filters and aggregation before building it. Sum answers a value question; count answers a volume question. Reconcile the pivot's grand total to the eligible source data and check whether numeric fields were imported as text.",
    example:
      "Completed records: North 120, North 60, South 90. Pending record: South 80.\nWith region as rows, status filtered to completed, and amount summed: North = 180; South = 90; grand total = 270.\nIf the value field is counted instead, North = 2 and South = 1. That is a different metric, not a smaller sales total.",
    mistake:
      "A pivot can be internally consistent while using the wrong aggregation or stale source range. Check source coverage, refresh state, filters and aggregation before interpreting the result.",
  },
  "statistics-2": {
    brief:
      "A sample represents a population only under defensible selection assumptions. Selection bias arises when inclusion depends on characteristics related to the outcome. A larger sample reduces random variation but does not automatically remove systematic bias.",
    example:
      "A service survey receives 80 positive responses from 100 app users. The observed positive response rate is 80%.\nThe bank also serves branch-only customers, who were never invited. You can describe the responding app users, but cannot claim 80% satisfaction among all customers without evidence about selection and nonresponse.\nAn improvement is to sample across service channels and record response rates in each group.",
    mistake:
      "Do not present a convenient sample as the entire customer population. State who could be selected, who responded and which groups are missing. Weighting cannot repair every unmeasured selection difference.",
  },
  "cleaning-2": {
    brief:
      "Parsing turns source text into typed values. Declare formats and units explicitly, preserve the raw input and separate failures for review. Dates such as 03/04/2026 are ambiguous without a source convention; amounts with different decimal separators also need explicit rules.",
    example:
      "Raw date 03/04/2026 + documented DD/MM/YYYY convention → 2026-04-03.\nRaw date 31/02/2026 → invalid; retain the source value and flag it instead of guessing.\nRaw identifier 00042 → keep as text. Raw amount 1,250.50 under an English-style numeric convention → 1250.50.\nAfter conversion, report how many records parsed, failed or remained missing.",
    mistake:
      "Silently converting parse failures to zero makes bad data look valid. Missing source values and invalid source values are different quality issues and should remain distinguishable.",
  },
  "cleaning-3": {
    brief:
      "A duplicate depends on the business key and the record's meaning. Multiple events for one customer are not automatically duplicates. When several versions describe the same event, define an explicit survival rule. An outlier is an unusual observation requiring investigation, not automatic deletion.",
    example:
      "Event 10 appears twice: received 09:00, amount 100; received 10:00, corrected amount 120. Event 11 has amount 80.\nIf the source contract says the latest version replaces earlier versions, retain event 10 at 120 and event 11 at 80: 2 events, total 200. Summing all versions gives 300.\nIf two versions have the same received time, use a documented tie-breaker or flag the conflict. A separate event worth 10,000 needs investigation, not deletion solely because it is large.",
    mistake:
      "Do not deduplicate on the numeric amount or customer ID alone. Both can legitimately repeat. Preserve an audit trail of discarded versions and explain any outlier treatment.",
  },
};
