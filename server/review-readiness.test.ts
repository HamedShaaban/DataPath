import { expect, it } from "vitest";
import { reviewReadiness } from "../shared/review-readiness";
it("unlocks a final single skill after its assessment passes", () => {
  const groups = reviewReadiness(["sql", "excel", "python"], ["sql", "python"]);
  expect(groups[0]).toMatchObject({
    ready: false,
    missing: ["excel"],
    targetId: "review-sql+excel",
  });
  expect(groups[1]).toMatchObject({
    ready: true,
    missing: [],
    targetId: "review-python",
  });
});
it("handles empty paths and duplicate IDs without phantom reviews", () => {
  expect(reviewReadiness([], [])).toEqual([]);
  expect(reviewReadiness(["sql", "sql"], [])).toHaveLength(1);
  expect(reviewReadiness(["sql"], [])[0].ready).toBe(false);
});
