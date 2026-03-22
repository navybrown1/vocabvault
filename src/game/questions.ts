import rawQuestions from './trivia_bank_300.json';
import type { Question, QuestionDifficulty } from './types';

interface BankQuestion {
  id: number;
  category: string;
  difficulty: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation?: string;
}

function isDifficulty(value: string): value is QuestionDifficulty {
  return value === 'easy' || value === 'medium' || value === 'hard';
}

export const QUESTION_POOL: Question[] = (rawQuestions as BankQuestion[]).map((item) => {
  if (!isDifficulty(item.difficulty)) {
    throw new Error(`Unsupported difficulty "${item.difficulty}" in trivia bank.`);
  }

  if (!Array.isArray(item.choices) || item.choices.length !== 4) {
    throw new Error(`Question ${item.id} does not provide exactly four choices.`);
  }

  if (!item.choices.includes(item.correctAnswer)) {
    throw new Error(`Question ${item.id} does not include the correct answer in its choices.`);
  }

  if (new Set(item.choices).size !== item.choices.length) {
    throw new Error(`Question ${item.id} contains duplicate choices.`);
  }

  return {
    id: `bank-${item.id}`,
    category: item.category,
    difficulty: item.difficulty,
    question: item.question,
    choices: item.choices,
    correctAnswer: item.correctAnswer,
    explanation: item.explanation,
  };
});

export const QUESTION_LOOKUP = Object.fromEntries(
  QUESTION_POOL.map((question) => [question.id, question]),
) as Record<string, Question>;
