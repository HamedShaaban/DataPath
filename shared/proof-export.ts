import { learningPathTitle } from "./learning";
import { sectorById, skillById } from "./catalog";
import { skillEvidenceMatrix, type LearningState } from "./learning";
/** Explicit allowlist: never serialize the learner state into a shareable report. */
export function selectedProof(state: LearningState, selectedSkills: string[]) {
  const rows = skillEvidenceMatrix(state).filter(row =>
    selectedSkills.includes(row.skillId)
  );
  if (!rows.length) return "";
  return [
    "# DataPath selected learning records",
    `Role: ${learningPathTitle(state.profile).en}`,
    `Industry: ${sectorById[state.profile.sector].title}`,
    "Learner-controlled export. Local practice and assessment records are not independent certification. Evidence counts indicate saved notes, not expert review.",
    "",
    "| Skill | Target | Lessons | Evidence | Checks | Exam | Status |",
    "|---|---:|---:|---:|---:|---:|---|",
    ...rows.map(
      row =>
        `| ${skillById[row.skillId].title.en} | ${row.target} | ${row.completed}/${row.topics} | ${row.evidenced}/${row.topics} | ${row.levelChecks}/${row.target} | ${row.latestScore ?? "—"} | ${row.status} |`
    ),
  ].join("\n");
}
