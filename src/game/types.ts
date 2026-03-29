export type PlayerColor = 'blue' | 'purple' | 'green' | 'orange';
export type PlayerCount = 1 | 2 | 3 | 4;
export type Language = 'en' | 'es';

export type GamePhase =
  | 'welcome'
  | 'playerSetup'
  | 'categoryOrStart'
  | 'gameplay'
  | 'roundTransition'
  | 'winner';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type TurnKind = 'original' | 'steal';
export type FailureReason = 'wrong' | 'timeout';
export type RoundNumber = 1 | 2 | 3 | 4 | 5;
export type RoundType = 'classic' | 'portrait' | 'rapid' | 'steal' | 'finale';
export type SpeedTier = 'blazing' | 'swift' | 'steady' | 'none';
export type MusicScene =
  | 'menu'
  | 'setup'
  | 'staging'
  | 'question'
  | 'clutch'
  | 'paused'
  | 'result'
  | 'winner';

export type SoundEvent =
  | 'buttonClick'
  | 'answerSelect'
  | 'countdownTick'
  | 'timerWarning'
  | 'turnStart'
  | 'correctAnswer'
  | 'wrongAnswer'
  | 'stealActivation'
  | 'roundTransition'
  | 'winnerCelebration';

export interface RoundConfig {
  round: RoundNumber;
  type: RoundType;
  difficultyPool: QuestionDifficulty[];
  questionCount: number;
  originalPoints: number;
  stealPoints: number;
}

export interface Player {
  id: string;
  seat: number;
  color: PlayerColor;
  name: string;
  avatarDataUrl: string | null;
  hasUploadedImage: boolean;
  score: number;
}

export interface PlayerProfileSnapshot {
  id: string;
  name: string;
  avatarDataUrl: string | null;
  hasUploadedImage: boolean;
}

export interface PlayerSetupSnapshot {
  players: PlayerProfileSnapshot[];
  playerCount: PlayerCount;
  selectedPlayerIds: string[];
  language: Language;
}

export interface Question {
  id: string;
  category: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  difficulty: QuestionDifficulty;
  explanation?: string;
}

export interface LocalizedChoice {
  value: string;
  label: string;
}

export interface LocalizedQuestion {
  id: string;
  category: string;
  question: string;
  choices: LocalizedChoice[];
  correctAnswer: string;
  correctAnswerLabel: string;
  difficulty: QuestionDifficulty;
  explanation?: string;
}

export interface QuestionPlanItem {
  questionId: string;
  round: RoundNumber;
  starterIndex: number;
  choiceOrder: string[];
}

export interface FailureSnapshot {
  playerId: string;
  reason: FailureReason;
  choice: string | null;
  occurredAt: number;
}

export interface QuestionResolution {
  outcome: 'correct' | 'allFailed';
  correctAnswer: string;
  basePoints: number;
  speedBonus: number;
  speedTier: SpeedTier;
  awardedPoints: number;
  resolvedByPlayerId: string | null;
  turnKind: TurnKind | null;
  resolvedAt: number;
}

export interface QuestionState {
  questionId: string;
  round: RoundNumber;
  turnKind: TurnKind;
  starterIndex: number;
  currentResponderIndex: number;
  failedPlayerIds: string[];
  lockedChoice: string | null;
  turnToken: string;
  turnStartedAt: number;
  deadlineAt: number;
  pausedRemainingMs: number | null;
  resolution: QuestionResolution | null;
  latestFailure: FailureSnapshot | null;
}

export interface QuestionResult {
  questionId: string;
  round: RoundNumber;
  category: string;
  correctAnswer: string;
  basePoints: number;
  speedBonus: number;
  awardedPoints: number;
  resolvedByPlayerId: string | null;
  turnKind: TurnKind | null;
  outcome: 'correct' | 'allFailed';
}

export interface RankedPlayer extends Player {
  placement: number;
  rankLabel: string;
  tied: boolean;
}

export interface WinnerSnapshot {
  rankings: RankedPlayer[];
  topScore: number;
  winnerIds: string[];
}

export interface GameState {
  version: number;
  brand: string;
  language: Language;
  gamePhase: GamePhase;
  players: Player[];
  playerCount: PlayerCount;
  selectedPlayerIds: string[];
  soundEnabled: boolean;
  round: RoundNumber;
  questionPlan: QuestionPlanItem[];
  currentQuestionCursor: number;
  usedQuestionIds: string[];
  currentQuestion: QuestionState | null;
  roundResults: QuestionResult[];
  winnerSnapshot: WinnerSnapshot | null;
  setupStarted: boolean;
  fatalError: string | null;
}

export interface PersistedSession {
  version: number;
  brand: string;
  language: Language;
  gamePhase: GamePhase;
  players: Player[];
  playerCount: PlayerCount;
  selectedPlayerIds: string[];
  soundEnabled: boolean;
  round: RoundNumber;
  questionPlan: QuestionPlanItem[];
  currentQuestionCursor: number;
  usedQuestionIds: string[];
  currentQuestion: QuestionState | null;
  roundResults: QuestionResult[];
  winnerSnapshot: WinnerSnapshot | null;
  setupStarted: boolean;
}

export type GameAction =
  | { type: 'GO_TO_SETUP' }
  | { type: 'SET_PLAYER_COUNT'; count: PlayerCount }
  | { type: 'TOGGLE_PLAYER_SELECTION'; playerId: string }
  | { type: 'UPDATE_PLAYER_NAME'; playerId: string; name: string }
  | { type: 'UPDATE_PLAYER_AVATAR'; playerId: string; avatarDataUrl: string | null; hasUploadedImage: boolean }
  | { type: 'START_GAME'; seed?: number }
  | { type: 'BEGIN_ROUND' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'SUBMIT_ANSWER'; choice: string }
  | { type: 'TIME_EXPIRED'; turnToken: string }
  | { type: 'CONTINUE_AFTER_QUESTION' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_LANGUAGE' }
  | { type: 'HYDRATE_SESSION'; session: PersistedSession }
  | { type: 'SET_FATAL_ERROR'; message: string | null }
  | { type: 'RESET_SESSION'; setupSnapshot?: PlayerSetupSnapshot };
