import { Badge, UserProfile, WordProgress } from '../types';

export const ALL_BADGES: Badge[] = [
  { id: 'first-word', name: 'First Steps', description: 'Learn your first word', icon: '🌱', earned: false },
  { id: 'ten-words', name: 'Word Collector', description: 'Learn 10 words', icon: '📚', earned: false },
  { id: 'twenty-five-words', name: 'Vocabulary Builder', description: 'Learn 25 words', icon: '🏗️', earned: false },
  { id: 'streak-3', name: 'On Fire', description: '3-day learning streak', icon: '🔥', earned: false },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day learning streak', icon: '⚔️', earned: false },
  { id: 'streak-30', name: 'Monthly Master', description: '30-day learning streak', icon: '👑', earned: false },
  { id: 'quiz-perfect', name: 'Perfect Score', description: 'Get 100% on a quiz', icon: '💯', earned: false },
  { id: 'first-mastery', name: 'Word Master', description: 'Master your first word', icon: '⭐', earned: false },
  { id: 'five-mastery', name: 'Rising Scholar', description: 'Master 5 words', icon: '🎓', earned: false },
  { id: 'level-5', name: 'Level Up Pro', description: 'Reach level 5', icon: '🚀', earned: false },
  { id: 'review-10', name: 'Review Champion', description: 'Complete 10 review sessions', icon: '🔄', earned: false },
  { id: 'night-owl', name: 'Night Owl', description: 'Study after 10 PM', icon: '🦉', earned: false },
  { id: 'early-bird', name: 'Early Bird', description: 'Study before 7 AM', icon: '🐦', earned: false },
  { id: 'explorer', name: 'Explorer', description: 'Learn words from all categories', icon: '🧭', earned: false },
];

export function checkBadgeEligibility(
  user: UserProfile,
  wordProgress: Record<string, WordProgress>
): Badge[] {
  const progress = Object.values(wordProgress);
  const learnedCount = progress.filter(p => p.isLearned).length;
  const masteredCount = progress.filter(p => p.masteryLevel === 5).length;
  const hour = new Date().getHours();

  const newBadges: Badge[] = [];
  const now = new Date().toISOString();

  const checks: Record<string, boolean> = {
    'first-word': learnedCount >= 1,
    'ten-words': learnedCount >= 10,
    'twenty-five-words': learnedCount >= 25,
    'streak-3': user.currentStreak >= 3,
    'streak-7': user.currentStreak >= 7,
    'streak-30': user.currentStreak >= 30,
    'first-mastery': masteredCount >= 1,
    'five-mastery': masteredCount >= 5,
    'level-5': user.level >= 5,
    'night-owl': hour >= 22 || hour < 4,
    'early-bird': hour >= 4 && hour < 7,
  };

  for (const badge of ALL_BADGES) {
    const alreadyEarned = user.badges.some(b => b.id === badge.id && b.earned);
    if (!alreadyEarned && checks[badge.id]) {
      newBadges.push({ ...badge, earned: true, earnedDate: now });
    }
  }

  return newBadges;
}

export function getRankTitle(level: number): string {
  const ranks = [
    'Novice', 'Apprentice', 'Scholar', 'Wordsmith', 'Linguist',
    'Lexicon Keeper', 'Vocabulary Sage', 'Word Wizard', 'Language Master', 'Grandmaster'
  ];
  return ranks[Math.min(level - 1, ranks.length - 1)];
}
