import { describe, expect, it } from "vitest";
import {
  newState,
  learningStateSchema,
  topicQuiz,
  levelQuiz,
  type LearningState,
} from "../shared/learning";
import { recordQuizResult } from "../shared/quiz-progress";
import { sqlChallengeForTopic } from "../shared/practice-navigation";
import { sqlLabChallenges } from "../shared/sql-lab";
import {
  readGuestStorage,
  writeGuestStorage,
  guestStorageKey,
} from "../client/src/lib/guest-storage";
const at = "2026-09-21T12:00:00.000Z";
const memory = () => {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
};
const correct = (questions: ReturnType<typeof topicQuiz>) =>
  Object.fromEntries(questions.map(question => [question.id, question.answer]));
describe("Quality pass: guest persistence and review recovery", () => {
  it("round-trips onboarding, guided progress, evidence and quiz outcomes", () => {
    const storage = memory();
    const state = newState();
    state.onboarded = true;
    state.firstLesson = { step: 4, completed: true };
    state.evidence["sql-1"] = "checked sample";
    const checked = recordQuizResult(
      state,
      "topic",
      "sql-1",
      topicQuiz("sql-1"),
      correct(topicQuiz("sql-1")),
      "attempt",
      at
    );
    writeGuestStorage(storage, checked);
    expect(readGuestStorage(storage)).toEqual(
      learningStateSchema.parse(checked)
    );
  });
  it("preserves corrupt saves before replacing and never overwrites earlier recovery copies", () => {
    const storage = memory();
    storage.setItem(guestStorageKey, "broken original");
    storage.setItem(`${guestStorageKey}.recovery`, "older backup");
    expect(writeGuestStorage(storage, newState()).recovered).toBe(true);
    expect(storage.getItem(`${guestStorageKey}.recovery`)).toBe("older backup");
    expect(storage.getItem(`${guestStorageKey}.recovery.1`)).toBe(
      "broken original"
    );
  });
  it("leaves the original untouched if a recovery backup cannot be saved", () => {
    const storage = memory();
    storage.setItem(guestStorageKey, "original");
    expect(() =>
      writeGuestStorage(
        {
          ...storage,
          setItem: () => {
            throw Error("quota");
          },
        },
        newState()
      )
    ).toThrow("quota");
    expect(storage.getItem(guestStorageKey)).toBe("original");
  });
  it("removes recovered topics without losing unrelated reviews or automatically marking lessons complete", () => {
    const state = newState();
    state.reviewTopics = ["sql-1", "sql-2"];
    const questions = topicQuiz("sql-1");
    const next = recordQuizResult(
      state,
      "topic",
      "sql-1",
      questions,
      correct(questions),
      "pass",
      at
    );
    expect(next.reviewTopics).toEqual(["sql-2"]);
    expect(next.completed).toEqual([]);
    expect(state.reviewTopics).toHaveLength(2);
  });
  it("retains errors even when the overall score passes and invalidates stale skill status", () => {
    const state = newState();
    state.certifiedSkills = ["sql"];
    state.completed = ["sql-1", "sql-2", "sql-3"];
    const questions = levelQuiz("sql", 1);
    const answers = correct(questions);
    answers[questions[0].id] =
      (questions[0].answer + 1) % questions[0].options.length;
    const next = recordQuizResult(
      state,
      "level",
      "sql-level-1",
      questions,
      answers,
      "partial",
      at
    );
    expect(next.quizAttempts.at(-1)?.passed).toBe(true);
    expect(next.reviewTopics).toContain(questions[0].topicId);
    expect(next.completed).not.toContain(questions[0].topicId);
    expect(next.certifiedSkills).not.toContain("sql");
  });
  it("routes SQL lessons to a matching exercise instead of a previous selection", () => {
    const state = newState();
    for (const topic of ["sql-1", "sql-2", "sql-3"]) {
      const id = sqlChallengeForTopic(state.profile, topic);
      expect(sqlLabChallenges.find(c => c.id === id)?.topicId).toBe(topic);
    }
    expect(sqlChallengeForTopic(state.profile, "sql-9")).toBe("");
    expect(sqlChallengeForTopic(state.profile, "python-1")).toBe("");
  });
});

import { practiceChallenges, recordPractice } from "../shared/practice";
it("queues checked practice failures but not self-reviewed cases or runtime startup errors", () => {
  const state = newState();
  const challenge = practiceChallenges(state.profile).find(
    item => item.kind !== "case"
  )!;
  const failure = {
    passed: false,
    message: "Wrong result",
    checks: [{ label: "result", passed: false }],
  };
  expect(
    recordPractice(state, challenge, "answer", failure).reviewTopics
  ).toContain(challenge.topicId);
  expect(
    recordPractice(state, challenge, "answer", { ...failure, checks: [] })
      .reviewTopics
  ).toEqual([]);
  expect(
    recordPractice(state, challenge, "answer", { ...failure, reviewOnly: true })
      .reviewTopics
  ).toEqual([]);
});

import { executeSqlChallenge } from "../shared/sql-engine";
import { recordLabAttempt } from "../shared/sql-progress";
import { reviewSchedule } from "../shared/review-schedule";
it("walks onboarding → real SQL practice → failed quiz → recovery → saved reload", async () => {
  let state = newState();
  state.profile.sector = "banking";
  state.profile.hoursPerWeek = 3;
  state.onboarded = true;
  state.firstLesson = { step: 4, completed: true };
  const exercise = sqlLabChallenges.find(item => item.topicId === "sql-1")!;
  const result = await executeSqlChallenge(
    exercise.id,
    exercise.referenceSql,
    "banking"
  );
  expect(result.passed).toBe(true);
  state = recordLabAttempt(
    state,
    exercise.id,
    exercise.referenceSql,
    result,
    at
  );
  const questions = topicQuiz("sql-1");
  state = recordQuizResult(
    state,
    "topic",
    "sql-1",
    questions,
    {},
    "failed",
    at
  );
  expect(state.reviewTopics).toContain("sql-1");
  state = recordQuizResult(
    state,
    "topic",
    "sql-1",
    questions,
    correct(questions),
    "recovered",
    at
  );
  expect(state.reviewTopics).not.toContain("sql-1");
  expect(state.evidence["sql-1"]).toContain("Passed DataPath SQL lab");
  const storage = memory();
  writeGuestStorage(storage, state);
  const restored = readGuestStorage(storage);
  expect(restored).toEqual(state);
  expect(restored.firstLesson?.completed).toBe(true);
  expect(
    reviewSchedule(restored.quizAttempts, "review-sql+excel", Date.parse(at))
      .due
  ).toBe(true);
});
