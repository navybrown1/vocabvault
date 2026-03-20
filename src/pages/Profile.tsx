import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, BookOpen, Calendar, Flame, Settings, Star, TrendingUp, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getXPForCurrentLevel, getXPForNextLevel } from '../utils/spacedRepetition';
import { getRankTitle, ALL_BADGES } from '../utils/badges';

export default function Profile() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { user } = state;

  const xpForNext = getXPForNextLevel(user.level);
  const xpForCurrent = getXPForCurrentLevel(user.level);
  const xpProgress = xpForNext > xpForCurrent ? (user.xp - xpForCurrent) / (xpForNext - xpForCurrent) : 1;

  const earnedBadges = user.badges.filter(b => b.earned);
  const unearnedBadges = ALL_BADGES.filter(b => !user.badges.find(ub => ub.id === b.id && ub.earned));

  return (
    <div className="space-y-5">
      {/* Profile Header */}
      <div className="text-center pt-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center mx-auto mb-3 shadow-lg text-4xl">
          {user.avatar}
        </div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {getRankTitle(user.level)} · Level {user.level}
        </p>

        {/* XP Bar */}
        <div className="mt-4 max-w-xs mx-auto">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'var(--text-tertiary)' }}>{user.xp} XP</span>
            <span style={{ color: 'var(--text-tertiary)' }}>{xpForNext} XP</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: <BookOpen size={14} />, value: user.totalWordsLearned, label: 'Learned', color: '#5c7cfa' },
          { icon: <Flame size={14} />, value: user.currentStreak, label: 'Streak', color: '#fab005' },
          { icon: <Star size={14} />, value: user.longestStreak, label: 'Best', color: '#ff922b' },
          { icon: <Award size={14} />, value: earnedBadges.length, label: 'Badges', color: '#51cf66' },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-2xl p-3 text-center border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            <div className="text-[9px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Learning Goal */}
      <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
          Learning Profile
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase" style={{ color: 'var(--text-tertiary)' }}>Goal</div>
            <div className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{user.goal}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase" style={{ color: 'var(--text-tertiary)' }}>Daily Target</div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.dailyWordGoal} words/day</div>
          </div>
          <div>
            <div className="text-[10px] uppercase" style={{ color: 'var(--text-tertiary)' }}>Joined</div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase" style={{ color: 'var(--text-tertiary)' }}>Level</div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {user.level} — {getRankTitle(user.level)}
            </div>
          </div>
        </div>
      </div>

      {/* Earned Badges */}
      <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Earned Badges ({earnedBadges.length}/{ALL_BADGES.length})
        </h3>
        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {earnedBadges.map(badge => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center p-3 rounded-xl"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <span className="text-2xl mb-1">{badge.icon}</span>
                <span className="text-[10px] font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
                  {badge.name}
                </span>
                <span className="text-[9px] text-center mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  {badge.description}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>
            Start learning to earn badges!
          </p>
        )}
      </div>

      {/* Locked Badges */}
      {unearnedBadges.length > 0 && (
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Locked Badges
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {unearnedBadges.map(badge => (
              <div
                key={badge.id}
                className="flex flex-col items-center p-3 rounded-xl opacity-40"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <span className="text-2xl mb-1 grayscale">🔒</span>
                <span className="text-[10px] font-semibold text-center" style={{ color: 'var(--text-secondary)' }}>
                  {badge.name}
                </span>
                <span className="text-[9px] text-center mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  {badge.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings button */}
      <button
        onClick={() => navigate('/settings')}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold"
        style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
      >
        <Settings size={16} />
        Settings
      </button>
    </div>
  );
}
