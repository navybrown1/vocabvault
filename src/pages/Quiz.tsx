import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Brain, CheckCircle2, HelpCircle, Lightbulb, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { vocabularyData } from '../data/vocabulary';
import { generateQuizSet } from '../utils/quizGenerator';
import { QuizQuestion } from '../types';

export default function Quiz() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  // Get learned words for quiz (or all if fewer than 5 learned)
  const learnedWordIds = Object.entries(state.wordProgress)
    .filter(([_, p]) => p.isLearned)
    .map(([id]) => id);

  const quizWords = learnedWordIds.length >= 4
    ? vocabularyData.filter(w => learnedWordIds.includes(w.id))
    : vocabularyData.slice(0, 8);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [quizComplete, setQuizComplete] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) {
      const q = generateQuizSet(quizWords.slice(0, 10), 1);
      setQuestions(q);
    }
  }, [started]);

  const currentQ = questions[currentIndex];

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    const isCorrect = answer === currentQ.correctAnswer;
    setScore(s => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }));
    dispatch({ type: 'RECORD_QUIZ_ANSWER', payload: { wordId: currentQ.wordId, correct: isCorrect } });
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setQuizComplete(true);
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    }
  };

  const restartQuiz = () => {
    setQuestions(generateQuizSet(quizWords.slice(0, 10), 1));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
    setScore({ correct: 0, total: 0 });
    setQuizComplete(false);
  };

  // Pre-quiz screen
  if (!started) {
    return (
      <div className="space-y-6">
        <div className="text-center pt-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Brain size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Quiz Mode</h2>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Test your knowledge with {Math.min(quizWords.length, 10)} questions
          </p>
        </div>

        <div className="space-y-3">
          {[
            { icon: '🎯', label: 'Multiple Choice', desc: 'Pick the correct definition' },
            { icon: '📝', label: 'Fill in the Blank', desc: 'Identify the word from context' },
            { icon: '🔗', label: 'Synonym Match', desc: 'Find the matching synonym' },
            { icon: '📖', label: 'Context Usage', desc: 'Spot the correct usage' },
          ].map(q => (
            <div
              key={q.label}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <span className="text-xl">{q.icon}</span>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{q.label}</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{q.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStarted(true)}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base shadow-lg"
          style={{ background: 'linear-gradient(135deg, #5c7cfa, #4263eb)' }}
        >
          Start Quiz
        </motion.button>
      </div>
    );
  }

  // Quiz complete screen
  if (quizComplete) {
    const percentage = Math.round((score.correct / score.total) * 100);
    const emoji = percentage >= 90 ? '🏆' : percentage >= 70 ? '🎉' : percentage >= 50 ? '💪' : '📚';

    return (
      <div className="space-y-6 text-center pt-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="text-6xl"
        >
          {emoji}
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {percentage >= 90 ? 'Outstanding!' : percentage >= 70 ? 'Great Job!' : percentage >= 50 ? 'Good Effort!' : 'Keep Practicing!'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            You scored {score.correct}/{score.total} ({percentage}%)
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="text-2xl font-bold text-success-500">{score.correct}</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Correct</div>
          </div>
          <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="text-2xl font-bold text-danger-500">{score.total - score.correct}</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Incorrect</div>
          </div>
          <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="text-2xl font-bold text-brand-500">{percentage}%</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Score</div>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={restartQuiz}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
          >
            <RotateCcw size={16} />
            Retry
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #5c7cfa, #4263eb)' }}
          >
            Done
          </motion.button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const isCorrect = selectedAnswer === currentQ.correctAnswer;
  const word = vocabularyData.find(w => w.id === currentQ.wordId);

  const typeLabels: Record<string, string> = {
    'multiple-choice': 'Multiple Choice',
    'fill-blank': 'Fill in the Blank',
    'matching': 'Synonym Match',
    'context': 'Context Usage',
  };

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      {/* Question type badge */}
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 rounded-full text-xs font-medium border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>
          {typeLabels[currentQ.type]}
        </span>
        <div className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
          Score: <span className="text-brand-500">{score.correct}/{score.total}</span>
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
        >
          <h3 className="text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
            {currentQ.question}
          </h3>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options?.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              const isCorrectOpt = opt === currentQ.correctAnswer;
              let bg = 'var(--bg-card)';
              let border = 'var(--border-color)';
              let textColor = 'var(--text-primary)';

              if (showResult) {
                if (isCorrectOpt) {
                  bg = 'rgba(81,207,102,0.1)';
                  border = '#51cf66';
                  textColor = '#40c057';
                } else if (isSelected && !isCorrectOpt) {
                  bg = 'rgba(250,82,82,0.1)';
                  border = '#fa5252';
                  textColor = '#fa5252';
                }
              } else if (isSelected) {
                bg = 'rgba(92,124,250,0.08)';
                border = '#5c7cfa';
              }

              return (
                <motion.button
                  key={i}
                  whileTap={!showResult ? { scale: 0.98 } : undefined}
                  onClick={() => handleAnswer(opt)}
                  disabled={showResult}
                  className="w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3"
                  style={{ background: bg, borderColor: border }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: showResult && isCorrectOpt ? '#51cf66' : showResult && isSelected ? '#fa5252' : 'var(--bg-tertiary)', color: showResult && (isCorrectOpt || isSelected) ? 'white' : 'var(--text-tertiary)' }}
                  >
                    {showResult && isCorrectOpt ? <CheckCircle2 size={16} /> :
                     showResult && isSelected ? <XCircle size={16} /> :
                     String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-sm font-medium" style={{ color: textColor }}>
                    {opt}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Hint button */}
      {!showResult && currentQ.hint && (
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <Lightbulb size={14} />
          {showHint ? currentQ.hint : 'Show hint'}
        </button>
      )}

      {/* Result feedback */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 border"
            style={{
              background: isCorrect ? 'rgba(81,207,102,0.06)' : 'rgba(250,82,82,0.06)',
              borderColor: isCorrect ? 'rgba(81,207,102,0.2)' : 'rgba(250,82,82,0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              {isCorrect ? (
                <CheckCircle2 size={18} className="text-success-500" />
              ) : (
                <XCircle size={18} className="text-danger-500" />
              )}
              <span className="text-sm font-semibold" style={{ color: isCorrect ? '#40c057' : '#fa5252' }}>
                {isCorrect ? 'Correct!' : 'Not quite!'}
              </span>
            </div>
            {!isCorrect && word && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {word.word}: {word.simpleDefinition}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next button */}
      {showResult && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.98 }}
          onClick={nextQuestion}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #5c7cfa, #4263eb)' }}
        >
          {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
          <ArrowRight size={16} />
        </motion.button>
      )}
    </div>
  );
}
