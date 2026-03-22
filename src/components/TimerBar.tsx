import { Clock3 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TurnKind } from '@/game/types';
import { GlassPanel } from './GlassPanel';

export interface TimerBarProps {
  remainingMs: number;
  remainingSeconds: number;
  progressRatio: number;
  isWarning: boolean;
  turnKind: TurnKind;
}

export function TimerBar({ remainingMs, remainingSeconds, progressRatio, isWarning, turnKind }: TimerBarProps) {
  return (
    <GlassPanel tone="tight" accent={isWarning ? 'tertiary' : 'secondary'} className="rounded-[2rem] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Time Remaining</p>
        <div className="flex items-center gap-2">
          <Clock3 className={`h-4 w-4 ${isWarning ? 'text-primary' : 'text-on-surface-variant'}`} />
          <p className="font-headline text-[1.75rem] font-black tracking-[-0.05em] text-on-surface drop-shadow-[2px_2px_0_rgba(0,0,0,0.6)]">
            {remainingSeconds.toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-[0.68rem] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
          <span>{turnKind === 'original' ? 'Original Turn' : 'Steal Window'}</span>
          <span>{Math.ceil(remainingMs / 100) / 10}s left</span>
        </div>
        <div className="arcade-well relative h-7 overflow-hidden rounded-full p-1">
          <motion.div
            className={`absolute inset-y-1 left-1 rounded-full ${isWarning ? 'bg-[linear-gradient(90deg,#FF6D00,#FF007F)]' : 'bg-[linear-gradient(90deg,#00E676,#00E5FF)]'} ${isWarning ? 'animate-warning-shake' : ''}`}
            animate={{ width: `${progressRatio * 100}%` }}
            transition={{ ease: 'linear', duration: 0.12 }}
          />
          <div className="shimmer-bar absolute inset-0 opacity-30" />
        </div>
      </div>
    </GlassPanel>
  );
}
