import { makePlan, type LearningState } from "./learning";
export function catchUpPreview(state: LearningState, hoursPerWeek: number) {
  if (!Number.isInteger(hoursPerWeek) || hoursPerWeek < 1 || hoursPerWeek > 60)
    return null;
  const remainingHours = makePlan(state).remainingHours;
  const plannedHours = Math.ceil(remainingHours * 1.15);
  const weeks = Math.max(1, Math.ceil(plannedHours / hoursPerWeek));
  return {
    hoursPerWeek,
    weeks,
    remainingHours,
    canApply: weeks <= 104 && remainingHours > 0,
  };
}
export function applyCatchUp(
  state: LearningState,
  hoursPerWeek: number
): LearningState {
  const preview = catchUpPreview(state, hoursPerWeek);
  if (!preview?.canApply) return state;
  return {
    ...state,
    profile: { ...state.profile, hoursPerWeek, weeks: preview.weeks },
  };
}
