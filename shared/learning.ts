import { engineeringLessons } from "./engineering-lessons";
import { authoredLessons } from "./authored-lessons";
import { z } from "zod";
import { interviewCases } from "./interview-cases";
import {
  businessSectors,
  careers,
  careerById,
  skills,
  skillById,
  dependencies,
  copy,
  type Lang,
} from "./catalog";
import { sqlLabChallenges } from "./sql-lab";
import { technicalQuizBank } from "./quiz-bank";
const skillId = z
  .string()
  .refine(id => Boolean(skillById[id]), "Unknown skill");
const topicId = z
  .string()
  .refine(
    id => skills.some(s => s.topics.some(t => t.id === id)),
    "Unknown topic"
  );
export const profileSchema = z.object({
  displayName: z.string().max(100).default(""),
  avatarData: z
    .string()
    .max(35000)
    .refine(
      value => !value || /^data:image\/(png|jpeg|webp);base64,/.test(value),
      "Invalid avatar"
    )
    .default(""),
  learningMode: z.enum(["career", "skill"]).default("career"),
  focusSkill: skillId.default("sql"),
  targetLevel: z.number().int().min(1).max(3).default(2),
  skillTargets: z.record(skillId, z.number().int().min(1).max(3)).default({}),
  role: z.string().refine(id => Boolean(careerById[id]), "Choose a career"),
  experience: z.enum(["new", "junior", "mid", "expert"]),
  tools: z.array(skillId).max(28),
  description: z.string().max(1500),
  expertise: z.string().max(1500),
  goals: z.string().max(1500),
  motivation: z.enum(["start", "switch", "grow"]),
  sector: z
    .enum([
      "banking",
      "finance",
      "marketing",
      "healthcare",
      "retail",
      "technology",
      "telecom",
      "government",
      "general",
    ])
    .default("general"),
  weeks: z.number().int().min(1).max(104),
  hoursPerWeek: z.number().int().min(1).max(60),
  resources: z.enum(["free", "mixed"]),
  language: z.enum(["en", "ar"]),
  assessment: z.record(skillId, z.number().int().min(0).max(3)),
});
export type Profile = z.infer<typeof profileSchema>;
export const defaultProfile: Profile = {
  learningMode: "career",
  focusSkill: "sql",
  targetLevel: 2,
  skillTargets: {},
  displayName: "",
  avatarData: "",
  role: "data-analyst",
  experience: "new",
  tools: [],
  description: "",
  expertise: "",
  goals: "",
  motivation: "start",
  sector: "general",
  weeks: 24,
  hoursPerWeek: 8,
  resources: "free",
  language: "en",
  assessment: {},
};
export const learningStateSchema = z.object({
  version: z.literal(1),
  firstLesson: z
    .object({ step: z.number().int().min(0).max(4), completed: z.boolean() })
    .refine(
      value => value.completed === (value.step === 4),
      "Invalid first lesson progress"
    )
    .optional(),
  foundationUnits: z
    .partialRecord(
      profileSchema.shape.sector.unwrap(),
      z.object({
        stage: z.number().int().min(0).max(3),
        answers: z.object({
          count: z.string().max(30),
          total: z.string().max(30),
          average: z.string().max(30),
          explanation: z.string().max(40),
        }),
      })
    )
    .optional(),
  profile: profileSchema,
  completed: z.array(topicId).max(skills.reduce((count, skill) => count + skill.topics.length, 0)),
  evidence: z.record(topicId, z.string().max(1000)),
  diagnostics: z.record(
    skillId,
    z.array(z.number().int().min(0).max(3)).max(3)
  ),
  quizAttempts: z
    .array(
      z.object({
        id: z.string().max(120),
        kind: z.enum(["topic", "level", "skill", "cumulative"]),
        targetId: z.string().max(120),
        score: z.number().int().min(0).max(100),
        passed: z.boolean(),
        weakTopics: z.array(topicId).max(30),
        at: z.string().datetime(),
      })
    )
    .max(500)
    .default([]),
  certifiedSkills: z.array(skillId).max(28).default([]),
  reviewTopics: z.array(topicId).max(skills.reduce((count, skill) => count + skill.topics.length, 0)).default([]),
  practiceAttempts: z
    .array(
      z.object({
        key: z.string().max(160),
        challengeId: z.string().max(80),
        topicId,
        kind: z.enum(["python", "excel", "dax", "metric", "case"]),
        answer: z.string().max(4000),
        passed: z.boolean(),
        reviewOnly: z.boolean(),
        feedback: z.string().max(500),
        rubric: z.array(z.string().max(150)).max(10),
        checkpoints: z
          .partialRecord(
            z.enum(["unique", "eligible", "total"]),
            z.string().max(30)
          )
          .optional(),
        at: z.string().datetime(),
      })
    )
    .max(30)
    .default([]),
  completedPracticeIds: z.array(z.string().max(160)).max(300).default([]),
  passedLabIds: z.array(z.string().max(100)).max(sqlLabChallenges.length * businessSectors.length).default([]),
  labAttempts: z
    .array(
      z.object({
        challengeId: z.string().max(80),
        sector: profileSchema.shape.sector.optional(),
        topicId,
        query: z.string().max(4000),
        passed: z.boolean(),
        checksPassed: z.number().int().min(0).max(20).optional(),
        checksTotal: z.number().int().min(0).max(20).optional(),
        feedback: z.string().max(500).optional(),
        at: z.string().datetime(),
      })
    )
    .max(50)
    .default([]),
  interviewAnswers: z
    .record(z.string().max(100), z.string().max(5000))
    .refine(v => Object.keys(v).length <= 100),
  completedProjects: z
    .array(z.string().refine(id => careers.some(r => `project-${r.id}` === id) || skills.some(skill => `project-skill-${skill.id}` === id)))
    .max(careers.length + skills.length)
    .default([]),
  applications: z
    .array(
      z.object({
        id: z.string().max(80),
        company: z.string().min(1).max(120),
        role: z.string().max(120),
        status: z.enum(["saved", "applied", "interview", "offer", "closed"]),
        followUp: z.string().max(10),
      })
    )
    .max(100)
    .default([]),
  projectNotes: z
    .record(z.string().max(100), z.string().max(5000))
    .refine(v => Object.keys(v).length <= 30),
  cv: z.object({
    name: z.string().max(100),
    summary: z.string().max(2000),
    achievements: z.string().max(4000),
    links: z.string().max(2000),
  }),
  jobChecklist: z.array(z.string().max(100)).max(20),
  sessions: z
    .array(
      z.object({
        date: z.string().datetime(),
        minutes: z.number().int().min(1).max(480),
      })
    )
    .max(365),
  onboarded: z.boolean(),
});
export type LearningState = z.infer<typeof learningStateSchema>;
export const newState = (): LearningState => ({
  version: 1,
  profile: { ...defaultProfile, assessment: {}, tools: [] },
  completed: [],
  evidence: {},
  diagnostics: {},
  quizAttempts: [],
  certifiedSkills: [],
  reviewTopics: [],
  labAttempts: [],
  passedLabIds: [],
  practiceAttempts: [],
  completedPracticeIds: [],
  interviewAnswers: {},
  projectNotes: {},
  completedProjects: [],
  applications: [],
  cv: { name: "", summary: "", achievements: "", links: "" },
  jobChecklist: [],
  sessions: [],
  onboarded: false,
});

