import { skillById } from "./catalog";
import { sqlLabChallenges } from "./sql-lab";
import { requirements, type Profile } from "./learning";
/** Resolve explicit lesson links before a previous SQL selection. */
export function sqlChallengeForTopic(profile: Profile, topicId: string) {
  const level = requirements(profile).sql;
  if (!level) return "";
  return (
    sqlLabChallenges.find(
      challenge =>
        challenge.topicId === topicId &&
        (skillById.sql.topics.find(topic => topic.id === topicId)?.level ??
          Infinity) <= level
    )?.id || ""
  );
}
