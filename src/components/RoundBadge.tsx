import type { HTMLAttributes, ReactNode } from 'react';
import type { PlayerColor } from '@/game/types';
import { PLAYER_THEMES, getPlayerTheme } from './player-theme';

type BadgeTone = 'primary' | 'secondary' | 'tertiary' | 'neutral' | PlayerColor;

const toneStyles: Record<Exclude<BadgeTone, PlayerColor>, string> = {
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-[#11243a]',
  tertiary: 'bg-tertiary text-[#3d2408]',
  neutral: 'bg-[rgba(255,255,255,0.14)] text-on-surface',
};

export interface RoundBadgeProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  tone?: BadgeTone;
  icon?: ReactNode;
}

export function RoundBadge({ label, tone = 'primary', icon, className = '', ...props }: RoundBadgeProps) {
  const isPlayerTone = typeof tone === 'string' && tone in PLAYER_THEMES;
  const accent = isPlayerTone ? getPlayerTheme(tone as PlayerColor) : null;
  const style = tone in toneStyles ? toneStyles[tone as Exclude<BadgeTone, PlayerColor>] : '';

  return (
    <div
      className={[
        'arcade-pill shadow-[0_5px_0_rgba(15,7,24,0.88)]',
        style,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        isPlayerTone && accent
          ? {
              background: accent.hex,
              color: accent.hex,
              boxShadow: '0 5px 0 rgba(15,7,24,0.88)',
            }
          : undefined
      }
      {...props}
    >
      {icon}
      <span style={isPlayerTone ? { color: '#fffaf6' } : undefined}>{label}</span>
    </div>
  );
}
