import { expect, it } from "vitest";
import { applyCatchUp, catchUpPreview } from "../shared/catch-up";
import { makePlan, newState } from "../shared/learning";
it("changes only pace and preserves every learning record", () => {
  const s = newState();
  s.completed = ["sql-1"];
  s.evidence["sql-1"] = "checked";
  s.sessions = [{ date: "2026-09-23T00:00:00Z", minutes: 30 }];
  const original = structuredClone(s);
  const result = applyCatchUp(s, 5);
  expect(s).toEqual(original);
  expect({ ...result, profile: s.profile }).toEqual(s);
  expect({
    ...result.profile,
    hoursPerWeek: s.profile.hoursPerWeek,
    weeks: s.profile.weeks,
  }).toEqual(s.profile);
  expect(result.profile.weeks).toBe(catchUpPreview(s, 5)?.weeks);
  expect(result.profile.hoursPerWeek).toBe(5);
});
it("uses remaining work and makes a slower pace take longer", () => {
  const s = newState();
  expect(catchUpPreview(s, 3)!.weeks).toBeGreaterThan(
    catchUpPreview(s, 8)!.weeks
  );
  const before = catchUpPreview(s, 5)!.remainingHours;
  s.completed = ["sql-1"];
  expect(catchUpPreview(s, 5)!.remainingHours).toBeLessThan(before);
});
it("rejects invalid, excessive and unnecessary schedules", () => {
  const s = newState();
  for (const hours of [0, 61, 1.5, NaN]) {
    expect(catchUpPreview(s, hours)).toBeNull();
    expect(applyCatchUp(s, hours)).toBe(s);
  }
  s.profile.role = "data-platform-engineer";
  expect(catchUpPreview(s, 1)!.weeks).toBeGreaterThan(104);
  expect(applyCatchUp(s, 1)).toBe(s);
  s.completed = makePlan(s).topics.map(t => t.id);
  s.completedProjects = ["project-data-platform-engineer"];
  expect(catchUpPreview(s, 5)?.canApply).toBe(false);
  expect(applyCatchUp(s, 5)).toBe(s);
});
