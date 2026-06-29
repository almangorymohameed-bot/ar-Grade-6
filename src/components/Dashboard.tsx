import React from 'react';
import { Award, BookOpen, Star, Sparkles, CheckCircle2, ChevronRight, Trophy, Shield, HelpCircle, Send, AlertCircle, Calendar } from 'lucide-react';
import { curriculumData } from '../data/curriculum';

// Helper to normalize Arabic characters for robust search matching
function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u0652]/g, "") // Remove Tashkeel (diacritics)
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();
}

interface ScoreRecord {
  lessonId: string;
  lessonTitle: string;
  score: number;
  total: number;
  date: string;
}

interface DashboardProps {
  completedLessons: string[];
  quizScores: { [lessonId: string]: { score: number; total: number } };
  recentScores: ScoreRecord[];
  points: number;
  onAwardPoints: (amount: number) => void;
  onNavigateToTab: (tab: string) => void;
}

// Daily Parsing Challenges list
const dailyChallenges = [
  {
    word: "الغلامُ",
    sentence: "ذبحَ الغلامُ الغنمَ بأسرِها.",
    hint: "من الذي قام بالذبح؟ فكّر في أركان الجملة الفعلية وحركة الضم على آخر الكلمة.",
    ideal: "فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.",
    keywords: ["فاعل", "مرفوع", "ضمة"],
    points: 50,
    explanation: "الغلامُ: فاعل مرفوع بالضمة الظاهرة لأنه هو من قام بفعل الذبح في الجملة الفعلية."
  },
  {
    word: "شمسٌ",
    sentence: "الحريةُ شمسٌ يجبُ أن تشرقَ في كلِّ نفسٍ.",
    hint: "جملة اسمية تبدأ بـ 'الحريةُ' (مبتدأ)، فما الذي يخبرنا عن حالها ويتمم معنى الجملة؟",
    ideal: "خبر المبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره.",
    keywords: ["خبر", "مرفوع", "ضمة"],
    points: 50,
    explanation: "شمسٌ: خبر المبتدأ مرفوع وعلامة رفعه الضمة الظاهرة، حيث تمم الفائدة مع المبتدأ (الحرية)."
  },
  {
    word: "مواءً",
    sentence: "تموءُ الهرةُ مواءً لطيفاً في الصباحِ.",
    hint: "اسم منصوب مشتق من نفس لفظ الفعل (تموءُ) لتوكيد حصول الفعل وله أنواع.",
    ideal: "مفعول مطلق منصوب وعلامة نصبه الفتحة الظاهرة على آخره.",
    keywords: ["مطلق", "منصوب", "فتحة"],
    points: 50,
    explanation: "مواءً: مفعول مطلق منصوب وعلامة نصبه الفتحة لأنه مصدر منصوب مشتق من لفظ الفعل (تموء)."
  },
  {
    word: "سجدتينِ",
    sentence: "سجدتُ لله سجدتينِ خاشعتينِ في جوفِ الليلِ.",
    hint: "مفعول مطلق يبيّن عدد مرات الفعل. انتبه لعلامة نصب المثنى (الياء)!",
    ideal: "مفعول مطلق منصوب وعلامة نصبه الياء لأنه مثنى.",
    keywords: ["مطلق", "منصوب", "ياء", "مثنى"],
    points: 50,
    explanation: "سجدتينِ: مفعول مطلق مبين للعدد منصوب وعلامة نصبه الياء لأنه مثنى."
  },
  {
    word: "ماهرونَ",
    sentence: "الناجحونَ ماهرونَ في أعمالِهم المدرسيةِ.",
    hint: "خبر مبتدأ لجمع مذكر سالم. ما هي علامة رفع جمع المذكر السالم؟",
    ideal: "خبر المبتدأ مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم.",
    keywords: ["خبر", "مرفوع", "واو", "جمع"],
    points: 50,
    explanation: "ماهرونَ: خبر المبتدأ مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم."
  },
  {
    word: "رجلٌ",
    sentence: "سألَ رجلٌ حاتماً الطائيَّ عن الكرمِ.",
    hint: "من الذي قام بالسؤال؟ فكر في موقعه وحركة تنوين الضم.",
    ideal: "فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.",
    keywords: ["فاعل", "مرفوع", "ضمة"],
    points: 50,
    explanation: "رجلٌ: فاعل مرفوع بالضمة الظاهرة لأنه من قام بفعل السؤال."
  },
  {
    word: "المياهِ",
    sentence: "يجبُ علينا ترشيدُ استهلاكِ المياهِ الصالحةِ.",
    hint: "اسم معرفة مجرور أضيف إلى اسم نكرة قبله (استهلاك) ليوضحه ويحدده.",
    ideal: "مضاف إليه مجرور وعلامة جره الكسرة الظاهرة على آخره.",
    keywords: ["مضاف", "مجرور", "كسرة"],
    points: 50,
    explanation: "المياهِ: مضاف إليه مجرور بالكسرة الظاهرة لأنه يحدد ويوضح كلمة (استهلاك)."
  }
];

