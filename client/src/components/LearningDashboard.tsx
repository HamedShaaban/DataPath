import { nextIntroStep } from "@shared/intro-progress";
import { CatchUpPace } from "./CatchUpPace";
import { progressEvidence } from "@shared/progress-evidence";
import { WeeklyStudyPlan } from "./WeeklyStudyPlan";
import { learningPathTitle } from "@shared/learning";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  BookOpen,
  Check,
  Clock3,
  Code2,
  Database,
  FolderKanban,
  Network,
  RotateCcw,
  Sparkles,
  SquareTerminal,
  Target,
} from "lucide-react";
import { useState } from "react";
import { sectorById, skillById } from "@shared/catalog";
import { makePlan, type LearningState } from "@shared/learning";
import { dashboardWeek } from "@shared/dashboard-progress";

type Destination = "lab" | "projects" | "proof" | "roadmap";
export function LearningDashboard({
  state,
  openLesson,
  openPractice,
  navigate,
  editPath,
  adjustPace,
  startBasics,
}: {
  state: LearningState;
  openLesson: (skillId: string, topicId?: string) => void;
  openPractice: (skillId: string, topicId: string) => void;
  navigate: (page: Destination) => void;
  editPath: () => void;
  adjustPace: (hours: number) => void;
  startBasics: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const ar = state.profile.language === "ar";
  const t = (en: string, arabic: string) => (ar ? arabic : en);
  const title = (value: { en: string; ar: string }) =>
    ar ? value.ar : value.en;
  const plan = makePlan(state);
  const evidence = progressEvidence(state);
  const done = plan.topics.filter(topic => topic.done).length;
  const next = plan.topics.find(
    topic =>
      !topic.done &&
      topic.prerequisites.every(id => state.completed.includes(id))
  );
  const intro = nextIntroStep(state);
  const first = intro !== null;
  const foundations = intro === "foundations";
  const week = dashboardWeek(state);
  const skills = Object.keys(plan.required);
  const review = plan.topics.find(topic =>
    state.reviewTopics.includes(topic.id)
  );
  const formatTime = (minutes: number) =>
    `${Math.round((minutes / 60) * 10) / 10} ${t("h", "س")}`;
  return (
    <div className="learning-home">
      <section className="intelligence-header" aria-label={t("Your adaptive learning system", "نظام تعلمك المتكيف")}>
        <div className="intelligence-heading">
          <span className="system-label"><i /> DATAPATH LEARNING OS · ONLINE</span>
          <div>
            <span className="intelligence-mark"><Network size={24} /></span>
            <div>
              <small>{t("ACTIVE LEARNING GRAPH", "شبكة التعلم النشطة")}</small>
              <h2>{title(learningPathTitle(state.profile))}</h2>
              <p>{sectorById[state.profile.sector].title} · {t("Personalized from foundations to intelligent systems", "مسار شخصي من الأساسيات إلى الأنظمة الذكية")}</p>
            </div>
          </div>
        </div>
        <div className="intelligence-meta">
          <div><small>{t("MODE", "النمط")}</small><strong>{t("ADAPTIVE", "متكيف")}</strong></div>
          <div><small>{t("STACK", "المجال")}</small><strong>DATA + AI</strong></div>
          <button className="secondary" onClick={editPath}>
            {t("Configure path", "إعداد المسار")} <ArrowUpRight size={15} />
          </button>
        </div>
      </section>
      <div className="learning-start-grid">
        <section
          className="learning-spotlight"
          aria-labelledby="learning-next-title"
        >
          <span className="learning-kicker">
            <span />
            {t("Next lesson", "الدرس التالي")}
          </span>
          <div className="learning-spotlight-body">
            <span className="learning-icon">
              <BookOpen size={28} />
            </span>
            <div>
              <p className="learning-course-label">
                {first
                  ? t("No experience needed", "لا تحتاج خبرة سابقة")
                  : next
                    ? title(skillById[next.skillId].title)
                    : t("Put your skills to work", "طبّق مهاراتك")}
              </p>
              <h2 id="learning-next-title">
                {first
                  ? foundations ? t("Reliable totals and averages", "مجاميع ومتوسطات موثوقة") : t("Your first look at data", "خطوتك الأولى مع البيانات")
                  : next
                    ? title(next.title)
                    : t(
                        "Build something you can show",
                        "أنشئ مشروعاً يعكس مهاراتك"
                      )}
              </h2>
              <p>
                {first
                  ? foundations ? t("Build on your first achievement with guided totals and averages: no code needed.", "تابع إنجازك الأول بتدريب على المجاميع والمتوسطات دون برمجة.") : t(
                      "Start with a small table and one question. We’ll guide you through it.",
                      "ابدأ بجدول صغير وسؤال واحد. سنرشدك خطوة بخطوة."
                    )
                  : next
                    ? t(
                        "Pick up the next topic in your path, then put it into practice.",
                        "تعلّم الموضوع التالي في مسارك ثم طبّقه عملياً."
                      )
                    : t(
                        "Turn what you have learned into a portfolio project.",
                        "حوّل ما تعلمته إلى مشروع تضيفه لأعمالك."
                      )}
              </p>
            </div>
          </div>
          <div className="learning-spotlight-footer">
            <button
              className="learning-continue"
              onClick={() =>
                first
                  ? startBasics()
                  : next
                    ? openLesson(next.skillId, next.id)
                    : navigate("projects")
              }
            >
              {first
                ? foundations ? t("Continue the foundations", "تابع الأساسيات") : t(state.firstLesson?.step ? "Resume my first lesson" : "Start my first lesson", "تابع درسي الأول")
                : next
                  ? t("Continue learning", "متابعة التعلم")
                  : t("Open my project", "افتح مشروعي")}
              <ArrowRight size={19} />
            </button>
            <span>
              <Clock3 size={15} />
              {first
                ? t("Go at your own pace", "تعلّم على وتيرتك")
                : next
                  ? `${next.hours} ${t("hours for this topic · estimated", "ساعات لهذا الموضوع · تقديرياً")}`
                  : t("Your work, your pace", "مشروعك على وتيرتك")}
            </span>
          </div>
        </section>
        <aside className="learning-week" aria-labelledby="learning-week-title">
          <div className="learning-panel-heading">
            <h2 id="learning-week-title">{t("This week", "هذا الأسبوع")}</h2>
            <Target size={20} />
          </div>
          <p>{t("A little progress, regularly.", "تقدم بسيط، باستمرار.")}</p>
          <div className="learning-week-total">
            <strong>{formatTime(week.minutes)}</strong>
            <span>/ {formatTime(week.target)}</span>
          </div>
          <progress
            value={week.minutes}
            max={week.target}
            aria-label={t("Weekly learning goal", "هدف التعلم الأسبوعي")}
          />
          <p>
            {week.remaining
              ? `${formatTime(week.remaining)} ${t("left to reach your goal", "لتحقيق هدفك")}`
              : t(
                  "Weekly goal reached. Well done!",
                  "حققت هدف الأسبوع. أحسنت!"
                )}
          </p>
          <button className="text-button" onClick={() => navigate("proof")}>
            {t("View my progress", "عرض تقدمي")}
            <ArrowRight size={16} />
          </button>
          <small>
            {t(
              "Based on logged study sessions · resets Monday",
              "بناءً على جلسات الدراسة المسجلة · يبدأ الاثنين"
            )}
          </small>
        </aside>
      </div>
      <section className="learning-pipeline" aria-label={t("Intelligent data learning pipeline", "مسار تعلم البيانات الذكي")}>
        <div className="pipeline-heading">
          <span className="system-label">{t("LEARNING PIPELINE", "مسار التعلم")}</span>
          <p>{t("Open a skill to explore its lessons and practice.", "افتح مهارة لاستكشاف دروسها وتدريباتها.")}</p>
        </div>
        <div className="pipeline-track">
          {skills.slice(0, 4).map((id, index) => {
            const topics = plan.topics.filter(topic => topic.skillId === id);
            const completed = topics.filter(topic => topic.done).length;
            const Icon = [Database, Code2, BrainCircuit, Sparkles][index];
            return (
              <button key={id} className={next?.skillId === id ? "pipeline-node is-ready" : "pipeline-node"} onClick={() => openLesson(id)}>
                <span><Icon size={18} /></span>
                <small>{String(index + 1).padStart(2, "0")} · {completed}/{topics.length} {t("topics", "موضوعات")}</small>
                <strong>{title(skillById[id].title)}</strong>
                <b><ArrowUpRight size={13} /></b>
              </button>
            );
          })}
        </div>
      </section>
      <details className="learning-disclosure">
        <summary>{t("Plan this week", "خطط لهذا الأسبوع")}</summary>
      <CatchUpPace state={state} onApply={adjustPace} />
      <WeeklyStudyPlan state={state} start={activity => {
        if (activity.kind === "basics") startBasics();
        else if (activity.kind === "project") navigate("projects");
        else if (activity.kind === "practice" && activity.practiceInLab) openPractice(activity.skillId!, activity.topicId!);
        else openLesson(activity.skillId!, activity.topicId!);
      }} />
      </details>
      <div
        className="learning-shortcuts"
        aria-label={t("Learning shortcuts", "اختصارات التعلم")}
      >
        <button onClick={() => navigate("lab")}>
          <small className="shortcut-index">01 / EXECUTE</small>
          <span className="learning-shortcut-icon">
            <SquareTerminal size={22} />
          </span>
          <span>
            <strong>{t("Try it in practice", "جرّب عملياً")}</strong>
            <small>
              {t("Exercises matched to your path", "تمارين تناسب مسارك")}
            </small>
          </span>
          <ArrowUpRight size={19} />
        </button>
        <button
          onClick={() =>
            review ? openLesson(review.skillId, review.id) : navigate("roadmap")
          }
        >
          <small className="shortcut-index">02 / NAVIGATE</small>
          <span className="learning-shortcut-icon">
            <RotateCcw size={22} />
          </span>
          <span>
            <strong>
              {review
                ? t("Revisit a topic", "راجع موضوعاً")
                : t("Explore my roadmap", "استكشف مساري")}
            </strong>
            <small>
              {review
                ? title(review.title)
                : t("See how your skills connect", "اكتشف ترابط مهاراتك")}
            </small>
          </span>
          <ArrowUpRight size={19} />
        </button>
        <button onClick={() => navigate("projects")}>
          <small className="shortcut-index">03 / SHIP</small>
          <span className="learning-shortcut-icon">
            <FolderKanban size={22} />
          </span>
          <span>
            <strong>{t("Build my portfolio", "ابنِ ملف أعمالي")}</strong>
            <small>
              {t(
                "Turn learning into a real project",
                "حوّل التعلم إلى مشروع حقيقي"
              )}
            </small>
          </span>
          <ArrowUpRight size={19} />
        </button>
      </div>
      <details className="learning-disclosure">
        <summary>{t("Review my progress and skills", "راجع تقدمي ومهاراتي")}</summary>
      <section className="evidence-progress" aria-label={t("What your progress means", "ماذا يعني تقدمك")}>
        <h2>{t("Your progress, clearly", "تقدمك بوضوح")}</h2>
        <p>{t("These are different kinds of evidence: not interchangeable completion scores. Practice counts use retained attempts for your current path and industry.", "هذه أنواع مختلفة من الأدلة وليست درجات إكمال متبادلة. يعتمد التدريب على المحاولات المحفوظة لمسارك ومجالك الحاليين.")}</p>
        <div className="evidence-progress-grid">
          <button onClick={() => navigate("lab")}><strong>{evidence.practiced}</strong><span>{t("Exercises practised", "تمارين تمت ممارستها")}</span><small>{t("Attempted, whether passed or still improving", "محاولات ناجحة أو لا تزال تحتاج تحسيناً")}</small></button>
          <button onClick={() => navigate("roadmap")}><strong>{evidence.quizzesPassed}/{evidence.topicCount}</strong><span>{t("Topic quizzes passed", "اختبارات موضوعات مجتازة")}</span><small>{t("Based on each topic's latest quiz result", "حسب أحدث نتيجة لاختبار كل موضوع")}</small></button>
          <button onClick={() => navigate("projects")}><strong>{evidence.projectRecorded ? "1" : "0"}</strong><span>{t("Project demonstration recorded", "عرض مشروع مسجل")}</span><small>{t("Notes plus your completion check; self-reviewed, not independently verified", "ملاحظات مع تأكيد الإكمال؛ مراجعة ذاتية وليست تحققاً مستقلاً")}</small></button>
        </div>
      </section>
      <section
        className="learning-skills"
        aria-labelledby="learning-skills-title"
      >
        <div className="learning-panel-heading">
          <div>
            <span className="learning-kicker">
              {t("THE BIG PICTURE", "الصورة الكاملة")}
            </span>
            <h2 id="learning-skills-title">
              {t("Your skills, taking shape", "مهاراتك تنمو خطوة بخطوة")}
            </h2>
          </div>
          <span className="learning-completion">
            {done} / {plan.topics.length}{" "}
            {t("topics completed", "موضوعات مكتملة")}
          </span>
        </div>
        <div className="learning-skill-grid" id="dashboard-skill-list">
          {(showAll ? skills : skills.slice(0, 4)).map((id, index) => {
            const topics = plan.topics.filter(topic => topic.skillId === id);
            const completed = topics.filter(topic => topic.done).length;
            return (
              <button
                key={id}
                className="learning-skill-card"
                onClick={() => openLesson(id)}
              >
                <span className="learning-skill-top">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {completed === topics.length ? (
                    <Check size={17} />
                  ) : (
                    <ArrowUpRight size={17} />
                  )}
                </span>
                <strong>{title(skillById[id].title)}</strong>
                <span>
                  {completed} / {topics.length} {t("topics", "موضوعات")}
                </span>
                <progress
                  value={completed}
                  max={topics.length || 1}
                  aria-label={title(skillById[id].title)}
                />
              </button>
            );
          })}
        </div>
        {skills.length > 4 && (
          <button
            className="text-button learning-show-skills"
            aria-expanded={showAll}
            aria-controls="dashboard-skill-list"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll
              ? t("Show fewer skills", "عرض مهارات أقل")
              : t(
                  `Show all ${skills.length} skills`,
                  `عرض كل المهارات (${skills.length})`
                )}
          </button>
        )}
      </section>
      </details>
    </div>
  );
}
