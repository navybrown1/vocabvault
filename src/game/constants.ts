import type { PlayerColor, QuestionDifficulty, RoundNumber, SoundEvent } from './types';

export const BRAND_NAME = 'The Brown Family Trivia Super Game';
export const SESSION_VERSION = 3;
export const STORAGE_KEY = 'brown-family-trivia-super-game/session:v3';
export const PLAYER_COUNT = 4;
export const DEFAULT_PLAYER_COUNT = 4;
export const QUESTIONS_PER_ROUND = 4;
export const TOTAL_QUESTIONS = QUESTIONS_PER_ROUND * 3;
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

export const ROUND_CONFIG: Record<
  RoundNumber,
  {
    round: RoundNumber;
    difficulty: QuestionDifficulty;
    originalPoints: number;
    stealPoints: number;
    title: string;
    subtitle: string;
  }
> = {
  1: {
    round: 1,
    difficulty: 'easy',
    originalPoints: 100,
    stealPoints: 50,
    title: 'Round 1',
    subtitle: 'Opening sparks and crowd-pleasers',
  },
  2: {
    round: 2,
    difficulty: 'medium',
    originalPoints: 100,
    stealPoints: 50,
    title: 'Round 2',
    subtitle: 'Deeper cuts with sharper steals',
  },
  3: {
    round: 3,
    difficulty: 'hard',
    originalPoints: 200,
    stealPoints: 100,
    title: 'Round 3',
    subtitle: 'High-stakes finish under the bright lights',
  },
};

export const ROUND_THEME_COPY: Record<
  RoundNumber,
  {
    eyebrow: string;
    callout: string;
  }
> = {
  1: {
    eyebrow: 'Family warm-up',
    callout: 'Fast answers, clean starts, and first blood on the board.',
  },
  2: {
    eyebrow: 'Pressure rising',
    callout: 'The easy wins are gone. One bad answer opens the door to a steal.',
  },
  3: {
    eyebrow: 'Final showdown',
    callout: 'Double-value originals. Every answer can rewrite the podium.',
  },
};

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
  correctAnswer: { frequencies: [523, 659, 784, 1046, 1318], duration: 0.18, gap: 0.05, type: 'triangle', volume: 0.075 },
  wrongAnswer: { frequencies: [311, 247, 196, 147], duration: 0.16, gap: 0.06, type: 'sawtooth', volume: 0.06 },
  stealActivation: { frequencies: [330, 440, 554], duration: 0.13, gap: 0.045, type: 'square', volume: 0.05 },
  roundTransition: { frequencies: [392, 523, 659, 784], duration: 0.24, gap: 0.055, type: 'triangle', volume: 0.055 },
  winnerCelebration: { frequencies: [523, 659, 784, 1046, 1175], duration: 0.32, gap: 0.06, type: 'triangle', volume: 0.06 },
};

export const REVEAL_COPY = {
  allFailed: 'No one cracked it this time.',
  correct: 'That answer lights up the board.',
};

export const MOTION_TIMINGS = {
  questionRevealMs: 450,
  wrongFeedbackMs: 550,
  correctFeedbackMs: 900,
  roundTransitionMs: 1_100,
};
