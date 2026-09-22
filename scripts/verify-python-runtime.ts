// Packaging/runtime check in Node, not a browser UI or CSP acceptance test.
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { businessSectors } from "../shared/catalog";
import { newState } from "../shared/learning";
import { practiceChallenges } from "../shared/practice";
import {
  pythonFixtures,
  expectedPython,
  pythonHarness,
} from "../shared/python-practice";
const root = resolve("dist/public/python-runtime");
const { loadPyodide } = await import(
  pathToFileURL(resolve(root, "pyodide.mjs")).href
);
const py = await loadPyodide({ indexURL: root + "/" });
const state = newState();
state.profile.role = "data-scientist";
let checked = 0;
for (const sector of businessSectors) {
  state.profile.sector = sector.id;
  for (const challenge of practiceChallenges(state.profile).filter(
    c => c.kind === "python"
  )) {
    const fixtures = pythonFixtures(sector.id);
    py.globals.set("_dp_source", challenge.reference!);
    py.globals.set("_dp_fixtures", JSON.stringify(fixtures));
    assert.deepEqual(
      JSON.parse(await py.runPythonAsync(pythonHarness)),
      fixtures.map(rows => expectedPython(challenge.id, rows))
    );
    checked++;
  }
}
console.log(
  `PASS: ${checked} Python exercise/industry combinations using built self-hosted runtime assets`
);
