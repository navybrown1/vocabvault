import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Eye, EyeOff, Heart, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getMasteryColor, getMasteryLabel } from '../utils/spacedRepetition';

export default function DailyWords() {
  const { state, dispatch, getDailyWords, getProgress } = useApp();
  const navigate = useNavigate();
  const dailyWords = getDailyWords().slice(0, state.user.dailyWordGoal + 5);
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced' | 'expert'>('all');

  // Filter by search query
  let filtered = dailyWords;
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(w =>
      w.word.toLowerCase().includes(q) || w.simpleDefinition.toLowerCase().includes(q)
    );
  }
  if (filter !== 'all') {
    filtered = filtered.filter(w => w.difficulty === filter);
  }

  const toggleReveal = (id: string) => {
    setRevealedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const difficultyColors: Record<string, string> = {
    beginner: '#51cf66',
    intermediate: '#fcc419',
    advanced: '#ff922b',
    expert: '#fa5252',
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Daily Words</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          Tap cards to reveal definitions — active recall!
        </p>
      </div>

      {/* Difficulty Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'beginner', 'intermediate', 'advanced', 'expert'] as const).map(d => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all"
            style={{
              background: filter === d ? (d === 'all' ? '#5c7cfa' : difficultyColors[d]) : 'var(--bg-card)',
              color: filter === d ? 'white' : 'var(--text-secondary)',
              borderColor: filter === d ? 'transparent' : 'var(--border-color)',
            }}
          >
            {d === 'all' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      {/* Word Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>All caught up!</h3>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              You've learned all available words. Check back for more!
            </p>
          </div>
        ) : (
          filtered.map((word, i) => {
            const isRevealed = revealedCards.has(word.id);
            const progress = getProgress(word.id);

            return (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border overflow-hidden"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                {/* Card Header - Always visible */}
                <button
                  onClick={() => toggleReveal(word.id)}
                  className="w-full p-4 text-left flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                        {word.word}
                      </h3>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                        style={{ background: difficultyColors[word.difficulty] }}
                      >
                        {word.difficulty}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {word.pronunciation} · {word.partOfSpeech}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isRevealed ? (
                      <EyeOff size={16} style={{ color: 'var(--text-tertiary)' }} />
                    ) : (
                      <Eye size={16} style={{ color: 'var(--text-tertiary)' }} />
                    )}
                  </div>
                </button>

                {/* Revealed Content */}
                <AnimatePresence>
                  {isRevealed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="pt-3">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {word.simpleDefinition}
                          </p>
                        </div>
                        <div className="px-3 py-2 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                          <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>
                            "{word.exampleSentence}"
                          </p>
                        </div>
                        <div className="px-3 py-2 rounded-xl border" style={{ borderColor: 'rgba(92,124,250,0.2)', background: 'rgba(92,124,250,0.04)' }}>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            💡 <span className="font-medium">Memory tip:</span> {word.memoryTip}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); speakWord(word.word); }}
                            className="p-2 rounded-xl border transition-colors hover:bg-brand-50"
                            style={{ borderColor: 'var(--border-color)' }}
                          >
                            <Volume2 size={14} style={{ color: 'var(--text-tertiary)' }} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_FAVORITE', payload: word.id }); }}
                            className="p-2 rounded-xl border transition-colors"
                            style={{ borderColor: 'var(--border-color)' }}
                          >
                            <Heart
                              size={14}
                              fill={progress?.isFavorite ? '#fa5252' : 'none'}
                              style={{ color: progress?.isFavorite ? '#fa5252' : 'var(--text-tertiary)' }}
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ type: 'MARK_WORD_LEARNED', payload: word.id });
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all"
                            style={{ background: progress?.isLearned ? '#51cf66' : 'linear-gradient(135deg, #5c7cfa, #4263eb)' }}
                          >
                            <Check size={14} />
                            {progress?.isLearned ? 'Learned' : 'Mark as Learned'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/word/${word.id}`); }}
                            className="p-2 rounded-xl border transition-colors hover:bg-brand-50"
                            style={{ borderColor: 'var(--border-color)' }}
                          >
                            <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
