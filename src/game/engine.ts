import {
  BRAND_NAME,
  DEFAULT_LANGUAGE,
  DEFAULT_PLAYER_COUNT,
  FAMILY_PLAYER_PRESETS,
  ORIGINAL_TURN_MS,
  PLAYER_COUNT,
  PLAYER_IDENTITIES,
  ROUND_CONFIG,
  ROUND_SEQUENCE,
  SESSION_VERSION,
  SPEED_BONUS_TIERS,
  STEAL_TURN_MS,
  TOTAL_QUESTIONS,
} from './constants';
import { QUESTION_LOOKUP, QUESTION_POOL } from './questions';
import { createSessionSeed, mulberry32, shuffle } from './random';
import { getActivePlayers, rankPlayers } from './selectors';
import type {
  FailureReason,
  GameAction,
  GameState,
  PersistedSession,
  Player,
  PlayerCount,
  PlayerProfileSnapshot,
  PlayerSetupSnapshot,
  Question,
  QuestionPlanItem,
  QuestionState,
  RoundNumber,
  SpeedTier,
  WinnerSnapshot,
} from './types';

function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createInitialState(soundEnabled = true, setupSnapshot?: Partial<PlayerSetupSnapshot>): GameState {
  const normalizedSetup = normalizeSetupSnapshot(setupSnapshot);
  const players = createEmptyPlayers(normalizedSetup.players);

  return {
    version: SESSION_VERSION,
    brand: BRAND_NAME,
    language: normalizedSetup.language,
    gamePhase: 'welcome',
    players,
    playerCount: normalizedSetup.playerCount,
    selectedPlayerIds: syncSelectedPlayerIds(players, normalizedSetup.selectedPlayerIds, normalizedSetup.playerCount),
    soundEnabled,
    round: ROUND_SEQUENCE[0],
    questionPlan: [],
    currentQuestionCursor: 0,
    usedQuestionIds: [],
    currentQuestion: null,
    roundResults: [],
    winnerSnapshot: null,
    setupStarted: false,
    fatalError: null,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'GO_TO_SETUP':
      return {
        ...state,
        gamePhase: 'playerSetup',
        setupStarted: true,
        winnerSnapshot: null,
        fatalError: null,
      };

    case 'SET_PLAYER_COUNT':
      return {
        ...state,
        playerCount: action.count,
        selectedPlayerIds: syncSelectedPlayerIds(state.players, state.selectedPlayerIds, action.count),
      };

    case 'TOGGLE_PLAYER_SELECTION':
      if (!state.selectedPlayerIds.includes(action.playerId) && state.playerCount === 1) {
        return {
          ...state,
          selectedPlayerIds: [action.playerId],
        };
      }

      if (!state.selectedPlayerIds.includes(action.playerId) && state.selectedPlayerIds.length >= state.playerCount) {
        return state;
      }

      return {
        ...state,
        selectedPlayerIds: state.selectedPlayerIds.includes(action.playerId)
          ? state.selectedPlayerIds.filter((playerId) => playerId !== action.playerId)
          : [...state.selectedPlayerIds, action.playerId],
      };

    case 'UPDATE_PLAYER_NAME':
      return {
        ...state,
        players: state.players.map((player) =>
          player.id === action.playerId ? { ...player, name: action.name } : player,
        ),
      };

    case 'UPDATE_PLAYER_AVATAR':
      return {
        ...state,
        players: state.players.map((player) =>
          player.id === action.playerId
            ? {
                ...player,
                avatarDataUrl: action.avatarDataUrl,
                hasUploadedImage: action.hasUploadedImage,
              }
            : player,
        ),
      };

    case 'START_GAME': {
      if (!validatePlayersForStart(state.players, state.playerCount, state.selectedPlayerIds)) {
        return state;
      }

      try {
        const seed = action.seed ?? createSessionSeed();
        const questionPlan = buildQuestionPlan(seed, state.playerCount);
        return {
          ...state,
          players: state.players.map((player) => ({ ...player, score: 0 })),
          gamePhase: 'categoryOrStart',
          round: ROUND_SEQUENCE[0],
          questionPlan,
          currentQuestionCursor: 0,
          usedQuestionIds: [],
          currentQuestion: null,
          roundResults: [],
          winnerSnapshot: null,
          fatalError: null,
        };
      } catch (error) {
        return {
          ...state,
          fatalError: error instanceof Error ? error.message : 'The local question set could not be prepared.',
        };
      }
    }

    case 'BEGIN_ROUND': {
      if (!state.questionPlan.length || state.currentQuestionCursor >= state.questionPlan.length) {
        return state;
      }
      return startQuestionAtCursor(state, state.currentQuestionCursor);
    }

    case 'TOGGLE_PAUSE': {
      if (state.gamePhase !== 'gameplay' || !state.currentQuestion || state.currentQuestion.resolution) {
        return state;
      }

      if (state.currentQuestion.pausedRemainingMs !== null) {
        const resumedAt = Date.now();
        return {
          ...state,
          currentQuestion: {
            ...state.currentQuestion,
            pausedRemainingMs: null,
            turnStartedAt: resumedAt,
            deadlineAt: resumedAt + state.currentQuestion.pausedRemainingMs,
          },
        };
      }

      return {
        ...state,
        currentQuestion: {
          ...state.currentQuestion,
          pausedRemainingMs: Math.max(state.currentQuestion.deadlineAt - Date.now(), 0),
        },
      };
    }

    case 'SUBMIT_ANSWER': {
      if (
        state.gamePhase !== 'gameplay' ||
        !state.currentQuestion ||
        state.currentQuestion.resolution ||
        state.currentQuestion.pausedRemainingMs !== null
      ) {
        return state;
      }

      const question = QUESTION_LOOKUP[state.currentQuestion.questionId];
      if (!question) {
        return state;
      }

      const lockedState = {
        ...state,
        currentQuestion: {
          ...state.currentQuestion,
          lockedChoice: action.choice,
        },
      };

      if (action.choice === question.correctAnswer) {
        return resolveCorrectAnswer(lockedState, question);
      }

      return resolveFailedAttempt(lockedState, 'wrong', action.choice);
    }

    case 'TIME_EXPIRED': {
      if (
        state.gamePhase !== 'gameplay' ||
        !state.currentQuestion ||
        state.currentQuestion.resolution ||
        state.currentQuestion.pausedRemainingMs !== null
      ) {
        return state;
      }

      if (state.currentQuestion.turnToken !== action.turnToken) {
        return state;
      }

      return resolveFailedAttempt(state, 'timeout', null);
    }

    case 'CONTINUE_AFTER_QUESTION': {
      if (!state.currentQuestion?.resolution) {
        return state;
      }

      const nextCursor = state.currentQuestionCursor + 1;
      const currentRound = state.currentQuestion.round;

      if (nextCursor >= state.questionPlan.length) {
        return {
          ...state,
          gamePhase: 'winner',
          currentQuestionCursor: nextCursor,
          currentQuestion: null,
          winnerSnapshot: buildWinnerSnapshot(getActivePlayers(state.players, state.selectedPlayerIds)),
        };
      }

      const nextRound = state.questionPlan[nextCursor].round;
      if (nextRound !== currentRound) {
        return {
          ...state,
          gamePhase: 'roundTransition',
          round: nextRound,
          currentQuestionCursor: nextCursor,
          currentQuestion: null,
        };
      }

      return startQuestionAtCursor({ ...state, currentQuestionCursor: nextCursor }, nextCursor);
    }

    case 'TOGGLE_SOUND':
      return {
        ...state,
        soundEnabled: !state.soundEnabled,
      };

    case 'TOGGLE_LANGUAGE':
      return {
        ...state,
        language: state.language === 'en' ? 'es' : 'en',
      };

    case 'HYDRATE_SESSION':
      return {
        ...action.session,
        language: action.session.language ?? DEFAULT_LANGUAGE,
        selectedPlayerIds: syncSelectedPlayerIds(
          action.session.players,
          action.session.selectedPlayerIds,
          action.session.playerCount,
        ),
        fatalError: null,
      };

    case 'SET_FATAL_ERROR':
      return {
        ...state,
        fatalError: action.message,
      };

    case 'RESET_SESSION':
      return createInitialState(state.soundEnabled, action.setupSnapshot ?? buildSetupSnapshot(state));

    default:
      return state;
  }
}

