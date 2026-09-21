import { skillById } from "./catalog";
import { makePlan, type LearningState } from "./learning";
export function interviewNextStep(state: LearningState, skillId: string) {
  if (!skillId || !skillById[skillId]) return null;
  const topics = makePlan(state).topics.filter(
    topic => topic.skillId === skillId
  );
  const weak = topics.find(topic => state.reviewTopics.includes(topic.id));
  const unfinished = topics.find(topic => !topic.done);
  const topic = weak || unfinished || topics[0];
  if (!topic) return null;
  return {
    topicId: topic.id,
    skillId,
    reason: weak
      ? "Revisit a topic already in your review queue."
      : unfinished
        ? "Build the next unfinished foundation for this skill."
        : "Refresh a foundation before another interview attempt.",
  };
}
