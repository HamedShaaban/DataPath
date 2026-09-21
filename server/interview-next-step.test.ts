import { expect, it } from "vitest";
import { newState, makePlan } from "../shared/learning";
import { interviewNextStep } from "../shared/interview-next-step";
it("prioritises a weak topic then the next unfinished topic", () => {
  const state = newState();
  const topics = makePlan(state).topics.filter(
    topic => topic.skillId === "sql"
  );
  expect(topics.length).toBeGreaterThan(1);
  expect(interviewNextStep(state, "sql")?.topicId).toBe(topics[0].id);
  state.reviewTopics = [topics[1].id];
  expect(interviewNextStep(state, "sql")?.topicId).toBe(topics[1].id);
});
it("does not invent a lesson for behavioural or unknown skills", () => {
  expect(interviewNextStep(newState(), "")).toBeNull();
  expect(interviewNextStep(newState(), "unknown")).toBeNull();
});
