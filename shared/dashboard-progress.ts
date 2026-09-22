import type { LearningState } from "./learning";

/** Monday-based local calendar week, matching the learner's browser timezone. */
export function dashboardWeek(state: LearningState, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const minutes = state.sessions.reduce((sum, session) => {
    const date = new Date(session.date);
    return date >= start && date <= now ? sum + session.minutes : sum;
  }, 0);
  const target = state.profile.hoursPerWeek * 60;
  return {
    minutes,
    target,
    percent: Math.min(100, Math.round((minutes / target) * 100)),
    remaining: Math.max(0, target - minutes),
  };
}
