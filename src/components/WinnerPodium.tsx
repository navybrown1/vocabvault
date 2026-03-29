import { Medal } from 'lucide-react';
import type { Language, RankedPlayer } from '@/game/types';
import { GlassPanel } from './GlassPanel';
import { FallbackAvatar } from './FallbackAvatar';

export interface WinnerPodiumProps {
  rankings: RankedPlayer[];
  featuredPlayerIds?: string[];
  language?: Language;
}

export function WinnerPodium({ rankings, featuredPlayerIds = [], language = 'en' }: WinnerPodiumProps) {
  const featuredSet = new Set(featuredPlayerIds);
  const visibleRankings = rankings.filter((player) => !featuredSet.has(player.id)).slice(0, 3);

  if (!visibleRankings.length) {
    return null;
  }

  const podiumOrder = visibleRankings;

  const layoutClass =
    podiumOrder.length <= 1
      ? 'mx-auto max-w-xl'
      : podiumOrder.length === 2
        ? 'mx-auto max-w-5xl md:grid-cols-2'
        : 'lg:grid-cols-[1fr_1.15fr_1fr]';

  return (
    <div className={`grid items-end gap-5 ${layoutClass}`}>
      {podiumOrder.map((player) => {
        const placement = player.placement;
        const blockClass =
          placement === 2
            ? 'h-44 bg-[linear-gradient(180deg,#B39DC9,#8C7AA6)]'
            : placement === 3
              ? 'h-36 bg-[linear-gradient(180deg,#FF8F1F,#FF6D00)]'
              : 'h-32 bg-[linear-gradient(180deg,#4C7BFF,#2754D7)]';
        const cardClass = placement === 2 ? 'lg:mb-4' : placement === 3 ? 'lg:mb-2' : '';

        return (
          <div key={player.id} className={`flex flex-col items-center ${cardClass}`}>
            <GlassPanel
              tone="base"
              accent={player.color}
              className="relative w-full rounded-[2rem] p-5 text-center"
            >
              <div className="mx-auto flex w-fit justify-center">
                {player.avatarDataUrl ? (
                  <img
                    src={player.avatarDataUrl}
                    alt={`${player.name} portrait`}
                    className="h-[5.5rem] w-[5.5rem] rounded-full border-[4px] border-white object-cover shadow-[0_8px_0_rgba(15,7,24,0.9)]"
                  />
                ) : (
                  <FallbackAvatar name={player.name} color={player.color} size="lg" />
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <Medal className="h-4 w-4 text-white" />
                <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#fffaf6]">
                  {player.rankLabel}
                </p>
              </div>

              <h3 className="mt-2 truncate font-headline text-[1.95rem] font-extrabold tracking-[-0.04em] text-on-surface drop-shadow-[3px_3px_0_rgba(0,0,0,0.6)]">
                {player.name}
              </h3>

              <div className="mx-auto mt-3 w-fit rounded-full border-[3px] border-white bg-[rgba(26,16,37,0.42)] px-5 py-2">
                <p className="font-headline text-[1.8rem] font-black tracking-[-0.05em] text-[var(--arcade-yellow)]">
                  {player.score.toLocaleString()} {language === 'en' ? 'PTS' : 'PTS'}
                </p>
              </div>
            </GlassPanel>

            <div
              className={`mt-4 flex w-full items-start justify-center rounded-t-[2rem] border-[4px] border-white pt-6 shadow-[0_8px_0_rgba(15,7,24,0.92)] ${blockClass}`}
            >
              <span className="font-headline text-[4.5rem] font-black leading-none text-white drop-shadow-[4px_4px_0_rgba(0,0,0,0.45)]">
                {placement}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
