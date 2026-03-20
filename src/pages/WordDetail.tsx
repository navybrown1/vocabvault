import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Check, Heart, List, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { vocabularyData } from '../data/vocabulary';
import { getMasteryColor, getMasteryLabel } from '../utils/spacedRepetition';

export default function WordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, getProgress } = useApp();

  const word = vocabularyData.find(w => w.id === id);
  if (!word) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--text-tertiary)' }}>Word not found</p>
        <button onClick={() => navigate(-1)} className="text-brand-500 mt-2 text-sm font-medium">Go back</button>
      </div>
    );
  }

  const progress = getProgress(word.id);
  const mastery = progress?.masteryLevel ?? 0;

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
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
    <div className="space-y-5 pb-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm font-medium"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Word Header */}
      <div className="rounded-2xl p-5 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
              {word.word}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{word.pronunciation}</span>
              <button onClick={speakWord} className="p-1 rounded-lg hover:bg-brand-50 transition-colors">
                <Volume2 size={14} className="text-brand-500" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: difficultyColors[word.difficulty] }}
            >
              {word.difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            {word.partOfSpeech}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            {word.category}
          </span>
          {progress && (
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: getMasteryColor(mastery as any) }}
            >
              {getMasteryLabel(mastery as any)}
            </span>
          )}
        </div>

        {/* Mastery Progress Bar */}
        {progress && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--text-tertiary)' }}>Mastery</span>
              <span style={{ color: getMasteryColor(mastery as any) }}>{mastery}/5</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: getMasteryColor(mastery as any) }}
                initial={{ width: 0 }}
                animate={{ width: `${(mastery / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Definitions */}
      <div className="space-y-3">
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Simple Definition
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{word.simpleDefinition}</p>
        </div>

        <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Advanced Definition
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{word.advancedDefinition}</p>
        </div>
      </div>

      {/* Example Sentence */}
      <div className="rounded-2xl p-4 border" style={{ background: 'rgba(92,124,250,0.04)', borderColor: 'rgba(92,124,250,0.15)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 text-brand-500">Example</h3>
        <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>"{word.exampleSentence}"</p>
      </div>

      {/* Synonyms & Antonyms */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Synonyms
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {word.synonyms.map(s => (
              <span key={s} className="px-2 py-0.5 rounded-full text-xs border" style={{ background: 'rgba(81,207,102,0.08)', borderColor: 'rgba(81,207,102,0.2)', color: '#40c057' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Antonyms
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {word.antonyms.map(a => (
              <span key={a} className="px-2 py-0.5 rounded-full text-xs border" style={{ background: 'rgba(250,82,82,0.08)', borderColor: 'rgba(250,82,82,0.2)', color: '#fa5252' }}>
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Memory Tip */}
      <div className="rounded-2xl p-4 border" style={{ background: 'rgba(252,196,25,0.06)', borderColor: 'rgba(252,196,25,0.2)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#fab005' }}>
          💡 Memory Tip
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{word.memoryTip}</p>
      </div>

      {/* Etymology */}
      <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
          Etymology
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{word.etymology}</p>
      </div>

      {/* Commonly Confused With */}
      {word.confusedWith && word.confusedWith.length > 0 && (
        <div className="rounded-2xl p-4 border" style={{ background: 'rgba(255,146,43,0.06)', borderColor: 'rgba(255,146,43,0.2)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#ff922b' }}>
            ⚠️ Commonly Confused With
          </h3>
          {word.confusedWith.map(c => (
            <div key={c.word} className="mt-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.word}: </span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.explanation}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {progress && (
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Your Stats
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-success-500">{progress.timesCorrect}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Correct</div>
            </div>
            <div>
              <div className="text-lg font-bold text-danger-500">{progress.timesIncorrect}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Incorrect</div>
            </div>
            <div>
              <div className="text-lg font-bold text-brand-500">{progress.streak}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Streak</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', payload: word.id })}
          className="flex items-center justify-center gap-1.5 flex-1 py-3 rounded-2xl border text-sm font-semibold transition-all"
          style={{ borderColor: 'var(--border-color)', color: progress?.isFavorite ? '#fa5252' : 'var(--text-secondary)', background: 'var(--bg-card)' }}
        >
          <Heart size={16} fill={progress?.isFavorite ? '#fa5252' : 'none'} />
          {progress?.isFavorite ? 'Favorited' : 'Favorite'}
        </button>
        <button
          onClick={() => dispatch({ type: 'MARK_WORD_LEARNED', payload: word.id })}
          className="flex items-center justify-center gap-1.5 flex-1 py-3 rounded-2xl text-sm font-semibold text-white transition-all"
          style={{ background: progress?.isLearned ? '#51cf66' : 'linear-gradient(135deg, #5c7cfa, #4263eb)' }}
        >
          <Check size={16} />
          {progress?.isLearned ? 'Learned' : 'Mark Learned'}
        </button>
      </div>
    </div>
  );
}
