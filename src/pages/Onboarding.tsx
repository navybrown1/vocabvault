import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Briefcase, GraduationCap, MessageCircle, Sparkles, Target, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GoalType } from '../types';

const goals: { id: GoalType; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'everyday', label: 'Everyday Communication', desc: 'Improve daily vocabulary', icon: <MessageCircle size={24} /> },
  { id: 'professional', label: 'Professional Growth', desc: 'Business & career words', icon: <Briefcase size={24} /> },
  { id: 'academic', label: 'Academic Excellence', desc: 'Scholarly vocabulary', icon: <GraduationCap size={24} /> },
  { id: 'test-prep', label: 'Test Preparation', desc: 'SAT, GRE, GMAT words', icon: <BookOpen size={24} /> },
];

const dailyGoals = [3, 5, 10, 15];

export default function Onboarding() {
  const { dispatch, state } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<GoalType>('everyday');
  const [dailyGoal, setDailyGoal] = useState(5);

  const handleComplete = () => {
    dispatch({
      type: 'COMPLETE_ONBOARDING',
      payload: { name: name.trim() || 'Learner', goal, dailyGoal },
    });
  };

  const slides = [
    // Welcome
    <div className="flex flex-col items-center text-center gap-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xl"
      >
        <span className="text-4xl text-white font-bold">V</span>
      </motion.div>
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
          Welcome to VocabVault
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Master new words every day through smart repetition, quizzes, and contextual learning.
        </p>
      </div>
      <div className="flex gap-6 mt-4">
        {[
          { icon: <Zap size={20} />, label: 'Smart Learning' },
          { icon: <Target size={20} />, label: 'Active Recall' },
          { icon: <Sparkles size={20} />, label: 'Gamified' },
        ].map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center" style={{ background: state.darkMode ? 'rgba(92,124,250,0.1)' : undefined }}>
              {f.icon}
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{f.label}</span>
          </motion.div>
        ))}
      </div>
    </div>,

    // Name
    <div className="flex flex-col items-center text-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-3xl shadow-lg">
        👋
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>What's your name?</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Let's personalize your experience</p>
      </div>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full max-w-xs px-4 py-3 rounded-xl border text-center text-lg font-medium outline-none focus:ring-2 focus:ring-brand-500 transition-all"
        style={{
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          borderColor: 'var(--border-color)',
        }}
      />
    </div>,

    // Goal
    <div className="flex flex-col items-center text-center gap-5">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>What's your goal?</h2>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>We'll tailor words to match</p>
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {goals.map(g => (
          <motion.button
            key={g.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setGoal(g.id)}
            className="p-4 rounded-2xl border-2 text-left transition-all"
            style={{
              background: goal === g.id ? 'rgba(92,124,250,0.08)' : 'var(--bg-card)',
              borderColor: goal === g.id ? '#5c7cfa' : 'var(--border-color)',
            }}
          >
            <div className="mb-2" style={{ color: goal === g.id ? '#5c7cfa' : 'var(--text-tertiary)' }}>
              {g.icon}
            </div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{g.label}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{g.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>,

    // Daily goal
    <div className="flex flex-col items-center text-center gap-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Daily word goal?</h2>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>How many new words per day?</p>
      <div className="flex gap-3">
        {dailyGoals.map(g => (
          <motion.button
            key={g}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDailyGoal(g)}
            className="w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all"
            style={{
              background: dailyGoal === g ? 'rgba(92,124,250,0.08)' : 'var(--bg-card)',
              borderColor: dailyGoal === g ? '#5c7cfa' : 'var(--border-color)',
            }}
          >
            <span className="text-xl font-bold" style={{ color: dailyGoal === g ? '#5c7cfa' : 'var(--text-primary)' }}>
              {g}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>words</span>
          </motion.button>
        ))}
      </div>
      <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
        {dailyGoal <= 3 ? 'Casual pace — great for busy schedules' :
         dailyGoal <= 5 ? 'Balanced — builds vocabulary steadily' :
         dailyGoal <= 10 ? 'Ambitious — serious learner mode' :
         'Power learner — maximum growth!'}
      </div>
    </div>,
  ];

  const isLastStep = step === slides.length - 1;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-8 pb-4">
        {slides.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === step ? 24 : 8,
              background: i <= step ? '#5c7cfa' : 'var(--border-color)',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md"
          >
            {slides[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-6 flex justify-between items-center max-w-md mx-auto w-full">
        {step > 0 ? (
          <button
            onClick={() => setStep(s => s - 1)}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Back
          </button>
        ) : <div />}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={isLastStep ? handleComplete : () => setStep(s => s + 1)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold text-sm shadow-lg"
          style={{ background: 'linear-gradient(135deg, #5c7cfa, #4263eb)' }}
        >
          {isLastStep ? "Let's Begin" : 'Continue'}
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
