import { ArrowRight, Flame, Sparkles } from 'lucide-react';
import { ROUND_CONFIG } from '@/game/constants';
import { getRoundPresentation, getRoundTease } from '@/game/i18n';
import type { Language, Player, RoundNumber } from '@/game/types';
import { GameShell } from '@/components/GameShell';
import { GlassPanel } from '@/components/GlassPanel';
import { Scoreboard } from '@/components/Scoreboard';
import { CelebrationLayer } from '@/components/CelebrationLayer';

export interface RoundTransitionScreenProps {
  language: Language;
  onToggleLanguage: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset?: () => void;
  round: RoundNumber;
  players: Player[];
  onBeginRound: () => void;
}

export function RoundTransitionScreen({
  language,
  onToggleLanguage,
  soundEnabled,
  onToggleSound,
  onReset,
  round,
  players,
  onBeginRound,
}: RoundTransitionScreenProps) {
  const config = ROUND_CONFIG[round];
  const copy = getRoundPresentation(language, round);
  const sortedPlayers = [...players].sort((left, right) => right.score - left.score);
  const leader = sortedPlayers[0];
  const trailer = sortedPlayers[sortedPlayers.length - 1];
  const tied = Boolean(leader && trailer && leader.score === trailer.score);
  const teaseCopy =
    leader && trailer
      ? getRoundTease(language, round, leader.name, trailer.name, tied)
      : language === 'en'
        ? 'The board is warming up for the next round.'
        : 'El marcador se está calentando para la próxima ronda.';

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
      scoreLabel={`${config.originalPoints} / ${config.stealPoints}`}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.92fr]">
        <GlassPanel tone="hero" accent={round >= 4 ? 'tertiary' : 'secondary'} className="relative p-8">
          <CelebrationLayer visible tone="round" />
          <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">{copy.eyebrow}</p>
          <h2 className="mt-4 font-headline text-5xl font-extrabold tracking-[-0.06em] text-on-surface drop-shadow-[4px_4px_0_rgba(0,0,0,0.58)]">{copy.title}</h2>
          <p className="mt-5 max-w-2xl font-body text-lg leading-8 text-on-surface-variant">{copy.callout}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="arcade-well rounded-[2rem] p-5">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                {language === 'en' ? 'Original correct' : 'Acierto original'}
              </p>
              <p className="mt-2 font-headline text-4xl font-extrabold tracking-[-0.06em] text-on-surface">{config.originalPoints}</p>
            </div>
            <div className="arcade-well rounded-[2rem] p-5">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                {language === 'en' ? 'Steal correct' : 'Acierto por robo'}
              </p>
              <p className="mt-2 font-headline text-4xl font-extrabold tracking-[-0.06em] text-on-surface">{config.stealPoints}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[2rem] bg-[rgba(255,255,255,0.08)] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 text-[var(--arcade-yellow)]" />
              <p className="text-sm leading-7 text-on-surface">{teaseCopy}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBeginRound}
            className="arcade-button arcade-button--tertiary mt-10 px-6 py-4 text-[0.82rem]"
          >
            {language === 'en' ? `Start ${copy.title}` : `Iniciar ${copy.title}`}
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="arcade-pill mt-8 bg-[rgba(255,255,255,0.14)] text-on-surface">
            <Flame className="h-3.5 w-3.5 text-secondary" />
            {language === 'en' ? 'The scoreboard carries straight into the next round' : 'El marcador pasa intacto a la siguiente ronda'}
          </div>
        </GlassPanel>

        <GlassPanel tone="base" accent="secondary" className="p-6">
          <Scoreboard
            language={language}
            players={players}
            title={language === 'en' ? 'Standing into the next round' : 'Posiciones para la próxima ronda'}
          />
        </GlassPanel>
      </div>
    </GameShell>
  );
}
