import { AlertTriangle, ArrowRight, RefreshCcw } from 'lucide-react';
import type { Player } from '@/game/types';
import { GameShell } from '@/components/GameShell';
import { GlassPanel } from '@/components/GlassPanel';
import { AvatarUploader } from '@/components/AvatarUploader';
import { PlayerCard } from '@/components/PlayerCard';

export interface PlayerSetupScreenProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  playerCount: 1 | 2 | 3 | 4;
  maxPlayerCount: number;
  players: Player[];
  validation: Record<string, { nameError: string | null; avatarError: string | null; isComplete: boolean }>;
  uploadIssues: Record<string, string | null>;
  onPlayerCountChange: (count: 1 | 2 | 3 | 4) => void;
  onNameChange: (playerId: string, name: string) => void;
  onAvatarSelect: (playerId: string, file: File) => void;
  onStartGame: () => void;
  onReset: () => void;
  canStart: boolean;
  storageIssue: string | null;
}

export function PlayerSetupScreen({
  soundEnabled,
  onToggleSound,
  playerCount,
  maxPlayerCount,
  players,
  validation,
  uploadIssues,
  onPlayerCountChange,
  onNameChange,
  onAvatarSelect,
  onStartGame,
  onReset,
  canStart,
  storageIssue,
}: PlayerSetupScreenProps) {
  return (
    <GameShell
      soundEnabled={soundEnabled}
      onToggleSound={onToggleSound}
      onReset={onReset}
      title="Player setup"
      subtitle="Choose tonight's family lineup"
      roundLabel="Setup"
    >
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.4fr]">
        <GlassPanel tone="hero" accent="primary" className="p-6">
          <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">Control room</p>
          <h2 className="mt-3 font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface drop-shadow-[3px_3px_0_rgba(0,0,0,0.58)]">Player setup</h2>
          <div className="mt-6 rounded-[1.9rem] bg-[rgba(255,255,255,0.08)] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
            <p className="font-label text-[0.68rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Players tonight</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {Array.from({ length: maxPlayerCount }, (_, index) => {
                const count = (index + 1) as 1 | 2 | 3 | 4;
                const isActive = count === playerCount;
                return (
                  <button
                    key={count}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => onPlayerCountChange(count)}
                    className={[
                      'rounded-[1.4rem] border-[3px] px-4 py-3 text-left transition',
                      isActive
                        ? 'border-white bg-[var(--arcade-yellow)] text-[#2b1800] shadow-[0_8px_0_rgba(15,7,24,0.88)]'
                        : 'border-white/35 bg-[rgba(255,255,255,0.08)] text-on-surface hover:bg-[rgba(255,255,255,0.12)]',
                    ].join(' ')}
                  >
                    <p className="font-headline text-2xl font-black tracking-[-0.05em]">{count}</p>
                    <p className="mt-1 font-label text-[0.64rem] font-bold uppercase tracking-[0.18em]">
                      {count === 1 ? 'player' : 'players'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                compact
                subtitle={validation[player.id]?.isComplete ? 'Seat locked and camera-ready' : 'Waiting on setup details'}
              />
            ))}
          </div>

          {storageIssue ? (
            <div className="mt-6 rounded-[1.35rem] bg-[#ff8762]/12 p-4 text-sm text-[#ffd8cf] shadow-[inset_0_0_0_1px_rgba(255,135,98,0.2)]">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-tertiary" />
                <p>{storageIssue}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStartGame}
              disabled={!canStart}
              className={[
                'arcade-button inline-flex items-center gap-3 px-6 py-4 text-[0.82rem] transition',
                canStart
                  ? 'arcade-button--secondary text-[#04111f]'
                  : 'cursor-not-allowed bg-white/8 text-on-surface-variant',
              ].join(' ')}
            >
              Launch round one
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onReset}
              className="arcade-button arcade-button--neutral inline-flex items-center gap-2 px-4 py-3 text-[0.72rem] text-on-surface"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset session
            </button>
          </div>
        </GlassPanel>

        <div className="grid gap-5 md:grid-cols-2">
          {players.map((player) => (
            <GlassPanel key={player.id} tone="base" accent={player.color} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-label text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">Seat {player.seat}</p>
                  <h3 className="mt-2 font-headline text-2xl font-extrabold tracking-[-0.04em] text-on-surface">
                    {player.name.trim() || `Player ${player.seat}`}
                  </h3>
                </div>
                <span className="arcade-pill bg-[rgba(255,255,255,0.14)] text-on-surface">
                  {validation[player.id]?.isComplete ? 'Ready' : 'Needs setup'}
                </span>
              </div>

              <div className="mt-5 space-y-5">
                <div className="space-y-2">
                  <label htmlFor={`${player.id}-name`} className="font-label text-[0.72rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                    Player name
                  </label>
                  <input
                    id={`${player.id}-name`}
                    value={player.name}
                    onChange={(event) => onNameChange(player.id, event.target.value)}
                    placeholder={`Brown contender ${player.seat}`}
                    className="arcade-input"
                  />
                  {validation[player.id]?.nameError ? (
                    <p className="text-sm text-[#ff9baa]">{validation[player.id]?.nameError}</p>
                  ) : null}
                </div>

                <AvatarUploader
                  player={player}
                  error={uploadIssues[player.id] ?? validation[player.id]?.avatarError ?? null}
                  onSelect={(file) => onAvatarSelect(player.id, file)}
                />
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
