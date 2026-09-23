import { useEffect, useState } from "react";
import { catchUpPreview } from "@shared/catch-up";
import type { LearningState } from "@shared/learning";
export function CatchUpPace({
  state,
  onApply,
}: {
  state: LearningState;
  onApply: (hours: number) => void;
}) {
  const [hours, setHours] = useState(String(state.profile.hoursPerWeek));
  const [applied, setApplied] = useState(false);
  useEffect(() => {
    setHours(String(state.profile.hoursPerWeek));
  }, [state.profile.hoursPerWeek]);
  const preview = catchUpPreview(state, Number(hours));
  const t = (en: string, ar: string) =>
    state.profile.language === "ar" ? ar : en;
  return (
    <details className="catch-up-pace">
      <summary>
        {t(
          "Missed some study time? Adjust my plan",
          "فاتك وقت للدراسة؟ عدّل خطتك"
        )}
      </summary>
      <div>
        <h3>{t("Make room to catch up", "امنح نفسك وقتًا للاستدراك")}</h3>
        <p>
          {t(
            "Choose what you can manage now. We will recalculate the remaining study duration with 15% extra time for review. Completed work, notes, quiz results and study logs stay intact.",
            "اختر ما يمكنك الالتزام به الآن. سنعيد حساب المدة المتبقية مع 15٪ وقت إضافي للمراجعة. يبقى عملك المكتمل وملاحظاتك ونتائج الاختبارات وسجل الدراسة محفوظًا."
          )}
        </p>
        <label>
          {t("Hours per week from now", "ساعات الدراسة الأسبوعية الآن")}
          <input
            type="number"
            min={1}
            max={60}
            step={1}
            value={hours}
            onChange={e => {
              setHours(e.target.value);
              setApplied(false);
            }}
          />
        </label>
        {preview ? (
          <p role="status">
            {preview.remainingHours === 0
              ? t(
                  "Your planned lessons and project are complete. No catch-up schedule is needed.",
                  "دروسك ومشروعك المخططان مكتملان. لا حاجة لجدول استدراك."
                )
              : t(
                  `${preview.remainingHours} learning hours remain. Suggested remaining duration: ${preview.weeks} weeks at ${preview.hoursPerWeek} hours/week.`,
                  `تبقى ${preview.remainingHours} ساعة تعلم. المدة المتبقية المقترحة: ${preview.weeks} أسبوعًا بمعدل ${preview.hoursPerWeek} ساعات أسبوعياً.`
                )}
          </p>
        ) : (
          <p role="status">
            {t(
              "Enter a whole number from 1 to 60.",
              "أدخل عددًا صحيحًا من 1 إلى 60."
            )}
          </p>
        )}
        {preview && preview.weeks > 104 && (
          <p>
            {t(
              "This exceeds the 104-week planning limit. Increase weekly hours or narrow your path before applying.",
              "يتجاوز ذلك حد التخطيط البالغ 104 أسابيع. زد الساعات أو قلل نطاق المسار قبل التطبيق."
            )}
          </p>
        )}
        <p>
          {t(
            "This updates your pace, not a fixed calendar deadline. Time already logged this week still counts toward the weekly goal.",
            "يحدث هذا وتيرتك وليس موعداً تقويمياً ثابتاً. يظل الوقت المسجل هذا الأسبوع محسوباً ضمن الهدف الأسبوعي."
          )}
        </p>
        <button
          type="button"
          className="primary"
          disabled={!preview?.canApply}
          onClick={() => {
            onApply(Number(hours));
            setApplied(true);
          }}
        >
          {t("Apply revised pace", "تطبيق الوتيرة المعدلة")}
        </button>
        {applied && (
          <p role="status">
            {t(
              "Pace updated. If signed in, use Save progress to keep this change in your account.",
              "تم تحديث الوتيرة. إذا كنت مسجلاً، استخدم حفظ التقدم للاحتفاظ بالتغيير في حسابك."
            )}
          </p>
        )}
      </div>
    </details>
  );
}
