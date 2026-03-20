import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Flame, RefreshCw, Star, Target, TrendingUp, Trophy, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { vocabularyData } from '../data/vocabulary';
import { getXPForCurrentLevel, getXPForNextLevel } from '../utils/spacedRepetition';
import { getRankTitle } from '../utils/badges';

export default function Home() {
  const { state, getDueWords, getDailyWords, getWeakWords, getTodayStats } = useApp();
  const navigate = useNavigate();
  const { user } = state;
  const todayStats = getTodayStats();
  const dueWords = getDueWords();
  const dailyWords = getDailyWords();
  const weakWords = getWeakWords();

  const xpForNext = getXPForNextLevel(user.level);
  const xpForCurrent = getXPForCurrentLevel(user.level);
  const xpProgress = xpForNext > xpForCurrent
    ? Math.min((user.xp - xpForCurrent) / (xpForNext - xpForCurrent), 1)
    : 1;
  const dailyProgress = Math.min(todayStats.wordsLearned / user.dailyWordGoal, 1);

  const dayIndex = new Date().getDate() % vocabularyData.length;
  const wordOfDay = vocabularyData[dayIndex];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Hey, {user.name}! 👋
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {getRankTitle(user.level)} · Level {user.level} · {user.currentStreak > 0 ? `🔥 ${user.currentStreak}-day streak` : 'Start your streak today!'}
        </p>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'XP', value: user.xp, icon: <Zap size={16} />, color: '#5c7cfa' },
          { label: 'Streak', value: `${user.currentStreak}d`, icon: <Flame size={16} />, color: '#fab005' },
          { label: 'Learned', value: user.totalWordsLearned, icon: <BookOpen size={16} />, color: '#51cf66' },
          { label: 'Due', value: dueWords.length, icon: <RefreshCw size={16} />, color: dueWords.length > 0 ? '#fa5252' : '#868e96' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 border flex items-center gap-3"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${s.color}18`, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div className="text-lg font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* LEFT COL */}
        <div className="space-y-4">

          {/* Level + XP progress */}
          <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Level {user.level} → {user.level + 1}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {user.xp} / {xpForNext} XP
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <motion.div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                initial={{ width: 0 }} animate={{ width: `${xpProgress * 100}%` }} transition={{ duration: 0.8 }} />
            </div>
          </div>

          {/* Daily Goal */}
          <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-brand-500" />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Daily Goal</span>
              </div>
              <span className="text-sm font-bold text-brand-500">{todayStats.wordsLearned}/{user.dailyWordGoal}</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: dailyProgress >= 1 ? '#51cf66' : 'linear-gradient(90deg,#5c7cfa,#4263eb)' }}
                initial={{ width: 0 }} animate={{ width: `${dailyProgress * 100}%` }} transition={{ duration: 0.8 }} />
            </div>
            {dailyProgress >= 1 && (
              <p className="text-xs mt-2 text-success-600 font-medium">✨ Daily goal complete! Bonus XP available!</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Learn Words', sub: `${dailyWords.length} new`, icon: <BookOpen size={20} />, color: '#5c7cfa', path: '/daily' },
              { label: 'Quiz Mode', sub: 'Test yourself', icon: <Brain size={20} />, color: '#51cf66', path: '/quiz' },
              { label: 'Review', sub: `${dueWords.length} due`, icon: <RefreshCw size={20} />, color: dueWords.length > 0 ? '#fa5252' : '#868e96', path: '/review', urgent: dueWords.length > 0 },
              { label: 'Progress', sub: `${user.totalWordsLearned} learned`, icon: <TrendingUp size={20} />, color: '#fab005', path: '/progress' },
            ].map(a => (
              <motion.button key={a.path} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(a.path)}
                className="p-4 rounded-2xl border text-left relative overflow-hidden"
                style={{ background: 'var(--bg-card)', borderColor: a.urgent ? `${a.color}50` : 'var(--border-color)' }}>
                <div style={{ color: a.color }} className="mb-2">{a.icon}</div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{a.label}</div>
                <div className="text-xs mt-0.5" style={{ color: a.urgent ? a.color : 'var(--text-tertiary)' }}>{a.sub}</div>
                {a.urgent && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-danger-500 animate-pulse" />}
              </motion.button>
            ))}
          </div>
        </div>

        {/* RIGHT COL */}
        <div className="space-y-4">

          {/* Word of the Day */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={() => navigate(`/word/${wordOfDay.id}`)}
            className="rounded-2xl p-5 border cursor-pointer"
            style={{ background: 'linear-gradient(135deg,rgba(92,124,250,0.07),rgba(92,124,250,0.02))', borderColor: 'rgba(92,124,250,0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Star size={14} className="text-accent-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-500">Word of the Day</span>
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
              {wordOfDay.word}
            </h3>
            <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
              {wordOfDay.pronunciation} · {wordOfDay.partOfSpeech}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{wordOfDay.simpleDefinition}</p>
            <p className="text-xs mt-3 italic" style={{ color: 'var(--text-tertiary)' }}>"{wordOfDay.exampleSentence}"</p>
          </motion.div>

          {/* Today's activity */}
          {todayStats.totalAnswers > 0 && (
            <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>Today's Activity</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xl font-bold text-brand-500">{todayStats.wordsLearned}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Learned</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-success-500">
                    {Math.round((todayStats.correctAnswers / Math.max(todayStats.totalAnswers, 1)) * 100)}%
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Accuracy</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-accent-500">+{todayStats.xpEarned}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>XP</div>
                </div>
              </div>
            </div>
          )}

          {/* Weak words */}
          {weakWords.length > 0 && (
            <div className="rounded-2xl p-4 border" style={{ background: 'rgba(250,82,82,0.04)', borderColor: 'rgba(250,82,82,0.15)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>💪 Words You Almost Know</p>
              <div className="flex flex-wrap gap-2">
                {weakWords.slice(0, 6).map(w => (
                  <button key={w.id} onClick={() => navigate(`/word/${w.id}`)}
                    className="px-3 py-1 rounded-full text-xs font-medium border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                    {w.word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {user.badges.filter(b => b.earned).length > 0 && (
            <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-accent-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Recent Badges</span>
                </div>
                <button onClick={() => navigate('/profile')} className="text-xs text-brand-500 font-medium">View All</button>
              </div>
              <div className="flex gap-3 flex-wrap">
                {user.badges.filter(b => b.earned).map(b => (
                  <div key={b.id} className="flex flex-col items-center min-w-[48px]">
                    <div className="text-2xl mb-0.5">{b.icon}</div>
                    <span className="text-[9px] font-medium text-center" style={{ color: 'var(--text-tertiary)' }}>{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
