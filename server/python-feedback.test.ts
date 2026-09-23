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
it('links failed edge-case categories to a concrete concept without revealing hidden answers', () => {
  expect(pythonOutputFeedback([1,1,1], [1,1,0], [true,true,false])).toContain('accumulator initialization');
  expect(pythonOutputFeedback([1,1,0,2], [1,1,0,0], [true,true,true,false])).toContain('None separately from zero');
  for (const [id,concept] of [['python-top-three','composite sort keys'],['python-category-totals','grouping keys']]) {
    expect(pythonOutputFeedback([],[],[true,true,true,true,false],id)).toContain(concept);
  }
});
