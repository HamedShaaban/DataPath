import { describe, expect, it } from "vitest";
import { newState } from "../shared/learning";
import { dashboardWeek } from "../shared/dashboard-progress";
describe("dashboard weekly goal", () => {
  it("counts the current Monday-based week and excludes future sessions", () => {
    const state = newState();
    state.profile.hoursPerWeek = 2;
    const now = new Date(2026, 8, 23, 12);
    state.sessions = [
      { date: new Date(2026, 8, 20, 23, 59).toISOString(), minutes: 60 },
      { date: new Date(2026, 8, 21, 0).toISOString(), minutes: 30 },
      { date: new Date(2026, 8, 23, 10).toISOString(), minutes: 30 },
      { date: new Date(2026, 8, 24, 10).toISOString(), minutes: 90 },
    ];
    expect(dashboardWeek(state, now)).toEqual({
      minutes: 60,
      target: 120,
      percent: 50,
      remaining: 60,
    });
  });
  it("keeps logged time but caps completion after reaching the goal", () => {
    const state = newState();
    state.profile.hoursPerWeek = 1;
    const now = new Date(2026, 8, 23, 12);
    state.sessions = [{ date: now.toISOString(), minutes: 90 }];
    expect(dashboardWeek(state, now)).toEqual({
      minutes: 90,
      target: 60,
      percent: 100,
      remaining: 0,
    });
  });
});
