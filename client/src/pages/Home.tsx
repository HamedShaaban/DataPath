import { GuidedSetup } from "@/components/GuidedSetup";
import { progressEvidence } from "@shared/progress-evidence";
import { nextIntroStep } from "@shared/intro-progress";
import { ProjectBlueprint } from "../components/ProjectBlueprint";
import { applyCatchUp } from "@shared/catch-up";
import { suggestPace } from "@shared/pace";
import { PlacementCheck } from "@/components/PlacementCheck";
import { PathExplorer } from "@/components/PathExplorer";
import { learningPathTitle } from "@shared/learning";
import { LessonSteps, LessonCompletion } from "@/components/LessonSteps";
import { Fragment } from "react";
import { LearningDashboard } from "@/components/LearningDashboard";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FoundationsUnit } from "@/components/FoundationsUnit";
import { recordQuizResult } from "@shared/quiz-progress";
import { sqlChallengeForTopic } from "@shared/practice-navigation";
import {
  guestStorageKey,
  readGuestStorage,
  readGuestForImport,
  writeGuestStorage,
} from "@/lib/guest-storage";
import { selectedProof } from "@shared/proof-export";
import { interviewNextStep } from "@shared/interview-next-step";
import { interviewJournal } from "@shared/interview-export";
import { LessonFeedback } from "@/components/LessonFeedback";
import { ProjectChecklist } from "@/components/ProjectChecklist";
import { InterviewGuide } from "@/components/InterviewGuide";
import { LessonGlossary } from "@/components/LessonGlossary";
import { reviewSchedule } from "@shared/review-schedule";
import { reviewReadiness } from "@shared/review-readiness";
import { FirstLesson } from "@/components/FirstLesson";
import { CareerLanding } from "@/components/CareerLanding";
import { practiceMeta } from "@shared/practice-recommendation";
import { PracticeHub } from "@/components/PracticeHub";
import { practiceChallenges } from "@shared/practice";
import { sqlContext, sqlVocabulary } from "@shared/sql-context";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  Download,
  GraduationCap,
  LayoutDashboard,
  Map,
  Menu,
  MessageSquare,
  Settings,
  MessageSquareText,
  Target,
  BriefcaseBusiness,
  FolderKanban,
  Layers3,
  LogOut,
  Clock3,
  Wrench,
  BrainCircuit,
  Camera,
  Moon,
  Sun,
  BadgeCheck,
  RotateCcw,
  FileCheck2,
  SquareTerminal,
} from "lucide-react";
import {
  careers,
  careerById,
  skills,
  skillById,
  paidResources,
  videoResources,
  toolbox,
  sources,
  businessSectors,
  sectorById,
  type Lang,
  type Copy,
} from "@shared/catalog";
import {
  newState,
  learningStateSchema,
  makePlan,
  requirements,
  discover,
  diagnosticFor,
  diagnosticScore,
  interviewBank,
  projectFor,
  topicQuiz,
  levelQuiz,
  skillQuiz,
  cumulativeQuiz,
  latestPassed,
  lessonGuide,
  skillEvidenceMatrix,
  type QuizQuestion,
  type LearningState,
  type Profile,
} from "@shared/learning";
import { sqlLabChallenges, sqlLabTables } from "@shared/sql-lab";
import { passedLabIds, recordLabAttempt } from "@shared/sql-progress";
import { runSqlInWorker } from "@/lib/run-sql";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
const storageKey = guestStorageKey;
const platformLanguage = (_saved: Lang): Lang => "en";
const careerGuidance: Record<
  string,
  { work: string; fit: string; outcome: string }
> = {
  analytics: {
    work: "Investigate business questions, define reliable metrics and explain what action the evidence supports.",
    fit: "You enjoy finding patterns, checking assumptions and communicating with decision makers.",
    outcome:
      "A strong portfolio shows a question, reproducible analysis, decision and measurable business consequence.",
  },
  business: {
    work: "Translate stakeholder problems into processes, requirements, metrics and testable data solutions.",
    fit: "You enjoy ambiguity, facilitation and making technical work useful to people.",
    outcome:
      "A strong portfolio shows discovery, scope, process, acceptance criteria and benefits.",
  },
  engineering: {
    work: "Design dependable data systems, models and pipelines that other teams can trust and operate.",
    fit: "You enjoy systems, debugging, automation and preventing failures before they reach users.",
    outcome:
      "A strong portfolio proves reliability, tests, observability, recovery and clear architecture decisions.",
  },
  ai: {
    work: "Frame prediction or generation problems, build models and evaluate whether they are useful, safe and reliable.",
    fit: "You enjoy statistics, experimentation, code and careful evaluation of uncertain outputs.",
    outcome:
      "A strong portfolio includes a baseline, evaluation data, error analysis, limitations and deployment thinking.",
  },
  governance: {
    work: "Make data discoverable, defined, secure, compliant and trustworthy across an organisation.",
    fit: "You value precision, accountability, controls and collaboration across business and technology.",
    outcome:
      "A strong portfolio demonstrates ownership, lineage, quality rules, risk controls and operating process.",
  },
};
function readGuest() {
  try {
    return readGuestStorage(localStorage);
  } catch {
    return newState();
  }
}

