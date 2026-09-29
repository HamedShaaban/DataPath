import { makePlan, type LearningState } from "./learning";

/** Transparent planning heuristic, not a prediction of an individual's learning speed. */
export function suggestPace(state: LearningState) {
  const remainingHours = makePlan(state).remainingHours;
  const weeklyBaseline = state.profile.learningMode === "skill"
    ? state.profile.experience === "new" ? 3 : 5
    : state.profile.experience === "new" ? 4 : 6;
  const plannedHours = Math.ceil(remainingHours * 1.15);
  const hoursPerWeek = Math.min(60, Math.max(weeklyBaseline, Math.ceil(plannedHours / 104)));
  const weeks = Math.max(1, Math.min(104, Math.ceil(plannedHours / hoursPerWeek)));
  return { remainingHours, plannedHours, hoursPerWeek, weeks };
}
