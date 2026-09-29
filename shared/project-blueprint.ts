import { careerById, skillById } from './catalog';
import { requirements, type Profile } from './learning';
import { industryPractice, practiceDataset } from './industry-practice';

const methods: Record<string, { artifact: string; validation: string }> = {
  analytics: { artifact: 'A dashboard or analysis notebook with a metric dictionary and a one-page decision brief.', validation: 'Reconcile totals to source rows, compare a filtered slice manually, and explain why missing values are not zero.' },
  engineering: { artifact: 'A runnable pipeline with schema, setup instructions, quality checks and a recovery runbook.', validation: 'Run the same batch twice without duplicate output; test invalid input and demonstrate recovery after a partial failure.' },
  ai: { artifact: 'A small prediction or retrieval prototype, baseline and evaluation report.', validation: 'Use a separate, documented evaluation set. Compare a simple baseline, show failure cases and discuss leakage, cost and limitations. The five-row starter is only for data checks; it cannot substantiate model quality.' },
  governance: { artifact: 'A data dictionary, ownership/access matrix, quality scorecard and prioritized remediation plan.', validation: 'Trace each quality finding to a reproducible check and assign an owner, severity and acceptance criterion.' },
  business: { artifact: 'A stakeholder decision brief, prioritized requirements and an acceptance-test matrix.', validation: 'Link each requirement to a decision, source field and measurable acceptance check; record assumptions separately from observations.' },
};
export function projectBlueprint(profile: Profile) {
  const context = industryPractice[profile.sector];
  const required = requirements(profile);
  const focus = profile.learningMode === 'skill' ? skillById[profile.focusSkill] : undefined;
  const method = methods[careerById[profile.role].family];
  const topics = Object.entries(required).flatMap(([id,level]) => skillById[id].topics.filter(t=>t.level<=level));
  const focusTopics = focus?.topics.filter(t=>t.level<=profile.targetLevel);
  const artifact = focus
    ? `A reproducible ${focus.title.en} artifact demonstrating ${focusTopics!.map(t=>t.title.en).join(', ')}. Include inputs, outputs and setup instructions.`
    : method.artifact;
  return {
    decision: context.decision,
    limitation: context.risk,
    datasetNote: `Synthetic starter: one row per ${context.event}; value is measured in ${context.unit}. Blank value means unknown, not zero. Five rows support hand checks, not statistical or production-scale claims. Extend with documented synthetic cases or a licensed public dataset when needed.`,
    topics: (focusTopics || topics).map(t=>({id:t.id,title:t.title,level:t.level})),
    milestones: [
      {title:'1. Define the question', deliverable:`Name the stakeholder and scope this decision: ${context.decision}. Define row grain, field types and exclusions.`, acceptance:'A reviewer can trace the question to specific fields and a measurable outcome.'},
      {title:'2. Build a reproducible artifact', deliverable:artifact, acceptance:'Someone else can follow the setup and reproduce the documented output without private data or credentials.'},
      {title:'3. Test and reconcile', deliverable:focus ? `Test an empty input, a missing or invalid value and a boundary case relevant to ${focus.title.en}. Record expected and observed results. At advanced depth, compare alternatives and explain resource or reliability trade-offs.` : method.validation, acceptance:'Include at least one failing case and the fix, plus an independent manual calculation or baseline comparison.'},
      {title:'4. Present the decision', deliverable:`Write a one-page finding, proposed action and limitations. Address: ${context.risk}.`, acceptance:'Separate evidence from assumptions and explain what this dataset cannot support.'},
    ],
  };
}
export function projectStarterCsv(profile: Profile) {
  const rows = practiceDataset(profile.sector);
  const quote = (v: unknown) => `"${String(v ?? '').replaceAll('"','""')}"`;
  return [Object.keys(rows[0]).map(quote).join(','), ...rows.map(row=>Object.values(row).map(quote).join(','))].join('\n');
}
