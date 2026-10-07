import { careers } from "./catalog";
import { makePlan, type LearningState, type Profile } from "./learning";

export function recommendPaths(profile: Profile, interest: string, coding: number) {
  return careers.map(role => {
    const reasons: string[] = [];
    let score = 0;
    if (role.family === interest) { score += 8; reasons.push("Matches the work you want to do."); }
    const codeDepth = Math.max(role.requirements.python ?? 0, role.requirements.java ?? 0);
    if (coding === 0 && codeDepth === 0) { score += 3; reasons.push("Fits your preference for less coding."); }
    if (coding === 2 && ["engineering", "ai"].includes(role.family)) { score += 3; reasons.push("Includes the coding-focused work you prefer."); }
    if (coding === 1 && role.family === "analytics") { score += 2; reasons.push("Balances analysis with practical coding."); }
    const familiar = Object.keys(role.requirements).filter(id => (profile.assessment[id] ?? 0) > 0);
    if (familiar.length) { score += Math.min(3, familiar.length); reasons.push(`Builds on ${familiar.length} skill area${familiar.length === 1 ? "" : "s"} you already know.`); }
    return { role, score, reasons };
  }).sort((a, b) => b.score - a.score || a.role.id.localeCompare(b.role.id)).slice(0, 3);
}

export function fitRecommendedPace(state: LearningState): Profile {
  const weeks = Math.max(1, Math.min(104, Math.ceil(makePlan(state).remainingHours * 1.15 / state.profile.hoursPerWeek)));
  return { ...state.profile, weeks };
}