export function reconcileExpiredTurns(state: GameState, now = Date.now()): GameState {
  let nextState = state;
  let safety = getActivePlayers(state.players, state.selectedPlayerIds).length + 1;

  while (
    safety > 0 &&
    nextState.gamePhase === 'gameplay' &&
    nextState.currentQuestion &&
    !nextState.currentQuestion.resolution &&
    nextState.currentQuestion.deadlineAt <= now
  ) {
    nextState = gameReducer(nextState, {
      type: 'TIME_EXPIRED',
      turnToken: nextState.currentQuestion.turnToken,
    });
    safety -= 1;
  }

  return nextState;
}

export function restorePersistedState(session: PersistedSession) {
  return reconcileExpiredTurns({
    ...session,
    language: session.language ?? DEFAULT_LANGUAGE,
    selectedPlayerIds: syncSelectedPlayerIds(session.players, session.selectedPlayerIds, session.playerCount),
    fatalError: null,
  });
}

export function buildSetupSnapshot(state: Pick<GameState, 'language' | 'playerCount' | 'players' | 'selectedPlayerIds'>): PlayerSetupSnapshot {
  return {
    language: state.language,
    playerCount: state.playerCount,
    selectedPlayerIds: state.selectedPlayerIds,
    players: state.players.map((player) => ({
      id: player.id,
      name: player.name,
      avatarDataUrl: player.avatarDataUrl,
      hasUploadedImage: player.hasUploadedImage,
    })),
  };
}

