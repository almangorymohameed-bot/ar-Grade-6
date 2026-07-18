import React, { useState } from 'react';
import { curriculumData, Lesson, Unit } from '../data/curriculum';
import { 
  BookOpen, BookOpenCheck, Volume2, Eye, ArrowRight, BookMarked, 
  Check, Play, Pause, Sparkles, Star, ChevronRight, ChevronLeft, Book,
  Maximize2, Minimize2, Sun, Moon, Sliders, ChevronDown, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Static imports of 3D Pixar-style generated images to guarantee reliable bundling & resolution
import hatim3d from '../assets/images/hatim_generosity_3d_1784402326881.jpg';
import water3d from '../assets/images/water_save_3d_1784402337807.jpg';
import mamun3d from '../assets/images/mamun_teacher_3d_1784402793514.jpg';
import wise3d from '../assets/images/wise_command_3d_1784402804154.jpg';

import success3d from '../assets/images/success_key_3d_1784402349760.jpg';
import time3d from '../assets/images/time_importance_3d_1784402814477.jpg';
import freedom3d from '../assets/images/freedom_birds_3d_1784402827356.jpg';
import loyalDog3d from '../assets/images/loyal_dog_3d_1784402360239.jpg';
import decentWork3d from '../assets/images/decent_work_3d_1784402839377.jpg';
import booksRev3d from '../assets/images/books_revolution_3d_1784402849137.jpg';
import wisdomVirtues3d from '../assets/images/wisdom_virtues_3d_1784402861777.jpg';

import fools3d from '../assets/images/fools_tales_3d_1784402872074.jpg';
import misers3d from '../assets/images/misers_tales_3d_1784402887773.jpg';
import myTime3d from '../assets/images/my_time_3d_1784402899812.jpg';
import proverbs3d from '../assets/images/proverbs_wisdom_3d_1784402912128.jpg';
import bedouin3d from '../assets/images/bedouin_intuition_3d_1784402923305.jpg';

import wisdomHome3d from '../assets/images/wisdom_home_3d_1784402933564.jpg';
import schoolChildren3d from '../assets/images/school_children_3d_1784402944194.jpg';
import tamboori3d from '../assets/images/tamboori_shoe_3d_1784402373573.jpg';

import sea3d from '../assets/images/sea_garden_3d_1784402425367.jpg';
import dinder3d from '../assets/images/dinder_park_3d_1784402384284.jpg';

// Helper to get matching images based on lesson text or title keywords (2D children illustration style)
const getLessonImage = (lessonId: string): string => {
  const images: { [id: string]: string } = {
    // Unit 1: مراجعة عامة
    'u1-l1': hatim3d, // أكرم من حاتم الطائي (Generated 3D Pixar Style)
    'u1-l2': water3d, // ترشيد استهلاك المياه (Generated 3D Pixar Style)
    'u1-l3': mamun3d, // المأمون ومؤدب ولديه (Generated 3D Pixar Style)
    'u1-l4': wise3d, // من وصايا الحكيم (Generated 3D Pixar Style)
    
    // Unit 2: فن الكتابة
    'u2-l1': success3d, // مفتاح النجاح (Generated 3D Pixar Style)
    'u2-l2': time3d, // أهمية الوقت (Generated 3D Pixar Style)
    'u2-l3': freedom3d, // الحرية (Generated 3D Pixar Style)
    'u2-l4': loyalDog3d, // وفاء الكلب (Generated 3D Pixar Style)
    'u2-l5': decentWork3d, // عمل لائق (Generated 3D Pixar Style)
    'u2-l6': booksRev3d, // ثورة الكتب (Generated 3D Pixar Style)
    'u2-l7': wisdomVirtues3d, // حكم وفضائل (Generated 3D Pixar Style)
    
    // Unit 3: حكم وطرائف
    'u3-l1': fools3d, // من أخبار الحمقى والمغفلين (Generated 3D Pixar Style)
    'u3-l2': misers3d, // من أخبار البخلاء (Generated 3D Pixar Style)
    'u3-l3': myTime3d, // أوقاتي (Generated 3D Pixar Style)
    'u3-l4': proverbs3d, // أمثال وحكم (Generated 3D Pixar Style)
    'u3-l5': bedouin3d, // فراسة البدوي (Generated 3D Pixar Style)

    // Unit 4: متفرقات
    'u4-l1': wisdomHome3d, // في بيته يؤتى الحكم (Generated 3D Pixar Style)
    'u4-l2': schoolChildren3d, // أبناء المدارس (Generated 3D Pixar Style)
    'u4-l3': tamboori3d, // حذاء الطنبوري (Generated 3D Pixar Style)
    'u4-l4': wisdomVirtues3d, // جمال الفتاة في أخلاقها (Generated 3D Pixar Style - Reused elegant scenery)
    'u4-l5': decentWork3d, // طبيب الأسنان (Generated 3D Pixar Style - Reused child-friendly helping theme)
    'u4-l6': schoolChildren3d, // رئيس القوم (Generated 3D Pixar Style - Reused cooperative kids theme)

    // Unit 5: وطني
    'u5-l1': sea3d, // حدائق البحر المرجانية (Generated 3D Pixar Style)
    'u5-l2': schoolChildren3d, // نشيد وطني / توأمي (Generated 3D Pixar Style - Reused happy school kids theme)
    'u5-l3': decentWork3d, // التجاني الماحي (Generated 3D Pixar Style - Reused helpful characters theme)
    'u5-l4': dinder3d, // محمية الدندر (Generated 3D Pixar Style)
    'u5-l5': wisdomHome3d, // عرس السودان (Generated 3D Pixar Style - Reused cozy home/celebration theme)
  };
  return images[lessonId] || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop';
};

const getUnitVisuals = (unitNumber: number) => {
  const visuals: { [num: number]: { subtitle: string; iconBg: string; badgeBg: string; hoverBorder: string; icon: string } } = {
    1: {
      subtitle: 'مراجعة عامة للقواعد اللغوية، كرم حاتم الطائي، ترشيد استهلاك المياه، وصايا الحكيم وآداب طلب العلم.',
      iconBg: 'bg-rose-50 text-rose-500 border border-rose-100',
      badgeBg: 'bg-rose-500 text-white',
      hoverBorder: 'border-rose-400 ring-rose-400/20',
      icon: '📝'
    },
    2: {
      subtitle: 'دروس تبني المهارة والفكر: كاستثمار الوقت، وقيمة الحرية، ووفاء الحيوان، وثورة الكتب وعناصر النجاح.',
      iconBg: 'bg-teal-50 text-teal-500 border border-teal-100',
      badgeBg: 'bg-teal-500 text-white',
      hoverBorder: 'border-teal-400 ring-teal-400/20',
      icon: '✍️'
    },
    3: {
      subtitle: 'طرائف تاريخية وقصص مضحكة وحكم بليغة: من نوادر الحمقى والمغفلين والبخلاء، وفراسة البادية.',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      badgeBg: 'bg-amber-500 text-white',
      hoverBorder: 'border-amber-400 ring-amber-400/20',
      icon: '🎭'
    },
    4: {
      subtitle: 'باقة منوعة من قصص نوادر حذاء الطنبوري، قصائد الأخلاق الحميدة، نصائح طبيب الأسنان، وحكمة القيادة.',
      iconBg: 'bg-indigo-50 text-indigo-500 border border-indigo-100',
      badgeBg: 'bg-indigo-500 text-white',
      hoverBorder: 'border-indigo-400 ring-indigo-400/20',
      icon: '🧩'
    },
    5: {
      subtitle: 'جولة وطنية في السودان: حدائق البحر المرجانية، محمية الدندر الطبيعية، التجاني الماحي، وعرس السودان.',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      badgeBg: 'bg-emerald-500 text-white',
      hoverBorder: 'border-emerald-400 ring-emerald-400/20',
      icon: '🇸🇩'
    }
  };
  return visuals[unitNumber] || {
    subtitle: 'مراجعات عامة وقواعد وتمارين وتدريبات للتمكن من فصاحة وبلاغة اللغة العربية.',
    iconBg: 'bg-amber-50 text-amber-500',
    badgeBg: 'bg-amber-500 text-white',
    hoverBorder: 'border-amber-400 ring-amber-400/20',
    icon: '📚'
  };
};

// Helper to parse YouTube URL and convert to dynamic embed url with autoplay
const getYoutubeEmbedUrl = (url?: string): string => {
  if (!url) return '';
  let videoId = '';
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('youtube.com/watch')) {
    const params = new URLSearchParams(url.split('?')[1]);
    videoId = params.get('v') || '';
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1].split('?')[0];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3&fs=0` : url;
};

// Helper to convert Google Drive link to preview embed URL
const getDriveEmbedUrl = (url?: string): string => {
  if (!url) return '';
  let embedUrl = url;
  if (url.includes('drive.google.com')) {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      embedUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
  }
  return embedUrl;
};

interface VideoPlayerProps {
  videoUrl?: string;
  driveVideoUrl?: string;
  videoSource: 'youtube' | 'drive';
  onChangeVideoSource?: (source: 'youtube' | 'drive') => void;
  isNightMode: boolean;
  onMaximize: () => void;
  title: string;
  isMaximized?: boolean;
}

const VideoPlayer = ({ 
  videoUrl, 
  driveVideoUrl, 
  videoSource, 
  onChangeVideoSource, 
  isNightMode, 
  onMaximize, 
  title, 
  isMaximized = false 
}: VideoPlayerProps) => {
  const embedUrl = videoSource === 'youtube' ? getYoutubeEmbedUrl(videoUrl) : getDriveEmbedUrl(driveVideoUrl);

  if (isMaximized) {
    return (
      <div id="video-lesson-container-placeholder" className={`relative w-full rounded-2xl overflow-hidden shadow-md border p-6 flex flex-col items-center justify-center text-center ${isNightMode ? 'bg-zinc-950 border-zinc-800' : 'bg-amber-50/20 border-natural-border/60'} min-h-[220px] sm:min-h-[250px] transition-all`}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-12 w-12 rounded-full bg-amber-500 opacity-20 animate-ping"></span>
            <div className="relative bg-amber-600 text-white rounded-full p-3.5 shadow-md">
              <Play className="h-6 w-6 fill-current animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <h4 className={`font-serif font-bold text-base ${isNightMode ? 'text-zinc-200' : 'text-natural-dark'}`}>
              الفيديو يعرض الآن في نافذة مكبرة
            </h4>
            <p className={`text-xs ${isNightMode ? 'text-zinc-400' : 'text-natural-muted'} max-w-md mx-auto leading-relaxed`}>
              تم إيقاف تشغيل هذا المشغل لتجنب تكرار الصوت أثناء مشاهدتك للمقطع بالوضع المكبر.
            </p>
          </div>
          <button
            onClick={onMaximize}
            className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all flex items-center space-x-1.5 space-x-reverse shadow-sm border border-amber-500/25"
          >
            <span>العودة لشاشة التكبير</span>
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Dynamic Source Selector Bar if Drive option is available */}
      {driveVideoUrl && videoUrl && (
        <div className={`flex flex-col sm:flex-row items-center justify-between p-2 rounded-2xl border ${isNightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200/60'}`} dir="rtl">
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => onChangeVideoSource?.('youtube')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 space-x-reverse ${
                videoSource === 'youtube'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : `text-slate-600 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200`
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              <span>تشغيل عبر يوتيوب (الأساسي)</span>
            </button>
            <button
              onClick={() => onChangeVideoSource?.('drive')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 space-x-reverse ${
                videoSource === 'drive'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : `text-slate-600 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200`
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>تشغيل عبر قوقل درايف (إضافي)</span>
            </button>
          </div>
          <span className={`text-[10px] font-bold mt-2 sm:mt-0 ml-2 ${isNightMode ? 'text-zinc-400' : 'text-slate-500'} hidden md:inline`}>
            تتوفر خيارات تشغيل متعددة لهذا الدرس
          </span>
        </div>
      )}

      {/* Main Player Box */}
      <div id="video-lesson-container" className={`relative w-full rounded-2xl overflow-hidden shadow-md border ${isNightMode ? 'bg-zinc-950 border-zinc-800' : 'bg-black border-natural-border/60'} group`}>
        <div className="relative aspect-video w-full h-0 pb-[56.25%]">
          <iframe
            src={embedUrl}
            title={`مقطع مرئي للدرس: ${title}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            sandbox="allow-scripts allow-same-origin"
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
        {/* Maximizer overlay bar inside the app */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex space-x-2 space-x-reverse">
          <button
            id="btn-maximize-video"
            onClick={onMaximize}
            className="px-3 py-1.5 bg-black/80 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 space-x-reverse shadow-md border border-white/10"
            title="تكبير الفيديو داخل الموقع"
          >
            <Maximize2 className="h-4 w-4" />
            <span>تكبير داخل الموقع</span>
          </button>
        </div>
        
        {/* Decorative tag */}
        <div className="absolute bottom-3 right-3 bg-amber-600/90 text-white text-[10px] px-2.5 py-1 rounded-md font-bold flex items-center space-x-1.5 space-x-reverse z-15 backdrop-blur-sm shadow">
          <Play className="h-3 w-3 fill-current" />
          <span>فيديو تفاعلي للدرس (تشغيل {videoSource === 'youtube' ? 'يوتيوب' : 'قوقل درايف'})</span>
        </div>
      </div>
    </div>
  );
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
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(curriculumData[0]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(curriculumData[0].lessons[0]);
  const [activeSubTab, setActiveSubTab] = useState<'text' | 'vocabulary' | 'grammar'>('text');
  const [fontSize, setFontSize] = useState<number>(18); // Default font size in px
  const [lineHeight, setLineHeight] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [showReaderSettings, setShowReaderSettings] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReadingMode, setIsReadingMode] = useState<boolean>(false);

  const [isGrammarOpen, setIsGrammarOpen] = useState<boolean>(false);
  const [clickedWord, setClickedWord] = useState<string | null>(null);

  const [isLessonsDropdownOpen, setIsLessonsDropdownOpen] = useState<boolean>(false);

  const [isFlipbookMode, setIsFlipbookMode] = useState<boolean>(false);
  const [flipbookPage, setFlipbookPage] = useState<number>(0);
  const [isTraditionalFullscreen, setIsTraditionalFullscreen] = useState<boolean>(false);
  const [isMaximizedVideo, setIsMaximizedVideo] = useState<boolean>(false);
  const [videoSource, setVideoSource] = useState<'youtube' | 'drive'>('youtube');

  // Reset page of flipbook when switching lesson or exiting flipbook
  React.useEffect(() => {
    setFlipbookPage(0);
    setIsLessonsDropdownOpen(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setVideoSource('youtube');
  }, [selectedLesson, isFlipbookMode]);

  // Reset lessons dropdown when unit changes
  React.useEffect(() => {
    setIsLessonsDropdownOpen(false);
  }, [selectedUnit]);

  const isCompleted = completedLessons.includes(selectedLesson.id);

  // Find the next lesson in the current unit
  const getNextLesson = (): Lesson | null => {
    if (!selectedUnit) return null;
    const currentIdx = selectedUnit.lessons.findIndex(l => l.id === selectedLesson.id);
    if (currentIdx !== -1 && currentIdx < selectedUnit.lessons.length - 1) {
      return selectedUnit.lessons[currentIdx + 1];
    }
    return null;
  };

  const nextLesson = getNextLesson();

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
      setClickedWord(null);
    }
  };

  // Speak a single word with optimized Arabic settings
  const handleSpeakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setClickedWord(word);
      
      // Clean word from punctuation symbols to read it purely
      const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?«»"]/g, "").trim();
      if (!cleanWord) return;

      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.70; // Slightly slower for clear child learning
      utterance.pitch = 1.15; // Friendly child learning voice
      
      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find(voice => voice.lang.startsWith('ar'));
      if (arVoice) {
        utterance.voice = arVoice;
      }
      
      utterance.onend = () => {
        setClickedWord(null);
      };
      utterance.onerror = () => {
        setClickedWord(null);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Renders text as span of clickable words
  const renderClickableWords = (text: string, isPoetry: boolean) => {
    if (!text) return null;
    
    // Split the text into lines first
    const lines = text.split('\n');
    
    return (
      <div className="space-y-1">
        {lines.map((line, lineIdx) => {
          // Split each line by whitespace to get words while preserving original spaces
          const tokens = line.split(/(\s+)/);
          return (
            <div key={lineIdx} className={isPoetry ? "inline-block" : "block mb-2"}>
              {tokens.map((token, tokenIdx) => {
                // If token is whitespace, just render it as space
                if (/^\s+$/.test(token)) {
                  return <span key={tokenIdx}>{token}</span>;
                }
                
                // Otherwise, render as interactive word
                const isSelected = clickedWord === token;
                return (
                  <span
                    key={tokenIdx}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeakWord(token);
                    }}
                    className={`inline-block px-1 py-0.5 rounded cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-rose-500 text-white scale-110 font-black shadow-sm ring-2 ring-rose-300'
                        : 'hover:bg-amber-100 hover:text-amber-950 dark:hover:bg-zinc-800 dark:hover:text-amber-200'
                    }`}
                    title="انقر لسماع نطق هذه الكلمة"
                  >
                    {token}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-natural-bg text-natural-text min-h-screen transition-all">
      <AnimatePresence mode="wait">
        {!isReadingMode ? (
          <motion.div
            key="unit-explorer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 animate-none"
          >
            {/* Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-natural-border pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-natural-dark font-serif flex items-center">
            <BookMarked className="h-6 w-6 ml-2 text-natural-accent" />
            تصفّح كتاب اللغة العربية للصف السادس
          </h2>
          <p className="text-natural-muted text-xs mt-1 font-medium">المنهج الدراسي المعتمد رسمياً للجمهورية السودانية (المدارس الابتدائية)</p>
        </div>
      </div>

      {/* Unit Cards Grid - Improved display as in the screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-right" dir="rtl">
        {curriculumData.map((unit) => {
          const isSelected = selectedUnit !== null && selectedUnit.id === unit.id;
          const visuals = getUnitVisuals(unit.number);
          
          // Calculate completed lessons in this unit
          const unitLessons = unit.lessons;
          const completedCount = unitLessons.filter(l => completedLessons.includes(l.id)).length;
          const totalCount = unitLessons.length;
          const isUnitCompleted = completedCount === totalCount && totalCount > 0;

          return (
            <div key={unit.id} className="flex flex-col space-y-4">
              <motion.div
                onClick={() => {
                  if (isSelected) {
                    setSelectedUnit(null);
                  } else {
                    setSelectedUnit(unit);
                    setSelectedLesson(unit.lessons[0]);
                    setActiveSubTab('text');
                    handleStopSpeaking();
                    
                    // Smooth scroll down to opened lessons list
                    setTimeout(() => {
                      const element = document.getElementById(`lessons-list-${unit.id}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 150);
                  }
                }}
                whileHover={{ y: -4 }}
                className={`relative rounded-3xl p-6 flex flex-col justify-between min-h-[190px] transition-all cursor-pointer select-none bg-white border ${
                  isSelected
                    ? 'border-rose-400/80 shadow-lg ring-4 ring-rose-400/10'
                    : 'border-natural-border/75 shadow-sm hover:shadow-md hover:border-natural-accent/30'
                }`}
              >
                {/* Top-Right Badge: Unit Number */}
                <div className="absolute top-4 right-4">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold ${
                    unit.number % 3 === 1 
                      ? 'bg-rose-500/10 text-rose-600' 
                      : unit.number % 3 === 2
                      ? 'bg-teal-500/10 text-teal-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    الوحدة {unit.number}
                  </span>
                </div>

                {/* Top-Left Circle Icon */}
                <div className="absolute top-4 left-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${visuals.iconBg}`}>
                    {visuals.icon}
                  </div>
                </div>

                {/* Title & Description */}
                <div className="mt-5 space-y-1.5 flex-1">
                  <h3 className="font-serif font-extrabold text-base text-[#1E293B]">
                    {unit.title}
                  </h3>
                  <p className="text-[11px] text-[#64748B] font-medium leading-relaxed max-w-[90%]">
                    {visuals.subtitle}
                  </p>
                </div>

                {/* Progress & Bottom Bar */}
                <div className="mt-5 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 space-x-reverse">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold flex items-center ${
                      isUnitCompleted
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-amber-500/10 text-amber-600 animate-pulse'
                    }`}>
                      {isUnitCompleted ? 'مكتملة ✨' : 'مستمرة ⚡'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#475569] font-bold">
                    التقدم: {completedCount} / {totalCount} من الدروس
                  </span>
                </div>
              </motion.div>

              {/* Lessons list directly under the selected Unit card */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="border-2 border-dashed border-rose-300 rounded-3xl p-5 bg-white shadow-md text-right space-y-4"
                    dir="rtl"
                  >
                    <div className="bg-[#FFF8F8] p-3.5 rounded-2xl border border-rose-100">
                      <h4 className="font-extrabold text-rose-950 text-xs leading-relaxed">اختر درساً للبدء بقراءته وحل تمارينه:</h4>
                      <p className="text-[10px] text-rose-500 font-bold mt-1">تصفح دروس {unit.title.replace(/^الوحدة \w+\: /, '')}</p>
                    </div>

                    <div className="space-y-3 pr-1 text-right">
                      {unit.lessons.map((lesson) => {
                        const isCurrent = selectedLesson.id === lesson.id;
                        const hasCompleted = completedLessons.includes(lesson.id);
                        return (
                          <motion.button
                            key={lesson.id}
                            onClick={() => {
                              setSelectedLesson(lesson);
                              setActiveSubTab('text');
                              handleStopSpeaking();
                              setIsReadingMode(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            whileTap={{ scale: 0.99 }}
                            className={`w-full text-right px-4 py-3.5 rounded-2xl transition-all border flex items-center justify-between bg-white cursor-pointer ${
                              isCurrent
                                ? 'border-rose-400 ring-4 ring-rose-400/5 shadow-md font-extrabold'
                                : 'border-[#E2E8F0] hover:bg-slate-50 text-[#334155] shadow-sm'
                            }`}
                          >
                            <ChevronLeft className={`h-4 w-4 shrink-0 transition-transform ${isCurrent ? 'text-rose-500 translate-x-[-2px]' : 'text-slate-400'}`} />

                            <div className="flex items-center space-x-3 space-x-reverse min-w-0 flex-1 justify-start">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                isCurrent 
                                  ? 'bg-rose-500/10 text-rose-500 border border-rose-200' 
                                  : 'bg-slate-100 text-slate-400 border border-slate-200'
                              }`}>
                                {lesson.type === 'poem' ? (
                                  <Sparkles className="h-3.5 w-3.5" />
                                ) : (
                                  <Book className="h-3.5 w-3.5" />
                                )}
                              </div>
                              
                              <div className="flex flex-col items-start text-right min-w-0">
                                <span className={`text-[11px] leading-relaxed ${isCurrent ? 'font-extrabold text-[#1E293B]' : 'font-bold'}`}>
                                  {lesson.title}
                                </span>
                                {lesson.type === 'poem' && (
                                  <span className="text-[8px] text-rose-500 font-extrabold mt-0.5 animate-pulse">
                                    ★ نشيد منسق بنفس طريقة المنهج السوداني
                                  </span>
                                )}
                              </div>
                            </div>

                            {hasCompleted && (
                              <span className="p-0.5 bg-emerald-500 text-white rounded-full ml-2">
                                <Check className="h-2.5 w-2.5" />
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
          </motion.div>
        ) : (
          <motion.div
            key="lesson-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-6 pt-4 animate-none"
          >
          {/* Right Side: Core Reading Experience */}
        <div className="w-full space-y-6">
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
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
              {/* Back button */}
              <button
                onClick={() => {
                  setIsReadingMode(false);
                  handleStopSpeaking();
                }}
                className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-800 border border-slate-200/80 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 space-x-reverse cursor-pointer shadow-sm"
                title="الرجوع إلى صفحة الوحدات والدروس"
              >
                <ArrowRight className="h-4 w-4" />
                <span>رجوع للدروس</span>
              </button>

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

                            {(selectedLesson.videoUrl || selectedLesson.driveVideoUrl) && (
                              <button
                                id="btn-flipbook-watch-video"
                                onClick={() => setIsMaximizedVideo(true)}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all flex items-center space-x-1.5 space-x-reverse shadow-md border border-amber-500/20"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                <span>تشغيل الفيديو التعليمي المرفق</span>
                              </button>
                            )}

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
                                        {renderClickableWords(verse.sadr, true)}
                                      </div>
                                      {verse.ajuz && (
                                        <div className="my-1 sm:my-0 text-amber-500 text-xs shrink-0">✦</div>
                                      )}
                                      <div className={`text-left font-medium w-full sm:w-[45%] text-sm sm:text-base leading-relaxed sm:text-right ${isNightMode ? 'text-zinc-200' : 'text-natural-dark'}`}>
                                        {renderClickableWords(verse.ajuz, true)}
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
                                  {renderClickableWords(getFlipbookPages(selectedLesson)[Math.min(flipbookPage, getFlipbookPages(selectedLesson).length - 1)].elements.text, false)}
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
                <AnimatePresence mode="wait">
                {/* Reading Text Tab */}
                {activeSubTab === 'text' && (
                  <motion.div
                    key="subtab-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Lesson Banner Image or Video Player */}
                    {(selectedLesson.videoUrl || selectedLesson.driveVideoUrl) ? (
                      <VideoPlayer
                        videoUrl={selectedLesson.videoUrl}
                        driveVideoUrl={selectedLesson.driveVideoUrl}
                        videoSource={videoSource}
                        onChangeVideoSource={setVideoSource}
                        isNightMode={isNightMode}
                        onMaximize={() => setIsMaximizedVideo(true)}
                        title={selectedLesson.title}
                        isMaximized={isMaximizedVideo}
                      />
                    ) : (
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
                    )}

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
                              {renderClickableWords(verse.sadr, true)}
                            </div>
                            
                            {/* Decorative divider */}
                            {verse.ajuz && (
                              <div className="my-2 sm:my-0 text-amber-500 text-xs shrink-0 select-none">
                                ✦
                              </div>
                            )}
                            
                            {/* العجز (Left Column) */}
                            <div className={`text-left font-medium w-full sm:w-[45%] text-lg select-text sm:text-right ${isNightMode ? 'text-zinc-200' : 'text-natural-dark'}`}>
                              {renderClickableWords(verse.ajuz, true)}
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
                        {renderClickableWords(selectedLesson.text, false)}
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
                  </motion.div>
                )}

                {/* Vocabulary Tab */}
                {activeSubTab === 'vocabulary' && (
                  <motion.div
                    key="subtab-vocabulary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
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
                  </motion.div>
                )}

                {/* Grammar Focus Tab */}
                {activeSubTab === 'grammar' && selectedLesson.grammarFocus && (
                  <motion.div
                    key="subtab-grammar"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
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
                  </motion.div>
                )}
                </AnimatePresence>
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

              {nextLesson && (
                <button
                  onClick={() => {
                    setSelectedLesson(nextLesson);
                    setActiveSubTab('text');
                    handleStopSpeaking();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold transition-all flex items-center shadow-md cursor-pointer border border-teal-500/20"
                  title={`الدرس التالي: ${nextLesson.title}`}
                >
                  <span>الدرس التالي</span>
                  <ChevronLeft className="h-4 w-4 mr-1.5" />
                </button>
              )}
            </div>
          </div>
        </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Maximized Video Overlay inside Web Window */}
      <AnimatePresence>
        {isMaximizedVideo && (selectedLesson.videoUrl || selectedLesson.driveVideoUrl) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col justify-center items-center p-4 text-right"
          >
            <div className="w-full max-w-5xl flex flex-col space-y-4">
              {/* Header inside overlay */}
              <div className="flex items-center justify-between text-white border-b border-white/10 pb-3 flex-row-reverse">
                <div className="text-right">
                  <span className="text-[10px] bg-amber-600 text-white px-2.5 py-0.5 rounded-full font-bold">
                    عرض الفيديو التعليمي المكبر {videoSource === 'youtube' ? '(يوتيوب)' : '(جوجل درايف)'}
                  </span>
                  <h4 className="font-serif font-bold text-lg mt-1">{selectedLesson.title}</h4>
                </div>
                
                <div className="flex items-center space-x-3 space-x-reverse flex-row-reverse">
                  <button
                    id="btn-close-maximized-video"
                    onClick={() => setIsMaximizedVideo(false)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 space-x-reverse shadow-lg"
                  >
                    <Minimize2 className="h-4 w-4" />
                    <span>تصغير الفيديو</span>
                  </button>

                  {/* Maximized Selector Option if drive is available */}
                  {selectedLesson.driveVideoUrl && selectedLesson.videoUrl && (
                    <div className="flex space-x-1.5 space-x-reverse bg-zinc-800/80 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => setVideoSource('youtube')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          videoSource === 'youtube'
                            ? 'bg-amber-600 text-white'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        يوتيوب
                      </button>
                      <button
                        onClick={() => setVideoSource('drive')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          videoSource === 'drive'
                            ? 'bg-amber-600 text-white'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        جوجل درايف
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Massive Video Body */}
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl">
                <iframe
                  src={videoSource === 'youtube' ? getYoutubeEmbedUrl(selectedLesson.videoUrl) : getDriveEmbedUrl(selectedLesson.driveVideoUrl)}
                  title="Video Player Full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  sandbox="allow-scripts allow-same-origin"
                  className="w-full h-full absolute inset-0"
                />
              </div>

              {/* Subtitle/Reminder */}
              <p className="text-center text-xs text-zinc-400 font-medium">
                تم دمج هذا المقطع التعليمي لتعزيز استيعاب الطالب للدرس من أكاديمية اللغة العربية التفاعلية.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Back Button (Visible in Reading Mode) */}
      {isReadingMode && (
        <div className="fixed bottom-24 left-6 z-45" dir="rtl">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsReadingMode(false);
              handleStopSpeaking();
            }}
            className="flex items-center justify-center space-x-1.5 space-x-reverse px-5 py-3 rounded-full bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-xl shadow-slate-900/30 border border-white/10 cursor-pointer font-bold text-xs"
            title="الرجوع إلى صفحة الوحدات والدروس"
          >
            <ArrowRight className="h-4 w-4 text-white" />
            <span>رجوع</span>
          </motion.button>
        </div>
      )}

      {/* Floating Grammar Icon inside Lesson Panel */}
      {selectedLesson.grammarFocus && (
        <div className="fixed bottom-24 right-6 z-30" dir="rtl">
          <motion.button
            id="btn-floating-grammar"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsGrammarOpen(true)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-xl shadow-teal-500/30 border border-white/20 cursor-pointer"
            title="استعرض قواعد ونحو هذا الدرس"
          >
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </motion.button>
        </div>
      )}

      {/* Grammar Modal Overlay */}
      <AnimatePresence>
        {isGrammarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGrammarOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-x-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg w-full bg-white dark:bg-zinc-900 border border-natural-border dark:border-zinc-800 rounded-3xl p-6 shadow-2xl z-50 overflow-hidden text-right"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-natural-border dark:border-zinc-800 pb-3 mb-4 flex-row-reverse">
                <button
                  onClick={() => setIsGrammarOpen(false)}
                  className="p-1 rounded-full hover:bg-natural-light dark:hover:bg-zinc-800 transition-colors text-natural-muted cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-2 space-x-reverse flex-row-reverse">
                  <Sparkles className="h-5 w-5 text-teal-600 animate-pulse mr-2" />
                  <h3 className="font-serif font-bold text-lg text-[#1E293B] dark:text-zinc-100">
                    قواعد ونحو: {selectedLesson.title.replace(/^الدرس \w+\: /, '')}
                  </h3>
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[60vh] pl-1">
                <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-4">
                  <h4 className="font-bold text-teal-800 dark:text-teal-500 text-xs mb-2">القاعدة الذهبية للدرس:</h4>
                  <p className="text-sm font-bold text-natural-dark dark:text-zinc-200 leading-relaxed whitespace-pre-line">
                    {selectedLesson.grammarFocus}
                  </p>
                </div>

                <div className="border border-natural-border dark:border-zinc-800 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-teal-600 text-xs">💡 كبسولة تعليمية سريعة:</h4>
                  <p className="text-xs text-natural-text dark:text-zinc-400 leading-relaxed">
                    تم استخلاص هذه القواعد والتدريبات النحوية بعناية من تدريبات الكتاب المدرسي المعتمد لجمهورية السودان لمساعدتك على إتقان مهارات الإعراب والبلاغة العربية.
                  </p>
                </div>
                
                <button
                  onClick={() => setIsGrammarOpen(false)}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-all shadow-md mt-2 cursor-pointer"
                >
                  فهمت القاعدة، العودة للدرس
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
