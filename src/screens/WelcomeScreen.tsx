import { ArrowRight, Crown, Sparkles, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { ROUND_SEQUENCE } from '@/game/constants';
import { getRoundPresentation, getUiCopy } from '@/game/i18n';
import type { Language } from '@/game/types';
import { GameShell } from '@/components/GameShell';
import { GlassPanel } from '@/components/GlassPanel';
import { RoundBadge } from '@/components/RoundBadge';

export interface WelcomeScreenProps {
  language: Language;
  onToggleLanguage: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onStart: () => void;
  onReset?: () => void;
}

export function WelcomeScreen({
  language,
  onToggleLanguage,
  soundEnabled,
  onToggleSound,
  onStart,
  onReset,
}: WelcomeScreenProps) {
  const copy = getUiCopy(language);

  return (
    <GameShell
      language={language}
      onToggleLanguage={onToggleLanguage}
      soundEnabled={soundEnabled}
      onToggleSound={onToggleSound}
      onReset={onReset}
      subtitle={copy.brandSubtitle}
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.45fr_0.95fr]">
        <GlassPanel tone="base" accent="tertiary" className="p-6">
          <RoundBadge label={language === 'en' ? '1 to 4 players' : '1 a 4 jugadores'} tone="tertiary" />
          <h2 className="mt-5 font-headline text-3xl font-extrabold tracking-[-0.04em] text-on-surface drop-shadow-[3px_3px_0_rgba(0,0,0,0.6)]">
            {copy.welcome.sideTitle}
          </h2>
          <p className="mt-4 font-body leading-7 text-on-surface-variant">{copy.welcome.sideBody}</p>
          <div className="mt-8 space-y-3 text-sm text-on-surface-variant">
            {[Users, Sparkles, Crown].map((Icon, index) => (
              <p key={copy.welcome.bullets[index]} className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${index === 0 ? 'text-secondary' : index === 1 ? 'text-primary' : 'text-tertiary'}`} />
                {copy.welcome.bullets[index]}
              </p>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel tone="hero" accent="primary" className="relative overflow-hidden rounded-[2.75rem] p-7 sm:p-10">
          <div className="ambient-orb-primary absolute -right-16 top-0 h-44 w-44 rounded-full blur-3xl" />
          <div className="ambient-orb-secondary absolute -left-12 bottom-8 h-44 w-44 rounded-full blur-3xl" />

          <RoundBadge label={copy.welcome.heroBadge} tone="primary" />
          <motion.h2
            className="mt-8 max-w-3xl font-headline text-5xl font-extrabold tracking-[-0.06em] text-on-surface drop-shadow-[4px_4px_0_rgba(0,0,0,0.58)] sm:text-7xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {copy.welcome.heroTitle}
          </motion.h2>
          <p className="mt-6 max-w-2xl font-body text-lg leading-8 text-on-surface-variant">
            {copy.welcome.heroBody}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {copy.welcome.heroStats.map(([title, body]) => (
              <div key={title} className="arcade-well rounded-[2rem] p-4">
                <p className="font-headline text-xl font-extrabold tracking-[-0.04em] text-on-surface">{title}</p>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{body}</p>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={onStart}
            className="arcade-button arcade-button--primary mt-10 px-6 py-4 text-[0.82rem] text-white"
          >
            {copy.welcome.cta}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </GlassPanel>

        <GlassPanel tone="base" accent="secondary" className="p-6">
          <RoundBadge label={copy.welcome.broadcast} tone="secondary" />
          <div className="mt-6 space-y-5">
            {ROUND_SEQUENCE.map((round) => {
              const roundCopy = getRoundPresentation(language, round);
              return (
                <div key={round} className="arcade-well rounded-[2rem] p-4">
                  <p className="font-label text-[0.7rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                    {language === 'en' ? `Segment ${round}` : `Segmento ${round}`}
                  </p>
                  <p className="mt-2 font-headline text-2xl font-extrabold tracking-[-0.04em] text-on-surface">
                    {roundCopy.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{roundCopy.subtitle}</p>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>
    </GameShell>
  );
}
