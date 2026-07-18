import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
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
  // Navigation Tabs State: 'dashboard' | 'curriculum' | 'quizzes'
  const [activeTab, setActiveTab] = useState<string>('curriculum');
  
  // Floating AI Tutor Drawer State
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  
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
      window.history.replaceState({ tab: 'curriculum' }, '');
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
    <div className="bg-natural-bg min-h-screen text-natural-text flex flex-col font-sans select-none transition-all relative">
      {/* Arabic Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'tutor') {
            setIsTutorOpen(true);
            return;
          }
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
              if (tab === 'tutor') {
                setIsTutorOpen(true);
                return;
              }
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

        {activeTab === 'worksheets' && (
          <WorksheetGenerator
            favoriteLessons={favoriteLessons}
            completedLessons={completedLessons}
            onToggleFavorite={handleToggleFavorite}
            onNavigateToTab={(tab) => {
              if (tab === 'tutor') {
                setIsTutorOpen(true);
                return;
              }
              window.history.pushState({ tab }, '');
              setActiveTab(tab);
            }}
          />
        )}
      </main>

      {/* Floating Action Button (FAB) for AI Tutor / Dictionary - Highly visible on the LEFT */}
      <div className="fixed bottom-8 left-6 z-45 flex items-center group pointer-events-auto select-none" dir="rtl">
        <button
          id="btn-floating-tutor"
          onClick={() => setIsTutorOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-full flex items-center p-1.5 pl-4 pr-1.5 shadow-xl shadow-amber-600/40 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/30 cursor-pointer group"
          title="افتح الباحث والمعلم الذكي (ض)"
        >
          <div className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center text-xl font-serif font-extrabold relative">
            ض
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-xs font-serif font-bold mr-3 text-white">الباحث والمعلم الذكي</span>
        </button>
      </div>

      {/* Slide-over Panel for AI Tutor */}
      <AnimatePresence>
        {isTutorOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
            {/* Dark Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTutorOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            />

            {/* Sliding Panel Container */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 sm:pl-16">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="w-screen max-w-2xl bg-natural-bg shadow-2xl flex flex-col h-full border-l border-natural-border/60 relative"
              >
                {/* Header of Drawer */}
                <div className="bg-white border-b border-natural-border px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-11 h-11 bg-amber-600 rounded-xl flex items-center justify-center text-white text-xl font-serif font-extrabold shadow-md shadow-amber-600/20">
                      ض
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-natural-dark">المعلم والمساعد المدرسي الفوري</h3>
                      <p className="text-[10px] text-natural-muted font-medium mt-0.5">شرح القواعد، المعاجم، والإعراب المباشر</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsTutorOpen(false)}
                    className="p-2 bg-natural-light hover:bg-natural-border/40 text-natural-dark rounded-xl transition-all font-bold text-xs flex items-center space-x-1.5 space-x-reverse border border-natural-border/50"
                  >
                    <X className="h-4 w-4" />
                    <span>إغلاق المعلم</span>
                  </button>
                </div>

                {/* Main Content inside Drawer */}
                <div className="flex-1 overflow-y-auto min-h-0 bg-natural-bg pb-12">
                  <AITutor />
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

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
