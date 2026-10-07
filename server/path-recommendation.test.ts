import { expect, it } from "vitest";
import { newState, makePlan } from "../shared/learning";
import { recommendPaths, fitRecommendedPace } from "../shared/path-recommendation";
it("changes career suggestions with the learner's preferred work", () => {
 const profile = newState().profile;
 expect(recommendPaths(profile, "engineering", 2)[0].role.family).toBe("engineering");
 expect(recommendPaths(profile, "business", 0)[0].role.family).toBe("business");
 expect(recommendPaths(profile, "ai", 2)[0].role.family).toBe("ai");
});
it("uses available hours without silently increasing the learner's commitment", () => {
 const state = newState(); state.profile.learningMode = "skill"; state.profile.focusSkill = "sql";
 state.profile.hoursPerWeek = 4;
 const slow = fitRecommendedPace(state);
 state.profile.hoursPerWeek = 12;
 const fast = fitRecommendedPace(state);
 expect(slow.hoursPerWeek).toBe(4); expect(fast.hoursPerWeek).toBe(12);
 expect(slow.weeks).toBeGreaterThan(fast.weeks);
});
it("adjusts the workload to declared skills without granting completion", () => {
 const state = newState(); state.profile.learningMode = "skill"; state.profile.focusSkill = "sql";
 const before = makePlan(state).remainingHours;
 state.profile.assessment.sql = 1;
 expect(makePlan(state).remainingHours).toBeLessThan(before);
 expect(state.completed).toEqual([]);
 expect(fitRecommendedPace(state).weeks).toBeGreaterThanOrEqual(1);
});
