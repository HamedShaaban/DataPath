export function pythonErrorFeedback(error: string) {
  if (/IndentationError|TabError/.test(error))
    return "Check indentation: use consistent spaces inside solve(rows), loops and conditions. Avoid mixing tabs and spaces.";
  if (/SyntaxError/.test(error))
    return "Check the marked line for a missing colon, unmatched bracket or quote. Function definitions, loops and if statements need a colon.";
  if (/KeyError/.test(error))
    return "A dictionary key was not found. Compare the field name with the dataset headers; spelling and letter case must match.";
  if (/NameError/.test(error))
    return "A name has not been defined. Check spelling and define variables before using them. The required entry point is solve(rows).";
  if (/TypeError/.test(error))
    return "An operation received an unexpected type. Check for missing values before arithmetic and confirm whether you are working with a number, string, list or dictionary.";
  if (/ZeroDivisionError/.test(error))
    return "Check the denominator before dividing. Empty inputs or a filter with no matching records can produce zero; use the exercise's specified empty-case result.";
  if (/IndexError/.test(error))
    return "A list index is outside the available items. Check empty input and list length before selecting an item.";
  return "Read the last line of the error, then check the named operation using a small input. Define solve(rows) and return the requested result.";
}
export function pythonOutputFeedback(
  outputs: unknown[],
  expected: unknown[],
  checks: boolean[]
) {
  if (outputs.some(value => value === null))
    return "At least one call returned None. Use return inside solve(rows), not only print, and check that every relevant branch returns a result.";
  if (
    outputs.some(
      (value, index) =>
        typeof expected[index] === "number" && typeof value !== "number"
    )
  )
    return "This exercise expects a number. Return the numeric value, without quotes or descriptive text.";
  if (
    outputs.some(
      (value, index) => Array.isArray(expected[index]) && !Array.isArray(value)
    )
  )
    return "This exercise expects a list. Return a list of the requested values, including an empty list when the task requires it.";
  if (checks[0] && checks.some(passed => !passed))
    return "The displayed example passes, but another dataset does not. Check empty input, missing values and boundaries; calculate from rows instead of hard-coding an answer.";
  return "Your function ran, but the result differs. Check the eligibility rule, calculation and required output order against a small manual example.";
}
