import { useEffect, useMemo, useState } from 'react';
import { ORIGINAL_TURN_MS, ORIGINAL_WARNING_MS, STEAL_TURN_MS, STEAL_WARNING_MS } from '@/game/constants';
import type { TurnKind } from '@/game/types';

interface UseCountdownOptions {
  deadlineAt: number | null;
  active: boolean;
  turnToken: string | null;
  turnKind: TurnKind | null;
}

export function useCountdown({ deadlineAt, active, turnToken, turnKind }: UseCountdownOptions) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active || !deadlineAt || !turnToken) {
      setNow(Date.now());
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 100);

    return () => window.clearInterval(interval);
  }, [active, deadlineAt, turnToken]);

  return useMemo(() => {
    if (!deadlineAt || !turnToken || !turnKind) {
      return {
        remainingMs: 0,
        remainingSeconds: 0,
        progressRatio: 0,
        isWarning: false,
      };
    }

    const total = turnKind === 'original' ? ORIGINAL_TURN_MS : STEAL_TURN_MS;
    const remainingMs = Math.max(deadlineAt - now, 0);
    const warningThreshold = turnKind === 'original' ? ORIGINAL_WARNING_MS : STEAL_WARNING_MS;

    return {
      remainingMs,
      remainingSeconds: Math.ceil(remainingMs / 1_000),
      progressRatio: Math.max(Math.min(remainingMs / total, 1), 0),
      isWarning: remainingMs > 0 && remainingMs <= warningThreshold,
    };
  }, [deadlineAt, now, turnKind, turnToken]);
}
