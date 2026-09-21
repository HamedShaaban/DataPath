import { industryPractice, type Sector } from "./industry-practice";
export const industryMissions: Record<
  Sector,
  { title: string; brief: string; decision: string }
> = {
  banking: {
    title: "Reconcile a corrected payment batch",
    brief:
      "Operations received overlapping payment exports. Some payments were corrected after the first delivery. Prepare an August total for reconciliation.",
    decision:
      "Identify which exceptions need operations review without labelling a customer as fraudulent.",
  },
  finance: {
    title: "Reconcile portfolio settlement exports",
    brief:
      "Two settlement exports overlap and include corrected statuses. Establish an auditable August settled-value total.",
    decision:
      "Explain why settled cash flow alone cannot be interpreted as investment return.",
  },
  marketing: {
    title: "Audit an attributed conversion report",
    brief:
      "Campaign conversion exports include retries, corrections and incomplete values. Rebuild the August attributed-value total.",
    decision:
      "Recommend a data-quality fix and explain why attributed value is not incremental campaign lift.",
  },
  healthcare: {
    title: "Reconcile a clinic claims batch",
    brief:
      "Clinic claims exports overlap, contain late corrections and omit some values. Produce an August operational claims summary using synthetic data.",
    decision:
      "Prioritise operational exceptions without making clinical or patient-eligibility decisions.",
  },
  retail: {
    title: "Repair a month-end order summary",
    brief:
      "Store order exports include duplicate deliveries, cancelled orders and late corrections. Reconstruct August completed order value.",
    decision:
      "Explain what can be reported now and why this total is not profit or net revenue after returns.",
  },
  technology: {
    title: "Audit completed compute usage",
    brief:
      "Service job exports have been retried and corrected. Reconstruct August completed compute minutes before cost allocation.",
    decision:
      "Identify monitoring improvements and explain why compute minutes alone do not establish service reliability.",
  },
  telecom: {
    title: "Reconcile regional usage records",
    brief:
      "Network-session exports include duplicated and corrected records. Recover August completed traffic volume for an operational report.",
    decision:
      "Recommend a reconciliation control without equating traffic volume with network quality.",
  },
  government: {
    title: "Audit a public-service workload report",
    brief:
      "Office request exports overlap and contain late corrections. Reconstruct August completed processing minutes.",
    decision:
      "Explain the operational implications without using workload measures to rank citizens or determine eligibility.",
  },
  general: {
    title: "Repair a team activity report",
    brief:
      "Team activity exports overlap, with corrections and incomplete records. Produce an auditable August completed-work total.",
    decision:
      "Recommend a workflow improvement without treating the small sample as an individual performance ranking.",
  },
};
export function missionDataset(sector: Sector) {
  const c = industryPractice[sector];
  const definitions: [number, number | null, string, string, string][] = [
    [1, 120, "completed", "2026-08-02", "2026-08-03"],
    [2, 80, "pending", "2026-08-04", "2026-08-05"],
    [3, 200, "completed", "2026-08-06", "2026-08-07"],
    [4, null, "completed", "2026-08-08", "2026-08-09"],
    [5, 60, "completed", "2026-08-10", "2026-08-11"],
    [6, 0, "completed", "2026-08-12", "2026-08-13"],
    [7, -20, "completed", "2026-08-14", "2026-08-15"],
    [8, 500, "cancelled", "2026-08-16", "2026-08-17"],
    [9, 90, "completed", "2026-09-01", "2026-09-02"],
    [10, 150, "completed", "2026-08-20", "2026-08-21"],
    [11, 75, "completed", "2026-08-22", "2026-08-23"],
    [12, 45, "pending", "2026-08-24", "2026-08-25"],
    [1, 120, "completed", "2026-08-02", "2026-08-26"],
    [2, 85, "completed", "2026-08-04", "2026-08-27"],
    [3, 210, "completed", "2026-08-06", "2026-09-03"],
    [10, 150, "cancelled", "2026-08-20", "2026-09-04"],
  ];
  const scale = {
    banking: 10,
    finance: 20,
    marketing: 3,
    healthcare: 5,
    retail: 2,
    technology: 1,
    telecom: 4,
    government: 1,
    general: 1,
  }[sector];
  return definitions.map(
    ([id, value, status, event_date, received_at], index) => ({
      row_id: index + 1,
      id,
      entity: `${c.entity} ${String.fromCharCode(65 + (id % 3))}`,
      category: c.categories[id % 3],
      value: value === null ? null : value * scale,
      status,
      event_date,
      received_at,
    })
  );
}
export function missionExpected(sector: Sector) {
  const latest = new Map<number, ReturnType<typeof missionDataset>[number]>();
  for (const row of missionDataset(sector)) {
    const old = latest.get(row.id);
    if (
      !old ||
      row.received_at > old.received_at ||
      (row.received_at === old.received_at && row.row_id > old.row_id)
    )
      latest.set(row.id, row);
  }
  const eligible = [...latest.values()].filter(
    row =>
      row.event_date >= "2026-08-01" &&
      row.event_date <= "2026-08-31" &&
      row.status === "completed" &&
      row.value !== null &&
      row.value >= 0
  );
  return {
    unique: latest.size,
    eligible: eligible.length,
    total: eligible.reduce((sum, row) => sum + row.value!, 0),
  };
}
export const missionSteps = [
  {
    key: "unique",
    title: "1. Resolve duplicate deliveries",
    task: "Keep one row per id: choose the latest received_at, breaking a tie with the highest row_id. How many unique records remain, before any filtering?",
    hint: "An export row is not a unique business record. Include cancelled, pending and incomplete records at this stage.",
  },
  {
    key: "eligible",
    title: "2. Build the August reporting population",
    task: "After deduplication, keep event_date in August 2026, status completed and a known, non-negative value. Keep zero. Use all received corrections, including September deliveries. How many records qualify?",
    hint: "Filter after resolving corrections. A late delivery can revise an August event, while a September event is outside this report.",
  },
  {
    key: "total",
    title: "3. Reconcile the reported total",
    task: "Sum value only for the qualifying records from step 2. Enter the total without separators or a unit suffix.",
    hint: "A cancelled correction replaces the earlier completed record. Missing values are excluded rather than silently converted to zero.",
  },
] as const;
export function checkMission(answers: Record<string, string>, sector: Sector) {
  const expected = missionExpected(sector);
  return missionSteps.map(step => ({
    label: step.title,
    passed:
      /^\d+(\.\d+)?$/.test((answers[step.key] || "").trim()) &&
      Number(answers[step.key]) === expected[step.key],
  }));
}
