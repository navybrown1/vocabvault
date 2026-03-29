import { getUiCopy } from '@/game/i18n';
import type { Language, Player } from '@/game/types';
import { PlayerCard } from './PlayerCard';

export interface ScoreboardProps {
  players: Player[];
  activePlayerId?: string | null;
  failedPlayerIds?: string[];
  starterPlayerId?: string | null;
  winnerIds?: string[];
  title?: string;
  language?: Language;
}

export function Scoreboard({
  players,
  activePlayerId,
  failedPlayerIds = [],
  starterPlayerId,
  winnerIds = [],
  title = 'Family Scoreboard',
  language = 'en',
}: ScoreboardProps) {
  const copy = getUiCopy(language).gameplay;
  return (
    <div className="space-y-4">
      <div className="pb-3">
        <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--arcade-yellow)]">{copy.scoreRail}</p>
        <h2 className="mt-1 font-headline text-3xl font-extrabold tracking-[-0.04em] text-on-surface drop-shadow-[2px_2px_0_rgba(0,0,0,0.7)]">
          {title}
        </h2>
      </div>
      <div className="space-y-3">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isActive={player.id === activePlayerId}
            isFailed={failedPlayerIds.includes(player.id)}
            isStarter={player.id === starterPlayerId}
            isWinner={winnerIds.includes(player.id)}
            compact
            language={language}
          />
        ))}
      </div>
    </div>
  );
}
