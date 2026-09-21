import { describe, expect, it } from "vitest";
import {
  careers,
  skills,
  dependencies,
  skillById,
  businessSectors,
  toolbox,
} from "../shared/catalog";
import {
  newState,
  makePlan,
  requirements,
  discover,
  diagnosticFor,
  interviewBank,
  projectFor,
  topicQuiz,
  levelQuiz,
  skillQuiz,
  cumulativeQuiz,
  learningStateSchema,
  lessonGuide,
  skillEvidenceMatrix,
} from "../shared/learning";
import { sqlLabChallenges } from "../shared/sql-lab";
import { executeSqlChallenge } from "../shared/sql-engine";
describe("Curated knowledge graph and planning", () => {
  it("has 18 bilingual roles with valid requirements and 252 bilingual topics", () => {
    expect(careers).toHaveLength(18);
    expect(skills.flatMap(s => s.topics)).toHaveLength(252);
    const ids = skills.flatMap(s => s.topics.map(t => t.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const role of careers) {
      expect(role.title.ar).toBeTruthy();
      expect(Object.keys(role.requirements).length).toBeGreaterThan(4);
      for (const id of Object.keys(role.requirements))
        expect(skillById[id]).toBeDefined();
    }
    for (const s of skills) {
      expect(new URL(s.resource.url).protocol).toBe("https:");
      for (const t of s.topics) {
        expect(t.title.ar).toBeTruthy();
        for (const dep of t.prerequisites) expect(ids).toContain(dep);
      }
    }
  });
  it("defines actionable sector context and explains every recommended tool", () => {
    expect(businessSectors.length).toBeGreaterThanOrEqual(8);
    expect(new Set(businessSectors.map(sector => sector.id)).size).toBe(
      businessSectors.length
    );
    for (const sector of businessSectors) {
      expect(sector.knowledge.length).toBeGreaterThanOrEqual(5);
      expect(sector.metrics.length).toBeGreaterThanOrEqual(5);
      expect(sector.project.length).toBeGreaterThan(40);
    }
    expect(toolbox.every(tool => tool.why.length > 40)).toBe(true);
  });
  it("has no cyclic cross-skill dependencies", () => {
    const visit = (id: string, path: string[]) => {
      expect(path).not.toContain(id);
      Object.keys(dependencies[id] || {}).forEach(d => visit(d, [...path, id]));
    };
    skills.forEach(s => visit(s.id, []));
  });
  it("builds every role deterministically and orders prerequisites before dependents", () => {
    for (const role of careers) {
      const s = newState();
      s.profile.role = role.id;
      const plan = makePlan(s);
      expect(plan).toEqual(makePlan(s));
      const ids = plan.topics.map(t => t.id);
      plan.topics.forEach((t, i) =>
        t.prerequisites.forEach(d => expect(ids.indexOf(d)).toBeLessThan(i))
      );
      expect(projectFor(s.profile).brief.ar).toBeTruthy();
      expect(interviewBank(s.profile).length).toBeGreaterThan(5);
    }
  });
  it("adds transitive prerequisites for optional skills", () => {
    const s = newState();
    s.profile.tools = ["deep"];
    const req = requirements(s.profile);
    expect(req.deep).toBe(2);
    expect(req.ml).toBeGreaterThanOrEqual(1);
    expect(req.python).toBeGreaterThanOrEqual(2);
    expect(req.statistics).toBeGreaterThanOrEqual(2);
  });
  it("respects duration without compressing away required work", () => {
    const s = newState();
    s.profile.weeks = 1;
    s.profile.hoursPerWeek = 1;
    const short = makePlan(s);
    expect(short.feasible).toBe(false);
    expect(short.recommendedWeeks).toBeGreaterThan(12);
    s.profile.weeks = 104;
    expect(makePlan(s).topics).toEqual(short.topics);
    expect(makePlan(s).feasible).toBe(false);
    s.profile.hoursPerWeek = 20;
    expect(makePlan(s).feasible).toBe(true);
  });
  it("uses self assessment, but a failed quick check restores foundational gaps", () => {
    const s = newState();
    s.profile.assessment.sql = 2;
    expect(makePlan(s).topics.some(t => t.skillId === "sql")).toBe(false);
    s.diagnostics.sql = [(diagnosticFor("sql")[0].answer + 1) % 3];
    expect(makePlan(s).topics.some(t => t.id === "sql-1")).toBe(true);
  });
  it("removes completed topics from remaining effort", () => {
    const s = newState();
    const first = makePlan(s);
    s.completed = ["sql-1"];
    expect(makePlan(s).remainingHours).toBe(first.remainingHours - 3);
  });
  it("makes discovery respond to interests and coding preference", () => {
    expect(discover(["ai"], 2)[0].role.family).toBe("ai");
    expect(discover(["business"], 0)[0].role.family).toBe("business");
  });
  it("creates topic, skill and cumulative quizzes from curated topic IDs", () => {
    const topic = topicQuiz("sql-1");
    expect(topic).toHaveLength(5);
    expect(topic.every(question => question.topicId === "sql-1")).toBe(true);
    expect(levelQuiz("sql", 1)).toHaveLength(10);
    expect(skillQuiz("sql", 2)).toHaveLength(20);
    expect(cumulativeQuiz(["sql", "excel"], { sql: 2, excel: 2 })).toHaveLength(
      4
    );
    for (const question of [
      ...topic,
      ...levelQuiz("sql", 1),
      ...skillQuiz("sql", 2),
    ])
      expect(question.options[question.answer]).toBeDefined();
  });
  it("uses technical SQL scenarios with actionable explanations", () => {
    for (let topic = 1; topic <= 9; topic += 1) {
      const questions = topicQuiz(`sql-${topic}`);
      expect(questions).toHaveLength(5);
      expect(
        questions
          .slice(0, 3)
          .every(question => question.id.includes("technical"))
      ).toBe(true);
      expect(
        questions.every(question => question.explanation.en.length > 35)
      ).toBe(true);
      expect(
        questions.some(question =>
          /SELECT|JOIN|NULL|CTE|RANK|EXPLAIN|index|transaction/i.test(
            question.prompt.en +
              question.options.map(option => option.en).join(" ")
          )
        )
      ).toBe(true);
    }
  });
  it("provides a bilingual lesson guide and topic-specific video discovery for every topic", () => {
    for (const topic of skills.flatMap(skill => skill.topics)) {
      const english = lessonGuide(topic.id, "en");
      const arabic = lessonGuide(topic.id, "ar");
      expect(english.brief.length).toBeGreaterThan(40);
      expect(arabic.objectives).toHaveLength(3);
      expect(new URL(english.youtubeUrl).hostname).toBe("www.youtube.com");
      expect(english.youtubeUrl).toContain(encodeURIComponent(topic.title.en));
    }
  });
  it("reopens completed weak topics for spaced review", () => {
    const state = newState();
    state.completed = ["sql-1"];
    state.reviewTopics = ["sql-1"];
    expect(
      makePlan(state).topics.find(topic => topic.id === "sql-1")?.done
    ).toBe(false);
  });
  it("only marks a skill proven when assessment and lesson evidence agree", () => {
    const state = newState();
    const row = skillEvidenceMatrix(state).find(
      item => item.skillId === "sql"
    )!;
    expect(row.status).toBe("gap");
    const requiredTopics = skillById.sql.topics.filter(
      topic => topic.level <= row.target
    );
    state.completed = requiredTopics.map(topic => topic.id);
    expect(
      skillEvidenceMatrix(state).find(item => item.skillId === "sql")?.status
    ).toBe("assessment");
    state.certifiedSkills = ["sql"];
    expect(
      skillEvidenceMatrix(state).find(item => item.skillId === "sql")?.status
    ).not.toBe("proven");
    state.evidence = Object.fromEntries(
      requiredTopics.map(topic => [topic.id, "Query and validation notes"])
    );
    expect(
      skillEvidenceMatrix(state).find(item => item.skillId === "sql")?.status
    ).toBe("proven");
  });
  it("loads older state with quiz and profile defaults", () => {
    const legacy: any = newState();
    delete legacy.quizAttempts;
    delete legacy.certifiedSkills;
    delete legacy.reviewTopics;
    delete legacy.labAttempts;
    delete legacy.profile.displayName;
    delete legacy.profile.avatarData;
    const parsed = learningStateSchema.parse(legacy);
    expect(parsed.quizAttempts).toEqual([]);
    expect(parsed.labAttempts).toEqual([]);
    expect(parsed.profile.avatarData).toBe("");
  });
  it("validates guided SQL work and returns the expected banking result", async () => {
    expect(sqlLabChallenges).toHaveLength(12);
    const passed = await executeSqlChallenge(
      "sql-select-filter",
      "SELECT transaction_id, amount FROM transactions WHERE status = 'completed' AND amount >= 500 ORDER BY amount DESC;"
    );
    expect(passed.passed).toBe(true);
    expect(passed.rows).toEqual([
      { transaction_id: 104, amount: 950 },
      { transaction_id: 101, amount: 720 },
      { transaction_id: 105, amount: 510 },
    ]);
    const failed = await executeSqlChallenge(
      "sql-select-filter",
      "SELECT transaction_id, amount FROM transactions;"
    );
    expect(failed.passed).toBe(false);
    expect(failed.checks.some(check => !check.passed)).toBe(true);
  });
  it("executes SQL against an isolated dataset and blocks mutating statements", async () => {
    const passed = await executeSqlChallenge(
      "sql-select-filter",
      "SELECT transaction_id, amount FROM transactions WHERE status = 'completed' AND amount >= 500 ORDER BY amount DESC;"
    );
    expect(passed.executed).toBe(true);
    expect(passed.passed).toBe(true);
    expect(passed.rows[0]).toEqual({ transaction_id: 104, amount: 950 });

    const wrong = await executeSqlChallenge(
      "sql-select-filter",
      "SELECT transaction_id, amount FROM transactions ORDER BY amount DESC;"
    );
    expect(wrong.executed).toBe(true);
    expect(wrong.passed).toBe(false);
    expect(wrong.rows).toHaveLength(6);

    const blocked = await executeSqlChallenge(
      "sql-select-filter",
      "DELETE FROM transactions"
    );
    expect(blocked.executed).toBe(false);
    expect(blocked.error).toContain("read-only");
  });
});
