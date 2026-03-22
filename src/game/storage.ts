import { BRAND_NAME, SESSION_VERSION, STORAGE_KEY } from './constants';
import type { GameState, PersistedSession } from './types';

export function loadPersistedSession(): PersistedSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isPersistedSession(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function savePersistedSession(state: GameState) {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = toPersistedSession(state);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearPersistedSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function toPersistedSession(state: GameState): PersistedSession {
  return {
    version: SESSION_VERSION,
    brand: BRAND_NAME,
    gamePhase: state.gamePhase,
    players: state.players,
    playerCount: state.playerCount,
    selectedPlayerIds: state.selectedPlayerIds,
    soundEnabled: state.soundEnabled,
    round: state.round,
    questionPlan: state.questionPlan,
    currentQuestionCursor: state.currentQuestionCursor,
    usedQuestionIds: state.usedQuestionIds,
    currentQuestion: state.currentQuestion,
    roundResults: state.roundResults,
    winnerSnapshot: state.winnerSnapshot,
    setupStarted: state.setupStarted,
  };
}

function isPersistedSession(value: unknown): value is PersistedSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.version === SESSION_VERSION &&
    candidate.brand === BRAND_NAME &&
    Array.isArray(candidate.players) &&
    typeof candidate.playerCount === 'number' &&
    candidate.playerCount >= 1 &&
    candidate.playerCount <= 4 &&
    Array.isArray(candidate.selectedPlayerIds) &&
    candidate.selectedPlayerIds.every((playerId) => typeof playerId === 'string') &&
    typeof candidate.gamePhase === 'string' &&
    typeof candidate.soundEnabled === 'boolean' &&
    Array.isArray(candidate.questionPlan) &&
    candidate.questionPlan.every(isQuestionPlanItem) &&
    Array.isArray(candidate.usedQuestionIds) &&
    Array.isArray(candidate.roundResults) &&
    typeof candidate.currentQuestionCursor === 'number' &&
    typeof candidate.round === 'number'
  );
}

function isQuestionPlanItem(value: unknown) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.questionId === 'string' &&
    typeof candidate.round === 'number' &&
    typeof candidate.starterIndex === 'number' &&
    Array.isArray(candidate.choiceOrder) &&
    candidate.choiceOrder.length === 4 &&
    candidate.choiceOrder.every((choice) => typeof choice === 'string')
  );
}