export type QuizQuestion = {
  id: string;
  topicId: string;
  prompt: ReturnType<typeof copy>;
  options: ReturnType<typeof copy>[];
  answer: number;
  explanation: ReturnType<typeof copy>;
};

function topicQuestion(topicIdValue: string, variant = 0): QuizQuestion {
  const skill = skills.find(item =>
    item.topics.some(topic => topic.id === topicIdValue)
  )!;
  const topic = skill.topics.find(item => item.id === topicIdValue)!;
  const authored = technicalQuizBank[topic.id];
  if (authored && variant < authored.length) {
    const question = authored[variant];
    return {
      id: `${topic.id}-technical-${variant}`,
      topicId: topic.id,
      ...question,
    };
  }
  if (variant % 3 === 0) {
    return {
      id: `${topic.id}-scenario-${variant}`,
      topicId: topic.id,
      prompt: copy(
        `You are implementing ${topic.title.en} in production. Which approach gives the strongest technical validation?`,
        `إنت بتطبق ${topic.title.en} في production. أنهي approach بتدي أقوى technical validation؟`
      ),
      options: [
        copy(
          "Define the expected behavior, run a representative case and an edge case, then compare actual results",
          "حدد الـexpected behavior، وشغّل representative case وedge case، وبعدها قارن الـactual results"
        ),
        copy(
          "Deploy the first attempt without measuring it",
          "انشر أول محاولة من غير قياس"
        ),
        copy(
          "Judge it only by whether the tool shows an error",
          "احكم عليها بس من وجود error أو عدمه"
        ),
      ],
      answer: 0,
      explanation: copy(
        "Technical validation needs an expected result, realistic input and explicit checks for failure modes.",
        "Technical validation محتاجة expected result وinput واقعي وchecks واضحة للـfailure modes."
      ),
    };
  }
  const alternatives = skill.topics.filter(item => item.id !== topic.id);
  const wrongA = alternatives[(variant + 1) % alternatives.length];
  const wrongB = alternatives[(variant + 4) % alternatives.length];
  return variant % 3 === 1
    ? {
        id: `${topic.id}-debug-${variant}`,
        topicId: topic.id,
        prompt: copy(
          `A result built with ${topic.title.en} is wrong only for boundary inputs. What should you do first?`,
          `Result معمول بـ${topic.title.en} بيطلع غلط بس مع boundary inputs. تعمل إيه الأول؟`
        ),
        options: [
          copy(
            "Reproduce the smallest failing case and inspect assumptions at that boundary",
            "كرر أصغر failing case وراجع الـassumptions عند الـboundary دي"
          ),
          copy(
            `Replace it immediately with ${wrongA.title.en}`,
            `استبدله فوراً بـ${wrongA.title.en}`
          ),
          copy(
            "Ignore the case because the main example passed",
            "تتجاهل الحالة عشان المثال الأساسي نجح"
          ),
        ],
        answer: 0,
        explanation: copy(
          "A minimal reproducible case isolates the failed assumption before you change the implementation.",
          "Minimal reproducible case بتعزل الـassumption اللي فشلت قبل ما تغير الـimplementation."
        ),
      }
    : {
        id: `${topic.id}-tradeoff-${variant}`,
        topicId: topic.id,
        prompt: copy(
          `Before choosing ${topic.title.en} over ${wrongB.title.en}, what is the best technical decision?`,
          `قبل ما تختار ${topic.title.en} بدل ${wrongB.title.en}، إيه أفضل technical decision؟`
        ),
        options: [
          copy(
            "Compare both against the workload, correctness constraints and measurable acceptance criteria",
            "قارن الاتنين حسب الـworkload وcorrectness constraints وacceptance criteria قابلة للقياس"
          ),
          copy(
            "Always choose the more advanced-sounding option",
            "اختار دايماً الاختيار اللي اسمه advanced أكتر"
          ),
          copy(
            "Use whichever appeared first in a video",
            "استخدم أول اختيار ظهر في فيديو"
          ),
        ],
        answer: 0,
        explanation: copy(
          "A technical choice should be justified by constraints and measured behavior, not labels.",
          "الـtechnical choice لازم يتبرر بالـconstraints والـmeasured behavior، مش بالاسم."
        ),
      };
}

