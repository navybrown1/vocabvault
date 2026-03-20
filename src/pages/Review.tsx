import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Eye, EyeOff, RotateCcw, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { vocabularyData } from '../data/vocabulary';
import { getMasteryColor, getMasteryLabel } from '../utils/spacedRepetition';

export default function Review() {
  const { state, dispatch, getDueWords } = useApp();
  const navigate = useNavigate();
  const dueWords = getDueWords();
  const allLearnedWords = vocabularyData.filter(w => state.wordProgress[w.id]?.isLearned);

  const [reviewWords] = useState(() =>
    dueWords.length > 0 ? dueWords : allLearnedWords.slice(0, 10)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [complete, setComplete] = useState(false);

  const currentWord = reviewWords[currentIndex];

  const handleResponse = (correct: boolean) => {
    if (!currentWord) return;
    dispatch({ type: 'RECORD_QUIZ_ANSWER', payload: { wordId: currentWord.id, correct } });
    setResults(r => [...r, { wordId: currentWord.id, correct }]);

    if (currentIndex + 1 >= reviewWords.length) {
      setComplete(true);
    } else {
      setCurrentIndex(i => i + 1);
      setIsFlipped(false);
    }
  };

  if (reviewWords.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-5xl">✨</div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>No reviews due!</h2>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          You're all caught up. Learn new words to build your review queue.
        </p>
        <button
          onClick={() => navigate('/daily')}
          className="px-6 py-3 rounded-2xl text-white text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #5c7cfa, #4263eb)' }}
        >
          Learn New Words
        </button>
      </div>
    );
  }

  if (complete) {
    const correctCount = results.filter(r => r.correct).length;
    const percentage = Math.round((correctCount / results.length) * 100);

    return (
      <div className="space-y-6 text-center pt-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="text-5xl mb-2">🎯</div>
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Review Complete!</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {correctCount}/{results.length} recalled correctly ({percentage}%)
          </p>
        </div>

        {/* Results summary */}
        <div className="space-y-2 text-left">
          {results.map(r => {
            const word = vocabularyData.find(w => w.id === r.wordId);
            if (!word) return null;
            return (
              <div
                key={r.wordId}
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                {r.correct ? (
                  <Check size={16} className="text-success-500" />
                ) : (
                  <X size={16} className="text-danger-500" />
                )}
                <div className="flex-1">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {word.word}
                  </span>
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ background: getMasteryColor(state.wordProgress[r.wordId]?.masteryLevel as any ?? 0) }}
                >
                  {getMasteryLabel(state.wordProgress[r.wordId]?.masteryLevel as any ?? 0)}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #5c7cfa, #4263eb)' }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const progress = state.wordProgress[currentWord.id];
  const mastery = progress?.masteryLevel ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Review</h2>
        <span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {currentIndex + 1} / {reviewWords.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
          animate={{ width: `${((currentIndex) / reviewWords.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, rotateY: -10 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: 10 }}
          className="min-h-[320px] rounded-3xl border p-6 flex flex-col items-center justify-center text-center cursor-pointer"
          style={{
            background: isFlipped
              ? 'linear-gradient(135deg, rgba(92,124,250,0.06), rgba(92,124,250,0.02))'
              : 'var(--bg-card)',
            borderColor: isFlipped ? 'rgba(92,124,250,0.2)' : 'var(--border-color)',
          }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {!isFlipped ? (
            <>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold text-white mb-4"
                style={{ background: getMasteryColor(mastery as any) }}
              >
                {getMasteryLabel(mastery as any)}
              </span>
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                {currentWord.word}
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
                {currentWord.pronunciation} · {currentWord.partOfSpeech}
              </p>
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <Eye size={14} />
                Tap to reveal definition
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-3 text-brand-500">{currentWord.word}</h3>
              <p className="text-base mb-4" style={{ color: 'var(--text-primary)' }}>
                {currentWord.simpleDefinition}
              </p>
              <div className="px-4 py-2 rounded-xl mb-3" style={{ background: 'var(--bg-secondary)' }}>
                <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>
                  "{currentWord.exampleSentence}"
                </p>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                💡 {currentWord.memoryTip}
              </p>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Response buttons */}
      {isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <button
            onClick={() => handleResponse(false)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 text-sm font-semibold transition-all"
            style={{ borderColor: '#fa5252', color: '#fa5252', background: 'rgba(250,82,82,0.06)' }}
          >
            <ThumbsDown size={18} />
            Forgot
          </button>
          <button
            onClick={() => handleResponse(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #51cf66, #40c057)' }}
          >
            <ThumbsUp size={18} />
            Remembered
          </button>
        </motion.div>
      )}
    </div>
  );
}
