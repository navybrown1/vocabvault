import type { ReactNode } from 'react';
import { AmbientBackdrop } from './AmbientBackdrop';
import { TopStatusBar } from './TopStatusBar';

export interface GameShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  roundLabel?: string;
  scoreLabel?: string;
  language: 'en' | 'es';
  onToggleLanguage?: () => void;
  soundEnabled: boolean;
  onToggleSound?: () => void;
  onReset?: () => void;
  className?: string;
  rightSlot?: ReactNode;
}

export function GameShell({
  children,
  title,
  subtitle,
  roundLabel,
  scoreLabel,
  language,
  onToggleLanguage,
  soundEnabled,
  onToggleSound,
  onReset,
  className = '',
  rightSlot,
}: GameShellProps) {
  return (
    <div className={['relative min-h-screen overflow-hidden bg-background text-on-surface', className].filter(Boolean).join(' ')}>
      <AmbientBackdrop />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <TopStatusBar
          title={title}
          subtitle={subtitle}
          roundLabel={roundLabel}
          scoreLabel={scoreLabel}
          language={language}
          onToggleLanguage={onToggleLanguage}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          onReset={onReset}
          rightSlot={rightSlot}
        />
        <div className="mt-6 flex-1">{children}</div>
      </div>
    </div>
  );
}
