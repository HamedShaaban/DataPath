import { practiceChallenges, recordPractice } from "../shared/practice";
import { expect, it } from "vitest";
import { newState, projectFor } from "../shared/learning";
import { progressEvidence } from "../shared/progress-evidence";
it("keeps practice, latest quiz passes and project evidence separate", () => {
 const s = newState();
 s.labAttempts = [{challengeId:"sql-select-filter",topicId:"sql-1",sector:"general",query:"SELECT 1",passed:false,checksPassed:1,checksTotal:4,feedback:"retry",at:"2026-09-23T00:00:00Z"}];
 s.quizAttempts = [{id:"a",kind:"topic",targetId:"sql-1",score:100,passed:true,weakTopics:[],at:"2026-09-23T00:00:00Z"}];
 expect(progressEvidence(s)).toMatchObject({practiced:1,quizzesPassed:1,projectRecorded:false});
 s.quizAttempts.push({...s.quizAttempts[0],id:"b",passed:false,score:0});
 expect(progressEvidence(s).quizzesPassed).toBe(0);
 s.profile.sector="retail";
 expect(progressEvidence(s).practiced).toBe(0);
 const id=projectFor(s.profile).id; s.completedProjects=[id];
 expect(progressEvidence(s).projectRecorded).toBe(false);
 s.projectNotes[id]="Artifact and checks recorded";
 expect(progressEvidence(s).projectRecorded).toBe(true);
});

it("counts focused-path passes and self-reviewed cases without mixing paths or industries", () => {
  const s = newState();
  s.profile.learningMode = "skill";
  s.profile.focusSkill = "python";
  s.profile.targetLevel = 3;
  const challenges = practiceChallenges(s.profile);
  const checked = challenges.find(c => c.kind === "python")!;
  const applied = challenges.find(c => c.kind === "case")!;
  const passed = recordPractice(s, checked, "tested solution", { passed: true, checks: [], message: "Passed" });
  const recorded = recordPractice(passed, applied, "Evidence notes", { passed: false, reviewOnly: true, checks: [], message: "Saved for self-review" });
  expect(progressEvidence(recorded)).toMatchObject({ checkedPassed: 1, casesRecorded: 1, practiced: 2 });
  const career = structuredClone(recorded);
  career.profile.learningMode = "career";
  expect(progressEvidence(career)).toMatchObject({ checkedPassed: 0, casesRecorded: 0 });
  recorded.profile.sector = "retail";
  expect(progressEvidence(recorded)).toMatchObject({ checkedPassed: 0, casesRecorded: 0 });
});
