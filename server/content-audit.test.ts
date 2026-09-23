import { expect, it } from 'vitest';
import { careers, skills, businessSectors } from '../shared/catalog';
import { newState, makePlan, learningStateSchema, topicQuiz } from '../shared/learning';
import { practiceChallenges } from '../shared/practice';
import { sqlLabChallenges } from '../shared/sql-lab';

it('all career and focused paths have ordered prerequisites, valid exercises and usable quizzes at every depth', () => {
  for (const sector of businessSectors) for (const path of [...careers.map(c=>({role:c.id})), ...skills.flatMap(s=>[1,2,3].map(targetLevel=>({learningMode:'skill' as const,focusSkill:s.id,targetLevel})))]) {
    const state = newState();
    Object.assign(state.profile,path,{sector:sector.id});
    const plan = makePlan(state);
    const seen = new Set<string>();
    for (const topic of plan.topics) {
      expect(topic.prerequisites.every(id=>seen.has(id)),topic.id).toBe(true);
      seen.add(topic.id);
      const questions = topicQuiz(topic.id);
      expect(questions.length,topic.id).toBeGreaterThan(0);
    }
    const challenges = practiceChallenges(state.profile);
    expect(new Set(challenges.map(c=>c.id)).size).toBe(challenges.length);
    for (const c of challenges) {
      expect(seen.has(c.topicId),c.id).toBe(true);
      expect(c.hints.length,c.id).toBeGreaterThan(0);
    }
  }
});
it('can retain completion for the full current topic and industry SQL catalog', () => {
  const state = newState();
  state.completed = skills.flatMap(s=>s.topics.map(t=>t.id));
  state.reviewTopics = [...state.completed];
  state.passedLabIds = businessSectors.flatMap(s=>sqlLabChallenges.map(c=>`${s.id}:${c.id}`));
  expect(learningStateSchema.safeParse(state).success).toBe(true);
});
