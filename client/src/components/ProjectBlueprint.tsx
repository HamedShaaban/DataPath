import { projectBlueprint, projectStarterCsv } from '@shared/project-blueprint';
import type { Profile } from '@shared/learning';

export function ProjectBlueprint({ profile }: { profile: Profile }) {
  const blueprint = projectBlueprint(profile);
  const download = () => {
    const url = URL.createObjectURL(new Blob([projectStarterCsv(profile)], {type:'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `datapath-${profile.sector}-project-starter.csv`;
    link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  return <section className="project-blueprint" aria-label="Project milestones and acceptance criteria">
    <h3>Your project plan</h3>
    <p>{blueprint.datasetNote}</p>
    <button className="secondary" onClick={download}>Download project starter data (CSV)</button>
    <div className="project-milestones">
      {blueprint.milestones.map(milestone=><details key={milestone.title}>
        <summary>{milestone.title}</summary>
        <p>{milestone.deliverable}</p>
        <p><strong>Ready for review when: </strong>{milestone.acceptance}</p>
      </details>)}
    </div>
    <details>
      <summary>Topics to demonstrate ({blueprint.topics.length})</summary>
      <ul>{blueprint.topics.map(topic=><li key={topic.id}>{topic.title[profile.language]} · {['Beginner','Intermediate','Advanced'][topic.level-1]}</li>)}</ul>
    </details>
    <p className="muted">Use these criteria for self-review. DataPath does not independently verify or grade this project.</p>
  </section>;
}
