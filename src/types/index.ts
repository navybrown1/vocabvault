export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'interjection';
export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5; // 0=new, 5=mastered
export type QuizType = 'multiple-choice' | 'fill-blank' | 'matching' | 'context';
export type GoalType = 'professional' | 'academic' | 'test-prep' | 'everyday';

export interface VocabWord {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: PartOfSpeech;
  simpleDefinition: string;
  advancedDefinition: string;
  exampleSentence: string;
  synonyms: string[];
  antonyms: string[];
  etymology: string;
  difficulty: Difficulty;
  memoryTip: string;
  confusedWith?: { word: string; explanation: string }[];
  category: string;
}

export interface WordProgress {
  wordId: string;
  masteryLevel: MasteryLevel;
  timesCorrect: number;
  timesIncorrect: number;
  lastReviewed: string | null; // ISO date
  nextReview: string | null; // ISO date — spaced repetition
  isFavorite: boolean;
  isLearned: boolean;
  customLists: string[];
  streak: number; // consecutive correct
}

export interface QuizQuestion {
  type: QuizType;
  wordId: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  hint?: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  goal: GoalType;
  dailyWordGoal: number;
  level: number;
  xp: number;
  totalWordsLearned: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  joinDate: string;
  badges: Badge[];
  onboardingComplete: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

export interface DailyStats {
  date: string;
  wordsLearned: number;
  quizzesTaken: number;
  correctAnswers: number;
  totalAnswers: number;
  xpEarned: number;
  reviewsDone: number;
}

export interface AppState {
  user: UserProfile;
  wordProgress: Record<string, WordProgress>;
  dailyStats: Record<string, DailyStats>;
  customLists: Record<string, string[]>; // listName -> wordIds
  darkMode: boolean;
  searchQuery: string;
}
