import { describe, it, expect } from "vitest";
import { careers, skills, skillById } from "../shared/catalog";
import { newState, profileSchema, learningStateSchema, requirements, makePlan, projectFor, learningPathTitle, topicQuiz } from "../shared/learning";
import { practiceChallenges, practiceKey } from "../shared/practice";
import { authoredLessons } from "../shared/authored-lessons";

describe("Flexible learning paths", () => {
  it("loads older profiles without changing their career requirements", () => {
    const { learningMode, focusSkill, targetLevel, skillTargets, ...legacy } = newState().profile;
    const parsed = profileSchema.parse(legacy);
    expect(parsed.learningMode).toBe("career");
    expect(requirements(parsed)).toEqual(requirements(newState().profile));
  });
  it("builds every skill at every depth without unrelated career requirements", () => {
    for (const skill of skills) for (const level of [1, 2, 3]) {
      const state = newState();
      Object.assign(state.profile, { learningMode: "skill", focusSkill: skill.id, targetLevel: level });
      const plan = makePlan(state);
      expect(plan.required[skill.id]).toBe(level);
      expect(plan.topics.filter(t => t.skillId === skill.id).every(t => t.level <= level)).toBe(true);
      expect(practiceChallenges(state.profile).every(c => Boolean(plan.required[c.skillId]))).toBe(true);
      expect(learningStateSchema.parse(state).profile).toEqual(state.profile);
    }
    const p = newState().profile;
    Object.assign(p, { learningMode: "skill", focusSkill: "sql", targetLevel: 1, tools: ["powerbi"] });
    expect(requirements(p)).toEqual({ sql: 1 });
    expect(learningPathTitle(p).en).toContain("SQL");
  });
  it("preserves prerequisite minimums while applying career target overrides", () => {
    const p = newState().profile;
    p.role = "bi-developer";
    p.skillTargets = { sql: 1, powerbi: 3 };
    expect(requirements(p).sql).toBeGreaterThanOrEqual(2);
    expect(requirements(p).powerbi).toBe(3);
    expect(() => profileSchema.parse({ ...p, targetLevel: 4 })).toThrow();
    expect(() => profileSchema.parse({ ...p, focusSkill: "unknown" })).toThrow();
  });
  it("gives every new role valid topics, practice and a project", () => {
    for (const id of ["marketing-data-analyst", "risk-data-analyst", "bi-developer", "data-platform-engineer"]) {
      const s = newState(); s.profile.role = id;
      expect(careers.some(c => c.id === id)).toBe(true);
      expect(makePlan(s).topics.length).toBeGreaterThan(10);
      expect(practiceChallenges(s.profile).length).toBeGreaterThan(1);
      expect(projectFor(s.profile).brief.en).toBeTruthy();
    }
  });
  it("tracks skill projects and practice separately without breaking career keys", () => {
    const s = newState();
    expect(practiceKey(s.profile, "test")).toBe("data-analyst:general:test");
    s.profile.learningMode = "skill";
    const before = makePlan(s).remainingHours;
    const project = projectFor(s.profile);
    s.completedProjects = [project.id];
    expect(learningStateSchema.parse(s).completedProjects).toContain(project.id);
    expect(makePlan(s).remainingHours).toBe(before - project.hours);
    expect(practiceKey(s.profile, "test")).toBe("skill-sql:general:test");
  });
  it("adds stable advanced IDs with authored examples and five technical questions", () => {
    for (const id of ["sql", "python"]) {
      expect(skillById[id].topics.slice(0, 9).map(t => t.id)).toEqual(Array.from({length: 9}, (_, i) => `${id}-${i + 1}`));
      expect(skillById[id].topics.at(-1)?.prerequisites).toEqual([`${id}-9`]);
      expect(authoredLessons[`${id}-10`].example).toBeTruthy();
      expect(topicQuiz(`${id}-10`).every(q => q.id.includes("technical"))).toBe(true);
    }
  });
});
