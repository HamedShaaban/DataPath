import { skills } from "./catalog";
import type { LearningState, QuizQuestion } from "./learning";
export function recordQuizResult(
  state: LearningState,
  kind: LearningState["quizAttempts"][number]["kind"],
  targetId: string,
  questions: QuizQuestion[],
  answers: Record<string, number>,
  id: string,
  at: string
): LearningState {
  if (!questions.length) return state;
  const wrong = questions.filter(
    question => answers[question.id] !== question.answer
  );
  const score = Math.round(
    ((questions.length - wrong.length) / questions.length) * 100
  );
  const passed = score >= (kind === "skill" ? 95 : 80);
  const weakTopics = [...new Set(wrong.map(question => question.topicId))];
  const recovered = passed
    ? new Set(
        questions
          .map(question => question.topicId)
          .filter(topic => !weakTopics.includes(topic))
      )
    : new Set<string>();
  const affectedSkills = skills
    .filter(skill => skill.topics.some(topic => weakTopics.includes(topic.id)))
    .map(skill => skill.id);
  const certified = state.certifiedSkills.filter(
    skill =>
      !affectedSkills.includes(skill) &&
      !(kind === "skill" && skill === targetId && !passed)
  );
  if (kind === "skill" && passed && !affectedSkills.includes(targetId))
    certified.push(targetId);
  return {
    ...state,
    quizAttempts: [
      ...state.quizAttempts,
      { id, kind, targetId, score, passed, weakTopics, at },
    ].slice(-500),
    completed: state.completed.filter(topic => !weakTopics.includes(topic)),
    reviewTopics: [
      ...new Set([
        ...state.reviewTopics.filter(topic => !recovered.has(topic)),
        ...weakTopics,
      ]),
    ],
    certifiedSkills: [...new Set(certified)],
  };
}
