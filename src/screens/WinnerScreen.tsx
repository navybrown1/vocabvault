import { RefreshCcw, Sparkles } from 'lucide-react';
import type { RankedPlayer } from '@/game/types';
import { GameShell } from '@/components/GameShell';
import { GlassPanel } from '@/components/GlassPanel';
import { WinnerPodium } from '@/components/WinnerPodium';
import { CelebrationLayer } from '@/components/CelebrationLayer';

export interface WinnerScreenProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  rankings: RankedPlayer[];
  winnerIds: string[];
  onReset: () => void;
}

export function WinnerScreen({
  soundEnabled,
  onToggleSound,
  rankings,
  winnerIds,
  onReset,
}: WinnerScreenProps) {
  const winners = rankings.filter((player) => winnerIds.includes(player.id));
  const headline =
    winners.length > 1 ? 'Tie for 1st in the Brown family arena.' : `${winners[0]?.name ?? 'Winner'} takes the crown.`;

  return (
    <GameShell
      soundEnabled={soundEnabled}
      onToggleSound={onToggleSound}
      title="Game Over!"
      subtitle="Final rankings"
      roundLabel="Winner"
    >
      <div className="space-y-6">
        <GlassPanel tone="hero" accent="primary" className="relative overflow-hidden rounded-[2.75rem] p-8 text-center">
          <CelebrationLayer visible tone="winner" />
          <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--arcade-yellow)]">Show complete</p>
          <h2 className="mt-4 font-headline text-5xl font-extrabold tracking-[-0.06em] text-on-surface drop-shadow-[4px_4px_0_rgba(0,0,0,0.58)]">{headline}</h2>
          <p className="mx-auto mt-4 max-w-3xl font-body text-lg leading-8 text-on-surface-variant">
            {winners.length > 1
              ? 'Multiple players reached the top score, so the winner celebration is shared across the whole tie group.'
              : 'The final podium is locked in, with every score and steal chain counted exactly once.'}
          </p>
          <button
            type="button"
            onClick={onReset}
            className="arcade-button arcade-button--primary mt-8 px-6 py-4 text-[0.82rem] text-white"
          >
            <RefreshCcw className="h-4 w-4" />
            Start a new game
          </button>
        </GlassPanel>

        <WinnerPodium rankings={rankings} winnerIds={winnerIds} />

        <GlassPanel tone="base" accent="secondary" className="p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-secondary" />
            <div>
              <p className="font-label text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">Full standings</p>
              <h3 className="font-headline text-2xl font-extrabold tracking-[-0.04em] text-on-surface">
                {rankings.length === 1 ? 'Solo result' : `${rankings.length}-player finish`}
              </h3>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {rankings.map((player) => (
              <div
                key={player.id}
                className="arcade-well rounded-[2rem] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-label text-[0.7rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">{player.rankLabel}</p>
                    <h4 className="mt-2 font-headline text-2xl font-extrabold tracking-[-0.04em] text-on-surface">{player.name}</h4>
                  </div>
                  <p className="font-headline text-3xl font-extrabold tracking-[-0.05em] text-[var(--arcade-yellow)]">{player.score}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </GameShell>
  );
}
