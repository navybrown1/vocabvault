import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducer } from 'react';
import {
  ORIGINAL_TICK_FROM_SECONDS,
  ORIGINAL_WARNING_MS,
  PLAYER_COUNT,
  STEAL_TICK_FROM_SECONDS,
  STEAL_WARNING_MS,
} from '@/game/constants';
import { createInitialState, gameReducer, reconcileExpiredTurns, restorePersistedState, validatePlayersForStart } from '@/game/engine';
import { createSoundController } from '@/game/sound';
import { clearPersistedSession, loadPersistedSession, savePersistedSession } from '@/game/storage';
import {
  getActivePlayer,
  getActivePlayers,
  getCurrentQuestion,
  getEligibleStealPlayers,
  getPlayerIdentityLabel,
  getRoundProgress,
  rankPlayers,
} from '@/game/selectors';
import type { GameAction, GameState } from '@/game/types';

export function useGameSession() {
  const initializer = () => {
    const session = loadPersistedSession();
    return session ? restorePersistedState(session) : createInitialState(true);
  };

  const [state, dispatch] = useReducer(gameReducer, undefined, initializer);
  const [storageIssue, setStorageIssue] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const soundControllerRef = useRef(createSoundController());
  const lastResolutionRef = useRef<number | null>(null);
  const lastTurnTokenRef = useRef<string | null>(null);
  const countdownSecondRef = useRef<number | null>(null);
  const phaseSoundRef = useRef<string | null>(null);

  useEffect(() => {
    setIsReady(true);
    return () => soundControllerRef.current.dispose();
  }, []);

  useEffect(() => {
    const reconciled = reconcileExpiredTurns(state);
    if (reconciled !== state) {
      dispatch({ type: 'HYDRATE_SESSION', session: reconciled });
    }
  }, [state]);

  useEffect(() => {
    try {
      savePersistedSession(state);
      setStorageIssue(null);
    } catch (error) {
      setStorageIssue(error instanceof Error ? error.message : 'Unable to save the local session.');
    }
  }, [state]);

  useEffect(() => {
    const activeQuestion = state.currentQuestion;
    if (
      state.gamePhase !== 'gameplay' ||
      !activeQuestion ||
      activeQuestion.resolution ||
      !activeQuestion.turnToken
    ) {
      countdownSecondRef.current = null;
      return;
    }

    const warningThresholdSeconds = activeQuestion.turnKind === 'original'
      ? Math.ceil(ORIGINAL_WARNING_MS / 1_000)
      : Math.ceil(STEAL_WARNING_MS / 1_000);
    const countdownTickFrom = activeQuestion.turnKind === 'original' ? ORIGINAL_TICK_FROM_SECONDS : STEAL_TICK_FROM_SECONDS;
    const interval = window.setInterval(() => {
      const remainingMs = Math.max(activeQuestion.deadlineAt - Date.now(), 0);
      const remainingSeconds = Math.ceil(remainingMs / 1_000);

      if (remainingMs <= 0) {
        return;
      }

      if (remainingSeconds <= countdownTickFrom && countdownSecondRef.current !== remainingSeconds) {
        countdownSecondRef.current = remainingSeconds;
        soundControllerRef.current.play('countdownTick', state.soundEnabled);
      }

      if (remainingSeconds === warningThresholdSeconds && countdownSecondRef.current !== -warningThresholdSeconds) {
        countdownSecondRef.current = -warningThresholdSeconds;
        soundControllerRef.current.play('timerWarning', state.soundEnabled);
      }
    }, 160);

    return () => window.clearInterval(interval);
  }, [state.currentQuestion, state.gamePhase, state.soundEnabled]);

  useEffect(() => {
    const currentQuestion = state.currentQuestion;
    if (!currentQuestion) {
      lastTurnTokenRef.current = null;
      return;
    }

    if (currentQuestion.turnToken !== lastTurnTokenRef.current) {
      soundControllerRef.current.play('turnStart', state.soundEnabled);
      if (currentQuestion.turnKind === 'steal' && currentQuestion.failedPlayerIds.length > 0) {
        soundControllerRef.current.play('stealActivation', state.soundEnabled);
      }
      lastTurnTokenRef.current = currentQuestion.turnToken;
    }
  }, [state.currentQuestion, state.soundEnabled]);

  useEffect(() => {
    const resolutionAt = state.currentQuestion?.resolution?.resolvedAt ?? null;
    if (!resolutionAt || lastResolutionRef.current === resolutionAt) {
      return;
    }

    const outcome = state.currentQuestion?.resolution?.outcome;
    soundControllerRef.current.play(outcome === 'correct' ? 'correctAnswer' : 'wrongAnswer', state.soundEnabled);
    lastResolutionRef.current = resolutionAt;
  }, [state.currentQuestion, state.soundEnabled]);

  useEffect(() => {
    const phaseKey = `${state.gamePhase}-${state.round}`;
    if (phaseSoundRef.current === phaseKey) {
      return;
    }

    if (state.gamePhase === 'roundTransition') {
      soundControllerRef.current.play('roundTransition', state.soundEnabled);
    }
    if (state.gamePhase === 'winner') {
      soundControllerRef.current.play('winnerCelebration', state.soundEnabled);
    }

    phaseSoundRef.current = phaseKey;
  }, [state.gamePhase, state.round, state.soundEnabled]);

  useEffect(() => {
    if (
      state.gamePhase !== 'gameplay' ||
      !state.currentQuestion ||
      state.currentQuestion.resolution
    ) {
      return;
    }

    const remainingMs = state.currentQuestion.deadlineAt - Date.now();
    const timeout = window.setTimeout(() => {
      dispatch({ type: 'TIME_EXPIRED', turnToken: state.currentQuestion?.turnToken ?? '' });
    }, Math.max(remainingMs, 0));

    return () => window.clearTimeout(timeout);
  }, [state.gamePhase, state.currentQuestion]);

  const derived = useMemo(() => {
    const activePlayers = getActivePlayers(state.players, state.playerCount);
    const currentQuestion = getCurrentQuestion(state);
    return {
      activePlayers,
      currentQuestion,
      rankings: rankPlayers(activePlayers),
      roundProgress: getRoundProgress(state),
      activePlayer: getActivePlayer(state),
      eligibleStealPlayers: getEligibleStealPlayers(state),
      canStartGame: validatePlayersForStart(state.players, state.playerCount),
      playerIdentityLabels: activePlayers.reduce<Record<string, string>>((labels, player) => {
        labels[player.id] = getPlayerIdentityLabel(player);
        return labels;
      }, {}),
    };
  }, [state]);

  const actions = {
    goToSetup: () => {
      soundControllerRef.current.play('buttonClick', state.soundEnabled);
      dispatch({ type: 'GO_TO_SETUP' });
    },
    setPlayerCount: (count: GameState['playerCount']) => {
      soundControllerRef.current.play('buttonClick', state.soundEnabled);
      dispatch({ type: 'SET_PLAYER_COUNT', count });
    },
    updatePlayerName: (playerId: string, name: string) => {
      dispatch({ type: 'UPDATE_PLAYER_NAME', playerId, name });
    },
    updatePlayerAvatar: (playerId: string, avatarDataUrl: string | null, hasUploadedImage: boolean) => {
      dispatch({ type: 'UPDATE_PLAYER_AVATAR', playerId, avatarDataUrl, hasUploadedImage });
    },
    startGame: () => {
      soundControllerRef.current.play('buttonClick', state.soundEnabled);
      dispatch({ type: 'START_GAME' });
    },
    beginRound: () => {
      soundControllerRef.current.play('buttonClick', state.soundEnabled);
      dispatch({ type: 'BEGIN_ROUND' });
    },
    submitAnswer: (choice: string) => {
      soundControllerRef.current.play('answerSelect', state.soundEnabled);
      dispatch({ type: 'SUBMIT_ANSWER', choice });
    },
    continueAfterQuestion: () => {
      soundControllerRef.current.play('buttonClick', state.soundEnabled);
      dispatch({ type: 'CONTINUE_AFTER_QUESTION' });
    },
    toggleSound: () => {
      if (!state.soundEnabled) {
        soundControllerRef.current.play('buttonClick', true);
      }
      dispatch({ type: 'TOGGLE_SOUND' });
    },
    resetSession: () => {
      soundControllerRef.current.play('buttonClick', state.soundEnabled);
      clearPersistedSession();
      dispatch({ type: 'RESET_SESSION' });
    },
    hydrateSession: (session: GameState) => {
      dispatch({ type: 'HYDRATE_SESSION', session });
    },
    setFatalError: (message: string | null) => {
      dispatch({ type: 'SET_FATAL_ERROR', message });
    },
  };

  const validation = buildSetupValidation(state.players, state.playerCount);

  return {
    state,
    actions,
    derived,
    validation,
    storageIssue,
    isReady,
    playerCount: state.playerCount,
    seatCount: PLAYER_COUNT,
  };
}

