import { describe, expect, it } from "vitest";
import {
  checkFoundation,
  foundationDataset,
  foundationExpected,
  emptyFoundationAnswers,
} from "../shared/foundations-unit";
import { industryPractice, type Sector } from "../shared/industry-practice";
import { newState, learningStateSchema } from "../shared/learning";
const guided = {
  count: "3",
  total: "180",
  average: "60",
  explanation: "known-completed",
};
const independent = { ...guided, total: "120", average: "40" };
describe("Foundations unit", () => {
  it.each(Object.keys(industryPractice) as Sector[])(
    "checks both datasets in %s",
    sector => {
      expect(
        foundationDataset(sector).every(row =>
          industryPractice[sector].categories.includes(row.category)
        )
      ).toBe(true);
      expect(foundationExpected(sector)).toEqual({
        count: 3,
        total: 180,
        average: 60,
      });
      expect(checkFoundation(sector, false, guided).passed).toBe(true);
      expect(checkFoundation(sector, true, guided).passed).toBe(false);
      expect(checkFoundation(sector, true, independent).passed).toBe(true);
    }
  );
  it("rejects dropping zero or counting missing as zero", () => {
    for (const [count, average, explanation] of [
      ["2", "90", "positive"],
      ["4", "45", "missing-zero"],
    ]) {
      expect(
        checkFoundation("general", false, {
          ...guided,
          count,
          average,
          explanation,
        }).passed
      ).toBe(false);
    }
  });
  it("rejects empty, nonnumeric and partial numeric answers", () => {
    expect(
      checkFoundation("general", false, emptyFoundationAnswers).passed
    ).toBe(false);
    for (const total of ["", "Infinity", "180abc", "NaN"])
      expect(
        checkFoundation("general", false, { ...guided, total }).passed
      ).toBe(false);
  });
  it("requires reasoning even when calculations are correct", () => {
    expect(
      checkFoundation("general", true, { ...independent, explanation: "" })
        .passed
    ).toBe(false);
  });
  it("round-trips separate industry progress and keeps legacy states valid", () => {
    const state = newState();
    expect(learningStateSchema.safeParse(state).success).toBe(true);
    state.foundationUnits = {
      banking: { stage: 3, answers: independent },
      retail: { stage: 1, answers: guided },
    };
    expect(
      learningStateSchema.parse(JSON.parse(JSON.stringify(state)))
        .foundationUnits
    ).toEqual(state.foundationUnits);
    expect(
      learningStateSchema.safeParse({
        ...state,
        foundationUnits: { banking: { stage: 4, answers: guided } },
      }).success
    ).toBe(false);
  });
});
