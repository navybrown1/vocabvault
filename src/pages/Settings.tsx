import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Globe, Moon, Palette, RotateCcw, Sun, Target, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const dailyGoals = [3, 5, 10, 15, 20];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h2>

      {/* Appearance */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            Appearance
          </span>
        </div>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
          className="w-full flex items-center justify-between px-4 py-3.5"
        >
          <div className="flex items-center gap-3">
            {state.darkMode ? <Moon size={18} style={{ color: 'var(--text-secondary)' }} /> : <Sun size={18} style={{ color: 'var(--text-secondary)' }} />}
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {state.darkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <div
            className="w-12 h-7 rounded-full relative transition-colors cursor-pointer"
            style={{ background: state.darkMode ? '#5c7cfa' : 'var(--bg-tertiary)' }}
          >
            <div
              className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: state.darkMode ? 'translateX(22px)' : 'translateX(4px)' }}
            />
          </div>
        </button>
      </div>

      {/* Learning */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            Learning
          </span>
        </div>
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3 mb-3">
            <Target size={18} style={{ color: 'var(--text-secondary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Daily Word Goal</span>
          </div>
          <div className="flex gap-2">
            {dailyGoals.map(g => (
              <button
                key={g}
                onClick={() => dispatch({ type: 'UPDATE_DAILY_GOAL', payload: g })}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all"
                style={{
                  background: state.user.dailyWordGoal === g ? 'rgba(92,124,250,0.08)' : 'transparent',
                  borderColor: state.user.dailyWordGoal === g ? '#5c7cfa' : 'var(--border-color)',
                  color: state.user.dailyWordGoal === g ? '#5c7cfa' : 'var(--text-secondary)',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="px-4 py-3.5 flex items-center gap-3">
            <Globe size={18} style={{ color: 'var(--text-secondary)' }} />
            <div className="flex-1">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Learning Goal</span>
              <p className="text-xs capitalize" style={{ color: 'var(--text-tertiary)' }}>{state.user.goal}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications (placeholder) */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            Notifications
          </span>
        </div>
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Daily Reminder</span>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Get reminded to study</p>
            </div>
          </div>
          <div
            className="w-12 h-7 rounded-full relative cursor-pointer"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow" />
          </div>
        </div>
        <div className="border-t px-4 py-3.5 flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <Volume2 size={18} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Sound Effects</span>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Quiz feedback sounds</p>
            </div>
          </div>
          <div
            className="w-12 h-7 rounded-full relative cursor-pointer"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow" />
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            Data
          </span>
        </div>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
          >
            <RotateCcw size={18} className="text-danger-500" />
            <span className="text-sm font-medium text-danger-500">Reset All Progress</span>
          </button>
        ) : (
          <div className="px-4 py-3.5 space-y-2">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Are you sure? This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => { dispatch({ type: 'RESET_PROGRESS' }); setShowResetConfirm(false); }}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-danger-500"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs py-4" style={{ color: 'var(--text-tertiary)' }}>
        VocabVault v1.0.0 · Built with ❤️
      </p>
    </div>
  );
}
