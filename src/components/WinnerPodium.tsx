import { Crown, Medal, Sparkles } from 'lucide-react';
import type { RankedPlayer } from '@/game/types';
import { GlassPanel } from './GlassPanel';
import { FallbackAvatar } from './FallbackAvatar';
import { getPlayerTheme } from './player-theme';

export interface WinnerPodiumProps {
  rankings: RankedPlayer[];
  winnerIds: string[];
}

export function WinnerPodium({ rankings, winnerIds }: WinnerPodiumProps) {
  const podiumOrder =
    rankings.length <= 2
      ? rankings.slice(0, 2)
      : [rankings[1], rankings[0], rankings[2]].filter((player): player is RankedPlayer => Boolean(player));

  const layoutClass =
    podiumOrder.length <= 1
      ? 'mx-auto max-w-xl'
      : podiumOrder.length === 2
        ? 'mx-auto max-w-5xl md:grid-cols-2'
        : 'lg:grid-cols-[1fr_1.15fr_1fr]';

  return (
    <div className={`grid items-end gap-5 ${layoutClass}`}>
      {podiumOrder.map((player, index) => {
        const theme = getPlayerTheme(player.color);
        const isWinner = winnerIds.includes(player.id);
        const placement = player.placement;
        const blockClass =
          placement === 1
            ? 'h-64 bg-[linear-gradient(180deg,#FFE78A,#FFD84D_28%,#F8B800)]'
            : placement === 2
              ? 'h-44 bg-[linear-gradient(180deg,#B39DC9,#8C7AA6)]'
              : 'h-36 bg-[linear-gradient(180deg,#FF8F1F,#FF6D00)]';
        const cardClass =
          podiumOrder.length <= 2
            ? placement === 1
              ? 'scale-[1.04]'
              : ''
            : placement === 1
              ? 'lg:-mb-5 lg:scale-[1.08]'
              : placement === 2
                ? 'lg:mb-4'
                : 'lg:mb-2';

        return (
          <div key={player.id} className={`flex flex-col items-center ${cardClass}`}>
            {isWinner ? (
              <div className="mb-[-16px] flex h-20 items-end justify-center">
                <Crown className="h-14 w-14 text-[var(--arcade-yellow)] drop-shadow-[0_5px_0_rgba(0,0,0,0.78)]" />
              </div>
            ) : null}

            <GlassPanel
              tone={isWinner ? 'hero' : 'base'}
              accent={player.color}
              className={`relative w-full rounded-[2rem] text-center ${isWinner ? 'p-6 sm:p-7' : 'p-5'}`}
              style={isWinner ? { boxShadow: '0 0 0 4px rgba(255,216,77,0.85), 0 12px 0 rgba(15,7,24,0.95), 0 28px 54px rgba(0,0,0,0.34)' } : undefined}
            >
              {isWinner ? (
                <div className="pointer-events-none absolute inset-x-[18%] top-3 h-16 rounded-full bg-[radial-gradient(circle,rgba(255,216,77,0.48)_0%,rgba(255,216,77,0)_72%)] blur-xl" />
              ) : null}
              <div className="mx-auto flex w-fit justify-center">
                {player.avatarDataUrl ? (
                  <img
                    src={player.avatarDataUrl}
                    alt={`${player.name} portrait`}
                    className={`${isWinner ? 'h-[7rem] w-[7rem] sm:h-[8rem] sm:w-[8rem]' : 'h-[5.5rem] w-[5.5rem]'} rounded-full border-[4px] border-white object-cover shadow-[0_8px_0_rgba(15,7,24,0.9)]`}
                  />
                ) : (
                  <FallbackAvatar name={player.name} color={player.color} size="lg" />
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                {isWinner ? <Sparkles className="h-4 w-4 text-[var(--arcade-yellow)]" /> : <Medal className="h-4 w-4 text-white" />}
                <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.18em]" style={{ color: isWinner ? 'var(--arcade-yellow)' : '#fffaf6' }}>
                  {player.rankLabel}
                </p>
              </div>

              <h3 className={`mt-2 truncate font-headline font-extrabold tracking-[-0.04em] text-on-surface drop-shadow-[3px_3px_0_rgba(0,0,0,0.6)] ${isWinner ? 'text-[2.3rem] sm:text-[2.7rem]' : 'text-[1.95rem]'}`}>
                {player.name}
              </h3>

              <div className="mx-auto mt-3 w-fit rounded-full border-[3px] border-white bg-[rgba(26,16,37,0.42)] px-5 py-2">
                <p className="font-headline text-[1.8rem] font-black tracking-[-0.05em] text-[var(--arcade-yellow)]">
                  {player.score.toLocaleString()} PTS
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
