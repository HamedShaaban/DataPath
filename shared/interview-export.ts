import { learningPathTitle } from "./learning";
import { sectorById, type Lang } from "./catalog";
import { interviewBank, type LearningState } from "./learning";
export function interviewJournal(state: LearningState, language: Lang = "en") {
  const answered = interviewBank(state.profile).filter(question =>
    state.interviewAnswers[question.id]?.trim()
  );
  const heading =
    language === "ar" ? "سجل تدريب المقابلات" : "Interview practice journal";
  const note =
    language === "ar"
      ? "إجابات كتبها المتعلم. المعايير للمراجعة الذاتية وليست تقييماً مستقلاً. يشمل هذا الملف الأسئلة المجاب عنها في المسار الحالي فقط."
      : "Learner-written answers. Criteria are for self-review, not independent assessment. Includes answered questions in the current path only.";
  return {
    count: answered.length,
    text: [
      heading,
      `${learningPathTitle(state.profile)[language]} · ${sectorById[state.profile.sector].title}`,
      note,
      ...answered.map(
        (question, index) =>
          `${index + 1}. ${question.question[language]}\n\n${state.interviewAnswers[question.id].trim()}\n\n${language === "ar" ? "معايير المراجعة" : "Review criteria"}:\n${question.rubric.map(item => `- ${item[language]}`).join("\n")}`
      ),
    ].join("\n\n---\n\n"),
  };
}
