import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export type FirstLessonProgress = { step: number; completed: boolean };
export function FirstLesson({
  progress,
  save,
  next,
}: {
  progress?: FirstLessonProgress;
  save: (value: FirstLessonProgress) => void;
  next: () => void;
}) {
  const step = progress?.step ?? 0;
  const milestones = [
    {
      title: "Read the table",
      recap:
        "Each row is one order. Columns describe its ID, status and amount.",
    },
    {
      title: "Filter the records",
      recap:
        "Orders 101 and 103 are completed. The pending order does not belong in a completed-sales total.",
    },
    {
      title: "Calculate the total",
      recap: "The two eligible amounts are 120 and 60. Their sum is 180.",
    },
    {
      title: "Explain the result",
      recap:
        "A reliable answer names both the result and the rule: 180 from completed orders only.",
    },
  ];
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const advance = () => {
    save({ step: step + 1, completed: step === 3 });
    setAnswer("");
    setFeedback("");
  };
  return (
    <section className="first-lesson card" aria-label="Your first data lesson">
      <span className="eyebrow">
        START FROM ZERO · ABOUT 10–15 MINUTES · NO CODING NEEDED
      </span>
      <h2>
        {progress?.completed
          ? "You turned data into an answer."
          : "Your first investigation: what did the shop sell?"}
      </h2>
      <p>
        Data is recorded information. Working with data means using those
        records to answer a question and explaining how you checked your answer.
      </p>
      <ol
        className="first-lesson-milestones"
        aria-label="First lesson progress"
      >
        {milestones.map((milestone, index) => (
          <li
            key={milestone.title}
            className={
              index < step ? "finished" : index === step ? "current" : ""
            }
            aria-current={index === step ? "step" : undefined}
          >
            <span>{index < step ? <Check size={14} /> : index + 1}</span>
            <strong>{milestone.title}</strong>
            <small>
              {index < step
                ? "Completed"
                : index === step
                  ? "Continue here"
                  : "Coming next"}
            </small>
          </li>
        ))}
      </ol>
      {step > 0 && (
        <details className="first-lesson-recap">
          <summary>Quick recap of what you’ve learned</summary>
          <ul>
            {milestones.slice(0, step).map(milestone => (
              <li key={milestone.title}>
                <strong>{milestone.title}:</strong> {milestone.recap}
              </li>
            ))}
          </ul>
          <p>
            These are explanations of your completed steps. Opening the recap
            does not change your progress.
          </p>
        </details>
      )}
      {progress?.completed ? (
        <>
          <p>
            <Check size={16} /> You identified rows and columns, filtered
            completed orders, calculated $180, and explained why pending orders
            do not count.
          </p>
          <p>
            Your achievement is saved in your learning progress. It is a first
            exercise, not proof of career readiness.
          </p>
          <button className="primary" onClick={next}>
            Next: explore your learning path <ArrowRight size={16} />
          </button>
          <button
            className="text-button"
            onClick={() => {
              save({ step: 0, completed: false });
              setAnswer("");
              setFeedback("");
            }}
          >
            Practise again
          </button>
        </>
      ) : (
        <>
          <p className="soft-tag">
            Step {step + 1} of 4 ·{" "}
            {step > 0
              ? "Your completed steps are saved. Continue below."
              : "One small step at a time."}
          </p>
          <div className="lab-table-wrap">
            <table>
              <caption>Example shop orders · fictional data</caption>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>101</td>
                  <td>Completed</td>
                  <td>$120</td>
                </tr>
                <tr>
                  <td>102</td>
                  <td>Pending</td>
                  <td>$80</td>
                </tr>
                <tr>
                  <td>103</td>
                  <td>Completed</td>
                  <td>$60</td>
                </tr>
              </tbody>
            </table>
          </div>
          {step === 0 && (
            <>
              <h3>1. Read a small table</h3>
              <p>
                A <strong>row</strong> runs across and describes one order. A{" "}
                <strong>column</strong> runs down and holds one type of
                information, such as amount. An <strong>ID</strong> identifies a
                record. Here, order 101 has completed and its amount is $120.
              </p>
              <label>
                How many orders are recorded?{" "}
                <input
                  inputMode="numeric"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                />
              </label>
            </>
          )}
          {step === 1 && (
            <>
              <h3>2. Keep the rows that answer the question</h3>
              <p>
                A <strong>filter</strong> keeps records matching a rule. Our
                question is “What is the total amount of completed orders?”
                Pending means not completed yet, so order 102 must be left out.
              </p>
              <label>
                Which orders should we include?
                <select
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                >
                  <option value="">Choose orders</option>
                  <option value="all">101, 102 and 103</option>
                  <option value="completed">101 and 103</option>
                  <option value="pending">102 only</option>
                </select>
              </label>
            </>
          )}
          {step === 2 && (
            <>
              <h3>3. Add the eligible amounts</h3>
              <p>
                A <strong>total</strong> is a sum. We kept orders 101 and 103,
                so calculate 120 + 60. The pending $80 is excluded. You can use
                a calculator; this exercise is about choosing the right records.
              </p>
              <label>
                Completed order total, in dollars
                <input
                  inputMode="decimal"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                />
              </label>
            </>
          )}
          {step === 3 && (
            <>
              <h3>4. Explain and check the answer</h3>
              <p>
                Checking means confirming both the calculation and the rule. We
                included two completed orders and excluded one pending order.
                Adding all three would give $260, which answers a different
                question.
              </p>
              <label>
                Which explanation supports our report?
                <select
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                >
                  <option value="">Choose an explanation</option>
                  <option value="all">
                    $260, because every recorded order is a completed sale.
                  </option>
                  <option value="rule">
                    $180, because only orders 101 and 103 are completed.
                  </option>
                  <option value="largest">
                    $120, because the largest order represents the total.
                  </option>
                </select>
              </label>
            </>
          )}
          <button
            className="primary"
            onClick={() => {
              const correct =
                step === 0
                  ? answer.trim() === "3"
                  : step === 1
                    ? answer === "completed"
                    : step === 2
                      ? answer.trim() !== "" && Number(answer) === 180
                      : answer === "rule";
              if (correct) advance();
              else
                setFeedback(
                  [
                    "Count each order row beneath the headings. There are three orders.",
                    "Look at the Status column: 101 and 103 say Completed.",
                    "Add 120 and 60. Leave out the pending 80.",
                    "The explanation must name the completed orders and exclude the pending order.",
                  ][step]
                );
            }}
          >
            {step === 3
              ? "Check and save my achievement"
              : "Check and continue"}
          </button>
          <p role="status">{feedback}</p>
          <details>
            <summary>Words used in this lesson</summary>
            <p>
              Dataset: a collection of records. Row: one record. Column: one
              attribute. Filter: keep matching records. Total: add values.
              Validation: check that the answer follows the rule.
            </p>
          </details>
        </>
      )}
    </section>
  );
}