export function topicQuiz(topicIdValue: string) {
  return [0, 1, 2, 3, 4].map(variant => topicQuestion(topicIdValue, variant));
}

export function levelQuiz(skillIdValue: string, level: number) {
  const topics = skillById[skillIdValue].topics.filter(
    topic => topic.level === level
  );
  return Array.from({ length: 10 }, (_, index) => {
    const topic = topics[index % topics.length];
    return topicQuestion(topic.id, Math.floor(index / topics.length));
  });
}

export function skillQuiz(skillIdValue: string, targetLevel = 3) {
  const skill = skillById[skillIdValue];
  const topics = skill.topics.filter(topic => topic.level <= targetLevel);
  return Array.from({ length: 20 }, (_, index) => {
    const topic = topics[index % topics.length];
    return topicQuestion(topic.id, Math.floor(index / topics.length));
  });
}

export function cumulativeQuiz(
  skillIds: string[],
  requiredLevels: Record<string, number>
) {
  return skillIds.flatMap((skillIdValue, skillIndex) => {
    const eligible = skillById[skillIdValue].topics.filter(
      topic => topic.level <= (requiredLevels[skillIdValue] || 1)
    );
    return eligible
      .slice(-2)
      .map((topic, index) => topicQuestion(topic.id, skillIndex + index + 1));
  });
}

export function latestPassed(
  state: LearningState,
  kind: "topic" | "level" | "skill" | "cumulative",
  targetId: string
) {
  return (
    [...state.quizAttempts]
      .reverse()
      .find(attempt => attempt.kind === kind && attempt.targetId === targetId)
      ?.passed || false
  );
}

export type SkillEvidenceStatus = "gap" | "building" | "assessment" | "proven";

/** A transparent readiness view: every result is derived from saved work. */
export function skillEvidenceMatrix(state: LearningState) {
  const required = requirements(state.profile);
  return Object.entries(required).map(([skillIdValue, target]) => {
    const declared = state.profile.assessment[skillIdValue] || 0;
    const answers = state.diagnostics[skillIdValue];
    const diagnostic = answers ? diagnosticScore(skillIdValue, answers) : null;
    const startingLevel = diagnostic !== null && diagnostic < 1 ? 0 : declared;
    const relevant = skillById[skillIdValue].topics.filter(
      topic => topic.level <= target && topic.level > startingLevel
    );
    const completed = relevant.filter(topic =>
      state.completed.includes(topic.id)
    ).length;
    const evidenced = relevant.filter(topic =>
      Boolean(state.evidence[topic.id]?.trim())
    ).length;
    const levelChecks = Array.from(
      { length: target },
      (_, index) => index + 1
    ).filter(level =>
      latestPassed(state, "level", `${skillIdValue}-level-${level}`)
    ).length;
    const latestSkillAttempt = [...state.quizAttempts]
      .reverse()
      .find(
        attempt => attempt.kind === "skill" && attempt.targetId === skillIdValue
      );
    const certified = state.certifiedSkills.includes(skillIdValue);
    let status: SkillEvidenceStatus = "gap";
    if (certified && evidenced === relevant.length) status = "proven";
    else if (completed === relevant.length) status = "assessment";
    else if (completed || evidenced || levelChecks || latestSkillAttempt)
      status = "building";
    return {
      skillId: skillIdValue,
      target,
      topics: relevant.length,
      completed,
      evidenced,
      levelChecks,
      latestScore: latestSkillAttempt?.score ?? null,
      certified,
      status,
    };
  });
}

