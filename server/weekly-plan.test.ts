import { expect, it } from "vitest";
import { weeklyStudyPlan } from "../shared/weekly-plan";
import { newState, makePlan } from "../shared/learning";
const now = new Date(2026, 8, 23, 12);
function learner() {
  const s = newState();
  s.profile.learningMode = "skill";
  s.profile.focusSkill = "sql";
  s.profile.targetLevel = 3;
  s.firstLesson = { step: 4, completed: true };
  return s;
}
it("keeps activities within the remaining goal and never mutates progress", () => {
  const s = learner();
  s.profile.hoursPerWeek = 4;
  s.sessions = [{ date: now.toISOString(), minutes: 70 }];
  const before = structuredClone(s);
  const plan = weeklyStudyPlan(s, now);
  expect(plan.remaining).toBe(170);
  expect(
    plan.activities.reduce((sum, a) => sum + a.minutes, 0) + plan.unallocated
  ).toBe(170);
  expect(plan.activities.every(a => a.minutes > 0)).toBe(true);
  expect(s).toEqual(before);
});
it("limits beginners to a guided first activity and stops at the weekly goal", () => {
  const s = newState();
  expect(weeklyStudyPlan(s, now).activities.map(a => a.kind)).toEqual([
    "basics",
  ]);
  s.profile.hoursPerWeek = 1;
  s.sessions = [{ date: now.toISOString(), minutes: 60 }];
  expect(weeklyStudyPlan(s, now).activities).toEqual([]);
});
it("schedules prerequisites first and makes a partial topic the last lesson", () => {
  const s = learner();
  s.profile.hoursPerWeek = 4;
  const plan = weeklyStudyPlan(s, now);
  const lessons = plan.activities.filter(a => a.kind === "lesson");
  expect(lessons.map(a => a.topicId)).toEqual(["sql-1", "sql-2"]);
  expect(lessons[1].prerequisites).toContain("sql-1");
  expect(lessons[1].partial).toBe(true);
  expect(plan.activities.find(a => a.kind === "practice")?.practiceInLab).toBe(
    true
  );
});
it("prioritizes weak topics and routes unavailable lab work to lesson practice", () => {
  const s = learner();
  s.reviewTopics = ["sql-1"];
  expect(weeklyStudyPlan(s, now).activities[0].kind).toBe("review");
  s.reviewTopics = [];
  s.completed = makePlan(s)
    .topics.filter(t => t.level < 3)
    .map(t => t.id);
  expect(
    weeklyStudyPlan(s, now).activities.find(a => a.kind === "practice")
      ?.practiceInLab
  ).toBe(false);
});
it("schedules the project only after lessons and avoids completed projects", () => {
  const s = learner();
  s.completed = makePlan(s).topics.map(t => t.id);
  expect(weeklyStudyPlan(s, now).activities.map(a => a.kind)).toEqual([
    "project",
  ]);
  s.completedProjects = ["project-skill-sql"];
  expect(weeklyStudyPlan(s, now).activities).toEqual([]);
});
