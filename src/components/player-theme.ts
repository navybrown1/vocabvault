import type { CSSProperties } from 'react';
import type { PlayerColor } from '@/game/types';

export const PLAYER_THEMES: Record<
  PlayerColor,
  {
    label: string;
    hex: string;
    soft: string;
    glow: string;
    surface: string;
    chip: string;
  }
> = {
  blue: {
    label: 'Electric Blue',
    hex: '#3da2ff',
    soft: 'rgba(61, 162, 255, 0.34)',
    glow: 'rgba(61, 162, 255, 0.24)',
    surface: 'rgba(61, 162, 255, 0.16)',
    chip: 'rgba(61, 162, 255, 0.24)',
  },
  purple: {
    label: 'Vivid Purple',
    hex: '#a95cff',
    soft: 'rgba(169, 92, 255, 0.32)',
    glow: 'rgba(169, 92, 255, 0.24)',
    surface: 'rgba(169, 92, 255, 0.16)',
    chip: 'rgba(169, 92, 255, 0.24)',
  },
  green: {
    label: 'Neon Green',
    hex: '#00e676',
    soft: 'rgba(0, 230, 118, 0.32)',
    glow: 'rgba(0, 230, 118, 0.24)',
    surface: 'rgba(0, 230, 118, 0.16)',
    chip: 'rgba(0, 230, 118, 0.24)',
  },
  orange: {
    label: 'Fiery Orange',
    hex: '#ff6d00',
    soft: 'rgba(255, 109, 0, 0.32)',
    glow: 'rgba(255, 109, 0, 0.24)',
    surface: 'rgba(255, 109, 0, 0.16)',
    chip: 'rgba(255, 109, 0, 0.24)',
  },
};

export function getPlayerTheme(color: PlayerColor) {
  return PLAYER_THEMES[color];
}

export function playerGlowStyle(color: PlayerColor, boost = 1): CSSProperties {
  const theme = getPlayerTheme(color);
  return {
    boxShadow: `0 0 0 4px ${theme.soft}, 0 ${8 * boost}px 0 rgba(15, 7, 24, 0.95), 0 20px 40px ${theme.glow}`,
  };
}

export function playerBackgroundStyle(color: PlayerColor): CSSProperties {
  const theme = getPlayerTheme(color);
  return {
    background: `linear-gradient(135deg, ${theme.surface}, rgba(45, 27, 66, 0.96))`,
  };
}