export function validatePlayersForStart(
  players: Player[],
  playerCount: PlayerCount,
  selectedPlayerIds: string[],
) {
  if (playerCount < 1 || playerCount > PLAYER_COUNT) {
    return false;
  }

  const activePlayers = getActivePlayers(players, selectedPlayerIds);
  if (activePlayers.length !== playerCount) {
    return false;
  }

  const normalizedNames = activePlayers.map((player) => player.name.trim().toLowerCase());
  if (normalizedNames.some((name) => !name)) {
    return false;
  }

  if (new Set(normalizedNames).size !== normalizedNames.length) {
    return false;
  }

  return activePlayers.every((player) => player.hasUploadedImage && Boolean(player.avatarDataUrl));
}

export function buildQuestionPlan(seed = createSessionSeed(), playerCount: PlayerCount = DEFAULT_PLAYER_COUNT): QuestionPlanItem[] {
  if (playerCount < 1 || playerCount > PLAYER_COUNT) {
    throw new Error('The selected player count is outside the supported range.');
  }

  const rng = mulberry32(seed);
  const plan: QuestionPlanItem[] = [];
  const usedQuestionIds = new Set<string>();
  let globalIndex = 0;

  ROUND_SEQUENCE.forEach((round) => {
    const roundConfig = ROUND_CONFIG[round];
    const selectedQuestions = selectQuestionsForRound(
      roundConfig.difficultyPool,
      roundConfig.questionCount,
      usedQuestionIds,
      rng,
    );

    selectedQuestions.forEach((question) => {
      plan.push({
        questionId: question.id,
        round,
        starterIndex: globalIndex % playerCount,
        choiceOrder: shuffle(question.choices, rng),
      });
      globalIndex += 1;
    });
  });

  if (plan.length !== TOTAL_QUESTIONS) {
    throw new Error('The question plan is incomplete.');
  }

  return plan;
}

export function createEmptyPlayers(playerProfiles: PlayerProfileSnapshot[] = []): Player[] {
  const playerProfileLookup = Object.fromEntries(
    playerProfiles.map((profile) => [profile.id, profile]),
  ) as Record<string, PlayerProfileSnapshot>;

  return PLAYER_IDENTITIES.map((identity, index) => {
    const playerId = `player-${index + 1}`;
    const savedProfile = playerProfileLookup[playerId];

    return {
      id: playerId,
      seat: identity.seat,
      color: identity.color,
      name: savedProfile?.name ?? FAMILY_PLAYER_PRESETS[index]?.name ?? '',
      avatarDataUrl: savedProfile?.avatarDataUrl ?? FAMILY_PLAYER_PRESETS[index]?.avatarSrc ?? null,
      hasUploadedImage: savedProfile?.hasUploadedImage ?? Boolean(FAMILY_PLAYER_PRESETS[index]?.avatarSrc),
      score: 0,
    };
  });
}

