import { createHash } from "node:crypto";
import {
  cumulativeQuiz,
  levelQuiz,
  skillQuiz,
  topicQuiz,
  type QuizQuestion,
} from "../shared/learning";
import { skillById, skills } from "../shared/catalog";
import { executeServerSql } from "./proof-sql-runner";
import type { Sector } from "../shared/industry-practice";

export type QuizSubmission = {
  kind: "topic" | "level" | "skill" | "cumulative";
  targetId: string;
  answers: Record<string, number>;
  targetLevel?: number;
  cumulativeSkills?: string[];
  requiredLevels?: Record<string, number>;
};

export type ServerGrade = {
  passed: boolean;
  score: number;
  correct: number;
  total: number;
  weakTopics: string[];
};

function authoredQuestions(input: QuizSubmission): QuizQuestion[] {
  if (input.kind === "topic") {
    if (!skills.some(skill => skill.topics.some(topic => topic.id === input.targetId)))
      throw new Error("Unknown quiz target");
    return topicQuiz(input.targetId);
  }
  if (input.kind === "skill") {
    if (!skillById[input.targetId]) throw new Error("Unknown quiz target");
    return skillQuiz(input.targetId, input.targetLevel ?? 3);
  }
  if (input.kind === "level") {
    const match = /^(.*)-level-([1-3])$/.exec(input.targetId);
    if (!match || !skillById[match[1]]) throw new Error("Unknown quiz target");
    return levelQuiz(match[1], Number(match[2]));
  }
  const expectedTarget = `review-${(input.cumulativeSkills ?? []).join("+")}`;
  if (
    !input.cumulativeSkills?.length ||
    input.cumulativeSkills.length > 2 ||
    input.targetId !== expectedTarget ||
    input.cumulativeSkills.some(id => !skillById[id])
  )
    throw new Error("Unknown quiz target");
  return cumulativeQuiz(input.cumulativeSkills, input.requiredLevels ?? {});
}

export function gradeQuizSubmission(input: QuizSubmission): ServerGrade {
  const questions = authoredQuestions(input);
  const answerKeys = Object.keys(input.answers);
  const questionIds = questions.map(question => question.id);
  if (
    answerKeys.length !== questionIds.length ||
    answerKeys.some(id => !questionIds.includes(id))
  )
    throw new Error(
      "The submitted answer set does not match the authored quiz"
    );
  const wrong = questions.filter(
    question => input.answers[question.id] !== question.answer
  );
  const score = Math.round(
    ((questions.length - wrong.length) / questions.length) * 100
  );
  return {
    score,
    passed: score >= (input.kind === "skill" ? 95 : 80),
    correct: questions.length - wrong.length,
    total: questions.length,
    weakTopics: [...new Set(wrong.map(question => question.topicId))],
  };
}

export async function gradeSqlSubmission(input: {
  challengeId: string;
  query: string;
  sector: Sector;
}) {
  const result = await executeServerSql(input);
  return {
    passed: result.passed,
    executed: result.executed,
    checksPassed: result.checks.filter(check => check.passed).length,
    checksTotal: result.checks.length,
    checks: result.checks.map(check => ({
      label: check.label,
      passed: check.passed,
    })),
  };
}

export function evidenceHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export const authoredSkillIds = new Set(skills.map(skill => skill.id));
