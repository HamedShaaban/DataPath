import { ArrowDown, Check, Circle } from "lucide-react";

export function jumpToLessonStep(topicId: string, step: string) {
  const element = document.getElementById(`lesson-${topicId}-${step}`);
  element?.scrollIntoView({
    block: "start",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
  element?.focus({ preventScroll: true });
}

export function LessonSteps({
  topicId,
  arabic,
  prerequisitesReady,
}: {
  topicId: string;
  arabic: boolean;
  prerequisitesReady: boolean;
}) {
  const t = (en: string, ar: string) => (arabic ? ar : en);
  return (
    <div className="lesson-route">
      <p>
        {t(
          "Work through this lesson in three steps. Your notes and quiz results stay with your progress.",
          "تعلّم في ثلاث خطوات. تُحفظ ملاحظاتك ونتائج اختباراتك مع تقدمك."
        )}
      </p>
      <nav aria-label={t("Lesson steps", "خطوات الدرس")}>
        {[
          {
            id: "learn",
            title: t("Understand", "افهم"),
            detail: t("Goal + worked example", "الهدف والمثال"),
          },
          {
            id: "practice",
            title: t("Try it", "جرّب"),
            detail: t("Practice + your notes", "التطبيق وملاحظاتك"),
          },
          {
            id: "check",
            title: t("Check yourself", "اختبر نفسك"),
            detail: t("Quiz + completion", "الاختبار والإكمال"),
          },
        ].map((step, index) => (
          <button
            key={step.id}
            onClick={() => jumpToLessonStep(topicId, step.id)}
          >
            <span className="lesson-step-number">{index + 1}</span>
            <span>
              <strong>{step.title}</strong>
              <small>{step.detail}</small>
            </span>
            <ArrowDown size={15} />
          </button>
        ))}
      </nav>
      {!prerequisitesReady && (
        <p className="lesson-route-warning">
          {t(
            "You can explore this lesson now. Finish the prerequisites below before marking it complete.",
            "يمكنك استكشاف الدرس الآن. أكمل المتطلبات التالية قبل تحديده كمكتمل."
          )}
        </p>
      )}
    </div>
  );
}

export function LessonCompletion({
  arabic,
  hasEvidence,
  passed,
  prerequisitesReady,
}: {
  arabic: boolean;
  hasEvidence: boolean;
  passed: boolean;
  prerequisitesReady: boolean;
}) {
  const items = [
    [
      prerequisitesReady,
      arabic ? "المتطلبات السابقة مكتملة" : "Prerequisites completed",
    ],
    [
      hasEvidence,
      arabic ? "أضفت دليلاً أو ملاحظات" : "Evidence or notes added",
    ],
    [passed, arabic ? "اجتزت اختبار الموضوع" : "Topic quiz passed"],
  ] as const;
  return (
    <section
      className="lesson-completion"
      aria-label={
        arabic ? "متطلبات إكمال الدرس" : "Lesson completion requirements"
      }
    >
      <strong>
        {arabic ? "قبل إكمال الدرس" : "Before you complete this lesson"}
      </strong>
      <ul>
        {items.map(([complete, title]) => (
          <li key={title} className={complete ? "satisfied" : "pending"}>
            {complete ? (
              <Check size={15} aria-hidden="true" />
            ) : (
              <Circle size={15} aria-hidden="true" />
            )}
            <span>{title}</span>
            <small>
              {complete
                ? arabic
                  ? "تم"
                  : "Done"
                : arabic
                  ? "مطلوب"
                  : "Needed"}
            </small>
          </li>
        ))}
      </ul>
    </section>
  );
}
