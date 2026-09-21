import { recommendPractice } from "../shared/practice-recommendation";
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { businessSectors, careers } from "../shared/catalog";
import {
  missionDataset,
  missionExpected,
  checkMission,
  industryMissions,
} from "../shared/industry-challenge";
import {
  newState,
  learningStateSchema,
  requirements,
} from "../shared/learning";
import {
  practiceChallenges,
  recordPractice,
  evaluatePractice,
} from "../shared/practice";
describe("Industry reconciliation missions", () => {
  it.each(businessSectors)("has a reproducible $id reconciliation", sector => {
    const rows = missionDataset(sector.id);
    expect(rows).toHaveLength(16);
    expect(new Set(rows.map(r => r.id)).size).toBe(12);
    expect(rows.some(r => r.value === null)).toBe(true);
    expect(rows.some(r => r.value === 0)).toBe(true);
    expect(
      rows.some(
        r => r.received_at > "2026-08-31" && r.event_date < "2026-09-01"
      )
    ).toBe(true);
    const totals = {
      banking: 5500,
      finance: 11000,
      marketing: 1650,
      healthcare: 2750,
      retail: 1100,
      technology: 550,
      telecom: 2200,
      government: 550,
      general: 550,
    };
    expect(missionExpected(sector.id)).toEqual({
      unique: 12,
      eligible: 6,
      total: totals[sector.id],
    });
    expect(
      checkMission(
        { unique: "12", eligible: "6", total: String(totals[sector.id]) },
        sector.id
      ).every(c => c.passed)
    ).toBe(true);
    expect(
      checkMission(
        { unique: "16", eligible: "7", total: "NaN" },
        sector.id
      ).every(c => !c.passed)
    ).toBe(true);
  });
  it("offers a relevant mission to each career", () => {
    for (const career of careers) {
      const s = newState();
      s.profile.role = career.id;
      const mission = practiceChallenges(s.profile).find(c => c.mission)!;
      expect(requirements(s.profile)[mission.skillId]).toBeGreaterThan(0);
      expect(mission.title).toBe(industryMissions.general.title);
    }
  });
  it("preserves checkpoints in saved revisions without asserting expert verification", () => {
    const s = newState();
    const mission = practiceChallenges(s.profile).find(c => c.mission)!;
    const checkpoints = { unique: "12", eligible: "6", total: "550" };
    const saved = recordPractice(
      s,
      mission,
      "My method and artifact",
      evaluatePractice(mission, "My method and artifact", "general"),
      mission.rubric,
      checkpoints
    );
    expect(
      learningStateSchema.parse(saved).practiceAttempts[0].checkpoints
    ).toEqual(checkpoints);
    expect(saved.completedPracticeIds).toEqual([]);
    expect(saved.practiceAttempts[0].reviewOnly).toBe(true);
  });
  it("recommends retrying an unfinished mission checkpoint", () => {
    const state = newState();
    const mission = practiceChallenges(state.profile).find(c => c.mission)!;
    const saved = recordPractice(
      state,
      mission,
      "My draft",
      evaluatePractice(mission, "My draft", "general"),
      [],
      { unique: "16" }
    );
    expect(recommendPractice(saved)?.id).toBe(mission.id);
  });
  it("ships the exact user-guide PDF at its download path", () => {
    expect(
      readFileSync("client/public/guides/practice-lab-user-guide.pdf").equals(
        readFileSync("output/pdf/DataPath_Practice_Lab_User_Guide.pdf")
      )
    ).toBe(true);
  });
});
