import {
  BRAND_NAME,
  DEFAULT_PLAYER_COUNT,
  FAMILY_PLAYER_PRESETS,
  ORIGINAL_TURN_MS,
  PLAYER_COUNT,
  PLAYER_IDENTITIES,
  QUESTIONS_PER_ROUND,
  REVEAL_COPY,
  ROUND_CONFIG,
  SESSION_VERSION,
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
  PlayerCount,
  PersistedSession,
  Player,
  Question,
  QuestionPlanItem,
  QuestionResult,
  QuestionState,
  RoundNumber,
  TurnKind,
  WinnerSnapshot,
} from './types';

function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createInitialState(soundEnabled = true): GameState {
  return {
    version: SESSION_VERSION,
    brand: BRAND_NAME,
    gamePhase: 'welcome',
    players: createEmptyPlayers(),
    playerCount: DEFAULT_PLAYER_COUNT,
    soundEnabled,
    round: 1,
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
      if (!validatePlayersForStart(state.players, state.playerCount)) {
        return state;
      }

      try {
        const seed = action.seed ?? createSessionSeed();
        const questionPlan = buildQuestionPlan(seed, state.playerCount);
        return {
          ...state,
          players: state.players.map((player) => ({ ...player, score: 0 })),
          gamePhase: 'categoryOrStart',
          round: 1,
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

    case 'SUBMIT_ANSWER': {
      if (state.gamePhase !== 'gameplay' || !state.currentQuestion || state.currentQuestion.resolution) {
        return state;
      }

      const question = QUESTION_LOOKUP[state.currentQuestion.questionId];
      if (!question) {
        return state;
      }

      const choice = action.choice;
      const lockedState = {
        ...state,
        currentQuestion: {
          ...state.currentQuestion,
          lockedChoice: choice,
        },
      };

      if (choice === question.correctAnswer) {
        return resolveCorrectAnswer(lockedState, question);
      }

      return resolveFailedAttempt(lockedState, 'wrong', choice);
    }

    case 'TIME_EXPIRED': {
      if (state.gamePhase !== 'gameplay' || !state.currentQuestion || state.currentQuestion.resolution) {
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
          winnerSnapshot: buildWinnerSnapshot(getActivePlayers(state.players, state.playerCount)),
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

      const resetState = {
        ...state,
        currentQuestionCursor: nextCursor,
      };
      return startQuestionAtCursor(resetState, nextCursor);
    }

    case 'TOGGLE_SOUND':
      return {
        ...state,
        soundEnabled: !state.soundEnabled,
      };

    case 'HYDRATE_SESSION':
      return {
        ...action.session,
        fatalError: null,
      };

    case 'SET_FATAL_ERROR':
      return {
        ...state,
        fatalError: action.message,
      };

    case 'RESET_SESSION':
      return createInitialState(state.soundEnabled);

    default:
      return state;
  }
}

export function reconcileExpiredTurns(state: GameState, now = Date.now()): GameState {
  let nextState = state;
  let safety = state.playerCount + 1;

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

export function validatePlayersForStart(players: Player[], playerCount: PlayerCount) {
  if (playerCount < 1 || playerCount > PLAYER_COUNT) {
    return false;
  }

  const activePlayers = getActivePlayers(players, playerCount);
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

export function buildQuestionPlan(
  seed = createSessionSeed(),
  playerCount: PlayerCount = DEFAULT_PLAYER_COUNT,
): QuestionPlanItem[] {
  if (playerCount < 1 || playerCount > PLAYER_COUNT) {
    throw new Error('The selected player count is outside the supported range.');
  }

  const rng = mulberry32(seed);
  const plan: QuestionPlanItem[] = [];
  const usedQuestionIds = new Set<string>();

  let globalIndex = 0;
  const roundSelections: Record<RoundNumber, Question[]> = {
    1: selectQuestionsForRound(['easy'], QUESTIONS_PER_ROUND, usedQuestionIds, rng),
    2: selectQuestionsForRound(['medium'], QUESTIONS_PER_ROUND, usedQuestionIds, rng),
    // The imported bank only ships with five `hard` questions, so the final round
    // guarantees two hard prompts and fills the rest from unused medium/hard prompts
    // to keep sessions feeling varied instead of nearly identical.
    3: selectFinalRoundQuestions(usedQuestionIds, rng),
  };

  ([1, 2, 3] as const).forEach((round) => {
    roundSelections[round].forEach((question) => {
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

export function createEmptyPlayers(): Player[] {
  return PLAYER_IDENTITIES.map((identity, index) => ({
    id: `player-${index + 1}`,
    seat: identity.seat,
    color: identity.color,
    name: FAMILY_PLAYER_PRESETS[index]?.name ?? '',
    avatarDataUrl: FAMILY_PLAYER_PRESETS[index]?.avatarSrc ?? null,
    hasUploadedImage: Boolean(FAMILY_PLAYER_PRESETS[index]?.avatarSrc),
    score: 0,
  }));
}

function startQuestionAtCursor(state: GameState, cursor: number): GameState {
  const planItem = state.questionPlan[cursor];
  const question = QUESTION_LOOKUP[planItem.questionId];

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

  const activePlayers = getActivePlayers(state.players, state.playerCount);
  const responder = activePlayers[currentQuestion.currentResponderIndex];
  if (!responder) {
    return {
      ...state,
      fatalError: 'The active responder could not be resolved for this session.',
    };
  }
  const points =
    currentQuestion.turnKind === 'original'
      ? ROUND_CONFIG[currentQuestion.round].originalPoints
      : ROUND_CONFIG[currentQuestion.round].stealPoints;

  const updatedPlayers = state.players.map((player) =>
    player.id === responder.id ? { ...player, score: player.score + points } : player,
  );

  const resolution = {
    outcome: 'correct' as const,
    correctAnswer: question.correctAnswer,
    awardedPoints: points,
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
        awardedPoints: points,
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

  const activePlayers = getActivePlayers(state.players, state.playerCount);
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
      latestFailure: {
        playerId: currentPlayer.id,
        reason,
        choice,
        occurredAt: now,
      },
    },
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

function selectFinalRoundQuestions(usedQuestionIds: Set<string>, random: () => number) {
  const availableHardCount = QUESTION_POOL.filter(
    (question) => question.difficulty === 'hard' && !usedQuestionIds.has(question.id),
  ).length;

  if (availableHardCount >= QUESTIONS_PER_ROUND * 2) {
    return selectQuestionsForRound(['hard'], QUESTIONS_PER_ROUND, usedQuestionIds, random);
  }

  const guaranteedHard = selectQuestionsForRound(['hard'], Math.min(2, QUESTIONS_PER_ROUND), usedQuestionIds, random);
  const remainingCount = QUESTIONS_PER_ROUND - guaranteedHard.length;

  if (remainingCount <= 0) {
    return guaranteedHard;
  }

  const bonusPool = QUESTION_POOL.filter(
    (question) =>
      !usedQuestionIds.has(question.id) &&
      (question.difficulty === 'hard' || question.difficulty === 'medium'),
  );

  if (bonusPool.length < remainingCount) {
    throw new Error('Not enough medium/hard questions are available to build the final round.');
  }

  const bonusSelection = shuffle(bonusPool, random).slice(0, remainingCount);
  bonusSelection.forEach((question) => usedQuestionIds.add(question.id));

  return shuffle([...guaranteedHard, ...bonusSelection], random);
}

export function getQuestionFeedbackLabel(state: GameState) {
  if (!state.currentQuestion?.resolution) {
    return null;
  }

  return state.currentQuestion.resolution.outcome === 'allFailed' ? REVEAL_COPY.allFailed : REVEAL_COPY.correct;
}

export function restorePersistedState(session: PersistedSession) {
  return reconcileExpiredTurns({
    ...session,
    fatalError: null,
  });
}
