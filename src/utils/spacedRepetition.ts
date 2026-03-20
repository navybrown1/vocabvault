import { MasteryLevel, WordProgress } from '../types';

/**
 * Spaced Repetition Algorithm
 *
 * Based on a simplified SM-2 algorithm. The interval between reviews
 * increases exponentially with each correct answer, and resets on incorrect answers.
 *
 * Mastery levels:
 * 0 = New (never reviewed)
 * 1 = Learning (seen once)
 * 2 = Familiar (2+ correct in a row)
 * 3 = Comfortable (4+ correct, longer intervals)
 * 4 = Strong (6+ correct, much longer intervals)
 * 5 = Mastered (8+ correct, very long intervals)
 *
 * Intervals (in days):
 * Level 0 → 1: immediate / same day
 * Level 1 → 2: 1 day
 * Level 2 → 3: 3 days
 * Level 3 → 4: 7 days
 * Level 4 → 5: 14 days
 * Level 5 (mastered): 30 days
 */

const INTERVAL_MAP: Record<MasteryLevel, number> = {
  0: 0,    // Same day
  1: 1,    // 1 day
  2: 3,    // 3 days
  3: 7,    // 1 week
  4: 14,   // 2 weeks
  5: 30,   // 1 month
};

const MASTERY_THRESHOLDS: Record<MasteryLevel, number> = {
  0: 0,
  1: 1,
  2: 3,
  3: 5,
  4: 7,
  5: 10,
};

export function calculateNextReview(progress: WordProgress, wasCorrect: boolean): WordProgress {
  const now = new Date().toISOString();
  let newStreak = wasCorrect ? progress.streak + 1 : 0;
  let newCorrect = progress.timesCorrect + (wasCorrect ? 1 : 0);
  let newIncorrect = progress.timesIncorrect + (wasCorrect ? 0 : 1);

  // Calculate new mastery level based on consecutive correct answers
  let newMastery: MasteryLevel = progress.masteryLevel;
  if (!wasCorrect) {
    // Drop mastery by 1 level on incorrect answer (minimum 1 if already started)
    newMastery = Math.max(1, progress.masteryLevel - 1) as MasteryLevel;
  } else {
    // Advance mastery if streak meets threshold for next level
    for (let level = 5; level >= 0; level--) {
      if (newStreak >= MASTERY_THRESHOLDS[level as MasteryLevel]) {
        newMastery = level as MasteryLevel;
        break;
      }
    }
  }

  // Calculate next review date
  const intervalDays = INTERVAL_MAP[newMastery];
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  return {
    ...progress,
    masteryLevel: newMastery,
    timesCorrect: newCorrect,
    timesIncorrect: newIncorrect,
    lastReviewed: now,
    nextReview: nextReviewDate.toISOString(),
    streak: newStreak,
  };
}

export function isDueForReview(progress: WordProgress): boolean {
  if (!progress.nextReview) return true;
  return new Date(progress.nextReview) <= new Date();
}

export function getReviewUrgency(progress: WordProgress): 'overdue' | 'due' | 'upcoming' | 'ok' {
  if (!progress.nextReview) return 'due';
  const now = new Date();
  const reviewDate = new Date(progress.nextReview);
  const diffHours = (reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < -24) return 'overdue';
  if (diffHours < 0) return 'due';
  if (diffHours < 24) return 'upcoming';
  return 'ok';
}

export function getMasteryLabel(level: MasteryLevel): string {
  const labels: Record<MasteryLevel, string> = {
    0: 'New',
    1: 'Learning',
    2: 'Familiar',
    3: 'Comfortable',
    4: 'Strong',
    5: 'Mastered',
  };
  return labels[level];
}

export function getMasteryColor(level: MasteryLevel): string {
  const colors: Record<MasteryLevel, string> = {
    0: '#868e96',
    1: '#fa5252',
    2: '#fd7e14',
    3: '#fcc419',
    4: '#51cf66',
    5: '#5c7cfa',
  };
  return colors[level];
}

export function calculateXP(wasCorrect: boolean, mastery: MasteryLevel, isReview: boolean): number {
  if (!wasCorrect) return 2; // Small consolation XP for trying
  const baseXP = 10;
  const masteryBonus = mastery * 2;
  const reviewBonus = isReview ? 5 : 0;
  return baseXP + masteryBonus + reviewBonus;
}

export function getLevelFromXP(xp: number): number {
  // Each level requires progressively more XP
  // Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  if (xp < 1000) return 4;
  if (xp < 2000) return 5;
  if (xp < 3500) return 6;
  if (xp < 5500) return 7;
  if (xp < 8000) return 8;
  if (xp < 12000) return 9;
  return 10;
}

export function getXPForNextLevel(currentLevel: number): number {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 999999];
  return thresholds[currentLevel] || 999999;
}

export function getXPForCurrentLevel(currentLevel: number): number {
  const thresholds = [0, 0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];
  return thresholds[currentLevel] || 0;
}
