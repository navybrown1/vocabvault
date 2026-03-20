import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, BookOpen, Brain, Flame, Home,
  Moon, RefreshCw, Bookmark, Search, Settings, Sun, User, X, Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { getLevelFromXP, getXPForCurrentLevel, getXPForNextLevel } from '../utils/spacedRepetition';
import { getRankTitle } from '../utils/badges';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/daily', icon: BookOpen, label: 'Learn' },
  { path: '/quiz', icon: Brain, label: 'Quiz' },
  { path: '/review', icon: RefreshCw, label: 'Review' },
  { path: '/progress', icon: BarChart3, label: 'Progress' },
  { path: '/saved', icon: Bookmark, label: 'Saved' },
];

export default function Layout() {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const { user } = state;
  const xpForNext = getXPForNextLevel(user.level);
  const xpForCurrent = getXPForCurrentLevel(user.level);
  const xpProgress = xpForNext > xpForCurrent
    ? Math.min((user.xp - xpForCurrent) / (xpForNext - xpForCurrent), 1)
    : 1;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-secondary)' }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen border-r z-40"
        style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
            V
          </div>
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Vocab<span className="text-brand-500">Vault</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={{
                  background: isActive ? 'rgba(92,124,250,0.1)' : 'transparent',
                  color: isActive ? '#5c7cfa' : 'var(--text-secondary)',
                }}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                {item.label}
                {item.path === '/review' && (() => {
                  const due = Object.values(state.wordProgress).filter(p => p.isLearned && p.nextReview && new Date(p.nextReview) <= new Date()).length;
                  return due > 0 ? (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-danger-500 text-white">{due}</span>
                  ) : null;
                })()}
              </button>
            );
          })}
        </nav>

        {/* User profile card at bottom */}
        <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: 'var(--border-color)' }}>
          {/* XP bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-brand-500">Level {user.level} · {getRankTitle(user.level)}</span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{user.xp} XP</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
                style={{ width: `${xpProgress * 100}%` }}
              />
            </div>
          </div>

          {/* Profile row */}
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-brand-50 transition-colors text-left"
            style={{ '--tw-bg-opacity': 0.5 } as React.CSSProperties}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-lg shrink-0">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <Flame size={11} style={{ color: user.currentStreak > 0 ? '#fab005' : undefined }} />
                {user.currentStreak} day streak
              </div>
            </div>
          </button>

          {/* Dark mode + Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-all"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}
            >
              {state.darkMode ? <Sun size={14} /> : <Moon size={14} />}
              {state.darkMode ? 'Light' : 'Dark'}
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-xl border transition-all"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── RIGHT SIDE (header + content) ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar — mobile only */}
        <header
          className="md:hidden sticky top-0 z-50 border-b px-4 py-3 flex items-center justify-between backdrop-blur-xl"
          style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2.5" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-xs">V</div>
            <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Vocab<span className="text-brand-500">Vault</span></span>
          </div>
          <div className="flex items-center gap-1">
            <AnimatePresence>
              {searchOpen && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 160, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  type="text"
                  placeholder="Search words..."
                  value={state.searchQuery}
                  onChange={e => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                  className="rounded-lg px-3 py-1.5 text-sm outline-none border"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  autoFocus
                />
              )}
            </AnimatePresence>
            <button onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) dispatch({ type: 'SET_SEARCH_QUERY', payload: '' }); }}
              className="p-2 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
            <button onClick={() => navigate('/profile')} className="p-2 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
              <User size={18} />
            </button>
          </div>
        </header>

        {/* Desktop top bar */}
        <header
          className="hidden md:flex sticky top-0 z-30 border-b px-8 py-3 items-center justify-between backdrop-blur-xl"
          style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
        >
          {/* Page title derived from path */}
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {navItems.find(n => n.path === location.pathname)?.label ?? 'VocabVault'}
          </h1>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search words..."
                value={state.searchQuery}
                onChange={e => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                className="pl-8 pr-4 py-2 rounded-xl border text-sm outline-none w-56 transition-all focus:w-72 focus:ring-2 focus:ring-brand-400"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            </div>
            {/* Streak chip */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: user.currentStreak > 0 ? 'rgba(250,176,5,0.1)' : 'var(--bg-secondary)' }}>
              <Flame size={15} style={{ color: user.currentStreak > 0 ? '#fab005' : 'var(--text-tertiary)' }} />
              <span className="text-sm font-bold" style={{ color: user.currentStreak > 0 ? '#fab005' : 'var(--text-tertiary)' }}>
                {user.currentStreak}
              </span>
            </div>
            {/* XP chip */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
              <Zap size={14} className="text-brand-500" />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{user.xp} XP</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 py-5 md:px-8 md:py-8 pb-24 md:pb-8">
          <div className="max-w-3xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl"
          style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex justify-around py-2">
            {navItems.slice(0, 5).map(item => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5"
                  style={{ color: isActive ? '#5c7cfa' : 'var(--text-tertiary)' }}
                >
                  <item.icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
