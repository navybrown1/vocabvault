import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, UserProfile, WordProgress, DailyStats, GoalType, MasteryLevel, Badge } from '../types';
import { vocabularyData } from '../data/vocabulary';
import { calculateNextReview, calculateXP, getLevelFromXP } from '../utils/spacedRepetition';
import { checkBadgeEligibility, ALL_BADGES } from '../utils/badges';

const today = () => new Date().toISOString().split('T')[0];

const defaultUser: UserProfile = {
  name: 'Learner',
  avatar: '🧠',
  goal: 'everyday',
  dailyWordGoal: 5,
  level: 1,
  xp: 0,
  totalWordsLearned: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  joinDate: today(),
  badges: ALL_BADGES.map(b => ({ ...b })),
  onboardingComplete: false,
};

const defaultState: AppState = {
  user: defaultUser,
  wordProgress: {},
  dailyStats: {},
  customLists: {},
  darkMode: false,
  searchQuery: '',
};

type Action =
  | { type: 'COMPLETE_ONBOARDING'; payload: { name: string; goal: GoalType; dailyGoal: number } }
  | { type: 'MARK_WORD_LEARNED'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'RECORD_QUIZ_ANSWER'; payload: { wordId: string; correct: boolean } }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'ADD_TO_LIST'; payload: { wordId: string; listName: string } }
  | { type: 'CREATE_LIST'; payload: string }
  | { type: 'REMOVE_FROM_LIST'; payload: { wordId: string; listName: string } }
  | { type: 'UPDATE_DAILY_GOAL'; payload: number }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'RESET_PROGRESS' };

function updateDailyStats(
  stats: Record<string, DailyStats>,
  updates: Partial<DailyStats>
): Record<string, DailyStats> {
  const key = today();
  const current = stats[key] || {
    date: key,
    wordsLearned: 0,
    quizzesTaken: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    xpEarned: 0,
    reviewsDone: 0,
  };
  return {
    ...stats,
    [key]: {
      ...current,
      ...Object.fromEntries(
        Object.entries(updates).map(([k, v]) => [k, (current[k as keyof DailyStats] as number || 0) + (v as number)])
      ),
    } as DailyStats,
  };
}

function updateStreak(user: UserProfile): UserProfile {
  const todayStr = today();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = user.currentStreak;
  if (user.lastActiveDate === todayStr) {
    // Already active today
    return user;
  } else if (user.lastActiveDate === yesterdayStr) {
    newStreak += 1;
  } else if (user.lastActiveDate === '') {
    newStreak = 1;
  } else {
    newStreak = 1; // streak broken
  }

  return {
    ...user,
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, user.longestStreak),
    lastActiveDate: todayStr,
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        user: {
          ...state.user,
          name: action.payload.name,
          goal: action.payload.goal,
          dailyWordGoal: action.payload.dailyGoal,
          onboardingComplete: true,
          lastActiveDate: today(),
          currentStreak: 1,
        },
      };

    case 'MARK_WORD_LEARNED': {
      const wordId = action.payload;
      const existing = state.wordProgress[wordId];
      const now = new Date().toISOString();
      const isNew = !existing || !existing.isLearned;

      const newProgress: WordProgress = {
        wordId,
        masteryLevel: existing?.masteryLevel || 1 as MasteryLevel,
        timesCorrect: existing?.timesCorrect || 0,
        timesIncorrect: existing?.timesIncorrect || 0,
        lastReviewed: now,
        nextReview: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        isFavorite: existing?.isFavorite || false,
        isLearned: true,
        customLists: existing?.customLists || [],
        streak: existing?.streak || 0,
      };

      const updatedUser = updateStreak({
        ...state.user,
        totalWordsLearned: state.user.totalWordsLearned + (isNew ? 1 : 0),
        xp: state.user.xp + (isNew ? 15 : 0),
      });
      updatedUser.level = getLevelFromXP(updatedUser.xp);

      const newWordProgress = { ...state.wordProgress, [wordId]: newProgress };
      const newBadges = checkBadgeEligibility(updatedUser, newWordProgress);

      return {
        ...state,
        wordProgress: newWordProgress,
        user: {
          ...updatedUser,
          badges: updatedUser.badges.map(b => {
            const earned = newBadges.find(nb => nb.id === b.id);
            return earned || b;
          }),
        },
        dailyStats: isNew
          ? updateDailyStats(state.dailyStats, { wordsLearned: 1, xpEarned: 15 })
          : state.dailyStats,
      };
    }

    case 'TOGGLE_FAVORITE': {
      const wordId = action.payload;
      const existing = state.wordProgress[wordId] || {
        wordId,
        masteryLevel: 0 as MasteryLevel,
        timesCorrect: 0,
        timesIncorrect: 0,
        lastReviewed: null,
        nextReview: null,
        isFavorite: false,
        isLearned: false,
        customLists: [],
        streak: 0,
      };
      return {
        ...state,
        wordProgress: {
          ...state.wordProgress,
          [wordId]: { ...existing, isFavorite: !existing.isFavorite },
        },
      };
    }

    case 'RECORD_QUIZ_ANSWER': {
      const { wordId, correct } = action.payload;
      const existing = state.wordProgress[wordId] || {
        wordId,
        masteryLevel: 1 as MasteryLevel,
        timesCorrect: 0,
        timesIncorrect: 0,
        lastReviewed: null,
        nextReview: null,
        isFavorite: false,
        isLearned: true,
        customLists: [],
        streak: 0,
      };

      const isReview = existing.isLearned;
      const updated = calculateNextReview(existing, correct);
      const xpGained = calculateXP(correct, existing.masteryLevel, isReview);

      const updatedUser = updateStreak({
        ...state.user,
        xp: state.user.xp + xpGained,
      });
      updatedUser.level = getLevelFromXP(updatedUser.xp);

      const newWordProgress = { ...state.wordProgress, [wordId]: { ...updated, isLearned: true } };
      const newBadges = checkBadgeEligibility(updatedUser, newWordProgress);

      return {
        ...state,
        wordProgress: newWordProgress,
        user: {
          ...updatedUser,
          badges: updatedUser.badges.map(b => {
            const earned = newBadges.find(nb => nb.id === b.id);
            return earned || b;
          }),
        },
        dailyStats: updateDailyStats(state.dailyStats, {
          totalAnswers: 1,
          correctAnswers: correct ? 1 : 0,
          xpEarned: xpGained,
          reviewsDone: isReview ? 1 : 0,
        }),
      };
    }

    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'ADD_TO_LIST': {
      const { wordId, listName } = action.payload;
      const list = state.customLists[listName] || [];
      if (list.includes(wordId)) return state;
      return {
        ...state,
        customLists: { ...state.customLists, [listName]: [...list, wordId] },
        wordProgress: {
          ...state.wordProgress,
          [wordId]: {
            ...(state.wordProgress[wordId] || {
              wordId, masteryLevel: 0 as MasteryLevel, timesCorrect: 0, timesIncorrect: 0,
              lastReviewed: null, nextReview: null, isFavorite: false, isLearned: false, customLists: [], streak: 0,
            }),
            customLists: [...(state.wordProgress[wordId]?.customLists || []), listName],
          },
        },
      };
    }

    case 'CREATE_LIST':
      if (state.customLists[action.payload]) return state;
      return { ...state, customLists: { ...state.customLists, [action.payload]: [] } };

    case 'REMOVE_FROM_LIST': {
      const { wordId, listName } = action.payload;
      return {
        ...state,
        customLists: {
          ...state.customLists,
          [listName]: (state.customLists[listName] || []).filter(id => id !== wordId),
        },
      };
    }

    case 'UPDATE_DAILY_GOAL':
      return { ...state, user: { ...state.user, dailyWordGoal: action.payload } };

    case 'UPDATE_PROFILE':
      return { ...state, user: { ...state.user, ...action.payload } };

    case 'RESET_PROGRESS':
      return { ...defaultState, user: { ...defaultUser, onboardingComplete: true, name: state.user.name } };

    default:
      return state;
  }
}

