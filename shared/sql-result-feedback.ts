export function sqlResultFeedback(
  actualCount: number,
  expectedCount: number,
  columns: string[],
  expectedColumns: string[],
  valuesMatch: boolean,
  hiddenPassed: boolean
) {
  const feedback: string[] = [];
  if (
    actualCount > 0 &&
    (columns.length !== expectedColumns.length ||
      expectedColumns.some((column, index) => columns[index] !== column))
  ) {
    feedback.push(
      `Expected output columns, in order: ${expectedColumns.join(", ")}. Your output has: ${columns.join(", ")}. Check selected fields and aliases.`
    );
  }
  if (actualCount !== expectedCount)
    feedback.push(
      `On the visible dataset, expected ${expectedCount} row${expectedCount === 1 ? "" : "s"}; your query returned ${actualCount}. ${actualCount > expectedCount ? "Check filters, duplicate matches in joins, and grouping." : "Check whether filters or joins exclude records that should remain."}`
    );
  else if (!valuesMatch)
    feedback.push(
      "The visible row count matches, but values or ordering differ. Check calculations, NULL handling, aliases and the requested ORDER BY."
    );
  if (valuesMatch && !hiddenPassed)
    feedback.push(
      "The visible example matches, but an alternate dataset does not. Avoid hard-coded values; check boundaries, duplicate values and records without matches."
    );
  return feedback;
}
