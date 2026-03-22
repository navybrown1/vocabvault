import type { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

type SafeButtonAttributes = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'
>;

export interface SoundToggleProps extends SafeButtonAttributes {
  enabled: boolean;
  compact?: boolean;
}

export function SoundToggle({ enabled, compact = false, className = '', ...props }: SoundToggleProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      aria-pressed={enabled}
      className={[
        'arcade-button arcade-button--neutral text-on-surface',
        compact ? 'px-3 py-2 text-[0.68rem]' : 'px-4 py-3 text-[0.74rem]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {enabled ? <Volume2 className="h-4 w-4 text-secondary" /> : <VolumeX className="h-4 w-4 text-[var(--arcade-yellow)]" />}
      <span>{enabled ? 'Sound On' : 'Sound Off'}</span>
    </motion.button>
  );
}
