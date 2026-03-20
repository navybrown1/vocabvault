import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import DailyWords from './pages/DailyWords';
import WordDetail from './pages/WordDetail';
import Quiz from './pages/Quiz';
import Review from './pages/Review';
import Progress from './pages/Progress';
import SavedWords from './pages/SavedWords';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

export default function App() {
  const { state } = useApp();

  if (!state.user.onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/daily" element={<DailyWords />} />
        <Route path="/word/:id" element={<WordDetail />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/review" element={<Review />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/saved" element={<SavedWords />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
