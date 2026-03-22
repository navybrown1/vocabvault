import { HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Question, TurnKind } from '@/game/types';
import { GlassPanel } from './GlassPanel';
import { RoundBadge } from './RoundBadge';

export interface QuestionCardProps {
  question: Question;
  roundLabel: string;
  activePlayerName: string;
  turnKind: TurnKind;
}

export function QuestionCard({ question, roundLabel, activePlayerName, turnKind }: QuestionCardProps) {
  return (
    <GlassPanel
      tone="hero"
      accent={turnKind === 'original' ? 'primary' : 'secondary'}
      className="rounded-[2.75rem] p-6 text-center sm:p-10"
    >
      <div className="flex flex-wrap items-center justify-center gap-3">
        <RoundBadge label={roundLabel} tone="primary" />
        <RoundBadge label={question.category} tone="secondary" />
        <RoundBadge label={turnKind === 'original' ? 'Original Turn' : 'Steal Chance'} tone={turnKind === 'original' ? 'neutral' : 'tertiary'} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="mt-7"
      >
        <p className="font-label text-[0.76rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">
          {activePlayerName} is in the spotlight
        </p>
        <div className="mt-4 flex items-start justify-center gap-4">
          <span className="arcade-sticker mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFD84D,#FFB347)] text-[#3d2408]">
            <HelpCircle className="h-5 w-5" />
          </span>
          <h2 className="max-w-4xl font-headline text-[2rem] font-extrabold leading-[1.08] tracking-[-0.05em] text-on-surface drop-shadow-[4px_4px_0_rgba(0,0,0,0.65)] sm:text-[2.9rem] lg:text-[3.4rem]">
            {question.question}
          </h2>
        </div>
      </motion.div>
    </GlassPanel>
  );
}
