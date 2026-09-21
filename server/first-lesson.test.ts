import { expect, it } from "vitest";
import { learningStateSchema, newState } from "../shared/learning";
it("keeps existing learner saves compatible and preserves guided progress", () => {
  expect(learningStateSchema.parse(newState()).firstLesson).toBeUndefined();
  for (let step = 0; step <= 4; step++) {
    const firstLesson = { step, completed: step === 4 };
    expect(
      learningStateSchema.parse({ ...newState(), firstLesson }).firstLesson
    ).toEqual(firstLesson);
  }
});
it("rejects invalid or inconsistent completion states", () => {
  for (const firstLesson of [
    { step: 2, completed: true },
    { step: 4, completed: false },
    { step: 5, completed: true },
  ]) {
    expect(
      learningStateSchema.safeParse({ ...newState(), firstLesson }).success
    ).toBe(false);
  }
});