export default function Dashboard({ completedLessons, quizScores, recentScores, points, onAwardPoints, onNavigateToTab }: DashboardProps) {
  // Daily Challenge State & Logic
  const todayKey = new Date().toDateString();
  const challengeIndex = new Date().getDate() % dailyChallenges.length;
  const challenge = dailyChallenges[challengeIndex];

  const [challengeAns, setChallengeAns] = React.useState('');
  const [challengeSubmitted, setChallengeSubmitted] = React.useState(false);
  const [challengeSuccess, setChallengeSuccess] = React.useState(false);
  const [pointsEarned, setPointsEarned] = React.useState(0);
  const [showHint, setShowHint] = React.useState(false);

  React.useEffect(() => {
    const savedDate = localStorage.getItem('ar_challenge_date');
    const savedSubmitted = localStorage.getItem('ar_challenge_submitted');
    const savedSuccess = localStorage.getItem('ar_challenge_success');
    const savedUserAns = localStorage.getItem('ar_challenge_user_ans');
    const savedPointsEarned = localStorage.getItem('ar_challenge_points_earned');

    if (savedDate === todayKey) {
      if (savedSubmitted === 'true') {
        setChallengeSubmitted(true);
      }
      if (savedSuccess === 'true') {
        setChallengeSuccess(true);
      }
      if (savedUserAns) {
        setChallengeAns(savedUserAns);
      }
      if (savedPointsEarned) {
        setPointsEarned(parseInt(savedPointsEarned, 10));
      }
    } else {
      // Clear for a new day
      localStorage.removeItem('ar_challenge_submitted');
      localStorage.removeItem('ar_challenge_success');
      localStorage.removeItem('ar_challenge_user_ans');
      localStorage.removeItem('ar_challenge_points_earned');
    }
  }, [todayKey]);

  const handleSubmitChallenge = () => {
    if (!challengeAns.trim()) return;

    const normalizedAns = normalizeArabic(challengeAns);
    
    // Check how many keywords match
    let matchesCount = 0;
    challenge.keywords.forEach(keyword => {
      if (normalizedAns.includes(normalizeArabic(keyword))) {
        matchesCount++;
      }
    });

    const isCorrect = matchesCount >= 2;
    const pts = isCorrect ? challenge.points : 20; // 50 pts if correct, 20 pts encouragement if tried!

    setChallengeSubmitted(true);
    setChallengeSuccess(isCorrect);
    setPointsEarned(pts);

    localStorage.setItem('ar_challenge_date', todayKey);
    localStorage.setItem('ar_challenge_submitted', 'true');
    localStorage.setItem('ar_challenge_success', isCorrect ? 'true' : 'false');
    localStorage.setItem('ar_challenge_user_ans', challengeAns);
    localStorage.setItem('ar_challenge_points_earned', pts.toString());

    onAwardPoints(pts);
  };

  const renderSentenceWithHighlight = (sentence: string, targetWord: string) => {
    const parts = sentence.split(targetWord);
    if (parts.length === 2) {
      return (
        <span className="text-sm sm:text-base text-natural-dark font-serif font-bold leading-relaxed">
          {parts[0]}
          <span className="bg-amber-100 text-natural-accent border border-amber-200 px-2 py-0.5 rounded-lg font-bold underline decoration-2 underline-offset-4 decoration-amber-500 transition-all inline-block mx-1">
            {targetWord}
          </span>
          {parts[1]}
        </span>
      );
    }
    return <span className="text-sm sm:text-base text-natural-dark font-serif font-bold">{sentence}</span>;
  };

  // Statistics Calculations
  const totalLessonsCount = curriculumData.reduce((acc, unit) => acc + unit.lessons.length, 0);
  const readProgressPercent = Math.min(Math.round((completedLessons.length / totalLessonsCount) * 100), 100);

  // Quiz calculations
  const attemptedQuizzes = Object.keys(quizScores).length;
  let averageQuizScore = 0;
  if (attemptedQuizzes > 0) {
    let sumPercentage = 0;
    Object.values(quizScores).forEach((q) => {
      sumPercentage += (q.score / q.total) * 100;
    });
    averageQuizScore = Math.round(sumPercentage / attemptedQuizzes);
  }

  // Grammar Proficiency (simulate based on grammar quiz questions)
  const grammarProficiency = Math.min(25 + attemptedQuizzes * 15, 100);

  // Awards/Badges
  const badges = [
    {
      id: 'b1',
      title: 'قارئ المنهج',
      desc: 'قراءة أول درس بالكامل في الكتاب المدرسى',
      icon: BookOpen,
      unlocked: completedLessons.length > 0,
      color: 'bg-natural-accent text-white',
    },
    {
      id: 'b2',
      title: 'فارس القواعد',
      desc: 'حصول على 80% في أي اختبار قواعد',
      icon: Shield,
      unlocked: Object.values(quizScores).some(q => (q.score / q.total) >= 0.8),
      color: 'bg-natural-accent text-white',
    },
    {
      id: 'b3',
      title: 'صديق حاتم الطائي',
      desc: 'إتمام الدرس الأول واختباره بنجاح',
      icon: Trophy,
      unlocked: completedLessons.includes('u1-l1') && quizScores['u1-l1'] !== undefined,
      color: 'bg-natural-accent text-white',
    },
    {
      id: 'b4',
      title: 'اللغوي الفصيح',
      desc: 'إنهاء قراءة 5 دروس واجتياز 3 اختبارات لغوية',
      icon: Sparkles,
      unlocked: completedLessons.length >= 5 && attemptedQuizzes >= 3,
      color: 'bg-natural-accent text-white',
    },
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-natural-bg text-natural-text min-h-screen transition-all">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-natural-accent text-white p-6 sm:p-8 border border-natural-accent shadow-md">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute left-10 bottom-0 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <span className="bg-white/15 text-white/90 text-xs px-3.5 py-1 rounded-full font-bold border border-white/20">لوحة المتابعة المدرسية</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white mt-2 leading-tight">أهلاً بك في منصتك التفاعلية!</h2>
            <p className="text-white/80 text-xs mt-1 sm:max-w-xl font-medium">
              تصفح دروس المنهج، اختبر فهمك وحصّل إنجازات جديدة، واستعن بالمعلم الذكي لإعراب الجمل الصعبة في أي وقت.
            </p>
          </div>
          <div className="flex space-x-3 space-x-reverse self-start md:self-center">
            <button 
              onClick={() => onNavigateToTab('curriculum')}
              className="px-5 py-2.5 bg-white text-natural-accent hover:bg-natural-light rounded-xl text-xs font-bold shadow-md transition-all flex items-center"
            >
              ابدأ المنهج الدراسي
              <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
            </button>
            <button 
              onClick={() => onNavigateToTab('tutor')}
              className="px-5 py-2.5 bg-natural-accent-hover text-white border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center"
            >
              اسأل المعلم
              <Sparkles className="h-4 w-4 mr-1.5 text-white/80" />
            </button>
          </div>
        </div>
      </div>

      {/* Daily Parsing Challenge Card ("تحدي الإعراب اليومي") */}
      <div className="bg-white border-2 border-amber-200/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute left-0 top-0 h-32 w-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 border-b border-natural-border pb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-amber-100 p-2.5 rounded-2xl border border-amber-200 text-amber-600 animate-bounce">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-natural-dark flex items-center">
                تحدي الإعراب اليومي
                <span className="mr-2 text-[10px] bg-red-100 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-bold">نشط اليوم</span>
              </h3>
              <p className="text-natural-muted text-xs mt-1 font-medium">أعرب الكلمة المحددة باللون البرتقالي لتكسب نقاط التميز اليومية!</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl self-start sm:self-center">
            <Calendar className="h-4 w-4 text-amber-600" />
            <span className="text-xs text-amber-800 font-bold font-mono">
              تحدي {new Date().toLocaleDateString('ar-SD', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Challenge Sentence Panel */}
        <div className="bg-amber-50/30 border border-amber-100/80 p-5 rounded-2xl space-y-3 text-right">
          <span className="text-[10px] text-amber-700 bg-amber-100/50 px-2.5 py-0.5 rounded-full font-bold">الجملة المقترحة</span>
          <div className="py-2">
            {renderSentenceWithHighlight(challenge.sentence, challenge.word)}
          </div>
        </div>

        {/* Input and Action Bar */}
        {!challengeSubmitted ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="input-challenge-ans"
                type="text"
                value={challengeAns}
                onChange={(e) => setChallengeAns(e.target.value)}
                placeholder={`أعرب كلمة "${challenge.word}" هنا... (مثال: فاعل مرفوع بالضمة الظاهرة)`}
                className="flex-1 bg-natural-light border-2 border-natural-border rounded-xl px-4 py-3.5 text-xs text-natural-dark font-semibold focus:outline-none focus:border-amber-400 transition-all text-right"
                dir="rtl"
              />
              <button
                id="btn-challenge-submit"
                onClick={handleSubmitChallenge}
                disabled={!challengeAns.trim()}
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse shrink-0 shadow-sm"
              >
                <Send className="h-4 w-4 ml-2" />
                <span>إرسال الإجابة للتقييم</span>
              </button>
            </div>

            {/* Hint toggler */}
            <div>
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-natural-accent hover:text-natural-accent-hover font-bold flex items-center"
              >
                <HelpCircle className="h-4 w-4 ml-1.5 text-natural-accent/80" />
                {showHint ? 'إخفاء تلميح المساعدة النحوية' : 'طلب تلميح نحوي للمساعدة 💡'}
              </button>
              
              {showHint && (
                <div className="mt-2.5 bg-natural-light border border-natural-border/70 p-4 rounded-xl text-xs text-natural-dark leading-relaxed font-medium">
                  💡 <strong>تلميح المعلم:</strong> {challenge.hint}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Submitted State */
          <div className="space-y-4">
            {challengeSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start space-x-3 space-x-reverse">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="mr-3">
                  <h4 className="font-bold text-emerald-800 text-xs">إجابة نموذجية ومكتملة! 🎉</h4>
                  <p className="text-emerald-700 text-xs mt-1 font-medium leading-relaxed">
                    عمل مدهش يا بطل! لقد وافقت قواعد الإعراب بشكل دقيق. تم إضافة <strong className="font-mono font-bold text-sm bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800">+{pointsEarned}</strong> نقطة إلى رصيدك!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3 space-x-reverse">
                <div className="bg-amber-100 p-2 rounded-xl text-amber-600 shrink-0">
                  <Sparkles className="h-5 w-5 text-amber-500 fill-amber-300" />
                </div>
                <div className="mr-3">
                  <h4 className="font-bold text-amber-800 text-xs">محاولة رائعة ومشكورة! 🌟</h4>
                  <p className="text-amber-700 text-xs mt-1 font-medium leading-relaxed">
                    شكراً على محاولتك ومثابرتك! الإعراب مهارة تحتاج للتدريب المستمر. لقد حصلت على <strong className="font-mono font-bold text-sm bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">+{pointsEarned}</strong> نقطة لمشاركتك الجادة!
                  </p>
                </div>
              </div>
            )}

            {/* Detailed Explanations */}
            <div className="bg-natural-light/60 border border-natural-border/80 p-5 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-natural-border/50">
                <div className="pb-3 md:pb-0">
                  <span className="text-[10px] text-natural-muted font-bold block mb-1">إجابتك المكتوبة:</span>
                  <span className="text-xs text-natural-dark font-bold font-mono bg-white border px-3 py-1.5 rounded-lg inline-block">
                    {challengeAns}
                  </span>
                </div>
                <div className="pt-3 md:pt-0 md:pr-4">
                  <span className="text-[10px] text-amber-800 font-bold block mb-1">الإعراب النموذجي المعتمد:</span>
                  <span className="text-xs text-emerald-800 font-bold font-serif">
                    {challenge.ideal}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-natural-border/40 text-xs leading-relaxed text-natural-text font-medium">
                <strong>📝 شرح وتوجيه المعلم الذكي:</strong> {challenge.explanation}
              </div>
            </div>
            
            <p className="text-[10px] text-natural-muted font-bold text-center">⏳ انتظر تحدي الإعراب القادم غداً لتجمع المزيد من النقاط وتتفوق في قواعد اللغة العربية!</p>
          </div>
        )}
      </div>

      {/* Main Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SVG Circular Progress Card */}
        <div className="bg-white p-6 rounded-3xl border border-natural-border flex flex-col items-center justify-center text-center shadow-sm">
          <h3 className="text-xs font-bold text-natural-muted uppercase mb-4 self-start tracking-wider">إتمام قراءة المنهج</h3>
          
          <div className="relative h-40 w-40 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="absolute transform -rotate-90" width="150" height="150">
              <circle
                cx="75"
                cy="75"
                r="60"
                className="stroke-natural-light"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="75"
                cy="75"
                r="60"
                className="stroke-natural-accent transition-all duration-1000 ease-out"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 * (1 - readProgressPercent / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center z-10">
              <span className="text-3xl font-extrabold text-natural-dark font-mono">{readProgressPercent}%</span>
              <p className="text-[10px] text-natural-muted font-bold mt-0.5">مكتمل</p>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-natural-text font-medium">
            تمت قراءة <span className="text-natural-accent font-bold">{completedLessons.length}</span> من أصل <span className="font-bold">{totalLessonsCount}</span> درساً رسمياً.
          </div>
        </div>

        {/* SVG Quiz Mastery Card */}
        <div className="bg-white p-6 rounded-3xl border border-natural-border flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xs font-bold text-natural-muted uppercase mb-2 tracking-wider">معدل التحصيل والاختبارات</h3>
            <div className="flex items-baseline space-x-2 space-x-reverse mt-2">
              <span className="text-4xl font-extrabold text-natural-accent font-mono">{averageQuizScore}%</span>
              <span className="text-xs text-natural-muted font-bold">متوسط الدرجات</span>
            </div>
          </div>

          {/* Simple Custom SVG Bar Chart */}
          <div className="h-28 flex items-end space-x-3 space-x-reverse justify-around mt-4 pb-2 border-b border-natural-border">
            {['الوحدة 1', 'الوحدة 2', 'الوحدة 3', 'الوحدة 4', 'الوحدة 5'].map((name, i) => {
              const heights = [75, 45, averageQuizScore || 20, 30, attemptedQuizzes * 25];
              const h = Math.min(Math.max(heights[i], 10), 100);
              return (
                <div key={name} className="flex flex-col items-center flex-1 group">
                  <div className="w-full bg-natural-light rounded-t-lg h-20 relative flex items-end overflow-hidden">
                    <div 
                      className="w-full bg-natural-accent/80 rounded-t-lg transition-all duration-700" 
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-natural-muted mt-1.5">{name}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs text-natural-text font-medium mt-3">
            <span>محاولات الاختبار: <strong className="text-natural-dark">{attemptedQuizzes}</strong></span>
            <span>التقدير العام: <strong className="text-natural-accent">{averageQuizScore >= 85 ? 'ممتاز' : averageQuizScore >= 70 ? 'جيد جداً' : attemptedQuizzes > 0 ? 'مقبول' : 'لم يبدأ'}</strong></span>
          </div>
        </div>

        {/* Grammar proficiency card */}
        <div className="bg-white p-6 rounded-3xl border border-natural-border flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xs font-bold text-natural-muted uppercase mb-2 tracking-wider">التمكن النحوي والإعراب</h3>
            <div className="flex items-center space-x-2 space-x-reverse mt-2">
              <span className="text-4xl font-extrabold text-natural-accent font-mono">{grammarProficiency}%</span>
              <span className="text-xs bg-natural-accent/10 text-natural-accent border border-natural-accent/20 px-2 py-0.5 rounded font-bold">متقدم</span>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-natural-text">الجملة الاسمية (مبتدأ وخبر)</span>
                <span className="text-natural-accent">ممتاز</span>
              </div>
              <div className="w-full bg-natural-light h-1.5 rounded-full">
                <div className="bg-natural-accent h-1.5 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-natural-text">الجملة الفعلية (فاعل ومفعول به)</span>
                <span className="text-natural-accent">جيد جداً</span>
              </div>
              <div className="w-full bg-natural-light h-1.5 rounded-full">
                <div className="bg-natural-accent h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-natural-text">المنصوبات (المفعول المطلق)</span>
                <span className="text-natural-accent">متوسط</span>
              </div>
              <div className="w-full bg-natural-light h-1.5 rounded-full">
                <div className="bg-natural-accent h-1.5 rounded-full" style={{ width: `${Math.max(30, attemptedQuizzes * 15)}%` }}></div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-natural-muted font-medium mt-4 text-center">يتحسن المستوى مع إتمام المزيد من اختبارات الإعراب والتدريبات اللغوية.</p>
        </div>
      </div>

      {/* Badges & Unlocked Trophies Section */}
      <div className="bg-white p-6 rounded-3xl border border-natural-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Trophy className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-bold text-natural-dark font-serif">الأوسمة والجوائز المدرسية</h3>
          </div>
          <span className="text-xs text-natural-muted font-bold">
            تم فتح <strong className="text-natural-accent">{badges.filter(b => b.unlocked).length}</strong> من أصل <strong className="text-natural-dark">4</strong> أوسمة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div 
                key={badge.id} 
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between h-36 ${
                  badge.unlocked 
                    ? 'bg-natural-light/60 border-natural-border shadow-sm hover:border-natural-accent/40' 
                    : 'bg-natural-light/30 border-dashed border-natural-border/60 opacity-40 select-none'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${badge.unlocked ? `bg-natural-accent text-white shadow-sm` : 'bg-natural-border text-natural-muted'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {badge.unlocked ? (
                    <span className="text-[9px] bg-natural-accent/10 text-natural-accent border border-natural-accent/20 px-2.5 py-0.5 rounded-full font-bold">مكتمل</span>
                  ) : (
                    <span className="text-[9px] bg-natural-border text-natural-muted px-2.5 py-0.5 rounded-full font-bold">مغلق</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-natural-dark">{badge.title}</h4>
                  <p className="text-[11px] text-natural-muted mt-0.5 leading-relaxed font-medium">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History and Active Practice section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Performance Log */}
        <div className="bg-white p-6 rounded-3xl border border-natural-border lg:col-span-2 shadow-sm">
          <h3 className="text-base font-bold text-natural-dark font-serif mb-4 flex items-center">
            <CheckCircle2 className="h-5 w-5 text-natural-accent ml-2" />
            سجل الاختبارات ومستوى الفهم القرائي
          </h3>

          {recentScores.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-natural-light border border-dashed border-natural-border">
              <Award className="h-10 w-10 text-natural-muted mb-2" />
              <p className="text-xs text-natural-text font-bold">لا توجد اختبارات مسجلة حتى الآن.</p>
              <button 
                onClick={() => onNavigateToTab('quizzes')}
                className="mt-3 text-[11px] bg-natural-accent text-white hover:bg-natural-accent-hover px-4 py-2 rounded-xl font-bold transition-all shadow-sm"
              >
                توجّه لساحة الاختبارات الآن
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-natural-border text-natural-muted text-xs font-bold pb-2">
                    <th className="py-2">اسم الدرس والوحدة</th>
                    <th className="py-2 text-center">الدرجة</th>
                    <th className="py-2 text-center">النسبة</th>
                    <th className="py-2 text-left">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-natural-border/50 text-xs font-medium">
                  {recentScores.map((record, index) => {
                    const percent = Math.round((record.score / record.total) * 100);
                    return (
                      <tr key={index} className="hover:bg-natural-light/40 transition-colors">
                        <td className="py-3 font-bold text-natural-dark">{record.lessonTitle}</td>
                        <td className="py-3 text-center font-mono font-bold text-natural-text">{record.score} / {record.total}</td>
                        <td className="py-3 text-center">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                            percent >= 85 ? 'bg-natural-accent/15 text-natural-accent border border-natural-accent/20' :
                            percent >= 65 ? 'bg-amber-600/10 text-amber-700 border border-amber-600/20' :
                            'bg-rose-600/10 text-rose-700 border border-rose-600/20'
                          }`}>
                            {percent}%
                          </span>
                        </td>
                        <td className="py-3 text-left text-natural-muted text-[10px] font-mono">{record.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Daily tip / Grammar Spotlight */}
        <div className="bg-white p-6 rounded-3xl border border-natural-border flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <div className="bg-natural-accent/10 p-1.5 rounded-xl border border-natural-accent/20">
                <Sparkles className="h-4 w-4 text-natural-accent" />
              </div>
              <h4 className="font-bold text-xs text-natural-dark uppercase tracking-wider">فائدة نحوية اليوم</h4>
            </div>
            <h5 className="font-bold text-natural-accent text-sm mb-1 font-serif">المفعول المطلق</h5>
            <p className="text-xs text-natural-text leading-relaxed font-medium">
              هو اسم منصوب يُشتق من لفظ الفعل نفسه (مصدر) ليؤكده أو يبين نوعه أو عدده. 
              <br/><br/>
              <strong>مثال مؤكد للفعل:</strong> "تموء الهرة مواءً"
              <br/>
              <strong>مثال مبين للنوع:</strong> "أحببتُ المعرضَ إعجاباً كبيراً"
              <br/>
              <strong>مثال مبين للعدد:</strong> "سجدتُ لله سجدتينِ"
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-natural-border flex items-center justify-between">
            <span className="text-[10px] text-natural-muted font-bold">منهج الصف السادس</span>
            <button 
              onClick={() => onNavigateToTab('tutor')}
              className="text-xs text-natural-accent hover:text-natural-accent-hover font-bold flex items-center"
            >
              ناقش الإعراب مع المعلم
              <ChevronRight className="h-3 w-3 mr-0.5 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
