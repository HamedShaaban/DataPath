import type { LearningState } from "./learning";
const DAY = 86_400_000;
/** A transparent practice heuristic, not an estimate of mastery. */
export function reviewSchedule(
  attempts: LearningState["quizAttempts"],
  targetId: string,
  now = Date.now(),
  weakTopics: string[] = [],
  skillIds: string[] = []
) {
  const relevantWeakTopics = [...new Set(weakTopics)].filter(topic =>
    skillIds.some(skill => topic.startsWith(`${skill}-`))
  );
  if (relevantWeakTopics.length)
    return {
      due: true,
      dueAt: null,
      intervalDays: 0,
      reason: `${relevantWeakTopics.length} topic${relevantWeakTopics.length === 1 ? " needs" : "s need"} reinforcement in these skills. Revisit the lessons before retrying this review.`,
    };
  const history = attempts
    .filter(
      attempt =>
        attempt.kind === "cumulative" &&
        attempt.targetId === targetId &&
        Number.isFinite(Date.parse(attempt.at)) &&
        Date.parse(attempt.at) <= now
    )
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const last = history.at(-1);
  if (!last)
    return {
      due: true,
      dueAt: null,
      intervalDays: 0,
      reason: "Start your first review to set a practice schedule.",
    };
  if (!last.passed)
    return {
      due: true,
      dueAt: last.at,
      intervalDays: 0,
      reason:
        "Your last review needs another pass. Revisit the weak topics, then retry.",
    };
  // Same-day repeats cannot advance multiple spacing intervals.
  const successfulDays = new Set<string>();
  for (let index = history.length - 1; index >= 0; index--) {
    if (!history[index].passed) break;
    successfulDays.add(new Date(history[index].at).toISOString().slice(0, 10));
  }
  const intervalDays = [1, 3, 7, 14, 30][Math.min(successfulDays.size - 1, 4)];
  const dueAt = new Date(
    Date.parse(last.at) + intervalDays * DAY
  ).toISOString();
  return {
    due: Date.parse(dueAt) <= now,
    dueAt,
    intervalDays,
    reason: `Your successful reviews on ${successfulDays.size} distinct day${successfulDays.size === 1 ? "" : "s"} set a ${intervalDays}-day interval. You can still practise sooner.`,
  };
}
