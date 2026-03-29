import { ArrowRight, RadioTower, Swords } from 'lucide-react';
import { ROUND_CONFIG } from '@/game/constants';
import { getRoundPresentation, getRoundTypeLabel } from '@/game/i18n';
import type { Language, Player, RoundNumber } from '@/game/types';
import { GameShell } from '@/components/GameShell';
import { GlassPanel } from '@/components/GlassPanel';
import { Scoreboard } from '@/components/Scoreboard';
import { RoundBadge } from '@/components/RoundBadge';

export interface CategoryOrStartScreenProps {
  language: Language;
  onToggleLanguage: () => void;
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
  language,
  onToggleLanguage,
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
  const copy = getRoundPresentation(language, round);

  return (
    <GameShell
      language={language}
      onToggleLanguage={onToggleLanguage}
      soundEnabled={soundEnabled}
      onToggleSound={onToggleSound}
      onReset={onReset}
      title={copy.title}
      subtitle={copy.subtitle}
      roundLabel={copy.eyebrow}
      scoreLabel={`${roundConfig.originalPoints} / ${roundConfig.stealPoints}`}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.92fr]">
        <GlassPanel tone="hero" accent={round === 5 ? 'tertiary' : round === 3 ? 'secondary' : 'primary'} className="p-7">
          <RoundBadge label={copy.eyebrow} tone={round === 5 ? 'tertiary' : 'primary'} />
          <h2 className="mt-5 font-headline text-5xl font-extrabold tracking-[-0.06em] text-on-surface drop-shadow-[4px_4px_0_rgba(0,0,0,0.58)]">
            {copy.title}
          </h2>
          <p className="mt-4 max-w-2xl font-body text-lg leading-8 text-on-surface-variant">{copy.callout}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="arcade-well rounded-[2rem] p-5">
              <div className="flex items-center gap-3">
                <RadioTower className="h-5 w-5 text-secondary" />
                <p className="font-label text-[0.7rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                  {language === 'en' ? 'Difficulty band' : 'Nivel'}
                </p>
              </div>
              <p className="mt-4 font-headline text-3xl font-extrabold tracking-[-0.05em] text-on-surface capitalize">
                {copy.difficultyLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                {getRoundTypeLabel(language, roundConfig.type)}
              </p>
            </div>

            <div className="arcade-well rounded-[2rem] p-5">
              <div className="flex items-center gap-3">
                <Swords className="h-5 w-5 text-tertiary" />
                <p className="font-label text-[0.7rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                  {language === 'en' ? 'Upcoming categories' : 'Categorías próximas'}
                </p>
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
            {language === 'en' ? 'Enter the arena' : 'Entrar a la arena'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </GlassPanel>

        <GlassPanel tone="base" accent="secondary" className="p-6">
          <Scoreboard
            language={language}
            players={players}
            starterPlayerId={starterPlayerId}
            title={language === 'en' ? 'Starting order' : 'Orden inicial'}
          />
        </GlassPanel>
      </div>
    </GameShell>
  );
}
