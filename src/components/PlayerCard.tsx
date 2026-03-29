import { Crown, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUiCopy, interpolate } from '@/game/i18n';
import type { Language, Player } from '@/game/types';
import { GlassPanel } from './GlassPanel';
import { FallbackAvatar } from './FallbackAvatar';
import { getPlayerTheme } from './player-theme';
import { RoundBadge } from './RoundBadge';

export interface PlayerCardProps {
  player: Player;
  isActive?: boolean;
  isFailed?: boolean;
  isStarter?: boolean;
  isWinner?: boolean;
  subtitle?: string;
  compact?: boolean;
  language?: Language;
}

export function PlayerCard({
  player,
  isActive = false,
  isFailed = false,
  isStarter = false,
  isWinner = false,
  subtitle,
  compact = false,
  language = 'en',
}: PlayerCardProps) {
  const copy = getUiCopy(language).gameplay;
  const theme = getPlayerTheme(player.color);
  const surfaceStyle = {
    background: isActive
      ? 'linear-gradient(135deg, rgba(26,16,37,0.92), rgba(36,18,58,0.96))'
      : 'linear-gradient(180deg, rgba(36,18,58,0.92), rgba(28,15,42,0.96))',
    borderColor: isActive ? theme.hex : 'rgba(255,255,255,0.92)',
  };

  return (
    <motion.div
      animate={isActive ? { y: [0, -4, 0] } : { y: 0 }}
      transition={isActive ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <GlassPanel
        tone="tight"
        accent={player.color}
        className={[
          compact ? 'rounded-[2rem] p-3.5' : 'rounded-[2.1rem] p-4',
          isFailed ? 'opacity-55 saturate-[0.72]' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={surfaceStyle}
      >
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div
              className="flex items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-[rgba(255,255,255,0.14)]"
              style={{ height: compact ? 48 : 62, width: compact ? 48 : 62 }}
            >
              {player.avatarDataUrl ? (
                <img
                  src={player.avatarDataUrl}
                  alt={`${player.name} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FallbackAvatar name={player.name || `P${player.seat}`} color={player.color} size={compact ? 'sm' : 'md'} />
              )}
            </div>
            {isWinner ? (
              <span className="absolute -right-1 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[var(--arcade-yellow)] text-[#1d1028] shadow-[0_4px_0_rgba(15,7,24,0.88)]">
                <Crown className="h-4 w-4" />
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-headline text-lg font-extrabold tracking-[-0.03em] text-on-surface drop-shadow-[2px_2px_0_rgba(0,0,0,0.6)]">
                  {player.name || interpolate(language === 'en' ? 'Player {seat}' : 'Jugador {seat}', { seat: player.seat })}
                </h3>
                <p className="mt-1 truncate font-label text-[0.68rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  {subtitle ?? (isActive ? copy.activeTurn : isFailed ? copy.missedQuestion : copy.readyToPlay)}
                </p>
              </div>

              <div className="text-right">
                <p className="font-headline text-[1.45rem] font-black leading-none" style={{ color: 'var(--arcade-yellow)' }}>
                  {player.score.toLocaleString()}
                </p>
                <p className="font-label text-[0.6rem] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  {language === 'en' ? 'pts' : 'pts'}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {!compact ? (
                <RoundBadge
                  label={interpolate(language === 'en' ? 'Seat {seat}' : 'Asiento {seat}', { seat: player.seat })}
                  tone={player.color}
                />
              ) : null}
              {isStarter ? <RoundBadge label={copy.start} tone="secondary" /> : null}
              {isActive ? (
                <span className="arcade-pill bg-[var(--arcade-yellow)] text-[#2c1800] shadow-[0_5px_0_rgba(15,7,24,0.88)]">
                  <Star className="h-3.5 w-3.5" />
                  {copy.live}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
