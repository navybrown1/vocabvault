import { Pause, Play } from 'lucide-react';
import { getSpeedTierLabel, getUiCopy, interpolate } from '@/game/i18n';
import type { FailureReason, Language, LocalizedQuestion, Player, QuestionResolution, TurnKind } from '@/game/types';
import { GameShell } from '@/components/GameShell';
import { GlassPanel } from '@/components/GlassPanel';
import { Scoreboard } from '@/components/Scoreboard';
import { QuestionCard } from '@/components/QuestionCard';
import { AnswerGrid } from '@/components/AnswerGrid';
import { TimerBar } from '@/components/TimerBar';
import { StealBanner } from '@/components/StealBanner';
import { RoundBadge } from '@/components/RoundBadge';

export interface GameplayScreenProps {
  language: Language;
  onToggleLanguage: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset?: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  roundLabel: string;
  scoreLabel: string;
  questionIndexLabel: string;
  players: Player[];
  activePlayer: Player;
  starterPlayerId: string | null;
  failedPlayerIds: string[];
  question: LocalizedQuestion;
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
  language,
  onToggleLanguage,
  soundEnabled,
  onToggleSound,
  onReset,
  isPaused,
  onTogglePause,
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
  const copy = getUiCopy(language).gameplay;
  const winnerIds = resolution?.resolvedByPlayerId ? [resolution.resolvedByPlayerId] : [];

  return (
    <GameShell
      language={language}
      onToggleLanguage={onToggleLanguage}
      soundEnabled={soundEnabled}
      onToggleSound={onToggleSound}
      onReset={onReset}
      title={copy.title}
      subtitle={isPaused ? copy.pausedSubtitle : interpolate(copy.liveSubtitle, { player: activePlayer.name })}
      roundLabel={roundLabel}
      scoreLabel={scoreLabel}
      rightSlot={
        <>
          <RoundBadge label={questionIndexLabel} tone="neutral" />
          <RoundBadge label={getUiCopy(language).controls.gameplay} tone="neutral" className="hidden xl:flex" />
          <button
            type="button"
            onClick={onTogglePause}
            disabled={Boolean(resolution)}
            className={[
              'arcade-button inline-flex gap-2 px-4 py-3 text-[0.72rem]',
              resolution ? 'cursor-default bg-white/8 text-on-surface-variant' : 'arcade-button--neutral text-on-surface',
            ].join(' ')}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {isPaused ? getUiCopy(language).resume : getUiCopy(language).pause}
          </button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
        <GlassPanel tone="base" accent={activePlayer.color} className="h-full p-5 xl:min-h-[760px]">
          <Scoreboard
            language={language}
            players={players}
            activePlayerId={activePlayer.id}
            failedPlayerIds={failedPlayerIds}
            starterPlayerId={starterPlayerId}
            winnerIds={winnerIds}
            title={copy.familyScoreboard}
          />
        </GlassPanel>

        <div className="space-y-5">
          <TimerBar language={language} {...timer} isPaused={isPaused} turnKind={turnKind} />

          <QuestionCard
            language={language}
            question={question}
            roundLabel={roundLabel}
            activePlayer={activePlayer}
            turnKind={turnKind}
          />

          {turnKind === 'steal' && latestFailureReason ? (
            <StealBanner
              language={language}
              activePlayerName={activePlayer.name}
              failedCount={failedPlayerIds.length}
              failureReason={latestFailureReason}
            />
          ) : null}

          <AnswerGrid
            language={language}
            choices={question.choices}
            correctAnswer={question.correctAnswer}
            lockedChoice={lockedChoice}
            latestFailureChoice={latestFailureChoice}
            resolution={resolution}
            disabled={Boolean(resolution) || isPaused}
            onSelect={onAnswer}
          />

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            {resolution ? (
              <GlassPanel tone="tight" accent={resolution.outcome === 'correct' ? 'green' : 'tertiary'} className="rounded-[2rem] p-5">
                <div className="flex h-full flex-col justify-between gap-4">
                  <div>
                    <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">{copy.answerReveal}</p>
                    <h3 className="mt-2 font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-on-surface drop-shadow-[3px_3px_0_rgba(0,0,0,0.58)]">
                      {resolution.outcome === 'correct' ? copy.revealCorrect : copy.revealMiss}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface">
                      {interpolate(copy.correctAnswerLine, { answer: question.correctAnswerLabel })}
                      {' · '}
                      {resolution.awardedPoints > 0
                        ? interpolate(copy.pointsAwarded, { points: resolution.awardedPoints })
                        : copy.noPoints}
                    </p>
                    {resolution.speedBonus > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <RoundBadge
                          label={`${copy.speedBonus} +${resolution.speedBonus}`}
                          tone="secondary"
                        />
                        <RoundBadge
                          label={getSpeedTierLabel(language, resolution.speedTier)}
                          tone="tertiary"
                        />
                      </div>
                    ) : null}
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
                      {getUiCopy(language).continue}
                    </button>
                  </div>
                </div>
              </GlassPanel>
            ) : (
              <GlassPanel tone="tight" accent={activePlayer.color} className="rounded-[2rem] p-5">
                <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">{copy.liveTurn}</p>
                <h3 className="mt-2 font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-on-surface drop-shadow-[3px_3px_0_rgba(0,0,0,0.58)]">
                  {activePlayer.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                  {isPaused ? copy.pausedBody : turnKind === 'original' ? copy.originalBody : copy.stealBody}
                </p>
              </GlassPanel>
            )}

            <GlassPanel tone="tight" accent={activePlayer.color} className="rounded-[2rem] p-5">
              <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">{copy.roundStatus}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="arcade-well rounded-[1.8rem] p-4">
                  <p className="font-label text-[0.66rem] font-bold uppercase tracking-[0.16em] text-on-surface-variant">{copy.failedPlayers}</p>
                  <p className="mt-2 font-headline text-[2rem] font-black tracking-[-0.04em] text-on-surface">
                    {failedPlayerIds.length}
                  </p>
                </div>
                <div className="arcade-well rounded-[1.8rem] p-4">
                  <p className="font-label text-[0.66rem] font-bold uppercase tracking-[0.16em] text-on-surface-variant">{copy.pointsInPlay}</p>
                  <p className="mt-2 font-headline text-[2rem] font-black tracking-[-0.04em] text-[var(--arcade-yellow)]">
                    {turnKind === 'original' ? copy.fullPoints : copy.stealPoints}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-on-surface-variant">
                {starterPlayerId === activePlayer.id
                  ? interpolate(copy.startedQuestion, { player: activePlayer.name })
                  : interpolate(copy.answeringAfterPass, { player: activePlayer.name })}
              </p>
            </GlassPanel>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
