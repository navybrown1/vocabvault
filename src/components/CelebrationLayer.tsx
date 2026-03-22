import { motion, useReducedMotion } from 'framer-motion';

export interface CelebrationLayerProps {
  visible: boolean;
  tone?: 'winner' | 'round';
}

const particles = Array.from({ length: 20 }, (_, index) => index);

export function CelebrationLayer({ visible, tone = 'winner' }: CelebrationLayerProps) {
  const reducedMotion = useReducedMotion();

  if (!visible || reducedMotion) {
    return null;
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => {
        const left = (particle / particles.length) * 100;
        const delay = particle * 0.05;
        const hueClass =
          tone === 'winner'
            ? particle % 4 === 0
              ? 'bg-secondary'
              : particle % 4 === 1
                ? 'bg-primary'
                : particle % 4 === 2
                  ? 'bg-[var(--arcade-yellow)]'
                  : 'bg-player-orange'
            : particle % 2 === 0
              ? 'bg-tertiary'
              : 'bg-[var(--arcade-yellow)]';

        return (
          <motion.span
            key={particle}
            className={`absolute top-0 h-3 w-2 rounded-sm ${hueClass} shadow-[0_0_12px_rgba(255,255,255,0.18)]`}
            style={{ left: `${left}%` }}
            initial={{ opacity: 0, y: -30, scale: 0.4 }}
            animate={{
              opacity: [0, 1, 0.6, 0],
              y: ['0%', '40%', '88%'],
              x: [0, particle % 2 === 0 ? 22 : -22, particle % 3 === 0 ? -28 : 28],
              rotate: [0, 120, 240],
              scale: [0.5, 1, 0.7],
            }}
            transition={{
              duration: tone === 'winner' ? 2.8 : 1.8,
              ease: 'easeOut',
              repeat: Infinity,
              delay,
              repeatDelay: tone === 'winner' ? 0.4 : 1.4,
            }}
          />
        );
      })}
    </div>
  );
}