function normalizeSetupSnapshot(setupSnapshot?: Partial<PlayerSetupSnapshot>): PlayerSetupSnapshot {
  return {
    players: setupSnapshot?.players ?? [],
    playerCount: setupSnapshot?.playerCount ?? DEFAULT_PLAYER_COUNT,
    selectedPlayerIds: setupSnapshot?.selectedPlayerIds ?? [],
    language: setupSnapshot?.language ?? DEFAULT_LANGUAGE,
  };
}

function syncSelectedPlayerIds(players: Player[], selectedPlayerIds: string[], playerCount: PlayerCount) {
  const validIds = new Set(players.map((player) => player.id));
  return selectedPlayerIds
    .filter((playerId, index) => validIds.has(playerId) && selectedPlayerIds.indexOf(playerId) === index)
    .slice(0, playerCount);
}

function startQuestionAtCursor(state: GameState, cursor: number): GameState {
  const planItem = state.questionPlan[cursor];
  const question = QUESTION_LOOKUP[planItem?.questionId];

  if (!planItem || !question) {
    return {
      ...state,
      fatalError: 'The scheduled question set is invalid. Start a new game to recover.',
    };
  }

  const now = Date.now();
  const questionState: QuestionState = {
    questionId: question.id,
    round: planItem.round,
    turnKind: 'original',
    starterIndex: planItem.starterIndex,
    currentResponderIndex: planItem.starterIndex,
    failedPlayerIds: [],
    lockedChoice: null,
    turnToken: makeId('turn'),
    turnStartedAt: now,
    deadlineAt: now + ORIGINAL_TURN_MS,
    pausedRemainingMs: null,
    resolution: null,
    latestFailure: null,
  };

  return {
    ...state,
    gamePhase: 'gameplay',
    round: planItem.round,
    currentQuestionCursor: cursor,
    currentQuestion: questionState,
    usedQuestionIds: state.usedQuestionIds.includes(question.id)
      ? state.usedQuestionIds
      : [...state.usedQuestionIds, question.id],
  };
}

function resolveCorrectAnswer(state: GameState, question: Question): GameState {
  const currentQuestion = state.currentQuestion;
  if (!currentQuestion) {
    return state;
  }

  const activePlayers = getActivePlayers(state.players, state.selectedPlayerIds);
  const responder = activePlayers[currentQuestion.currentResponderIndex];
  if (!responder) {
    return {
      ...state,
      fatalError: 'The active responder could not be resolved for this session.',
    };
  }

  const roundConfig = ROUND_CONFIG[currentQuestion.round];
  const basePoints =
    currentQuestion.turnKind === 'original' ? roundConfig.originalPoints : roundConfig.stealPoints;
  const remainingMs = Math.max(currentQuestion.deadlineAt - Date.now(), 0);
  const { bonus: speedBonus, tier: speedTier } = getSpeedBonus(currentQuestion.turnKind, remainingMs);
  const awardedPoints = basePoints + speedBonus;

  const updatedPlayers = state.players.map((player) =>
    player.id === responder.id ? { ...player, score: player.score + awardedPoints } : player,
  );

  const resolution = {
    outcome: 'correct' as const,
    correctAnswer: question.correctAnswer,
    basePoints,
    speedBonus,
    speedTier,
    awardedPoints,
    resolvedByPlayerId: responder.id,
    turnKind: currentQuestion.turnKind,
    resolvedAt: Date.now(),
  };

  return {
    ...state,
    players: updatedPlayers,
    currentQuestion: {
      ...currentQuestion,
      resolution,
    },
    roundResults: [
      ...state.roundResults,
      {
        questionId: question.id,
        round: currentQuestion.round,
        category: question.category,
        correctAnswer: question.correctAnswer,
        basePoints,
        speedBonus,
        awardedPoints,
        resolvedByPlayerId: responder.id,
        turnKind: currentQuestion.turnKind,
        outcome: 'correct',
      },
    ],
  };
}

