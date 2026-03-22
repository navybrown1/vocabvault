import { getInitials } from '@/game/avatar';
import type { PlayerColor } from '@/game/types';
import { getPlayerTheme } from './player-theme';

export interface FallbackAvatarProps {
  name: string;
  color: PlayerColor;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-12 w-12 text-sm',
  md: 'h-16 w-16 text-lg',
  lg: 'h-[5.5rem] w-[5.5rem] text-2xl',
};

export function FallbackAvatar({ name, color, size = 'md' }: FallbackAvatarProps) {
  const theme = getPlayerTheme(color);

  return (
    <div
      className={[
        'relative inline-flex items-center justify-center rounded-full border-[4px] border-white font-headline font-black uppercase tracking-[0.08em] text-white',
        'shadow-[0_8px_0_rgba(15,7,24,0.9)] before:absolute before:inset-[1px] before:rounded-[inherit] before:bg-white/10',
        sizeClasses[size],
      ].join(' ')}
      style={{
        background: `linear-gradient(135deg, ${theme.hex}, rgba(45,27,66,0.98))`,
      }}
    >
      <span className="relative z-10">{getInitials(name)}</span>
    </div>
  );
}
