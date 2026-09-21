import { expect, it } from "vitest";
import { reviewSchedule } from "../shared/review-schedule";
const attempt = (at: string, passed = true) => ({
  id: at,
  at,
  passed,
  kind: "cumulative" as const,
  targetId: "review-sql+excel",
  score: passed ? 100 : 50,
  weakTopics: [],
});
const now = Date.parse("2026-09-20T12:00:00Z");
const target = "review-sql+excel";
it("starts immediately and returns failed reviews for remediation", () => {
  expect(reviewSchedule([], target, now).due).toBe(true);
  expect(
    reviewSchedule([attempt("2026-09-20T10:00:00Z", false)], target, now)
      .intervalDays
  ).toBe(0);
});
it("spaces successful reviews over distinct days, not rapid retries", () => {
  const history = [
    attempt("2026-09-19T10:00:00Z"),
    attempt("2026-09-19T11:00:00Z"),
  ];
  expect(reviewSchedule(history, target, now).intervalDays).toBe(1);
  expect(reviewSchedule(history, target, now).due).toBe(true);
  const result = reviewSchedule(
    [...history, attempt("2026-09-20T10:00:00Z")],
    target,
    now
  );
  expect(result.intervalDays).toBe(3);
  expect(result.due).toBe(false);
});
it("resets the interval after failure and ignores unrelated or future history", () => {
  const history = [
    attempt("2026-09-17T10:00:00Z"),
    attempt("2026-09-18T10:00:00Z", false),
    attempt("2026-09-19T10:00:00Z"),
  ];
  expect(reviewSchedule(history, target, now).intervalDays).toBe(1);
  expect(
    reviewSchedule([attempt("2026-09-21T10:00:00Z")], target, now).dueAt
  ).toBeNull();
  expect(reviewSchedule(history, "another-review", now).dueAt).toBeNull();
});
it("brings a successful review forward for related weak topics only", () => {
  const history = [attempt("2026-09-20T10:00:00Z")];
  expect(reviewSchedule(history, target, now, [], ["sql", "excel"]).due).toBe(
    false
  );
  const due = reviewSchedule(
    history,
    target,
    now,
    ["sql-2", "sql-2"],
    ["sql", "excel"]
  );
  expect(due.due).toBe(true);
  expect(due.reason).toContain("1 topic needs");
  expect(
    reviewSchedule(history, target, now, ["python-1"], ["sql", "excel"]).due
  ).toBe(false);
  expect(
    reviewSchedule(history, target, now, ["sql-other-1"], ["sql-other"]).due
  ).toBe(true);
});
