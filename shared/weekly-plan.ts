import { practiceChallenges } from "./practice";
import { sqlChallengeForTopic } from "./practice-navigation";
import { makePlan, projectFor, type LearningState } from "./learning";
import { dashboardWeek } from "./dashboard-progress";
import type { Copy } from "./catalog";
export type WeeklyActivity = {
  id: string;
  kind: "basics" | "lesson" | "practice" | "review" | "project";
  title: Copy;
  minutes: number;
  skillId?: string;
  topicId?: string;
  practiceInLab?: boolean;
  partial?: boolean;
  prerequisites: string[];
};
export function weeklyStudyPlan(state: LearningState, now = new Date()) {
  const week = dashboardWeek(state, now);
  const plan = makePlan(state);
  let budget = week.remaining;
  const activities: WeeklyActivity[] = [];
  const add = (
    activity: Omit<WeeklyActivity, "minutes">,
    requested: number
  ) => {
    const minutes = Math.min(budget, requested);
    if (minutes > 0) activities.push({ ...activity, minutes });
    budget -= minutes;
    return minutes;
  };
  if (state.profile.experience === "new" && !state.firstLesson?.completed) {
    add(
      {
        id: "basics",
        kind: "basics",
        title: {
          en: "Your first look at data",
          ar: "خطوتك الأولى مع البيانات",
        },
        prerequisites: [],
      },
      30
    );
    return { ...week, activities, unallocated: budget };
  }
  const weak = plan.topics.find(topic => state.reviewTopics.includes(topic.id));
  if (weak)
    add(
      {
        id: `review-${weak.id}`,
        kind: "review",
        title: weak.title,
        topicId: weak.id,
        skillId: weak.skillId,
        prerequisites: weak.prerequisites,
      },
      30
    );
  const practiceTopics = new Set(
    practiceChallenges(state.profile).map(challenge => challenge.topicId)
  );
  const scheduled = new Set(state.completed);
  for (const topic of plan.topics) {
    if (budget <= 0) break;
    if (topic.done || !topic.prerequisites.every(id => scheduled.has(id)))
      continue;
    const allocated = Math.min(topic.hours * 60, budget);
    const practice =
      allocated >= 30 ? Math.max(10, Math.floor(allocated * 0.3)) : 0;
    const common = {
      title: topic.title,
      topicId: topic.id,
      skillId: topic.skillId,
      prerequisites: topic.prerequisites,
      partial: allocated < topic.hours * 60,
    };
    add(
      { ...common, id: `lesson-${topic.id}`, kind: "lesson" },
      allocated - practice
    );
    if (practice)
      add(
        {
          ...common,
          id: `practice-${topic.id}`,
          kind: "practice",
          practiceInLab:
            practiceTopics.has(topic.id) ||
            Boolean(sqlChallengeForTopic(state.profile, topic.id)),
        },
        practice
      );
    if (common.partial) break;
    scheduled.add(topic.id);
  }
  if (!plan.topics.some(topic => !topic.done)) {
    const project = projectFor(state.profile);
    if (!state.completedProjects.includes(project.id))
      add(
        {
          id: project.id,
          kind: "project",
          title: project.title,
          prerequisites: [],
        },
        project.hours * 60
      );
  }
  return { ...week, activities, unallocated: budget };
}
