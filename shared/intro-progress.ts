import type { LearningState } from "./learning";

export function nextIntroStep(state: LearningState): "first" | "foundations" | null {
  if (state.profile.experience !== "new") return null;
  if (!state.firstLesson?.completed) return "first";
  return (state.foundationUnits?.[state.profile.sector]?.stage ?? 0) < 3
    ? "foundations"
    : null;
}
