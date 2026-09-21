import { expect, it } from "vitest";
import { newState } from "../shared/learning";
import { selectedProof } from "../shared/proof-export";
it("exports only selected path skills and never private fields", () => {
  const state = newState();
  state.profile.displayName = "PRIVATE_NAME";
  state.evidence["sql-1"] = "PRIVATE_EVIDENCE";
  state.interviewAnswers.behavioral = "PRIVATE_ANSWER";
  state.projectNotes.demo = "PRIVATE_PROJECT";
  const text = selectedProof(state, ["sql"]);
  expect(text).toContain("| SQL |");
  expect(text).not.toContain("| Excel |");
  expect(text).not.toContain("PRIVATE_");
  expect(text).toContain("not independent certification");
});
it("returns no export for an empty selection and ignores unknown or duplicate IDs", () => {
  const state = newState();
  expect(selectedProof(state, [])).toBe("");
  expect(selectedProof(state, ["unknown"])).toBe("");
  expect(selectedProof(state, ["sql", "sql", "unknown"])).toBe(
    selectedProof(state, ["sql"])
  );
});
