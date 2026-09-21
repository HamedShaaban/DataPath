/** Pair skills without discarding a final single skill or changing existing review IDs. */
export function reviewReadiness(requiredIds: string[], passedSkills: string[]) {
  const unique = [...new Set(requiredIds)];
  return Array.from({ length: Math.ceil(unique.length / 2) }, (_, index) => {
    const skills = unique.slice(index * 2, index * 2 + 2);
    const missing = skills.filter(id => !passedSkills.includes(id));
    return {
      skills,
      missing,
      ready: missing.length === 0,
      targetId: `review-${skills.join("+")}`,
    };
  });
}
