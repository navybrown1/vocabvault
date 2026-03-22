import type { FailureReason, Player, Question, QuestionResolution, TurnKind } from '@/game/types';
import { GameShell } from '@/components/GameShell';
import { GlassPanel } from '@/components/GlassPanel';
import { Scoreboard } from '@/components/Scoreboard';
import { QuestionCard } from '@/components/QuestionCard';
import { AnswerGrid } from '@/components/AnswerGrid';
import { TimerBar } from '@/components/TimerBar';
import { StealBanner } from '@/components/StealBanner';
import { RoundBadge } from '@/components/RoundBadge';

export interface GameplayScreenProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset?: () => void;
  roundLabel: string;
  scoreLabel: string;
  questionIndexLabel: string;
  players: Player[];
  activePlayer: Player;
  starterPlayerId: string | null;
  failedPlayerIds: string[];
  question: Question;
  turnKind: TurnKind;
  lockedChoice: string | null;
  latestFailureChoice: string | null;
  latestFailureReason: FailureReason | null;
  resolution: QuestionResolution | null;
  timer: {
    remainingMs: number;
    remainingSeconds: number;
    progressRatio: number;
    isWarning: boolean;
  };
  onAnswer: (choice: string) => void;
  onContinue: () => void;
}

export function GameplayScreen({
  soundEnabled,
  onToggleSound,
  onReset,
  roundLabel,
  scoreLabel,
  questionIndexLabel,
  players,
  activePlayer,
  starterPlayerId,
  failedPlayerIds,
  question,
  turnKind,
  lockedChoice,
  latestFailureChoice,
  latestFailureReason,
  resolution,
  timer,
  onAnswer,
  onContinue,
}: GameplayScreenProps) {
  const winnerIds = resolution?.resolvedByPlayerId ? [resolution.resolvedByPlayerId] : [];

  return (
    <GameShell
      soundEnabled={soundEnabled}
      onToggleSound={onToggleSound}
      onReset={onReset}
      title="Brown Family Arcade Night"
      subtitle={`${activePlayer.name} has the active turn`}
      roundLabel={roundLabel}
      scoreLabel={scoreLabel}
      rightSlot={<RoundBadge label={questionIndexLabel} tone="neutral" />}
    >
      <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
        <GlassPanel tone="base" accent={activePlayer.color} className="h-full p-5 xl:min-h-[760px]">
          <Scoreboard
            players={players}
            activePlayerId={activePlayer.id}
            failedPlayerIds={failedPlayerIds}
            starterPlayerId={starterPlayerId}
            winnerIds={winnerIds}
          />
        </GlassPanel>

        <div className="space-y-5">
          <TimerBar {...timer} turnKind={turnKind} />

          <QuestionCard
            question={question}
            roundLabel={roundLabel}
            activePlayerName={activePlayer.name}
            turnKind={turnKind}
          />

          {turnKind === 'steal' && latestFailureReason ? (
            <StealBanner
              activePlayerName={activePlayer.name}
              failedCount={failedPlayerIds.length}
              failureReason={latestFailureReason}
            />
          ) : null}

          <AnswerGrid
            choices={question.choices}
            correctAnswer={question.correctAnswer}
            lockedChoice={lockedChoice}
            latestFailureChoice={latestFailureChoice}
            resolution={resolution}
            disabled={Boolean(resolution)}
            onSelect={onAnswer}
          />

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            {resolution ? (
              <GlassPanel tone="tight" accent={resolution.outcome === 'correct' ? 'green' : 'tertiary'} className="rounded-[2rem] p-5">
                <div className="flex h-full flex-col justify-between gap-4">
                  <div>
                    <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">Answer reveal</p>
                    <h3 className="mt-2 font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-on-surface drop-shadow-[3px_3px_0_rgba(0,0,0,0.58)]">
                      {resolution.outcome === 'correct' ? 'Correct answer locked.' : 'OOF! Nobody got it.'}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface">
                      Correct answer: <span className="font-bold">{resolution.correctAnswer}</span>
                      {resolution.awardedPoints > 0 ? ` · ${resolution.awardedPoints} points awarded.` : ' · No points awarded.'}
                    </p>
                    {question.explanation ? (
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">{question.explanation}</p>
                    ) : null}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={onContinue}
                      className="arcade-button arcade-button--primary px-6 py-4 text-[0.82rem] text-white"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </GlassPanel>
            ) : (
              <GlassPanel tone="tight" accent={activePlayer.color} className="rounded-[2rem] p-5">
                <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">Live turn</p>
                <h3 className="mt-2 font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-on-surface drop-shadow-[3px_3px_0_rgba(0,0,0,0.58)]">
                  {activePlayer.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                  {turnKind === 'original'
                    ? 'Original turn for full-value points. Take the full clock and lock it in.'
                    : 'Steal chance is live. Quick hit, reduced points, same pressure.'}
                </p>
              </GlassPanel>
            )}

            <GlassPanel tone="tight" accent={activePlayer.color} className="rounded-[2rem] p-5">
              <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">Board status</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="arcade-well rounded-[1.8rem] p-4">
                  <p className="font-label text-[0.66rem] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Failed players</p>
                  <p className="mt-2 font-headline text-[2rem] font-black tracking-[-0.04em] text-on-surface">
                    {failedPlayerIds.length}
                  </p>
                </div>
                <div className="arcade-well rounded-[1.8rem] p-4">
                  <p className="font-label text-[0.66rem] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Points in play</p>
                  <p className="mt-2 font-headline text-[2rem] font-black tracking-[-0.04em] text-[var(--arcade-yellow)]">
                    {turnKind === 'original' ? 'Full' : 'Steal'}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-on-surface-variant">
                {starterPlayerId === activePlayer.id
                  ? `${activePlayer.name} opened this question.`
                  : `${activePlayer.name} is answering after the pass.`}
              </p>
            </GlassPanel>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
