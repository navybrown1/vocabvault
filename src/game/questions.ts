import rawQuestions from './trivia_bank_300.json';
import rawQuestionsEs from './trivia_bank_es.json';
import type { Language, LocalizedQuestion, Question, QuestionDifficulty } from './types';

interface BankQuestion {
  id: number;
  category: string;
  difficulty: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation?: string;
}

interface LocalizedBankQuestion {
  id: number;
  category: string;
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

const QUESTION_LOOKUP_ES = Object.fromEntries(
  (rawQuestionsEs as LocalizedBankQuestion[]).map((question) => [`bank-${question.id}`, question]),
) as Record<string, LocalizedBankQuestion>;

export function getLocalizedQuestion(question: Question, choiceOrder: string[], language: Language): LocalizedQuestion {
  const localizedQuestion = language === 'es' ? QUESTION_LOOKUP_ES[question.id] : null;
  const choiceLookup = question.choices.reduce<Record<string, string>>((result, choice, index) => {
    result[choice] = localizedQuestion?.choices[index] ?? choice;
    return result;
  }, {});

  return {
    id: question.id,
    category: localizedQuestion?.category ?? question.category,
    question: localizedQuestion?.question ?? question.question,
    choices: choiceOrder.map((choice) => ({
      value: choice,
      label: choiceLookup[choice] ?? choice,
    })),
    correctAnswer: question.correctAnswer,
    correctAnswerLabel: choiceLookup[question.correctAnswer] ?? question.correctAnswer,
    difficulty: question.difficulty,
    explanation: localizedQuestion?.explanation || question.explanation,
  };
}

export function getLocalizedCategory(questionId: string, language: Language) {
  const question = QUESTION_LOOKUP[questionId];
  if (!question) {
    return '';
  }

  return language === 'es' ? QUESTION_LOOKUP_ES[questionId]?.category ?? question.category : question.category;
}

export function localizeAnswer(questionId: string, answer: string, language: Language) {
  if (language !== 'es') {
    return answer;
  }

  const question = QUESTION_LOOKUP[questionId];
  const localizedQuestion = QUESTION_LOOKUP_ES[questionId];
  if (!question || !localizedQuestion) {
    return answer;
  }

  const index = question.choices.indexOf(answer);
  if (index < 0) {
    return answer;
  }

  return localizedQuestion.choices[index] ?? answer;
}
