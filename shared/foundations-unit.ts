import { industryPractice, type Sector } from "./industry-practice";
export type FoundationAnswers = {
  count: string;
  total: string;
  average: string;
  explanation: string;
};
export const emptyFoundationAnswers: FoundationAnswers = {
  count: "",
  total: "",
  average: "",
  explanation: "",
};
export function foundationDataset(sector: Sector, independent = false) {
  const context = industryPractice[sector];
  const values = independent ? [90, 30, 500, 0, null] : [120, 60, 200, 0, null];
  return values.map((value, index) => ({
    id: index + 1,
    category: context.categories[index % context.categories.length],
    status: index === 2 ? "pending" : "completed",
    value,
  }));
}
export function foundationExpected(sector: Sector, independent = false) {
  const rows = foundationDataset(sector, independent).filter(
    row => row.status === "completed" && row.value !== null
  );
  const total = rows.reduce((sum, row) => sum + (row.value ?? 0), 0);
  return { count: rows.length, total, average: total / rows.length };
}
export function checkFoundation(
  sector: Sector,
  independent: boolean,
  answers: FoundationAnswers
) {
  const expected = foundationExpected(sector, independent);
  const numberMatches = (input: string, value: number) =>
    /^\d+(?:\.\d+)?$/.test(input.trim()) &&
    Math.abs(Number(input) - value) < 0.005;
  const checks = [
    {
      label: "Eligible record count",
      passed: numberMatches(answers.count, expected.count),
      hint: "Keep completed records with a known value. Zero is known; missing is not.",
    },
    {
      label: "Eligible total",
      passed: numberMatches(answers.total, expected.total),
      hint: "Add only the eligible values. Exclude pending records and missing values.",
    },
    {
      label: "Average of eligible values",
      passed: numberMatches(answers.average, expected.average),
      hint: "Divide the eligible total by the eligible count, including the valid zero.",
    },
    {
      label: "Explain the denominator",
      passed: answers.explanation === "known-completed",
      hint: "The average uses completed records with known values. Zero counts; missing and pending records do not.",
    },
  ];
  return { passed: checks.every(check => check.passed), checks };
}
