import { industryMissions } from "./industry-challenge";
import { skills, skillById, sectorById } from "./catalog";
import { requirements, type Profile, type LearningState } from "./learning";
import {
  industryBrief,
  industryPractice,
  practiceDataset,
  type Sector,
} from "./industry-practice";
export type PracticeKind = "python" | "excel" | "dax" | "metric" | "case";
export type PracticeChallenge = {
  id: string;
  skillId: string;
  topicId: string;
  title: string;
  kind: PracticeKind;
  task: string;
  starter: string;
  hints: string[];
  rubric: string[];
  lesson: string;
  reference?: string;
  mission?: boolean;
};
const applied: Record<string, [string, string, string]> = {
  sql: [
    "Investigate duplicated totals",
    "Define the grain of both tables, reproduce a one-to-many join, and reconcile totals before and after the join.",
    "A join can duplicate measures when its keys are not unique. Count matches per key before aggregating.",
  ],
  python: [
    "Build a reproducible transformation",
    "Write a function with explicit inputs, outputs, one empty-input test and one invalid-value test.",
    "A pure function makes a transformation testable without relying on previous notebook state.",
  ],
  excel: [
    "Audit a workbook",
    "Build a typed input table, separate assumptions from formulas, and reconcile one summary to source rows.",
    "Structured tables and explicit references reduce range errors. Test what happens when a new row is added.",
  ],
  statistics: [
    "Audit sample bias",
    "Define the target population, explain who is missing from the sample and show how the omission could change the conclusion.",
    "A large sample can still be biased. The sampling process matters as much as the row count.",
  ],
  cleaning: [
    "Investigate missing values",
    "Separate unknown values from zero, propose a missing-value rule and quantify how it changes your summary.",
    "Replacing missing values with zero changes meaning. State the assumption and compare before/after totals.",
  ],
  powerbi: [
    "Build an operational dashboard",
    "Import the synthetic dataset, define its grain and build a summary with a clearly labelled metric and a detail view.",
    "Define the decision and metric before choosing visuals. Reconcile dashboard totals with the source.",
  ],
  tableau: [
    "Build a filtered dashboard",
    "Import the synthetic dataset, assign dimensions and measures, and demonstrate how a filter changes the summary.",
    "Dimensions define groups; measures quantify them. Validate a filtered view against its source rows.",
  ],
  storytelling: [
    "Write a decision brief",
    "Name the audience, show one supported finding, recommend an action and state a limitation.",
    "A useful finding connects a comparison to a decision. Avoid claiming causation from a descriptive chart.",
  ],
  business: [
    "Define acceptance criteria",
    "Identify a stakeholder decision, document scope and write three measurable acceptance criteria for a report.",
    "Acceptance criteria should be observable. Define the source, metric and expected handling of missing data.",
  ],
  experimentation: [
    "Design a controlled experiment",
    "Define a hypothesis, randomisation unit, primary outcome and guardrail. Explain how you will avoid selection bias.",
    "Random assignment balances groups in expectation. Choose the assignment unit before observing results.",
  ],
  modeling: [
    "Design entities and keys",
    "Draw entities and keys for the scenario, specify row grain and identify a one-to-many relationship.",
    "A primary key identifies one row. A foreign key links it to another entity; cardinality predicts join behaviour.",
  ],
  pipelines: [
    "Design a recoverable load",
    "Document extraction, transformation and loading, then show what happens after a partial failure and rerun.",
    "An idempotent load avoids duplicating output when it is repeated with the same input.",
  ],
  dbt: [
    "Define model quality tests",
    "Create a source-to-model outline and propose unique, not-null and relationship tests for its key fields.",
    "Schema tests encode assumptions; failing a test should point to a specific data contract violation.",
  ],
  cloud: [
    "Design least-privilege storage",
    "Sketch ingestion and storage boundaries, document access roles and explain a restore procedure.",
    "Separate read/write roles and define retention. A backup is only useful when restoration is tested.",
  ],
  spark: [
    "Plan a distributed aggregation",
    "Specify partition keys, identify potential skew and compare raw and aggregated row counts.",
    "A few hot keys can dominate a distributed stage. Inspect key frequency before changing partitions.",
  ],
  kafka: [
    "Handle late and duplicate events",
    "Specify an event key, event timestamp, deduplication window and policy for late arrivals.",
    "Event time and processing time differ. The late-arrival policy determines whether past results can change.",
  ],
  airflow: [
    "Design task dependencies",
    "Draw a task graph, define retry limits and make a failed upstream task block dependent publication.",
    "Retries must be safe. Separate retryable transport failures from invalid input that needs intervention.",
  ],
  engineering: [
    "Review a reproducible change",
    "Create a small repository with a README, a focused commit and a before/after validation note.",
    "A useful commit explains one coherent change. Keep secrets and generated data out of the repository.",
  ],
  database: [
    "Plan a database restore drill",
    "Define a recovery point and recovery time target, take a test backup, and document how you would verify a restored dataset.",
    "A successful backup command is not proof of recoverability. Restore into an isolated environment and reconcile row counts and constraints.",
  ],
  ml: [
    "Prevent target leakage",
    "Define prediction time, target, features and a train/test split. Identify one feature unavailable at prediction time.",
    "A feature that reveals a future outcome inflates evaluation. Split data to reflect deployment conditions.",
  ],
  deep: [
    "Design a baseline comparison",
    "Specify input representation, a simple baseline, train/validation split and an overfitting check.",
    "A complex model needs evidence of improvement over a simpler baseline on unseen data.",
  ],
  genai: [
    "Evaluate a grounded response",
    "Write a task prompt, specify approved source evidence and test unsupported claims and instruction injection.",
    "Grounding requires traceable evidence. Evaluate factual support and refusal when the source lacks an answer.",
  ],
  mlops: [
    "Plan model monitoring",
    "Define model/version metadata, one data-quality signal, one outcome metric and a rollback trigger.",
    "Monitoring should connect a measurable failure to an owner and an operational response.",
  ],
  governance: [
    "Assign data ownership",
    "Create a glossary entry, identify owner and steward, and define the approval path for changing a metric.",
    "Governance connects definitions, ownership and decision rights. Ambiguous ownership delays issue resolution.",
  ],
  quality: [
    "Write a data-quality contract",
    "Specify required fields, uniqueness, valid ranges and a reconciliation rule; describe what happens on failure.",
    "Quality rules need a business reason, threshold, owner and remediation route.",
  ],
  privacy: [
    "Minimise collected data",
    "List necessary fields, remove unnecessary identifiers and define access, retention and deletion rules.",
    "Collecting less reduces exposure. De-identification alone does not guarantee that re-identification is impossible.",
  ],
  product: [
    "Prioritise a data product",
    "Define the user problem, one measurable outcome, a minimum useful release and a trade-off.",
    "Prioritise a decision users need to make. A metric should measure the outcome, not merely clicks.",
  ],
  architecture: [
    "Review access boundaries",
    "Identify assets, threats, least-privilege roles and one audit check for an unauthorised-access scenario.",
    "Map which actor can perform which action on which data; test denials as well as allowed actions.",
  ],
};
export function practiceChallenges(profile: Profile): PracticeChallenge[] {
  const required = requirements(profile);
  const result: PracticeChallenge[] = [];
  for (const skillId of Object.keys(required)) {
    const skill = skillById[skillId];
    const template = applied[skillId];
    if (!template) throw new Error(`Missing authored practice for ${skillId}`);
    result.push({
      id: `case-${skillId}`,
      skillId,
      topicId:
        (
          {
            sql: "sql-3",
            python: "python-2",
            excel: "excel-1",
            business: "business-2",
            powerbi: "powerbi-1",
            modeling: "modeling-1",
            pipelines: "pipelines-3",
          } as Record<string, string>
        )[skillId] || skill.topics[0].id,
      title: template[0],
      kind: "case",
      task: `${template[1]} Use the ${sectorById[profile.sector].title} scenario: ${industryPractice[profile.sector].decision}. Address: ${industryPractice[profile.sector].risk}.`,
      starter: "",
      hints: [
        "Use the downloadable synthetic data or clearly identify another public source.",
        "Attach an artifact link and explain how someone can reproduce and check the result.",
      ],
      rubric: [
        "Problem and decision are explicit",
        "Artifact or reproducible example is included",
        "Validation includes an edge case",
        "Industry-specific risk and limitations are explained",
      ],
      lesson: template[2],
    });
  }
  const missionSkill =
    [
      "cleaning",
      "quality",
      "sql",
      "excel",
      "business",
      "governance",
      "python",
      "modeling",
      "product",
    ].find(id => required[id]) || Object.keys(required)[0];
  const mission = industryMissions[profile.sector];
  result.push({
    id: "industry-reconciliation",
    skillId: missionSkill,
    topicId: skillById[missionSkill].topics[0].id,
    kind: "case",
    mission: true,
    title: mission.title,
    task: `${sectorById[profile.sector].title}: ${mission.brief} Complete three checked calculation steps, then submit your method and recommendation. ${mission.decision}`,
    starter: "",
    hints: [
      "Inspect duplicate IDs before filtering statuses or dates.",
      "Keep a reconciliation from raw rows to unique records to eligible records.",
    ],
    rubric: [
      "Deduplication and correction rules are reproducible",
      "Population and total reconcile to the checked steps",
      "Artifact or reproducible calculations are included",
      "Recommendation addresses the industry limitation",
    ],
    lesson:
      "Reporting depends on both business event time and arrival time. Resolve overlapping deliveries first; then apply the reporting window and quality rules. Document every exclusion.",
  });
  const add = (c: PracticeChallenge) => {
    if (
      required[c.skillId] &&
      skillById[c.skillId].topics.find(topic => topic.id === c.topicId)!
        .level <= required[c.skillId]
    )
      result.push(c);
  };
  add({
    id: "python-category-totals", skillId: "python", topicId: "python-5", kind: "python",
    title: "Test a grouped industry summary",
    task: "Write solve(rows) returning a list of [category, total] pairs, sorted by category. Sum known values from completed records only. Keep groups with a zero total; exclude groups with no eligible records. Return [] for empty input. Categories are strings. Test missing values, negative adjustments and changing category names.",
    starter: "def solve(rows):\n    totals = {}\n    return []",
    reference: "def solve(rows):\n    totals = {}\n    for row in rows:\n        if row['status'] == 'completed' and row['value'] is not None:\n            key = row['category']\n            totals[key] = totals.get(key, 0) + row['value']\n    return [[key, totals[key]] for key in sorted(totals)]",
    hints: ["Filter status and None before creating a group.", "Accumulate values in a dictionary keyed by category.", "Sort category keys, not totals; preserve zero totals."],
    rubric: [], lesson: "Test a transformation with more than one group and with values that cancel. Group membership and output order are part of the contract.",
  });
  add({
    id: "python-top-three", skillId: "python", topicId: "python-7", kind: "python",
    title: "Build a compact top-three review queue",
    task: "Write solve(rows) returning up to three IDs for completed records with known values, ordered by value descending, then ID ascending for ties. IDs are unique integers. Include zero and negative values. Return [] when none qualify. Keep a candidate list of three records after each iteration instead of sorting the entire input. Checks verify output, not memory usage; explain the O(n) fixed-k scan in your notes.",
    starter: "def solve(rows):\n    candidates = []\n    return []",
    reference: "def solve(rows):\n    candidates = []\n    for row in rows:\n        if row['status'] != 'completed' or row['value'] is None:\n            continue\n        candidates.append(row)\n        candidates.sort(key=lambda r: (-r['value'], r['id']))\n        del candidates[3:]\n    return [r['id'] for r in candidates]",
    hints: ["Discard pending records and None, not zero.", "A composite key (-value, id) gives descending values with ascending ID ties.", "After each insertion, remove candidates beyond position three; the candidate buffer is bounded by four during insertion."],
    rubric: [], lesson: "For a fixed k, maintaining a small candidate buffer uses O(k) extra space and O(n) time. These checks validate answers; use profiling to substantiate memory claims.",
  });
  add({
    id: "python-stream-summary", skillId: "python", topicId: "python-10", kind: "python",
    title: "Summarise a one-pass data stream",
    task: "Write solve(rows) for a one-pass iterable of dictionaries, not a list. Return [count, total, minimum, maximum] for completed records with a known value. Ignore pending records and None, but include zero and negative values. If none qualify return [0, 0, None, None]. Consume rows only once; use running accumulators instead of materializing the stream. Automated checks verify results and one-pass compatibility, not peak memory usage.",
    starter: "def solve(rows):\n    # Track count, total and bounds in one pass.\n    return [0, 0, None, None]",
    reference: "def solve(rows):\n    count, total, low, high = 0, 0, None, None\n    for row in rows:\n        value = row['value']\n        if row['status'] != 'completed' or value is None:\n            continue\n        count += 1\n        total += value\n        low = value if low is None else min(low, value)\n        high = value if high is None else max(high, value)\n    return [count, total, low, high]",
    hints: ["Do not call len(rows), index rows, or traverse it again.", "Initialize bounds with None; zero is not a safe minimum for positive-only data.", "Update every accumulator within the same eligible-record branch."],
    rubric: [], lesson: "A one-pass source cannot be rewound. Count, total and bounds can be calculated together without retaining all records.",
  });
  add({
    id: "python-total",
    skillId: "python",
    topicId: "python-2",
    kind: "python",
    title: "Summarise completed work in Python",
    task: "Write solve(rows) returning the sum of non-missing value fields for completed records. Return 0 for an empty list. rows is a list of dictionaries.",
    starter:
      "def solve(rows):\n    # Include completed records with a known value.\n    return 0",
    reference:
      "def solve(rows):\n    return sum(r['value'] for r in rows if r['status'] == 'completed' and r['value'] is not None)",
    hints: [
      "Check status and missing values before adding.",
      "Use a loop or generator expression; do not hard-code the total.",
    ],
    rubric: [],
    lesson:
      "A function receives data through its parameters. Filter records before aggregation, and distinguish None from a genuine zero.",
  });
  add({
    id: "python-clean",
    skillId: "cleaning",
    topicId: "cleaning-1",
    kind: "python",
    title: "Handle missing values without inventing data",
    task: "Write solve(rows) returning a list of IDs whose value is missing (None), sorted ascending. Do not classify 0 as missing.",
    starter: "def solve(rows):\n    return []",
    reference:
      "def solve(rows):\n    return sorted(r['id'] for r in rows if r['value'] is None)",
    hints: [
      "Use is None, not if not value.",
      "Return the record IDs rather than the rows themselves.",
    ],
    rubric: [],
    lesson:
      "A zero is an observed value; None is absence of a value. Keep the distinction when cleaning data so summaries remain meaningful.",
  });
  add({
    id: "python-debug",
    skillId: "python",
    topicId: "python-5",
    kind: "python",
    title: "Debug an average with missing values",
    task: "Fix solve(rows) so it returns the average of known values from completed records. Return 0 if none qualify.",
    starter:
      "def solve(rows):\n    values = [r['value'] for r in rows]\n    return sum(values) / len(rows)",
    reference:
      "def solve(rows):\n    values = [r['value'] for r in rows if r['status'] == 'completed' and r['value'] is not None]\n    return sum(values) / len(values) if values else 0",
    hints: [
      "The numerator and denominator must describe the same population.",
      "Handle an empty filtered list before division.",
    ],
    rubric: [],
    lesson:
      "Test the normal case, empty inputs and missing values. The denominator must count the observations included in the numerator.",
  });
  add({
    id: "excel-total",
    skillId: "excel",
    topicId: "excel-2",
    kind: "excel",
    title: "Build a conditional spreadsheet total",
    task: 'Calculate the total value of completed records with SUMIF. Column D holds values in D2:D6; E2:E6 holds statuses. Blank values are ignored. Supported form: =SUMIF(criteria_range,"status",sum_range).',
    starter: '=SUMIF(E2:E6,"pending",D2:D6)',
    reference: '=SUMIF(E2:E6,"completed",D2:D6)',
    hints: [
      "The criteria range must reference statuses, not values.",
      "Both ranges must have the same number of rows.",
    ],
    rubric: [],
    lesson:
      "SUMIF applies a condition to one range and sums corresponding cells in another. Misaligned ranges can produce plausible but incorrect totals.",
  });
  add({
    id: "dax-total",
    skillId: "powerbi",
    topicId: "powerbi-4",
    kind: "dax",
    title: "Define a filtered DAX measure",
    task: "Create a measure that sums Events[value] only where Events[status] is completed. Use CALCULATE with SUM and a status equality filter. This focused exercise supports that form; it is not a full Power BI engine.",
    starter: 'CALCULATE(SUM(Events[value]), Events[status] = "pending")',
    reference: 'CALCULATE(SUM(Events[value]), Events[status] = "completed")',
    hints: [
      "SUM defines the aggregation; CALCULATE applies the filter.",
      "Use a measure for totals that should respond to report context.",
    ],
    rubric: [],
    lesson:
      "CALCULATE evaluates an expression in a modified filter context. Test a measure against a small set of rows before using it in a report.",
  });
  for (const skillId of [
    "statistics",
    "experimentation",
    "business",
    "product",
  ])
    add({
      id: `metric-${skillId}`,
      skillId,
      topicId: `${skillId}-${skillId === "business" ? 3 : 1}`,
      kind: "metric",
      title: "Calculate and interpret a completion rate",
      task: "What percentage of all records has status completed? Count every record, even when value is missing. Enter a percentage from 0 to 100, rounded to one decimal if needed.",
      starter: "",
      reference: "80",
      hints: [
        "The numerator counts completed records. The denominator counts all records.",
        "Missing monetary or operational values do not change status.",
      ],
      rubric: [],
      lesson:
        "Define numerator, denominator and exclusions before calculating a rate. A completion rate does not describe value, profitability or causal impact.",
    });
  for (const skillId of ["sql", "python"]) {
    if (required[skillId] !== 3) continue;
    const sql = skillId === "sql";
    result.push({
      id: `advanced-${skillId}-10`, skillId, topicId: `${skillId}-10`, kind: "case",
      title: sql ? "Audit a recursive hierarchy" : "Build a bounded-memory pipeline",
      task: `${sectorById[profile.sector].title}: ${sql ? "Model a synthetic organizational hierarchy. Write a recursive query, include a cycle case, and demonstrate termination and correct depth." : "Process synthetic records with a generator. Validate totals, empty input, invalid rows and a second iteration. Explain which operations retain data in memory."} Use no private customer data.`,
      starter: "", hints: [sql ? "Track visited identifiers and stop when an identifier repeats." : "Consume each record once; do not materialize the whole input."],
      rubric: ["Reproducible example included", "Edge case tested", "Result reconciled", "Limitations explained"],
      lesson: "This submission is self-reviewed. Include code and observed results; completion is not independent verification.",
    });
  }
  return result;
}
export type PracticeResult = {
  passed: boolean;
  message: string;
  checks: { label: string; passed: boolean }[];
  output?: string;
  reviewOnly?: boolean;
};
export function evaluatePractice(
  challenge: PracticeChallenge,
  answer: string,
  sector: Sector
): PracticeResult {
  if (challenge.kind === "python")
    return {
      passed: false,
      message: "Run this exercise with the Python runtime.",
      checks: [],
    };
  const rows = practiceDataset(sector);
  const check = (label: string, passed: boolean) => ({ label, passed });
  if (challenge.kind === "case")
    return {
      passed: false,
      reviewOnly: true,
      message:
        "Saved for self-review. A rubric checklist is not independent expert verification.",
      checks: [],
    };
  if (challenge.kind === "metric") {
    const expected =
      (rows.filter(r => r.status === "completed").length / rows.length) * 100;
    const valid = /^\s*\d+(\.\d+)?\s*%?\s*$/.test(answer);
    const passed =
      valid && Math.abs(Number(answer.replace("%", "")) - expected) <= 0.05;
    return {
      passed,
      message: passed
        ? "Correct: the denominator includes records with missing values."
        : "Count completed statuses, divide by all rows, then multiply by 100.",
      checks: [check("Correct numerator and denominator", passed)],
    };
  }
  // Deliberately narrow parsers; never execute an arbitrary spreadsheet expression.
  const formula =
    challenge.kind === "excel"
      ? /^\s*=SUMIF\(\s*E2:E6\s*,\s*"(completed|pending)"\s*,\s*D2:D6\s*\)\s*$/i
      : /^\s*CALCULATE\(\s*SUM\(\s*Events\[value\]\s*\)\s*,\s*Events\[status\]\s*=\s*"(completed|pending)"\s*\)\s*$/i;
  const match = answer.match(formula);
  const checks = [
    check("Supported formula and correct references", !!match),
    check(
      "Filters completed records",
      match?.[1]?.toLowerCase() === "completed"
    ),
  ];
  const passed = checks.every(c => c.passed);
  const output = match
    ? rows
        .filter(row => row.status === match[1].toLowerCase())
        .reduce((sum, row) => sum + (row.value ?? 0), 0)
    : null;
  return {
    passed,
    checks,
    message: passed
      ? "The formula uses the correct fields and completion filter."
      : "Check the supported formula shape, ranges/fields and status filter shown in the task.",
    output: output === null ? undefined : String(output),
  };
}
export function practiceKey(profile: Profile, id: string) {
  return `${profile.learningMode === "skill" ? `skill-${profile.focusSkill}` : profile.role}:${profile.sector}:${id}`;
}
export function recordPractice(
  state: LearningState,
  challenge: PracticeChallenge,
  answer: string,
  result: PracticeResult,
  rubric: string[] = [],
  checkpoints: Record<string, string> = {}
): LearningState {
  const key = practiceKey(state.profile, challenge.id);
  return {
    ...state,
    practiceAttempts: [
      ...state.practiceAttempts,
      {
        key,
        challengeId: challenge.id,
        topicId: challenge.topicId,
        kind: challenge.kind,
        answer: answer.slice(0, 4000),
        passed: result.passed,
        reviewOnly: !!result.reviewOnly,
        feedback: result.message.slice(0, 500),
        rubric,
        checkpoints,
        at: new Date().toISOString(),
      },
    ].slice(-30),
    reviewTopics:
      !result.passed && !result.reviewOnly && result.checks.length > 0
        ? [...new Set([...state.reviewTopics, challenge.topicId])]
        : state.reviewTopics,
    completedPracticeIds: result.passed
      ? [...new Set([...state.completedPracticeIds, key])].slice(-300)
      : state.completedPracticeIds,
    evidence: result.passed
      ? {
          ...state.evidence,
          [challenge.topicId]:
            state.evidence[challenge.topicId] ||
            `Practice completed: ${challenge.title} (${sectorById[state.profile.sector].title}).\n${answer.slice(0, 700)}`,
        }
      : state.evidence,
  };
}
export { industryBrief, practiceDataset };
