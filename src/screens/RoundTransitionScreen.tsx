import { ArrowRight, Flame } from 'lucide-react';
import type { Player, RoundNumber } from '@/game/types';
import { ROUND_CONFIG, ROUND_THEME_COPY } from '@/game/constants';
import { GameShell } from '@/components/GameShell';
import { GlassPanel } from '@/components/GlassPanel';
import { Scoreboard } from '@/components/Scoreboard';
import { CelebrationLayer } from '@/components/CelebrationLayer';

export interface RoundTransitionScreenProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset?: () => void;
  round: RoundNumber;
  players: Player[];
  onBeginRound: () => void;
}

export function RoundTransitionScreen({
  soundEnabled,
  onToggleSound,
  onReset,
  round,
  players,
  onBeginRound,
}: RoundTransitionScreenProps) {
  const config = ROUND_CONFIG[round];
  const copy = ROUND_THEME_COPY[round];

  return (
    <GameShell
      soundEnabled={soundEnabled}
      onToggleSound={onToggleSound}
      onReset={onReset}
      title={`Round ${round} transition`}
      subtitle="The lights reset. The stakes jump."
      roundLabel={config.title}
      scoreLabel={`${config.originalPoints} / ${config.stealPoints}`}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.92fr]">
        <GlassPanel tone="hero" accent={round === 3 ? 'tertiary' : 'secondary'} className="relative p-8">
          <CelebrationLayer visible tone="round" />
          <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">{copy.eyebrow}</p>
          <h2 className="mt-4 font-headline text-5xl font-extrabold tracking-[-0.06em] text-on-surface drop-shadow-[4px_4px_0_rgba(0,0,0,0.58)]">{config.title}</h2>
          <p className="mt-5 max-w-2xl font-body text-lg leading-8 text-on-surface-variant">{copy.callout}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="arcade-well rounded-[2rem] p-5">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Original correct</p>
              <p className="mt-2 font-headline text-4xl font-extrabold tracking-[-0.06em] text-on-surface">{config.originalPoints}</p>
            </div>
            <div className="arcade-well rounded-[2rem] p-5">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Steal correct</p>
              <p className="mt-2 font-headline text-4xl font-extrabold tracking-[-0.06em] text-on-surface">{config.stealPoints}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBeginRound}
            className="arcade-button arcade-button--tertiary mt-10 px-6 py-4 text-[0.82rem]"
          >
            Start {config.title.toLowerCase()}
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="arcade-pill mt-8 bg-[rgba(255,255,255,0.14)] text-on-surface">
            <Flame className="h-3.5 w-3.5 text-secondary" />
            Scoreboard carries forward exactly as it stands
          </div>
        </GlassPanel>

        <GlassPanel tone="base" accent="secondary" className="p-6">
          <Scoreboard players={players} title="Standing into the next round" />
        </GlassPanel>
      </div>
    </GameShell>
  );
}
