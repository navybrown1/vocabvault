export type PlayerColor = 'blue' | 'purple' | 'green' | 'orange';
export type PlayerCount = 1 | 2 | 3 | 4;

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

export type RoundNumber = 1 | 2 | 3;

export interface Player {
  id: string;
  seat: number;
  color: PlayerColor;
  name: string;
  avatarDataUrl: string | null;
  hasUploadedImage: boolean;
  score: number;
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
  resolution: QuestionResolution | null;
  latestFailure: FailureSnapshot | null;
}

export interface QuestionResult {
  questionId: string;
  round: RoundNumber;
  category: string;
  correctAnswer: string;
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
  gamePhase: GamePhase;
  players: Player[];
  playerCount: PlayerCount;
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
  gamePhase: GamePhase;
  players: Player[];
  playerCount: PlayerCount;
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
  | { type: 'UPDATE_PLAYER_NAME'; playerId: string; name: string }
  | { type: 'UPDATE_PLAYER_AVATAR'; playerId: string; avatarDataUrl: string | null; hasUploadedImage: boolean }
  | { type: 'START_GAME'; seed?: number }
  | { type: 'BEGIN_ROUND' }
  | { type: 'SUBMIT_ANSWER'; choice: string }
  | { type: 'TIME_EXPIRED'; turnToken: string }
  | { type: 'CONTINUE_AFTER_QUESTION' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'HYDRATE_SESSION'; session: PersistedSession }
  | { type: 'SET_FATAL_ERROR'; message: string | null }
  | { type: 'RESET_SESSION' };
