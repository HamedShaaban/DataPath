import { useState } from "react";
import { skillById, type Lang } from "@shared/catalog";
import { requirements, diagnosticScore, type LearningState } from "@shared/learning";
import { placementQuestions, placementResult } from "@shared/placement";

export function PlacementCheck({
  state,
  lang,
  skillIds,
  onApply,
}: {
  state: LearningState;
  lang: Lang;
  skillIds: string[];
  onApply: (skill: string, level: number) => void;
}) {
  const available = skillIds.filter(id => placementQuestions(id).length === 6);
  const [selected, setSelected] = useState(available[0] || "");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [applied, setApplied] = useState(false);
  const skill = available.includes(selected) ? selected : available[0];
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);
  if (!skill)
    return (
      <p>
        {t(
          "Placement checks are not yet available for these skills. Start from the basics or use the self-assessment below.",
          "فحوص تحديد المستوى غير متاحة لهذه المهارات بعد. ابدأ بالأساسيات أو استخدم التقييم الذاتي أدناه."
        )}
      </p>
    );
  const questions = placementQuestions(skill);
  const result = placementResult(skill, answers);
  const oldCheck = state.diagnostics[skill];
  const needsBasics = oldCheck && diagnosticScore(skill, oldCheck) < 1;
  const suggested = needsBasics ? 0 : Math.min(result?.skipThrough || 0, (requirements(state.profile)[skill] || 1) - 1);
  const starting = (skip: number) =>
    skip === 0
      ? t("Beginner", "مبتدئ")
      : skip === 1
        ? t("Intermediate", "متوسط")
        : t("Advanced", "متقدم");
  const apply = (skip: number) => {
    onApply(skill, skip);
    setApplied(true);
  };
  return (
    <section className="placement-check">
      <h3>{t("Find your starting point", "حدد نقطة البداية")}</h3>
      <p>
        {t(
          "Optional: six technical scenario questions, about five minutes. This is a screening suggestion, not a coding exam or certification. You can always keep every lesson.",
          "اختياري: ستة أسئلة تقنية في نحو خمس دقائق. هذه توصية أولية وليست اختبار برمجة أو شهادة. يمكنك الاحتفاظ بكل الدروس."
        )}
      </p>
      <label>
        {t("Skill to check", "المهارة")}
        <select
          value={skill}
          onChange={e => {
            setSelected(e.target.value);
            setAnswers({});
            setSubmitted(false);
            setApplied(false);
          }}
        >
          {available.map(id => (
            <option key={id} value={id}>
              {skillById[id].title[lang]}
            </option>
          ))}
        </select>
      </label>
      <p>
        {t(
          `${Object.keys(answers).length} of 6 answered`,
          `تمت الإجابة عن ${Object.keys(answers).length} من 6`
        )}
      </p>
      {questions.map((q, index) => (
        <fieldset key={q.id} disabled={submitted}>
          <legend>
            {index + 1}. {q.prompt[lang]}
          </legend>
          {q.options.map((option, optionIndex) => (
            <label className="checkline" key={optionIndex}>
              <input
                type="radio"
                name={`placement-${q.id}`}
                checked={answers[q.id] === optionIndex}
                onChange={() =>
                  setAnswers(current => ({ ...current, [q.id]: optionIndex }))
                }
              />
              {option[lang]}
            </label>
          ))}
          {submitted && (
            <p>
              {answers[q.id] === q.answer
                ? t("Correct. ", "صحيح. ")
                : t("Review: ", "راجع: ")}
              {q.explanation[lang]}
            </p>
          )}
        </fieldset>
      ))}
      {!submitted ? (
        <button
          type="button"
          className="primary"
          disabled={!result}
          onClick={() => setSubmitted(true)}
        >
          {t("Show my recommendation", "عرض التوصية")}
        </button>
      ) : (
        result && (
          <div className="placement-result" role="status">
            <h4>
              {t("Suggested start: ", "البداية المقترحة: ")}
              {starting(suggested)}
            </h4>
            <p>
              {result.correct}/6 ·{" "}
              {t(
                "Foundation / intermediate / advanced: ",
                "أساسيات / متوسط / متقدم: "
              )}
              {result.levelScores.map(score => `${score}/2`).join(" · ")}
            </p>
            {needsBasics && (
              <p>
                {t(
                  "An earlier skill check showed a foundation gap, so your recommendation stays at beginner.",
                  "أظهر فحص سابق فجوة أساسية، لذا تبقى التوصية عند مستوى المبتدئ."
                )}
              </p>
            )}
            <p>
              {t(
                "Applying this uses your starting-level setting to hide lower-level lessons from the plan. It does not mark them completed, pass quizzes or award certification. You can change it in self-assessment.",
                "يستخدم التطبيق إعداد البداية لإخفاء الدروس الأقل مستوى من الخطة. لا يكمل الدروس أو يجتاز الاختبارات أو يمنح شهادة. يمكنك تغييره في التقييم الذاتي."
              )}
            </p>
            <div className="button-row">
              <button
                type="button"
                className="primary"
                onClick={() => apply(suggested)}
              >
                {t("Use suggested start", "استخدام البداية المقترحة")}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                  setApplied(false);
                }}
              >
                {t("Try again", "إعادة المحاولة")}
              </button>
            </div>
          </div>
        )
      )}
      <button type="button" className="secondary" onClick={() => apply(0)}>
        {t(
          "Start from basics: keep all lessons",
          "ابدأ بالأساسيات: احتفظ بكل الدروس"
        )}
      </button>
      {applied && (
        <p role="status">
          {t(
            "Starting point updated in this setup. Finish setup to save it.",
            "تم تحديث البداية في الإعداد. أكمل الإعداد لحفظها."
          )}
        </p>
      )}
    </section>
  );
}
