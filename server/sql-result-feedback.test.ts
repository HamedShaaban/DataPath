import { expect, it } from "vitest";
import { sqlResultFeedback } from "../shared/sql-result-feedback";
it("explains visible column and row mismatches", () => {
  const result = sqlResultFeedback(5, 2, ["wrong"], ["total"], false, false);
  expect(result[0]).toContain("total");
  expect(result[1]).toContain("expected 2 rows");
  expect(result[1]).toContain("returned 5");
});
it("distinguishes wrong values from alternate-dataset failures", () => {
  expect(sqlResultFeedback(2, 2, ["a"], ["a"], false, false)[0]).toContain(
    "values or ordering"
  );
  expect(sqlResultFeedback(2, 2, ["a"], ["a"], true, false)[0]).toContain(
    "alternate dataset"
  );
  expect(sqlResultFeedback(2, 2, ["a"], ["a"], true, true)).toEqual([]);
});
