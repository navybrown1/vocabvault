import { ArrowRightLeft, TimerReset } from 'lucide-react';
import { getFailureLine, getPlayerWord, getUiCopy, interpolate } from '@/game/i18n';
import type { FailureReason, Language } from '@/game/types';
import { GlassPanel } from './GlassPanel';

export interface StealBannerProps {
  language: Language;
  activePlayerName: string;
  failedCount: number;
  failureReason: FailureReason;
}

export function StealBanner({ language, activePlayerName, failedCount, failureReason }: StealBannerProps) {
  const copy = getUiCopy(language).gameplay;
  return (
    <GlassPanel tone="tight" accent="secondary" className="rounded-[2rem] bg-[linear-gradient(135deg,rgba(0,229,255,0.18),rgba(45,27,66,0.94))] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="arcade-sticker flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00E5FF,#FFD84D)] text-[#1f1830]">
          {failureReason === 'timeout' ? <TimerReset className="h-5 w-5" /> : <ArrowRightLeft className="h-5 w-5" />}
        </span>
        <div>
          <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--arcade-yellow)]">{copy.stealActivated}</p>
          <p className="mb-1 font-body text-sm text-on-surface-variant">{getFailureLine(language, failureReason)}</p>
          <p className="font-body text-sm text-on-surface">
            {interpolate(copy.nextUp, {
              player: activePlayerName,
              count: failedCount,
              playerWord: getPlayerWord(language, failedCount),
            })}
          </p>
        </div>
      </div>
    </GlassPanel>
  );
}
