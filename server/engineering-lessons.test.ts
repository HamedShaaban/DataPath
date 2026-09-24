import { expect, it } from 'vitest';
import { engineeringLessons } from '../shared/engineering-lessons';
import { skills, businessSectors } from '../shared/catalog';
import { newState, lessonGuide } from '../shared/learning';
import { practiceChallenges, evaluatePractice } from '../shared/practice';
it('supplies a specific worked lesson and task for every ETL and dbt topic',()=>{
  for (const skill of skills.filter(s=>['pipelines','dbt'].includes(s.id))) for (const topic of skill.topics) {
    const lesson = engineeringLessons[topic.id];
    expect(lesson).toBeDefined();
    expect(lessonGuide(topic.id,'en').workedExample).toBe(lesson.example);
    expect(lessonGuide(topic.id,'en').practice).toBe(lesson.task);
  }
  expect(new Set(Object.values(engineeringLessons).map(l=>l.example)).size).toBe(18);
});
it('gates external practice by target depth and never awards an automatic pass',()=>{
  for (const focusSkill of ['pipelines','dbt']) for (const targetLevel of [1,2,3]) for (const sector of businessSectors) {
    const p = {...newState().profile,learningMode:'skill' as const,focusSkill,targetLevel,sector:sector.id};
    const cases = practiceChallenges(p).filter(c=>c.id.startsWith(`engineering-${focusSkill}-`));
    expect(cases).toHaveLength(targetLevel*3);
    for (const c of cases) {
      expect(c.task).toContain('DataPath does not run');
      const result = evaluatePractice(c,'A long explanation is not verified execution.',sector.id);
      expect(result.reviewOnly).toBe(true);
      expect(result.passed).toBe(false);
    }
  }
});
