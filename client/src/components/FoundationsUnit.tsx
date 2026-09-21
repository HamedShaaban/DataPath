import { useState } from "react";
import { industryPractice } from "@shared/industry-practice";
import {
  checkFoundation,
  foundationDataset,
  foundationExpected,
  emptyFoundationAnswers,
  type FoundationAnswers,
} from "@shared/foundations-unit";
import { requirements, type LearningState } from "@shared/learning";
import { LessonGlossary } from "./LessonGlossary";
export function FoundationsUnit({
  state,
  update,
  openLesson,
}: {
  state: LearningState;
  update: (fn: (state: LearningState) => LearningState) => void;
  openLesson: (id: string) => void;
}) {
  const sector = state.profile.sector;
  const required = requirements(state.profile);
  const saved = state.foundationUnits?.[sector];
  const stage = saved?.stage ?? 0;
  const answers = saved?.answers ?? emptyFoundationAnswers;
  const [feedback, setFeedback] = useState<ReturnType<
    typeof checkFoundation
  > | null>(null);
  const [hint, setHint] = useState(false);
  const [exampleOpen, setExampleOpen] = useState(stage === 0);
  const context = industryPractice[sector];
  const independent = stage >= 2;
  const rows = foundationDataset(sector, independent);
  const worked = foundationExpected(sector, false);
  function persist(
    nextStage: number,
    nextAnswers: FoundationAnswers = emptyFoundationAnswers
  ) {
    update(current => ({
      ...current,
      foundationUnits: {
        ...current.foundationUnits,
        [sector]: { stage: nextStage, answers: nextAnswers },
      },
    }));
  }
  function answer(field: keyof FoundationAnswers, value: string) {
    persist(stage, { ...answers, [field]: value });
    setFeedback(null);
  }
  return (
    <section
      className="card foundation-unit"
      aria-label="Foundations: reliable totals and averages"
    >
      <span className="eyebrow">
        FOUNDATIONS · UNIT 1 · ABOUT 20–30 MINUTES
      </span>
      <h2>From raw records to a reliable answer</h2>
      <p>
        Learn to count, total and average the right records. No code or software
        installation needed. Your scenario uses {context.event} records measured
        in {context.unit}.
      </p>
      <ol className="foundation-stages" aria-label="Unit progress">
        {[
          "Watch an example",
          "Try with guidance",
          "Try independently",
          "Completed",
        ].map((title, index) => (
          <li
            key={title}
            aria-current={index === stage ? "step" : undefined}
            className={index === stage ? "current" : ""}
          >
            {index + 1}. {title}
          </li>
        ))}
      </ol>
      <p>
        <strong>Business question:</strong> For completed {context.event}{" "}
        records with a known value, how many records are eligible, what is their
        total, and what is their average?
      </p>
      <p>
        <strong>The rule:</strong> Exclude pending records. Exclude missing
        values from both the sum and the average's count. Keep zero—it is a
        known value. This is an explicit rule for this exercise, not a rule for
        every metric.
      </p>
      <div className="lab-table-wrap">
        <table>
          <caption>
            Synthetic practice data · one row per {context.event} · values in{" "}
            {context.unit}
          </caption>
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Status</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.category}</td>
                <td>{row.status}</td>
                <td>{row.value === null ? "Missing" : row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {stage === 0 && (
        <>
          <h3>Watch: choose rows before calculating</h3>
          <p>
            Rows 1, 2 and 4 qualify. Row 3 is pending; row 5 is completed but
            its value is missing. The known zero in row 4 still counts.
          </p>
          <p>
            <strong>Count:</strong> {worked.count}. <strong>Total:</strong> 120
            + 60 + 0 = {worked.total}. <strong>Average:</strong> {worked.total}{" "}
            ÷ {worked.count} = {worked.average} {context.unit} per eligible
            record.
          </p>
          <p>
            If you drop zero, you get 90 instead of 60. If you treat missing as
            zero, you get 45. Both silently change the question.
          </p>
          <button
            className="primary"
            onClick={() => {
              persist(1);
              setExampleOpen(false);
            }}
          >
            Now let me try with guidance
          </button>
        </>
      )}
      {(stage === 1 || stage === 2) && (
        <>
          <h3>
            {stage === 1
              ? "Your turn—with support"
              : "A new dataset—try independently"}
          </h3>
          <p>
            {stage === 1
              ? "Use the same records. Write down each result, then explain which records belong in the average."
              : "The amounts have changed. Apply the same rule without copying the worked answer. You can still ask for a hint."}
          </p>
          <div className="form-grid">
            {(
              [
                ["count", "Eligible record count"],
                ["total", `Total (${context.unit})`],
                ["average", `Average (${context.unit})`],
              ] as const
            ).map(([field, label]) => (
              <label key={field}>
                {label}
                <input
                  inputMode="decimal"
                  value={answers[field]}
                  maxLength={30}
                  onChange={event => answer(field, event.target.value)}
                />
              </label>
            ))}
          </div>
          <label>
            Why does your average use that count?
            <select
              value={answers.explanation}
              onChange={event => answer("explanation", event.target.value)}
            >
              <option value="">Choose an explanation</option>
              <option value="all">
                Every row in the source belongs in every average.
              </option>
              <option value="positive">
                Only positive values are real observations.
              </option>
              <option value="known-completed">
                Completed records with known values qualify, including zero.
              </option>
              <option value="missing-zero">
                A missing value means zero and must count.
              </option>
            </select>
          </label>
          <div className="button-row">
            <button
              className="primary"
              onClick={() =>
                setFeedback(checkFoundation(sector, independent, answers))
              }
            >
              Check my reasoning
            </button>
            <button
              className="secondary"
              aria-expanded={hint}
              onClick={() => setHint(value => !value)}
            >
              {" "}
              {hint ? "Hide hint" : "Give me a hint"}
            </button>
          </div>
          {hint && (
            <p className="notice">
              Read Status and Value together. Write down the eligible IDs first,
              add their amounts, then divide by the number of those IDs. A zero
              must remain in the count.
            </p>
          )}
          {stage === 1 && (
            <>
              <button
                className="text-button"
                aria-expanded={exampleOpen}
                onClick={() => setExampleOpen(value => !value)}
              >
                Review the worked calculation
              </button>
              {exampleOpen && (
                <p>
                  Eligible IDs: 1, 2, 4. Count 3; total 180; average 60. Explain
                  why rows 3 and 5 are excluded before continuing.
                </p>
              )}
            </>
          )}
          {feedback && (
            <div role="status" className="foundation-feedback">
              {feedback.checks.map(check => (
                <p key={check.label}>
                  <strong>
                    {check.passed ? "✓" : "Try again:"} {check.label}
                  </strong>
                  {!check.passed && ` — ${check.hint}`}
                </p>
              ))}
              {feedback.passed && (
                <button
                  className="primary"
                  onClick={() => {
                    persist(
                      stage + 1,
                      stage === 2 ? answers : emptyFoundationAnswers
                    );
                    setFeedback(null);
                    setHint(false);
                  }}
                >
                  {" "}
                  {stage === 1
                    ? "Continue to independent practice"
                    : "Save unit completion"}
                </button>
              )}
            </div>
          )}
        </>
      )}
      {stage === 3 && (
        <>
          <h3>You can now explain a reliable summary.</h3>
          <p>
            You checked a new dataset independently: count {answers.count},
            total {answers.total}, average {answers.average}. You explained why
            zero counts and missing values do not. This completion belongs to
            your current industry and is saved with your workspace.
          </p>
          <p>
            <strong>Next:</strong> continue with the skills in your roadmap.
            This unit does not automatically pass those skill assessments.
          </p>
          <div className="button-row">
            {required.sql > 0 && (
              <button className="secondary" onClick={() => openLesson("sql-1")}>
                Continue with SQL filters
              </button>
            )}
            {required.excel > 0 && (
              <button
                className="secondary"
                onClick={() => openLesson("excel-2")}
              >
                Continue with spreadsheet formulas
              </button>
            )}
          </div>
        </>
      )}
      <p className="muted">
        Interpretation limit: {context.risk}. A higher average alone does not
        show better performance.
      </p>
      <LessonGlossary language={state.profile.language} />
    </section>
  );
}
