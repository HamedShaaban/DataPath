import { useState } from "react";
import { weeklyStudyPlan, type WeeklyActivity } from "@shared/weekly-plan";
import type { LearningState } from "@shared/learning";

export function WeeklyStudyPlan({
  state,
  start,
}: {
  state: LearningState;
  start: (activity: WeeklyActivity) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const plan = weeklyStudyPlan(state);
  const ar = state.profile.language === "ar";
  const t = (en: string, arabic: string) => (ar ? arabic : en);
  const labels = {
    basics: t("Start here", "ابدأ هنا"),
    lesson: t("Learn", "تعلّم"),
    practice: t("Practise", "تدرّب"),
    review: t("Review a weak topic", "راجع نقطة ضعف"),
    project: t("Build your project", "ابنِ مشروعك"),
  };
  const activities = expanded ? plan.activities : plan.activities.slice(0, 6);
  return (
    <section className="weekly-study-plan" aria-labelledby="weekly-plan-title">
      <div className="section-top">
        <h2 id="weekly-plan-title">
          {t("Your study plan this week", "خطة دراستك هذا الأسبوع")}
        </h2>
        <span className="soft-tag">
          {Math.round(plan.remaining)}{" "}
          {t("minutes left in your goal", "دقيقة متبقية من هدفك")}
        </span>
      </div>
      <p>
        {t(
          "A suggested order for the remaining Monday–Sunday weekly goal. Logged study time reduces the budget; it never completes a lesson. The plan adjusts as you learn. Split longer activities across several sittings.",
          "ترتيب مقترح لبقية هدف الأسبوع من الاثنين للأحد. يقلل الوقت المسجل المدة المتبقية لكنه لا يكمل درساً. تتكيف الخطة مع تقدمك؛ قسّم الأنشطة الطويلة إلى جلسات."
        )}
      </p>
      <ol>
        {activities.map(activity => {
          const locked = !activity.prerequisites.every(id =>
            state.completed.includes(id)
          );
          return (
            <li key={activity.id}>
              <div>
                <span className="eyebrow">
                  {activity.kind === "practice" && !activity.practiceInLab
                    ? t("Practise with the lesson task", "تدرّب بمهمة الدرس")
                    : labels[activity.kind]}
                </span>
                <h3>{activity.title[ar ? "ar" : "en"]}</h3>
                <p>
                  {activity.minutes} {t("min suggested", "دقيقة مقترحة")}
                  {activity.partial
                    ? t(
                        " · continue next week if needed",
                        " · تابع الأسبوع القادم إن لزم"
                      )
                    : ""}
                </p>
                {locked && (
                  <small>
                    {t(
                      "Finish earlier prerequisites before starting this activity.",
                      "أكمل المتطلبات السابقة قبل بدء هذا النشاط."
                    )}
                  </small>
                )}
              </div>
              <button
                type="button"
                className="secondary"
                disabled={locked}
                onClick={() => start(activity)}
              >
                {t("Open activity", "فتح النشاط")}
              </button>
            </li>
          );
        })}
      </ol>
      {!plan.activities.length && (
        <p role="status">
          {plan.remaining === 0
            ? t(
                "Your logged time meets this week's goal. You can rest or continue from your roadmap.",
                "حققت مدة هدف هذا الأسبوع. يمكنك الراحة أو متابعة المسار."
              )
            : t(
                "No new activity is queued. Open your roadmap to review your learning and assessment requirements.",
                "لا توجد أنشطة جديدة في القائمة. افتح المسار لمراجعة متطلبات التعلم والتقييم."
              )}
        </p>
      )}
      {plan.activities.length > 6 && (
        <button
          type="button"
          className="text-button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? t("Show less", "عرض أقل")
            : t("Show full week", "عرض الأسبوع كاملاً")}
        </button>
      )}
      {plan.unallocated > 0 && plan.activities.length > 0 && (
        <p className="muted">
          {t(
            `${plan.unallocated} minutes remain unassigned. Finish the suggested work, then return for your next activities.`,
            `تبقى ${plan.unallocated} دقيقة غير موزعة. أكمل العمل المقترح ثم عد للأنشطة التالية.`
          )}
        </p>
      )}
    </section>
  );
}
