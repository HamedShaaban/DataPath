import { expect, it } from "vitest";
import { placementQuestions, placementResult } from "../shared/placement";
import { newState, makePlan } from "../shared/learning";
import { skills } from "../shared/catalog";
const correct = (id: string) =>
  Object.fromEntries(placementQuestions(id).map(q => [q.id, q.answer]));
it("offers authored six-question checks for SQL and Python", () => {
  for (const id of ["sql", "python"]) {
    const questions = placementQuestions(id);
    expect(questions).toHaveLength(6);
    expect(questions.every(q => q.id.includes("technical"))).toBe(true);
    expect(new Set(questions.map(q => q.id)).size).toBe(6);
  }
  expect(placementQuestions("unknown")).toEqual([]);
});
it("requires complete valid answers and never places past advanced", () => {
  expect(placementResult("sql", {})).toBeNull();
  const answers = correct("sql");
  const first = placementQuestions("sql")[0];
  expect(placementResult("sql", { ...answers, [first.id]: -1 })).toBeNull();
  expect(placementResult("sql", { ...answers, [first.id]: 999 })).toBeNull();
  expect(placementResult("sql", answers)?.skipThrough).toBe(2);
});
it("requires consecutive foundation and intermediate success", () => {
  const qs = placementQuestions("python");
  const answers = correct("python");
  answers[qs[0].id] = (qs[0].answer + 1) % qs[0].options.length;
  expect(placementResult("python", answers)?.skipThrough).toBe(0);
  answers[qs[0].id] = qs[0].answer;
  answers[qs[2].id] = (qs[2].answer + 1) % qs[2].options.length;
  expect(placementResult("python", answers)?.skipThrough).toBe(1);
});
it("does not award course completion or certificates when applying a starting level", () => {
  const state = newState();
  state.profile.learningMode = "skill";
  state.profile.focusSkill = "sql";
  state.profile.targetLevel = 3;
  state.profile.assessment.sql = placementResult(
    "sql",
    correct("sql")
  )!.skipThrough;
  expect(makePlan(state).topics.every(topic => topic.level === 3)).toBe(true);
  expect(state.completed).toEqual([]);
  expect(state.certifiedSkills).toEqual([]);
  expect(state.quizAttempts).toEqual([]);
  state.profile.assessment.sql = 0;
  expect(makePlan(state).topics.some(topic => topic.level === 1)).toBe(true);
});
it("all available checks use valid authored questions at each level", () => {
  for (const skill of skills) {
    const qs = placementQuestions(skill.id);
    if (qs.length !== 6) {
      expect(placementResult(skill.id, correct(skill.id))).toBeNull();
      continue;
    }
    for (const level of [1, 2, 3])
      expect(qs.filter(q => q.level === level)).toHaveLength(2);
    expect(placementResult(skill.id, correct(skill.id))?.correct).toBe(6);
  }
});
