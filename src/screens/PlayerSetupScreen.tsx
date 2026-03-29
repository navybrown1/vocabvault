import { AlertTriangle, ArrowRight, CheckCircle2, Plus, RefreshCcw, XCircle } from 'lucide-react';
import { getPlayerWord, getUiCopy, interpolate } from '@/game/i18n';
import type { Language, Player } from '@/game/types';
import { GameShell } from '@/components/GameShell';
import { GlassPanel } from '@/components/GlassPanel';
import { AvatarUploader } from '@/components/AvatarUploader';
import { PlayerCard } from '@/components/PlayerCard';

export interface PlayerSetupScreenProps {
  language: Language;
  onToggleLanguage: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  playerCount: 1 | 2 | 3 | 4;
  selectedPlayerIds: string[];
  selectedCount: number;
  maxPlayerCount: number;
  players: Player[];
  validation: Record<string, { nameError: string | null; avatarError: string | null; isComplete: boolean }>;
  uploadIssues: Record<string, string | null>;
  onPlayerCountChange: (count: 1 | 2 | 3 | 4) => void;
  onPlayerSelectionToggle: (playerId: string) => void;
  onNameChange: (playerId: string, name: string) => void;
  onAvatarSelect: (playerId: string, file: File) => void;
  onStartGame: () => void;
  onReset: () => void;
  canStart: boolean;
  storageIssue: string | null;
}

export function PlayerSetupScreen({
  language,
  onToggleLanguage,
  soundEnabled,
  onToggleSound,
  playerCount,
  selectedPlayerIds,
  selectedCount,
  maxPlayerCount,
  players,
  validation,
  uploadIssues,
  onPlayerCountChange,
  onPlayerSelectionToggle,
  onNameChange,
  onAvatarSelect,
  onStartGame,
  onReset,
  canStart,
  storageIssue,
}: PlayerSetupScreenProps) {
  const copy = getUiCopy(language).setup;
  const selectedPlayerSet = new Set(selectedPlayerIds);
  const selectedPlayers = players.filter((player) => selectedPlayerSet.has(player.id));
  const needsSelectionAdjustment = selectedCount !== playerCount;
  const selectionFull = selectedCount >= playerCount;

  return (
    <GameShell
      language={language}
      onToggleLanguage={onToggleLanguage}
      soundEnabled={soundEnabled}
      onToggleSound={onToggleSound}
      onReset={onReset}
      title={copy.title}
      subtitle={copy.subtitle}
      roundLabel={language === 'en' ? 'Setup' : 'Preparación'}
    >
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.4fr]">
        <GlassPanel tone="hero" accent="primary" className="p-6">
          <p className="font-label text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">{copy.controlRoom}</p>
          <h2 className="mt-3 font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface drop-shadow-[3px_3px_0_rgba(0,0,0,0.58)]">{copy.title}</h2>
          <div className="mt-6 rounded-[1.9rem] bg-[rgba(255,255,255,0.08)] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
            <p className="font-label text-[0.68rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">{copy.playersTonight}</p>
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
                      {getPlayerWord(language, count)}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-[1.25rem] bg-[rgba(14,10,24,0.28)] px-4 py-3 text-sm text-on-surface">
              {needsSelectionAdjustment ? (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ff9baa]" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8dffbd]" />
              )}
              <p>
                {interpolate(copy.pickExactly, {
                  count: playerCount,
                  playerWord: getPlayerWord(language, playerCount),
                  selected: selectedCount,
                })}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {selectedPlayers.length > 0 ? (
              selectedPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  compact
                  language={language}
                  subtitle={validation[player.id]?.isComplete ? copy.selectedSubtitle : copy.waitingSubtitle}
                />
              ))
            ) : (
              <div className="rounded-[1.5rem] bg-[rgba(255,255,255,0.06)] px-4 py-5 text-sm text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
                {copy.noPlayers}
              </div>
            )}
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
              {copy.start}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onReset}
              className="arcade-button arcade-button--neutral inline-flex items-center gap-2 px-4 py-3 text-[0.72rem] text-on-surface"
            >
              <RefreshCcw className="h-4 w-4" />
              {copy.reset}
            </button>
          </div>
        </GlassPanel>

        <div className="grid gap-5 md:grid-cols-2">
          {players.map((player) => {
            const isSelected = selectedPlayerSet.has(player.id);
            const joinDisabled = !isSelected && selectionFull;
            return (
              <GlassPanel
                key={player.id}
                tone="base"
                accent={player.color}
                className={['p-5 transition', !isSelected ? 'opacity-75 saturate-[0.8]' : ''].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-label text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">
                      {interpolate(copy.seat, { seat: player.seat })}
                    </p>
                    <h3 className="mt-2 font-headline text-2xl font-extrabold tracking-[-0.04em] text-on-surface">
                      {player.name.trim() || interpolate(copy.namePlaceholder, { seat: player.seat })}
                    </h3>
                  </div>
                  <button
                    type="button"
                    disabled={joinDisabled}
                    onClick={() => onPlayerSelectionToggle(player.id)}
                    className={[
                      'arcade-button inline-flex gap-2 px-4 py-2.5 text-[0.68rem]',
                      isSelected
                        ? 'arcade-button--secondary text-[#07131d]'
                        : joinDisabled
                          ? 'cursor-not-allowed bg-white/8 text-on-surface-variant'
                          : 'arcade-button--neutral text-on-surface',
                    ].join(' ')}
                  >
                    {isSelected ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {isSelected ? copy.sitOut : joinDisabled ? copy.benchOne : copy.join}
                  </button>
                </div>

                <div className="mt-4">
                  <span className="arcade-pill bg-[rgba(255,255,255,0.14)] text-on-surface">
                    {isSelected
                      ? validation[player.id]?.isComplete
                        ? copy.selectedReady
                        : copy.selectedWaiting
                      : copy.standby}
                  </span>
                </div>

                <div className="mt-5 space-y-5">
                  <div className="space-y-2">
                    <label htmlFor={`${player.id}-name`} className="font-label text-[0.72rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                      {copy.playerName}
                    </label>
                    <input
                      id={`${player.id}-name`}
                      value={player.name}
                      onChange={(event) => onNameChange(player.id, event.target.value)}
                      placeholder={interpolate(copy.namePlaceholder, { seat: player.seat })}
                      className="arcade-input"
                    />
                    {validation[player.id]?.nameError ? (
                      <p className="text-sm text-[#ff9baa]">{validation[player.id]?.nameError}</p>
                    ) : null}
                  </div>

                  <AvatarUploader
                    language={language}
                    player={player}
                    error={isSelected ? uploadIssues[player.id] ?? validation[player.id]?.avatarError ?? null : null}
                    onSelect={(file) => onAvatarSelect(player.id, file)}
                  />
                </div>
              </GlassPanel>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}
