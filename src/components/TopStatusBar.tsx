import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Trophy, Zap } from 'lucide-react';
import { ENZO_MASCOT } from '@/game/constants';
import { RoundBadge } from './RoundBadge';
import { SoundToggle } from './SoundToggle';

export interface TopStatusBarProps {
  title?: string;
  subtitle?: string;
  roundLabel?: string;
  scoreLabel?: string;
  soundEnabled: boolean;
  onToggleSound?: () => void;
  onReset?: () => void;
  rightSlot?: ReactNode;
}

export function TopStatusBar({
  title = 'The Brown Family Trivia Super Game',
  subtitle = 'Family arcade night',
  roundLabel,
  scoreLabel,
  soundEnabled,
  onToggleSound,
  onReset,
  rightSlot,
}: TopStatusBarProps) {
  return (
    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="relative flex items-start gap-4 pr-16 sm:pr-24">
        <div className="arcade-sticker mt-1 flex h-14 w-14 shrink-0 items-center justify-center text-[#3a1f00] sm:h-16 sm:w-16">
          <Zap className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="font-label text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--arcade-yellow)]">
            {subtitle}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="max-w-3xl font-headline text-[1.75rem] font-extrabold tracking-[-0.04em] text-on-surface drop-shadow-[3px_3px_0_rgba(0,0,0,0.7)] sm:text-[2.3rem]">
              {title}
            </h1>
            {roundLabel ? <RoundBadge label={roundLabel} tone="primary" /> : null}
            {scoreLabel ? (
              <span className="arcade-pill bg-[rgba(255,255,255,0.14)] text-on-surface shadow-[0_5px_0_rgba(15,7,24,0.88)]">
                <Trophy className="h-3.5 w-3.5 text-[var(--arcade-yellow)]" />
                {scoreLabel}
              </span>
            ) : null}
          </div>
        </div>

        <motion.div
          className="absolute right-0 top-0 hidden sm:block"
          animate={{ y: [0, -8, 0], rotate: [-3, 1, -3] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="arcade-sticker rounded-[2rem] bg-[linear-gradient(135deg,#00E5FF,#FFD84D)] p-1.5">
            <img
              src={ENZO_MASCOT.avatarSrc}
              alt={ENZO_MASCOT.name}
              className="h-[4.5rem] w-[4.5rem] rounded-[1.55rem] object-cover sm:h-20 sm:w-20"
            />
          </div>
        </motion.div>
      </div>

      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
        <motion.div
          className="sm:hidden"
          animate={{ y: [0, -6, 0], rotate: [-3, 1, -3] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="arcade-sticker rounded-[1.6rem] bg-[linear-gradient(135deg,#00E5FF,#FFD84D)] p-1.5">
            <img src={ENZO_MASCOT.avatarSrc} alt={ENZO_MASCOT.name} className="h-14 w-14 rounded-[1.15rem] object-cover" />
          </div>
        </motion.div>
        {rightSlot}
        {onReset ? (
          <button type="button" onClick={onReset} className="arcade-button arcade-button--neutral px-4 py-3 text-[0.72rem] text-on-surface">
            <RefreshCcw className="h-4 w-4" />
            Reset
          </button>
        ) : null}
        <SoundToggle enabled={soundEnabled} onClick={onToggleSound} />
      </div>
    </div>
  );
}
