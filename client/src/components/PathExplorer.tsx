import { useEffect, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { careers, careerById, skillById, type Lang } from "@shared/catalog";
import { type LearningState } from "@shared/learning";
import { findCareers, previewCareer } from "@shared/path-explorer";

export function PathExplorer({
  state,
  lang,
  onChoose,
}: {
  state: LearningState;
  lang: Lang;
  onChoose: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const [preview, setPreview] = useState(state.profile.role);
  useEffect(() => setPreview(state.profile.role), [state.profile.role]);
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const groups = [
    ["all", t("All careers", "كل المسارات")],
    ["analytics", t("Analytics & BI", "التحليل وذكاء الأعمال")],
    ["engineering", t("Data engineering", "هندسة البيانات")],
    ["ai", t("AI & machine learning", "الذكاء الاصطناعي وتعلم الآلة")],
    ["governance", t("Quality & governance", "الجودة والحوكمة")],
    ["business", t("Business & products", "الأعمال والمنتجات")],
  ];
  const matches = findCareers(query, family);
  const role = careerById[preview];
  const plan = previewCareer(state, preview);
  return (
    <section
      className="path-explorer"
      aria-label={t("Explore career paths", "استكشف المسارات المهنية")}
    >
      <header>
        <h3>{t("Find a path that fits", "اختر المسار المناسب")}</h3>
        <p>
          {t(
            "Browse a role to preview it. Your choice changes only when you select Use this path.",
            "استعرض الدور لمعاينته. يتغير اختيارك فقط عند الضغط على استخدام هذا المسار."
          )}
        </p>
      </header>
      <div className="filterbar">
        <label className="search-field">
          <span>
            <Search size={15} aria-hidden="true" />{" "}
            {t("Search roles or tools", "ابحث عن دور أو أداة")}
          </span>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t(
              "Try Python, SQL or analyst…",
              "جرّب Python أو SQL أو محلل…"
            )}
          />
        </label>
        <label>
          {t("Career group", "مجموعة المسارات")}
          <select value={family} onChange={e => setFamily(e.target.value)}>
            {groups.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p role="status">
        {t(
          `${matches.length} of ${careers.length} careers`,
          `${matches.length} من ${careers.length} مسارًا`
        )}
      </p>
      <div className="path-explorer-layout">
        <div
          className="path-explorer-list"
          aria-label={t("Career previews", "معاينات المسارات")}
        >
          {matches.map(item => (
            <button
              type="button"
              key={item.id}
              aria-pressed={preview === item.id}
              className={
                preview === item.id
                  ? "path-preview-option selected"
                  : "path-preview-option"
              }
              onClick={() => setPreview(item.id)}
            >
              <strong>{item.title[lang]}</strong>
              <small>{item.description[lang]}</small>
              {state.profile.role === item.id && (
                <span>{t("Current choice", "الاختيار الحالي")}</span>
              )}
            </button>
          ))}
          {!matches.length && (
            <div className="workspace-empty-state">
              <h4>{t("No matching careers", "لا توجد مسارات مطابقة")}</h4>
              <p>
                {t(
                  "Try a broader term or another group.",
                  "جرّب كلمة أوسع أو مجموعة أخرى."
                )}
              </p>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setQuery("");
                  setFamily("all");
                }}
              >
                {t("Reset filters", "إعادة ضبط البحث")}
              </button>
            </div>
          )}
        </div>
        <article
          className="path-explorer-preview"
          aria-label={t("Path preview", "معاينة المسار")}
        >
          <span className="eyebrow">{t("PREVIEW", "معاينة")}</span>
          <h3>{role.title[lang]}</h3>
          <p>{role.description[lang]}</p>
          <div className="path-preview-stats">
            <strong>
              {plan.topics.filter(topic => !topic.done).length}
              <small>{t("remaining topics", "موضوعات متبقية")}</small>
            </strong>
            <strong>
              {plan.remainingHours}
              <small>{t("estimated hours", "ساعات تقديرية")}</small>
            </strong>
            <strong>
              {plan.recommendedWeeks}
              <small>{t("weeks at your pace", "أسابيع بوتيرتك")}</small>
            </strong>
          </div>
          <p>
            {t(
              `At ${state.profile.hoursPerWeek} hours/week, including the project. Existing progress and your additional tools are included; role target recommendations are restored when choosing. Estimates are not a job-readiness guarantee.`,
              `بمعدل ${state.profile.hoursPerWeek} ساعات أسبوعياً، شاملاً المشروع والتقدم السابق والأدوات الإضافية. يعيد الاختيار مستويات الدور الموصى بها. التقديرات لا تضمن الجاهزية للعمل.`
            )}
          </p>
          <h4>
            {t("Tools and target levels", "الأدوات والمستويات المستهدفة")}
          </h4>
          <ul className="path-preview-skills">
            {Object.entries(plan.required).map(([id, level]) => (
              <li key={id}>
                <span>{skillById[id].title[lang]}</span>
                <strong>
                  {level === 1
                    ? t("Beginner", "مبتدئ")
                    : level === 2
                      ? t("Intermediate", "متوسط")
                      : t("Advanced", "متقدم")}
                </strong>
              </li>
            ))}
          </ul>
          <details>
            <summary>{t("Browse included topics", "استعرض الموضوعات")}</summary>
            <ul className="path-preview-topics">
              {plan.topics.map(topic => (
                <li key={topic.id}>
                  {topic.title[lang]}{" "}
                  <small>
                    · {topic.hours} {t("hours", "ساعات")}
                    {topic.done ? t(" · completed", " · مكتمل") : ""}
                  </small>
                </li>
              ))}
            </ul>
          </details>
          <button
            type="button"
            className="primary"
            onClick={() => onChoose(preview)}
          >
            {t("Use this path", "استخدام هذا المسار")}{" "}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </article>
      </div>
    </section>
  );
}
