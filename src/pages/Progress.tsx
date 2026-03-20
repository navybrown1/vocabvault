import { motion } from 'framer-motion';
import { BarChart3, BookOpen, Brain, Calendar, Flame, Target, TrendingUp, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { vocabularyData } from '../data/vocabulary';
import { getMasteryColor, getMasteryLabel } from '../utils/spacedRepetition';
import { getRankTitle } from '../utils/badges';
import { MasteryLevel } from '../types';

export default function Progress() {
  const { state, getStudyHeatmap, getDueWords, getWeakWords } = useApp();
  const { user, wordProgress } = state;
  const heatmap = getStudyHeatmap();
  const dueWords = getDueWords();
  const weakWords = getWeakWords();

  const allProgress = Object.values(wordProgress);
  const learnedWords = allProgress.filter(p => p.isLearned);
  const totalCorrect = allProgress.reduce((sum, p) => sum + p.timesCorrect, 0);
  const totalIncorrect = allProgress.reduce((sum, p) => sum + p.timesIncorrect, 0);
  const totalAnswers = totalCorrect + totalIncorrect;
  const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

  // Mastery distribution
  const masteryDist: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  learnedWords.forEach(p => {
    masteryDist[p.masteryLevel] = (masteryDist[p.masteryLevel] || 0) + 1;
  });
  const maxMastery = Math.max(...Object.values(masteryDist), 1);

  // Category breakdown
  const categoryStats: Record<string, { total: number; learned: number }> = {};
  vocabularyData.forEach(w => {
    if (!categoryStats[w.category]) categoryStats[w.category] = { total: 0, learned: 0 };
    categoryStats[w.category].total++;
    if (wordProgress[w.id]?.isLearned) categoryStats[w.category].learned++;
  });

  // Heatmap — last 35 days (5 weeks)
  const heatmapDays: { date: string; value: number }[] = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    heatmapDays.push({ date: key, value: heatmap[key] || 0 });
  }
  const maxActivity = Math.max(...heatmapDays.map(d => d.value), 1);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Progress</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <BookOpen size={16} />, label: 'Words Learned', value: user.totalWordsLearned, color: '#5c7cfa', total: vocabularyData.length },
          { icon: <Flame size={16} />, label: 'Day Streak', value: user.currentStreak, color: '#fab005', total: null },
          { icon: <Target size={16} />, label: 'Accuracy', value: `${accuracy}%`, color: '#51cf66', total: null },
          { icon: <Zap size={16} />, label: 'Total XP', value: user.xp, color: '#ff922b', total: null },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center gap-1.5 mb-2" style={{ color: stat.color }}>
              {stat.icon}
              <span className="text-[10px] font-semibold uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
            {stat.total && (
              <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                of {stat.total} total
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Study Heatmap */}
      <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} style={{ color: 'var(--text-tertiary)' }} />
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            Study Activity (Last 5 Weeks)
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {heatmapDays.map(day => {
            const intensity = day.value / maxActivity;
            const opacity = day.value === 0 ? 0.08 : 0.2 + intensity * 0.8;
            return (
              <div
                key={day.date}
                className="aspect-square rounded-sm relative group"
                style={{
                  background: day.value === 0 ? 'var(--bg-tertiary)' : `rgba(92, 124, 250, ${opacity})`,
                }}
                title={`${day.date}: ${day.value} activities`}
              >
                <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-800 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                  {day.value} activities
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-1 mt-2">
          <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>Less</span>
          {[0.08, 0.25, 0.5, 0.75, 1].map((op, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{ background: i === 0 ? 'var(--bg-tertiary)' : `rgba(92, 124, 250, ${op})` }}
            />
          ))}
          <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>More</span>
        </div>
      </div>

      {/* Mastery Distribution */}
      <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} style={{ color: 'var(--text-tertiary)' }} />
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            Mastery Distribution
          </h3>
        </div>
        <div className="space-y-2.5">
          {([0, 1, 2, 3, 4, 5] as MasteryLevel[]).map(level => (
            <div key={level} className="flex items-center gap-3">
              <span className="text-xs w-20 font-medium" style={{ color: getMasteryColor(level) }}>
                {getMasteryLabel(level)}
              </span>
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: getMasteryColor(level) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(masteryDist[level] / maxMastery) * 100}%` }}
                  transition={{ duration: 0.5, delay: level * 0.05 }}
                />
              </div>
              <span className="text-xs font-bold w-6 text-right" style={{ color: 'var(--text-secondary)' }}>
                {masteryDist[level]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Progress */}
      <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Category Progress
        </h3>
        <div className="space-y-3">
          {Object.entries(categoryStats).map(([cat, stats]) => (
            <div key={cat}>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium capitalize" style={{ color: 'var(--text-secondary)' }}>{cat}</span>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{stats.learned}/{stats.total}</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                <motion.div
                  className="h-full rounded-full bg-brand-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.learned / stats.total) * 100}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Best */}
      <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} style={{ color: 'var(--text-tertiary)' }} />
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            Personal Bests
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
            <div className="text-lg font-bold text-accent-500">{user.longestStreak}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Longest Streak</div>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
            <div className="text-lg font-bold text-brand-500">{getRankTitle(user.level)}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Current Rank</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {dueWords.length > 0 && (
        <div className="rounded-2xl p-4 border" style={{ background: 'rgba(250,82,82,0.04)', borderColor: 'rgba(250,82,82,0.15)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            ⏰ You have <span className="text-danger-500 font-bold">{dueWords.length}</span> words due for review
          </p>
        </div>
      )}
    </div>
  );
}