const sqlLessonBriefs: Record<string, ReturnType<typeof copy>> = {
  "sql-1": copy(
    "SELECT chooses the columns you return; WHERE limits rows before later query stages run. The goal is to retrieve only the data the task needs and make date, Boolean and NULL conditions explicit.",
    "SELECT بتحدد الـcolumns اللي هترجع، وWHERE بتفلتر الـrows قبل باقي مراحل الـQuery. الهدف إنك ترجع الـdata المطلوبة بس وتكتب شروط التاريخ وBoolean وNULL بشكل واضح."
  ),
  "sql-2": copy(
    "GROUP BY changes row-level data into groups. Aggregate functions calculate one result per group, while HAVING filters those calculated groups after aggregation.",
    "GROUP BY بتحول row-level data لمجموعات. Aggregate functions بتحسب نتيجة لكل group، وHAVING بتفلتر المجموعات بعد الـaggregation."
  ),
  "sql-3": copy(
    "JOIN combines related tables using a key. INNER JOIN keeps matches; LEFT JOIN also keeps unmatched left rows. Always check relationship cardinality so a join does not multiply rows unexpectedly.",
    "JOIN بتجمع Tables مرتبطة باستخدام key. INNER JOIN بتحافظ على المطابق، وLEFT JOIN بتحافظ كمان على rows الجدول الشمال غير المطابقة. لازم تراجع cardinality عشان الـJOIN ما تضاعفش الـrows من غير قصد."
  ),
  "sql-4": copy(
    "A subquery supplies a result to another query. A CTE gives a complex transformation named stages, making intermediate logic easier to inspect, test and reuse in the statement.",
    "Subquery بتدي نتيجة لـQuery تانية. CTE بتقسم transformation معقدة لمراحل بأسماء، فتبقى أسهل في الفهم والاختبار داخل الـstatement."
  ),
  "sql-5": copy(
    "Window Functions calculate across related rows without collapsing them. PARTITION BY defines groups and ORDER BY defines sequence, enabling ranking, running totals and comparisons.",
    "Window Functions بتحسب على مجموعة rows مرتبطة من غير ما تدمجهم. PARTITION BY بتحدد المجموعات وORDER BY بتحدد الترتيب، فتقدر تعمل ranking وrunning totals ومقارنات."
  ),
  "sql-6": copy(
    "NULL means unknown, so normal equality does not work. Deduplication also needs an explicit business key and deterministic rule for which row survives.",
    "NULL معناها unknown، لذلك equality العادية مش هتشتغل. وإزالة التكرار محتاجة business key واضحة وقاعدة deterministic تحدد أنهي row تفضل."
  ),
  "sql-7": copy(
    "An execution plan shows how the database intends to read, join, sort and aggregate data. Compare estimated and actual rows before changing a query or adding an index.",
    "Execution Plan بتوضح إزاي الـdatabase هتقرأ وتعمل JOIN وsort وaggregate للـdata. قارن estimated وactual rows قبل ما تغير Query أو تضيف Index."
  ),
  "sql-8": copy(
    "An index can reduce the rows scanned, but it costs storage and write work. Column order should match real filters, joins and ordering rather than guesswork.",
    "Index ممكن تقلل عدد الـrows المقروءة، لكن ليها تكلفة storage وكتابة. ترتيب الـcolumns لازم يناسب filters وJOINs وsorting الحقيقيين، مش التخمين."
  ),
  "sql-9": copy(
    "A transaction groups changes into one unit. Atomicity protects all-or-nothing behavior, while isolation controls what concurrent transactions can observe.",
    "Transaction بتجمع تغييرات في وحدة واحدة. Atomicity بتحمي all-or-nothing behavior، وIsolation بتتحكم في اللي concurrent Transactions تقدر تشوفه."
  ),
};

