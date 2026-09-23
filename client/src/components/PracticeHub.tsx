import { learningPathTitle } from "@shared/learning";
import { LessonGlossary } from "./LessonGlossary";
import {
  Search,
  ChevronDown,
  ArrowUpRight,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  SquareTerminal,
} from "lucide-react";
import {
  missionDataset,
  missionSteps,
  checkMission,
} from "@shared/industry-challenge";
import {
  recommendPractice,
  practiceMeta,
} from "@shared/practice-recommendation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { skillById, sectorById } from "@shared/catalog";
import { requirements, type LearningState } from "@shared/learning";
import {
  practiceChallenges,
  practiceDataset,
  industryBrief,
  practiceKey,
  evaluatePractice,
  recordPractice,
  type PracticeKind,
  type PracticeResult,
} from "@shared/practice";
import { runPythonPractice } from "@/lib/run-python";
const labels: Record<PracticeKind, string> = {
  python: "Python · run code",
  excel: "Excel · formula exercise",
  dax: "DAX · measure exercise",
  metric: "Metrics · calculate",
  case: "Applied case · self-review",
};
export function PracticeHub({
  state,
  update,
  openLesson,
  renderSql,
  initialSkill = "",
  initialTopicId = "",
}: {
  state: LearningState;
  update: (fn: (state: LearningState) => LearningState) => void;
  openLesson: (id: string) => void;
  renderSql: (challengeId?: string) => ReactNode;
  initialSkill?: string;
  initialTopicId?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [catalogueOpen, setCatalogueOpen] = useState(true);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const challenges = practiceChallenges(state.profile);
  const required = requirements(state.profile);
  const [skill, setSkill] = useState(
    required[initialSkill] ? initialSkill : ""
  );
  const [mode, setMode] = useState(
    initialSkill === "sql" && required.sql ? "sql" : ""
  );
  const [sqlTarget, setSqlTarget] = useState("");
  const [hintCount, setHintCount] = useState(0);
  const [selected, setSelected] = useState("");
  const [answer, setAnswer] = useState("");
  const [rubric, setRubric] = useState<string[]>([]);
  const [checkpoints, setCheckpoints] = useState<Record<string, string>>({});
  const [checkedSteps, setCheckedSteps] = useState<string[]>([]);
  const checkpointDrafts = useRef<Record<string, Record<string, string>>>({});
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [running, setRunning] = useState(false);
  const drafts = useRef<Record<string, string>>({});
  const rubricDrafts = useRef<Record<string, string[]>>({});
  const recommendation = recommendPractice(state, skill);
  const challenge = challenges.find(c => c.id === selected);
  const rows = challenge?.mission
    ? missionDataset(state.profile.sector)
    : practiceDataset(state.profile.sector);
  const checkpointResults = checkMission(checkpoints, state.profile.sector);
  const choose = (id: string) => {
    if (running) return;
    if (selected) {
      drafts.current[selected] = answer;
      checkpointDrafts.current[selected] = checkpoints;
      rubricDrafts.current[selected] = rubric;
    }
    const next = challenges.find(c => c.id === id)!;
    const latest = [...state.practiceAttempts]
      .reverse()
      .find(attempt => attempt.key === practiceKey(state.profile, id));
    setMode("exercise");
    setSelected(id);
    setAnswer(drafts.current[id] ?? latest?.answer ?? next.starter);
    setRubric(rubricDrafts.current[id] ?? latest?.rubric ?? []);
    setCheckpoints(checkpointDrafts.current[id] || latest?.checkpoints || {});
    setCheckedSteps([]);
    setResult(null);
    setHintCount(0);
  };
  useEffect(() => {
    if (initialSkill !== "sql" && initialTopicId) {
      const matching = challenges.find(c => c.topicId === initialTopicId);
      if (matching) choose(matching.id);
    }
  }, []);
  useEffect(() => {
    if (mode) {
      panel.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
      panel.current?.focus({ preventScroll: true });
    }
  }, [mode, selected, sqlTarget]);
  const run = async () => {
    if (!challenge || running) return;
    setRunning(true);
    try {
      const next =
        challenge.kind === "python"
          ? await runPythonPractice(challenge.id, answer, state.profile.sector)
          : evaluatePractice(challenge, answer, state.profile.sector);
      if (challenge.kind === "case")
        next.message =
          rubric.length === challenge.rubric.length
            ? "Ready to share for review. Your checklist is self-assessed; no expert has verified this submission."
            : "Draft saved. Complete the rubric and attach reproducible evidence before requesting review.";
      if (challenge.mission) {
        next.checks = checkpointResults;
        next.message =
          `${checkpointResults.filter(check => check.passed).length}/3 calculation checkpoints correct. ` +
          (checkpointResults.every(check => check.passed) &&
          rubric.length === challenge.rubric.length
            ? "Submission ready for review; the explanation is self-assessed, not expert-verified."
            : "Draft saved. Resolve failed checkpoints and complete the self-review before sharing.");
        setCheckedSteps(missionSteps.map(step => step.key));
      }
      setResult(next);
      update(current =>
        practiceKey(current.profile, challenge.id) === practiceKey(state.profile, challenge.id) &&
        current.profile.sector === state.profile.sector
          ? recordPractice(
              current,
              challenge,
              answer,
              next,
              rubric,
              checkpoints
            )
          : current
      );
    } finally {
      setRunning(false);
    }
  };
  const download = () => {
    const csv = [
      Object.keys(rows[0]).join(","),
      ...rows.map(row =>
        Object.values(row)
          .map(value => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `datapath-${state.profile.sector}-practice.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section
      className={`practice-hub practice-studio${focusMode ? " practice-focus-mode" : ""}`}
    >
      <div className="card practice-header">
        <div className="practice-header-actions">
          <span className="eyebrow">YOUR PRACTICE STUDIO</span>
          <button
            className="secondary practice-focus-toggle"
            aria-pressed={focusMode}
            onClick={() => setFocusMode(value => !value)}
          >
            {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {focusMode ? "Show exercise browser" : "Focus on workspace"}
          </button>
          <a
            className="secondary"
            href="/guides/practice-lab-user-guide.pdf"
            download="DataPath_Practice_Lab_User_Guide.pdf"
          >
            Download user guide (PDF)
          </a>
        </div>
        <h2>
          {learningPathTitle(state.profile).en} ·{" "}
          {sectorById[state.profile.sector].title}
        </h2>
        <p>{industryBrief(state.profile.sector)}</p>
        <p>
          Exercises match your career requirements and selected tools. Coding
          and calculation checks are separate from self-reviewed case
          submissions.
        </p>
      </div>
      {recommendation && (
        <section
          className="card next-practice"
          aria-label="Recommended next exercise"
        >
          <div>
            <span className="eyebrow">YOUR NEXT EXERCISE</span>
            <h3>{recommendation.title}</h3>
            <p>{recommendation.reason}</p>
            <small>
              {recommendation.difficulty} · About {recommendation.minutes}{" "}
              minutes · {skillById[recommendation.skillId].title.en}
            </small>
          </div>
          <button
            className="primary"
            disabled={running}
            onClick={() => {
              if (recommendation.kind === "sql") {
                setSqlTarget(recommendation.id);
                setMode("sql");
              } else choose(recommendation.id);
            }}
          >
            Start recommended exercise
          </button>
        </section>
      )}
      <section className="practice-catalogue exercise-picker">
        <button
          className="picker-toggle"
          aria-expanded={catalogueOpen}
          aria-controls="exercise-picker-content"
          onClick={() => setCatalogueOpen(value => !value)}
        >
          <SlidersHorizontal size={18} />
          <span>
            <strong>Find your next challenge</strong>
            <small>Explore exercises in your path</small>
          </span>
          <ChevronDown
            size={18}
            className={
              catalogueOpen ? "picker-chevron expanded" : "picker-chevron"
            }
          />
        </button>
        {catalogueOpen && (
          <div id="exercise-picker-content" className="picker-content">
            <label className="studio-skill-filter">
              Practise a skill
              <select
                value={skill}
                disabled={running}
                onChange={e => {
                  if (selected) drafts.current[selected] = answer;
                  setSkill(e.target.value);
                  setMode("");
                }}
              >
                <option value="">All skills in my path</option>
                {Object.keys(required).map(id => (
                  <option key={id} value={id}>
                    {skillById[id].title.en}
                  </option>
                ))}
              </select>
            </label>
            <label className="picker-search">
              <Search size={16} />
              <input
                aria-label="Search exercises"
                placeholder="Search a skill or exercise…"
                value={exerciseSearch}
                onChange={event => setExerciseSearch(event.target.value)}
              />
            </label>
            <p className="picker-hint">
              Pick an exercise. Your workspace opens alongside.
            </p>
            {(exerciseSearch || skill) && (
              <button
                className="text-button"
                disabled={running}
                onClick={() => {
                  setExerciseSearch("");
                  setSkill("");
                }}
              >
                Clear filters
              </button>
            )}
            <div className="practice-grid" aria-label="Practice formats">
              {!!required.sql &&
                (!skill || skill === "sql") &&
                (!exerciseSearch.trim() ||
                  "sql workbench queries filters joins".includes(
                    exerciseSearch.trim().toLowerCase()
                  )) && (
                  <button
                    disabled={running}
                    className={`practice-tile ${mode === "sql" ? "selected" : ""}`}
                    aria-pressed={mode === "sql"}
                    onClick={() => setMode("sql")}
                  >
                    <span className="eyebrow">SQL · RUN QUERIES</span>
                    <h3>SQL workbench</h3>
                    <p>
                      Filters, aggregation, joins, debugging and intermediate
                      queries using the selected industry's dataset.
                    </p>
                  </button>
                )}
              {challenges
                .filter(
                  c =>
                    (!skill || c.skillId === skill) &&
                    `${c.title} ${labels[c.kind]} ${skillById[c.skillId].title.en}`
                      .toLowerCase()
                      .includes(exerciseSearch.trim().toLowerCase())
                )
                .map(c => (
                  <button
                    disabled={running}
                    key={c.id}
                    className={`practice-tile ${mode === "exercise" && selected === c.id ? "selected" : ""}`}
                    aria-pressed={mode === "exercise" && selected === c.id}
                    onClick={() => choose(c.id)}
                  >
                    <span className="eyebrow">{labels[c.kind]}</span>
                    <h3>{c.title}</h3>
                    <span className="picker-duration">
                      {
                        practiceMeta(c.topicId, c.mission ? "mission" : c.kind)
                          .difficulty
                      }{" "}
                      ·{" "}
                      {
                        practiceMeta(c.topicId, c.mission ? "mission" : c.kind)
                          .minutes
                      }{" "}
                      min <ArrowUpRight size={13} />
                    </span>
                    {c.mission && (
                      <strong>
                        Multi-step industry mission · 3 checked calculations
                      </strong>
                    )}
                    <p>
                      {skillById[c.skillId].title.en} ·{" "}
                      {
                        skillById[c.skillId].topics.find(
                          t => t.id === c.topicId
                        )!.title.en
                      }
                    </p>
                    {state.completedPracticeIds.includes(
                      practiceKey(state.profile, c.id)
                    ) && <strong>✓ Passed in this industry</strong>}
                  </button>
                ))}
            </div>
            {!challenges.some(
              c =>
                (!skill || c.skillId === skill) &&
                `${c.title} ${labels[c.kind]} ${skillById[c.skillId].title.en}`
                  .toLowerCase()
                  .includes(exerciseSearch.trim().toLowerCase())
            ) &&
              !(
                required.sql &&
                (!skill || skill === "sql") &&
                "sql workbench queries filters joins".includes(
                  exerciseSearch.trim().toLowerCase()
                )
              ) && (
                <p role="status">
                  No matching exercises. Try another search or select a
                  different skill above.
                </p>
              )}
          </div>
        )}
      </section>
      <div
        ref={panel}
        tabIndex={-1}
        className="practice-active-panel"
        aria-label="Exercise workspace"
      >
        {!mode && (
          <section className="studio-workspace-empty">
            <span>
              <SquareTerminal size={36} />
            </span>
            <p className="eyebrow">A SPACE TO TRY, TEST AND LEARN</p>
            <h2>Choose your next challenge</h2>
            <p>
              Open an exercise from the browser, or start the recommendation
              above. Instructions, your editor and feedback will appear here.
            </p>
            <div>
              <span>01 · Read the task</span>
              <span>02 · Try your solution</span>
              <span>03 · Learn from the checks</span>
            </div>
            {focusMode && (
              <button className="secondary" onClick={() => setFocusMode(false)}>
                Browse exercises
              </button>
            )}
          </section>
        )}
        {mode === "sql" && renderSql(sqlTarget || undefined)}
        {mode === "exercise" && challenge && (
          <section
            className="card practice-exercise"
            aria-label="Selected exercise"
          >
            <span className="eyebrow">{labels[challenge.kind]}</span>
            <h2>{challenge.title}</h2>
            <p>
              {
                practiceMeta(
                  challenge.topicId,
                  challenge.mission ? "mission" : challenge.kind
                ).difficulty
              }{" "}
              · About{" "}
              {
                practiceMeta(
                  challenge.topicId,
                  challenge.mission ? "mission" : challenge.kind
                ).minutes
              }{" "}
              minutes
            </p>
            <p>{challenge.task}</p>
            <div className="practice-workspace">
              <details
                className="practice-reference studio-instructions"
                key={challenge.id}
              >
                <summary>
                  Instructions, dataset & hints <ChevronDown size={17} />
                </summary>
                <div className="studio-instructions-body">
                  <div className="practice-lesson">
                    <h3>Before you practise</h3>
                    <LessonGlossary language={state.profile.language} />
                    <p>{challenge.lesson}</p>
                    <button
                      className="text-button"
                      onClick={() => openLesson(challenge.topicId)}
                    >
                      Open this roadmap lesson →
                    </button>
                  </div>
                  <details open>
                    <summary>
                      Synthetic {sectorById[state.profile.sector].title} dataset
                    </summary>
                    <div className="lab-table-wrap">
                      <table>
                        <thead>
                          <tr>
                            {Object.keys(rows[0]).map(k => (
                              <th key={k}>{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {Object.values(row).map((value, i) => (
                                <td key={i}>
                                  {value === null ? "NULL" : value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button className="secondary" onClick={download}>
                      Download CSV for Excel, Power BI or notebooks
                    </button>
                  </details>
                  <section className="progressive-hints">
                    <h3>Hints, one step at a time</h3>
                    <ol>
                      {challenge.hints.slice(0, hintCount).map(hint => (
                        <li key={hint}>{hint}</li>
                      ))}
                    </ol>
                    <button
                      className="secondary"
                      disabled={hintCount >= challenge.hints.length}
                      onClick={() => setHintCount(count => count + 1)}
                    >
                      {hintCount >= challenge.hints.length
                        ? "All hints revealed"
                        : `Reveal hint ${hintCount + 1}`}
                    </button>
                  </section>
                  {challenge.kind === "excel" || challenge.kind === "dax" ? (
                    <p className="notice">
                      This is a focused formula exercise supporting the
                      expression described above, not a full Excel or Power BI
                      runtime.
                    </p>
                  ) : null}
                </div>
              </details>
              <div className="practice-answer-panel">
                <div className="studio-editor-heading">
                  <span>
                    {challenge.kind === "python"
                      ? "solution.py"
                      : challenge.kind === "case"
                        ? "Your submission"
                        : "Your solution"}
                  </span>
                  <small>
                    {challenge.kind === "case"
                      ? "Self-reviewed evidence"
                      : "Checked against exercise requirements"}
                  </small>
                </div>
                {challenge.mission && (
                  <section
                    className="mission-checkpoints"
                    aria-label="Industry mission checkpoints"
                  >
                    <h3>Work through the reporting pipeline</h3>
                    <p>
                      Download the CSV to work in your own SQL, Python or
                      spreadsheet tool, or reconcile it manually. Check each
                      calculation, then explain your method below.
                    </p>
                    {missionSteps.map((step, index) => (
                      <div className="mission-step" key={step.key}>
                        <h4>{step.title}</h4>
                        <p>{step.task}</p>
                        <label>
                          Your numerical answer
                          <input
                            inputMode="decimal"
                            maxLength={30}
                            value={checkpoints[step.key] || ""}
                            onChange={e => {
                              setCheckpoints(current => ({
                                ...current,
                                [step.key]: e.target.value,
                              }));
                              setCheckedSteps(current =>
                                current.filter(key => key !== step.key)
                              );
                              setResult(null);
                            }}
                          />
                        </label>
                        <button
                          className="secondary"
                          onClick={() =>
                            setCheckedSteps(current => [
                              ...new Set([...current, step.key]),
                            ])
                          }
                        >
                          Check step {index + 1}
                        </button>
                        {checkedSteps.includes(step.key) && (
                          <p role="status">
                            {checkpointResults[index].passed
                              ? "Correct. Keep the calculation as evidence."
                              : `Not yet. ${step.hint}`}
                          </p>
                        )}
                      </div>
                    ))}
                    <small>
                      Checks are saved when you save your submission below.
                    </small>
                  </section>
                )}
                <label>
                  {challenge.kind === "case"
                    ? "Artifact links, method, validation and reflection"
                    : challenge.kind === "python"
                      ? "Python code — define solve(rows)"
                      : "Your answer"}
                  <textarea
                    disabled={running}
                    value={answer}
                    maxLength={4000}
                    spellCheck={false}
                    onChange={e => setAnswer(e.target.value)}
                    className="practice-editor"
                    placeholder={
                      challenge.kind === "case"
                        ? "Problem and decision\nArtifact URL or reproducible example\nValidation and edge case\nIndustry-specific limitation"
                        : ""
                    }
                  />
                </label>
                {challenge.kind === "case" && (
                  <fieldset>
                    <legend>Self-review checklist</legend>
                    {challenge.rubric.map(item => (
                      <label className="checkline" key={item}>
                        <input
                          type="checkbox"
                          checked={rubric.includes(item)}
                          onChange={e =>
                            setRubric(
                              e.target.checked
                                ? [...rubric, item]
                                : rubric.filter(x => x !== item)
                            )
                          }
                        />
                        {item}
                      </label>
                    ))}
                  </fieldset>
                )}
                <div className="button-row">
                  <button
                    className="primary"
                    disabled={running || !answer.trim()}
                    onClick={run}
                  >
                    {running
                      ? "Running… Python may need up to 45 seconds to load"
                      : challenge.kind === "case"
                        ? "Save submission and self-review"
                        : "Check my work"}
                  </button>
                  <button
                    className="secondary"
                    disabled={running}
                    onClick={() => {
                      setAnswer(challenge.starter);
                      setCheckpoints({});
                      setCheckedSteps([]);
                      setResult(null);
                    }}
                  >
                    Reset starter
                  </button>
                </div>
                {result && (
                  <div
                    className={`practice-feedback studio-feedback ${result.reviewOnly ? "review" : result.passed ? "passed" : "needs-work"}`}
                    role="status"
                  >
                    <h3>
                      {result.reviewOnly
                        ? "Submission saved"
                        : result.passed
                          ? "Passed"
                          : "Needs work"}
                    </h3>
                    <p>{result.message}</p>
                    {result.checks.length > 0 && (
                      <strong className="studio-check-count">
                        {result.checks.filter(check => check.passed).length} /{" "}
                        {result.checks.length} checks passed
                      </strong>
                    )}
                    {result.output !== undefined && (
                      <pre>Result: {result.output}</pre>
                    )}
                    <ul>
                      {result.checks.map(check => (
                        <li key={check.label}>
                          {check.passed ? "✓" : "×"} {check.label}
                        </li>
                      ))}
                    </ul>
                    {!result.passed && !result.reviewOnly && (
                      <button
                        className="text-button"
                        onClick={() => openLesson(challenge.topicId)}
                      >
                        Review the relevant lesson
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <details className="practice-history">
              <summary>Saved attempts and submission revisions</summary>
              {[...state.practiceAttempts]
                .reverse()
                .filter(a => a.key === practiceKey(state.profile, challenge.id))
                .map((attempt, i) => (
                  <article key={`${attempt.at}-${i}`}>
                    <p>
                      {new Date(attempt.at).toLocaleString()} ·{" "}
                      {attempt.reviewOnly
                        ? "Self-reviewed submission"
                        : attempt.passed
                          ? "Passed"
                          : "Needs work"}
                    </p>
                    <p>{attempt.feedback}</p>
                    <pre>{attempt.answer}</pre>
                    <button
                      className="text-button"
                      disabled={running}
                      onClick={() => {
                        setAnswer(attempt.answer);
                        setRubric(attempt.rubric);
                        setCheckpoints(attempt.checkpoints || {});
                        setCheckedSteps([]);
                        setResult(null);
                      }}
                    >
                      Restore this revision
                    </button>
                  </article>
                ))}
              <small>
                The latest 30 non-SQL attempts are retained. Pass records are
                separate for each career and industry. Self-review does not
                certify a skill.
              </small>
            </details>
          </section>
        )}
      </div>
    </section>
  );
}
