import type { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

const toneClasses: Record<'base' | 'hero' | 'tight' | 'inset', string> = {
  base: 'arcade-panel arcade-panel--base',
  hero: 'arcade-panel arcade-panel--hero',
  tight: 'arcade-panel arcade-panel--tight',
  inset: 'arcade-panel arcade-panel--inset',
};

type SafeDivAttributes = Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'>;

export interface GlassPanelProps extends SafeDivAttributes {
  children: ReactNode;
  tone?: 'base' | 'hero' | 'tight' | 'inset';
  accent?: 'primary' | 'secondary' | 'tertiary' | 'blue' | 'purple' | 'green' | 'orange';
  motionPreset?: 'lift' | 'fade' | 'none';
}

const accentClasses: Record<NonNullable<GlassPanelProps['accent']>, string> = {
  primary: 'shadow-[inset_0_4px_0_rgba(255,255,255,0.12)]',
  secondary: 'shadow-[inset_0_4px_0_rgba(255,255,255,0.12)]',
  tertiary: 'shadow-[inset_0_4px_0_rgba(255,255,255,0.12)]',
  blue: 'shadow-[inset_0_4px_0_rgba(255,255,255,0.12)]',
  purple: 'shadow-[inset_0_4px_0_rgba(255,255,255,0.12)]',
  green: 'shadow-[inset_0_4px_0_rgba(255,255,255,0.12)]',
  orange: 'shadow-[inset_0_4px_0_rgba(255,255,255,0.12)]',
};

const motionVariants = {
  lift: {
    initial: { opacity: 0, y: 20, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

export function GlassPanel({
  children,
  tone = 'base',
  accent,
  motionPreset = 'lift',
  className = '',
  ...props
}: GlassPanelProps) {
  const variants = motionPreset === 'none' ? undefined : motionVariants[motionPreset];

  return (
    <motion.div
      initial={variants?.initial}
      animate={variants?.animate}
      transition={variants?.transition}
      className={[
        'relative overflow-hidden text-on-surface',
        toneClasses[tone],
        accent ? accentClasses[accent] : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </motion.div>
  );
}
