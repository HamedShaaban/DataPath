import { expect, it } from "vitest";
import { newState } from "../shared/learning";
import { nextIntroStep } from "../shared/intro-progress";
import { weeklyStudyPlan } from "../shared/weekly-plan";

it("keeps the next step and weekly plan on foundations until independently completed", () => {
  const state = newState();
  expect(nextIntroStep(state)).toBe("first");
  state.firstLesson = { step: 4, completed: true };
  expect(nextIntroStep(state)).toBe("foundations");
  expect(weeklyStudyPlan(state).activities[0]).toMatchObject({ kind: "basics", title: { en: "Reliable totals and averages" } });
  state.foundationUnits = { [state.profile.sector]: { stage: 2, answers: { count: "", total: "", average: "", explanation: "" } } };
  expect(nextIntroStep(state)).toBe("foundations");
  state.foundationUnits[state.profile.sector].stage = 3;
  expect(nextIntroStep(state)).toBeNull();
  expect(weeklyStudyPlan(state).activities[0].kind).toBe("lesson");
  state.profile.sector = "retail";
  expect(nextIntroStep(state)).toBe("foundations");
});

it("does not force introductory work on experienced learners", () => {
  const state = newState();
  state.profile.experience = "junior";
  expect(nextIntroStep(state)).toBeNull();
});
