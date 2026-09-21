import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { loadPyodide } from "pyodide";
import { careers, businessSectors, skillById } from "../shared/catalog";
import {
  newState,
  requirements,
  learningStateSchema,
} from "../shared/learning";
import {
  practiceChallenges,
  evaluatePractice,
  recordPractice,
  practiceKey,
} from "../shared/practice";
import {
  pythonHarness,
  pythonFixtures,
  expectedPython,
} from "../shared/python-practice";
import { sqlContext } from "../shared/sql-context";
import { executeSqlChallenge, sqlErrorGuidance } from "../shared/sql-engine";
import { recordLabAttempt, passedLabIds } from "../shared/sql-progress";

describe("Path and industry practice", () => {
  it.each(careers)(
    "maps $id to its real skills and topics in every industry",
    role => {
      for (const sector of businessSectors) {
        const state = newState();
        state.profile.role = role.id;
        state.profile.sector = sector.id;
        const challenges = practiceChallenges(state.profile);
        const req = requirements(state.profile);
        expect(challenges.length).toBeGreaterThan(0);
        expect(new Set(challenges.map(c => c.id)).size).toBe(challenges.length);
        for (const c of challenges) {
          expect(req[c.skillId]).toBeGreaterThan(0);
          expect(
            skillById[c.skillId].topics.some(t => t.id === c.topicId)
          ).toBe(true);
          if (c.kind === "case") expect(c.task).toContain(sector.title);
        }
      }
    }
  );
  it("does not assign SQL/Python to a nontechnical path without those skills", () => {
    const state = newState();
    state.profile.role = "business-analyst";
    const req = requirements(state.profile);
    expect(req.python).toBeUndefined();
    expect(
      practiceChallenges(state.profile).some(c => c.kind === "python")
    ).toBe(false);
    state.profile.tools = ["python"];
    expect(
      practiceChallenges(state.profile).some(c => c.kind === "python")
    ).toBe(true);
  });
  it.each(businessSectors)(
    "executes SQL for $id with industry vocabulary",
    async sector => {
      for (const c of sqlContext(sector.id).challenges) {
        const result = await executeSqlChallenge(
          c.id,
          c.referenceSql,
          sector.id
        );
        expect(result.passed, `${sector.id}/${c.id}: ${result.error}`).toBe(
          true
        );
        if (sector.id !== "banking") expect(c.brief).toContain(sector.title);
      }
    }
  );
  it("isolates SQL pass history by industry and migrates legacy banking evidence", async () => {
    let state = newState();
    state.profile.sector = "banking";
    const c = sqlContext("banking").challenges[0];
    state = recordLabAttempt(
      state,
      c.id,
      c.referenceSql,
      await executeSqlChallenge(c.id, c.referenceSql)
    );
    expect(passedLabIds(state).has(c.id)).toBe(true);
    state.profile.sector = "healthcare";
    expect(passedLabIds(state).size).toBe(0);
    state.passedLabIds = [c.id];
    state.labAttempts = [];
    state.profile.sector = "banking";
    expect(passedLabIds(state).has(c.id)).toBe(true);
  });
  it("evaluates limited formulas and numeric work without evaluating arbitrary expressions", () => {
    const state = newState();
    const challenges = practiceChallenges(state.profile);
    for (const c of challenges.filter(c =>
      ["excel", "dax", "metric"].includes(c.kind)
    )) {
      expect(evaluatePractice(c, c.reference!, "retail").passed).toBe(true);
      expect(evaluatePractice(c, "999", "retail").passed).toBe(false);
      expect(
        evaluatePractice(c, '=WEBSERVICE("https://example.org")', "retail")
          .passed
      ).toBe(false);
    }
  });
  it("saves case revisions without falsely certifying them and preserves old state", () => {
    const state = newState();
    const c = practiceChallenges(state.profile).find(c => c.kind === "case")!;
    const saved = recordPractice(
      state,
      c,
      "Artifact and validation",
      evaluatePractice(c, "Artifact and validation", "general"),
      c.rubric
    );
    expect(saved.practiceAttempts[0].reviewOnly).toBe(true);
    expect(saved.completedPracticeIds).toEqual([]);
    expect(saved.evidence).toEqual({});
    expect(learningStateSchema.parse(saved)).toEqual(saved);
    const legacy: any = newState();
    delete legacy.practiceAttempts;
    delete legacy.completedPracticeIds;
    expect(learningStateSchema.parse(legacy).practiceAttempts).toEqual([]);
    expect(
      practiceKey({ ...state.profile, sector: "retail" }, c.id)
    ).not.toEqual(practiceKey(state.profile, c.id));
  });
  it("provides actionable SQL error guidance", () => {
    expect(sqlErrorGuidance("Parse error")).toContain("clause order");
    expect(sqlErrorGuidance("Unknown column")).toContain("column names");
  });
  it("runs real Python solutions and rejects hard-coded answers on alternate datasets", async () => {
    const req = createRequire(import.meta.url);
    const py = await loadPyodide({
      indexURL: dirname(req.resolve("pyodide/package.json")),
    });
    const state = newState();
    state.profile.role = "data-scientist";
    for (const c of practiceChallenges(state.profile).filter(
      c => c.kind === "python"
    )) {
      const fixtures = pythonFixtures("healthcare");
      py.globals.set("_dp_source", c.reference!);
      py.globals.set("_dp_fixtures", JSON.stringify(fixtures));
      const outputs = JSON.parse(await py.runPythonAsync(pythonHarness));
      expect(outputs).toEqual(fixtures.map(rows => expectedPython(c.id, rows)));
    }
    py.globals.set("_dp_source", "def solve(rows):\n    return 380");
    py.globals.set("_dp_fixtures", JSON.stringify(pythonFixtures("retail")));
    const outputs = JSON.parse(await py.runPythonAsync(pythonHarness));
    expect(outputs).not.toEqual(
      pythonFixtures("retail").map(rows => expectedPython("python-total", rows))
    );
    py.globals.set("_dp_source", "import js\ndef solve(rows):\n    return 0");
    await expect(py.runPythonAsync(pythonHarness)).rejects.toThrow(
      "imports only"
    );
  }, 20000);
});
