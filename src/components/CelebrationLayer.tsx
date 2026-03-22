import { motion, useReducedMotion } from 'framer-motion';

export interface CelebrationLayerProps {
  visible: boolean;
  tone?: 'winner' | 'round';
  density?: number;
}

export function CelebrationLayer({ visible, tone = 'winner', density }: CelebrationLayerProps) {
  const reducedMotion = useReducedMotion();
  const particleCount = density ?? (tone === 'winner' ? 34 : 20);
  const particles = Array.from({ length: particleCount }, (_, index) => index);

  if (!visible || reducedMotion) {
    return null;
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {tone === 'winner' ? (
        <>
          <motion.div
            className="absolute left-1/2 top-[8%] h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,216,77,0.38)_0%,rgba(255,216,77,0.12)_34%,rgba(255,216,77,0)_72%)] blur-2xl"
            animate={{ scale: [0.92, 1.08, 0.96], opacity: [0.5, 0.82, 0.58] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/2 top-[16%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full border-[10px] border-white/12"
            animate={{ scale: [0.84, 1.02, 0.9], opacity: [0.08, 0.22, 0.12], rotate: [0, 8, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      ) : null}

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
            className={`absolute top-0 ${tone === 'winner' ? 'h-4 w-2.5 rounded-full' : 'h-3 w-2 rounded-sm'} ${hueClass} shadow-[0_0_14px_rgba(255,255,255,0.18)]`}
            style={{ left: `${left}%` }}
            initial={{ opacity: 0, y: -30, scale: 0.4 }}
            animate={{
              opacity: [0, 1, 0.6, 0],
              y: ['0%', tone === 'winner' ? '54%' : '40%', '94%'],
              x: [0, particle % 2 === 0 ? (tone === 'winner' ? 34 : 22) : tone === 'winner' ? -34 : -22, particle % 3 === 0 ? -28 : 28],
              rotate: [0, tone === 'winner' ? 180 : 120, tone === 'winner' ? 330 : 240],
              scale: tone === 'winner' ? [0.4, 1.18, 0.74] : [0.5, 1, 0.7],
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
