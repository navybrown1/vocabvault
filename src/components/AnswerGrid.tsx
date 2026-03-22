import { motion } from 'framer-motion';
import type { QuestionResolution } from '@/game/types';
import { ANSWER_HOTKEYS } from '@/game/constants';

export interface AnswerGridProps {
  choices: string[];
  correctAnswer: string;
  lockedChoice: string | null;
  latestFailureChoice?: string | null;
  resolution: QuestionResolution | null;
  disabled?: boolean;
  onSelect: (choice: string) => void;
}

export function AnswerGrid({
  choices,
  correctAnswer,
  lockedChoice,
  latestFailureChoice,
  resolution,
  disabled = false,
  onSelect,
}: AnswerGridProps) {
  const baseChoiceClasses = [
    'bg-secondary text-[#10213d]',
    'bg-[var(--arcade-yellow)] text-[#3b2200]',
    'bg-[var(--arcade-green)] text-[#042917]',
    'bg-player-orange text-white',
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {choices.map((choice, index) => {
        const isCorrect = resolution ? choice === correctAnswer : false;
        const isWrongReveal = resolution?.outcome === 'allFailed' ? choice === latestFailureChoice : false;
        const isLocked = lockedChoice === choice;

        const tone = isCorrect
          ? 'bg-[var(--arcade-green)] text-white'
          : isWrongReveal || (resolution && isLocked && choice !== correctAnswer)
            ? 'bg-[rgba(255,255,255,0.14)] text-on-surface'
            : resolution
              ? 'bg-[rgba(255,255,255,0.1)] text-on-surface-variant'
              : baseChoiceClasses[index] ?? 'bg-secondary text-[#10213d]';

        return (
          <motion.button
            key={choice}
            whileHover={disabled ? undefined : { y: -2, scale: 1.01 }}
            whileTap={disabled ? undefined : { scale: 0.99 }}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(choice)}
            className={[
              'group arcade-button relative min-h-[122px] w-full justify-start rounded-[2rem] border-[4px] p-5 text-left normal-case tracking-normal',
              'shadow-[0_10px_0_rgba(15,7,24,0.95),0_18px_32px_rgba(0,0,0,0.18)] focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-secondary',
              tone,
              disabled ? 'cursor-default' : '',
              resolution && !isCorrect ? 'opacity-65 grayscale-[0.12]' : '',
              isCorrect ? 'animate-pulse-halo' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="flex w-full items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-white/80 bg-white/20 font-headline text-xl font-black text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.4)]">
                {ANSWER_HOTKEYS[index]}
              </div>
              <p className="pr-10 font-headline text-[1.4rem] font-extrabold leading-tight drop-shadow-[2px_2px_0_rgba(0,0,0,0.34)] sm:text-[1.7rem]">
                {choice}
              </p>
            </div>
            {isLocked ? (
              <span className="absolute right-4 top-4 rounded-full border-[3px] border-white bg-white/18 px-3 py-1 font-label text-[0.66rem] font-black uppercase tracking-[0.14em] text-white">
                {resolution ? (isCorrect ? 'Correct' : 'Locked') : 'Locked'}
              </span>
            ) : null}
            {isCorrect && resolution ? (
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-4xl text-white drop-shadow-[3px_3px_0_rgba(0,0,0,0.4)]">
                ✓
              </span>
            ) : null}
          </motion.button>
        );
      })}
    </div>
  );
}