function buildSetupValidation(players: GameState['players'], playerCount: GameState['playerCount']) {
  const activePlayers = getActivePlayers(players, playerCount);
  const normalizedNames = activePlayers.map((player) => player.name.trim().toLowerCase());
  const activePlayerIds = new Set(activePlayers.map((player) => player.id));

  return players.reduce<
    Record<
      string,
      {
        nameError: string | null;
        avatarError: string | null;
        isComplete: boolean;
      }
    >
  >((result, player, index) => {
    const isSelected = activePlayerIds.has(player.id);
    if (!isSelected) {
      result[player.id] = {
        nameError: null,
        avatarError: null,
        isComplete: false,
      };
      return result;
    }

    const trimmedName = player.name.trim();
    const duplicate =
      trimmedName.length > 0 &&
      normalizedNames.some(
        (candidate, candidateIndex) =>
          activePlayers[candidateIndex]?.id !== player.id && candidate === trimmedName.toLowerCase(),
      );

    const nameError = !trimmedName ? 'Add a name for this player.' : duplicate ? 'Each player needs a unique name.' : null;
    const avatarError =
      player.hasUploadedImage && player.avatarDataUrl
        ? null
        : 'Upload a photo before starting the show.';

    result[player.id] = {
      nameError,
      avatarError,
      isComplete: !nameError && !avatarError,
    };

    return result;
  }, {});
}
