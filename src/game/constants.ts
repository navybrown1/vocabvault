import type { Language, PlayerColor, RoundConfig, RoundNumber, SoundEvent, SpeedTier } from './types';

export const BRAND_NAME = 'The Brown Family Trivia Super Game';
export const SESSION_VERSION = 6;
export const STORAGE_KEY = 'brown-family-trivia-super-game/session:v6';
export const PLAYER_SETUP_STORAGE_KEY = 'brown-family-trivia-super-game/setup:v2';

export const PLAYER_COUNT = 4;
export const DEFAULT_PLAYER_COUNT = 4;
export const DEFAULT_LANGUAGE: Language = 'en';

export const ORIGINAL_TURN_MS = 40_000;
export const STEAL_TURN_MS = 30_000;
export const ORIGINAL_WARNING_MS = 10_000;
export const STEAL_WARNING_MS = 8_000;
export const ORIGINAL_TICK_FROM_SECONDS = 5;
export const STEAL_TICK_FROM_SECONDS = 4;
export const AVATAR_OUTPUT_SIZE = 256;
export const ANSWER_HOTKEYS = ['1', '2', '3', '4'] as const;

export const PLAYER_IDENTITIES: Array<{ seat: number; color: PlayerColor; label: string }> = [
  { seat: 1, color: 'blue', label: 'Electric Blue' },
  { seat: 2, color: 'purple', label: 'Vivid Purple' },
  { seat: 3, color: 'green', label: 'Neon Green' },
  { seat: 4, color: 'orange', label: 'Fiery Orange' },
];

export const FAMILY_PLAYER_PRESETS = [
  {
    seat: 1,
    name: 'Edwin Brown',
    avatarSrc: '/family/edwin-brown.png',
  },
  {
    seat: 2,
    name: 'Dayanna Brown',
    avatarSrc: '/family/dayanna-brown.png',
  },
  {
    seat: 3,
    name: 'Ethan Brown',
    avatarSrc: '/family/ethan-brown.png',
  },
  {
    seat: 4,
    name: 'Valentino Brown',
    avatarSrc: '/family/valentino-brown.png',
  },
] as const;

export const ENZO_MASCOT = {
  name: 'Enzo Brown',
  avatarSrc: '/family/enzo-brown.png',
};

export const ROUND_CONFIG: Record<RoundNumber, RoundConfig> = {
  1: {
    round: 1,
    type: 'classic',
    difficultyPool: ['easy'],
    questionCount: 3,
    originalPoints: 100,
    stealPoints: 50,
  },
  2: {
    round: 2,
    type: 'portrait',
    difficultyPool: ['easy', 'medium'],
    questionCount: 3,
    originalPoints: 120,
    stealPoints: 70,
  },
  3: {
    round: 3,
    type: 'rapid',
    difficultyPool: ['medium'],
    questionCount: 3,
    originalPoints: 140,
    stealPoints: 80,
  },
  4: {
    round: 4,
    type: 'steal',
    difficultyPool: ['medium', 'hard'],
    questionCount: 3,
    originalPoints: 160,
    stealPoints: 110,
  },
  5: {
    round: 5,
    type: 'finale',
    difficultyPool: ['hard', 'medium'],
    questionCount: 3,
    originalPoints: 220,
    stealPoints: 140,
  },
};

export const ROUND_SEQUENCE = [1, 2, 3, 4, 5] as const;
export const TOTAL_QUESTIONS = ROUND_SEQUENCE.reduce((total, round) => total + ROUND_CONFIG[round].questionCount, 0);

export const SPEED_BONUS_TIERS: Array<{
  tier: SpeedTier;
  threshold: number;
  originalBonus: number;
  stealBonus: number;
}> = [
  { tier: 'blazing', threshold: 0.75, originalBonus: 60, stealBonus: 40 },
  { tier: 'swift', threshold: 0.5, originalBonus: 40, stealBonus: 25 },
  { tier: 'steady', threshold: 0.25, originalBonus: 20, stealBonus: 10 },
  { tier: 'none', threshold: 0, originalBonus: 0, stealBonus: 0 },
];

export const SOUND_MANIFEST: Record<
  SoundEvent,
  {
    frequencies: number[];
    duration: number;
    gap?: number;
    type?: OscillatorType;
    volume?: number;
  }
> = {
  buttonClick: { frequencies: [740, 988], duration: 0.07, gap: 0.04, type: 'triangle', volume: 0.055 },
  answerSelect: { frequencies: [523, 659, 784], duration: 0.08, gap: 0.045, type: 'square', volume: 0.05 },
  countdownTick: { frequencies: [988], duration: 0.045, type: 'square', volume: 0.03 },
  timerWarning: { frequencies: [392, 523, 698], duration: 0.15, gap: 0.06, type: 'sawtooth', volume: 0.05 },
  turnStart: { frequencies: [330, 494, 659], duration: 0.13, gap: 0.045, type: 'triangle', volume: 0.055 },
  correctAnswer: { frequencies: [523, 659, 784, 988, 1318, 1568], duration: 0.2, gap: 0.048, type: 'triangle', volume: 0.085 },
  wrongAnswer: { frequencies: [392, 349, 294, 247, 196], duration: 0.17, gap: 0.07, type: 'sawtooth', volume: 0.065 },
  stealActivation: { frequencies: [440, 587, 784, 988], duration: 0.16, gap: 0.05, type: 'sawtooth', volume: 0.09 },
  roundTransition: { frequencies: [392, 523, 659, 784], duration: 0.24, gap: 0.055, type: 'triangle', volume: 0.055 },
  winnerCelebration: { frequencies: [523, 659, 784, 988, 1175, 1568], duration: 0.34, gap: 0.055, type: 'triangle', volume: 0.095 },
};

export const MOTION_TIMINGS = {
  questionRevealMs: 450,
  wrongFeedbackMs: 550,
  correctFeedbackMs: 900,
  roundTransitionMs: 1_100,
};
