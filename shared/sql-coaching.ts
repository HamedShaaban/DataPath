import { sqlVocabulary } from "./sql-context";
import type { Sector } from "./industry-practice";

export type SqlCoaching = {
  title: string;
  explanation: string;
  example: string;
};

// Suggestions are deliberately conditional: parser messages are not a reliable
// diagnosis, and examples teach syntax rather than reveal challenge solutions.
export function coachSqlError(detail: string, sector: Sector): SqlCoaching {
  let advice: SqlCoaching;
  if (/ambiguous/i.test(detail)) {
    advice = {
      title: "Make the column reference explicit",
      explanation:
        "If both joined tables contain this column, prefix it with the table alias used in your FROM or JOIN clause.",
      example: "SELECT t.customer_id FROM transactions AS t;",
    };
  } else if (/group|aggregate/i.test(detail)) {
    advice = {
      title: "Check the level of your summary",
      explanation:
        "For a grouped result, include each selected non-aggregated column in GROUP BY. Use HAVING to filter grouped totals; WHERE filters individual rows.",
      example:
        "SELECT status, COUNT(*) AS row_count FROM transactions GROUP BY status;",
    };
  } else if (/column|field|property/i.test(detail)) {
    advice = {
      title: "Check column names and aliases",
      explanation:
        "Compare the spelling with the dataset headers. An alias must be declared in FROM or JOIN before you use it to qualify a column.",
      example: "SELECT t.amount FROM transactions AS t;",
    };
  } else if (
    /table|relation/i.test(detail) &&
    !/parse|syntax|expecting/i.test(detail)
  ) {
    advice = {
      title: "Check which dataset you are querying",
      explanation:
        "Use the exact table name shown in this industry's dataset panel. Names from another industry's exercise may differ.",
      example: "SELECT * FROM transactions;",
    };
  } else {
    advice = {
      title: "Rebuild the query one clause at a time",
      explanation:
        "Start with a small SELECT and FROM, then add your filter, grouping and sorting. Check commas, parentheses and single quotes around text. This lab uses AlaSQL; some syntax from other databases is unavailable.",
      example: "SELECT status FROM transactions WHERE status = 'completed';",
    };
  }
  return { ...advice, example: sqlVocabulary(advice.example, sector) };
}
