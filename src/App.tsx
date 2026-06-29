import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CurriculumBrowser from './components/CurriculumBrowser';
import QuizSection from './components/QuizSection';
import AITutor from './components/AITutor';
import WorksheetGenerator from './components/WorksheetGenerator';
import { curriculumData } from './data/curriculum';

interface ScoreRecord {
  lessonId: string;
  lessonTitle: string;
  score: number;
  total: number;
  date: string;
}

export default function App() {
  // Navigation Tabs State: 'dashboard' | 'curriculum' | 'quizzes' | 'tutor'
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Quiz Routing Bridge State (so user can click "انتقل للاختبار" on a lesson to jump there)
  const [activeLessonIdForQuiz, setActiveLessonIdForQuiz] = useState<string | undefined>(undefined);

  // Core Learning Progress States
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [favoriteLessons, setFavoriteLessons] = useState<string[]>([]);
  const [quizScores, setQuizScores] = useState<{ [lessonId: string]: { score: number; total: number } }>({});
  const [recentScores, setRecentScores] = useState<ScoreRecord[]>([]);
  const [streak, setStreak] = useState<number>(3); // Initialize with 3 for motivational baseline
  const [points, setPoints] = useState<number>(150); // Initialize with 150 points baseline

  // Navigation intercept & confirmation logic for mobile back buttons
  useEffect(() => {
    // Replace initial state with current tab if none
    if (!window.history.state) {
      window.history.replaceState({ tab: 'dashboard' }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      } else {
        const confirmExit = window.confirm('هل أنت متأكد من رغبتك في مغادرة البرنامج؟');
        if (confirmExit) {
          window.history.back();
        } else {
          window.history.pushState({ tab: activeTab }, '');
        }
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const message = 'هل أنت متأكد من رغبتك في المغادرة؟';
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeTab]);

  // Load progress from localStorage on startup
  useEffect(() => {
    try {
      const storedCompleted = localStorage.getItem('ar_completed_lessons');
      if (storedCompleted) {
        setCompletedLessons(JSON.parse(storedCompleted));
      }

      const storedFavorites = localStorage.getItem('ar_favorite_lessons');
      if (storedFavorites) {
        setFavoriteLessons(JSON.parse(storedFavorites));
      }

      const storedQuizScores = localStorage.getItem('ar_quiz_scores');
      if (storedQuizScores) {
        setQuizScores(JSON.parse(storedQuizScores));
      }

      const storedRecentScores = localStorage.getItem('ar_recent_scores');
      if (storedRecentScores) {
        setRecentScores(JSON.parse(storedRecentScores));
      }

      const storedStreak = localStorage.getItem('ar_streak');
      if (storedStreak) {
        setStreak(parseInt(storedStreak, 10));
      } else {
        localStorage.setItem('ar_streak', '3');
      }

      const storedPoints = localStorage.getItem('ar_points');
      if (storedPoints) {
        setPoints(parseInt(storedPoints, 10));
      } else {
        localStorage.setItem('ar_points', '150');
      }
    } catch (e) {
      console.error("Failed to restore student progress from localStorage:", e);
    }
  }, []);

  const handleAwardPoints = (amount: number) => {
    setPoints(prev => {
      const updated = prev + amount;
      localStorage.setItem('ar_points', updated.toString());
      return updated;
    });
  };

  // Sync state functions
  const handleMarkLessonCompleted = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      const updated = [...completedLessons, lessonId];
      setCompletedLessons(updated);
      localStorage.setItem('ar_completed_lessons', JSON.stringify(updated));
      
      // Update streak
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('ar_streak', newStreak.toString());

      // Award 20 points for reading a lesson
      handleAwardPoints(20);
    }
  };

  const handleToggleFavorite = (lessonId: string) => {
    let updated;
    if (favoriteLessons.includes(lessonId)) {
      updated = favoriteLessons.filter(id => id !== lessonId);
    } else {
      updated = [...favoriteLessons, lessonId];
    }
    setFavoriteLessons(updated);
    localStorage.setItem('ar_favorite_lessons', JSON.stringify(updated));
  };

  const handleSaveQuizScore = (lessonId: string, score: number, total: number) => {
    // 1. Update scores dictionary
    const updatedScores = {
      ...quizScores,
      [lessonId]: { score, total }
    };
    setQuizScores(updatedScores);
    localStorage.setItem('ar_quiz_scores', JSON.stringify(updatedScores));

    // 2. Fetch lesson name dynamically
    let title = 'اختبار لغوي';
    for (const unit of curriculumData) {
      const found = unit.lessons.find(l => l.id === lessonId);
      if (found) {
        title = found.title.replace(/^الدرس\s+\S+:\s+/, ''); // clean "الدرس الأول: " etc.
        break;
      }
    }

    // 3. Prepend to recent history record
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const newRecord: ScoreRecord = {
      lessonId,
      lessonTitle: title,
      score,
      total,
      date: formattedDate
    };

    const updatedRecent = [newRecord, ...recentScores.slice(0, 19)]; // Keep max 20 history records
    setRecentScores(updatedRecent);
    localStorage.setItem('ar_recent_scores', JSON.stringify(updatedRecent));

    // Increment streak on test success
    if (score / total >= 0.7) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('ar_streak', newStreak.toString());
    }

    // Award points based on performance: e.g. 15 points per correct answer
    if (score > 0) {
      handleAwardPoints(score * 15);
    }
  };

  // Bridge navigation from reading cards straight into active lesson tests
  const handleNavigateToQuiz = (lessonId: string) => {
    setActiveLessonIdForQuiz(lessonId);
    window.history.pushState({ tab: 'quizzes' }, '');
    setActiveTab('quizzes');
  };

  // General calculator for header percentage
  const totalLessonsCount = curriculumData.reduce((acc, unit) => acc + unit.lessons.length, 0);
  const totalProgressPercent = Math.min(
    Math.round(((completedLessons.length + Object.keys(quizScores).length) / (totalLessonsCount * 2)) * 100),
    100
  );

  return (
    <div className="bg-natural-bg min-h-screen text-natural-text flex flex-col font-sans select-none transition-all">
      {/* Arabic Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          window.history.pushState({ tab }, '');
          setActiveTab(tab);
          // Stop overriding active test once tab changes generally
          if (tab !== 'quizzes') {
            setActiveLessonIdForQuiz(undefined);
          }
        }}
        streak={streak}
        points={points}
        totalProgress={totalProgressPercent}
      />

      {/* Main Tab Renderers */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <Dashboard
            completedLessons={completedLessons}
            quizScores={quizScores}
            recentScores={recentScores}
            points={points}
            onAwardPoints={handleAwardPoints}
            onNavigateToTab={(tab) => {
              window.history.pushState({ tab }, '');
              setActiveTab(tab);
              if (tab !== 'quizzes') setActiveLessonIdForQuiz(undefined);
            }}
          />
        )}

        {activeTab === 'curriculum' && (
          <CurriculumBrowser
            completedLessons={completedLessons}
            favoriteLessons={favoriteLessons}
            onMarkLessonCompleted={handleMarkLessonCompleted}
            onNavigateToQuiz={handleNavigateToQuiz}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === 'quizzes' && (
          <QuizSection
            initialActiveLessonId={activeLessonIdForQuiz}
            onSaveQuizScore={handleSaveQuizScore}
          />
        )}

        {activeTab === 'tutor' && (
          <AITutor />
        )}

        {activeTab === 'worksheets' && (
          <WorksheetGenerator
            favoriteLessons={favoriteLessons}
            completedLessons={completedLessons}
            onToggleFavorite={handleToggleFavorite}
            onNavigateToTab={(tab) => {
              window.history.pushState({ tab }, '');
              setActiveTab(tab);
            }}
          />
        )}
      </main>

      {/* Beautiful humble arabic footer */}
      <footer className="bg-white border-t border-natural-border py-5 text-center text-xs text-natural-muted shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <p className="font-medium">صُمم هذا الموقع التفاعلي لخدمة ودراسة منهج اللغة العربية للصف السادس الابتدائي بجمهورية السودان 🇸🇩</p>
          <p className="font-mono text-[10px] text-natural-muted/70">المعلم الذكي للغة العربية © 2026</p>
        </div>
      </footer>
    </div>
  );
}
