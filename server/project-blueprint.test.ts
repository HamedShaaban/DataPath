import { expect, it } from 'vitest';
import { careers, skills, businessSectors } from '../shared/catalog';
import { defaultProfile, requirements } from '../shared/learning';
import { projectBlueprint, projectStarterCsv } from '../shared/project-blueprint';
it('provides traceable milestones and synthetic starter data for every career and industry',()=>{
  for (const career of careers) for (const sector of businessSectors) {
    const profile = {...defaultProfile,role:career.id,sector:sector.id};
    const b = projectBlueprint(profile);
    expect(b.milestones).toHaveLength(4);
    expect(b.milestones.every(m=>m.deliverable.length>30 && m.acceptance.length>30)).toBe(true);
    expect(b.topics.length).toBe(Object.entries(requirements(profile)).reduce((n,[id,level])=>n+skills.find(s=>s.id===id)!.topics.filter(t=>t.level<=level).length,0));
    expect(projectStarterCsv(profile).split('\n')).toHaveLength(6);
    expect(b.datasetNote).toContain('not statistical');
  }
});
it('focused projects follow the selected tool and depth without borrowing a career artifact',()=>{
  for (const skill of skills) for (const targetLevel of [1,2,3]) {
    const profile = {...defaultProfile,learningMode:'skill' as const,focusSkill:skill.id,targetLevel};
    const b = projectBlueprint(profile);
    expect(b.topics.map(t=>t.id)).toEqual(skill.topics.filter(t=>t.level<=targetLevel).map(t=>t.id));
    expect(b.milestones[1].deliverable).toContain(skill.title.en);
  }
});
