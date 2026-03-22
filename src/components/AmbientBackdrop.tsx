import { motion, useReducedMotion } from 'framer-motion';

export interface AmbientBackdropProps {
  className?: string;
}

const glowVariants = {
  float: {
    y: [0, -14, 0],
    scale: [1, 1.04, 1],
  },
};

export function AmbientBackdrop({ className = '' }: AmbientBackdropProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div aria-hidden className={`mesh-gradient pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 arcade-grid opacity-[0.14]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,16,37,0.04),rgba(26,16,37,0.68))]" />
      <div className="absolute left-8 top-24 h-28 w-28 rounded-full border-4 border-white/12 bg-white/4 sm:h-36 sm:w-36" />
      <div className="absolute bottom-20 right-10 h-20 w-20 rounded-full border-4 border-white/10 bg-white/4 sm:h-28 sm:w-28" />
      {!reducedMotion && (
        <>
          <motion.div
            className="absolute -left-16 top-12 h-72 w-72 rounded-full bg-primary/12 blur-3xl"
            variants={glowVariants}
            animate="float"
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-0 top-16 h-80 w-80 rounded-full bg-secondary/10 blur-3xl"
            variants={glowVariants}
            animate="float"
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
          <motion.div
            className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-[rgba(255,216,77,0.1)] blur-3xl"
            variants={glowVariants}
            animate="float"
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />
        </>
      )}
    </div>
  );
}
