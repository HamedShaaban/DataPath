import type { LearningState } from "./learning";
import { sqlLabChallenges } from "./sql-lab";
import type { SqlExecutionResult } from "./sql-engine";

export function passedLabIds(state: LearningState) {
  const valid = new Set(sqlLabChallenges.map(challenge => challenge.id));
  const sector = state.profile.sector;
  const stored = state.passedLabIds
    .filter(
      key =>
        key.startsWith(`${sector}:`) ||
        (sector === "banking" && !key.includes(":"))
    )
    .map(key => key.split(":").pop()!);
  const attempts = state.labAttempts
    .filter(
      attempt => attempt.passed && (attempt.sector || "banking") === sector
    )
    .map(attempt => attempt.challengeId);
  return new Set([...stored, ...attempts].filter(id => valid.has(id)));
}

export function recordLabAttempt(
  state: LearningState,
  challengeId: string,
  query: string,
  result: SqlExecutionResult,
  at = new Date().toISOString()
): LearningState {
  const challenge = sqlLabChallenges.find(item => item.id === challengeId);
  if (!challenge) return state;
  const passed = new Set([
    ...state.passedLabIds.map(id => (id.includes(":") ? id : `banking:${id}`)),
    ...state.labAttempts
      .filter(attempt => attempt.passed)
      .map(attempt => `${attempt.sector || "banking"}:${attempt.challengeId}`),
  ]);
  if (result.passed) passed.add(`${state.profile.sector}:${challengeId}`);
  return {
    ...state,
    passedLabIds: [...passed],
    labAttempts: [
      ...state.labAttempts,
      {
        challengeId,
        sector: state.profile.sector,
        topicId: challenge.topicId,
        query,
        passed: result.passed,
        checksPassed: result.checks.filter(check => check.passed).length,
        checksTotal: result.checks.length,
        feedback: [
          result.message,
          ...result.checks
            .filter(check => !check.passed)
            .map(check => check.label),
        ]
          .join(" · ")
          .slice(0, 500),
        at,
      },
    ].slice(-50),
    reviewTopics:
      !result.passed && result.executed
        ? [...new Set([...state.reviewTopics, challenge.topicId])]
        : state.reviewTopics,
    evidence:
      result.passed && !state.evidence[challenge.topicId]?.trim()
        ? {
            ...state.evidence,
            [challenge.topicId]: `Passed DataPath SQL lab: ${challenge.title}.\n\n${query.slice(0, 760)}`,
          }
        : state.evidence,
  };
}
