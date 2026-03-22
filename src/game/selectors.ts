import { ANSWER_HOTKEYS, PLAYER_IDENTITIES, ROUND_CONFIG } from './constants';
import { QUESTION_LOOKUP } from './questions';
import type {
  GameState,
  Player,
  PlayerCount,
  Question,
  QuestionPlanItem,
  RankedPlayer,
  RoundNumber,
} from './types';

export function getActivePlayers(players: Player[], playerCount: PlayerCount) {
  return players.slice(0, playerCount);
}

export function getQuestionByPlanItem(planItem: QuestionPlanItem): Question {
  const question = QUESTION_LOOKUP[planItem.questionId];
  if (!question) {
    throw new Error(`Question ${planItem.questionId} is missing from the local dataset.`);
  }
  return {
    ...question,
    choices: planItem.choiceOrder,
  };
}

export function getCurrentPlanItem(state: GameState) {
  return state.questionPlan[state.currentQuestionCursor] ?? null;
}

export function getCurrentQuestion(state: GameState) {
  const planItem = getCurrentPlanItem(state);
  return planItem ? getQuestionByPlanItem(planItem) : null;
}

export function getUpcomingRoundPlan(state: GameState, round = state.round) {
  return state.questionPlan.filter((item) => item.round === round);
}

export function getRoundProgress(state: GameState) {
  const roundItems = getUpcomingRoundPlan(state, state.round);
  const completedThisRound = state.roundResults.filter((result) => result.round === state.round).length;
  return {
    completed: completedThisRound,
    total: roundItems.length,
    remaining: Math.max(roundItems.length - completedThisRound, 0),
  };
}

export function getEligibleStealPlayers(state: GameState) {
  if (!state.currentQuestion) {
    return [];
  }

  const failedIds = new Set(state.currentQuestion.failedPlayerIds);
  return getActivePlayers(state.players, state.playerCount).filter((player) => !failedIds.has(player.id));
}

export function getActivePlayer(state: GameState) {
  if (!state.currentQuestion) {
    return null;
  }

  return getActivePlayers(state.players, state.playerCount)[state.currentQuestion.currentResponderIndex] ?? null;
}

export function getStarterForCurrentQuestion(state: GameState) {
  if (!state.currentQuestion) {
    return null;
  }

  return getActivePlayers(state.players, state.playerCount)[state.currentQuestion.starterIndex] ?? null;
}

export function getRoundPoints(round: RoundNumber, isSteal: boolean) {
  const config = ROUND_CONFIG[round];
  return isSteal ? config.stealPoints : config.originalPoints;
}

export function getPlayerIdentityLabel(player: Player) {
  return PLAYER_IDENTITIES.find((identity) => identity.seat === player.seat)?.label ?? `Player ${player.seat}`;
}

export function getAnswerChoicesWithHotkeys(question: Question) {
  return question.choices.map((choice, index) => ({
    id: `${question.id}-${index}`,
    label: choice,
    hotkey: ANSWER_HOTKEYS[index],
  }));
}

export function rankPlayers(players: Player[]): RankedPlayer[] {
  const ordered = players
    .map((player, originalIndex) => ({ player, originalIndex }))
    .sort((left, right) => {
      if (right.player.score !== left.player.score) {
        return right.player.score - left.player.score;
      }

      return left.originalIndex - right.originalIndex;
    });

  let previousScore: number | null = null;
  let previousPlacement = 0;

  return ordered.map(({ player }, index, all) => {
    const placement = previousScore === player.score ? previousPlacement : index + 1;
    previousScore = player.score;
    previousPlacement = placement;

    const tied =
      all.some((candidate, candidateIndex) => candidateIndex !== index && candidate.player.score === player.score);

    return {
      ...player,
      placement,
      rankLabel: tied ? `T-${placement}` : ordinal(placement),
      tied,
    };
  });
}

function ordinal(value: number) {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${value}st`;
  }
  if (mod10 === 2 && mod100 !== 12) {
    return `${value}nd`;
  }
  if (mod10 === 3 && mod100 !== 13) {
    return `${value}rd`;
  }
  return `${value}th`;
}
