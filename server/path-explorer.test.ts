import { expect, it } from "vitest";
import { findCareers, previewCareer } from "../shared/path-explorer";
import { careers } from "../shared/catalog";
import { newState, makePlan } from "../shared/learning";

it("searches bilingual roles and tools with normalized multi-word queries", () => {
  expect(findCareers("  PYTHON   SQL ").length).toBeGreaterThan(0);
  expect(findCareers("محلل").some(role => role.id === "data-analyst")).toBe(
    true
  );
  expect(findCareers("no-such-tool")).toEqual([]);
  expect(findCareers(" ")).toHaveLength(careers.length);
});
it("combines family and keyword filters", () => {
  const matches = findCareers("sql", "engineering");
  expect(matches.length).toBeGreaterThan(0);
  expect(matches.every(role => role.family === "engineering")).toBe(true);
  expect(findCareers("", "all")).toHaveLength(careers.length);
});
it("previews exactly the selected plan while preserving the current workspace", () => {
  const state = newState();
  state.profile.tools = ["python"];
  state.profile.skillTargets = { sql: 1 };
  state.profile.hoursPerWeek = 4;
  state.completed = ["sql-1"];
  const original = structuredClone(state);
  const preview = previewCareer(state, "bi-developer");
  expect(state).toEqual(original);
  expect(preview).toEqual(
    makePlan({
      ...state,
      profile: {
        ...state.profile,
        role: "bi-developer",
        learningMode: "career",
        skillTargets: {},
      },
    })
  );
  expect(preview.required.python).toBe(2);
  expect(preview.required.sql).toBe(3);
  expect(preview.topics.find(topic => topic.id === "sql-1")?.done).toBe(true);
  expect(preview.recommendedWeeks).toBe(Math.ceil(preview.remainingHours / 4));
});
