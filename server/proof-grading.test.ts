import { describe, expect, it } from "vitest";
import { skillQuiz, topicQuiz } from "../shared/learning";
import { sqlLabChallenges } from "../shared/sql-lab";
import { gradeQuizSubmission, gradeSqlSubmission } from "./proof-grading";

const answersFor = (questions: ReturnType<typeof topicQuiz>) =>
  Object.fromEntries(questions.map(question => [question.id, question.answer]));

describe("server-side proof grading", () => {
  it("ignores a forged SQL pass and reruns the submitted query", async () => {
    const result = await gradeSqlSubmission({
      challengeId: "sql-select-filter",
      query: "SELECT transaction_id, amount FROM transactions",
      sector: "banking",
    });
    expect(result.passed).toBe(false);
  });

  it("accepts a SQL solution only after server execution", async () => {
    const challenge = sqlLabChallenges.find(
      item => item.id === "sql-select-filter"
    )!;
    await expect(
      gradeSqlSubmission({
        challengeId: challenge.id,
        query: challenge.referenceSql,
        sector: "banking",
      })
    ).resolves.toMatchObject({ passed: true, executed: true });
  });

  it("computes quiz results from the authored answer key", () => {
    const questions = skillQuiz("sql", 1);
    const answers = answersFor(questions);
    answers[questions[0].id] =
      (questions[0].answer + 1) % questions[0].options.length;
    expect(
      gradeQuizSubmission({
        kind: "skill",
        targetId: "sql",
        targetLevel: 1,
        answers,
      })
    ).toMatchObject({ score: 95, passed: true });
    answers[questions[1].id] =
      (questions[1].answer + 1) % questions[1].options.length;
    expect(
      gradeQuizSubmission({
        kind: "skill",
        targetId: "sql",
        targetLevel: 1,
        answers,
      })
    ).toMatchObject({ score: 90, passed: false });
  });

  it("rejects a client-selected subset even when every submitted answer is correct", () => {
    const questions = topicQuiz("sql-1");
    const answers = answersFor(questions);
    delete answers[questions[0].id];
    expect(() =>
      gradeQuizSubmission({ kind: "topic", targetId: "sql-1", answers })
    ).toThrow(/authored quiz/);
  });
});


it("rejects unknown SQL challenges before starting a worker", async () => {
  await expect(gradeSqlSubmission({ challengeId: "missing", query: "SELECT 1", sector: "banking" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
});
it("bounds concurrent SQL work without an unbounded queue", async () => {
  const input = { challengeId: "sql-select-filter", query: sqlLabChallenges[0].referenceSql, sector: "banking" as const };
  const first = gradeSqlSubmission(input);
  await expect(gradeSqlSubmission(input)).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  await first;
  await expect(gradeSqlSubmission(input)).resolves.toMatchObject({ executed: true });
});
