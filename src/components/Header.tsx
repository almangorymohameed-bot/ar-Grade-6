import React from 'react';
import { BookOpen, Award, Brain, Flame, CheckCircle2, FileText, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  streak: number;
  points: number;
  totalProgress: number;
}

export default function Header({ activeTab, setActiveTab, streak, points, totalProgress }: HeaderProps) {
  return (
    <header className="bg-white border-b border-natural-border text-natural-dark sticky top-0 z-50 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-12 h-12 bg-natural-accent rounded-xl flex items-center justify-center text-white text-2xl font-serif font-bold shadow-md shadow-natural-accent/10">
              ض
            </div>
            <div>
              <h1 className="text-lg font-bold font-serif text-natural-dark">منصة لغتي الخالدة</h1>
              <p className="text-xs text-natural-muted font-medium">الصف السادس الابتدائي - المنهج السوداني</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-2 space-x-reverse">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'curriculum'
                  ? 'bg-natural-accent text-white shadow-sm'
                  : 'text-natural-text hover:bg-natural-light hover:text-natural-dark'
              }`}
            >
              <BookOpen className="h-4 w-4 ml-1.5" />
              منهج القراءة
            </button>

            <button
              onClick={() => setActiveTab('quizzes')}
              className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'quizzes'
                  ? 'bg-natural-accent text-white shadow-sm'
                  : 'text-natural-text hover:bg-natural-light hover:text-natural-dark'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 ml-1.5" />
              ساحة الاختبارات
            </button>

            <button
              onClick={() => setActiveTab('worksheets')}
              className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'worksheets'
                  ? 'bg-natural-accent text-white shadow-sm'
                  : 'text-natural-text hover:bg-natural-light hover:text-natural-dark'
              }`}
            >
              <FileText className="h-4 w-4 ml-1.5" />
              أوراق العمل
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-natural-accent text-white shadow-sm'
                  : 'text-natural-text hover:bg-natural-light hover:text-natural-dark'
              }`}
            >
              <Award className="h-4 w-4 ml-1.5" />
              لوحة الإنجازات
            </button>
          </nav>

          {/* User Stats / Streak & Points */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="flex items-center bg-orange-50 border border-orange-100 px-3 py-2 rounded-xl" title="الحماس اليومي">
              <Flame className="h-4 w-4 text-orange-600 fill-orange-400 animate-pulse" />
              <span className="mr-1.5 font-bold font-mono text-orange-700 text-xs">{streak}</span>
              <span className="text-[10px] text-orange-800 mr-1 hidden sm:inline font-bold">يوم متتالي</span>
            </div>

            <div className="flex items-center bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl" title="النقاط المحصّلة">
              <Sparkles className="h-4 w-4 text-amber-500 fill-amber-300" />
              <span className="mr-1.5 font-bold font-mono text-amber-700 text-xs">{points}</span>
              <span className="text-[10px] text-amber-800 mr-1 hidden sm:inline font-bold">نقطة</span>
            </div>

            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] text-natural-muted font-bold">إجمالي التقدم الدراسي</span>
              <div className="flex items-center mt-0.5">
                <span className="text-xs font-extrabold font-mono text-natural-accent mr-2">{totalProgress}%</span>
                <div className="w-20 bg-natural-border rounded-full h-1.5">
                  <div 
                    className="bg-natural-accent h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-natural-border bg-white px-2 py-2.5 flex justify-around shadow-inner">
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`flex flex-col items-center p-2 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'curriculum' ? 'text-natural-accent' : 'text-natural-muted hover:text-natural-dark'
          }`}
        >
          <BookOpen className="h-5 w-5 mb-1" />
          المنهج
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex flex-col items-center p-2 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'quizzes' ? 'text-natural-accent' : 'text-natural-muted hover:text-natural-dark'
          }`}
        >
          <CheckCircle2 className="h-5 w-5 mb-1" />
          الاختبارات
        </button>
        <button
          onClick={() => setActiveTab('worksheets')}
          className={`flex flex-col items-center p-2 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'worksheets' ? 'text-natural-accent' : 'text-natural-muted hover:text-natural-dark'
          }`}
        >
          <FileText className="h-5 w-5 mb-1" />
          أوراق العمل
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center p-2 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'dashboard' ? 'text-natural-accent' : 'text-natural-muted hover:text-natural-dark'
          }`}
        >
          <Award className="h-5 w-5 mb-1" />
          الإنجازات
        </button>
      </div>
    </header>
  );
}
