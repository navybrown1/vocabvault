import { describe, expect, it } from 'vitest';
import { buildQuestionPlan, createInitialState, gameReducer, reconcileExpiredTurns } from '../src/game/engine';
import { QUESTION_LOOKUP } from '../src/game/questions';
import { getQuestionByPlanItem } from '../src/game/selectors';

function createReadyState(playerCount: 1 | 2 | 3 | 4 = 4) {
  let state = createInitialState(true);
  state = gameReducer(state, { type: 'GO_TO_SETUP' });
  state = gameReducer(state, { type: 'SET_PLAYER_COUNT', count: playerCount });

  state.players.forEach((player, index) => {
    state = gameReducer(state, {
      type: 'UPDATE_PLAYER_NAME',
      playerId: player.id,
      name: `Player ${index + 1}`,
    });
    state = gameReducer(state, {
      type: 'UPDATE_PLAYER_AVATAR',
      playerId: player.id,
      avatarDataUrl: `data:image/webp;base64,seat-${index + 1}`,
      hasUploadedImage: true,
    });
  });

  state.players.slice(0, playerCount).forEach((player) => {
    state = gameReducer(state, { type: 'TOGGLE_PLAYER_SELECTION', playerId: player.id });
  });

  return state;
}

describe('game engine', () => {
  it('builds a 12-question plan with unique questions and rotating starters', () => {
    const plan = buildQuestionPlan(7);
    expect(plan).toHaveLength(12);
    expect(new Set(plan.map((item) => item.questionId)).size).toBe(12);
    expect(plan.map((item) => item.starterIndex)).toEqual([0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3]);
    expect(plan.filter((item) => item.round === 1)).toHaveLength(4);
    expect(plan.filter((item) => item.round === 2)).toHaveLength(4);
    expect(plan.filter((item) => item.round === 3)).toHaveLength(4);
    expect(plan.every((item) => item.choiceOrder.length === 4)).toBe(true);
    expect(
      plan.some((item) => item.choiceOrder.indexOf(QUESTION_LOOKUP[item.questionId].correctAnswer) !== 0),
    ).toBe(true);
  });

  it('changes the question selection and answer positions across different seeds', () => {
    const planA = buildQuestionPlan(7);
    const planB = buildQuestionPlan(8);

    expect(planA.map((item) => item.questionId)).not.toEqual(planB.map((item) => item.questionId));
    expect(planA.map((item) => item.choiceOrder)).not.toEqual(planB.map((item) => item.choiceOrder));
  });

  it('rotates starters only across the selected player count', () => {
    const plan = buildQuestionPlan(11, 3);
    expect(plan.map((item) => item.starterIndex)).toEqual([0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2]);
  });

  it('does not auto-select family members when the player count changes', () => {
    let state = createInitialState(true);
    state = gameReducer(state, { type: 'GO_TO_SETUP' });
    state = gameReducer(state, { type: 'SET_PLAYER_COUNT', count: 2 });

    expect(state.selectedPlayerIds).toEqual([]);
  });

  it('awards full points for a correct original answer', () => {
    let state = createReadyState();
    state = gameReducer(state, { type: 'START_GAME', seed: 2 });
    state = gameReducer(state, { type: 'BEGIN_ROUND' });

    const currentQuestion = state.currentQuestion!;
    const question = QUESTION_LOOKUP[currentQuestion.questionId];
    state = gameReducer(state, { type: 'SUBMIT_ANSWER', choice: question.correctAnswer });

    expect(state.currentQuestion?.resolution?.outcome).toBe('correct');
    expect(state.players[0].score).toBe(100);
    expect(state.currentQuestion?.resolution?.awardedPoints).toBe(100);
  });

  it('passes steals clockwise and resolves all-fail with zero points', () => {
    let state = createReadyState();
    state = gameReducer(state, { type: 'START_GAME', seed: 4 });
    state = gameReducer(state, { type: 'BEGIN_ROUND' });

    const question = QUESTION_LOOKUP[state.currentQuestion!.questionId];
    const wrongChoices = question.choices.filter((choice) => choice !== question.correctAnswer);

    state = gameReducer(state, { type: 'SUBMIT_ANSWER', choice: wrongChoices[0] });
    expect(state.currentQuestion?.turnKind).toBe('steal');
    expect(state.currentQuestion?.currentResponderIndex).toBe(1);
    expect(state.currentQuestion?.failedPlayerIds).toEqual(['player-1']);

    state = gameReducer(state, { type: 'SUBMIT_ANSWER', choice: wrongChoices[1] });
    expect(state.currentQuestion?.currentResponderIndex).toBe(2);
    expect(state.currentQuestion?.failedPlayerIds).toEqual(['player-1', 'player-2']);

    state = gameReducer(state, { type: 'SUBMIT_ANSWER', choice: wrongChoices[2] });
    expect(state.currentQuestion?.currentResponderIndex).toBe(3);
    expect(state.currentQuestion?.failedPlayerIds).toEqual(['player-1', 'player-2', 'player-3']);

    state = gameReducer(state, { type: 'SUBMIT_ANSWER', choice: wrongChoices[0] });
    expect(state.currentQuestion?.resolution?.outcome).toBe('allFailed');
    expect(state.currentQuestion?.resolution?.awardedPoints).toBe(0);
    expect(state.players.every((player) => player.score === 0)).toBe(true);
  });

  it('uses only the selected players during steal rotation', () => {
    let state = createReadyState(2);
    state = gameReducer(state, { type: 'TOGGLE_PLAYER_SELECTION', playerId: 'player-2' });
    state = gameReducer(state, { type: 'TOGGLE_PLAYER_SELECTION', playerId: 'player-3' });
    state = gameReducer(state, { type: 'START_GAME', seed: 6 });
    state = gameReducer(state, { type: 'BEGIN_ROUND' });

    const question = QUESTION_LOOKUP[state.currentQuestion!.questionId];
    const wrongChoice = question.choices.find((choice) => choice !== question.correctAnswer)!;

    state = gameReducer(state, { type: 'SUBMIT_ANSWER', choice: wrongChoice });
    expect(state.currentQuestion?.turnKind).toBe('steal');
    expect(state.currentQuestion?.currentResponderIndex).toBe(1);
    expect(state.currentQuestion?.failedPlayerIds).toEqual(['player-1']);

    state = gameReducer(state, { type: 'SUBMIT_ANSWER', choice: wrongChoice });
    expect(state.currentQuestion?.resolution?.outcome).toBe('allFailed');
    expect(state.currentQuestion?.failedPlayerIds).toEqual(['player-1', 'player-3']);
  });

  it('lets a one-player lineup swap directly to a different family member', () => {
    let state = createReadyState(1);

    state = gameReducer(state, { type: 'TOGGLE_PLAYER_SELECTION', playerId: 'player-3' });

    expect(state.selectedPlayerIds).toEqual(['player-3']);
    state = gameReducer(state, { type: 'START_GAME', seed: 12 });
    state = gameReducer(state, { type: 'BEGIN_ROUND' });
    expect(state.currentQuestion?.currentResponderIndex).toBe(0);
  });

  it('prevents selecting more players than the requested lineup size', () => {
    let state = createReadyState(3);

    state = gameReducer(state, { type: 'TOGGLE_PLAYER_SELECTION', playerId: 'player-4' });

    expect(state.selectedPlayerIds).toEqual(['player-1', 'player-2', 'player-3']);
  });

  it('treats a solo wrong answer as an immediate all-fail resolution', () => {
    let state = createReadyState(1);
    state = gameReducer(state, { type: 'START_GAME', seed: 10 });
    state = gameReducer(state, { type: 'BEGIN_ROUND' });

    const question = QUESTION_LOOKUP[state.currentQuestion!.questionId];
    const wrongChoice = question.choices.find((choice) => choice !== question.correctAnswer)!;

    state = gameReducer(state, { type: 'SUBMIT_ANSWER', choice: wrongChoice });
    expect(state.currentQuestion?.resolution?.outcome).toBe('allFailed');
    expect(state.currentQuestion?.resolution?.awardedPoints).toBe(0);
    expect(state.currentQuestion?.failedPlayerIds).toEqual(['player-1']);
  });

  it('serves shuffled choices from the persisted plan rather than the bank order', () => {
    let state = createReadyState();
    state = gameReducer(state, { type: 'START_GAME', seed: 9 });

    const planItem = state.questionPlan[0];
    const viewQuestion = getQuestionByPlanItem(planItem);
    const bankQuestion = QUESTION_LOOKUP[planItem.questionId];

    expect(viewQuestion.choices).toEqual(planItem.choiceOrder);
    expect(viewQuestion.correctAnswer).toBe(bankQuestion.correctAnswer);
    expect(state.questionPlan.some((item) => item.choiceOrder.join('|') !== QUESTION_LOOKUP[item.questionId].choices.join('|'))).toBe(true);
  });

  it('ignores stale timeout tokens', () => {
    let state = createReadyState();
    state = gameReducer(state, { type: 'START_GAME', seed: 3 });
    state = gameReducer(state, { type: 'BEGIN_ROUND' });

    const originalToken = state.currentQuestion!.turnToken;
    state = gameReducer(state, { type: 'TIME_EXPIRED', turnToken: 'stale-token' });
    expect(state.currentQuestion?.turnToken).toBe(originalToken);
    expect(state.currentQuestion?.failedPlayerIds).toEqual([]);
  });

  it('pauses and resumes the active timer without changing the turn owner', () => {
    let state = createReadyState();
    state = gameReducer(state, { type: 'START_GAME', seed: 3 });
    state = gameReducer(state, { type: 'BEGIN_ROUND' });

    const originalResponderIndex = state.currentQuestion!.currentResponderIndex;
    state = gameReducer(state, { type: 'TOGGLE_PAUSE' });

    expect(state.currentQuestion?.pausedRemainingMs).not.toBeNull();

    const pausedState = gameReducer(state, {
      type: 'TIME_EXPIRED',
      turnToken: state.currentQuestion!.turnToken,
    });
    expect(pausedState.currentQuestion?.currentResponderIndex).toBe(originalResponderIndex);
    expect(pausedState.currentQuestion?.failedPlayerIds).toEqual([]);

    const resumedState = gameReducer(state, { type: 'TOGGLE_PAUSE' });
    expect(resumedState.currentQuestion?.pausedRemainingMs).toBeNull();
    expect(resumedState.currentQuestion?.currentResponderIndex).toBe(originalResponderIndex);
  });

  it('reconciles expired turns after refresh and advances to the next responder', () => {
    let state = createReadyState();
    state = gameReducer(state, { type: 'START_GAME', seed: 5 });
    state = gameReducer(state, { type: 'BEGIN_ROUND' });

    const expiredState = {
      ...state,
      currentQuestion: {
        ...state.currentQuestion!,
        deadlineAt: Date.now() - 1_000,
      },
    };

    const reconciled = reconcileExpiredTurns(expiredState, Date.now());
    expect(reconciled.currentQuestion?.turnKind).toBe('steal');
    expect(reconciled.currentQuestion?.currentResponderIndex).toBe(1);
    expect(reconciled.currentQuestion?.failedPlayerIds).toEqual(['player-1']);
  });
});
