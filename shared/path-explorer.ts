import { careers, skillById } from "./catalog";
import { makePlan, type LearningState } from "./learning";

export function findCareers(query: string, family = "all") {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return careers.filter(role => {
    const searchable = [
      role.title.en,
      role.title.ar,
      role.description.en,
      role.description.ar,
      ...Object.keys(role.requirements).flatMap(id => [
        skillById[id].title.en,
        skillById[id].title.ar,
      ]),
    ]
      .join(" ")
      .toLocaleLowerCase();
    return (
      (family === "all" || role.family === family) &&
      terms.every(term => searchable.includes(term))
    );
  });
}
export function previewCareer(state: LearningState, role: string) {
  return makePlan({
    ...state,
    profile: {
      ...state.profile,
      role,
      learningMode: "career",
      skillTargets: {},
    },
  });
}