const STORAGE_KEY = 'vocabvault-state';

function loadState(): AppState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getWord: (id: string) => typeof vocabularyData[0] | undefined;
  getProgress: (id: string) => WordProgress | undefined;
  getDueWords: () => typeof vocabularyData;
  getDailyWords: () => typeof vocabularyData;
  getWeakWords: () => typeof vocabularyData;
  getTodayStats: () => DailyStats;
  getStudyHeatmap: () => Record<string, number>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState, () => {
    // Load saved state synchronously to avoid flash of onboarding
    const saved = loadState();
    return saved || defaultState;
  });

  // Persist state on change
  useEffect(() => {
    saveState(state);
    // Apply dark mode class
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const getWord = (id: string) => vocabularyData.find(w => w.id === id);
  const getProgress = (id: string) => state.wordProgress[id];

  const getDueWords = () => {
    return vocabularyData.filter(w => {
      const p = state.wordProgress[w.id];
      if (!p || !p.isLearned) return false;
      if (!p.nextReview) return true;
      return new Date(p.nextReview) <= new Date();
    });
  };

  const getDailyWords = () => {
    // Return words the user hasn't learned yet, filtered by goal/difficulty
    const goalDifficultyMap: Record<string, string[]> = {
      'everyday': ['beginner', 'intermediate'],
      'professional': ['intermediate', 'advanced'],
      'academic': ['intermediate', 'advanced', 'expert'],
      'test-prep': ['advanced', 'expert'],
    };
    const targetDifficulties = goalDifficultyMap[state.user.goal] || ['beginner', 'intermediate'];

    return vocabularyData
      .filter(w => {
        const p = state.wordProgress[w.id];
        return !p?.isLearned;
      })
      .sort((a, b) => {
        const aMatch = targetDifficulties.includes(a.difficulty) ? 0 : 1;
        const bMatch = targetDifficulties.includes(b.difficulty) ? 0 : 1;
        return aMatch - bMatch;
      });
  };

  const getWeakWords = () => {
    return vocabularyData.filter(w => {
      const p = state.wordProgress[w.id];
      if (!p) return false;
      return p.isLearned && p.masteryLevel <= 2 && p.timesIncorrect > 0;
    });
  };

  const getTodayStats = (): DailyStats => {
    const key = today();
    return state.dailyStats[key] || {
      date: key,
      wordsLearned: 0,
      quizzesTaken: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      xpEarned: 0,
      reviewsDone: 0,
    };
  };

  const getStudyHeatmap = (): Record<string, number> => {
    const heatmap: Record<string, number> = {};
    for (const [date, stats] of Object.entries(state.dailyStats)) {
      heatmap[date] = stats.wordsLearned + stats.reviewsDone + stats.totalAnswers;
    }
    return heatmap;
  };

  return (
    <AppContext.Provider value={{
      state, dispatch, getWord, getProgress,
      getDueWords, getDailyWords, getWeakWords, getTodayStats, getStudyHeatmap,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
