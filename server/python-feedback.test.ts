import { expect, it } from "vitest";
import {
  pythonErrorFeedback,
  pythonOutputFeedback,
} from "../shared/python-feedback";
it("explains common runtime mistakes without executing learner text", () => {
  expect(pythonErrorFeedback("IndentationError")).toContain("indentation");
  expect(pythonErrorFeedback("KeyError: amount")).toContain("dataset headers");
  expect(pythonErrorFeedback("ZeroDivisionError")).toContain("denominator");
  expect(pythonErrorFeedback("NameError")).toContain("solve(rows)");
});
it("distinguishes missing returns, wrong types and generalisation failures", () => {
  expect(pythonOutputFeedback([null], [1], [false])).toContain(
    "not only print"
  );
  expect(pythonOutputFeedback(["1"], [1], [false])).toContain("without quotes");
  expect(pythonOutputFeedback([1], [[]], [false])).toContain("expects a list");
  expect(pythonOutputFeedback([1, 2], [1, 3], [true, false])).toContain(
    "hard-coding"
  );
});
