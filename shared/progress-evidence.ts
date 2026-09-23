import { makePlan, projectFor, type LearningState } from "./learning";
import { practiceChallenges, practiceKey } from "./practice";
import { sqlLabChallenges } from "./sql-lab";

export function progressEvidence(state: LearningState) {
  const plan = makePlan(state);
  const topicIds = new Set(plan.topics.map(topic => topic.id));
  const challenges = practiceChallenges(state.profile).filter(c => topicIds.has(c.topicId));
  const attempted = new Set<string>();
  for (const challenge of challenges) {
    if (state.practiceAttempts.some(a => a.key === practiceKey(state.profile, challenge.id))) attempted.add(challenge.id);
  }
  const sqlIds = new Set(sqlLabChallenges.filter(c => topicIds.has(c.topicId)).map(c => c.id));
  for (const attempt of state.labAttempts) if ((attempt.sector || "banking") === state.profile.sector && sqlIds.has(attempt.challengeId)) attempted.add(attempt.challengeId);
  const latest = new Map<string, boolean>();
  for (const attempt of state.quizAttempts) if (attempt.kind === "topic" && topicIds.has(attempt.targetId)) latest.set(attempt.targetId, attempt.passed);
  const project = projectFor(state.profile);
  return {
    practiced: attempted.size,
    quizzesPassed: [...latest.values()].filter(Boolean).length,
    topicCount: topicIds.size,
    projectRecorded: state.completedProjects.includes(project.id) && Boolean(state.projectNotes[project.id]?.trim()),
  };
}
