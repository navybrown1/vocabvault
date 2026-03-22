import { motion } from 'framer-motion';
import { Crown, RefreshCcw, Sparkles, Trophy } from 'lucide-react';
import type { RankedPlayer } from '@/game/types';
import { GameShell } from '@/components/GameShell';
import { GlassPanel } from '@/components/GlassPanel';
import { WinnerPodium } from '@/components/WinnerPodium';
import { CelebrationLayer } from '@/components/CelebrationLayer';
import { FallbackAvatar } from '@/components/FallbackAvatar';
import { RoundBadge } from '@/components/RoundBadge';
import { getPlayerTheme } from '@/components/player-theme';

export interface WinnerScreenProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  rankings: RankedPlayer[];
  winnerIds: string[];
  onReset: () => void;
}

export function WinnerScreen({
  soundEnabled,
  onToggleSound,
  rankings,
  winnerIds,
  onReset,
}: WinnerScreenProps) {
  const winners = rankings.filter((player) => winnerIds.includes(player.id));
  const leadWinner = winners[0] ?? rankings[0];
  const leadTheme = leadWinner ? getPlayerTheme(leadWinner.color) : null;
  const topScore = winners[0]?.score ?? rankings[0]?.score ?? 0;
  const headline =
    winners.length > 1 ? 'Tie for 1st in the Brown family arena.' : `${winners[0]?.name ?? 'Winner'} takes the crown.`;

  return (
    <GameShell
      soundEnabled={soundEnabled}
      onToggleSound={onToggleSound}
      title="Game Over!"
      subtitle="Final rankings"
      roundLabel="Winner"
    >
      <div className="space-y-6">
        <GlassPanel tone="hero" accent={leadWinner?.color ?? 'primary'} className="relative overflow-hidden rounded-[2.75rem] px-6 py-8 sm:px-8 lg:px-10">
          <CelebrationLayer visible tone="winner" density={40} />
          <div
            className="pointer-events-none absolute inset-x-[10%] top-[8%] h-[22rem] rounded-full blur-3xl"
            style={{
              background: leadTheme
                ? `radial-gradient(circle, ${leadTheme.soft} 0%, rgba(255,216,77,0.18) 38%, rgba(255,255,255,0) 72%)`
                : undefined,
            }}
          />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
            <div className="text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <RoundBadge label="Winner locked" tone="tertiary" icon={<Sparkles className="h-3.5 w-3.5" />} />
                <RoundBadge
                  label={winners.length > 1 ? `${winners.length} champions` : 'Family champion'}
                  tone={leadWinner?.color ?? 'primary'}
                  icon={<Crown className="h-3.5 w-3.5" />}
                />
              </div>

              <h2 className="mt-5 font-headline text-[3.3rem] font-extrabold leading-[0.92] tracking-[-0.08em] text-on-surface drop-shadow-[5px_5px_0_rgba(0,0,0,0.58)] sm:text-[4.5rem] xl:text-[5.6rem]">
                {headline}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-on-surface-variant sm:text-lg sm:leading-8">
                {winners.length > 1
                  ? 'The night ends in a shared family title, with the final score line dead even at the top.'
                  : `${leadWinner?.name ?? 'The winner'} closes the night on top with the biggest score on the board and the final fanfare all to themselves.`}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <div className="arcade-pill bg-[rgba(255,255,255,0.14)] text-on-surface shadow-[0_6px_0_rgba(15,7,24,0.88)]">
                  <Trophy className="h-4 w-4 text-[var(--arcade-yellow)]" />
                  {topScore.toLocaleString()} points
                </div>
                <div className="arcade-pill bg-[rgba(255,255,255,0.1)] text-on-surface shadow-[0_6px_0_rgba(15,7,24,0.88)]">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  Final podium locked
                </div>
              </div>

              <button
                type="button"
                onClick={onReset}
                className="arcade-button arcade-button--primary mt-8 inline-flex px-6 py-4 text-[0.82rem] text-white"
              >
                <RefreshCcw className="h-4 w-4" />
                Start a new game
              </button>
            </div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative mx-auto max-w-[28rem]"
              >
                <div className="pointer-events-none absolute inset-x-[14%] top-8 h-32 rounded-full bg-[radial-gradient(circle,rgba(255,216,77,0.56)_0%,rgba(255,216,77,0)_72%)] blur-2xl" />
                <div
                  className="relative overflow-hidden rounded-[2.4rem] border-[4px] border-white/80 bg-[rgba(16,10,26,0.56)] px-5 py-6 shadow-[0_14px_0_rgba(15,7,24,0.94),0_30px_64px_rgba(0,0,0,0.32)] sm:px-7"
                  style={
                    leadTheme
                      ? { boxShadow: `0 0 0 4px ${leadTheme.soft}, 0 14px 0 rgba(15,7,24,0.94), 0 30px 64px ${leadTheme.glow}` }
                      : undefined
                  }
                >
                  {winners.length === 1 && leadWinner ? (
                    <div className="text-center">
                      <div className="relative mx-auto w-fit">
                        <motion.div
                          className="absolute inset-[-1.1rem] rounded-full border-[8px] border-[rgba(255,216,77,0.38)]"
                          animate={{ scale: [0.94, 1.03, 0.96], opacity: [0.4, 0.76, 0.48] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                          className="absolute inset-[-2rem] rounded-full border-[3px] border-white/22"
                          animate={{ scale: [0.9, 1.08, 0.94], opacity: [0.14, 0.34, 0.18] }}
                          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        {leadWinner.avatarDataUrl ? (
                          <img
                            src={leadWinner.avatarDataUrl}
                            alt={`${leadWinner.name} portrait`}
                            className="relative h-[13rem] w-[13rem] rounded-full border-[6px] border-white object-cover shadow-[0_14px_0_rgba(15,7,24,0.94)] sm:h-[15rem] sm:w-[15rem]"
                          />
                        ) : (
                          <FallbackAvatar name={leadWinner.name} color={leadWinner.color} size="lg" />
                        )}
                      </div>

                      <div className="mt-6">
                        <p className="font-label text-[0.76rem] font-bold uppercase tracking-[0.22em] text-[var(--arcade-yellow)]">
                          Champion of the night
                        </p>
                        <h3 className="mt-3 font-headline text-[2.6rem] font-extrabold tracking-[-0.06em] text-on-surface drop-shadow-[4px_4px_0_rgba(0,0,0,0.58)] sm:text-[3.2rem]">
                          {leadWinner.name}
                        </h3>
                        <p className="mt-3 font-headline text-[2.1rem] font-black tracking-[-0.05em] text-[var(--arcade-yellow)]">
                          {leadWinner.score.toLocaleString()} PTS
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {winners.map((winner) => (
                        <div
                          key={winner.id}
                          className="rounded-[2rem] border-[3px] border-white/70 bg-[rgba(255,255,255,0.08)] p-4 text-center shadow-[0_10px_0_rgba(15,7,24,0.9)]"
                        >
                          <div className="mx-auto w-fit">
                            {winner.avatarDataUrl ? (
                              <img
                                src={winner.avatarDataUrl}
                                alt={`${winner.name} portrait`}
                                className="h-24 w-24 rounded-full border-[4px] border-white object-cover shadow-[0_8px_0_rgba(15,7,24,0.9)]"
                              />
                            ) : (
                              <FallbackAvatar name={winner.name} color={winner.color} size="lg" />
                            )}
                          </div>
                          <h3 className="mt-4 font-headline text-3xl font-extrabold tracking-[-0.05em] text-on-surface">
                            {winner.name}
                          </h3>
                          <p className="mt-2 font-headline text-[1.8rem] font-black tracking-[-0.05em] text-[var(--arcade-yellow)]">
                            {winner.score.toLocaleString()} PTS
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </GlassPanel>

        <WinnerPodium rankings={rankings} winnerIds={winnerIds} />

        <GlassPanel tone="base" accent="secondary" className="p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-secondary" />
            <div>
              <p className="font-label text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--arcade-yellow)]">Full standings</p>
              <h3 className="font-headline text-2xl font-extrabold tracking-[-0.04em] text-on-surface">
                {rankings.length === 1 ? 'Solo result' : `${rankings.length}-player finish`}
              </h3>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {rankings.map((player) => (
              <div
                key={player.id}
                className="arcade-well rounded-[2rem] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-label text-[0.7rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">{player.rankLabel}</p>
                    <h4 className="mt-2 font-headline text-2xl font-extrabold tracking-[-0.04em] text-on-surface">{player.name}</h4>
                  </div>
                  <p className="font-headline text-3xl font-extrabold tracking-[-0.05em] text-[var(--arcade-yellow)]">{player.score}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </GameShell>
  );
}
