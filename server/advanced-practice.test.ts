import { expect, it } from "vitest";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { loadPyodide } from "pyodide";
import { newState } from "../shared/learning";
import { practiceChallenges } from "../shared/practice";
import { pythonHarnessFor, pythonFixtures, expectedPython } from "../shared/python-practice";
import { sqlChallengeForTopic } from "../shared/practice-navigation";
import { sqlLabChallenges } from "../shared/sql-lab";
import { executeSqlChallenge } from "../shared/sql-engine";

it("exposes advanced work only at the selected depth and links the SQL lesson", () => {
  const p = newState().profile;
  p.learningMode = "skill";
  for (const level of [1, 2, 3]) {
    p.targetLevel = level;
    p.focusSkill = "sql";
    expect(sqlChallengeForTopic(p, "sql-10")).toBe(level === 3 ? "sql-date-spine" : "");
    p.focusSkill = "python";
    expect(practiceChallenges(p).some(c => c.id === "python-stream-summary")).toBe(level === 3);
  }
});

it("rejects a daily report that drops quiet days or includes pending amounts", async () => {
  const c = sqlLabChallenges.find(c => c.id === "sql-date-spine")!;
  for (const bad of [
    c.referenceSql.replace("LEFT JOIN", "INNER JOIN"),
    c.referenceSql.replace(" AND t.status = 'completed'", ""),
  ]) {
    const result = await executeSqlChallenge(c.id, bad);
    expect(result.executed).toBe(true);
    expect(result.passed).toBe(false);
  }
});

it("checks streamed summaries on real Python and rejects repeated passes and hardcoding", async () => {
  const py = await loadPyodide({ indexURL: dirname(createRequire(import.meta.url).resolve("pyodide/package.json")) });
  const p = newState().profile;
  Object.assign(p, { learningMode: "skill", focusSkill: "python", targetLevel: 3 });
  const c = practiceChallenges(p).find(c => c.id === "python-stream-summary")!;
  const fixtures = pythonFixtures("retail", c.id);
  py.globals.set("_dp_fixtures", JSON.stringify(fixtures));
  py.globals.set("_dp_source", c.reference!);
  const expected = fixtures.map(rows => expectedPython(c.id, rows));
  expect(JSON.parse(await py.runPythonAsync(pythonHarnessFor(c.id)))).toEqual(expected);
  expect(expected[2]).toEqual([0, 0, null, null]);
  expect(expected[3]).toEqual([3, 5, -7, 12]);
  py.globals.set("_dp_source", "def solve(rows):\n    first = sum(1 for row in rows)\n    second = sum(1 for row in rows)\n    return [first, second, 0, 0]");
  await expect(py.runPythonAsync(pythonHarnessFor(c.id))).rejects.toThrow("One-pass input");
  py.globals.set("_dp_source", `def solve(rows):\n    return ${JSON.stringify(expected[0])}`);
  expect(JSON.parse(await py.runPythonAsync(pythonHarnessFor(c.id)))).not.toEqual(expected);
}, 20000);

it("checks grouped totals and top-k ties on real Python across all industries", async () => {
  const { businessSectors } = await import('../shared/catalog');
  const py = await loadPyodide({ indexURL: dirname(createRequire(import.meta.url).resolve('pyodide/package.json')) });
  const p = newState().profile;
  Object.assign(p, {learningMode:'skill', focusSkill:'python', targetLevel:3});
  for (const sector of businessSectors) for (const id of ['python-category-totals','python-top-three']) {
    const c = practiceChallenges(p).find(c=>c.id===id)!;
    const fixtures = pythonFixtures(sector.id,id);
    py.globals.set('_dp_source',c.reference!);
    py.globals.set('_dp_fixtures',JSON.stringify(fixtures));
    expect(JSON.parse(await py.runPythonAsync(pythonHarnessFor(id)))).toEqual(fixtures.map(rows=>expectedPython(id,rows)));
    const bad = c.reference!.replace("row['value'] is not None", "row['value']").replace("row['value'] is None", "not row['value']");
    py.globals.set('_dp_source',bad);
    expect(JSON.parse(await py.runPythonAsync(pythonHarnessFor(id)))).not.toEqual(fixtures.map(rows=>expectedPython(id,rows)));
  }
});
it('rejects global ranking when a per-customer rank is requested', async () => {
  const c = sqlLabChallenges.find(c=>c.id==='sql-customer-ranking')!;
  expect((await executeSqlChallenge(c.id,c.referenceSql)).passed).toBe(true);
  expect((await executeSqlChallenge(c.id,c.referenceSql.replace('PARTITION BY customer_id ',''))).passed).toBe(false);
});
