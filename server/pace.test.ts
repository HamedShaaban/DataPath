import { expect, it } from "vitest";
import { careers } from "../shared/catalog";
import { makePlan, newState } from "../shared/learning";
import { suggestPace } from "../shared/pace";
it("suggests bounded achievable schedules for every career", () => {
  for (const career of careers) {
    const state = newState(); state.profile.role = career.id;
    const pace = suggestPace(state);
    expect(pace.hoursPerWeek).toBeGreaterThanOrEqual(1);
    expect(pace.hoursPerWeek).toBeLessThanOrEqual(60);
    expect(pace.weeks).toBeGreaterThanOrEqual(1);
    expect(pace.weeks).toBeLessThanOrEqual(104);
    expect(pace.hoursPerWeek * pace.weeks).toBeGreaterThanOrEqual(pace.plannedHours);
    expect(pace.remainingHours).toBe(makePlan(state).remainingHours);
  }
});
it("recalculates for depth, starting point and progress without using the current deadline", () => {
  const s = newState(); Object.assign(s.profile, { learningMode: "skill", focusSkill: "sql", targetLevel: 1 });
  const beginner = suggestPace(s);
  s.profile.targetLevel = 3;
  expect(suggestPace(s).weeks).toBeGreaterThan(beginner.weeks);
  s.profile.assessment.sql = 2;
  const advancedStart = suggestPace(s);
  s.profile.weeks = 1; s.profile.hoursPerWeek = 60;
  expect(suggestPace(s)).toEqual(advancedStart);
  s.completed = makePlan(s).topics.map(topic => topic.id);
  s.completedProjects = ["project-skill-sql"];
  expect(suggestPace(s).remainingHours).toBe(0);
  expect(suggestPace(s).weeks).toBe(1);
});
it("includes a review buffer and leaves the profile unchanged", () => {
  const s = newState(); const before = structuredClone(s);
  const result = suggestPace(s);
  expect(result.plannedHours).toBe(Math.ceil(result.remainingHours * 1.15));
  expect(s).toEqual(before);
});
