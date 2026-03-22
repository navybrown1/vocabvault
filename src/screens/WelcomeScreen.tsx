import { ArrowRight, Crown, Sparkles, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { GameShell } from '@/components/GameShell';
import { GlassPanel } from '@/components/GlassPanel';
import { RoundBadge } from '@/components/RoundBadge';

export interface WelcomeScreenProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onStart: () => void;
  onReset?: () => void;
}

export function WelcomeScreen({ soundEnabled, onToggleSound, onStart, onReset }: WelcomeScreenProps) {
  return (
    <GameShell soundEnabled={soundEnabled} onToggleSound={onToggleSound} onReset={onReset} subtitle="Family game night hits the arcade">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.45fr_0.95fr]">
        <GlassPanel tone="base" accent="tertiary" className="p-6">
          <RoundBadge label="1 to 4 players" tone="tertiary" />
          <h2 className="mt-5 font-headline text-3xl font-extrabold tracking-[-0.04em] text-on-surface drop-shadow-[3px_3px_0_rgba(0,0,0,0.6)]">Family lock-in</h2>
          <p className="mt-4 font-body leading-7 text-on-surface-variant">
            Each seat brings a name, a photo, and a chance to steal the spotlight if the active player slips.
          </p>
          <div className="mt-8 space-y-3 text-sm text-on-surface-variant">
            <p className="flex items-center gap-3">
              <Users className="h-4 w-4 text-secondary" />
              Choose one to four Brown family players before the show begins
            </p>
            <p className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-primary" />
              Animated timer pressure, steals, and round reveals
            </p>
            <p className="flex items-center gap-3">
              <Crown className="h-4 w-4 text-tertiary" />
              Live ranking and a dramatic winner finish
            </p>
          </div>
        </GlassPanel>

        <GlassPanel tone="hero" accent="primary" className="relative overflow-hidden rounded-[2.75rem] p-7 sm:p-10">
          <div className="ambient-orb-primary absolute -right-16 top-0 h-44 w-44 rounded-full blur-3xl" />
          <div className="ambient-orb-secondary absolute -left-12 bottom-8 h-44 w-44 rounded-full blur-3xl" />

          <RoundBadge label="The Brown Family Trivia Super Game" tone="primary" />
          <motion.h2
            className="mt-8 max-w-3xl font-headline text-5xl font-extrabold tracking-[-0.06em] text-on-surface drop-shadow-[4px_4px_0_rgba(0,0,0,0.58)] sm:text-7xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Bright, playful trivia built for a real family showdown.
          </motion.h2>
          <p className="mt-6 max-w-2xl font-body text-lg leading-8 text-on-surface-variant">
            One question at a time. One active player in the light. One clean clockwise steal chain if the answer misses the mark.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['40s opener', 'Original turns get room to think and full-value points.'],
              ['30s steals', 'Miss or timeout and the next seat gets a calmer steal window.'],
              ['3 rounds', 'Twelve local questions build to a double-value finale.'],
            ].map(([title, copy]) => (
              <div key={title} className="arcade-well rounded-[2rem] p-4">
                <p className="font-headline text-xl font-extrabold tracking-[-0.04em] text-on-surface">{title}</p>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{copy}</p>
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
            Start player setup
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </GlassPanel>

        <GlassPanel tone="base" accent="secondary" className="p-6">
          <RoundBadge label="Tonight's broadcast" tone="secondary" />
          <div className="mt-6 space-y-5">
            {[
              ['Round 1', 'Standard difficulty opener to settle the nerves.'],
              ['Round 2', 'Harder reads and faster steals.'],
              ['Round 3', 'Double-value finish with the whole podium in play.'],
            ].map(([title, copy], index) => (
              <div key={title} className="arcade-well rounded-[2rem] p-4">
                <p className="font-label text-[0.7rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Segment {index + 1}</p>
                <p className="mt-2 font-headline text-2xl font-extrabold tracking-[-0.04em] text-on-surface">{title}</p>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{copy}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </GameShell>
  );
}
