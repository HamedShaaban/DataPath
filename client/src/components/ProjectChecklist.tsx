import { useState } from "react";
export function ProjectChecklist({
  notes,
  title,
}: {
  notes: string;
  title: string;
}) {
  const [checked, setChecked] = useState<number[]>([]);
  const items = [
    [
      "A clear business question",
      "Explain the decision your analysis supports and who needs the answer.",
    ],
    [
      "Traceable data and assumptions",
      "Name the dataset, link its source, define what one row means and document exclusions.",
    ],
    [
      "A reproducible method",
      "Include code, formulas or transformation steps so someone else can follow your work.",
    ],
    [
      "Evidence that the result is correct",
      "Show a reconciled total, small manual check, or test case—not only the final chart.",
    ],
    [
      "An understandable conclusion",
      "State the finding, proposed action, limitations and what you would investigate next.",
    ],
    [
      "Accessible artifact links",
      "Check that intended reviewers can open the linked work and that it contains only data you are permitted to share.",
    ],
  ];
  const download = () => {
    const text = `# ${title}\n\n${notes}\n\n## Personal preparation checklist\n${items.map(([item], index) => `- [${checked.includes(index) ? "x" : " "}] ${item}`).join("\n")}\n\nSelf-reviewed by the learner. Not an independent assessment or certificate.\n`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/markdown;charset=utf-8" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "datapath-project-review.md";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <details className="project-preflight">
      <summary>Prepare your project for a reviewer</summary>
      <div>
        <p>
          Use this personal checklist before marking your project complete.
          These checkmarks last for this visit; export them with your notes to
          keep a copy. They do not mark the project as verified.
        </p>
        <p role="status">
          {checked.length} of {items.length} preparation checks marked
        </p>
        {items.map(([label, help], index) => (
          <label className="rubric-item" key={label}>
            <input
              type="checkbox"
              checked={checked.includes(index)}
              onChange={event =>
                setChecked(current =>
                  event.target.checked
                    ? [...current, index]
                    : current.filter(value => value !== index)
                )
              }
            />
            <span>
              <strong>{label}</strong>
              <small>{help}</small>
            </span>
          </label>
        ))}
        <button
          className="secondary"
          disabled={!notes.trim()}
          onClick={download}
        >
          Download notes and checklist
        </button>
        {!notes.trim() && (
          <small>Add your project notes below to enable export.</small>
        )}
      </div>
    </details>
  );
}
