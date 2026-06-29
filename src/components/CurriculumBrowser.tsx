import React, { useState } from 'react';
import { curriculumData, Lesson, Unit } from '../data/curriculum';
import { 
  BookOpen, BookOpenCheck, Volume2, Eye, ArrowRight, BookMarked, 
  Check, Play, Pause, Sparkles, Star, ChevronRight, ChevronLeft, Book,
  Maximize2, Minimize2, Sun, Moon, Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Helper to get matching Unsplash images based on lesson text or title keywords
const getLessonImage = (lessonId: string): string => {
  const images: { [id: string]: string } = {
    'u1-l1': 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=600&auto=format&fit=crop', // حاتم الطائي
    'u1-l2': 'https://images.unsplash.com/photo-1488188840666-e2308741a62f?q=80&w=600&auto=format&fit=crop', // ترشيد المياه
    'u1-l3': 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop', // المأمون
    'u1-l4': 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=600&auto=format&fit=crop', // وصايا الحكيم
    'u2-l1': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop', // مفتاح النجاح
    'u2-l2': 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=600&auto=format&fit=crop', // أهمية الوقت
    'u2-l3': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop', // الحرية
    'u2-l4': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop', // وفاء الكلب
    'u2-l7': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop', // حكم وفضائل
    'u3-l1': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop', // أخبار الحمقى والمغفلين
    'u3-l2': 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?q=80&w=600&auto=format&fit=crop', // حدائق البحر المرجانية
    'u4-l1': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop', // نشيد وطني / توأمي
  };
  return images[lessonId] || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop';
};

const parsePoemLines = (text: string) => {
  return text.split('\n').map(line => {
    const parts = line.split('**');
    if (parts.length === 2) {
      return { sadr: parts[0].trim(), ajuz: parts[1].trim() };
    }
    return { sadr: line.trim(), ajuz: '' };
  });
};

const getFlipbookPages = (lesson: Lesson) => {
  const pages: { title: string; type: 'cover' | 'content' | 'grammar'; elements: any }[] = [];

  // Page 1: Cover Page
  pages.push({
    title: 'الغلاف الرئيسي',
    type: 'cover',
    elements: {
      title: lesson.title,
      author: lesson.author,
      page: lesson.page,
      image: getLessonImage(lesson.id)
    }
  });

  // Pages 2 to N: Content pages
  if (lesson.type === 'poem') {
    const lines = parsePoemLines(lesson.text);
    const versesPerPage = 3;
    const pagesCount = Math.ceil(lines.length / versesPerPage);
    for (let i = 0; i < pagesCount; i++) {
      pages.push({
        title: `الأبيات ${i * versesPerPage + 1} - ${Math.min(lines.length, (i + 1) * versesPerPage)}`,
        type: 'content',
        elements: {
          contentType: 'poem',
          lines: lines.slice(i * versesPerPage, (i + 1) * versesPerPage)
        }
      });
    }
  } else {
    // Prose reading split by paragraph breaks
    const paragraphs = lesson.text.split('\n\n').map(p => p.trim()).filter(Boolean);
    if (paragraphs.length <= 1) {
      // Split by single newline if no double newlines
      const singleLines = lesson.text.split('\n').map(p => p.trim()).filter(Boolean);
      singleLines.forEach((p, idx) => {
        pages.push({
          title: `الفقرة ${idx + 1}`,
          type: 'content',
          elements: {
            contentType: 'prose',
            text: p
          }
        });
      });
    } else {
      paragraphs.forEach((p, idx) => {
        pages.push({
          title: `الفقرة ${idx + 1}`,
          type: 'content',
          elements: {
            contentType: 'prose',
            text: p
          }
        });
      });
    }
  }

  // Final Page: Grammar Summary
  if (lesson.grammarFocus) {
    pages.push({
      title: 'ركن القواعد النحوية',
      type: 'grammar',
      elements: {
        focus: lesson.grammarFocus
      }
    });
  }

  return pages;
};

interface CurriculumBrowserProps {
  completedLessons: string[];
  favoriteLessons: string[];
  onMarkLessonCompleted: (lessonId: string) => void;
  onNavigateToQuiz: (lessonId: string) => void;
  onToggleFavorite: (lessonId: string) => void;
}

export default function CurriculumBrowser({ 
  completedLessons, 
  favoriteLessons,
  onMarkLessonCompleted, 
  onNavigateToQuiz,
  onToggleFavorite
}: CurriculumBrowserProps) {
  const [selectedUnit, setSelectedUnit] = useState<Unit>(curriculumData[0]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(curriculumData[0].lessons[0]);
  const [activeSubTab, setActiveSubTab] = useState<'text' | 'vocabulary' | 'grammar'>('text');
  const [fontSize, setFontSize] = useState<number>(18); // Default font size in px
  const [lineHeight, setLineHeight] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [showReaderSettings, setShowReaderSettings] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [isFlipbookMode, setIsFlipbookMode] = useState<boolean>(false);
  const [flipbookPage, setFlipbookPage] = useState<number>(0);
  const [isTraditionalFullscreen, setIsTraditionalFullscreen] = useState<boolean>(false);

  // Reset page of flipbook when switching lesson or exiting flipbook
  React.useEffect(() => {
    setFlipbookPage(0);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, [selectedLesson, isFlipbookMode]);

  const isCompleted = completedLessons.includes(selectedLesson.id);

  // Text-To-Speech (TTS) Engine for Arabic
  const handleSpeakText = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        return;
      }

      // Prepare text to read (removing symbols for cleaner speech)
      const cleanText = selectedLesson.text
        .replace(/[*#*\\*]+/g, '')
        .replace(/\n+/g, ' ');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-SA'; // Arabic SA voice
      utterance.rate = 0.85; // Slightly slower for clear child learning

      // Try to find an Arabic voice
      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find(voice => voice.lang.startsWith('ar'));
      if (arVoice) {
        utterance.voice = arVoice;
      }

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      alert('ميزة نطق النص غير مدعومة في متصفحك الحالي.');
    }
  };

  const handleStopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-natural-bg text-natural-text min-h-screen transition-all">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-natural-border pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-natural-dark font-serif flex items-center">
            <BookMarked className="h-6 w-6 ml-2 text-natural-accent" />
            تصفّح كتاب اللغة العربية للصف السادس
          </h2>
          <p className="text-natural-muted text-xs mt-1 font-medium">المنهج الدراسي المعتمد رسمياً للجمهورية السودانية (المدارس الابتدائية)</p>
        </div>
        
        {/* Unit Quick Selector */}
        <div className="mt-4 md:mt-0 flex space-x-2 space-x-reverse overflow-x-auto pb-2">
          {curriculumData.map((unit) => (
            <button
              key={unit.id}
              onClick={() => {
                setSelectedUnit(unit);
                setSelectedLesson(unit.lessons[0]);
                setActiveSubTab('text');
                handleStopSpeaking();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedUnit.id === unit.id
                  ? 'bg-natural-accent text-white shadow-sm'
                  : 'bg-white text-natural-text border border-natural-border hover:bg-natural-light hover:text-natural-dark'
              }`}
            >
              الوحدة {unit.number}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Lessons List */}
        <div className="lg:col-span-1 bg-white border border-natural-border p-4 rounded-3xl space-y-4 h-fit shadow-sm">
          <div className="border-b border-natural-border pb-2.5">
            <h3 className="font-bold text-xs text-natural-dark font-serif">{selectedUnit.title}</h3>
            <span className="text-[10px] text-natural-muted font-bold">اختر الدرس أدناه لقراءته ودراسته:</span>
          </div>
          
          <div className="space-y-1">
            {selectedUnit.lessons.map((lesson) => {
              const isCurrent = selectedLesson.id === lesson.id;
              const hasCompleted = completedLessons.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setActiveSubTab('text');
                    handleStopSpeaking();
                  }}
                  className={`w-full text-right px-3 py-3 rounded-xl transition-all flex items-start justify-between ${
                    isCurrent
                      ? 'bg-natural-accent text-white font-bold shadow-sm'
                      : 'hover:bg-natural-light/60 text-natural-text'
                  }`}
                >
                  <div className="flex flex-col items-start text-right">
                    <span className="text-xs leading-relaxed font-bold">{lesson.title}</span>
                    <span className={`text-[10px] ${isCurrent ? 'text-white/80' : 'text-natural-muted'} mt-1 font-medium`}>
                      {lesson.type === 'poem' ? 'قصيدة لغوية' : 'نص قرائي ممتع'} • صفحة {lesson.page}
                    </span>
                  </div>
                  {hasCompleted && (
                    <div className={`p-1 rounded-full ${isCurrent ? 'bg-natural-accent-hover text-white' : 'bg-natural-accent/10 text-natural-accent'} mr-2`}>
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Core Reading Experience */}
        <div className="lg:col-span-3 space-y-6">
          {/* Lesson Header Toolbar */}
          <div className="bg-white border border-natural-border p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 shadow-sm">
            <div>
              <span className="text-[10px] bg-natural-accent/10 text-natural-accent border border-natural-accent/20 px-2.5 py-0.5 rounded-full font-bold">
                صفحة {selectedLesson.page}
              </span>
              <h3 className="text-xl font-bold text-natural-dark font-serif mt-2">{selectedLesson.title}</h3>
              {selectedLesson.author && (
                <p className="text-xs text-natural-accent mt-0.5 font-bold">للشاعر الكاتب: {selectedLesson.author}</p>
              )}
            </div>

            {/* Custom Control Buttons */}
            <div className="flex items-center space-x-2 space-x-reverse self-start sm:self-center">
              {/* Reading Settings Control Toggle */}
              <button
                id="btn-reading-settings-toggle"
                onClick={() => setShowReaderSettings(!showReaderSettings)}
                className={`p-2 rounded-xl border transition-all flex items-center space-x-1.5 space-x-reverse ${
                  showReaderSettings
                    ? 'bg-amber-600 border-amber-600 text-white font-bold shadow-sm'
                    : 'bg-natural-light border-natural-border text-natural-accent hover:text-natural-dark hover:bg-natural-light-hover'
                }`}
                title="التحكم في خط وتباعد ومظهر القراءة"
              >
                <Sliders className="h-5 w-5" />
                <span className="text-[10px] font-bold hidden sm:inline">إعدادات العرض</span>
              </button>

              {/* TTS Read Aloud */}
              <button
                onClick={handleSpeakText}
                className={`p-2 rounded-xl border transition-all ${
                  isPlaying 
                    ? 'bg-rose-600/10 border-rose-600/20 text-rose-700 hover:bg-rose-600/25' 
                    : 'bg-natural-accent/10 border-natural-accent/20 text-natural-accent hover:bg-natural-accent/25'
                }`}
                title={isPlaying ? "إيقاف القراءة الصوتية" : "قراءة النص بصوت المعلم"}
              >
                {isPlaying ? <Pause className="h-5 w-5 animate-pulse" /> : <Volume2 className="h-5 w-5" />}
              </button>

              {/* Toggle Favorite */}
              <button
                onClick={() => onToggleFavorite(selectedLesson.id)}
                className={`p-2 rounded-xl border transition-all ${
                  favoriteLessons.includes(selectedLesson.id)
                    ? 'bg-amber-500/15 border-amber-500/20 text-amber-600 hover:bg-amber-500/25'
                    : 'bg-natural-light border-natural-border text-natural-muted hover:text-natural-dark'
                }`}
                title={favoriteLessons.includes(selectedLesson.id) ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
              >
                <Star className={`h-5 w-5 ${favoriteLessons.includes(selectedLesson.id) ? 'fill-amber-500' : ''}`} />
              </button>

              {/* Fullscreen Mode */}
              {!isFlipbookMode && (
                <button
                  id="btn-traditional-fullscreen"
                  onClick={() => setIsTraditionalFullscreen(true)}
                  className="p-2 rounded-xl border border-natural-border bg-natural-light text-natural-accent hover:text-natural-dark hover:bg-natural-light-hover transition-all flex items-center space-x-1.5 space-x-reverse"
                  title="عرض في كامل الشاشة"
                >
                  <Maximize2 className="h-5 w-5 text-natural-accent" />
                  <span className="text-[10px] font-bold hidden sm:inline">كامل الشاشة</span>
                </button>
              )}

              {/* Toggle Flipbook Mode */}
              <button
                onClick={() => setIsFlipbookMode(!isFlipbookMode)}
                className={`p-2 rounded-xl border transition-all flex items-center space-x-1.5 space-x-reverse ${
                  isFlipbookMode
                    ? 'bg-amber-600/20 border-amber-600/30 text-amber-700 font-bold shadow-sm'
                    : 'bg-natural-light border-natural-border text-natural-text hover:text-natural-dark hover:bg-natural-light-hover'
                }`}
                title={isFlipbookMode ? "الرجوع للعرض التقليدي" : "تفعيل الكتاب التفاعلي (Flipbook)"}
              >
                <Book className={`h-5 w-5 ${isFlipbookMode ? 'text-amber-700' : 'text-natural-accent'}`} />
                <span className="text-[10px] font-bold hidden sm:inline">
                  {isFlipbookMode ? "القراءة التقليدية" : "الكتاب التفاعلي"}
                </span>
              </button>
            </div>
          </div>

          {/* Collapsible Reader Settings Panel */}
          <AnimatePresence>
            {showReaderSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-white border border-natural-border rounded-3xl p-5 shadow-sm space-y-4 text-right">
                  <div className="flex items-center space-x-2 space-x-reverse border-b border-natural-border/60 pb-2.5">
                    <Sliders className="h-4 w-4 text-natural-accent" />
                    <h4 className="text-xs font-bold text-natural-dark font-serif">لوحة إعدادات ومظهر القراءة</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Font Size Control */}
                    <div className="bg-natural-light/50 border border-[#E5DCC6]/40 p-3.5 rounded-2xl flex flex-col justify-between space-y-2">
                      <span className="text-[10px] text-natural-muted font-bold block">حجم الخط للتصفح:</span>
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => setFontSize(Math.max(14, fontSize - 2))} 
                          className="text-xs font-bold text-natural-text hover:text-natural-dark font-mono px-3 py-1.5 rounded-lg bg-white border border-natural-border shadow-sm transition-all hover:bg-natural-light-hover"
                        >
                          أصغر (أ-)
                        </button>
                        <span className="text-xs text-natural-dark font-mono font-bold">{fontSize}px</span>
                        <button 
                          onClick={() => setFontSize(Math.min(26, fontSize + 2))} 
                          className="text-xs font-bold text-natural-text hover:text-natural-dark font-mono px-3 py-1.5 rounded-lg bg-white border border-natural-border shadow-sm transition-all hover:bg-natural-light-hover"
                        >
                          أكبر (أ+)
                        </button>
                      </div>
                    </div>

                    {/* 2. Line Spacing Control */}
                    <div className="bg-natural-light/50 border border-[#E5DCC6]/40 p-3.5 rounded-2xl flex flex-col justify-between space-y-2">
                      <span className="text-[10px] text-natural-muted font-bold block">تباعد الأسطر (الارتفاع):</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => setLineHeight('normal')}
                          className={`text-[10px] py-1.5 rounded-lg border font-bold transition-all ${
                            lineHeight === 'normal'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white text-natural-muted border-natural-border hover:text-natural-dark'
                          }`}
                        >
                          ضيق
                        </button>
                        <button
                          onClick={() => setLineHeight('relaxed')}
                          className={`text-[10px] py-1.5 rounded-lg border font-bold transition-all ${
                            lineHeight === 'relaxed'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white text-natural-muted border-natural-border hover:text-natural-dark'
                          }`}
                        >
                          متوسط
                        </button>
                        <button
                          onClick={() => setLineHeight('loose')}
                          className={`text-[10px] py-1.5 rounded-lg border font-bold transition-all ${
                            lineHeight === 'loose'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white text-natural-muted border-natural-border hover:text-natural-dark'
                          }`}
                        >
                          متسع
                        </button>
                      </div>
                    </div>

                    {/* 3. Dark/Night Theme Toggle */}
                    <div className="bg-natural-light/50 border border-[#E5DCC6]/40 p-3.5 rounded-2xl flex flex-col justify-between space-y-2">
                      <span className="text-[10px] text-natural-muted font-bold block">مظهر صفحات القراءة:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setIsNightMode(false)}
                          className={`text-[10px] py-1.5 rounded-lg border font-bold flex items-center justify-center space-x-1 space-x-reverse transition-all ${
                            !isNightMode
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white text-natural-muted border-natural-border hover:text-natural-dark'
                          }`}
                        >
                          <Sun className="h-3.5 w-3.5 ml-1" />
                          <span>الوضع النهاري</span>
                        </button>
                        <button
                          onClick={() => setIsNightMode(true)}
                          className={`text-[10px] py-1.5 rounded-lg border font-bold flex items-center justify-center space-x-1 space-x-reverse transition-all ${
                            isNightMode
                              ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
                              : 'bg-white text-natural-muted border-natural-border hover:text-natural-dark'
                          }`}
                        >
                          <Moon className="h-3.5 w-3.5 ml-1" />
                          <span>الوضع الليلي</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dual Render Engine: Flipbook vs. Traditional Scroll */}
          {isFlipbookMode ? (
            <div id="container-flipbook-outer" className="space-y-6">
              {/* Flipbook Styled Container */}
              <div className={`border-4 rounded-[2rem] p-3 sm:p-5 shadow-2xl relative overflow-hidden max-w-4xl w-full mx-auto transition-all duration-300 ${isNightMode ? 'bg-[#2a1d17] border-[#221611]' : 'bg-[#4E3629] border-[#3D2A1F]'}`}>
                {/* Vintage gold corners */}
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400/40 rounded-tr-lg"></div>
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400/40 rounded-tl-lg"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400/40 rounded-br-lg"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400/40 rounded-bl-lg"></div>

                {/* Simulated Paper Open Book Layout */}
                <div id="wrapper-flipbook-open" className={`border rounded-2xl shadow-inner min-h-[440px] md:min-h-[550px] lg:min-h-[620px] max-h-[80vh] flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${isNightMode ? 'bg-[#18181c] border-zinc-800 text-zinc-100' : 'bg-[#FAF6EE] border-[#E5DCC6] text-natural-dark'}`}>
                  
                  {/* Central gutter spine line shadow for authentic 3D book fold */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-[3px] bg-gradient-to-r from-black/5 via-black/15 to-black/5 -translate-x-1/2 z-20 pointer-events-none"></div>

                  {/* Interactive Pages Area */}
                  <div className="flex-1 p-5 sm:p-8 md:p-10 relative z-10 overflow-y-auto max-h-[calc(80vh-80px)]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={flipbookPage}
                        initial={{ opacity: 0, x: 25 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -25 }}
                        transition={{ duration: 0.25 }}
                        className="h-full select-text"
                      >
                        {/* Page 1: Beautiful Book Cover */}
                        {getFlipbookPages(selectedLesson)[Math.min(flipbookPage, getFlipbookPages(selectedLesson).length - 1)]?.type === 'cover' && (
                          <div className="flex flex-col items-center justify-center text-center space-y-5 py-4 h-full">
                            <span className="text-[10px] bg-amber-600/10 text-amber-700 border border-amber-600/20 px-3 py-1 rounded-full font-bold">
                              المقرر الدراسي المطور • القراءة السادسة
                            </span>
                            
                            <div className="space-y-1.5">
                              <h2 className={`text-xl sm:text-2xl font-serif font-extrabold leading-tight ${isNightMode ? 'text-zinc-100' : 'text-natural-dark'}`}>
                                {getFlipbookPages(selectedLesson)[0].elements.title}
                              </h2>
                              {getFlipbookPages(selectedLesson)[0].elements.author && (
                                <p className={`text-xs font-bold ${isNightMode ? 'text-amber-500/90' : 'text-natural-accent'}`}>
                                  تأليف الشاعر/الكاتب: {getFlipbookPages(selectedLesson)[0].elements.author}
                                </p>
                              )}
                            </div>

                            {/* Book Illustration Cover */}
                            <div className="w-full max-w-xs h-36 sm:h-44 rounded-2xl overflow-hidden shadow-md border border-natural-border/60 relative">
                              <img 
                                src={getFlipbookPages(selectedLesson)[0].elements.image} 
                                alt="توضيح الدرس"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            <p className={`text-xs font-bold ${isNightMode ? 'text-zinc-500' : 'text-natural-muted'}`}>
                              الوحدة {selectedUnit.number} • صفحة {selectedLesson.page}
                            </p>

                            <button
                              id="btn-flipbook-start"
                              onClick={() => setFlipbookPage(1)}
                              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center space-x-1.5 space-x-reverse animate-pulse"
                            >
                              <span>افتح وتصفّح الكتاب</span>
                              <ArrowRight className="h-4 w-4 rotate-180" />
                            </button>
                          </div>
                        )}

                        {/* Page 2+: Content pages */}
                        {getFlipbookPages(selectedLesson)[Math.min(flipbookPage, getFlipbookPages(selectedLesson).length - 1)]?.type === 'content' && (
                          <div className="flex flex-col justify-between h-full space-y-6">
                            <div>
                              {/* Header inside book */}
                              <div className={`border-b pb-2 mb-4 flex justify-between items-center text-[10px] font-bold ${isNightMode ? 'border-zinc-800 text-zinc-500' : 'border-[#E5DCC6] text-natural-muted'}`}>
                                <span>{selectedLesson.title}</span>
                                <span>القراءة للصف السادس</span>
                              </div>

                              {getFlipbookPages(selectedLesson)[Math.min(flipbookPage, getFlipbookPages(selectedLesson).length - 1)].elements.contentType === 'poem' ? (
                                /* Poetry Inside Book */
                                <div className="space-y-3 max-w-lg mx-auto font-serif py-3">
                                  {getFlipbookPages(selectedLesson)[Math.min(flipbookPage, getFlipbookPages(selectedLesson).length - 1)].elements.lines.map((verse: any, idx: number) => (
                                    <div key={idx} className={`flex flex-col sm:flex-row items-center sm:justify-between border-b pb-2 ${isNightMode ? 'border-zinc-800/40' : 'border-natural-border/30'}`}>
                                      <div className={`text-right font-medium w-full sm:w-[45%] text-sm sm:text-base leading-relaxed ${isNightMode ? 'text-zinc-200' : 'text-natural-dark'}`}>
                                        {verse.sadr}
                                      </div>
                                      {verse.ajuz && (
                                        <div className="my-1 sm:my-0 text-amber-500 text-xs shrink-0">✦</div>
                                      )}
                                      <div className={`text-left font-medium w-full sm:w-[45%] text-sm sm:text-base leading-relaxed sm:text-right ${isNightMode ? 'text-zinc-200' : 'text-natural-dark'}`}>
                                        {verse.ajuz}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                /* Prose Inside Book */
                                <div 
                                  className={`font-serif text-right tracking-wide whitespace-pre-line text-base sm:text-lg select-text ${isNightMode ? 'text-zinc-200' : 'text-natural-dark'}`}
                                  style={{ 
                                    fontSize: `${fontSize}px`,
                                    lineHeight: lineHeight === 'normal' ? '1.5' : lineHeight === 'relaxed' ? '1.85' : '2.25'
                                  }}
                                >
                                  {getFlipbookPages(selectedLesson)[Math.min(flipbookPage, getFlipbookPages(selectedLesson).length - 1)].elements.text}
                                </div>
                              )}
                            </div>

                            {/* Watermark */}
                            <div className={`text-center text-[9px] font-bold border-t pt-2 ${isNightMode ? 'border-zinc-800 text-zinc-500' : 'border-[#E5DCC6] text-natural-muted'}`}>
                              منهج اللغة العربية السوداني المطور
                            </div>
                          </div>
                        )}

                        {/* Final Page: Grammar Summary inside Flipbook */}
                        {getFlipbookPages(selectedLesson)[Math.min(flipbookPage, getFlipbookPages(selectedLesson).length - 1)]?.type === 'grammar' && (
                          <div className="flex flex-col justify-between h-full space-y-6">
                            <div>
                              <div className={`border-b pb-2 mb-4 flex justify-between items-center text-[10px] font-bold ${isNightMode ? 'border-zinc-800 text-zinc-500' : 'border-[#E5DCC6] text-natural-muted'}`}>
                                <span>القواعد النحوية والإملائية بالدرس</span>
                                <span>الصف السادس الابتدائي</span>
                              </div>

                              <div className="space-y-4 text-right">
                                <div className={`border rounded-2xl p-4 flex items-start space-x-3 space-x-reverse ${isNightMode ? 'bg-zinc-800/60 border-zinc-700/80' : 'bg-amber-500/10 border-amber-500/20'}`}>
                                  <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                  <div>
                                    <h4 className={`font-bold text-xs font-serif ${isNightMode ? 'text-amber-500/95' : 'text-amber-800'}`}>القواعد المستخرجة من الدرس:</h4>
                                    <p className={`text-xs mt-2 leading-relaxed whitespace-pre-line font-bold ${isNightMode ? 'text-zinc-200' : 'text-natural-dark'}`}>
                                      {getFlipbookPages(selectedLesson)[Math.min(flipbookPage, getFlipbookPages(selectedLesson).length - 1)].elements.focus}
                                    </p>
                                  </div>
                                </div>

                                <div className={`p-3.5 rounded-xl border text-[11px] leading-relaxed ${isNightMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-natural-light/60 border-natural-border/60 text-natural-text'}`}>
                                  <strong>أحكام النحو المكتسبة:</strong> تصفح معاني الكلمات والتحق بالمعلم الذكي لإعراب الجمل المستفادة من هذه الأبيات!
                                </div>
                              </div>
                            </div>

                            <div className={`text-center text-[9px] font-bold border-t pt-2 ${isNightMode ? 'border-zinc-800 text-zinc-500' : 'border-[#E5DCC6] text-natural-muted'}`}>
                              أكاديمية اللغة العربية التفاعلية
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Book Bottom Navigation controls */}
                  <div className={`border-t px-6 py-3 rounded-b-2xl flex items-center justify-between z-10 relative transition-colors ${isNightMode ? 'bg-[#1c1c20] border-zinc-800 text-zinc-300' : 'bg-[#F3EFE3] border-[#E5DCC6]'}`}>
                    <button
                      id="btn-flipbook-prev"
                      onClick={() => setFlipbookPage(Math.max(0, flipbookPage - 1))}
                      disabled={flipbookPage === 0}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 space-x-reverse ${
                        flipbookPage === 0
                          ? (isNightMode ? 'text-zinc-700 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')
                          : (isNightMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-natural-dark hover:bg-natural-light')
                      }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span>السابق</span>
                    </button>

                    <span className={`text-xs font-bold font-mono ${isNightMode ? 'text-zinc-500' : 'text-natural-muted'}`}>
                      صفحة {flipbookPage + 1} من {getFlipbookPages(selectedLesson).length}
                    </span>

                    <button
                      id="btn-flipbook-next"
                      onClick={() => setFlipbookPage(Math.min(getFlipbookPages(selectedLesson).length - 1, flipbookPage + 1))}
                      disabled={flipbookPage === getFlipbookPages(selectedLesson).length - 1}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 space-x-reverse ${
                        flipbookPage === getFlipbookPages(selectedLesson).length - 1
                          ? (isNightMode ? 'text-zinc-700 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')
                          : (isNightMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-natural-dark hover:bg-natural-light')
                      }`}
                    >
                      <span>التالي</span>
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Page Indicator list */}
              <div className="flex justify-center flex-wrap gap-1.5 print:hidden">
                {getFlipbookPages(selectedLesson).map((p, idx) => (
                  <button
                    key={idx}
                    id={`btn-flip-page-${idx}`}
                    onClick={() => setFlipbookPage(idx)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                      flipbookPage === idx
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-natural-muted border-natural-border hover:text-natural-dark'
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Traditional Scrolling Layout with Tabs */
            <div className="space-y-6">
              {/* Sub-Tabs Selector */}
              <div className="flex border-b border-natural-border">
                <button
                  onClick={() => setActiveSubTab('text')}
                  className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
                    activeSubTab === 'text'
                      ? 'border-natural-accent text-natural-accent'
                      : 'border-transparent text-natural-muted hover:text-natural-dark'
                  }`}
                >
                  النص القرائي والدرس
                </button>
                <button
                  onClick={() => setActiveSubTab('vocabulary')}
                  className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
                    activeSubTab === 'vocabulary'
                      ? 'border-natural-accent text-natural-accent'
                      : 'border-transparent text-natural-muted hover:text-natural-dark'
                  }`}
                >
                  معاني المفردات ({selectedLesson.vocabulary.length})
                </button>
                {selectedLesson.grammarFocus && (
                  <button
                    onClick={() => setActiveSubTab('grammar')}
                    className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
                      activeSubTab === 'grammar'
                        ? 'border-natural-accent text-natural-accent'
                        : 'border-transparent text-natural-muted hover:text-natural-dark'
                    }`}
                  >
                    التركيز النحوي والإملائي
                  </button>
                )}
              </div>

              {/* Core Content Box */}
              <div className={`border rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 ${isNightMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-zinc-950/20' : 'bg-white border-natural-border text-natural-dark'}`}>
                {/* Reading Text Tab */}
                {activeSubTab === 'text' && (
                  <div className="space-y-6">
                    {/* Lesson Banner Image */}
                    <div id="img-lesson-banner" className="relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-sm border border-natural-border/60">
                      <img 
                        src={getLessonImage(selectedLesson.id)} 
                        alt={selectedLesson.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
                        <div className="text-right">
                          <span className="text-[10px] bg-natural-accent text-white px-2.5 py-0.5 rounded-full font-bold">لوحة توضيحية للدرس</span>
                          <h4 className="text-white font-serif font-bold text-lg mt-1">{selectedLesson.title}</h4>
                        </div>
                      </div>
                    </div>

                    {selectedLesson.type === 'poem' ? (
                      /* Styled Poetry layout with Shathr & Ajuz columns */
                      <div className="space-y-4 max-w-2xl mx-auto py-4 font-serif">
                        {parsePoemLines(selectedLesson.text).map((verse, idx) => (
                          <div 
                            key={idx} 
                            className={`flex flex-col sm:flex-row items-center sm:justify-between border-b pb-3 px-3 py-1.5 rounded-xl transition-colors ${isNightMode ? 'border-zinc-800/40 hover:bg-zinc-850/35' : 'border-natural-border/30 hover:bg-natural-light/20'}`}
                            style={{ 
                              fontSize: `${fontSize}px`,
                              lineHeight: lineHeight === 'normal' ? '1.5' : lineHeight === 'relaxed' ? '1.85' : '2.25'
                            }}
                          >
                            {/* الصدر (Right Column) */}
                            <div className={`text-right font-medium w-full sm:w-[45%] text-lg select-text ${isNightMode ? 'text-zinc-200' : 'text-natural-dark'}`}>
                              {verse.sadr}
                            </div>
                            
                            {/* Decorative divider */}
                            {verse.ajuz && (
                              <div className="my-2 sm:my-0 text-amber-500 text-xs shrink-0 select-none">
                                ✦
                              </div>
                            )}
                            
                            {/* العجز (Left Column) */}
                            <div className={`text-left font-medium w-full sm:w-[45%] text-lg select-text sm:text-right ${isNightMode ? 'text-zinc-200' : 'text-natural-dark'}`}>
                              {verse.ajuz}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Prose reading text */
                      <div 
                        className={`font-serif text-right tracking-wide select-text whitespace-pre-line ${isNightMode ? 'text-zinc-200' : 'text-natural-dark'}`}
                        style={{ 
                          fontSize: `${fontSize}px`,
                          lineHeight: lineHeight === 'normal' ? '1.5' : lineHeight === 'relaxed' ? '1.85' : '2.25'
                        }}
                      >
                        {selectedLesson.text}
                      </div>
                    )}

                    {/* Poem Note */}
                    {selectedLesson.type === 'poem' && (
                      <div className={`p-4 rounded-2xl flex items-center space-x-3 space-x-reverse border ${isNightMode ? 'bg-zinc-800/50 border-zinc-700/80' : 'bg-natural-light border-natural-border'}`}>
                        <Sparkles className="h-5 w-5 text-natural-accent shrink-0" />
                        <p className={`text-xs font-medium ${isNightMode ? 'text-zinc-300' : 'text-natural-text'}`}>
                          هذه قصيدة أدبية ممتازة للشاعر <strong>{selectedLesson.author}</strong>. ينصح بحفظ الأبيات وفهم جمال معانيها اللغوية والبلاغية.
                        </p>
                      </div>
                    )}

                    {/* Inline Grammar Corner for the lesson */}
                    {selectedLesson.grammarFocus && (
                      <div id="card-traditional-grammar" className={`mt-8 border rounded-2xl p-5 border-r-4 shadow-sm text-right ${isNightMode ? 'bg-zinc-800/30 border-zinc-700/50 border-r-amber-600' : 'bg-amber-50/40 border-amber-200 border-r-amber-500'}`}>
                        <div className="flex items-center space-x-2 space-x-reverse mb-2.5">
                          <Sparkles className="h-4 w-4 text-amber-600 animate-pulse" />
                          <h4 className={`font-bold text-xs uppercase tracking-wider font-serif ${isNightMode ? 'text-amber-500/95' : 'text-amber-800'}`}>الركن النحوي وقواعد الدرس:</h4>
                        </div>
                        <p className={`text-xs leading-relaxed font-sans font-bold whitespace-pre-line ${isNightMode ? 'text-zinc-300' : 'text-natural-dark'}`}>
                          {selectedLesson.grammarFocus}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Vocabulary Tab */}
                {activeSubTab === 'vocabulary' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedLesson.vocabulary.map((v, i) => (
                        <div key={i} className={`p-4 rounded-2xl flex flex-col justify-between border hover:bg-white transition-all ${isNightMode ? 'bg-zinc-800/40 border-zinc-700/80 hover:border-zinc-700 hover:bg-zinc-800/60 text-zinc-100' : 'bg-natural-light/50 border-natural-border/70 hover:border-natural-accent/30 hover:bg-white'}`}>
                          <div>
                            <span className="text-[10px] text-natural-muted font-bold">الكلمة اللغوية:</span>
                            <h4 className="font-bold text-base text-natural-accent font-serif mt-1">{v.word}</h4>
                          </div>
                          <div className={`mt-3 pt-2 border-t ${isNightMode ? 'border-zinc-800' : 'border-natural-border/60'}`}>
                            <span className="text-[10px] text-natural-muted font-bold">المعنى والشرح:</span>
                            <p className={`text-xs font-bold mt-1 leading-relaxed ${isNightMode ? 'text-zinc-300' : 'text-natural-dark'}`}>{v.meaning}</p>
                            {v.opposite && (
                              <p className={`text-xs mt-2 ${isNightMode ? 'text-zinc-400' : 'text-natural-muted'}`}>
                                <strong className="text-rose-700 font-bold">ضدها:</strong> {v.opposite}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={`p-4 rounded-2xl border text-center ${isNightMode ? 'bg-zinc-800/40 border-zinc-700/80 text-zinc-400' : 'bg-natural-light/60 border border-natural-border text-natural-muted'}`}>
                      <p className="text-xs font-medium">
                        ألقِ نظرة على المعاني السابقة واحفظها جيداً لتجتاز اختبار الكلمات والربط بنجاح!
                      </p>
                    </div>
                  </div>
                )}

                {/* Grammar Focus Tab */}
                {activeSubTab === 'grammar' && selectedLesson.grammarFocus && (
                  <div className="space-y-4">
                    <div className={`border rounded-2xl p-5 border-r-4 shadow-sm ${isNightMode ? 'bg-zinc-800/30 border-zinc-700/50 border-r-natural-accent' : 'bg-white border-natural-border border-r-natural-accent'}`}>
                      <h4 className="font-bold text-xs text-natural-accent uppercase tracking-wider mb-2">القواعد النحوية والإملائية المستفادة:</h4>
                      <p className={`text-xs leading-relaxed font-sans font-bold whitespace-pre-line ${isNightMode ? 'text-zinc-300' : 'text-natural-dark'}`}>
                        {selectedLesson.grammarFocus}
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl border flex items-center space-x-3 space-x-reverse mt-4 ${isNightMode ? 'bg-zinc-800/50 border-zinc-700/80 text-zinc-300' : 'bg-natural-light/40 border-natural-border text-natural-text'}`}>
                      <Play className="h-5 w-5 text-natural-accent shrink-0" />
                      <p className="text-xs font-medium">
                        يمكنك كتابة أي جملة من الجمل السابقة في تبويب <strong>"المعلم والبحث الذكي"</strong> ليقوم الذكاء الاصطناعي بإعرابها بالتفصيل وتوضيح أحكامها النحوية والصرفية!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Footer: Complete Reading & Go to quiz */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-natural-border p-6 rounded-3xl space-y-4 sm:space-y-0 shadow-sm">
            <div className="text-right">
              <h4 className="font-bold text-xs text-natural-dark font-serif">هل انتهيت من قراءة وفهم هذا الدرس؟</h4>
              <p className="text-xs text-natural-muted font-medium mt-0.5">سجل قراءتك لتفتح أوسمة الإنجازات والتقدم.</p>
            </div>
            
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={() => onMarkLessonCompleted(selectedLesson.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center ${
                  isCompleted
                    ? 'bg-natural-accent/15 text-natural-accent border border-natural-accent/20 cursor-default'
                    : 'bg-natural-accent hover:bg-natural-accent-hover text-white shadow-sm'
                }`}
              >
                {isCompleted ? (
                  <>
                    <BookOpenCheck className="h-4 w-4 ml-2" />
                    تم إتمام قراءة الدرس بنجاح
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 ml-2" />
                    أنهيت قراءة هذا الدرس
                  </>
                )}
              </button>

              <button
                onClick={() => onNavigateToQuiz(selectedLesson.id)}
                className="px-5 py-2.5 bg-natural-light hover:bg-natural-cream text-natural-dark border border-natural-border rounded-xl text-xs font-bold transition-all flex items-center"
              >
                انتقل لاختبار الفهم
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Traditional Fullscreen Overlay */}
      <AnimatePresence>
        {isTraditionalFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-50 overflow-y-auto p-4 sm:p-8 md:p-12 text-right flex flex-col justify-between select-text transition-all duration-300 ${isNightMode ? 'bg-[#121214]' : 'bg-[#FAF6EE]'}`}
          >
            {/* Fullscreen Header Toolbar */}
            <div className={`max-w-4xl w-full mx-auto p-4 sm:p-6 rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 backdrop-blur-md mb-8 border transition-all duration-300 ${isNightMode ? 'bg-zinc-900/95 border-zinc-800 text-zinc-100' : 'bg-white/85 border-natural-border/70 text-natural-dark'}`}>
              <div>
                <span className={`text-[10px] border px-2.5 py-0.5 rounded-full font-bold ${isNightMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-natural-accent/10 text-natural-accent border border-natural-accent/20'}`}>
                  الوحدة {selectedUnit.number} • صفحة {selectedLesson.page} • قراءة بملء الشاشة
                </span>
                <h3 className={`text-xl sm:text-2xl font-bold font-serif mt-2 ${isNightMode ? 'text-zinc-100' : 'text-natural-dark'}`}>{selectedLesson.title}</h3>
                {selectedLesson.author && (
                  <p className={`text-xs font-bold mt-0.5 ${isNightMode ? 'text-amber-500/90' : 'text-natural-accent'}`}>للشاعر الكاتب: {selectedLesson.author}</p>
                )}
              </div>

              {/* Controls inside Fullscreen */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                {/* Line Spacing Control */}
                <div className={`flex items-center border px-2 py-1 rounded-xl space-x-1 space-x-reverse ${isNightMode ? 'bg-zinc-800 border-zinc-700' : 'bg-natural-light border-natural-border'}`}>
                  <button
                    onClick={() => setLineHeight('normal')}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                      lineHeight === 'normal'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : (isNightMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-natural-muted hover:text-natural-dark')
                    }`}
                    title="تباعد ضيق"
                  >
                    ضيق
                  </button>
                  <button
                    onClick={() => setLineHeight('relaxed')}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                      lineHeight === 'relaxed'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : (isNightMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-natural-muted hover:text-natural-dark')
                    }`}
                    title="تباعد متوسط"
                  >
                    متوسط
                  </button>
                  <button
                    onClick={() => setLineHeight('loose')}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                      lineHeight === 'loose'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : (isNightMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-natural-muted hover:text-natural-dark')
                    }`}
                    title="تباعد متسع"
                  >
                    متسع
                  </button>
                </div>

                {/* Day / Night toggle in Fullscreen */}
                <button
                  onClick={() => setIsNightMode(!isNightMode)}
                  className={`p-2 rounded-xl border transition-all ${
                    isNightMode
                      ? 'bg-zinc-800 border-zinc-700 text-amber-400 font-bold shadow-sm'
                      : 'bg-natural-light border-natural-border text-natural-accent hover:text-natural-dark'
                  }`}
                  title={isNightMode ? "الوضع النهاري" : "الوضع الليلي"}
                >
                  {isNightMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                {/* Font Sizer */}
                <div className={`flex items-center border px-3 py-1.5 rounded-xl space-x-2 space-x-reverse ${isNightMode ? 'bg-zinc-800 border-zinc-700' : 'bg-natural-light border-natural-border'}`}>
                  <button 
                    onClick={() => setFontSize(Math.max(14, fontSize - 2))} 
                    className={`text-xs font-bold font-mono w-5 h-5 flex items-center justify-center rounded border shadow-sm transition-colors ${
                      isNightMode ? 'bg-zinc-900 border-zinc-850 text-zinc-300 hover:bg-zinc-750' : 'bg-white border-natural-border text-natural-text hover:text-natural-dark'
                    }`}
                  >
                    أ-
                  </button>
                  <span className={`text-xs font-mono font-bold select-none ${isNightMode ? 'text-zinc-200' : 'text-natural-dark'}`}>{fontSize}</span>
                  <button 
                    onClick={() => setFontSize(Math.min(26, fontSize + 2))} 
                    className={`text-xs font-bold font-mono w-5 h-5 flex items-center justify-center rounded border shadow-sm transition-colors ${
                      isNightMode ? 'bg-zinc-900 border-zinc-850 text-zinc-300 hover:bg-zinc-750' : 'bg-white border-natural-border text-natural-text hover:text-natural-dark'
                    }`}
                  >
                    أ+
                  </button>
                </div>

                {/* TTS Read Aloud */}
                <button
                  onClick={handleSpeakText}
                  className={`p-2 rounded-xl border transition-all ${
                    isPlaying 
                      ? 'bg-rose-600/10 border-rose-600/20 text-rose-700 hover:bg-rose-600/25' 
                      : (isNightMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750' : 'bg-natural-accent/10 border-natural-accent/20 text-natural-accent hover:bg-natural-accent/25')
                  }`}
                  title={isPlaying ? "إيقاف القراءة الصوتية" : "قراءة النص بصوت المعلم"}
                >
                  {isPlaying ? <Pause className="h-4 w-4 animate-pulse" /> : <Volume2 className="h-4 w-4" />}
                </button>

                {/* Exit Fullscreen Button */}
                <button
                  id="btn-close-fullscreen"
                  onClick={() => {
                    setIsTraditionalFullscreen(false);
                    handleStopSpeaking();
                  }}
                  className="px-4 py-2 bg-[#9e2a2b] hover:bg-[#801e20] text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 space-x-reverse transition-all"
                >
                  <Minimize2 className="h-4 w-4" />
                  <span>إنهاء ملء الشاشة</span>
                </button>
              </div>
            </div>

            {/* Reading Content Core Inside Fullscreen */}
            <div className={`flex-1 max-w-3xl w-full mx-auto border rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl mb-8 min-h-[60vh] transition-all duration-300 ${isNightMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-zinc-950/40' : 'bg-white border-[#E5DCC6] text-natural-dark'}`}>
              {selectedLesson.type === 'poem' ? (
                /* Styled Poetry layout with Shathr & Ajuz columns */
                <div className="space-y-5 py-4 font-serif">
                  {parsePoemLines(selectedLesson.text).map((verse, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col sm:flex-row items-center sm:justify-between border-b pb-3 px-3 py-2 rounded-xl transition-colors ${isNightMode ? 'border-zinc-800/40 hover:bg-zinc-850/35' : 'border-natural-border/30 hover:bg-natural-light/20'}`}
                      style={{ 
                        fontSize: `${fontSize + 2}px`,
                        lineHeight: lineHeight === 'normal' ? '1.5' : lineHeight === 'relaxed' ? '1.85' : '2.25'
                      }}
                    >
                      {/* الصدر */}
                      <div className={`text-right font-medium w-full sm:w-[45%] leading-relaxed select-text ${isNightMode ? 'text-zinc-200' : 'text-natural-dark'}`}>
                        {verse.sadr}
                      </div>
                      
                      {/* Decorative divider */}
                      {verse.ajuz && (
                        <div className="my-2 sm:my-0 text-amber-500 text-sm shrink-0 select-none">
                          ✦
                        </div>
                      )}
                      
                      {/* العجز */}
                      <div className={`text-left font-medium w-full sm:w-[45%] leading-relaxed select-text sm:text-right ${isNightMode ? 'text-zinc-200' : 'text-natural-dark'}`}>
                        {verse.ajuz}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Prose reading text */
                <div 
                  className={`font-serif text-right tracking-wide select-text whitespace-pre-line ${isNightMode ? 'text-zinc-200' : 'text-natural-dark'}`}
                  style={{ 
                    fontSize: `${fontSize + 2}px`,
                    lineHeight: lineHeight === 'normal' ? '1.5' : lineHeight === 'relaxed' ? '1.85' : '2.25'
                  }}
                >
                  {selectedLesson.text}
                </div>
              )}

              {/* Poem Note (If poem) */}
              {selectedLesson.type === 'poem' && (
                <div className={`mt-8 p-4 rounded-2xl flex items-center space-x-3 space-x-reverse border ${isNightMode ? 'bg-zinc-800/50 border-zinc-700/80' : 'bg-natural-light border-natural-border'}`}>
                  <Sparkles className="h-5 w-5 text-natural-accent shrink-0" />
                  <p className={`text-xs font-medium ${isNightMode ? 'text-zinc-300' : 'text-natural-text'}`}>
                    هذه قصيدة أدبية ممتازة للشاعر <strong>{selectedLesson.author}</strong>. ينصح بحفظ الأبيات وفهم جمال معانيها اللغوية والبلاغية.
                  </p>
                </div>
              )}

              {/* Grammar Section */}
              {selectedLesson.grammarFocus && (
                <div className={`mt-8 border rounded-2xl p-5 border-r-4 shadow-sm text-right ${isNightMode ? 'bg-zinc-800/30 border-zinc-700/50 border-r-amber-600' : 'bg-amber-50/40 border-amber-200 border-r-amber-500'}`}>
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <h4 className={`font-bold text-xs uppercase tracking-wider font-serif ${isNightMode ? 'text-amber-500/95' : 'text-amber-800'}`}>الركن النحوي وقواعد الدرس:</h4>
                  </div>
                  <p className={`text-xs leading-relaxed font-sans font-bold whitespace-pre-line ${isNightMode ? 'text-zinc-300' : 'text-natural-dark'}`}>
                    {selectedLesson.grammarFocus}
                  </p>
                </div>
              )}
            </div>

            {/* Footer inside Fullscreen */}
            <div className={`max-w-4xl w-full mx-auto text-center text-xs font-serif border-t pt-4 mt-auto ${isNightMode ? 'border-zinc-800 text-zinc-500' : 'border-[#E5DCC6] text-[#a39474]'}`}>
              منهج اللغة العربية التفاعلي المطور للصف السادس الابتدائي • جمهورية السودان
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
