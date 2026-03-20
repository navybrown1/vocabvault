import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, ChevronRight, Filter, FolderPlus, Heart, List, Plus, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { vocabularyData } from '../data/vocabulary';
import { getMasteryColor, getMasteryLabel } from '../utils/spacedRepetition';
import { MasteryLevel } from '../types';

type Tab = 'favorites' | 'learned' | 'lists';

export default function SavedWords() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('favorites');
  const [newListName, setNewListName] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterMastery, setFilterMastery] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState('');

  const favorites = vocabularyData.filter(w => state.wordProgress[w.id]?.isFavorite);
  const learned = vocabularyData.filter(w => state.wordProgress[w.id]?.isLearned);
  const forgotten = learned.filter(w => {
    const p = state.wordProgress[w.id];
    return p && p.timesIncorrect > p.timesCorrect;
  });

  let displayWords = tab === 'favorites' ? favorites : learned;

  // Apply filters
  if (localSearch) {
    const q = localSearch.toLowerCase();
    displayWords = displayWords.filter(w =>
      w.word.toLowerCase().includes(q) || w.simpleDefinition.toLowerCase().includes(q)
    );
  }
  if (filterDifficulty !== 'all') {
    displayWords = displayWords.filter(w => w.difficulty === filterDifficulty);
  }
  if (filterMastery !== 'all') {
    displayWords = displayWords.filter(w =>
      String(state.wordProgress[w.id]?.masteryLevel ?? 0) === filterMastery
    );
  }

  const createList = () => {
    if (newListName.trim()) {
      dispatch({ type: 'CREATE_LIST', payload: newListName.trim() });
      setNewListName('');
      setShowNewList(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>My Words</h2>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--bg-secondary)' }}>
        {([
          { id: 'favorites' as Tab, label: 'Favorites', count: favorites.length },
          { id: 'learned' as Tab, label: 'Learned', count: learned.length },
          { id: 'lists' as Tab, label: 'Lists', count: Object.keys(state.customLists).length },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: tab === t.id ? 'var(--bg-card)' : 'transparent',
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
              boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Lists Tab */}
      {tab === 'lists' ? (
        <div className="space-y-3">
          {/* Forgotten words section */}
          {forgotten.length > 0 && (
            <div
              className="rounded-2xl p-4 border cursor-pointer"
              style={{ background: 'rgba(250,82,82,0.04)', borderColor: 'rgba(250,82,82,0.15)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    🔄 Forgotten Words
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {forgotten.length} words need extra practice
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
              </div>
            </div>
          )}

          {/* Custom lists */}
          {Object.entries(state.customLists).map(([name, wordIds]) => (
            <div
              key={name}
              className="rounded-2xl p-4 border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List size={16} className="text-brand-500" />
                  <div>
                    <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</h4>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{wordIds.length} words</p>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
              </div>
            </div>
          ))}

          {/* New list form */}
          {showNewList ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="List name..."
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createList()}
                className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                autoFocus
              />
              <button onClick={createList} className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium">
                Add
              </button>
              <button onClick={() => setShowNewList(false)} className="p-2 rounded-xl" style={{ color: 'var(--text-tertiary)' }}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewList(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-medium transition-colors"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}
            >
              <FolderPlus size={16} />
              Create New List
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Search & Filter for favorites/learned */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border text-sm outline-none"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <select
              value={filterDifficulty}
              onChange={e => setFilterDifficulty(e.target.value)}
              className="px-3 py-1.5 rounded-full text-xs border outline-none"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <select
              value={filterMastery}
              onChange={e => setFilterMastery(e.target.value)}
              className="px-3 py-1.5 rounded-full text-xs border outline-none"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <option value="all">All Mastery</option>
              <option value="0">New</option>
              <option value="1">Learning</option>
              <option value="2">Familiar</option>
              <option value="3">Comfortable</option>
              <option value="4">Strong</option>
              <option value="5">Mastered</option>
            </select>
          </div>

          {/* Word list */}
          <div className="space-y-2">
            {displayWords.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">{tab === 'favorites' ? '💝' : '📚'}</div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {tab === 'favorites' ? 'No favorites yet' : 'No words learned yet'}
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  {tab === 'favorites' ? 'Heart words you love to save them here' : 'Start learning to build your collection'}
                </p>
              </div>
            ) : (
              displayWords.map((word, i) => {
                const progress = state.wordProgress[word.id];
                const mastery = (progress?.masteryLevel ?? 0) as MasteryLevel;
                return (
                  <motion.button
                    key={word.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/word/${word.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                  >
                    <div
                      className="w-2 h-8 rounded-full shrink-0"
                      style={{ background: getMasteryColor(mastery) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {word.word}
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                        {word.simpleDefinition}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                        {getMasteryLabel(mastery)}
                      </span>
                      {progress?.isFavorite && <Heart size={12} fill="#fa5252" className="text-danger-500" />}
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
