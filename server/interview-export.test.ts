import { expect, it } from "vitest";
import { newState } from "../shared/learning";
import { interviewJournal } from "../shared/interview-export";
it("exports only nonempty answers belonging to the current path", () => {
  const state = newState();
  state.interviewAnswers = {
    behavioral: "My own example",
    "not-in-path": "Unrelated",
    "technical-sql": "   ",
  };
  const result = interviewJournal(state);
  expect(result.count).toBe(1);
  expect(result.text).toContain("My own example");
  expect(result.text).toContain("Situation and task");
  expect(result.text).not.toContain("Unrelated");
});
it("supports empty and Arabic journals without changing learner state", () => {
  const state = newState();
  const original = JSON.stringify(state);
  expect(interviewJournal(state).count).toBe(0);
  expect(interviewJournal(state, "ar").text).toContain("سجل تدريب المقابلات");
  expect(JSON.stringify(state)).toBe(original);
});
