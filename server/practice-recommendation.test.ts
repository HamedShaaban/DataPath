import { describe, it, expect } from "vitest";
import { newState } from "../shared/learning";
import { recommendPractice } from "../shared/practice-recommendation";
import { careers } from "../shared/catalog";
import { practiceChallenges } from "../shared/practice";
describe("Next practice recommendation", () => {
  it.each(careers)("finds a relevant first exercise for $id", role => {
    const s = newState();
    s.profile.role = role.id;
    const next = recommendPractice(s);
    expect(next).toBeTruthy();
    expect(next!.minutes).toBeGreaterThan(0);
    expect(next!.reason).toBeTruthy();
  });
  it("prioritises a recent failed attempt and respects the industry", () => {
    const s = newState();
    s.labAttempts = [
      {
        challengeId: "sql-select-filter",
        topicId: "sql-1",
        query: "SELECT 1",
        passed: false,
        sector: "general",
        at: new Date().toISOString(),
      },
    ];
    expect(recommendPractice(s)?.id).toBe("sql-select-filter");
    expect(recommendPractice(s)?.reason).toContain("latest attempt");
    s.profile.sector = "retail";
    expect(recommendPractice(s)?.reason).not.toContain("latest attempt");
  });
  it("moves past a successful exercise", () => {
    const s = newState();
    const first = recommendPractice(s)!;
    if (first.kind === "sql") s.passedLabIds = [`general:${first.id}`];
    else s.completedPracticeIds = [`${s.profile.role}:general:${first.id}`];
    expect(recommendPractice(s)?.id).not.toBe(first.id);
  });
  it("respects selected skill and returns no result for an unrelated skill", () => {
    const s = newState();
    expect(recommendPractice(s, "excel")?.skillId).toBe("excel");
    expect(recommendPractice(s, "not-a-skill")).toBeNull();
  });
  it("returns review topics before fresh unrelated work", () => {
    const s = newState();
    const c = practiceChallenges(s.profile).find(c => c.id === "excel-total")!;
    s.reviewTopics = [c.topicId];
    s.completed = ["excel-1"];
    expect(recommendPractice(s)?.topicId).toBe(c.topicId);
  });
});
