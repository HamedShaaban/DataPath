import { writeFileSync } from 'node:fs';
import { careers, skills } from '../shared/catalog';
import { authoredLessons } from '../shared/authored-lessons';
import { newState, makePlan } from '../shared/learning';
import { practiceChallenges } from '../shared/practice';
import { sqlLabChallenges } from '../shared/sql-lab';

const lines = ['# DataPath content coverage audit', '', 'Generated from the current catalog. Counts describe coverage, not teaching quality or mastery. Self-review cases are not executable verification. English authored examples do not imply full Arabic lesson parity.', '', '| Path | Topics | Authored examples | Executable/formula/metric topics | Self-review topics | No matching lab topic |', '| --- | ---: | ---: | ---: | ---: | ---: |'];
for (const path of [...careers.map(c => ({id:c.id, name:c.title.en, mode:'career'})), ...skills.map(s => ({id:s.id, name:s.title.en, mode:'skill'}))]) {
  const state = newState();
  if (path.mode === 'career') state.profile.role = path.id;
  else Object.assign(state.profile, {learningMode:'skill', focusSkill:path.id, targetLevel:3});
  const plan = makePlan(state);
  const challenges = practiceChallenges(state.profile);
  const checked = new Set(challenges.filter(c => c.kind !== 'case').map(c => c.topicId));
  if (plan.required.sql) sqlLabChallenges.forEach(c => checked.add(c.topicId));
  const reviewed = new Set(challenges.filter(c => c.kind === 'case').map(c => c.topicId));
  const count = (predicate:(id:string)=>boolean) => plan.topics.filter(t => predicate(t.id)).length;
  lines.push(`| ${path.name}${path.mode === 'skill' ? ' (advanced focused)' : ''} | ${plan.topics.length} | ${count(id=>Boolean(authoredLessons[id]))} | ${count(id=>checked.has(id))} | ${count(id=>reviewed.has(id))} | ${count(id=>!checked.has(id)&&!reviewed.has(id))} |`);
}
lines.push('', '## Topic gaps', '', 'Topics below have no specific authored worked example; the UI currently supplies a generic learning brief and practice prompt.');
for (const skill of skills) {
  const missing = skill.topics.filter(t=>!authoredLessons[t.id]);
  if (missing.length) lines.push(`- **${skill.title.en}:** ${missing.map(t=>`${t.id} (${t.title.en})`).join('; ')}`);
}
lines.push('', '## Priorities', '', '1. Continue checked intermediate/advanced coverage beyond the grouped-summary, ranking and top-three exercises; use the uncovered-topic counts above to prioritize.', '2. Expand specific worked examples for the topic gaps above; preserve stable topic IDs.', '3. Treat specialist tools as external, self-reviewed work until a real runtime or artifact evaluator exists.', '4. Review Arabic lesson parity independently; bilingual titles and quizzes do not establish bilingual worked-example coverage.', '');
writeFileSync('CONTENT_AUDIT.md', lines.join('\n'));
