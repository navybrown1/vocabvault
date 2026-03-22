import { ArrowRight, RadioTower, Swords } from 'lucide-react';
import type { Player, RoundNumber } from '@/game/types';
import { ROUND_CONFIG, ROUND_THEME_COPY } from '@/game/constants';
import { GameShell } from '@/components/GameShell';
import { GlassPanel } from '@/components/GlassPanel';
import { Scoreboard } from '@/components/Scoreboard';
import { RoundBadge } from '@/components/RoundBadge';

export interface CategoryOrStartScreenProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset?: () => void;
  round: RoundNumber;
  players: Player[];
  starterPlayerId: string | null;
  upcomingCategories: string[];
  onBeginRound: () => void;
}

export function CategoryOrStartScreen({
  soundEnabled,
  onToggleSound,
  onReset,
  round,
  players,
  starterPlayerId,
  upcomingCategories,
  onBeginRound,
}: CategoryOrStartScreenProps) {
  const roundConfig = ROUND_CONFIG[round];
  const copy = ROUND_THEME_COPY[round];

  return (
    <GameShell
      soundEnabled={soundEnabled}
      onToggleSound={onToggleSound}
      onReset={onReset}
      title={`Round ${round} staging`}
      subtitle="Category lights warming up"
      roundLabel={roundConfig.title}
      scoreLabel={`${roundConfig.originalPoints} / ${roundConfig.stealPoints}`}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.92fr]">
        <GlassPanel tone="hero" accent={round === 3 ? 'tertiary' : round === 2 ? 'secondary' : 'primary'} className="p-7">
          <RoundBadge label={copy.eyebrow} tone={round === 3 ? 'tertiary' : 'primary'} />
          <h2 className="mt-5 font-headline text-5xl font-extrabold tracking-[-0.06em] text-on-surface drop-shadow-[4px_4px_0_rgba(0,0,0,0.58)]">
            {roundConfig.title}
          </h2>
          <p className="mt-4 max-w-2xl font-body text-lg leading-8 text-on-surface-variant">{copy.callout}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="arcade-well rounded-[2rem] p-5">
              <div className="flex items-center gap-3">
                <RadioTower className="h-5 w-5 text-secondary" />
                <p className="font-label text-[0.7rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Difficulty band</p>
              </div>
              <p className="mt-4 font-headline text-3xl font-extrabold tracking-[-0.05em] text-on-surface capitalize">
                {roundConfig.difficulty}
              </p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{roundConfig.subtitle}</p>
            </div>

            <div className="arcade-well rounded-[2rem] p-5">
              <div className="flex items-center gap-3">
                <Swords className="h-5 w-5 text-tertiary" />
                <p className="font-label text-[0.7rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Upcoming categories</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {upcomingCategories.map((category, index) => (
                  <RoundBadge key={`${category}-${index}`} label={category} tone="neutral" />
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onBeginRound}
            className="arcade-button arcade-button--secondary mt-10 px-6 py-4 text-[0.82rem] text-[#07131d]"
          >
            Enter the arena
            <ArrowRight className="h-4 w-4" />
          </button>
        </GlassPanel>

        <GlassPanel tone="base" accent="secondary" className="p-6">
          <Scoreboard players={players} starterPlayerId={starterPlayerId} title="Starting order" />
        </GlassPanel>
      </div>
    </GameShell>
  );
}