function resolveFailedAttempt(state: GameState, reason: FailureReason, choice: string | null): GameState {
  const currentQuestion = state.currentQuestion;
  if (!currentQuestion) {
    return state;
  }

  const activePlayers = getActivePlayers(state.players, state.selectedPlayerIds);
  const currentPlayer = activePlayers[currentQuestion.currentResponderIndex];
  if (!currentPlayer) {
    return {
      ...state,
      fatalError: 'The active responder could not be resolved for this session.',
    };
  }

  const nextFailedIds = currentQuestion.failedPlayerIds.includes(currentPlayer.id)
    ? currentQuestion.failedPlayerIds
    : [...currentQuestion.failedPlayerIds, currentPlayer.id];
  const nextResponderIndex = findNextEligibleResponder(activePlayers, currentQuestion.currentResponderIndex, nextFailedIds);
  const now = Date.now();

  if (nextResponderIndex === null) {
    const question = QUESTION_LOOKUP[currentQuestion.questionId];
    if (!question) {
      return {
        ...state,
        fatalError: 'That question no longer exists in the local dataset.',
      };
    }

    return {
      ...state,
      currentQuestion: {
        ...currentQuestion,
        failedPlayerIds: nextFailedIds,
        lockedChoice: choice,
        latestFailure: {
          playerId: currentPlayer.id,
          reason,
          choice,
          occurredAt: now,
        },
        resolution: {
          outcome: 'allFailed',
          correctAnswer: question.correctAnswer,
          basePoints: 0,
          speedBonus: 0,
          speedTier: 'none',
          awardedPoints: 0,
          resolvedByPlayerId: null,
          turnKind: null,
          resolvedAt: now,
        },
      },
      roundResults: [
        ...state.roundResults,
        {
          questionId: question.id,
          round: currentQuestion.round,
          category: question.category,
          correctAnswer: question.correctAnswer,
          basePoints: 0,
          speedBonus: 0,
          awardedPoints: 0,
          resolvedByPlayerId: null,
          turnKind: null,
          outcome: 'allFailed',
        },
      ],
    };
  }

  return {
    ...state,
    currentQuestion: {
      ...currentQuestion,
      turnKind: 'steal',
      currentResponderIndex: nextResponderIndex,
      failedPlayerIds: nextFailedIds,
      lockedChoice: null,
      turnToken: makeId('turn'),
      turnStartedAt: now,
      deadlineAt: now + STEAL_TURN_MS,
      pausedRemainingMs: null,
      latestFailure: {
        playerId: currentPlayer.id,
        reason,
        choice,
        occurredAt: now,
      },
    },
  };
}

function getSpeedBonus(turnKind: QuestionState['turnKind'], remainingMs: number): { bonus: number; tier: SpeedTier } {
  const totalMs = turnKind === 'original' ? ORIGINAL_TURN_MS : STEAL_TURN_MS;
  const ratio = remainingMs / totalMs;
  const tierConfig =
    SPEED_BONUS_TIERS.find((candidate) => ratio >= candidate.threshold) ??
    SPEED_BONUS_TIERS[SPEED_BONUS_TIERS.length - 1];

  return {
    bonus: turnKind === 'original' ? tierConfig.originalBonus : tierConfig.stealBonus,
    tier: tierConfig.tier,
  };
}

function findNextEligibleResponder(players: Player[], currentResponderIndex: number, failedPlayerIds: string[]) {
  const failedSet = new Set(failedPlayerIds);
  for (let step = 1; step <= players.length; step += 1) {
    const nextIndex = (currentResponderIndex + step) % players.length;
    if (!failedSet.has(players[nextIndex].id)) {
      return nextIndex;
    }
  }

  return null;
}

function buildWinnerSnapshot(players: Player[]): WinnerSnapshot {
  const rankings = rankPlayers(players);
  const topScore = rankings[0]?.score ?? 0;
  const winnerIds = rankings.filter((player) => player.score === topScore).map((player) => player.id);

  return {
    rankings,
    topScore,
    winnerIds,
  };
}

function selectQuestionsForRound(
  difficulties: ReadonlyArray<Question['difficulty']>,
  count: number,
  usedQuestionIds: Set<string>,
  random: () => number,
) {
  const available = QUESTION_POOL.filter(
    (question) => difficulties.includes(question.difficulty) && !usedQuestionIds.has(question.id),
  );

  if (available.length < count) {
    throw new Error(`Not enough questions available for ${difficulties.join('/')} difficulty.`);
  }

  const selected = shuffle(available, random).slice(0, count);
  selected.forEach((question) => usedQuestionIds.add(question.id));
  return selected;
}
