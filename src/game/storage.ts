import {
  BRAND_NAME,
  DEFAULT_LANGUAGE,
  DEFAULT_PLAYER_COUNT,
  PLAYER_COUNT,
  PLAYER_SETUP_STORAGE_KEY,
  SESSION_VERSION,
  STORAGE_KEY,
} from './constants';
import type { GameState, PersistedSession, PlayerProfileSnapshot, PlayerSetupSnapshot } from './types';

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

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersistedSession(state)));
}

export function clearPersistedSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function loadPersistedPlayerSetup(): PlayerSetupSnapshot | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(PLAYER_SETUP_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isPlayerSetupSnapshot(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function savePersistedPlayerSetup(snapshot: PlayerSetupSnapshot) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PLAYER_SETUP_STORAGE_KEY, JSON.stringify(snapshot));
}

export function toPersistedSession(state: GameState): PersistedSession {
  return {
    version: SESSION_VERSION,
    brand: BRAND_NAME,
    language: state.language,
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
    candidate.playerCount <= PLAYER_COUNT &&
    Array.isArray(candidate.selectedPlayerIds) &&
    candidate.selectedPlayerIds.every((playerId) => typeof playerId === 'string') &&
    (candidate.language === 'en' || candidate.language === 'es') &&
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

function isPlayerProfileSnapshot(value: unknown): value is PlayerProfileSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    (typeof candidate.avatarDataUrl === 'string' || candidate.avatarDataUrl === null) &&
    typeof candidate.hasUploadedImage === 'boolean'
  );
}

function isPlayerSetupSnapshot(value: unknown): value is PlayerSetupSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    Array.isArray(candidate.players) &&
    candidate.players.every(isPlayerProfileSnapshot) &&
    typeof candidate.playerCount === 'number' &&
    candidate.playerCount >= 1 &&
    candidate.playerCount <= PLAYER_COUNT &&
    Array.isArray(candidate.selectedPlayerIds) &&
    candidate.selectedPlayerIds.every((playerId) => typeof playerId === 'string') &&
    (candidate.language === 'en' || candidate.language === 'es')
  );
}

export function getFallbackPlayerSetup(): PlayerSetupSnapshot {
  return {
    players: [],
    playerCount: DEFAULT_PLAYER_COUNT,
    selectedPlayerIds: [],
    language: DEFAULT_LANGUAGE,
  };
}
