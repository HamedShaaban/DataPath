import { copy, skillById } from "./catalog";
import { topicQuiz } from "./learning";
import { technicalQuizBank } from "./quiz-bank";

/** Use authored technical questions only; generic fallback questions cannot place a learner. */
export function placementQuestions(skillId: string) {
  if (skillId === "python") {
    const basics = [
      [
        "python-1",
        1,
        "What is sum([2, 0, 3])?",
        "ما نتيجة sum([2, 0, 3])؟",
        ["5", "3", "2"],
        0,
        "Sum adds numeric values, including zero.",
        "يجمع sum القيم العددية بما فيها الصفر.",
      ],
      [
        "python-2",
        1,
        "A function only prints a total. What does it return without return?",
        "دالة تطبع المجموع فقط. ماذا تعيد دون return؟",
        ["The printed total / المجموع المطبوع", "None", "0"],
        1,
        "Printing displays a value. Without return the function returns None.",
        "تعرض الطباعة القيمة. دون return تعيد الدالة None.",
      ],
      [
        "python-4",
        2,
        "Which test treats 0 as a known value?",
        "أي فحص يعتبر الصفر قيمة معروفة؟",
        ["if value", "if not value", "if value is not None"],
        2,
        "Zero is false in a truth test but is not missing. Compare with None explicitly.",
        "الصفر غير صادق منطقياً لكنه ليس مفقوداً. قارنه صراحة مع None.",
      ],
      [
        "python-5",
        2,
        "For a filtered average, which count belongs in the denominator?",
        "في متوسط بعد التصفية، أي عدد يوضع في المقام؟",
        [
          "All source rows / كل الصفوف",
          "Only included known values / القيم المعروفة المشمولة فقط",
          "Only missing rows / الصفوف المفقودة فقط",
        ],
        1,
        "The numerator and denominator must describe the same eligible observations; handle no matches separately.",
        "يجب أن يمثل البسط والمقام نفس المشاهدات المؤهلة، مع معالجة غياب النتائج منفصلاً.",
      ],
    ] as const;
    return [
      ...basics.map(
        (
          [topicId, level, en, ar, options, answer, explanation, explanationAr],
          index
        ) => ({
          id: `python-technical-placement-${index}`,
          topicId,
          level,
          prompt: copy(en, ar),
          options: options.map(option => copy(option, option)),
          answer,
          explanation: copy(explanation, explanationAr),
        })
      ),
      ...topicQuiz("python-10")
        .slice(1, 3)
        .map(question => ({ ...question, level: 3 })),
    ];
  }
  const skill = skillById[skillId];
  if (!skill) return [];
  return [1, 2, 3].flatMap(level => {
    const topic = skill.topics.find(
      topic =>
        topic.level === level && (technicalQuizBank[topic.id]?.length || 0) >= 2
    );
    return topic
      ? topicQuiz(topic.id)
          .slice(0, 2)
          .map(question => ({ ...question, level }))
      : [];
  });
}
export function placementResult(
  skillId: string,
  answers: Record<string, number>
) {
  const questions = placementQuestions(skillId);
  if (
    questions.length !== 6 ||
    questions.some(
      q =>
        !Number.isInteger(answers[q.id]) ||
        answers[q.id] < 0 ||
        answers[q.id] >= q.options.length
    )
  )
    return null;
  const levelScores = [1, 2, 3].map(
    level =>
      questions.filter(q => q.level === level && answers[q.id] === q.answer)
        .length
  );
  // Passing a later pair cannot compensate for missing foundations. Never skip advanced work.
  const skipThrough = levelScores[0] !== 2 ? 0 : levelScores[1] !== 2 ? 1 : 2;
  return {
    levelScores,
    skipThrough,
    correct: levelScores.reduce((sum, score) => sum + score, 0),
  };
}