export function lessonGuide(topicIdValue: string, language: Lang) {
  const skill = skills.find(item =>
    item.topics.some(topic => topic.id === topicIdValue)
  )!;
  const topic = skill.topics.find(item => item.id === topicIdValue)!;
  const brief =
    sqlLessonBriefs[topic.id] ||
    copy(
      `${topic.title.en} is part of ${skill.title.en}. Learn what problem it solves, the inputs and outputs it expects, its main failure modes and how to validate the result in a realistic workflow.`,
      `${topic.title.en} جزء من ${skill.title.en}. افهم بيحل أنهي problem، والـinputs والـoutputs المتوقعة، وأهم failure modes، وإزاي تعمل validation للنتيجة في workflow واقعي.`
    );
  const objective =
    language === "ar"
      ? [
          `اشرح ${topic.title.en} بكلامك وحدد إمتى تستخدمها وإمتى لأ.`,
          `اعمل مثال صغير بـpublic أو synthetic data واحتفظ بالـinput والـoutput.`,
          `اختبر edge case واحدة على الأقل، وسجّل سبب النتيجة وأي trade-off.`,
        ]
      : [
          `Explain ${topic.title.en} in your own words and when you would or would not use it.`,
          "Build a small example with public or synthetic data and keep its input and output.",
          "Test at least one edge case and record the reason for the result and any trade-off.",
        ];
  const query = encodeURIComponent(
    `${skill.title.en} ${topic.title.en} tutorial practical example`
  );
  return {
    brief:
      language === "en"
        ? authoredLessons[topic.id]?.brief || brief[language]
        : brief[language],
    workedExample: authoredLessons[topic.id]?.example,
    commonMistake: authoredLessons[topic.id]?.mistake,
    objectives: objective,
    youtubeUrl: `https://www.youtube.com/results?search_query=${query}`,
    practice:
      language === "ar"
        ? `Practice: طبّق ${topic.title.en} على dataset صغيرة، اكسر الـsolution بحالة غير متوقعة، وبعدها عدّلها واكتب إيه اللي اتغير.`
        : engineeringLessons[topic.id]?.task || `Practice: apply ${topic.title.en} to a small dataset, break the solution with an unexpected case, then fix it and record what changed.`,
  };
}
export function learningPathTitle(profile: Profile) {
  return profile.learningMode === "skill"
    ? copy(`${skillById[profile.focusSkill].title.en} learning path`, `مسار ${skillById[profile.focusSkill].title.ar}`)
    : careerById[profile.role].title;
}
export function requirements(profile: Profile) {
  const required: Record<string, number> = profile.learningMode === "skill"
    ? { [profile.focusSkill]: profile.targetLevel }
    : { ...careerById[profile.role].requirements };
  if (profile.learningMode !== "skill") {
    profile.tools.forEach(id => { required[id] = Math.max(required[id] || 0, 2); });
    Object.keys(required).forEach(id => {
      if (profile.skillTargets[id]) required[id] = profile.skillTargets[id];
    });
  }
  function expand(id: string) {
    Object.entries(dependencies[id] || {}).forEach(([dep, level]) => {
      if ((required[dep] || 0) < level) {
        required[dep] = level;
        expand(dep);
      }
    });
  }
  Object.keys(required).forEach(expand);
  if (profile.learningMode === "career") {
    // A learner may deepen a prerequisite too; never lower its required minimum.
    Object.keys(required).forEach(id => {
      required[id] = Math.max(required[id], profile.skillTargets[id] || 0);
    });
    Object.keys(required).forEach(expand);
  }
  return required;
}
export function makePlan(state: LearningState) {
  const required = requirements(state.profile),
    ordered: string[] = [];
  const visit = (id: string) => {
    if (ordered.includes(id)) return;
    Object.keys(dependencies[id] || {})
      .filter(d => required[d])
      .forEach(visit);
    ordered.push(id);
  };
  Object.keys(required).forEach(visit);
  let elapsed = 0;
  const topics = ordered.flatMap(id => {
    const declared = state.profile.assessment[id] || 0;
    // A short diagnostic is a signal, never proof of advanced proficiency.
    const answers = state.diagnostics[id];
    const diagnostic = answers ? diagnosticScore(id, answers) : null;
    const level = diagnostic !== null && diagnostic < 1 ? 0 : declared;
    return skillById[id].topics
      .filter(t => t.level <= required[id] && t.level > level)
      .map(t => ({ ...t, skillId: id }));
  });
  const ids = new Set(topics.map(t => t.id));
  const scheduled = topics.map(t => {
    const prerequisites = [...t.prerequisites];
    if (topics.find(x => x.skillId === t.skillId)?.id === t.id)
      Object.entries(dependencies[t.skillId] || {}).forEach(([id, level]) =>
        prerequisites.push(`${id}-${level * 3}`)
      );
    const remaining =
      !state.completed.includes(t.id) || state.reviewTopics.includes(t.id);
    if (remaining) elapsed += t.hours;
    return {
      ...t,
      prerequisites: prerequisites.filter(id => ids.has(id)),
      week: remaining
        ? Math.max(1, Math.ceil(elapsed / state.profile.hoursPerWeek))
        : 0,
      done: !remaining,
    };
  });
  const project = projectFor(state.profile);
  const projectHours = state.completedProjects.includes(project.id) ? 0 : project.hours;
  const totalHours = elapsed + projectHours;
  return {
    required,
    topics: scheduled,
    remainingHours: totalHours,
    recommendedWeeks: Math.ceil(totalHours / state.profile.hoursPerWeek),
    hoursNeeded: Math.ceil(totalHours / state.profile.weeks),
    feasible: totalHours <= state.profile.weeks * state.profile.hoursPerWeek,
  };
}
export function discover(interests: string[], coding: number) {
  return careers
    .map(role => ({
      role,
      score:
        (interests.includes(role.family) ? 4 : 0) +
        (coding === 2 && ["engineering", "ai"].includes(role.family) ? 2 : 0) +
        (coding === 0 && ["business", "governance"].includes(role.family)
          ? 2
          : 0) +
        (coding === 1 && role.family === "analytics" ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
export type Diagnostic = {
  question: ReturnType<typeof copy>;
  options: ReturnType<typeof copy>[];
  answer: number;
  explanation: ReturnType<typeof copy>;
};
const checks: Record<
  string,
  [string, string, string, string, string, string, string, string]
> = {
  sql: [
    "Which JOIN keeps every left-side row?",
    "أي ربط يحتفظ بكل صفوف الجدول الأيسر؟",
    "LEFT JOIN",
    "LEFT JOIN",
    "INNER JOIN",
    "INNER JOIN",
    "CROSS JOIN",
    "CROSS JOIN",
  ],
  python: [
    "Which structure maps keys to values?",
    "أي بنية تربط المفاتيح بالقيم؟",
    "Dictionary",
    "قاموس",
    "List",
    "قائمة",
    "Set",
    "مجموعة",
  ],
  excel: [
    "What summarizes sales by region without rewriting the source?",
    "ما الذي يلخص المبيعات حسب المنطقة دون إعادة كتابة المصدر؟",
    "Pivot table",
    "جدول محوري",
    "Merged cells",
    "خلايا مدمجة",
    "Font color",
    "لون الخط",
  ],
  statistics: [
    "Which approach reduces selection bias?",
    "أي أسلوب يقلل تحيز الاختيار؟",
    "Random sampling",
    "أخذ عينات عشوائية",
    "Only available customers",
    "العملاء المتاحون فقط",
    "Only the largest values",
    "أكبر القيم فقط",
  ],
  cleaning: [
    "What should you do before filling missing values?",
    "ماذا تفعل قبل ملء القيم المفقودة؟",
    "Investigate why they are missing",
    "التحقق من سبب فقدانها",
    "Replace all with zero",
    "استبدالها جميعاً بصفر",
    "Drop every row",
    "حذف كل الصفوف",
  ],
  powerbi: [
    "What describes a fact table row?",
    "ما الذي يصف صف جدول الحقائق؟",
    "Its grain",
    "مستوى تفاصيله",
    "Its color",
    "لونه",
    "Its page size",
    "حجم الصفحة",
  ],
  tableau: [
    "What is a dimension usually used for?",
    "فيمَ يُستخدم البعد عادةً؟",
    "Grouping observations",
    "تجميع المشاهدات",
    "Summing every text field",
    "جمع كل حقل نصي",
    "Encrypting extracts",
    "تشفير المستخرجات",
  ],
  storytelling: [
    "What should determine the chart and narrative?",
    "ما الذي ينبغي أن يحدد الرسم والسرد؟",
    "Audience and decision",
    "الجمهور والقرار",
    "Number of colors",
    "عدد الألوان",
    "Available animations",
    "الرسوم المتحركة المتاحة",
  ],
  business: [
    "What makes a requirement testable?",
    "ما الذي يجعل المتطلب قابلاً للاختبار؟",
    "Clear acceptance criteria",
    "معايير قبول واضحة",
    "A vague ambition",
    "طموح مبهم",
    "More stakeholders",
    "مزيد من أصحاب المصلحة",
  ],
  experimentation: [
    "Why randomly assign participants?",
    "لماذا نوزع المشاركين عشوائياً؟",
    "Reduce systematic group differences",
    "تقليل الفروق المنهجية بين المجموعات",
    "Guarantee significance",
    "ضمان الدلالة",
    "Eliminate all uncertainty",
    "إزالة كل عدم اليقين",
  ],
  modeling: [
    "What must be defined before a fact table?",
    "ما الذي يجب تحديده قبل جدول الحقائق؟",
    "Grain of each row",
    "مستوى تفاصيل كل صف",
    "Dashboard theme",
    "مظهر اللوحة",
    "File icon",
    "أيقونة الملف",
  ],
  pipelines: [
    "What is an idempotent load?",
    "ما هو التحميل ثابت النتيجة عند التكرار؟",
    "Rerunning it has the same intended effect",
    "إعادته تؤدي لنفس الأثر المقصود",
    "It always doubles rows",
    "يضاعف الصفوف دائماً",
    "It never validates data",
    "لا يتحقق من البيانات",
  ],
  dbt: [
    "Why use ref() for another model?",
    "لماذا نستخدم ref() لنموذج آخر؟",
    "Declare a dependency",
    "تعريف الاعتماد",
    "Hide source errors",
    "إخفاء أخطاء المصدر",
    "Skip all tests",
    "تجاوز الاختبارات",
  ],
  airflow: [
    "What does a DAG encode?",
    "ماذا يصف مخطط DAG؟",
    "Task dependencies without cycles",
    "اعتماد المهام دون دورات",
    "Only row values",
    "قيم الصفوف فقط",
    "Passwords in plaintext",
    "كلمات مرور كنص صريح",
  ],
  spark: [
    "What does a partition represent?",
    "ماذا يمثل القسم؟",
    "A portion of distributed data",
    "جزء من البيانات الموزعة",
    "An entire SQL language",
    "لغة SQL كاملة",
    "A chart label",
    "عنوان رسم",
  ],
  kafka: [
    "What tracks position in a partition?",
    "ما الذي يتتبع الموضع داخل القسم؟",
    "Offset",
    "الإزاحة",
    "Chart axis",
    "محور الرسم",
    "SQL alias",
    "اسم SQL مستعار",
  ],
  cloud: [
    "What is least privilege?",
    "ما هو مبدأ أقل صلاحية؟",
    "Only permissions needed for a task",
    "الصلاحيات اللازمة للمهمة فقط",
    "Administrator for everyone",
    "صلاحية مدير للجميع",
    "Public access by default",
    "وصول عام افتراضياً",
  ],
  engineering: [
    "Why commit changes to Git?",
    "لماذا نحفظ التغييرات في Git؟",
    "Keep reviewable version history",
    "الاحتفاظ بتاريخ إصدارات قابل للمراجعة",
    "Store production passwords",
    "تخزين كلمات مرور الإنتاج",
    "Avoid all testing",
    "تجنب كل الاختبارات",
  ],
  ml: [
    "Why reserve a test set?",
    "لماذا نحتفظ بمجموعة اختبار؟",
    "Estimate generalization on unseen data",
    "تقدير التعميم على بيانات غير مرئية",
    "Train on it repeatedly",
    "التدريب عليها مراراً",
    "Guarantee perfect accuracy",
    "ضمان دقة كاملة",
  ],
  deep: [
    "What do gradients support?",
    "ماذا تدعم التدرجات؟",
    "Updating trainable parameters",
    "تحديث المعلمات القابلة للتعلم",
    "Deleting labels",
    "حذف التسميات",
    "Eliminating validation",
    "إلغاء التحقق",
  ],
  genai: [
    "Why retrieve evidence before generating an answer?",
    "لماذا نسترجع الأدلة قبل توليد الإجابة؟",
    "Ground the answer in relevant sources",
    "إسناد الإجابة إلى مصادر ذات صلة",
    "Guarantee zero errors",
    "ضمان انعدام الأخطاء",
    "Remove the need for evaluation",
    "إلغاء الحاجة للتقييم",
  ],
  mlops: [
    "What belongs in a model registry?",
    "ماذا يتضمن سجل النماذج؟",
    "Versioned models and metadata",
    "نماذج ذات إصدارات وبيانات وصفية",
    "Only screenshots",
    "لقطات شاشة فقط",
    "User passwords",
    "كلمات مرور المستخدمين",
  ],
  governance: [
    "Who is accountable for a data asset?",
    "من المسؤول عن أصل البيانات؟",
    "A designated owner",
    "مالك محدد",
    "Nobody",
    "لا أحد",
    "Every anonymous visitor",
    "كل زائر مجهول",
  ],
  quality: [
    "Which is a measurable quality rule?",
    "أي قاعدة جودة قابلة للقياس؟",
    "Order ID must be unique",
    "معرف الطلب يجب أن يكون فريداً",
    "Data should look nice",
    "البيانات يجب أن تبدو جميلة",
    "Make it better",
    "اجعلها أفضل",
  ],
  architecture: [
    "What should drive storage design?",
    "ما الذي ينبغي أن يوجه تصميم التخزين؟",
    "Workload and consistency requirements",
    "متطلبات الأحمال والاتساق",
    "Only the newest brand",
    "أحدث علامة فقط",
    "Logo color",
    "لون الشعار",
  ],
  database: [
    "How do you verify a backup is usable?",
    "كيف تتحقق من صلاحية النسخة الاحتياطية؟",
    "Test a restore",
    "اختبار الاستعادة",
    "Trust its filename",
    "الثقة باسم الملف",
    "Never open it",
    "عدم فتحها أبداً",
  ],
  product: [
    "What is an outcome metric?",
    "ما هو مقياس النتيجة؟",
    "A measured change in user value",
    "تغير مقاس في قيمة المستخدم",
    "Number of meetings",
    "عدد الاجتماعات",
    "Lines of code only",
    "أسطر الكود فقط",
  ],
  privacy: [
    "What does data minimization mean?",
    "ماذا يعني تقليل البيانات؟",
    "Collect only what the purpose needs",
    "جمع ما يحتاجه الغرض فقط",
    "Collect everything forever",
    "جمع كل شيء للأبد",
    "Publish all raw data",
    "نشر كل البيانات الخام",
  ],
};
export function diagnosticFor(id: string): Diagnostic[] {
  const [q, qa, a, aa, b, ba, c, ca] = checks[id];
  const n = skills.findIndex(s => s.id === id) % 3;
  const opts = [copy(a, aa), copy(b, ba), copy(c, ca)];
  const options = opts.map((_, i) => opts[(i + n) % 3]);
  return [
    {
      question: copy(q, qa),
      options,
      answer: (3 - n) % 3,
      explanation: copy(a, aa),
    },
  ];
}
export function diagnosticScore(id: string, answers: number[]) {
  const qs = diagnosticFor(id);
  return qs.every((q, i) => answers[i] === q.answer) ? 1 : 0;
}
export function interviewBank(profile: Profile) {
  return Object.keys(requirements(profile))
    .map(id => ({
      id: `technical-${id}`,
      skill: id,
      category: copy("Technical case", "حالة تقنية"),
      question: interviewCases[id as keyof typeof interviewCases],
      rubric: [
        copy(
          "State the problem, assumptions and success metric.",
          "اذكر المشكلة والافتراضات ومقياس النجاح."
        ),
        copy(
          "Explain an implementation and its tradeoffs.",
          "اشرح التنفيذ والمفاضلات."
        ),
        copy(
          "Describe validation, risks and measured results.",
          "صِف التحقق والمخاطر والنتائج المقاسة."
        ),
      ],
    }))
    .concat([
      {
        id: "behavioral",
        skill: "",
        category: copy("Behavioral · STAR", "سلوكي · STAR"),
        question: copy(
          "Tell me about a time you disagreed with a stakeholder about a data decision.",
          "حدثني عن موقف اختلفت فيه مع أحد أصحاب المصلحة حول قرار متعلق بالبيانات."
        ),
        rubric: [
          copy("Situation and task", "الموقف والمهمة"),
          copy(
            "Your specific actions and collaboration",
            "إجراءاتك المحددة والتعاون"
          ),
          copy("Result, evidence and reflection", "النتيجة والدليل والتأمل"),
        ],
      },
    ]);
}
export function projectFor(profile: Profile) {
  const role = careerById[profile.role];
  if (profile.learningMode === "skill") {
    const skill = skillById[profile.focusSkill];
    return {
      id: `project-skill-${skill.id}`,
      title: copy(`${skill.title.en} applied project`, `مشروع تطبيقي: ${skill.title.ar}`),
      brief: copy(`Use ${skill.title.en} to answer a question in your selected industry using public or synthetic data. Demonstrate the topics in your chosen level, test an edge case and document the result and limitations.`, `استخدم ${skill.title.ar} للإجابة عن سؤال في مجالك ببيانات عامة أو اصطناعية. طبّق موضوعات مستواك واختبر حالة خاصة ووثّق النتائج والقيود.`),
      skills: Object.keys(requirements(profile)), hours: 8,
    };
  }
  const briefs: Record<string, ReturnType<typeof copy>> = {
    analytics: copy(
      "Build a decision-ready dashboard from a public dataset. Define KPIs, clean the data, validate totals and write a one-page recommendation.",
      "ابنِ لوحة تدعم القرار من بيانات عامة. عرّف المؤشرات ونظف البيانات وتحقق من المجاميع واكتب توصية من صفحة واحدة."
    ),
    engineering: copy(
      "Build a reproducible public-data pipeline. Define the schema, add incremental loading and quality checks, demonstrate a retry and document recovery.",
      "ابنِ مسار بيانات عامة قابلًا للتكرار. عرّف المخطط وأضف التحميل التزايدي وفحوص الجودة واختبر إعادة المحاولة ووثق التعافي."
    ),
    ai: copy(
      "Build a small prediction or retrieval application using public data. Compare a baseline, hold out evaluation data, report errors, cost and fairness limitations.",
      "ابنِ تطبيق تنبؤ أو استرجاع صغيراً ببيانات عامة. قارنه بخط أساس وافصل بيانات التقييم ووثق الأخطاء والتكلفة وحدود الإنصاف."
    ),
    governance: copy(
      "Audit a public dataset. Deliver a glossary, ownership matrix, quality scorecard and remediation plan with access and retention decisions.",
      "دقق مجموعة بيانات عامة. قدم مسرداً ومصفوفة ملكية وبطاقة جودة وخطة معالجة مع قرارات الوصول والاحتفاظ."
    ),
    business: copy(
      "Write a data-product opportunity brief. Interview a potential user, map requirements, prioritize an MVP and define measurable acceptance criteria.",
      "اكتب موجز فرصة لمنتج بيانات. قابل مستخدماً محتملاً وارسم المتطلبات وحدد أولويات النسخة الأولية ومعايير قبول قابلة للقياس."
    ),
  };
  return {
    id: `project-${role.id}`,
    title: copy(
      `${role.title.en} portfolio challenge`,
      `مشروع معرض أعمال: ${role.title.ar}`
    ),
    brief: briefs[role.family],
    skills: Object.keys(requirements(profile)).slice(0, 5),
    hours: 12,
  };
}
