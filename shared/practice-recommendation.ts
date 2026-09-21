import { checkMission } from "./industry-challenge";
import { skillById } from "./catalog";
import { makePlan, requirements, type LearningState } from "./learning";
import { practiceChallenges, practiceKey } from "./practice";
import { sqlContext } from "./sql-context";
import { passedLabIds } from "./sql-progress";
export function practiceMeta(topicId: string, kind: string) {
  if (kind === "mission") return { difficulty: "Intermediate", minutes: 45 };
  const skill = Object.values(skillById).find(s =>
    s.topics.some(t => t.id === topicId)
  )!;
  const level = skill.topics.find(t => t.id === topicId)!.level;
  return {
    difficulty: ["Beginner", "Intermediate", "Advanced"][level - 1],
    minutes:
      (kind === "case"
        ? 30
        : kind === "metric"
          ? 5
          : kind === "sql"
            ? 10
            : 15) +
      (level - 1) * 5,
  };
}
export function recommendPractice(state: LearningState, skillFilter = "") {
  const req = requirements(state.profile),
    plan = makePlan(state);
  const current = plan.topics.find(topic => !topic.done)?.id;
  const passedSql = passedLabIds(state);
  const candidates = [
    ...sqlContext(state.profile.sector)
      .challenges.filter(
        c =>
          req.sql &&
          skillById.sql.topics.find(t => t.id === c.topicId)!.level <= req.sql
      )
      .map(c => ({
        id: c.id,
        topicId: c.topicId,
        skillId: "sql",
        kind: "sql",
        title: c.title,
      })),
    ...practiceChallenges(state.profile),
  ].filter(c => !skillFilter || c.skillId === skillFilter);
  return (
    candidates
      .map((c, index) => {
        const latest =
          c.kind === "sql"
            ? [...state.labAttempts]
                .reverse()
                .find(
                  a =>
                    a.challengeId === c.id &&
                    (a.sector || "banking") === state.profile.sector
                )
            : [...state.practiceAttempts]
                .reverse()
                .find(a => a.key === practiceKey(state.profile, c.id));
        const passed =
          c.kind === "sql"
            ? passedSql.has(c.id)
            : state.completedPracticeIds.includes(
                practiceKey(state.profile, c.id)
              );
        const missionNeedsWork =
          c.id === "industry-reconciliation" &&
          latest &&
          "checkpoints" in latest &&
          (checkMission(latest.checkpoints || {}, state.profile.sector).some(
            check => !check.passed
          ) ||
            ("rubric" in latest && latest.rubric.length < 4));
        const submitted = c.kind === "case" && !!latest && !missionNeedsWork;
        const failed =
          !!missionNeedsWork ||
          (!!latest && !latest.passed && c.kind !== "case");
        const topic = skillById[c.skillId].topics.find(
          t => t.id === c.topicId
        )!;
        const ready = topic.prerequisites.every(
          id =>
            state.completed.includes(id) ||
            plan.topics.find(t => t.id === id)?.done ||
            !plan.topics.some(t => t.id === id)
        );
        let score = passed || submitted ? 0 : 40;
        let reason = passed
          ? "Revisit a previously passed exercise to keep your skills fresh."
          : submitted
            ? "Revisit your saved submission and improve its evidence."
            : "An unfinished exercise in your selected career path.";
        if (!passed && !submitted && ready) score += 10;
        if (!passed && c.topicId === current) {
          score = 70;
          reason = "Practise the next unfinished topic in your roadmap.";
        }
        if (!passed && state.reviewTopics.includes(c.topicId)) {
          score = 80;
          reason =
            "This topic is in your review queue. Practise it before moving on.";
        }
        if (failed) {
          score = 90;
          reason =
            "Your latest attempt needs work. Retry using the feedback and hints.";
        }
        if (!ready && !failed) {
          score -= 30;
          reason += " Review its prerequisite lessons first.";
        }
        return {
          ...c,
          ...practiceMeta(
            c.topicId,
            c.id === "industry-reconciliation" ? "mission" : c.kind
          ),
          reason,
          score,
          index,
        };
      })
      .sort((a, b) => b.score - a.score || a.index - b.index)[0] || null
  );
}
