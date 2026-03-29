import { HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTurnKindLabel, getUiCopy, interpolate } from '@/game/i18n';
import type { Language, LocalizedQuestion, Player, TurnKind } from '@/game/types';
import { FallbackAvatar } from './FallbackAvatar';
import { GlassPanel } from './GlassPanel';
import { RoundBadge } from './RoundBadge';

export interface QuestionCardProps {
  language: Language;
  question: LocalizedQuestion;
  roundLabel: string;
  activePlayer: Player;
  turnKind: TurnKind;
}

export function QuestionCard({ language, question, roundLabel, activePlayer, turnKind }: QuestionCardProps) {
  const copy = getUiCopy(language).gameplay;

  return (
    <GlassPanel
      tone="hero"
      accent={turnKind === 'original' ? 'primary' : 'secondary'}
      className="rounded-[2.75rem] p-6 text-center sm:p-10"
    >
      <div className="flex flex-wrap items-center justify-center gap-3">
        <RoundBadge label={roundLabel} tone="primary" />
        <RoundBadge label={question.category} tone="secondary" />
        <RoundBadge
          label={getTurnKindLabel(language, turnKind)}
          tone={turnKind === 'original' ? 'neutral' : 'tertiary'}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="mt-7"
      >
        <p className="font-label text-[0.76rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">
          {interpolate(copy.questionSpotlight, { player: activePlayer.name })}
        </p>
        <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-center">
          <div className="flex shrink-0 flex-col items-center gap-3">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2rem] border-[4px] border-white bg-[rgba(255,255,255,0.12)] shadow-[0_10px_0_rgba(15,7,24,0.88)]">
              {activePlayer.avatarDataUrl ? (
                <img src={activePlayer.avatarDataUrl} alt={`${activePlayer.name} portrait`} className="h-full w-full object-cover" />
              ) : (
                <FallbackAvatar name={activePlayer.name} color={activePlayer.color} size="lg" />
              )}
            </div>
            <span className="arcade-sticker flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFD84D,#FFB347)] text-[#3d2408]">
              <HelpCircle className="h-5 w-5" />
            </span>
          </div>
          <h2 className="max-w-4xl font-headline text-[2rem] font-extrabold leading-[1.08] tracking-[-0.05em] text-on-surface drop-shadow-[4px_4px_0_rgba(0,0,0,0.65)] sm:text-left sm:text-[2.9rem] lg:text-[3.4rem]">
            {question.question}
          </h2>
        </div>
      </motion.div>
    </GlassPanel>
  );
}
