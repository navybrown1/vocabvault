import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, LoaderCircle, RefreshCcw } from 'lucide-react';
import { normalizeAvatarFile } from '@/game/avatar';
import { ROUND_CONFIG } from '@/game/constants';
import { QUESTION_LOOKUP } from '@/game/questions';
import { rankPlayers } from '@/game/selectors';
import { useCountdown } from '@/hooks/useCountdown';
import { useGameSession } from '@/hooks/useGameSession';
import { GameShell } from '@/components/GameShell';
import { GlassPanel } from '@/components/GlassPanel';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { PlayerSetupScreen } from '@/screens/PlayerSetupScreen';
import { CategoryOrStartScreen } from '@/screens/CategoryOrStartScreen';
import { GameplayScreen } from '@/screens/GameplayScreen';
import { RoundTransitionScreen } from '@/screens/RoundTransitionScreen';
import { WinnerScreen } from '@/screens/WinnerScreen';

export default function App() {
  const { state, actions, derived, validation, storageIssue, isReady } = useGameSession();
  const [uploadIssues, setUploadIssues] = useState<Record<string, string | null>>({});

  const countdown = useCountdown({
    deadlineAt: state.currentQuestion?.deadlineAt ?? null,
    active:
      state.gamePhase === 'gameplay' &&
      Boolean(state.currentQuestion) &&
      !state.currentQuestion?.resolution &&
      state.currentQuestion?.pausedRemainingMs === null,
    turnToken: state.currentQuestion?.turnToken ?? null,
    turnKind: state.currentQuestion?.turnKind ?? null,
  });

  const topScore = useMemo(
    () => derived.activePlayers.reduce((highest, player) => Math.max(highest, player.score), 0),
    [derived.activePlayers],
  );

  const currentPlanItem = state.questionPlan[state.currentQuestionCursor] ?? null;
  const upcomingCategories = useMemo(() => {
    return state.questionPlan
      .filter((item) => item.round === state.round)
      .map((item) => QUESTION_LOOKUP[item.questionId]?.category)
      .filter((category): category is string => Boolean(category));
  }, [state.questionPlan, state.round]);

  const currentQuestion = derived.currentQuestion;
  const activePlayer = derived.activePlayer;
  const rankings = state.winnerSnapshot?.rankings ?? rankPlayers(derived.activePlayers);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.key.toLowerCase() === 'm') {
        event.preventDefault();
        actions.toggleSound();
        return;
      }

      if (
        state.gamePhase !== 'gameplay' ||
        !currentQuestion ||
        state.currentQuestion?.resolution ||
        !activePlayer
      ) {
        return;
      }

      const keyIndex = ['1', '2', '3', '4'].indexOf(event.key);
      if (keyIndex >= 0) {
        const choice = currentQuestion.choices[keyIndex];
        if (choice) {
          event.preventDefault();
          actions.submitAnswer(choice);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, activePlayer, currentQuestion, state.currentQuestion?.resolution, state.gamePhase]);

  async function handleAvatarSelect(playerId: string, file: File) {
    setUploadIssues((current) => ({ ...current, [playerId]: null }));
    try {
      const avatarDataUrl = await normalizeAvatarFile(file);
      actions.updatePlayerAvatar(playerId, avatarDataUrl, true);
    } catch (error) {
      setUploadIssues((current) => ({
        ...current,
        [playerId]: error instanceof Error ? error.message : 'Unable to prepare that image.',
      }));
    }
  }

  function handleReset() {
    setUploadIssues({});
    actions.resetSession();
  }

  if (!isReady) {
    return (
      <GameShell soundEnabled={state.soundEnabled} onToggleSound={actions.toggleSound} onReset={handleReset} subtitle="Booting the stage lights">
        <div className="flex min-h-[70vh] items-center justify-center">
          <GlassPanel tone="hero" accent="primary" className="max-w-xl p-10 text-center">
            <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-secondary" />
            <h2 className="mt-5 font-headline text-4xl font-semibold tracking-[-0.05em] text-on-surface">Loading the family arena</h2>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              Restoring the local show state and checking the next live turn.
            </p>
          </GlassPanel>
        </div>
      </GameShell>
    );
  }

  if (state.fatalError) {
    return (
      <GameShell
        soundEnabled={state.soundEnabled}
        onToggleSound={actions.toggleSound}
        onReset={handleReset}
        title="Session recovery error"
        subtitle="The local show state needs a clean reset"
      >
        <div className="flex min-h-[70vh] items-center justify-center">
          <GlassPanel tone="hero" accent="tertiary" className="max-w-2xl p-10">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tertiary/14 text-tertiary">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-headline text-4xl font-semibold tracking-[-0.05em] text-on-surface">The local question plan could not be restored.</h2>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">{state.fatalError}</p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="arcade-button arcade-button--tertiary mt-8 px-6 py-4 text-[0.82rem]"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Start a clean game
                </button>
              </div>
            </div>
          </GlassPanel>
        </div>
      </GameShell>
    );
  }

  switch (state.gamePhase) {
    case 'welcome':
      return (
        <WelcomeScreen
          soundEnabled={state.soundEnabled}
          onToggleSound={actions.toggleSound}
          onReset={handleReset}
          onStart={actions.goToSetup}
        />
      );

    case 'playerSetup':
      return (
        <PlayerSetupScreen
          soundEnabled={state.soundEnabled}
          onToggleSound={actions.toggleSound}
          playerCount={state.playerCount}
          selectedPlayerIds={state.selectedPlayerIds}
          selectedCount={derived.activePlayers.length}
          maxPlayerCount={state.players.length}
          players={state.players}
          validation={validation}
          uploadIssues={uploadIssues}
          onPlayerCountChange={actions.setPlayerCount}
          onPlayerSelectionToggle={actions.togglePlayerSelection}
          onNameChange={actions.updatePlayerName}
          onAvatarSelect={handleAvatarSelect}
          onStartGame={actions.startGame}
          onReset={handleReset}
          canStart={derived.canStartGame}
          storageIssue={storageIssue}
        />
      );

    case 'categoryOrStart':
      return (
        <CategoryOrStartScreen
          soundEnabled={state.soundEnabled}
          onToggleSound={actions.toggleSound}
          onReset={handleReset}
          round={state.round}
          players={derived.activePlayers}
          starterPlayerId={currentPlanItem ? derived.activePlayers[currentPlanItem.starterIndex]?.id ?? null : null}
          upcomingCategories={upcomingCategories}
          onBeginRound={actions.beginRound}
        />
      );

    case 'gameplay':
      if (!currentQuestion || !state.currentQuestion || !activePlayer) {
        return (
          <GameShell soundEnabled={state.soundEnabled} onToggleSound={actions.toggleSound} onReset={handleReset} subtitle="Preparing the next question">
            <div className="flex min-h-[60vh] items-center justify-center">
              <GlassPanel tone="hero" accent="secondary" className="max-w-xl p-10 text-center">
                <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-secondary" />
                <h2 className="mt-5 font-headline text-4xl font-semibold tracking-[-0.05em] text-on-surface">Loading the question stage</h2>
              </GlassPanel>
            </div>
          </GameShell>
        );
      }

      return (
        <GameplayScreen
          soundEnabled={state.soundEnabled}
          onToggleSound={actions.toggleSound}
          onReset={handleReset}
          isPaused={state.currentQuestion.pausedRemainingMs !== null}
          onTogglePause={actions.togglePause}
          roundLabel={ROUND_CONFIG[state.round].title}
          scoreLabel={`Top score ${topScore}`}
          questionIndexLabel={`Q${state.currentQuestionCursor + 1} of ${state.questionPlan.length}`}
          players={derived.activePlayers}
          activePlayer={activePlayer}
          starterPlayerId={derived.activePlayers[state.currentQuestion.starterIndex]?.id ?? null}
          failedPlayerIds={state.currentQuestion.failedPlayerIds}
          question={currentQuestion}
          turnKind={state.currentQuestion.turnKind}
          lockedChoice={state.currentQuestion.lockedChoice}
          latestFailureChoice={state.currentQuestion.latestFailure?.choice ?? null}
          latestFailureReason={state.currentQuestion.latestFailure?.reason ?? null}
          resolution={state.currentQuestion.resolution}
          timer={countdown}
          onAnswer={actions.submitAnswer}
          onContinue={actions.continueAfterQuestion}
        />
      );

    case 'roundTransition':
      return (
        <RoundTransitionScreen
          soundEnabled={state.soundEnabled}
          onToggleSound={actions.toggleSound}
          onReset={handleReset}
          round={state.round}
          players={derived.activePlayers}
          onBeginRound={actions.beginRound}
        />
      );

    case 'winner':
      return (
        <WinnerScreen
          soundEnabled={state.soundEnabled}
          onToggleSound={actions.toggleSound}
          rankings={rankings}
          winnerIds={state.winnerSnapshot?.winnerIds ?? []}
          onReset={handleReset}
        />
      );

    default:
      return null;
  }
}