function download(name: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
async function avatarFromFile(file: File) {
  if (!file.type.startsWith("image/") || file.size > 5_000_000)
    throw new Error("Invalid image");
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d")!;
  const scale = Math.max(128 / bitmap.width, 128 / bitmap.height);
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;
  context.drawImage(
    bitmap,
    (128 - width) / 2,
    (128 - height) / 2,
    width,
    height
  );
  bitmap.close();
  const value = canvas.toDataURL("image/jpeg", 0.7);
  if (value.length > 35000) throw new Error("Compressed image is too large");
  return value;
}
type Page =
  | "dashboard"
  | "roadmap"
  | "lab"
  | "proof"
  | "resources"
  | "interviews"
  | "projects"
  | "career"
  | "coach"
  | "tools"
  | "settings";
const navigation: Array<[Page, string, string, typeof Map]> = [
  ["dashboard", "Overview", "نظرة عامة", LayoutDashboard],
  ["roadmap", "My roadmap", "خارطة تعلمي", Map],
  ["lab", "Practice lab", "معمل التطبيق", SquareTerminal],
  ["proof", "Proof ledger", "سجل الإثبات", BadgeCheck],
  ["resources", "Resource library", "مكتبة المصادر", BookOpen],
  ["tools", "Tools setup", "أدوات العمل", Wrench],
  ["interviews", "Interview studio", "استوديو المقابلات", MessageSquare],
  ["projects", "My projects", "مشاريعي", FolderKanban],
  ["career", "Career toolkit", "أدوات التوظيف", BriefcaseBusiness],
  ["coach", "AI coach", "المدرب الذكي", MessageSquareText],
];
export default function Home() {
  const [state, setState] = useState<LearningState>(readGuest);
  const [page, setPage] = useState<Page>("dashboard");
  const [editing, setEditing] = useState(false);
  const [exploreAll, setExploreAll] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileNavToggle = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 850px)");
    const resetNavigation = () => {
      setMobileNavOpen(false);
      if (mobile.matches && navigationRef.current?.contains(document.activeElement)) {
        mobileNavToggle.current?.focus();
      } else if (!mobile.matches && document.activeElement === mobileNavToggle.current) {
        navigationRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    mobile.addEventListener("change", resetNavigation);
    return () => mobile.removeEventListener("change", resetNavigation);
  }, []);
  const [exportSkills, setExportSkills] = useState<string[]>([]);
  const [independentPractice, setIndependentPractice] = useState(false);
  const [startedSetup, setStartedSetup] = useState(false);
  const [notice, setNotice] = useState("");
  const [revision, setRevision] = useState(0);
  const [guestOffer, setGuestOffer] = useState<LearningState | null>(null);
  const [dirty, setDirty] = useState(false);
  const [ready, setReady] = useState(false);
  const [stateOwner, setStateOwner] = useState<number | "guest">("guest");
  const [labTopicTarget, setLabTopicTarget] = useState("");
  const [labSkillTarget, setLabSkillTarget] = useState("");
  const [labTarget, setLabTarget] = useState("");
  const [lessonTarget, setLessonTarget] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [proofHandle, setProofHandle] = useState("");
  const [proofPrompt, setProofPrompt] = useState("");
  useEffect(() => {
    if (page !== "roadmap" || !lessonTarget) return;
    const element = document.getElementById(
      `lesson-${lessonTarget}`
    ) as HTMLDetailsElement | null;
    if (element) {
      const levelGroup = element.closest<HTMLDetailsElement>(".roadmap-level"); if (levelGroup) levelGroup.open = true; element.open = true;
      element.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
      element.querySelector("summary")?.focus();
    }
  }, [page, lessonTarget, selectedSkill]);
  const [search, setSearch] = useState("");
  const [coachInput, setCoachInput] = useState("");
  const [coachReply, setCoachReply] = useState("");
  const [consent, setConsent] = useState(false);
  const [mockIndex, setMockIndex] = useState(0);
  const [mockStarted, setMockStarted] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const [rubric, setRubric] = useState<string[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const authDialog = useRef<HTMLFormElement>(null);
  const authReturnFocus = useRef<HTMLElement | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("datapath.theme");
    } catch {}
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  const me = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const caps = trpc.datapath.capabilities.useQuery();
  const load = trpc.datapath.load.useQuery(
    { scope: me.data?.id || 1 },
    {
      enabled: Boolean(me.data),
      retry: false,
      refetchOnWindowFocus: false,
    }
  );
  const save = trpc.datapath.save.useMutation();
  const logout = trpc.auth.logout.useMutation();
  const revokeSessions = trpc.auth.revokeAllSessions.useMutation();
  const login = trpc.auth.login.useMutation();
  const register = trpc.auth.register.useMutation();
  const remove = trpc.datapath.remove.useMutation();
  const coach = trpc.datapath.coach.useMutation();
  const proofSettings = trpc.proof.settings.useQuery({ accountId: me.data?.id ?? 0 }, {
    enabled: Boolean(me.data),
    retry: false,
  });
  const proofPreview = trpc.proof.preview.useQuery({ accountId: me.data?.id ?? 0 }, {
    enabled: Boolean(me.data),
    retry: false,
  });
  const enableProof = trpc.proof.enable.useMutation();
  const disableProof = trpc.proof.disable.useMutation({ onError: () => setNotice("Could not change proof page visibility. Try again.") });
  const targetVisibility = trpc.proof.setTargetVisibility.useMutation({ onError: () => setNotice("Could not change target visibility. Try again.") });
  const credentialVisibility = trpc.proof.setCredentialVisibility.useMutation({ onError: () => setNotice("Could not change credential visibility. Try again.") });
  const utils = trpc.useUtils();
  useEffect(() => {
    setProofHandle(proofSettings.data?.handle ?? "");
  }, [proofSettings.data?.handle]);
  const refreshProof = async () => {
    await Promise.all([
      utils.proof.settings.invalidate(),
      utils.proof.preview.invalidate(),
    ]);
  };
  const loadedUser = useRef<number | null>(null);
  const workspaceEpoch = useRef(0);
  const updateEpoch = workspaceEpoch.current;
  useEffect(() => {
    setPage("dashboard");
    setEditing(false);
    setCoachReply("");
    setRubric([]);
    setMockStarted(null);
    setLabSkillTarget("");
    setLabTopicTarget("");
    setLabTarget("");
    setLessonTarget("");
    setSelectedSkill("");
    setIndependentPractice(false);
    setExportSkills([]);
    setProofPrompt("");
    setProofHandle("");
  }, [stateOwner]);
  const latestState = useRef(state);
  latestState.current = state;
  const lang = platformLanguage(state.profile.language);
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const txt = (c: Copy) => c[lang];
  const update = (fn: (s: LearningState) => LearningState) => {
    if (updateEpoch !== workspaceEpoch.current) return;
    setState(current =>
      updateEpoch === workspaceEpoch.current ? fn(current) : current
    );
    setDirty(true);
  };
  const patchProfile = (patch: Partial<Profile>) =>
    update(s => ({ ...s, profile: { ...s.profile, ...patch } }));
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("datapath.theme", theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    if (me.isLoading) return;
    if (!me.data) {
      workspaceEpoch.current++;
      loadedUser.current = null;
      setGuestOffer(null);
      setState(readGuest());
      setStateOwner("guest");
      setReady(true);
    } else if (load.isSuccess && loadedUser.current !== me.data.id) {
      workspaceEpoch.current++;
      setState(load.data?.state || newState());
      let candidate: LearningState | null = null;
      if (!load.data) {
        try {
          const guest = readGuestForImport(localStorage);
          if (guest.onboarded) candidate = guest;
        } catch { /* An unreadable save is never imported or overwritten. */ }
      }
      setGuestOffer(candidate);
      setStateOwner(me.data.id);
      setRevision(load.data?.revision || 0);
      loadedUser.current = me.data.id;
      setDirty(false);
      setReady(true);
    } else if (loadedUser.current !== me.data.id) {
      setReady(false);
    }
  }, [me.isLoading, me.data, load.isSuccess, load.data]);
  useEffect(() => {
    if (!ready || me.data || stateOwner !== "guest") return;
    try {
      const { recovered } = writeGuestStorage(localStorage, state);
      if (recovered)
        setNotice(
          t(
            "An unreadable guest save was preserved in browser recovery storage. This workspace starts fresh; keep a copy of your browser data before clearing storage.",
            "تم الاحتفاظ بنسخة المتصفح غير المقروءة في تخزين الاستعادة. تبدأ هذه المساحة من جديد؛ احتفظ ببيانات المتصفح قبل مسحها."
          )
        );
      setDirty(false);
    } catch {
      setNotice(
        t(
          "Browser storage is full or unavailable. Export your progress.",
          "تخزين المتصفح ممتلئ أو غير متاح. صدّر تقدمك."
        )
      );
    }
  }, [state, ready, me.data, stateOwner]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    if (!mockStarted) return;
    const id = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(id);
  }, [mockStarted]);
  const plan = makePlan(state),
    role = careerById[state.profile.role],
    sector = sectorById[state.profile.sector],
    project = projectFor(state.profile),
    questions = interviewBank(state.profile);
  const completed = plan.topics.filter(t => t.done).length;
  const percent = plan.topics.length
    ? Math.round((completed / plan.topics.length) * 100)
    : 100;
  const next = plan.topics.find(
    t => !t.done && t.prerequisites.every(id => state.completed.includes(id))
  );
  const requiredIds = Object.keys(plan.required);
  const resourceSearch = search.trim().toLowerCase();
  const matchingResourceIds = requiredIds.filter(id =>
    `${skillById[id].title.en} ${skillById[id].title.ar} ${skillById[id].resource.title}`
      .toLowerCase().includes(resourceSearch)
  );
  const matchingPaidResources = state.profile.resources === "mixed"
    ? paidResources.filter(resource =>
        resource.skills.some(id => requiredIds.includes(id)) &&
        resource.title.toLowerCase().includes(resourceSearch))
    : [];
  const resourceCount = matchingResourceIds.length + matchingPaidResources.length;
  const evidenceMatrix = skillEvidenceMatrix(state);
  const practiceEvidence = progressEvidence(state);
  const reviewNext = skills
    .flatMap(skill =>
      skill.topics.map(topic => ({ ...topic, skillId: skill.id }))
    )
    .find(topic => state.reviewTopics.includes(topic.id));
  const assessmentDue = evidenceMatrix.find(row => row.status === "assessment");
  const question = questions[mockIndex % questions.length];
  async function saveCloud() {
    const snapshot = state;
    if (new TextEncoder().encode(JSON.stringify(snapshot)).length > 60000) {
      setNotice(
        t(
          "Your workspace exceeds the 60 KB account limit. Export a backup and shorten older notes.",
          "تجاوزت مساحة العمل حد الحساب البالغ ٦٠ كيلوبايت. صدّر نسخة واختصر الملاحظات القديمة."
        )
      );
      return;
    }
    try {
      const result = await save.mutateAsync({ state: snapshot, revision });
      if (updateEpoch !== workspaceEpoch.current) return;
      setRevision(result.revision);
      if (snapshot === latestState.current) setDirty(false);
      setNotice(
        t("Progress saved to your account.", "تم حفظ التقدم في حسابك.")
      );
    } catch {
      if (updateEpoch !== workspaceEpoch.current) return;
      setNotice(
        t(
          "Could not save. If another tab changed this account, export your work and reload before saving again.",
          "تعذر الحفظ. إذا غيّرت علامة تبويب أخرى الحساب، صدّر عملك وأعد التحميل قبل الحفظ مجدداً."
        )
      );
    }
  }
  async function submitAuth() {
    setAuthError("");
    try {
      if (authMode === "register") await register.mutateAsync(authForm);
      else
        await login.mutateAsync({
          email: authForm.email,
          password: authForm.password,
        });
      setAuthOpen(false);
      if (authMode === "register") setStartedSetup(true);
      setReady(false);
      await utils.proof.settings.reset();
      await utils.proof.preview.reset();
      await utils.auth.me.invalidate();
      await utils.datapath.load.invalidate();
    } catch (error: any) {
      setAuthError(
        error?.message || t("Could not sign in.", "تعذر تسجيل الدخول.")
      );
    }
  }
  async function askCoach(mode: "coach" | "interview" | "cv", message: string) {
    setCoachReply("");
    try {
      const result = await coach.mutateAsync({
        state,
        mode,
        message,
        questionId: mode === "interview" ? question.id : undefined,
        consent: true,
      });
      setCoachReply(
        result.message +
          (result.topicIds.length
            ? "\n\n" +
              result.topicIds
                .map(id => txt(plan.topics.find(t => t.id === id)!.title))
                .join(" · ")
            : "")
      );
    } catch {
      setCoachReply(
        t(
          "The coach is unavailable or your request limit has been reached. Try again later.",
          "المدرب غير متاح أو وصلت إلى حد الطلبات. حاول لاحقاً."
        )
      );
    }
  }
  const aiAvailable = Boolean(caps.data?.ai && me.data);
  const aiControls = (
    <>
      <label className="checkline">
        <input
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
        />
        {t(
          "Share my learning profile and this request with the AI provider. Do not include sensitive information.",
          "مشاركة ملف تعلمي وهذا الطلب مع مزود الذكاء الاصطناعي. لا تُدرج معلومات حساسة."
        )}
      </label>
      {!aiAvailable && (
        <p className="muted">
          {t(
            "AI feedback requires sign-in and a configured provider. Curated practice is always free and available.",
            "تتطلب ملاحظات الذكاء الاصطناعي تسجيل الدخول وإعداد المزود. التدريب المنسق مجاني ومتاح دائماً."
          )}
        </p>
      )}
    </>
  );
  if (me.isLoading || !ready) {
    return (
      <div className="loading">
        <Layers3 />
        <h1>DataPath</h1>
        <p>
          {load.isError
            ? t("Your account could not be loaded.", "تعذر تحميل حسابك.")
            : t("Opening your learning space…", "جارٍ فتح مساحة تعلمك…")}
        </p>
        {load.isError && (
          <button onClick={() => load.refetch()}>
            {t("Try again", "حاول مجدداً")}
          </button>
        )}
      </div>
    );
  }
  return (
    <div
      className={`app-shell studio-shell${!state.onboarded ? " discovery-shell" : ""}${!state.onboarded && !startedSetup ? " welcome-shell" : ""}`}
    >
      <a className="skip-to-content" href="#main-content">
        {t("Skip to main content", "انتقل إلى المحتوى الرئيسي")}
      </a>
      <aside className={`sidebar${mobileNavOpen ? " mobile-nav-open" : ""}`}
        onKeyDown={event => {
          if (event.key === "Escape" && mobileNavOpen) {
            event.preventDefault();
            setMobileNavOpen(false);
            mobileNavToggle.current?.focus();
          }
        }}
      >
        <a
          className="brand"
          href="#"
          onClick={e => {
            e.preventDefault();
            setPage("dashboard");
            setMobileNavOpen(false);
          }}
        >
          <span className="brand-mark">
            <Layers3 size={23} />
          </span>
          <span className="brand-name">
            DataPath<span className="brand-dot">.</span>
          </span>
        </a>
        <button
          ref={mobileNavToggle}
          className="mobile-nav-toggle secondary"
          aria-expanded={mobileNavOpen}
          aria-controls="workspace-navigation"
          onClick={() => setMobileNavOpen(open => !open)}
        >
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          {t("Menu", "القائمة")}
        </button>
        <div className="workspace-label">
          {t("YOUR LEARNING SPACE", "مساحة تعلمك")}
        </div>
        <nav id="workspace-navigation" ref={navigationRef} aria-label={t("Main navigation", "التنقل الرئيسي")}>
          {navigation
            .filter(
              ([id]) =>
                state.profile.experience !== "new" ||
                exploreAll || mobileNavOpen ||
                ["dashboard", "lab", "proof"].includes(id)
            )
            .map(([id, en, ar, Icon]) => (
              <Fragment key={id}>
              {["dashboard", "resources", "interviews"].includes(id) && <span className="navigation-section-label">{id === "dashboard" ? t("LEARN", "تعلّم") : id === "resources" ? t("RESOURCES", "مصادر") : t("YOUR CAREER", "مستقبلك المهني")}</span>}
              <button
                key={id}
                className={page === id ? "nav-item active" : "nav-item"}
                aria-current={page === id ? "page" : undefined}
                aria-label={t(en, ar)}
                title={t(en, ar)}
                onClick={() => {
                  setPage(id);
                  setCoachReply("");
                  if (mobileNavOpen) {
                    setMobileNavOpen(false);
                    requestAnimationFrame(() => document.getElementById("main-content")?.focus());
                  }
                }}
              >
                <Icon size={19} />
                <span>
                  {state.profile.experience === "new" && id === "dashboard"
                    ? t("My next lesson", "درسي القادم")
                    : state.profile.experience === "new" && id === "proof"
                      ? t("My progress", "تقدمي")
                      : t(en, ar)}
                </span>
                {id === "coach" && <span className="tiny-pill">AI</span>}
              </button>
              </Fragment>
            ))}
          {state.profile.experience === "new" && (
            <button
              className="nav-item explore-toggle"
              onClick={() => setExploreAll(value => !value)}
              aria-expanded={exploreAll}
            >
              <Compass size={19} />
              <span>{exploreAll ? "Show less" : "Explore all"}</span>
            </button>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="free-note">
            <span className="mini-icon">
              <GraduationCap size={19} />
            </span>
            <strong>
              {t("Your ambition. No paywall.", "طموحك بلا حواجز.")}
            </strong>
            <p>
              {t(
                "Every DataPath feature is free. Build your next chapter.",
                "كل مزايا DataPath مجانية. ابنِ فصلك القادم."
              )}
            </p>
          </div>
          <button
            className={
              page === "settings"
                ? "nav-item settings-nav active"
                : "nav-item settings-nav"
            }
            onClick={() => setPage("settings")}
          >
            <Settings size={19} />
            {t("Settings & profile", "الإعدادات والملف")}
          </button>
          <div className="user-row">
            <span className="avatar">
              {state.profile.avatarData ? (
                <img src={state.profile.avatarData} alt="" />
              ) : (
                (state.profile.displayName || me.data?.name || "D").charAt(0)
              )}
            </span>
            <div>
              <strong>
                {state.profile.displayName ||
                  me.data?.name ||
                  t("Your learning journey", "رحلتك التعليمية")}
              </strong>
              <small>
                {me.data
                  ? t("Personal account", "حساب شخصي")
                  : t(
                      "Guest · saved on this browser",
                      "زائر · محفوظ في هذا المتصفح"
                    )}
              </small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span className="breadcrumb">
            <button onClick={() => setPage("dashboard")}>
              {t("My workspace", "مساحة عملي")}
            </button>{" "}
            <span>/</span>{" "}
            <b>
              {navigation.find(n => n[0] === page)?.[lang === "ar" ? 2 : 1] ||
                t("Settings", "الإعدادات")}
            </b>
          </span>
          <div className="top-actions">
            <button
              className="icon-button theme-toggle"
              onClick={() =>
                setTheme(value => (value === "light" ? "dark" : "light"))
              }
              title={t(
                theme === "light" ? "Dark mode" : "Light mode",
                theme === "light" ? "Dark mode" : "Light mode"
              )}
              aria-label={t(
                theme === "light" ? "Enable dark mode" : "Enable light mode",
                theme === "light" ? "تشغيل Dark mode" : "تشغيل Light mode"
              )}
            >
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            {me.data ? (
              <>
                <button
                  className="small primary"
                  disabled={save.isPending || !dirty}
                  onClick={saveCloud}
                >
                  {save.isPending
                    ? t("Saving…", "جارٍ الحفظ…")
                    : dirty
                      ? t("Save progress", "حفظ التقدم")
                      : t("Saved", "محفوظ")}
                </button>
                <button
                  className="icon-button"
                  title={t("Sign out", "تسجيل الخروج")}
                  disabled={logout.isPending}
                  onClick={async () => {
                    if (
                      dirty &&
                      !window.confirm(
                        t(
                          "Unsaved changes will be lost. Sign out?",
                          "ستفقد التغييرات غير المحفوظة. هل تريد الخروج؟"
                        )
                      )
                    )
                      return;
                    try {
                      await logout.mutateAsync();
                      setNotice("");
                      await utils.proof.settings.cancel();
                      await utils.proof.preview.cancel();
                      utils.proof.settings.reset();
                      utils.proof.preview.reset();
                      utils.datapath.load.reset();
                      setReady(false);
                      utils.auth.me.setData(undefined, null);
                    } catch {
                      setNotice(t("Could not sign out. You are still signed in; try again when the connection is available.", "تعذر تسجيل الخروج. ما زلت مسجلاً؛ حاول مجدداً عند توفر الاتصال."));
                    }
                  }}
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <button
                className="small primary"
                onClick={event => {
                  authReturnFocus.current = event.currentTarget;
                  setAuthOpen(true);
                }}
              >
                {t("Sign in", "تسجيل الدخول")}
              </button>
            )}
            <button
              className="mobile-settings icon-button"
              title={t("Settings & profile", "الإعدادات والملف")}
              onClick={() => { setPage("settings"); setMobileNavOpen(false); }}
            >
              <Settings size={17} />
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button
                aria-label={t("Dismiss", "إغلاق")}
                onClick={() => setNotice("")}
              >
                ×
              </button>
            </div>
          )}
          {proofPrompt && (
            <section className="card proof-prompt" role="status">
              <div>
                <strong>{proofPrompt}</strong>
                <p>Choose what appears publicly, preview it, then publish when you are ready.</p>
              </div>
              <button className="primary small" onClick={() => { setProofPrompt(""); setPage("settings"); }}>
                Proof page settings
              </button>
              <button className="text-button" onClick={() => setProofPrompt("")}>Dismiss</button>
            </section>
          )}
          {guestOffer && me.data && stateOwner === me.data.id && !dirty && revision === 0 && (
            <section className="card" aria-label="Continue your guest progress">
              <h2>{t("Continue where you left off", "تابع من حيث توقفت")}</h2>
              <p>{t("This account has no saved workspace yet. Your guest learning path and progress are still in this browser. Bring them into this account, then choose Save progress to keep them across devices.", "لا توجد مساحة محفوظة لهذا الحساب بعد. ما زال مسارك وتقدمك كزائر في هذا المتصفح. استوردهما ثم اختر حفظ التقدم للاحتفاظ بهما عبر الأجهزة.")}</p>
              <button className="primary" onClick={() => {
                update(() => guestOffer);
                setGuestOffer(null);
                setStartedSetup(false);
                setNotice(t("Guest progress imported. Save progress to keep it in your account.", "تم استيراد تقدم الزائر. احفظ التقدم للاحتفاظ به في حسابك."));
              }}>{t("Continue with my guest progress", "المتابعة بتقدمي كزائر")}</button>
              <button className="secondary" onClick={() => setGuestOffer(null)}>{t("Start a separate account path", "بدء مسار منفصل للحساب")}</button>
              <p>{t("Your original guest save stays in this browser.", "تبقى نسخة تقدم الزائر الأصلية في هذا المتصفح.")}</p>
            </section>
          )}
          {!state.onboarded && !startedSetup ? (
            <CareerLanding
              signedIn={Boolean(me.data)}
              onAccount={mode => { authReturnFocus.current = document.activeElement as HTMLButtonElement; setAuthMode(mode); setAuthError(""); setAuthOpen(true); }}
              onStart={() => {
                setStartedSetup(true);
                window.scrollTo({ top: 0 });
              }}
            />
          ) : !state.onboarded || editing ? (
            <ProfileSetup
              key={stateOwner}
              state={state}
              done={profile => {
                update(s => ({ ...s, profile, onboarded: true }));
                setSelectedSkill("");
                setLessonTarget("");
                setLabSkillTarget("");
                setLabTopicTarget("");
                setLabTarget("");
                setEditing(false);
                setPage("dashboard");
              }}
              cancel={
                state.onboarded
                  ? () => setEditing(false)
                  : () => setStartedSetup(false)
              }
            />
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <h1>
                    {page === "dashboard"
                      ? t("Let’s make progress.", "لنتقدم خطوة جديدة.")
                      : navigation.find(n => n[0] === page)?.[
                          lang === "ar" ? 2 : 1
                        ] ||
                        t("Settings & profile", "الإعدادات والملف الشخصي")}
                  </h1>
                  <p>
                    {page === "dashboard"
                      ? t(
                          "Continue your lessons, practise skills and review your progress.",
                          "اتجاه واضح. مهارات مناسبة. ومستقبل مهني تبنيه بنفسك."
                        )
                      : txt(learningPathTitle(state.profile)) +
                        " · " +
                        t(
                          "Built around your goals, at your pace.",
                          "مصمم لأهدافك وعلى وتيرتك."
                        )}
                  </p>
                </div>
              </div>
              {page === "dashboard" && <LearningDashboard state={state}
                adjustPace={hours => update(current => applyCatchUp(current, hours))}
                openPractice={(skillId, topicId) => { setLabSkillTarget(skillId); setLabTopicTarget(topicId); setIndependentPractice(true); setPage("lab"); }}
                editPath={() => setEditing(true)}
                navigate={target => { setExploreAll(true); setPage(target); }}
                startBasics={() => { const element = document.getElementById(nextIntroStep(state) === "foundations" ? "dashboard-foundations" : "dashboard-basics"); element?.scrollIntoView({ block: "start" }); element?.focus(); }}
                openLesson={(skillId, topicId = "") => { setSelectedSkill(skillId); setLessonTarget(topicId); setExploreAll(true); setPage("roadmap"); }}
              />}
              {(page === "dashboard" || (page === "lab" && !independentPractice)) &&
                state.profile.experience === "new" && (
                  <section id="dashboard-basics" tabIndex={-1} aria-label={t("Your first lessons", "دروسك الأولى")}>
                    <FirstLesson
                      key={stateOwner}
                      nextLabel={nextIntroStep(state) === "foundations" ? "Next: practise totals and averages" : undefined}
                      progress={state.firstLesson}
                      save={firstLesson =>
                        update(current => ({ ...current, firstLesson }))
                      }
                      next={() => {
                        if (nextIntroStep(state) === "foundations") {
                          const element = document.getElementById("dashboard-foundations");
                          element?.scrollIntoView({ block: "start" });
                          element?.focus();
                          return;
                        }
                        setExploreAll(true);
                        setPage("roadmap");
                      }}
                    />
                    {state.firstLesson?.completed && (
                      <div id="dashboard-foundations" tabIndex={-1}><FoundationsUnit
                        key={`${stateOwner}:${state.profile.sector}`}
                        state={state}
                        update={update}
                        openLesson={topicId => {
                          setSelectedSkill(topicId.split("-")[0]);
                          setLessonTarget(topicId);
                          setExploreAll(true);
                          setPage("roadmap");
                        }}
                      /></div>
                    )}
                    <p className="beginner-save-note">
                      {me.data
                        ? "Use Save progress above to save these steps to your account."
                        : "Progress saves automatically in this browser. Switching browsers or clearing browser data can remove it. Use Settings to export a backup."}
                    </p>
                  </section>
                )}
              {page === "roadmap" && (
                <div className="roadmap-explorer">
                  <section className="roadmap-overview" aria-labelledby="roadmap-overview-title">
                    <div>
                      <span className="eyebrow">{t("YOUR LEARNING ROUTE", "مسار تعلمك")}</span>
                      <h2 id="roadmap-overview-title">{t("One skill at a time.", "مهارة واحدة في كل خطوة.")}</h2>
                      <p>{t("Choose a skill, follow its lessons, and check what you can do. Your next step is ready below.", "اختر مهارة، تابع دروسها، واختبر ما تعلمته. خطوتك التالية بالأسفل.")}</p>
                      <div className="roadmap-overview-stats"><span><strong>{requiredIds.length}</strong> {t("skill areas", "مجالات مهارية")}</span><span><strong>{completed}/{plan.topics.length}</strong> {t("topics completed", "موضوعات مكتملة")}</span><span><strong>{plan.remainingHours}</strong> {t("hours left · estimated", "ساعات متبقية · تقديرياً")}</span></div>
                    </div>
                    <div className="roadmap-next-step">
                      <span className="eyebrow">{next ? t("RECOMMENDED NEXT", "الخطوة المقترحة") : t("PUT IT TOGETHER", "اجمع مهاراتك")}</span>
                      <h3>{next ? txt(next.title) : t("Your portfolio project", "مشروع ملف أعمالك")}</h3>
                      <p>{next ? txt(skillById[next.skillId].title) : t("Apply your learning to a real scenario.", "طبّق ما تعلمته على سيناريو عملي.")}</p>
                      <button className="primary" onClick={() => {
                        if (!next) { setPage("projects"); return; }
                        setSelectedSkill(next.skillId); setLessonTarget(next.id);
                        const element = document.getElementById(`lesson-${next.id}`) as HTMLDetailsElement | null;
                        if (element) { const levelGroup = element.closest<HTMLDetailsElement>(".roadmap-level"); if (levelGroup) levelGroup.open = true; element.open = true; element.scrollIntoView({ block: "center" }); element.querySelector("summary")?.focus(); }
                      }}>{next ? t("Open next lesson", "افتح الدرس التالي") : t("Open project", "افتح المشروع")} <ArrowRight size={16} /></button>
                    </div>
                  </section>
                  <details className="roadmap-plan-details">
                    <summary>{t("Plan details & learning tips", "تفاصيل الخطة ونصائح التعلم")}<span>{t("Pace, foundations and industry context", "الوتيرة والأساسيات وسياق المجال")}</span><ChevronDown size={18} /></summary>
                    <div className="roadmap-plan-content">
                  <details className="foundation-entry">
                    <summary>
                      Start with the foundations: reliable totals and averages
                    </summary>
                    <FoundationsUnit
                      key={`${stateOwner}:${state.profile.sector}`}
                      state={state}
                      update={update}
                      openLesson={topicId => {
                        setSelectedSkill(topicId.split("-")[0]);
                        setLessonTarget(topicId);
                        const element = document.getElementById(
                          `lesson-${topicId}`
                        ) as HTMLDetailsElement | null;
                        if (element) {
                          const levelGroup = element.closest<HTMLDetailsElement>(".roadmap-level"); if (levelGroup) levelGroup.open = true; element.open = true;
                          element.scrollIntoView({ block: "center" });
                          element.querySelector("summary")?.focus();
                        }
                      }}
                    />
                  </details>
                  <div className={plan.feasible ? "notice" : "notice warm"}>
                    {plan.feasible
                      ? t(
                          `Your ${state.profile.weeks}-week goal fits the estimated workload.`,
                          `هدفك خلال ${state.profile.weeks} أسبوعاً يتناسب مع الجهد التقديري.`
                        )
                      : t(
                          `This plan needs about ${plan.recommendedWeeks} weeks at your pace, or ${plan.hoursNeeded} hours/week to meet your ${state.profile.weeks}-week goal.`,
                          `تحتاج الخطة نحو ${plan.recommendedWeeks} أسبوعاً بوتيرتك، أو ${plan.hoursNeeded} ساعة أسبوعياً لتحقيق هدف ${state.profile.weeks} أسبوعاً.`
                        )}
                    <button
                      className="text-button"
                      onClick={() => setEditing(true)}
                    >
                      {t("Adjust", "تعديل")}
                    </button>
                  </div>
                  <p className="muted">
                    {t(
                      "Self-assessed skills are omitted from your gaps; they are not certified. Every path includes a portfolio validation project.",
                      "تُستبعد المهارات التي قيّمت إتقانك لها ذاتياً من الفجوات، وهذا ليس اعتماداً. يشمل كل مسار مشروعاً للتحقق العملي."
                    )}
                  </p>
                  <details className="roadmap-domain-disclosure">
                    <summary>{t("How your learning connects to", "كيف يرتبط تعلمك بمجال")} {sector.title}</summary>
                  <section className="domain-brief">
                    <div className="domain-heading">
                      <span className="eyebrow">INDUSTRY LENS</span>
                      <h2>{sector.title} domain knowledge</h2>
                      <p>{sector.context}</p>
                    </div>
                    <div>
                      <h3>Learn the business</h3>
                      <ul>
                        {sector.knowledge.map(item => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>Know the metrics</h3>
                      <div className="chips">
                        {sector.metrics.map(item => (
                          <span className="chip" key={item}>
                            {item}
                          </span>
                        ))}
                      </div>
                      <p>
                        <strong>Domain project:</strong> {sector.project}
                      </p>
                    </div>
                  </section>
                  </details>
                  <div
                    className="learning-cycle"
                    aria-label={t("Learning cycle", "دورة التعلم")}
                  >
                    <div>
                      <b>01</b>
                      <strong>{t("Learn", "Learn")}</strong>
                      <small>{t("Concept + example", "Concept + مثال")}</small>
                    </div>
                    <span>→</span>
                    <div>
                      <b>02</b>
                      <strong>{t("Practice", "Practice")}</strong>
                      <small>
                        {t("Edge case + evidence", "Edge case + دليل")}
                      </small>
                    </div>
                    <span>→</span>
                    <div>
                      <b>03</b>
                      <strong>{t("Assess", "Assess")}</strong>
                      <small>{t("Technical quiz", "Technical Quiz")}</small>
                    </div>
                    <span>→</span>
                    <div>
                      <b>04</b>
                      <strong>{t("Review", "Review")}</strong>
                      <small>
                        {t("Weak topics return", "النقط الضعيفة ترجع")}
                      </small>
                    </div>
                  </div>
                    </div>
                  </details>
                  <label className="roadmap-mobile-picker">
                    {t("Choose a skill", "اختر مهارة")}
                    <select value={requiredIds.includes(selectedSkill) ? selectedSkill : next?.skillId || requiredIds[0]} onChange={event => { setLessonTarget(""); setSelectedSkill(event.target.value); }}>
                      {requiredIds.map(id => <option key={id} value={id}>{txt(skillById[id].title)}</option>)}
                    </select>
                  </label>
                  <div className="roadmap-layout">
                    <nav
                      className="skill-list roadmap-skill-picker"
                      aria-label={t("Skills in your roadmap", "مهارات مسارك")}
                    >
                      <div className="skill-picker-heading">
                        <span className="eyebrow">
                          {t("YOUR SKILLS", "مهاراتك")}
                        </span>
                        <small>
                          {requiredIds.length} {t("in your path", "في مسارك")}
                        </small>
                      </div>
                      {requiredIds.map((id, index) => {
                        const topics = plan.topics.filter(
                          topic => topic.skillId === id
                        );
                        const done = topics.filter(topic => topic.done).length;
                        const active =
                          id ===
                          (requiredIds.includes(selectedSkill)
                            ? selectedSkill
                            : next?.skillId || requiredIds[0]);
                        return (
                          <button
                            key={id}
                            className={active ? "selected" : ""}
                            aria-current={active ? "true" : undefined}
                            onClick={() => { setLessonTarget(""); setSelectedSkill(id); }}
                          >
                            <span className="skill-picker-top">
                              <span className="skill-picker-number">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <strong>{txt(skillById[id].title)}</strong>
                              <ArrowRight size={16} />
                            </span>
                            <span className="skill-picker-meta">
                              {next?.skillId === id && <span className="roadmap-skill-next">{t("Next lesson here", "درسك التالي هنا")}</span>}
                              {done} / {topics.length}{" "}
                              {t("topics completed", "موضوعات مكتملة")}
                            </span>
                            <span
                              className="skill-picker-track"
                              aria-hidden="true"
                            >
                              <i
                                style={{
                                  width: `${topics.length ? (done / topics.length) * 100 : 0}%`,
                                }}
                              />
                            </span>
                          </button>
                        );
                      })}
                    </nav>
                    <div>
                      {(() => {
                        const id =
                            selectedSkill &&
                            lessonTarget &&
                            lessonTarget.startsWith(`${selectedSkill}-`)
                              ? selectedSkill
                              : requiredIds.includes(selectedSkill)
                                ? selectedSkill
                                : next?.skillId || requiredIds[0],
                          skill = skillById[id];
                        return (
                          <section className="card roadmap-lesson-panel" key={id}>
                            <div className="section-top">
                              <h2>{txt(skill.title)}</h2>
                              <span className="soft-tag">
                                {t("Target", "الهدف")} {plan.required[id]}/3
                              </span>
                            </div>
                            <p className="roadmap-legend">{t("You can read any lesson. Complete its prerequisites and checks to record completion.", "يمكنك قراءة أي درس. أكمل المتطلبات والاختبارات لتسجيل إتمامه.")}</p>
                            {[1, 2, 3].map(level => (
                              <details className="roadmap-level" name={`roadmap-level-${id}`} key={level} open={level === (skill.topics.find(topic => topic.id === lessonTarget)?.level ?? skill.topics.find(topic => topic.id === next?.id)?.level ?? 1)}>
                                <summary className="roadmap-level-heading">
                                  <span className="roadmap-level-number">{String(level).padStart(2, "0")}</span>
                                  <span className="roadmap-level-title">
                                  {
                                    [
                                      t("Beginner", "مبتدئ"),
                                      t("Intermediate", "متوسط"),
                                      t("Advanced", "متقدم"),
                                    ][level - 1]
                                  }{" "}
                                  {level > plan.required[id] && (
                                    <small>
                                      {t("Optional extension", "توسع اختياري")}
                                    </small>
                                  )}
                                  </span>
                                  <span className="roadmap-level-progress">{skill.topics.filter(topic => topic.level === level && state.completed.includes(topic.id)).length}/{skill.topics.filter(topic => topic.level === level).length} {t("complete", "مكتمل")}</span>
                                  <ChevronDown size={18} />
                                </summary>
                                <div className="roadmap-level-content">
                                {skill.topics
                                  .filter(x => x.level === level)
                                  .map(topic => {
                                    const item = plan.topics.find(
                                      x => x.id === topic.id
                                    );
                                    const guide = lessonGuide(topic.id, lang);
                                    const done = state.completed.includes(
                                      topic.id
                                    );
                                    const locked = item?.prerequisites.some(
                                      p => !state.completed.includes(p)
                                    );
                                    return (
                                      <details
                                        className={`topic roadmap-topic${next?.id === topic.id ? " roadmap-topic-next" : ""}${done ? " roadmap-topic-done" : ""}`}
                                        key={topic.id}
                                        id={`lesson-${topic.id}`}
                                      >
                                        <summary>
                                          <span
                                            className={
                                              done
                                                ? "topic-check checked"
                                                : "topic-check"
                                            }
                                          >
                                            {done ? (
                                              <Check size={13} />
                                            ) : (
                                              topic.id.split("-").pop()
                                            )}
                                          </span>
                                          <span className="roadmap-topic-heading"><strong>{txt(topic.title)}</strong><span className={`roadmap-topic-state ${done ? "complete" : locked ? "prerequisite" : "ready"}`}>{done ? t("Completed", "مكتمل") : next?.id === topic.id ? t("Your next lesson", "درسك التالي") : locked ? t("Prerequisites needed", "متطلبات سابقة") : item ? t("Ready to learn", "جاهز للتعلم") : t("Explore this topic", "استكشف الموضوع")}</span></span>
                                          <small>
                                            {item
                                              ? `${topic.hours} ${t("hrs", "ساعات")} · ${t("Week", "أسبوع")} ${item.week || "✓"}`
                                              : t(
                                                  "Outside current gaps",
                                                  "خارج الفجوات الحالية"
                                                )}
                                          </small>
                                          <ChevronDown size={15} />
                                        </summary>
                                        <div className="topic-body">
                                          <LessonSteps topicId={topic.id} arabic={lang === "ar"} prerequisitesReady={!locked} />
                                          {locked && <div className="roadmap-prerequisites"><strong>{t("Start with these lessons", "ابدأ بهذه الدروس")}</strong><p>{t("These build the knowledge needed for this topic.", "تؤسس هذه الدروس للمعرفة اللازمة لهذا الموضوع.")}</p><div>{item?.prerequisites.filter(prerequisite => !state.completed.includes(prerequisite)).map(prerequisite => {
                                            const prerequisiteSkill = skills.find(value => value.topics.some(value => value.id === prerequisite));
                                            const prerequisiteTopic = prerequisiteSkill?.topics.find(value => value.id === prerequisite);
                                            return prerequisiteSkill && prerequisiteTopic ? <button className="secondary" key={prerequisite} onClick={() => {
                                              setSelectedSkill(prerequisiteSkill.id); setLessonTarget(prerequisite);
                                              const element = document.getElementById(`lesson-${prerequisite}`) as HTMLDetailsElement | null;
                                              if (element) { const levelGroup = element.closest<HTMLDetailsElement>(".roadmap-level"); if (levelGroup) levelGroup.open = true; element.open = true; element.scrollIntoView({ block: "center" }); element.querySelector("summary")?.focus(); }
                                            }}>{txt(prerequisiteTopic.title)} <ArrowRight size={14} /></button> : null;
                                          })}</div></div>}

                                          <div className="lesson-guide" id={`lesson-${topic.id}-learn`} tabIndex={-1}>
                                            <span className="eyebrow">
                                              {t(
                                                "WHAT THIS LESSON COVERS",
                                                "الدرس ده بيغطي إيه"
                                              )}
                                            </span>
                                            <p className="lesson-brief">
                                              {guide.brief}
                                            </p>
                                            <LessonGlossary
                                              language={state.profile.language}
                                            />
                                            <LessonFeedback
                                              key={topic.id}
                                              topicId={topic.id}
                                              title={txt(topic.title)}
                                            />
                                            <h4>
                                              {t(
                                                "By the end, you should be able to:",
                                                "في آخر الدرس لازم تقدر:"
                                              )}
                                            </h4>
                                            <ul>
                                              {guide.objectives.map(
                                                objective => (
                                                  <li key={objective}>
                                                    {objective}
                                                  </li>
                                                )
                                              )}
                                            </ul>
                                            {guide.workedExample && (
                                              <div className="worked-example">
                                                <h4>Worked example</h4>
                                                <pre>
                                                  {id === "sql"
                                                    ? sqlVocabulary(
                                                        guide.workedExample,
                                                        state.profile.sector
                                                      )
                                                    : guide.workedExample}
                                                </pre>
                                                <h4>Common mistake to test</h4>
                                                <p>{guide.commonMistake}</p>
                                              </div>
                                            )}
                                            <div className="practice-brief lesson-practice-step" id={`lesson-${topic.id}-practice`} tabIndex={-1}>
                                              <strong>
                                                {t(
                                                  "Hands-on task",
                                                  "التطبيق العملي"
                                                )}
                                              </strong>
                                              <p>{guide.practice}</p>
                                            </div>
                                            <div className="lesson-resources">
                                              <a
                                                className="resource-button"
                                                href={skill.resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                <BookOpen size={16} />
                                                <span>
                                                  <small>
                                                    {t(
                                                      "Official guide",
                                                      "Official Guide"
                                                    )}
                                                  </small>
                                                  {skill.resource.title}
                                                </span>
                                                <ArrowUpRight size={15} />
                                              </a>
                                              <a
                                                className="resource-button youtube"
                                                href={guide.youtubeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                <span className="video-badge">
                                                  ▶
                                                </span>
                                                <span>
                                                  <small>YouTube</small>
                                                  {t(
                                                    "Video explanations & demos",
                                                    "شرح وفيديوهات تطبيق"
                                                  )}
                                                </span>
                                                <ArrowUpRight size={15} />
                                              </a>
                                              {((id === "sql" &&
                                                sqlLabChallenges.some(
                                                  item =>
                                                    item.topicId === topic.id
                                                )) ||
                                                practiceChallenges(
                                                  state.profile
                                                ).some(
                                                  item =>
                                                    item.topicId === topic.id
                                                )) && (
                                                <button
                                                  className="resource-button lab-link"
                                                  onClick={() => {
                                                    setIndependentPractice(
                                                      true
                                                    );
                                                    setLabSkillTarget(id);
                                                    setLabTopicTarget(topic.id);
                                                    setLabTarget(
                                                      sqlLabChallenges.find(
                                                        item =>
                                                          item.topicId ===
                                                          topic.id
                                                      )?.id || ""
                                                    );
                                                    setPage("lab");
                                                  }}
                                                >
                                                  <SquareTerminal size={16} />
                                                  <span>
                                                    <small>
                                                      Guided practice
                                                    </small>
                                                    Open practice for this topic
                                                  </span>
                                                  <ArrowRight size={15} />
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                          <label>
                                            {t(
                                              "Evidence / notes (required to complete)",
                                              "الدليل / الملاحظات (مطلوبة للإكمال)"
                                            )}
                                            <textarea
                                              maxLength={1000}
                                              value={
                                                state.evidence[topic.id] || ""
                                              }
                                              onChange={e =>
                                                update(s => ({
                                                  ...s,
                                                  evidence: {
                                                    ...s.evidence,
                                                    [topic.id]: e.target.value,
                                                  },
                                                }))
                                              }
                                              placeholder={t(
                                                "What did you try? What result did you get? Explain one check you used. Add a project link if useful.",
                                                "ماذا بنيت أو تعلمت؟ أضف رابط المشروع إن وجد."
                                              )}
                                            />
                                          </label>
                                          {locked && (
                                            <p className="muted">
                                              {t(
                                                "Complete the prerequisite topics first.",
                                                "أكمل الموضوعات السابقة المطلوبة أولاً."
                                              )}
                                            </p>
                                          )}
                                          <section className="lesson-check-step" id={`lesson-${topic.id}-check`} tabIndex={-1} aria-label={t("Check your understanding", "اختبر فهمك")}>
                                          <h4>{t("Check your understanding", "اختبر فهمك")}</h4>
                                          <p>{t("Answer the questions, then read the explanation for each answer. You can retry after reviewing.", "أجب عن الأسئلة ثم اقرأ تفسير كل إجابة. يمكنك إعادة المحاولة بعد المراجعة.")}</p>
                                          <QuizCard
                                            compact
                                            title={t(
                                              "Topic quiz",
                                              "اختبار الموضوع"
                                            )}
                                            questions={topicQuiz(topic.id)}
                                            kind="topic"
                                            targetId={topic.id}
                                            state={state}
                                            update={update}
                                            serverVerificationEnabled={Boolean(me.data)}
                                            onVerified={() => { if (updateEpoch !== workspaceEpoch.current) return; setProofPrompt("Quiz result verified on the server."); void refreshProof(); }}
                                          />
                                          <LessonCompletion arabic={lang === "ar"} hasEvidence={Boolean((state.evidence[topic.id] || "").trim())} passed={latestPassed(state, "topic", topic.id)} prerequisitesReady={!locked} />
                                          <button
                                            className="primary small"
                                            disabled={
                                              !done &&
                                              (locked ||
                                                !latestPassed(
                                                  state,
                                                  "topic",
                                                  topic.id
                                                ) ||
                                                !(
                                                  state.evidence[topic.id] || ""
                                                ).trim())
                                            }
                                            onClick={() =>
                                              update(s => ({
                                                ...s,
                                                completed: done
                                                  ? s.completed.filter(
                                                      x => x !== topic.id
                                                    )
                                                  : [
                                                      ...new Set([
                                                        ...s.completed,
                                                        topic.id,
                                                      ]),
                                                    ],
                                                reviewTopics: done
                                                  ? s.reviewTopics
                                                  : s.reviewTopics.filter(
                                                      x => x !== topic.id
                                                    ),
                                              }))
                                            }
                                          >
                                            {done
                                              ? t(
                                                  "Mark incomplete",
                                                  "تحديد كغير مكتمل"
                                                )
                                              : t(
                                                  "Mark complete",
                                                  "تحديد كمكتمل"
                                                )}
                                          </button>
                                          </section>
                                        </div>
                                      </details>
                                    );
                                  })}
                                <details className="roadmap-assessment">
                                  <summary><BadgeCheck size={17} /><span>{t("Level assessment", "اختبار المستوى")}</span><small>{t("10 questions · pass 80%", "١٠ أسئلة · النجاح ٨٠٪")}</small><ChevronDown size={16} /></summary>
                                <QuizCard
                                  title={`${txt(skill.title)} · ${[t("Beginner", "Beginner"), t("Intermediate", "Intermediate"), t("Advanced", "Advanced")][level - 1]} Assessment`}
                                  questions={levelQuiz(id, level)}
                                  kind="level"
                                  targetId={`${id}-level-${level}`}
                                  state={state}
                                  update={update}
                                  serverVerificationEnabled={Boolean(me.data)}
                                  onVerified={() => { if (updateEpoch !== workspaceEpoch.current) return; setProofPrompt("Assessment verified on the server."); void refreshProof(); }}
                                  locked={skill.topics
                                    .filter(
                                      topic =>
                                        topic.level === level &&
                                        plan.topics.some(
                                          item => item.id === topic.id
                                        )
                                    )
                                    .some(
                                      topic =>
                                        !state.completed.includes(topic.id)
                                    )}
                                />
                                </details>
                                </div>
                              </details>
                            ))}
                            <details className="roadmap-assessment roadmap-final-checks">
                              <summary><BadgeCheck size={18} /><span>{t("Skill checks & final assessment", "فحص المهارة والاختبار النهائي")}</span><ChevronDown size={16} /></summary>
                            <DiagnosticCard
                              id={id}
                              state={state}
                              update={update}
                            />
                            <QuizCard
                              title={t(
                                `Final ${skill.title.en} quiz`,
                                `الاختبار الشامل: ${skill.title.ar}`
                              )}
                              questions={skillQuiz(id, plan.required[id])}
                              kind="skill"
                              targetId={id}
                              state={state}
                              update={update}
                              serverVerificationEnabled={Boolean(me.data)}
                              onVerified={() => { if (updateEpoch !== workspaceEpoch.current) return; setProofPrompt("Skill certification verified on the server."); void refreshProof(); }}
                              locked={plan.topics.some(
                                topic =>
                                  topic.skillId === id &&
                                  !state.completed.includes(topic.id)
                              )}
                            />
                            </details>
                          </section>
                        );
                      })()}
                    </div>
                  </div>
                  <details className="roadmap-review-section">
                    <summary><span><span className="eyebrow">{t("SPACED REVIEW", "المراجعة المتباعدة")}</span><strong>{t("Keep what you learn", "ثبّت ما تعلمته")}</strong></span><span>{t("Review skills together", "راجع المهارات معاً")}</span><ChevronDown size={20} /></summary>
                  <ReviewCenter
                    state={state}
                    requiredIds={requiredIds}
                    requiredLevels={plan.required}
                    update={update}
                    serverVerificationEnabled={Boolean(me.data)}
                    onVerified={() => { if (updateEpoch !== workspaceEpoch.current) return; setProofPrompt("Review verified on the server."); void refreshProof(); }}
                    openLesson={topicId => {
                      const skill = skills.find(item =>
                        item.topics.some(topic => topic.id === topicId)
                      );
                      if (!skill) return;
                      setSelectedSkill(skill.id);
                      setLessonTarget(topicId);
                      const element = document.getElementById(
                        `lesson-${topicId}`
                      ) as HTMLDetailsElement | null;
                      if (element) {
                        const levelGroup = element.closest<HTMLDetailsElement>(".roadmap-level"); if (levelGroup) levelGroup.open = true; element.open = true;
                        element.scrollIntoView({
                          block: "center",
                          behavior: window.matchMedia(
                            "(prefers-reduced-motion: reduce)"
                          ).matches
                            ? "auto"
                            : "smooth",
                        });
                        element.querySelector("summary")?.focus();
                      }
                    }}
                  />
                  </details>
                </div>
              )}
              {page === "lab" &&
                state.profile.experience === "new" &&
                !state.firstLesson?.completed && (
                  <button
                    className="secondary"
                    onClick={() => setIndependentPractice(value => !value)}
                  >
                    {independentPractice
                      ? "Return to guided practice"
                      : "I’m ready to explore independent exercises"}
                  </button>
                )}
              {page === "lab" &&
                (state.profile.experience !== "new" ||
                  state.firstLesson?.completed ||
                  independentPractice) && (
                  <PracticeHub
                    key={`${stateOwner}:${state.profile.role}:${state.profile.sector}:${state.profile.learningMode}:${state.profile.focusSkill}:${state.profile.targetLevel}:${JSON.stringify(state.profile.skillTargets)}`}
                    state={state}
                    update={update}
                    initialSkill={labSkillTarget}
                    initialTopicId={labTopicTarget}
                    openLesson={topicId => {
                      setSelectedSkill(
                        skills.find(skill =>
                          skill.topics.some(topic => topic.id === topicId)
                        )!.id
                      );
                      setLessonTarget(topicId);
                      setPage("roadmap");
                    }}
                    renderSql={requestedId => (
                      <SqlPracticeLab
                        key={requestedId || "default-sql"}
                        initialChallengeId={
                          requestedId ||
                          sqlChallengeForTopic(state.profile, labTopicTarget) ||
                          labTarget
                        }
                        onChoose={setLabTarget}
                        state={state}
                        update={update}
                        serverVerificationEnabled={Boolean(me.data)}
                        onVerified={() => { if (updateEpoch !== workspaceEpoch.current) return; setProofPrompt("SQL lab pass verified on the server."); void refreshProof(); }}
                        openRoadmap={topicId => {
                          setSelectedSkill("sql");
                          setLessonTarget(topicId);
                          setPage("roadmap");
                        }}
                      />
                    )}
                  />
                )}
              {page === "resources" && (
                <>
                  <div className="filterbar">
                    <label className="search-field">
                      {t("Find a resource", "ابحث عن مصدر")}
                      <input
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t(
                          "Search skills or providers…",
                          "ابحث عن المهارات أو المزودين…"
                        )}
                      />
                    </label>
                    <label>
                      {t("Budget preference", "تفضيل الميزانية")}
                      <select
                        value={state.profile.resources}
                        onChange={e =>
                          patchProfile({
                            resources: e.target.value as Profile["resources"],
                          })
                        }
                      >
                        <option value="free">
                          {t("Free only", "مجاني فقط")}
                        </option>
                        <option value="mixed">
                          {t("Free + paid", "مجاني ومدفوع")}
                        </option>
                      </select>
                    </label>
                  </div>
                  <p className="muted">
                    {t(
                      "Official guides selected for your skill gaps. External resources may be in English; multilingual sources are labeled. Paid provider prices can change.",
                      "أدلة رسمية مختارة لمهاراتك. قد تكون المصادر الخارجية بالإنجليزية؛ المصادر متعددة اللغات موضحة. أسعار المزودين المدفوعة قابلة للتغيير."
                    )}
                  </p>
                  <div className="resource-search-status">
                    <p role="status">{t(`${resourceCount} guides match your filters`, `${resourceCount} دليل يطابق اختياراتك`)}</p>
                    {search && <button className="secondary" onClick={() => setSearch("")}>{t("Clear search", "مسح البحث")}</button>}
                  </div>
                  {resourceCount === 0 && <section className="workspace-empty-state">
                    <BookOpen size={28} aria-hidden="true" />
                    <h3>{t("No matching guides", "لا توجد أدلة مطابقة")}</h3>
                    <p>{t("Try a skill name such as SQL, or clear your search to see the guides for your path.", "جرّب اسم مهارة مثل SQL، أو امسح البحث لرؤية أدلة مسارك.")}</p>
                  </section>}
                  <div className="resource-grid">
                    {matchingResourceIds
                      .map(id => (
                        <a
                          className="card resource-card"
                          key={id}
                          href={skillById[id].resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className="section-top">
                            <BookOpen size={21} />
                            <span className="soft-tag">
                              {t("FREE", "مجاني")}
                            </span>
                          </div>
                          <small>{txt(skillById[id].title)}</small>
                          <h3>{skillById[id].resource.title}</h3>
                          <p>
                            {t(
                              "Read, practice, and apply it to your portfolio.",
                              "اقرأ وتدرّب وطبّق في معرض أعمالك."
                            )}
                          </p>
                          <span className="resource-bottom">
                            {skillById[id].resource.language === "both"
                              ? t("Multiple languages", "متعدد اللغات")
                              : "English"}
                            <ArrowUpRight size={19} />
                          </span>
                        </a>
                      ))}
                    {matchingPaidResources
                        .map(r => (
                          <a
                            className="card resource-card"
                            key={r.id}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span className="soft-tag">
                              {t("PAID · OPTIONAL", "مدفوع · اختياري")}
                            </span>
                            <h3>{r.title}</h3>
                            <p>
                              {t(
                                "Check current pricing and financial aid on the provider website.",
                                "تحقق من السعر الحالي والدعم المالي على موقع المزود."
                              )}
                            </p>
                            <ArrowUpRight />
                          </a>
                        ))}
                  </div>
                  <div className="section-top spaced">
                    <h2>
                      {t(
                        "Recommended YouTube learning",
                        "فيديوهات YouTube مقترحة"
                      )}
                    </h2>
                    <span className="soft-tag">
                      {lang === "ar" ? "العربية" : "ENGLISH"}
                    </span>
                  </div>
                  <p className="muted">
                    {t(
                      "Focused recommendations for your selected language and skills. Review the publication date and reproduce the work yourself.",
                      "مقترحات مركزة حسب اللغة والمهارات المختارة. راجع تاريخ النشر وطبّق العمل بنفسك."
                    )}
                  </p>
                  <div className="resource-grid">
                    {videoResources
                      .filter(
                        resource =>
                          resource.language === lang &&
                          resource.skills.some(id => requiredIds.includes(id))
                      )
                      .map(resource => (
                        <a
                          className="card resource-card video-card"
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className="section-top">
                            <span className="video-badge">▶</span>
                            <span className="soft-tag">YOUTUBE</span>
                          </div>
                          <h3>{resource.title}</h3>
                          <p>
                            {t(
                              "Watch one section, reproduce it, then save evidence in the matching topic.",
                              "شاهد جزءاً واحداً وطبقه ثم احفظ الدليل داخل الموضوع المناسب."
                            )}
                          </p>
                          <span className="resource-bottom">
                            {t("Open recommendations", "فتح المقترحات")}
                            <ArrowUpRight size={19} />
                          </span>
                        </a>
                      ))}
                  </div>
                </>
              )}
              {page === "tools" && (
                <>
                  <div className="notice">
                    {t(
                      "Install only the tools used by your path. Browser-based alternatives are fine when available.",
                      "ثبّت فقط الأدوات التي يحتاجها مسارك. يمكن استخدام البدائل التي تعمل في المتصفح عند توفرها."
                    )}
                  </div>
                  <div className="resource-grid">
                    {toolbox
                      .filter(tool =>
                        tool.skills.some(id => requiredIds.includes(id))
                      )
                      .map(tool => (
                        <a
                          className="card resource-card"
                          key={tool.id}
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className="section-top">
                            <Wrench size={21} />
                            <span className="soft-tag">
                              {t("TOOL", "أداة")}
                            </span>
                          </div>
                          <h3>{tool.title}</h3>
                          <p className="tool-why">{tool.why}</p>
                          <p>
                            {t("Used for: ", "تُستخدم في: ")}
                            {tool.skills
                              .filter(id => requiredIds.includes(id))
                              .map(id => txt(skillById[id].title))
                              .join(" · ")}
                          </p>
                          <span className="resource-bottom">
                            {t("Official setup page", "صفحة الإعداد الرسمية")}
                            <ArrowUpRight size={19} />
                          </span>
                        </a>
                      ))}
                  </div>
                </>
              )}
              {page === "interviews" && (
                <>
                  <div className="interview-export-bar">
                    <div>
                      <strong>
                        {t("Keep your practice journal", "احتفظ بسجل تدريبك")}
                      </strong>
                      <p>
                        {t(
                          "Export answered questions in your current path, your responses and review criteria. Nothing is shared automatically.",
                          "صدّر أسئلة مسارك الحالي التي أجبت عنها وإجاباتك ومعايير المراجعة. لا تتم مشاركة أي شيء تلقائياً."
                        )}
                      </p>
                    </div>
                    <button
                      className="secondary"
                      disabled={
                        !questions.some(question =>
                          state.interviewAnswers[question.id]?.trim()
                        )
                      }
                      onClick={() =>
                        download(
                          "datapath-interview-journal.txt",
                          interviewJournal(state, lang).text
                        )
                      }
                    >
                      <Download size={16} />
                      {t("Download journal", "تنزيل السجل")}
                    </button>
                  </div>
                  <div className="two-column interview-layout">
                    <section className="card">
                      <div className="section-top">
                        <span className="soft-tag">
                          {txt(question.category)}
                        </span>
                        <span className="muted">
                          {(mockIndex % questions.length) + 1} /{" "}
                          {questions.length}
                        </span>
                      </div>
                      <h2 className="question-title">
                        {txt(question.question)}
                      </h2>
                      {(() => {
                        const nextStep = interviewNextStep(
                          state,
                          question.skill
                        );
                        if (!nextStep) return null;
                        return (
                          <div className="interview-learning-bridge">
                            <strong>
                              {t(
                                "Need to build this skill first?",
                                "تحتاج إلى تقوية هذه المهارة أولاً؟"
                              )}
                            </strong>
                            <p>
                              {nextStep.reason}{" "}
                              {t(
                                "Your answer stays saved while you practise.",
                                "تبقى إجابتك محفوظة أثناء التدريب."
                              )}
                            </p>
                            <div className="button-row">
                              <button
                                className="secondary"
                                onClick={() => {
                                  setSelectedSkill(nextStep.skillId);
                                  setLessonTarget(nextStep.topicId);
                                  setPage("roadmap");
                                }}
                              >
                                <BookOpen size={16} />
                                {t("Open related lesson", "افتح الدرس المرتبط")}
                              </button>
                              <button
                                className="secondary"
                                onClick={() => {
                                  setIndependentPractice(true);
                                  setLabSkillTarget(nextStep.skillId);
                                  setLabTopicTarget(nextStep.topicId);
                                  setPage("lab");
                                }}
                              >
                                <SquareTerminal size={16} />
                                {t("Practise this skill", "تدرّب على المهارة")}
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                      <InterviewGuide
                        key={question.id}
                        arabic={lang === "ar"}
                      />
                      <div className="mock-controls">
                        <button
                          className="secondary small"
                          onClick={() =>
                            setMockStarted(mockStarted ? null : Date.now())
                          }
                        >
                          {mockStarted
                            ? t("Stop timer", "إيقاف المؤقت")
                            : t(
                                "Start 3-minute practice",
                                "ابدأ تدريب ٣ دقائق"
                              )}
                        </button>
                        {mockStarted && (
                          <span role="timer">
                            {Math.max(
                              0,
                              180 -
                                Math.floor((Date.now() - mockStarted) / 1000)
                            )}{" "}
                            {t("seconds left", "ثانية متبقية")}
                          </span>
                        )}
                      </div>
                      <label>
                        {t("Your answer", "إجابتك")}
                        <textarea
                          className="answer-input"
                          maxLength={5000}
                          value={state.interviewAnswers[question.id] || ""}
                          onChange={e =>
                            update(s => ({
                              ...s,
                              interviewAnswers: {
                                ...s.interviewAnswers,
                                [question.id]: e.target.value,
                              },
                            }))
                          }
                          placeholder={t(
                            "Explain your reasoning. Use a concrete example and evidence.",
                            "اشرح منطقك. استخدم مثالاً محدداً وأدلة."
                          )}
                        />
                      </label>
                      <div className="button-row">
                        <button
                          className="secondary"
                          onClick={() => {
                            setMockIndex(Math.max(0, mockIndex - 1));
                            setRubric([]);
                            setMockStarted(null);
                            setCoachReply("");
                          }}
                        >
                          {t("Previous", "السابق")}
                        </button>
                        <button
                          className="primary"
                          onClick={() => {
                            setMockIndex((mockIndex + 1) % questions.length);
                            setRubric([]);
                            setMockStarted(null);
                            setCoachReply("");
                          }}
                        >
                          {t("Next question", "السؤال التالي")}
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </section>
                    <section className="card">
                      <div className="eyebrow">
                        {t("REVIEW YOUR ANSWER", "راجع إجابتك")}
                      </div>
                      <h2>
                        {t(
                          "A strong answer has evidence.",
                          "الإجابة القوية تستند إلى أدلة."
                        )}
                      </h2>
                      <p>
                        {t(
                          "Use this rubric for self-review. Checkmarks are your reflection, not an automated score.",
                          "استخدم هذه المعايير للمراجعة الذاتية. العلامات تعكس تقييمك وليست درجة آلية."
                        )}
                      </p>
                      {question.rubric.map((r, i) => (
                        <label className="rubric-item" key={i}>
                          <input
                            type="checkbox"
                            checked={rubric.includes(String(i))}
                            onChange={e =>
                              setRubric(
                                e.target.checked
                                  ? [...rubric, String(i)]
                                  : rubric.filter(x => x !== String(i))
                              )
                            }
                          />
                          {txt(r)}
                        </label>
                      ))}
                      <hr />
                      {aiControls}
                      <button
                        className="primary"
                        disabled={
                          !aiAvailable ||
                          !consent ||
                          coach.isPending ||
                          (state.interviewAnswers[question.id] || "").trim()
                            .length < 3
                        }
                        onClick={() =>
                          askCoach(
                            "interview",
                            state.interviewAnswers[question.id]
                          )
                        }
                      >
                        <MessageSquareText size={16} />
                        {coach.isPending
                          ? t("Reviewing…", "جارٍ المراجعة…")
                          : t("Get AI feedback", "احصل على ملاحظات ذكية")}
                      </button>
                      {coachReply && (
                        <div className="coach-reply" role="status">
                          {coachReply}
                        </div>
                      )}
                    </section>
                  </div>
                  <section className="card spaced">
                    <h2>{t("Practice by skill", "تدرّب حسب المهارة")}</h2>
                    <div className="chips">
                      {questions.map((q, i) => (
                        <button
                          key={q.id}
                          className={i === mockIndex ? "chip selected" : "chip"}
                          onClick={() => {
                            setMockIndex(i);
                            setRubric([]);
                            setCoachReply("");
                          }}
                        >
                          {q.skill
                            ? txt(skillById[q.skill].title)
                            : t("Behavioral", "سلوكي")}
                          {state.interviewAnswers[q.id]?.trim() && (
                            <Check size={13} />
                          )}
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              )}
              {page === "proof" && (
                <>
                  <section className="proof-hero">
                    <div>
                      <span className="eyebrow">
                        {t("READINESS, WITH RECEIPTS", "جاهزية بالدليل")}
                      </span>
                      <h2>
                        {t(
                          "No XP. No vague mastery score.",
                          "مفيش XP ولا mastery score من الهوا."
                        )}
                      </h2>
                      <p>
                        {t(
                          "Every status comes from completed lessons, saved evidence and passed technical assessments.",
                          "كل status مبني على lessons خلصتها، evidence حفظتها، وtechnical assessments نجحت فيها."
                        )}
                      </p>
                    </div>
                    <div className="proof-number">
                      <strong>
                        {
                          evidenceMatrix.filter(row => row.status === "proven")
                            .length
                        }
                        /{evidenceMatrix.length}
                      </strong>
                      <span>{t("skills proven", "Skills مثبتة")}</span>
                    </div>
                  </section>
                  {me.data && (
                    <section className="card proof-preview-card">
                      <span className="eyebrow">PRIVATE PREVIEW</span>
                      <h2>This is what your public proof page will show</h2>
                      <p>This preview is private. Hidden credentials and private workspace data are excluded.</p>
                      {proofPreview.data ? <ProofPreview proof={proofPreview.data} /> : <p>No server-verified credentials yet.</p>}
                      <button className="secondary" onClick={() => setPage("settings")}>Manage public proof page</button>
                    </section>
                  )}
                  <section className="lab-proof-strip">
                    <SquareTerminal size={21} />
                    <div>
                      <span className="eyebrow">PRACTICAL EVIDENCE</span>
                      <strong>
                        {passedLabIds(state).size}/{sqlLabChallenges.length}{" "}
                        guided SQL challenges passed
                      </strong>
                      <small>
                        Successful queries are saved against their roadmap
                        topic.
                      </small>
                    </div>
                    <button
                      className="secondary"
                      onClick={() => setPage("lab")}
                    >
                      Open workbench <ArrowRight size={15} />
                    </button>
                  </section>
                  <section className="card">
                    <h3>Practice across your path</h3>
                    <p>
                      {
                        practiceEvidence.checkedPassed
                      }{" "}
                      locally checked Python, formula or metric exercises passed
                      for this path and industry.
                    </p>
                    <p>
                      {
                        practiceEvidence.casesRecorded
                      }{" "}
                      applied cases have saved submissions. These are
                      self-reviewed, not expert-verified.
                    </p>
                    <button
                      className="text-button"
                      onClick={() => setPage("lab")}
                    >
                      Open Practice Studio →
                    </button>
                  </section>
                  <section className="card evidence-card">
                    <div className="section-top">
                      <div>
                        <span className="eyebrow">
                          {t("SKILL MATRIX", "SKILL MATRIX")}
                        </span>
                        <h2>
                          {t(
                            "What the record actually proves",
                            "الـRecord بيثبت إيه فعلاً"
                          )}
                        </h2>
                      </div>
                    </div>
                    <details className="proof-export-controls">
                      <summary>
                        {t("Choose what to export", "اختر ما تريد تصديره")}
                      </summary>
                      <p>
                        {t(
                          "Select skills to include. This download contains summary counts and assessment results only: not your name, private notes, artifact links or interview answers. Nothing is published automatically.",
                          "اختر المهارات. يتضمن التنزيل ملخص الأعداد ونتائج التقييم فقط، دون اسمك أو ملاحظاتك أو روابط أعمالك أو إجابات المقابلات. لا يُنشر شيء تلقائياً."
                        )}
                      </p>
                      <div className="chips">
                        {evidenceMatrix.map(row => (
                          <label key={row.skillId} className="checkline">
                            <input
                              type="checkbox"
                              checked={exportSkills.includes(row.skillId)}
                              onChange={event =>
                                setExportSkills(current =>
                                  event.target.checked
                                    ? [...new Set([...current, row.skillId])]
                                    : current.filter(id => id !== row.skillId)
                                )
                              }
                            />
                            {txt(skillById[row.skillId].title)}
                          </label>
                        ))}
                      </div>
                      <p aria-live="polite">
                        {
                          evidenceMatrix.filter(row =>
                            exportSkills.includes(row.skillId)
                          ).length
                        }{" "}
                        {t("skills selected", "مهارات مختارة")}
                      </p>
                      <button
                        className="secondary"
                        disabled={
                          !evidenceMatrix.some(row =>
                            exportSkills.includes(row.skillId)
                          )
                        }
                        onClick={() => {
                          download(
                            "datapath-selected-proof.md",
                            selectedProof(state, exportSkills),
                            "text/markdown"
                          );
                        }}
                      >
                        <Download size={16} />
                        {t(
                          "Download selected records",
                          "تنزيل السجلات المختارة"
                        )}
                      </button>
                      <p className="muted">
                        {t(
                          "Preview: only the selected skill rows below will appear in the file, alongside your role, industry and the evidence disclaimer. Shared copies cannot be revoked from this app.",
                          "معاينة: ستظهر صفوف المهارات المختارة فقط مع الدور والقطاع وتوضيح طبيعة الأدلة. لا يمكن سحب النسخ التي تشاركها من التطبيق."
                        )}
                      </p>
                      {selectedProof(state, exportSkills) && (
                        <details className="export-file-preview">
                          <summary>
                            {t(
                              "Preview exact file contents",
                              "معاينة محتوى الملف"
                            )}
                          </summary>
                          <pre>{selectedProof(state, exportSkills)}</pre>
                        </details>
                      )}
                    </details>
                    <div className="evidence-table" role="group" aria-label={t("Skill evidence", "أدلة المهارات")}>
                      <div className="evidence-row evidence-head" aria-hidden="true">
                        <span>{t("Skill", "Skill")}</span>
                        <span>{t("Lessons", "Lessons")}</span>
                        <span>Evidence</span>
                        <span>{t("Checks", "اختبارات")}</span>
                        <span>{t("Skill exam", "Skill exam")}</span>
                        <span>Status</span>
                      </div>
                      {evidenceMatrix.map(row => (
                        <button
                          className="evidence-row"
                          key={row.skillId}
                          onClick={() => {
                            setSelectedSkill(row.skillId);
                            setPage("roadmap");
                          }}
                        >
                          <span>
                            <strong>{txt(skillById[row.skillId].title)}</strong>
                            <small>
                              {t("Target", "Target")} L{row.target}
                            </small>
                          </span>
                          <span>
                            <small className="evidence-cell-label">{t("Lessons", "الدروس")}</small>
                            {row.completed}/{row.topics}
                          </span>
                          <span>
                            <small className="evidence-cell-label">{t("Evidence", "الأدلة")}</small>
                            {row.evidenced}/{row.topics}
                          </span>
                          <span>
                            <small className="evidence-cell-label">{t("Checks", "الاختبارات")}</small>
                            {row.levelChecks}/{row.target}
                          </span>
                          <span>
                            <small className="evidence-cell-label">{t("Skill exam", "اختبار المهارة")}</small>
                            {row.latestScore === null
                              ? ": "
                              : `${row.latestScore}%`}
                          </span>
                          <span>
                            <small className="evidence-cell-label">{t("Status", "الحالة")}</small>
                            <i className={`status-dot ${row.status}`} />
                            {row.status === "proven"
                              ? t("Proven", "مثبت")
                              : row.status === "assessment"
                                ? t("Assessment due", "محتاج Assessment")
                                : row.status === "building"
                                  ? t("Building", "بيتكوّن")
                                  : t("Gap", "Gap")}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="muted proof-rule">
                      {t(
                        "Proven means: the skill exam passed and every required lesson has saved evidence. Click any row to work on it.",
                        "Proven معناها: نجحت في Skill exam وكل lesson مطلوبة ليها evidence محفوظة. دوس على أي row عشان تشتغل عليها."
                      )}
                    </p>
                  </section>
                </>
              )}
              {page === "projects" && (
                <section className="card project-card">
                  <span className="soft-tag">
                    {t(
                      `PERSONAL PORTFOLIO · ${project.hours} ESTIMATED HOURS`,
                      `معرض أعمال شخصي · ${project.hours} ساعة تقديرية`
                    )}
                  </span>
                  <h2>{txt(project.title)}</h2>
                  <p className="lead">{txt(project.brief)}</p>
                  <div className="sector-project-note">
                    <span className="eyebrow">
                      {sector.title.toUpperCase()} BRIEF
                    </span>
                    <strong>{sector.project}</strong>
                    <p>
                      Use at least two relevant metrics:{" "}
                      {sector.metrics.slice(0, 3).join(", ")}. Choose metrics your data can support; some require additional fields beyond the starter CSV. Document missing inputs instead of inventing values.
                    </p>
                  </div>
                  <div className="chips">
                    {project.skills.map(id => (
                      <span className="chip" key={id}>
                        {txt(skillById[id].title)}
                      </span>
                    ))}
                  </div>
                  <h3>{t("Definition of done", "معايير الإنجاز")}</h3>
                  <ol className="deliverables">
                    <li>
                      {t(
                        "A reproducible artifact: repository, workbook, dashboard or documented audit.",
                        "مخرج قابل للتكرار: مستودع أو ملف عمل أو لوحة أو تدقيق موثق."
                      )}
                    </li>
                    <li>
                      {t(
                        "A README explaining the problem, data, assumptions and how to reproduce results.",
                        "ملف شرح للمشكلة والبيانات والافتراضات وكيفية تكرار النتائج."
                      )}
                    </li>
                    <li>
                      {t(
                        "Validation evidence, limitations, and a short presentation of the decision or impact.",
                        "أدلة تحقق وحدود العمل وعرض موجز للقرار أو الأثر."
                      )}
                    </li>
                  </ol>
                  <ProjectBlueprint profile={state.profile} />
                  <ProjectChecklist
                    key={project.id}
                    title={txt(project.title)}
                    notes={state.projectNotes[project.id] || ""}
                  />
                  <label>
                    {t(
                      "Project evidence, links and reflection",
                      "أدلة المشروع والروابط والتأمل"
                    )}
                    <textarea
                      className="answer-input"
                      maxLength={5000}
                      placeholder={t(
                        "Business problem\nData and assumptions\nMethod and validation\nKey insight\nDecision or measurable impact\nLimitations and next step",
                        "Business problem\nالـData والافتراضات\nMethod والـvalidation\nأهم insight\nالقرار أو measurable impact\nLimitations والخطوة الجاية"
                      )}
                      value={state.projectNotes[project.id] || ""}
                      onChange={e =>
                        update(s => ({
                          ...s,
                          projectNotes: {
                            ...s.projectNotes,
                            [project.id]: e.target.value,
                          },
                        }))
                      }
                    />
                  </label>
                  <label className="checkline">
                    <input
                      type="checkbox"
                      checked={state.completedProjects.includes(project.id)}
                      disabled={!(state.projectNotes[project.id] || "").trim()}
                      onChange={e => {
                        const completed = e.target.checked;
                        update(s => ({
                          ...s,
                          completedProjects: completed
                            ? [...new Set([...s.completedProjects, project.id])]
                            : s.completedProjects.filter(id => id !== project.id),
                        }));
                        if (completed)
                          setProofPrompt("Project completion recorded. Configure your proof page while independent project verification is pending.");
                      }}
                    />
                    {t(
                      "I have delivered and checked all three portfolio requirements.",
                      "أنجزت متطلبات معرض الأعمال الثلاثة وتحققت منها."
                    )}
                  </label>
                  <p className="muted">
                    {t(
                      "Adapt the domain to your goals: ",
                      "كيّف المجال مع أهدافك: "
                    )}
                    {state.profile.goals ||
                      t(
                        "choose a public dataset about something you care about.",
                        "اختر بيانات عامة حول موضوع يهمك."
                      )}
                  </p>
                </section>
              )}
              {page === "career" && (
                <div className="two-column">
                  <section className="card">
                    <h2>
                      {t(
                        "Build an evidence-first CV",
                        "ابنِ سيرة ذاتية تستند إلى الأدلة"
                      )}
                    </h2>
                    <p>
                      {t(
                        "Use only achievements you can substantiate. Export a plain-text draft for any CV template.",
                        "استخدم إنجازات يمكنك إثباتها فقط. صدّر مسودة نصية لأي قالب سيرة ذاتية."
                      )}
                    </p>
                    {(
                      ["name", "summary", "achievements", "links"] as const
                    ).map((key, i) => (
                      <label key={key}>
                        {
                          [
                            t("Name", "الاسم"),
                            t("Professional summary", "الملخص المهني"),
                            t(
                              "Achievement bullets: action + method + verified result",
                              "نقاط الإنجاز: إجراء + طريقة + نتيجة موثقة"
                            ),
                            t(
                              "Portfolio / professional links",
                              "روابط معرض الأعمال / الروابط المهنية"
                            ),
                          ][i]
                        }
                        <textarea
                          maxLength={
                            key === "name"
                              ? 100
                              : key === "achievements"
                                ? 4000
                                : 2000
                          }
                          value={state.cv[key]}
                          onChange={e =>
                            update(s => ({
                              ...s,
                              cv: { ...s.cv, [key]: e.target.value },
                            }))
                          }
                        />
                      </label>
                    ))}
                    <button
                      className="primary"
                      onClick={() =>
                        download(
                          "DataPath-CV.txt",
                          `${state.cv.name}\n${txt(learningPathTitle(state.profile))}\n\n${state.cv.summary}\n\n${state.cv.achievements}\n\n${state.cv.links}`
                        )
                      }
                    >
                      <Download size={16} />
                      {t("Export CV draft", "تصدير مسودة السيرة")}
                    </button>
                    <hr />
                    {aiControls}
                    <button
                      className="secondary"
                      disabled={!aiAvailable || !consent || coach.isPending}
                      onClick={() =>
                        askCoach(
                          "cv",
                          t(
                            "Improve my CV for my target role. Identify missing evidence; never invent results.",
                            "حسّن سيرتي الذاتية لدوري المستهدف. حدد الأدلة الناقصة ولا تختلق نتائج."
                          )
                        )
                      }
                    >
                      {t("Review with AI", "مراجعة بالذكاء الاصطناعي")}
                    </button>
                    {coachReply && (
                      <div className="coach-reply">{coachReply}</div>
                    )}
                  </section>
                  <section className="card">
                    <h2>
                      {t(
                        "Ready for your next opportunity",
                        "استعد لفرصتك القادمة"
                      )}
                    </h2>
                    {[
                      [
                        "portfolio",
                        "Publish a relevant portfolio with reproducible evidence",
                        "انشر معرض أعمال ذا صلة وأدلة قابلة للتكرار",
                      ],
                      [
                        "cv",
                        "Tailor your CV to a real job description",
                        "خصص سيرتك الذاتية لوصف وظيفي حقيقي",
                      ],
                      [
                        "stories",
                        "Prepare three STAR stories with truthful outcomes",
                        "جهز ثلاث قصص STAR بنتائج حقيقية",
                      ],
                      [
                        "mock",
                        "Complete a technical and behavioral mock interview",
                        "أكمل مقابلة تدريبية تقنية وسلوكية",
                      ],
                      [
                        "research",
                        "Research the company and prepare thoughtful questions",
                        "ابحث عن الشركة وجهز أسئلة مدروسة",
                      ],
                      [
                        "apply",
                        "Track applications and follow-up dates",
                        "تتبع الطلبات ومواعيد المتابعة",
                      ],
                    ].map(([id, en, ar]) => (
                      <label className="rubric-item" key={id}>
                        <input
                          type="checkbox"
                          checked={state.jobChecklist.includes(id)}
                          onChange={e =>
                            update(s => ({
                              ...s,
                              jobChecklist: e.target.checked
                                ? [...s.jobChecklist, id]
                                : s.jobChecklist.filter(x => x !== id),
                            }))
                          }
                        />
                        {t(en, ar)}
                      </label>
                    ))}
                    <hr />
                    <h3>{t("Application tracker", "متتبع طلبات التوظيف")}</h3>
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        update(s => ({
                          ...s,
                          applications: [
                            ...s.applications,
                            {
                              id: crypto.randomUUID(),
                              company: String(data.get("company")),
                              role: String(data.get("role")),
                              status: "saved" as const,
                              followUp: String(data.get("followUp")),
                            },
                          ].slice(-100),
                        }));
                        e.currentTarget.reset();
                      }}
                    >
                      <label>
                        {t("Company", "الشركة")}
                        <input name="company" required maxLength={120} />
                      </label>
                      <label>
                        {t("Role", "الدور")}
                        <input
                          name="role"
                          maxLength={120}
                          defaultValue={txt(learningPathTitle(state.profile))}
                        />
                      </label>
                      <label>
                        {t("Follow-up date", "موعد المتابعة")}
                        <input name="followUp" type="date" />
                      </label>
                      <button className="secondary">
                        {t("Add opportunity", "إضافة فرصة")}
                      </button>
                    </form>
                    {state.applications.map(job => (
                      <div className="application-row" key={job.id}>
                        <strong>{job.company}</strong>
                        <small>
                          {job.role} · {job.followUp}
                        </small>
                        <label>
                          {t("Application status", "حالة الطلب")}
                          <select
                            value={job.status}
                            onChange={e =>
                              update(s => ({
                                ...s,
                                applications: s.applications.map(j =>
                                  j.id === job.id
                                    ? {
                                        ...j,
                                        status: e.target
                                          .value as typeof job.status,
                                      }
                                    : j
                                ),
                              }))
                            }
                          >
                            {[
                              ["saved", "Saved", "محفوظ"],
                              ["applied", "Applied", "تم التقديم"],
                              ["interview", "Interview", "مقابلة"],
                              ["offer", "Offer", "عرض"],
                              ["closed", "Closed", "مغلق"],
                            ].map(([id, en, ar]) => (
                              <option key={id} value={id}>
                                {t(en, ar)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    ))}
                  </section>
                </div>
              )}
              {page === "coach" && (
                <section className="card coach-card">
                  <span className="square-icon">
                    <MessageSquareText />
                  </span>
                  <h2>
                    {t(
                      "A thinking partner for your next step.",
                      "شريك تفكير لخطوتك القادمة."
                    )}
                  </h2>
                  <p>
                    {t(
                      "Ask about your skill gaps, study approach or portfolio. The coach uses your curated topics and does not replace your curriculum.",
                      "اسأل عن فجوات مهاراتك أو طريقة التعلم أو معرض أعمالك. يستخدم المدرب موضوعاتك المنسقة ولا يستبدل المنهج."
                    )}
                  </p>
                  <div className="coach-reply">
                    <strong>{t("Your next step", "خطوتك التالية")}</strong>
                    <p>
                      {next
                        ? txt(next.title)
                        : t(
                            "Validate your knowledge with your portfolio project.",
                            "تحقق من معرفتك بمشروع معرض الأعمال."
                          )}
                    </p>
                    <p>
                      {t(
                        `Plan for approximately ${plan.remainingHours} hours of remaining work.`,
                        `خطط لنحو ${plan.remainingHours} ساعة من العمل المتبقي.`
                      )}
                    </p>
                    <small>
                      {t(
                        "Curated guidance · available without AI",
                        "إرشادات منسقة · متاحة دون ذكاء اصطناعي"
                      )}
                    </small>
                  </div>
                  <label>
                    {t(
                      "What would you like help with?",
                      "بماذا تريد المساعدة؟"
                    )}
                    <textarea
                      maxLength={2000}
                      value={coachInput}
                      onChange={e => setCoachInput(e.target.value)}
                    />
                  </label>
                  {aiControls}
                  <button
                    className="primary"
                    disabled={
                      !aiAvailable ||
                      !consent ||
                      coach.isPending ||
                      coachInput.trim().length < 3
                    }
                    onClick={() => askCoach("coach", coachInput)}
                  >
                    <MessageSquareText size={16} />
                    {coach.isPending
                      ? t("Thinking…", "جارٍ التفكير…")
                      : t("Ask my coach", "اسأل مدربي")}
                  </button>
                  {coachReply && (
                    <div className="coach-reply" role="status">
                      {coachReply}
                    </div>
                  )}
                </section>
              )}
              {page === "settings" && (
                <div className="two-column settings-grid">
                  <section className="card">
                    <h2>{t("Your learning profile", "ملف تعلمك")}</h2>
                    {me.data && <div className="setting-row">
                      <div><strong>{t("Account security", "أمان الحساب")}</strong><small>{t("Sign out on every device, including this one.", "سجل الخروج من كل الأجهزة، بما فيها هذا الجهاز.")}</small></div>
                      <button className="secondary" disabled={revokeSessions.isPending} onClick={async () => {
                        if (dirty && !window.confirm(t("Unsaved changes will be lost. Sign out everywhere?", "ستفقد التغييرات غير المحفوظة. هل تريد الخروج من كل الأجهزة؟"))) return;
                        try {
                          await revokeSessions.mutateAsync();
                          utils.datapath.load.reset();
                          setReady(false);
                          utils.auth.me.setData(undefined, null);
                        } catch { window.alert(t("Could not sign out all devices. Please try again.", "تعذر تسجيل الخروج من كل الأجهزة. حاول مرة أخرى.")); }
                      }}>{t("Sign out all devices", "الخروج من كل الأجهزة")}</button>
                    </div>}

                    <div className="setting-row">
                      <div>
                        <strong>{t("Appearance", "شكل المنصة")}</strong>
                        <small>
                          {t(
                            "Choose the mode that is easier on your eyes.",
                            "اختار الـMode الأريح لعينك."
                          )}
                        </small>
                      </div>
                      <button
                        className="secondary"
                        onClick={() =>
                          setTheme(value =>
                            value === "light" ? "dark" : "light"
                          )
                        }
                      >
                        {theme === "light" ? (
                          <Moon size={16} />
                        ) : (
                          <Sun size={16} />
                        )}
                        {theme === "light" ? "Dark mode" : "Light mode"}
                      </button>
                    </div>
                    <div className="profile-editor">
                      <span className="profile-avatar">
                        {state.profile.avatarData ? (
                          <img
                            src={state.profile.avatarData}
                            alt={t("Profile", "الملف الشخصي")}
                          />
                        ) : (
                          <Camera size={26} />
                        )}
                      </span>
                      <div>
                        <label>
                          {t("Display name", "الاسم الظاهر")}
                          <input
                            value={state.profile.displayName}
                            maxLength={100}
                            onChange={event =>
                              patchProfile({ displayName: event.target.value })
                            }
                            placeholder={
                              me.data?.name || t("Your name", "اسمك")
                            }
                          />
                        </label>
                        <label className="import-label">
                          {t("Profile photo", "الصورة الشخصية")}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={async event => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              try {
                                patchProfile({
                                  avatarData: await avatarFromFile(file),
                                });
                              } catch {
                                setNotice(
                                  t(
                                    "Choose a PNG, JPEG or WebP image under 5 MB.",
                                    "اختر صورة PNG أو JPEG أو WebP أقل من ٥ ميجابايت."
                                  )
                                );
                              }
                              event.target.value = "";
                            }}
                          />
                        </label>
                        {state.profile.avatarData && (
                          <button
                            className="text-button"
                            onClick={() => patchProfile({ avatarData: "" })}
                          >
                            {t("Remove photo", "حذف الصورة")}
                          </button>
                        )}
                      </div>
                    </div>
                    <p>
                      {txt(learningPathTitle(state.profile))} · {state.profile.weeks}{" "}
                      {t("weeks", "أسبوعاً")}
                    </p>
                    <button
                      className="primary"
                      onClick={() => setEditing(true)}
                    >
                      {t("Edit goals & assessment", "تعديل الأهداف والتقييم")}
                    </button>
                  </section>
                  <section className="card proof-settings-card">
                    <span className="square-icon"><BadgeCheck size={20} /></span>
                    <h2>Public proof page</h2>
                    {!me.data ? <p>Sign in to publish a server-verified proof page.</p> : (
                      <>
                        <p>Publishing shows your saved display name (or account name). Opt in only when you are ready. Your email, CV, applications, notes, and private progress never appear.</p>
                        <form onSubmit={async event => {
                          event.preventDefault();
                          try {
                            await enableProof.mutateAsync({ handle: proofHandle });
                            await refreshProof();
                            setNotice("Your proof page is public.");
                          } catch (error: any) {
                            setNotice(error?.message || "Could not publish that handle.");
                          }
                        }}>
                          <label>Public handle<input value={proofHandle} onChange={event => setProofHandle(event.target.value.toLowerCase())} minLength={3} maxLength={48} pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?" placeholder="mina-data" required /></label>
                          <button className="primary" disabled={enableProof.isPending}>{proofSettings.data?.enabled ? "Update public handle" : "Enable proof page"}</button>
                        </form>
                        {proofSettings.data?.enabled && proofSettings.data.handle && (
                          <div className="button-row">
                            <a className="secondary" href={`/p/${proofSettings.data.handle}`} target="_blank" rel="noopener noreferrer">View public page <ArrowUpRight size={15} /></a>
                            <button className="danger" disabled={disableProof.isPending} onClick={() => disableProof.mutate(undefined, { onSuccess: () => { void refreshProof(); setNotice("Your proof page is private."); } })}>Disable public page</button>
                          </div>
                        )}
                        <label className="checkline"><input type="checkbox" checked={Boolean(proofSettings.data?.showTargets)} disabled={targetVisibility.isPending || !proofSettings.data} onChange={event => targetVisibility.mutate({ visible: event.target.checked }, { onSuccess: () => { void refreshProof(); } })} />Show my target role and industry</label>
                        <h3>Credential visibility</h3>
                        {proofSettings.isError && <p role="alert">Could not load proof settings. Please retry when the account connection is available.</p>}
                        {!proofSettings.data?.credentials.length && <p className="muted">Pass a server-graded skill assessment or SQL lab to add verified credentials.</p>}
                        {proofSettings.data?.credentials.map(credential => (
                          <label className="checkline" key={credential.id}>
                            <input type="checkbox" checked={credential.visible} disabled={credentialVisibility.isPending} onChange={event => credentialVisibility.mutate({ credentialId: credential.id, visible: event.target.checked }, { onSuccess: () => { void refreshProof(); } })} />
                            {credential.type === "skill_cert" ? skillById[credential.refId]?.title.en || credential.refId : sqlLabChallenges.find(item => item.id === credential.refId)?.title || credential.refId}
                          </label>
                        ))}
                        <div className="proof-preview-card"><h3>Private preview</h3>{proofPreview.data && <ProofPreview proof={proofPreview.data} />}</div>
                      </>
                    )}
                  </section>
                  <section className="card study-session-card">
                    <span className="square-icon">
                      <Clock3 size={20} />
                    </span>
                    <h2>{t("Log a study session", "سجل جلسة تعلم")}</h2>
                    <p>
                      Record focused learning time after you finish. This only
                      tracks time you enter yourself.
                    </p>
                    <form
                      className="session-form"
                      onSubmit={e => {
                        e.preventDefault();
                        const minutes = Number(
                          new FormData(e.currentTarget).get("minutes")
                        );
                        update(s => ({
                          ...s,
                          sessions: [
                            ...s.sessions,
                            { date: new Date().toISOString(), minutes },
                          ].slice(-365),
                        }));
                        setNotice(
                          t("Study session recorded.", "تم تسجيل جلسة التعلم.")
                        );
                      }}
                    >
                      <label>
                        {t("Minutes", "الدقائق")}
                        <input
                          name="minutes"
                          type="number"
                          min={1}
                          max={480}
                          defaultValue={25}
                          required
                        />
                      </label>
                      <button className="secondary">
                        {t("Log session", "تسجيل الجلسة")}
                      </button>
                    </form>
                    <div className="session-total">
                      <small>TOTAL RECORDED</small>
                      <strong>
                        {state.sessions.reduce(
                          (sum, item) => sum + item.minutes,
                          0
                        )}{" "}
                        min
                      </strong>
                    </div>
                  </section>
                  <section className="card data-controls-card">
                    <h2>{t("Your data belongs to you", "بياناتك ملكك")}</h2>
                    <div className="button-row">
                      <button
                        className="secondary"
                        onClick={() =>
                          download(
                            "datapath-progress.json",
                            JSON.stringify(state, null, 2),
                            "application/json"
                          )
                        }
                      >
                        <Download size={16} />
                        {t("Export progress", "تصدير التقدم")}
                      </button>
                      <label className="import-label">
                        {t("Import backup", "استيراد نسخة")}
                        <input
                          type="file"
                          accept="application/json,.json"
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              if (file.size > 1000000) throw Error();
                              const data = learningStateSchema.parse(
                                JSON.parse(await file.text())
                              );
                              if (
                                window.confirm(
                                  t(
                                    "Replace the current workspace with this backup?",
                                    "استبدال مساحة العمل الحالية بهذه النسخة؟"
                                  )
                                )
                              )
                                update(() => data);
                            } catch {
                              setNotice(
                                t(
                                  "This backup is invalid or too large.",
                                  "هذه النسخة غير صالحة أو كبيرة جداً."
                                )
                              );
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                    {me.data && (
                      <button
                        className="text-button spaced"
                        onClick={() => {
                          if (
                            window.confirm(
                              t(
                                "Replace this account workspace with your guest progress? Save afterwards to confirm.",
                                "استبدال مساحة الحساب بتقدم الزائر؟ احفظ بعد ذلك للتأكيد."
                              )
                            )
                          ) {
                            try {
                              const guest = readGuestForImport(localStorage);
                              update(() => guest);
                              setNotice(t("Guest progress imported. Save progress to keep it in your account.", "تم استيراد تقدم الزائر. احفظ التقدم للاحتفاظ به في حسابك."));
                            } catch {
                              setNotice(t("No readable guest save was found. Your account workspace has not changed.", "لم يتم العثور على تقدم زائر قابل للقراءة. لم تتغير مساحة حسابك."));
                            }
                          }
                        }}
                      >
                        {t("Bring in guest progress", "استيراد تقدم الزائر")}
                      </button>
                    )}
                    <hr />
                    <button
                      className="danger"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            t(
                              "Delete your DataPath learning progress? Export a backup first if needed.",
                              "حذف تقدم تعلمك في DataPath؟ صدّر نسخة أولاً إن احتجت."
                            )
                          )
                        )
                          return;
                        try {
                          if (me.data) await remove.mutateAsync();
                          else localStorage.removeItem(storageKey);
                          workspaceEpoch.current++;
                          setState(newState());
                          setRevision(0);
                          setDirty(false);
                          setNotice(
                            t(
                              "Learning progress deleted.",
                              "تم حذف تقدم التعلم."
                            )
                          );
                        } catch {
                          setNotice(
                            t(
                              "Deletion failed. Your data has not been cleared.",
                              "فشل الحذف. لم تُمسح بياناتك."
                            )
                          );
                        }
                      }}
                    >
                      {t("Delete learning progress", "حذف تقدم التعلم")}
                    </button>
                  </section>
                  <section className="card">
                    <h2>{t("Transparent by design", "شفافية في التصميم")}</h2>
                    <p>
                      {t(
                        "DataPath is free. External paid courses are optional and appear only when you allow them. No payment is collected here.",
                        "DataPath مجاني. الدورات الخارجية المدفوعة اختيارية ولا تظهر إلا بموافقتك. لا تُحصّل مدفوعات هنا."
                      )}
                    </p>
                    <p>
                      {t(
                        "Guest progress is stored in this browser. Signed-in progress is stored in your account when you save. Your CV and answers are sent to the AI provider only when you request AI assistance and consent.",
                        "يُحفظ تقدم الزائر في هذا المتصفح. يُحفظ تقدم المسجل في حسابه عند الحفظ. تُرسل سيرتك وإجاباتك لمزود الذكاء الاصطناعي فقط عند طلب المساعدة والموافقة."
                      )}
                    </p>
                    <p>
                      {t(
                        "Skill checks are short learning signals, not professional certifications. Time estimates are planning aids, not job guarantees.",
                        "فحوص المهارات مؤشرات تعلم قصيرة وليست شهادات مهنية. تقديرات الوقت للمساعدة في التخطيط وليست ضماناً للتوظيف."
                      )}
                    </p>
                    <h3>{t("Curriculum sources", "مصادر المنهج")}</h3>
                    {sources.map(s => (
                      <a
                        className="resource-link"
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {s.title}
                        <ArrowUpRight size={14} />
                      </a>
                    ))}
                    <p className="muted">
                      {t(
                        `${careers.length} representative career paths, not a market ranking. Curated September 2026. Role demand varies by region.`,
                        `${careers.length} مساراً مهنياً تمثيلياً وليست ترتيباً للسوق. نُسقت في سبتمبر ٢٠٢٦. يختلف الطلب حسب المنطقة.`
                      )}
                    </p>
                  </section>
                </div>
              )}
            </>
          )}
          <footer>
            <span>
              DataPath <span className="brand-dot">↗</span>
            </span>
            <span>
              {t(
                "Small steps. Real skills. Your future.",
                "خطوات صغيرة. مهارات حقيقية. مستقبلك."
              )}
            </span>
          </footer>
        </main>
      </div>
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="auth-modal" showCloseButton={false}
          onOpenAutoFocus={event => { event.preventDefault(); authDialog.current?.querySelector<HTMLInputElement>("input")?.focus(); }}
          onCloseAutoFocus={event => { event.preventDefault(); authReturnFocus.current?.focus(); }}>
          <form ref={authDialog}
            onSubmit={event => {
              event.preventDefault();
              void submitAuth();
            }}
          >
            <DialogClose asChild><Button variant="ghost" size="icon" className="modal-close" type="button" aria-label={t("Close", "إغلاق")}><X size={18} /></Button></DialogClose>
            <div className="eyebrow">
              {t("KEEP YOUR PROGRESS", "احفظ تقدمك")}
            </div>
            <DialogTitle>
              {authMode === "login"
                ? t("Welcome back", "أهلاً بعودتك")
                : t("Create your free account", "أنشئ حسابك المجاني")}
            </DialogTitle>
            <DialogDescription>{t("Save your learning progress securely across devices.", "احفظ تقدمك في التعلم بأمان عبر أجهزتك.")}</DialogDescription>
            {!caps.data?.accounts && (
              <div role="status" className="notice">
                <p>{caps.isPending ? "Checking account availability…" : "Account access is temporarily unavailable. You can still explore as a guest; your progress stays in this browser."}</p>
                {!caps.isPending && <Button type="button" variant="secondary" onClick={() => void caps.refetch()}>Retry account connection</Button>}
              </div>
            )}
            {authMode === "register" && (
              <label>
                {t("Name", "الاسم")}
                <Input
                  autoFocus
                  autoComplete="name"
                  value={authForm.name}
                  onChange={e =>
                    setAuthForm({ ...authForm, name: e.target.value })
                  }
                  minLength={2}
                  maxLength={80}
                  required
                />
              </label>
            )}
            <label>
              {t("Email", "البريد الإلكتروني")}
              <Input
                autoFocus={authMode === "login"}
                type="email"
                autoComplete="email"
                value={authForm.email}
                onChange={e =>
                  setAuthForm({ ...authForm, email: e.target.value })
                }
                required
              />
            </label>
            <label>
              {t("Password", "كلمة المرور")}
              <Input
                type="password"
                autoComplete={authMode === "register" ? "new-password" : "current-password"}
                value={authForm.password}
                onChange={e =>
                  setAuthForm({ ...authForm, password: e.target.value })
                }
                minLength={10}
                maxLength={128}
                required
              />
              <small>{t("At least 10 characters", "١٠ أحرف على الأقل")}</small>
            </label>
            {authError && <p role="alert" className="auth-error">{authError}</p>}
            <Button
              type="submit"
              disabled={!caps.data?.accounts || login.isPending || register.isPending}
            >
              {authMode === "login"
                ? t("Sign in", "تسجيل الدخول")
                : t("Create account", "إنشاء الحساب")}
            </Button>
            <Button
              variant="link"
              type="button"
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setAuthError("");
              }}
            >
              {authMode === "login"
                ? t("New here? Create an account", "مستخدم جديد؟ أنشئ حساباً")
                : t(
                    "Already have an account? Sign in",
                    "لديك حساب؟ سجل الدخول"
                  )}
            </Button>
            {caps.data?.oauth && (
              <Button variant="secondary" type="button" onClick={startLogin}>
                {t(
                  "Continue with connected account",
                  "المتابعة بالحساب المتصل"
                )}
              </Button>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProofPreview({
  proof,
}: {
  proof: {
    displayName: string;
    targetRole: string | null;
    industry: string | null;
    credentials: Array<{
      id: string;
      type: string;
      title: string;
      verifiedAt: Date | string;
    }>;
  };
}) {
  return (
    <div className="proof-preview">
      <div className="proof-preview-header">
        <strong>{proof.displayName}</strong>
        {(proof.targetRole || proof.industry) && (
          <small>{[proof.targetRole, proof.industry].filter(Boolean).join(" · ")}</small>
        )}
      </div>
      <p><BadgeCheck size={16} /> Submitted answers or SQL were checked by the server when earned. Practice solutions are available in the app; this is not proctored or independent certification.</p>
      <div className="proof-preview-grid">
        {proof.credentials.map(credential => (
          <article key={credential.id}>
            <small>{credential.type === "skill_cert" ? "VERIFIED SKILL" : credential.type === "lab_pass" ? "VERIFIED SQL LAB" : "VERIFIED PROJECT"}</small>
            <strong>{credential.title}</strong>
            <time dateTime={new Date(credential.verifiedAt).toISOString()}>
              {new Date(credential.verifiedAt).toLocaleDateString()}
            </time>
          </article>
        ))}
        {!proof.credentials.length && <span className="muted">No visible credentials yet.</span>}
      </div>
    </div>
  );
}

function SqlPracticeLab({
  initialChallengeId,
  onChoose,
  state,
  update,
  serverVerificationEnabled,
  onVerified,
  openRoadmap,
}: {
  state: LearningState;
  update: (fn: (state: LearningState) => LearningState) => void;
  serverVerificationEnabled: boolean;
  onVerified: () => void;
  openRoadmap: (topicId: string) => void;
  initialChallengeId: string;
  onChoose: (id: string) => void;
}) {
  const verifySql = trpc.grading.sql.useMutation();
  const { challenges: allSqlChallenges, tables: sqlLabTables } = sqlContext(
    state.profile.sector,
  );
  const sqlLabChallenges = allSqlChallenges.filter(
    (challenge) =>
      skillById.sql.topics.find((topic) => topic.id === challenge.topicId)!
        .level <= (requirements(state.profile).sql || 1),
  );
  const [hintCount, setHintCount] = useState(0);
  const [challengeId, setChallengeId] = useState(
    sqlLabChallenges.some((item) => item.id === initialChallengeId)
      ? initialChallengeId
      : sqlLabChallenges[0].id,
  );
  const challenge = sqlLabChallenges.find((item) => item.id === challengeId)!;
  const [query, setQuery] = useState(
    [...state.labAttempts]
      .reverse()
      .find(
        (attempt) =>
          attempt.challengeId === challengeId &&
          (attempt.sector || "banking") === state.profile.sector,
      )?.query ?? challenge.starterSql,
  );
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof runSqlInWorker>
  > | null>(null);
  const [running, setRunning] = useState(false);
  const passedIds = new Set(
    [...passedLabIds(state)].filter((id) =>
      sqlLabChallenges.some((item) => item.id === id),
    ),
  );
  const drafts = useRef<Record<string, string>>({});
  const challengeAttempts = state.labAttempts.filter(
    (attempt) =>
      attempt.challengeId === challengeId &&
      (attempt.sector || "banking") === state.profile.sector,
  );
  const scoredAttempts = challengeAttempts.filter(
    (attempt) => attempt.checksTotal,
  );
  const firstScore = scoredAttempts[0];
  const latestScore = scoredAttempts[scoredAttempts.length - 1];
  const score = (attempt: typeof firstScore) =>
    Math.round(
      (100 * (attempt.checksPassed || 0)) / (attempt.checksTotal || 1),
    );
  const choose = (id: string) => {
    if (running) return;
    drafts.current[challengeId] = query;
    const nextChallenge = sqlLabChallenges.find((item) => item.id === id)!;
    setChallengeId(id);
    onChoose(id);
    setQuery(
      drafts.current[id] ??
        [...state.labAttempts]
          .reverse()
          .find(
            (attempt) =>
              attempt.challengeId === id &&
              (attempt.sector || "banking") === state.profile.sector,
          )?.query ??
        nextChallenge.starterSql,
    );
    setResult(null);
    setHintCount(0);
  };
  const run = async () => {
    verifySql.reset();
    setRunning(true);
    const nextResult = await runSqlInWorker(
      challenge.id,
      query,
      state.profile.sector,
    );
    setResult(nextResult);
    update((current) =>
      current.profile.role === state.profile.role &&
      current.profile.sector === state.profile.sector
        ? recordLabAttempt(current, challenge.id, query, nextResult)
        : current,
    );
    if (serverVerificationEnabled && !nextResult.unavailable)
      verifySql.mutate(
        {
          challengeId: challenge.id,
          query,
          sector: state.profile.sector,
          clientPassed: nextResult.passed,
        },
        { onSuccess: grade => grade.passed && onVerified() },
      );
    setRunning(false);
  };
  return (
    <section className="sql-lab">
      <div className="lab-intro">
        <div>
          <span className="eyebrow">PRACTICE WITH REAL DATA</span>
          <h2>Guided SQL workbench</h2>
          <p>
            Write and execute SQL against a synthetic{" "}
            {sectorById[state.profile.sector].title} dataset. DataPath compares
            the real result with the business requirement and saves successful
            work as lesson evidence.
          </p>
        </div>
        <div className="lab-progress">
          <strong>
            {passedIds.size}/{sqlLabChallenges.length}
          </strong>
          <span>challenges passed</span>
          <div>
            <i
              style={{
                width: `${(passedIds.size / sqlLabChallenges.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <details className="studio-sql-picker">
        <summary>
          SQL exercises · {sqlLabChallenges.length} in your path
        </summary>
        <div className="lab-tabs" aria-label="SQL challenges">
          {sqlLabChallenges.map((item, index) => (
            <button
              key={item.id}
              disabled={running}
              aria-pressed={item.id === challengeId}
              className={item.id === challengeId ? "active" : ""}
              onClick={() => choose(item.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{item.title}</b>
              {passedIds.has(item.id) && <Check size={15} />}
            </button>
          ))}
        </div>
      </details>
      <div className="lab-workspace">
        <details
          className="lab-brief card studio-instructions"
          key={challenge.id}
        >
          <summary>Instructions, dataset & hints</summary>
          <div className="studio-instructions-body">
            <LessonGlossary language={state.profile.language} />
            <div className="lab-meta">
              <span>
                {challenge.level} · {challenge.mode || "Build"}
              </span>
              <button
                className="text-button"
                onClick={() => openRoadmap(challenge.topicId)}
              >
                Open lesson
              </button>
            </div>
            <h3>{challenge.title}</h3>
            <small>
              About {practiceMeta(challenge.topicId, "sql").minutes} minutes
            </small>
            <p>{challenge.brief}</p>
            <strong>Your task</strong>
            <p>{challenge.task}</p>
            <section className="progressive-hints">
              <h4>Hints</h4>
              <ol>
                {challenge.hints.slice(0, hintCount).map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ol>
              <button
                className="text-button"
                disabled={hintCount >= challenge.hints.length}
                onClick={() => setHintCount((count) => count + 1)}
              >
                {hintCount >= challenge.hints.length
                  ? "All hints revealed"
                  : `Reveal hint ${hintCount + 1}`}
              </button>
            </section>
            <div className="dataset-preview">
              <strong>Dataset</strong>
              {Object.entries(sqlLabTables).map(([name, rows]) => (
                <details key={name} open={name === "transactions"}>
                  <summary>
                    {name} · {rows.length} rows
                  </summary>
                  <div className="lab-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          {Object.keys(rows[0]).map((column) => (
                            <th key={column}>{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex}>
                                {value === null ? "NULL" : value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </details>

        <article className="query-console">
          <div className="studio-sql-task">
            <span className="eyebrow">{challenge.level} · YOUR TASK</span>
            <h3>{challenge.title}</h3>
            <p>{challenge.task}</p>
          </div>
          <div className="console-bar">
            <span>
              <i /> query.sql
            </span>
            <button
              disabled={running}
              onClick={() => {
                setQuery(challenge.starterSql);
                setResult(null);
              }}
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
          <textarea
            disabled={running}
            maxLength={4000}
            aria-label="SQL query editor"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="console-actions">
            <small>Isolated in-browser database · SELECT queries only</small>
            <button className="primary" disabled={running} onClick={run}>
              <SquareTerminal size={16} />
              {running ? "Running…" : "Run query"}
            </button>
          </div>
          {serverVerificationEnabled && <p role="status">{verifySql.isPending ? "Checking this submission on the server…" : verifySql.isError ? "Server verification was unavailable. Your local practice result is kept; run again to retry verification." : verifySql.data ? (verifySql.data.passed ? "Server verification passed." : "Server verification did not pass. No credential was issued for this submission.") : ""}</p>}
          <div className="query-result" aria-live="polite">
            {!result ? (
              <div className="result-empty">
                Run your query to see validation and results.
              </div>
            ) : (
              <>
                <div
                  className={
                    result.unavailable ? "result-status" : result.passed
                      ? "result-status passed"
                      : "result-status failed"
                  }
                >
                  <strong>
                    {result.unavailable ? "Practice engine unavailable" : result.passed ? "Query passed" : "Query needs work"}
                  </strong>
                  <span>{result.message}</span>
                  {result.unavailable && <p>Your query is still in the editor. This was not counted as an attempt. Use Run query to retry.</p>}
                </div>
                <div className="query-checks">
                  {result.checks.map((check) => (
                    <span
                      className={check.passed ? "passed" : "failed"}
                      key={check.label}
                    >
                      {check.passed ? <Check size={14} /> : "×"} {check.label}
                      {!check.passed && (
                        <button
                          className="text-button"
                          onClick={() =>
                            openRoadmap(check.topicId || challenge.topicId)
                          }
                        >
                          Review lesson →
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {!result.passed && !result.unavailable && (
                  <p>
                    Try this: {challenge.hints[0]}{" "}
                    <button
                      className="text-button"
                      onClick={() => openRoadmap(challenge.topicId)}
                    >
                      Open the related lesson
                    </button>
                  </p>
                )}
                {result.executed && result.rows.length === 0 && (
                  <p>Query returned 0 rows.</p>
                )}
                {!!result.resultFeedback?.length && (
                  <aside
                    className="sql-coaching"
                    aria-label="Result comparison"
                  >
                    <h3>What to check next</h3>
                    <ul>
                      {result.resultFeedback.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </aside>
                )}
                {result.coaching && (
                  <aside
                    className="sql-coaching"
                    aria-label="SQL debugging guidance"
                  >
                    <span className="eyebrow">DEBUGGING NEXT STEP</span>
                    <h3>{result.coaching.title}</h3>
                    <p>{result.coaching.explanation}</p>
                    <small>Syntax example · adapt it to your task</small>
                    <pre>
                      <code>{result.coaching.example}</code>
                    </pre>
                  </aside>
                )}
                {result.error && (
                  <pre className="sql-error">{result.error}</pre>
                )}
                {result.executed && result.columns.length > 0 && (
                  <div className="lab-table-wrap result-table">
                    <table>
                      <thead>
                        <tr>
                          {result.columns.map((column) => (
                            <th key={column}>{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {result.columns.map((column) => (
                              <td key={column}>
                                {row[column] == null ? "NULL" : row[column]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </article>
      </div>
      <section className="card lab-history" aria-label="SQL attempt history">
        <h3>Your progress on this challenge</h3>
        <p>
          {challengeAttempts.length} saved attempts ·{" "}
          {challengeAttempts.filter((attempt) => attempt.passed).length}{" "}
          successful
          {firstScore && latestScore && (
            <>
              {" "}
              · Checks passed: {score(firstScore)}% initially →{" "}
              {score(latestScore)}% latest
            </>
          )}
        </p>
        <small>
          Showing this challenge within your latest 50 saved lab attempts. Older
          attempts may no longer appear. Hidden tests support practice; they are
          not independent certification.
        </small>
        {!challengeAttempts.length && <p>Run a query to start your history.</p>}
        {[...challengeAttempts].reverse().map((attempt, index) => (
          <details key={`${attempt.at}-${index}`}>
            <summary>
              {new Date(attempt.at).toLocaleString()} ·{" "}
              {attempt.passed ? "Passed" : "Needs work"}
              {attempt.checksTotal
                ? ` · ${attempt.checksPassed}/${attempt.checksTotal} checks`
                : ""}
            </summary>
            <p>
              {attempt.feedback ||
                "This older attempt has no detailed feedback."}
            </p>
            <pre>{attempt.query}</pre>
            <button
              className="secondary"
              disabled={running}
              onClick={() => {
                setQuery(attempt.query);
                setResult(null);
              }}
            >
              Restore this query
            </button>
          </details>
        ))}
      </section>
    </section>
  );
}

function Stat({
  label,
  value,
  sub,
  children,
}: {
  label: string;
  value: string;
  sub: string;
  children?: ReactNode;
}) {
  return (
    <section className="stat card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
      {children}
    </section>
  );
}

function QuizCard({
  title,
  questions,
  kind,
  targetId,
  state,
  update,
  lockedMessage,
  locked = false,
  compact = false,
  serverVerificationEnabled,
  onVerified,
}: {
  title: string;
  questions: QuizQuestion[];
  kind: "topic" | "level" | "skill" | "cumulative";
  targetId: string;
  state: LearningState;
  update: (fn: (s: LearningState) => LearningState) => void;
  lockedMessage?: string;
  locked?: boolean;
  compact?: boolean;
  serverVerificationEnabled: boolean;
  onVerified: () => void;
}) {
  const verifyQuiz = trpc.grading.quiz.useMutation();
  const lang = platformLanguage(state.profile.language);
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [reviewed, setReviewed] = useState(false);
  const latest = [...state.quizAttempts]
    .reverse()
    .find(attempt => attempt.kind === kind && attempt.targetId === targetId);
  const passMark = kind === "topic" ? 80 : kind === "skill" ? 95 : 80;
  const submit = () => {
    verifyQuiz.reset();
    const score = Math.round(
      (questions.filter(question => answers[question.id] === question.answer)
        .length /
        questions.length) *
        100,
    );
    update(current =>
      recordQuizResult(
        current,
        kind,
        targetId,
        questions,
        answers,
        crypto.randomUUID(),
        new Date().toISOString()
      )
    );
    if (serverVerificationEnabled) {
      const cumulativeSkills =
        kind === "cumulative"
          ? targetId.replace(/^review-/, "").split("+")
          : undefined;
      const requiredLevels = cumulativeSkills
        ? Object.fromEntries(
            cumulativeSkills.map(skillId => [
              skillId,
              Math.max(
                1,
                ...questions
                  .filter(question => question.topicId.startsWith(`${skillId}-`))
                  .map(question =>
                    skillById[skillId].topics.find(
                      topic => topic.id === question.topicId,
                    )?.level ?? 1,
                  ),
              ),
            ]),
          )
        : undefined;
      const targetLevel =
        kind === "skill"
          ? Math.max(
              1,
              ...questions.map(
                question =>
                  skillById[targetId].topics.find(
                    topic => topic.id === question.topicId,
                  )?.level ?? 1,
              ),
            )
          : undefined;
      verifyQuiz.mutate(
        {
          kind,
          targetId,
          answers,
          targetLevel,
          cumulativeSkills,
          requiredLevels,
          clientPassed: score >= (kind === "skill" ? 95 : 80),
        },
        { onSuccess: grade => grade.passed && onVerified() },
      );
    }
    setReviewed(true);
  };
  return (
    <div className={compact ? "quiz-card compact" : "quiz-card"}>
      <div className="section-top">
        <div>
          <span className="soft-tag">
            <BrainCircuit size={12} /> {kind.toUpperCase()} QUIZ
          </span>
          <h3>{title}</h3>
          <small className="assessment-meta">
            {questions.length} {t("questions", "سؤال")} · {t("Pass", "النجاح")}{" "}
            {passMark}%
          </small>
        </div>
        {latest && (
          <strong
            className={
              latest.passed ? "quiz-score passed" : "quiz-score failed"
            }
          >
            {latest.score}%
          </strong>
        )}
      </div>
      {locked ? (
        <p>
          {lockedMessage ||
            t(
              "Complete the required topic lessons and mini-quizzes before taking this assessment.",
              "أكمل دروس الموضوعات المطلوبة واختباراتها القصيرة لفتح هذا التقييم."
            )}
        </p>
      ) : !open ? (
        <button
          className="secondary small"
          onClick={() => {
            setAnswers({});
            setReviewed(false);
            setOpen(true);
          }}
        >
          {latest
            ? t("Retake quiz", "إعادة الاختبار")
            : t("Start quiz", "بدء الاختبار")}
        </button>
      ) : (
        <div className="quiz-questions">
          <p className="muted">
            {t(
              `Pass mark: ${passMark}%. Wrong answers return their topics to review.`,
              `درجة النجاح: ${passMark}٪. الإجابات الخاطئة تعيد موضوعاتها للمراجعة.`
            )}
          </p>
          <div className="quiz-answer-progress" role="status">{t(`${Object.keys(answers).length} of ${questions.length} answered`, `تمت الإجابة عن ${Object.keys(answers).length} من ${questions.length}`)}</div>
          {questions.map((question, questionIndex) => (
            <fieldset key={question.id}>
              <legend>
                {questionIndex + 1}. {question.prompt[lang]}
              </legend>
              {question.options.map((option, optionIndex) => (
                <label className="checkline" key={optionIndex}>
                  <input
                    type="radio"
                    name={`${targetId}-${question.id}`}
                    checked={answers[question.id] === optionIndex}
                    disabled={reviewed}
                    onChange={() =>
                      setAnswers(current => ({
                        ...current,
                        [question.id]: optionIndex,
                      }))
                    }
                  />
                  {option[lang]}
                </label>
              ))}
              {reviewed && (
                <div
                  className={
                    answers[question.id] === question.answer
                      ? "answer-feedback correct"
                      : "answer-feedback wrong"
                  }
                >
                  <strong>
                    {answers[question.id] === question.answer
                      ? t("Correct", "صح")
                      : t("Not quite", "مش صح")}
                  </strong>
                  {answers[question.id] !== question.answer && <p><strong>{t("Correct answer:", "الإجابة الصحيحة:")}</strong> {question.options[question.answer][lang]}</p>}
                  <p>{question.explanation[lang]}</p>
                </div>
              )}
            </fieldset>
          ))}
          <div className="button-row">
            {!reviewed ? (
              <button
                className="primary small"
                disabled={Object.keys(answers).length !== questions.length}
                onClick={submit}
              >
                {t("Submit answers", "إرسال الإجابات")}
              </button>
            ) : (
              <button
                className="primary small"
                onClick={() => {
                  setOpen(false);
                  setReviewed(false);
                  setAnswers({});
                  verifyQuiz.reset();
                }}
              >
                {t("Close review", "اقفل الـReview")}
              </button>
            )}
            {!reviewed && (
              <button className="text-button" onClick={() => setOpen(false)}>
                {t("Cancel", "إلغاء")}
              </button>
            )}
          </div>
        </div>
      )}
      {serverVerificationEnabled && <p role="status">{verifyQuiz.isPending ? "Checking your answers on the server…" : verifyQuiz.isError ? "Server verification was unavailable. Your local result is kept; reopen the quiz to retry." : verifyQuiz.data ? (verifyQuiz.data.passed ? "Server verification passed." : "Server verification did not pass. No credential was issued for this submission.") : ""}</p>}
      {latest && (
        <p className="quiz-result">
          {latest.passed
            ? t(
                "Passed. Keep practicing so the knowledge stays active.",
                "نجحت. استمر في التدريب حتى تظل المعرفة نشطة."
              )
            : t(
                `Review required: ${latest.weakTopics.map(id => skills.flatMap(skill => skill.topics).find(topic => topic.id === id)?.title.en || id).join(", ")}. These lessons are back in your plan.`,
                `محتاج تراجع: ${latest.weakTopics.map(id => skills.flatMap(skill => skill.topics).find(topic => topic.id === id)?.title.en || id).join("، ")}. الدروس دي رجعت تاني في خطتك.`
              )}
        </p>
      )}
    </div>
  );
}

function ReviewCenter({
  state,
  requiredIds,
  requiredLevels,
  update,
  openLesson,
  serverVerificationEnabled,
  onVerified,
}: {
  openLesson: (topicId: string) => void;
  state: LearningState;
  requiredIds: string[];
  requiredLevels: Record<string, number>;
  update: (fn: (s: LearningState) => LearningState) => void;
  serverVerificationEnabled: boolean;
  onVerified: () => void;
}) {
  const [reviewFilter, setReviewFilter] = useState<
    "all" | "due" | "scheduled" | "locked"
  >("all");
  const lang = platformLanguage(state.profile.language);
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const groups = reviewReadiness(requiredIds, state.certifiedSkills).map(
    (group, index) => {
      const schedule = reviewSchedule(
        state.quizAttempts,
        group.targetId,
        Date.now(),
        state.reviewTopics,
        group.skills
      );
      return {
        ...group,
        index,
        schedule,
        status: !group.ready ? "locked" : schedule.due ? "due" : "scheduled",
      };
    }
  );
  const visibleGroups = groups.filter(
    group => reviewFilter === "all" || group.status === reviewFilter
  );
  return (
    <section className="card spaced review-center">
      <span className="eyebrow">{t("SPACED REVIEW", "مراجعة دورية")}</span>
      <h2>
        {t(
          "Connect skills, not just isolated lessons.",
          "اربط المهارات ولا تكتفِ بدروس منفصلة."
        )}
      </h2>
      <p>
        {t(
          "Each review becomes available when you pass its listed skill assessments. A final single skill has its own review. Weak topics return to your roadmap.",
          "يفتح اختبار تراكمي بعد كل اختبارين شاملين للمهارات. تعود الموضوعات الضعيفة تلقائياً إلى المسار."
        )}
      </p>
      <div className="review-filters" role="group" aria-label="Filter reviews">
        {(
          [
            ["all", t("All reviews", "كل المراجعات")],
            ["due", t("Ready now", "جاهزة الآن")],
            ["scheduled", t("Scheduled", "مجدولة")],
            ["locked", t("Prerequisites needed", "تحتاج متطلبات سابقة")],
          ] as const
        ).map(([filter, label]) => (
          <button
            key={filter}
            className={reviewFilter === filter ? "chip selected" : "chip"}
            aria-pressed={reviewFilter === filter}
            onClick={() => setReviewFilter(filter)}
          >
            {label}
            <span>
              {filter === "all"
                ? groups.length
                : groups.filter(group => group.status === filter).length}
            </span>
          </button>
        ))}
      </div>
      {!visibleGroups.length && (
        <p role="status">
          {t(
            "No reviews in this category. Choose another filter to see your next steps.",
            "لا توجد مراجعات في هذه الفئة. اختر فئة أخرى لعرض خطواتك التالية."
          )}
        </p>
      )}
      <div className="review-card-grid">
        {visibleGroups.map(
          ({ skills: group, targetId, missing, ready, index, schedule }) => {
            const locked = !ready;
            const weakLessons = group.flatMap(id =>
              skillById[id].topics.filter(topic =>
                state.reviewTopics.includes(topic.id)
              )
            );
            const prerequisiteLessons = missing.flatMap(id =>
              skillById[id].topics
                .filter(
                  topic =>
                    topic.level <= requiredLevels[id] &&
                    !state.completed.includes(topic.id)
                )
                .slice(0, 1)
            );
            return (
              <div key={targetId} className="scheduled-review">
                <div className="review-schedule-status">
                  <span className="soft-tag">
                    {!ready
                      ? "Complete prerequisites"
                      : schedule.due
                        ? "Ready for review"
                        : "Scheduled"}
                  </span>
                  {ready && schedule.dueAt && (
                    <time dateTime={schedule.dueAt}>
                      Suggested: {new Date(schedule.dueAt).toLocaleDateString()}
                    </time>
                  )}
                </div>
                {ready && (
                  <p className="review-schedule-reason">{schedule.reason}</p>
                )}
                {(weakLessons.length > 0 || prerequisiteLessons.length > 0) && (
                  <div className="review-lesson-links">
                    <strong>
                      {t(
                        "Revisit before your next attempt",
                        "راجع قبل محاولتك التالية"
                      )}
                    </strong>
                    {[
                      ...new globalThis.Map(
                        [...weakLessons, ...prerequisiteLessons].map(topic => [
                          topic.id,
                          topic,
                        ])
                      ).values(),
                    ].map(topic => (
                      <button
                        key={topic.id}
                        className="secondary"
                        onClick={() => openLesson(topic.id)}
                      >
                        <BookOpen size={15} />
                        <span>{topic.title[lang]}</span>
                        <ArrowUpRight size={15} />
                      </button>
                    ))}
                  </div>
                )}
                <QuizCard
                  title={`${t("Review", "مراجعة")} ${index + 1}: ${group.map(id => skillById[id].title[lang]).join(" + ")}`}
                  questions={cumulativeQuiz(group, requiredLevels)}
                  kind="cumulative"
                  targetId={targetId}
                  state={state}
                  update={update}
                  serverVerificationEnabled={serverVerificationEnabled}
                  onVerified={onVerified}
                  locked={locked}
                  lockedMessage={
                    t(
                      "Pass these skill assessments first: ",
                      "اجتز تقييمات هذه المهارات أولاً: "
                    ) + missing.map(id => skillById[id].title[lang]).join(" · ")
                  }
                />
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}

function DiagnosticCard({
  id,
  state,
  update,
}: {
  id: string;
  state: LearningState;
  update: (fn: (s: LearningState) => LearningState) => void;
}) {
  const lang = platformLanguage(state.profile.language),
    t = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const [answer, setAnswer] = useState(-1);
  useEffect(() => setAnswer(-1), [id]);
  const q = diagnosticFor(id)[0],
    result = state.diagnostics[id];
  return (
    <div className="diagnostic">
      <span className="soft-tag">
        {t("OPTIONAL QUICK CHECK", "فحص سريع اختياري")}
      </span>
      <h3>{q.question[lang]}</h3>
      <p>
        {t(
          "One foundation question, not a mastery test. A missed answer adds foundational topics back to your plan.",
          "سؤال تأسيسي واحد، وليس اختبار إتقان. الإجابة الخاطئة تعيد موضوعات الأساس إلى خطتك."
        )}
      </p>
      {q.options.map((o, i) => (
        <label className="checkline" key={i}>
          <input
            type="radio"
            name={`diagnostic-${id}`}
            checked={answer === i}
            onChange={() => setAnswer(i)}
          />
          {o[lang]}
        </label>
      ))}
      <button
        className="secondary small"
        disabled={answer < 0}
        onClick={() =>
          update(s => ({
            ...s,
            diagnostics: { ...s.diagnostics, [id]: [answer] },
          }))
        }
      >
        {t("Check answer", "تحقق من الإجابة")}
      </button>
      {result && (
        <p role="status">
          {diagnosticScore(id, result)
            ? t(
                "Correct. Validate deeper skills through practice.",
                "صحيح. تحقق من المهارات الأعمق بالتدريب."
              )
            : t(
                "Review the foundations. Correct answer: ",
                "راجع الأساسيات. الإجابة الصحيحة: "
              )}
          {!diagnosticScore(id, result) && q.explanation[lang]}
        </p>
      )}
    </div>
  );
}
function ProfileSetup({
  state,
  done,
  cancel,
}: {
  state: LearningState;
  done: (profile: Profile) => void;
  cancel?: () => void;
}) {
  const [draft, setDraft] = useState(() => structuredClone(state));
  if (!state.onboarded) return <GuidedSetup state={state} done={done} cancel={cancel} />;
  return (
    <Onboarding
      state={draft}
      update={setDraft}
      done={() => done(draft.profile)}
      cancel={cancel}
    />
  );
}

function Onboarding({
  state,
  update,
  done,
  cancel,
}: {
  state: LearningState;
  update: (fn: (s: LearningState) => LearningState) => void;
  done: () => void;
  cancel?: () => void;
}) {
  const [step, setStep] = useState(0),
    [unsure, setUnsure] = useState(false),
    [beginnerSetup, setBeginnerSetup] = useState(false),
    [interests, setInterests] = useState<string[]>(["analytics"]),
    [coding, setCoding] = useState(1);
  const p = state.profile,
    lang = platformLanguage(p.language),
    t = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const patch = (v: Partial<Profile>) =>
    update(s => ({ ...s, profile: { ...s.profile, ...v } }));
  const req = requirements(p);
  const [autoPace, setAutoPace] = useState(!state.onboarded);
  const suggestedPace = suggestPace(state);
  useEffect(() => {
    if (step !== 2 || !autoPace) return;
    update(current => current.profile.weeks === suggestedPace.weeks && current.profile.hoursPerWeek === suggestedPace.hoursPerWeek
      ? current
      : { ...current, profile: { ...current.profile, weeks: suggestedPace.weeks, hoursPerWeek: suggestedPace.hoursPerWeek } });
  }, [step, autoPace, suggestedPace.weeks, suggestedPace.hoursPerWeek]);

  return (
    <div className="onboarding">
      <div className="onboarding-intro">
        <span className="eyebrow">
          {t("Choose your learning goal", "مرحباً بفصلك القادم")}
        </span>
        <h1>{t("A path that starts with you.", "مسار يبدأ بك.")}</h1>
        <p>
          {t(
            "Starting fresh or building on experience? Let’s find your direction and the skills that will get you there.",
            "تبدأ من الصفر أم تبني على خبرتك؟ لنحدد اتجاهك والمهارات التي ستوصلك إليه."
          )}
        </p>
      </div>
      <div className="steps">
        {[
          t("Your direction", "اتجاهك"),
          t("Your starting point", "نقطة بدايتك"),
          t("Your pace", "وتيرتك"),
        ].map((s, i) => (
          <button
            key={s}
            className={i === step ? "current" : ""}
            onClick={() => setStep(i)}
          >
            <span>{i + 1}</span>
            {s}
          </button>
        ))}
      </div>
      <form
        className="card onboarding-card"
        onSubmit={e => {
          e.preventDefault();
          if (step < 2) setStep(step + 1);
          else done();
        }}
      >
        {step === 0 && (
          <>
            <div className="section-top">
              <h2>
                {t("Where would you like to go?", "إلى أين تريد الوصول؟")}
              </h2>
              <Compass size={25} />
            </div>
            <p>
              {t(
                "Choose a career or a focused skill path. You can change direction whenever you need.",
                "اختر مساراً مهنياً أو مهارة محددة. يمكنك تغيير اتجاهك متى احتجت."
              )}
            </p>
            <fieldset className="learning-mode-picker">
              <legend>{t("What would you like to learn?", "ماذا تريد أن تتعلم؟")}</legend>
              <div className="button-row">
                {(["career", "skill"] as const).map(mode => <button type="button" key={mode} className={p.learningMode === mode ? "primary" : "secondary"} aria-pressed={p.learningMode === mode} onClick={() => { setBeginnerSetup(false); patch({ learningMode: mode }); }}>
                  {mode === "career" ? t("Full career path", "مسار مهني كامل") : t("One tool, skill or language", "أداة أو مهارة أو لغة")}
                </button>)}
              </div>
            </fieldset>
            {p.learningMode === "skill" ? <div className="focused-path-setup">
              <label>{t("Choose your focus", "اختر مجال التركيز")}
                <select value={p.focusSkill} onChange={e => patch({ focusSkill: e.target.value })}>
                  {skills.map(skill => <option key={skill.id} value={skill.id}>{skill.title[lang]}</option>)}
                </select>
              </label>
              <label>{t("Target depth", "المستوى المستهدف")}
                <select value={p.targetLevel} onChange={e => patch({ targetLevel: Number(e.target.value) })}>
                  <option value={1}>{t("Beginner: foundations", "مبتدئ: الأساسيات")}</option>
                  <option value={2}>{t("Intermediate: practical application", "متوسط: التطبيق العملي")}</option>
                  <option value={3}>{t("Advanced: deeper techniques", "متقدم: تقنيات متعمقة")}</option>
                </select>
              </label>
              <p>{t("Your plan includes the selected depth and required foundation skills. Industry choices still customize your practice context.", "تشمل خطتك المستوى المحدد والمهارات الأساسية اللازمة. يخصص اختيار المجال سياق التدريب.")}</p>
            </div> : <>
            <button
              type="button"
              className={
                unsure ? "discovery-button selected" : "discovery-button"
              }
              onClick={() => setUnsure(!unsure)}
            >
              <MessageSquareText size={19} />
              <span>
                <strong>
                  {t(
                    "Not sure yet? Find my fit.",
                    "لست متأكداً؟ ساعدني في الاختيار."
                  )}
                </strong>
                <small>
                  {t(
                    "Discover roles based on what you enjoy.",
                    "اكتشف أدواراً بناءً على ما تستمتع به."
                  )}
                </small>
              </span>
              <ArrowUpRight size={19} />
            </button>
            {unsure && (
              <div className="discovery-panel">
                <label>{t("What interests you?", "ما الذي يهمك؟")}</label>
                <div className="chips">
                  {[
                    ["analytics", "Finding insights", "اكتشاف الرؤى"],
                    ["engineering", "Building systems", "بناء الأنظمة"],
                    ["ai", "AI and prediction", "الذكاء الاصطناعي والتنبؤ"],
                    ["governance", "Trust and quality", "الثقة والجودة"],
                    ["business", "People and decisions", "الناس والقرارات"],
                  ].map(([id, en, ar]) => (
                    <button
                      type="button"
                      key={id}
                      className={
                        interests.includes(id) ? "chip selected" : "chip"
                      }
                      onClick={() =>
                        setInterests(
                          interests.includes(id)
                            ? interests.filter(x => x !== id)
                            : [...interests, id]
                        )
                      }
                    >
                      {t(en, ar)}
                    </button>
                  ))}
                </div>
                <label>
                  {t(
                    "How much coding appeals to you?",
                    "ما مدى اهتمامك بالبرمجة؟"
                  )}
                  <select
                    value={coding}
                    onChange={e => setCoding(Number(e.target.value))}
                  >
                    <option value={0}>{t("A little", "قليل")}</option>
                    <option value={1}>{t("Some", "متوسط")}</option>
                    <option value={2}>{t("A lot", "كثير")}</option>
                  </select>
                </label>
                <p>
                  {t(
                    "Suggested starting points, not a career verdict:",
                    "نقاط بداية مقترحة وليست حكماً مهنياً:"
                  )}
                </p>
                <div className="chips">
                  {discover(interests, coding).map(({ role }) => (
                    <button
                      type="button"
                      className="chip"
                      key={role.id}
                      onClick={() => patch({ role: role.id, skillTargets: {} })}
                    >
                      {role.title[lang]}
                      <ArrowRight size={13} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              type="button"
              className="primary"
              onClick={() => {
                setBeginnerSetup(true);
                patch({
                  experience: "new",
                  learningMode: "career",
                  skillTargets: {},
                  role: "data-analyst",
                  sector: "general",
                  tools: [],
                  assessment: {},
                  hoursPerWeek: 3,
                  weeks: 24,
                });
                setStep(2);
              }}
            >
              I’m completely new. Start with the basics{" "}
              <ArrowRight size={17} />
            </button>
            <p>
              No coding experience needed. Start with a small table and a real
              question. Data Analyst is a starting suggestion; you can explore
              careers and industries later.
            </p>
            <PathExplorer state={state} lang={lang} onChoose={role => patch({ role, skillTargets: {} })} />
            </>}
            <label>
              Target business sector
              <select
                value={p.sector}
                onChange={e =>
                  patch({ sector: e.target.value as Profile["sector"] })
                }
              >
                {businessSectors.map(sector => (
                  <option key={sector.id} value={sector.id}>
                    {sector.id === "general"
                      ? "Explore before choosing an industry"
                      : sector.title}
                  </option>
                ))}
              </select>
              <small className="field-help">
                This adds the industry language, metrics, risks and a relevant
                portfolio direction to your roadmap.
              </small>
            </label>
            <label>
              {t(
                "Anything else about your target role? (optional)",
                "أي تفاصيل أخرى عن دورك المستهدف؟ (اختياري)"
              )}
              <textarea
                maxLength={1500}
                value={p.description}
                onChange={e => patch({ description: e.target.value })}
              />
            </label>
          </>
        )}
        {step === 1 && (
          <>
            <h2>
              {t(
                "Build on what you already know.",
                "ابنِ على ما تعرفه بالفعل."
              )}
            </h2>
            <label>
              {t("Experience level", "مستوى الخبرة")}
              <select
                value={p.experience}
                onChange={e =>
                  patch({ experience: e.target.value as Profile["experience"] })
                }
              >
                {[
                  ["new", "Just starting", "أبدأ الآن"],
                  ["junior", "Junior", "مبتدئ مهنياً"],
                  ["mid", "Intermediate professional", "متوسط الخبرة"],
                  ["expert", "Advanced / expert", "متقدم / خبير"],
                ].map(([id, en, ar]) => (
                  <option key={id} value={id}>
                    {t(en, ar)}
                  </option>
                ))}
              </select>
            </label>
            {["mid", "expert"].includes(p.experience) && (
              <label>
                {t(
                  "Tell us about your expertise, tools and recent work",
                  "أخبرنا عن خبرتك وأدواتك وعملك الأخير"
                )}
                <textarea
                  maxLength={1500}
                  value={p.expertise}
                  onChange={e => patch({ expertise: e.target.value })}
                  placeholder={t(
                    "Years of practice, tools used, scope of responsibility…",
                    "سنوات الممارسة والأدوات المستخدمة ونطاق المسؤولية…"
                  )}
                />
              </label>
            )}
            <div className="form-grid">
              <label>
                {t("What brings you here?", "ما الذي جاء بك هنا؟")}
                <select
                  value={p.motivation}
                  onChange={e =>
                    patch({
                      motivation: e.target.value as Profile["motivation"],
                    })
                  }
                >
                  <option value="start">
                    {t("Start a career", "بدء مسار مهني")}
                  </option>
                  <option value="switch">
                    {t("Switch roles", "تغيير الدور")}
                  </option>
                  <option value="grow">
                    {t("Grow in my role", "التطور في دوري")}
                  </option>
                </select>
              </label>
              <label>
                {t(
                  "What do you want to improve? (optional)",
                  "ماذا تريد تحسينه؟ (اختياري)"
                )}
                <textarea
                  maxLength={1500}
                  value={p.goals}
                  onChange={e => patch({ goals: e.target.value })}
                />
              </label>
            </div>
            <details className="placement-disclosure">
              <summary>{t("Not sure of your level? Try an optional placement check", "غير متأكد من مستواك؟ جرّب فحصًا اختياريًا")}</summary>
              <PlacementCheck key={Object.keys(req).join(":")} state={state} lang={lang} skillIds={Object.keys(req)} onApply={(id, level) => patch({ assessment: { ...p.assessment, [id]: level } })} />
            </details>
            <details>
              <summary>
                {t("Customize tools, target levels and your starting point", "خصص الأدوات والمستويات ونقطة البداية")}
              </summary>
              {p.learningMode === "career" && <>
              <h3>
                {t(
                  "Tools and skills you are interested in (optional)",
                  "الأدوات والمهارات التي تهمك (اختياري)"
                )}
              </h3>
              <div className="chips">
                {skills.map(s => (
                  <button
                    type="button"
                    key={s.id}
                    className={
                      p.tools.includes(s.id) ? "chip selected" : "chip"
                    }
                    onClick={() =>
                      patch({
                        tools: p.tools.includes(s.id)
                          ? p.tools.filter(id => id !== s.id)
                          : [...p.tools, s.id],
                      })
                    }
                  >
                    {s.title[lang]}
                  </button>
                ))}
              </div>
              </>}
              {p.learningMode === "career" && <section className="skill-targets">
                <h3>{t("Customize target levels", "تخصيص المستويات المستهدفة")}</h3>
                <p>{t("These are learning goals, not your current ability. Required foundations can raise a lower target.", "هذه أهداف تعلم وليست تقييمًا لقدراتك الحالية. قد ترفع المتطلبات الأساسية المستوى الأدنى.")}</p>
                <div className="assessment-grid">{Object.keys(req).map(id => <label key={id}>{skillById[id].title[lang]}
                  <select value={p.skillTargets[id] || req[id]} onChange={e => patch({ skillTargets: { ...p.skillTargets, [id]: Number(e.target.value) } })}>
                    {[1, 2, 3].map(level => <option key={level} value={level}>{level === 1 ? t("Beginner", "مبتدئ") : level === 2 ? t("Intermediate", "متوسط") : t("Advanced", "متقدم")}</option>)}
                  </select>
                </label>)}</div>
                <button type="button" className="secondary" onClick={() => patch({ skillTargets: {} })}>{t("Restore role recommendations", "استعادة توصيات الدور")}</button>
              </section>}
              <h3>{t("Self-assessment", "التقييم الذاتي")}</h3>
              <p>
                {t(
                  "Choose the highest level you can apply independently. Leave “New” if unsure. Optional checks are available inside each skill roadmap.",
                  "اختر أعلى مستوى يمكنك تطبيقه باستقلالية. اترك «جديد» إن لم تكن متأكداً. تتوفر فحوص اختيارية داخل كل مسار مهارة."
                )}
              </p>
              <div className="assessment-grid">
                {Object.keys(req).map(id => (
                  <label key={id}>
                    {skillById[id].title[lang]}
                    <select
                      value={p.assessment[id] || 0}
                      onChange={e =>
                        patch({
                          assessment: {
                            ...p.assessment,
                            [id]: Number(e.target.value),
                          },
                        })
                      }
                    >
                      {[
                        t("New", "جديد"),
                        t("Beginner", "مبتدئ"),
                        t("Intermediate", "متوسط"),
                        t("Advanced", "متقدم"),
                      ].map((label, i) => (
                        <option key={i} value={i}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </details>
          </>
        )}
        {step === 2 && (
          <>
            <h2>
              {t(
                "Make room for steady progress.",
                "امنح التقدم المستمر مساحة."
              )}
            </h2>
            <p>
              {t(
                "Choose your target period. We’ll show you whether your available time matches the learning effort.",
                "اختر المدة المستهدفة. سنوضح لك إن كان وقتك المتاح يتناسب مع جهد التعلم."
              )}
            </p>
            {beginnerSetup && (
              <div className="notice">
                Your first goal: complete a guided shop-orders exercise. Choose
                the time you can spare each week. The longer plan is only an
                estimate, not a job-readiness deadline.
              </div>
            )}
            <section className="pace-suggestion" aria-label={t("Suggested learning pace", "الوتيرة المقترحة")}>
              <span className="eyebrow">{autoPace ? t("SUGGESTED PACE APPLIED", "تم تطبيق الوتيرة المقترحة") : t("YOUR CUSTOM PACE", "وتيرتك المخصصة")}</span>
              <h3>{t(`${suggestedPace.hoursPerWeek} hours a week · ${suggestedPace.weeks} weeks`, `${suggestedPace.hoursPerWeek} ساعات أسبوعياً · ${suggestedPace.weeks} أسبوعاً`)}</h3>
              <p>{t(`Based on ${suggestedPace.remainingHours} remaining learning hours, including your project, with approximately 15% extra time for review and interruptions. Your selected skills, target levels, starting point and saved progress shape the estimate.`, `بناءً على ${suggestedPace.remainingHours} ساعة تعلم متبقية تشمل المشروع، مع نحو 15٪ وقت إضافي للمراجعة والانقطاعات. تعتمد المدة على المهارات والمستويات ونقطة البداية والتقدم المحفوظ.`)}</p>
              <p>{t("This is a suggested schedule, not a deadline. Change either field below to use your own pace.", "هذا جدول مقترح وليس موعداً إلزامياً. غيّر أي حقل أدناه لاستخدام وتيرتك الخاصة.")}</p>
              <div className="button-row">
                <button type="button" className={autoPace ? "primary" : "secondary"} aria-pressed={autoPace} onClick={() => { setAutoPace(true); patch({ hoursPerWeek: suggestedPace.hoursPerWeek, weeks: suggestedPace.weeks }); }}>{t("Use suggested pace", "استخدام الوتيرة المقترحة")}</button>
                <button type="button" className={!autoPace ? "primary" : "secondary"} aria-pressed={!autoPace} onClick={() => setAutoPace(false)}>{t("Set my own pace", "تحديد وتيرتي")}</button>
              </div>
            </section>
            <div className="form-grid">
              <label>
                {t(
                  "Desired completion period (weeks)",
                  "مدة الإكمال المرغوبة (أسابيع)"
                )}
                <input
                  type="number"
                  min={1}
                  max={104}
                  required
                  value={p.weeks}
                  onChange={e => {
                    setAutoPace(false);
                    patch({ weeks: Math.max(1, Math.min(104, Math.round(Number(e.target.value)))) });
                  }}
                />
              </label>
              <label>
                {t("Hours available each week", "الساعات المتاحة أسبوعياً")}
                <input
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={p.hoursPerWeek}
                  onChange={e => {
                    setAutoPace(false);
                    patch({ hoursPerWeek: Math.max(1, Math.min(60, Math.round(Number(e.target.value)))) });
                  }}
                />
              </label>
              <label>
                {t("Learning resources", "مصادر التعلم")}
                <select
                  value={p.resources}
                  onChange={e =>
                    patch({ resources: e.target.value as Profile["resources"] })
                  }
                >
                  <option value="free">{t("Free only", "مجاني فقط")}</option>
                  <option value="mixed">
                    {t("Free and paid options", "خيارات مجانية ومدفوعة")}
                  </option>
                </select>
              </label>
            </div>
            <div className="plan-preview">
              <Target size={26} />
              <div>
                <h3>{learningPathTitle(p)[lang]}</h3>
                <p>
                  {Object.keys(req).length} {t("skill areas", "مجالات مهارية")}{" "}
                  · {makePlan(state).remainingHours}{" "}
                  {t(
                    "estimated hours including a portfolio project",
                    "ساعات تقديرية تشمل مشروعاً"
                  )}
                </p>
                <p>
                  {makePlan(state).feasible
                    ? t(
                        "Your target fits the estimated workload.",
                        "هدفك يتناسب مع الجهد التقديري."
                      )
                    : t(
                        `At your pace, allow approximately ${makePlan(state).recommendedWeeks} weeks. You can keep your goal and adjust later.`,
                        `بوتيرتك، خصص نحو ${makePlan(state).recommendedWeeks} أسبوعاً. يمكنك الاحتفاظ بهدفك وتعديله لاحقاً.`
                      )}
                </p>
              </div>
            </div>
          </>
        )}
        <div className="onboarding-actions">
          <button
            type="button"
            className="text-button"
            onClick={() => (step ? setStep(step - 1) : cancel?.())}
            disabled={step === 0 && !cancel}
          >
            {step ? t("Back", "رجوع") : t("Close", "إغلاق")}
          </button>
          <button className="primary" type="submit">
            {step === 2
              ? t("Build my learning path", "ابنِ مسار تعلمي")
              : t("Continue", "متابعة")}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
