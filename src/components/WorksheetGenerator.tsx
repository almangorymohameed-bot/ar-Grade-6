import React, { useState, useEffect } from 'react';
import { curriculumData, Lesson, Unit, QuizQuestion, Vocabulary } from '../data/curriculum';
import { 
  FileText, Printer, CheckCircle, RefreshCw, Star, ArrowRight, Eye, 
  HelpCircle, Sparkles, Check, X, ShieldAlert, Award, Lock, Unlock, EyeOff 
} from 'lucide-react';

interface WorksheetGeneratorProps {
  favoriteLessons: string[];
  completedLessons: string[];
  onToggleFavorite: (lessonId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

interface WorksheetQuestion {
  id: string;
  lessonId: string;
  lessonTitle: string;
  type: 'multiple-choice' | 'matching' | 'fill-blank' | 'true-false';
  question: string;
  options?: string[]; // For MCQ
  answer: string; // Correct answer
  pairs?: { [key: string]: string }; // For Matching { word: definition }
  matchedPairs?: { [key: string]: string }; // Shuffled pairs for presentation
  explanation: string;
}

export default function WorksheetGenerator({ 
  favoriteLessons, 
  completedLessons,
  onToggleFavorite,
  onNavigateToTab 
}: WorksheetGeneratorProps) {
  // Config States
  const [scope, setScope] = useState<'all' | 'favorites' | 'unit' | 'lesson'>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<string>(curriculumData[0].id);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(curriculumData[0].lessons[0].id);
  
  const [qTypes, setQTypes] = useState<{
    mcq: boolean;
    trueFalse: boolean;
    fillBlank: boolean;
    matching: boolean;
  }>({
    mcq: true,
    trueFalse: true,
    fillBlank: true,
    matching: true,
  });

  const [pageCount, setPageCount] = useState<number>(2); // 1 to 20 pages
  const [isWatermarkRemoved, setIsWatermarkRemoved] = useState<boolean>(false);
  const [watermarkPassword, setWatermarkPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);

  // Active Worksheet State
  const [generated, setGenerated] = useState<boolean>(false);
  const [worksheetPages, setWorksheetPages] = useState<WorksheetQuestion[][]>([]);
  const [interactiveMode, setInteractiveMode] = useState<boolean>(false);
  
  // Interactive answers tracking
  // Key: question_id, Value: user answer (string for mcq/blank/tf, or object for matching)
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: any }>({});
  const [isGraded, setIsGraded] = useState<boolean>(false);
  const [scorePercent, setScorePercent] = useState<number>(0);

  // Helper selectors
  const selectedUnit = curriculumData.find(u => u.id === selectedUnitId) || curriculumData[0];
  const allLessons = curriculumData.reduce((acc, unit) => [...acc, ...unit.lessons], [] as Lesson[]);
  const favoriteLessonsDetails = allLessons.filter(l => favoriteLessons.includes(l.id));

  // Auto update lesson selection when unit changes
  useEffect(() => {
    if (selectedUnit) {
      setSelectedLessonId(selectedUnit.lessons[0].id);
    }
  }, [selectedUnitId]);

  // Generate the worksheets!
  const handleGenerate = () => {
    // 1. Gather all target lessons based on scope
    let targetLessons: Lesson[] = [];
    if (scope === 'all') {
      targetLessons = allLessons;
    } else if (scope === 'favorites') {
      targetLessons = favoriteLessonsDetails;
    } else if (scope === 'unit') {
      targetLessons = selectedUnit.lessons;
    } else if (scope === 'lesson') {
      const found = allLessons.find(l => l.id === selectedLessonId);
      if (found) targetLessons = [found];
    }

    if (targetLessons.length === 0) {
      alert('لم يتم العثور على أي دروس في النطاق المحدد!');
      return;
    }

    // 2. Extract or Synthesize Questions
    let pool: WorksheetQuestion[] = [];

    targetLessons.forEach(lesson => {
      // A. Extract predefined quiz questions
      lesson.quiz.forEach(q => {
        // Convert pre-defined grammar to MCQ
        if (q.type === 'multiple-choice' && qTypes.mcq) {
          pool.push({
            id: q.id,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            type: 'multiple-choice',
            question: q.question,
            options: q.options || [],
            answer: q.answer,
            explanation: q.explanation
          });
        } else if (q.type === 'grammar' && qTypes.mcq) {
          pool.push({
            id: q.id,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            type: 'multiple-choice',
            question: q.question,
            options: q.options || [],
            answer: q.answer,
            explanation: q.explanation
          });
        } else if (q.type === 'fill-blank' && qTypes.fillBlank) {
          pool.push({
            id: q.id,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            type: 'fill-blank',
            question: q.question,
            answer: q.answer,
            explanation: q.explanation
          });
        } else if (q.type === 'matching' && qTypes.matching && q.pairs) {
          pool.push({
            id: q.id,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            type: 'matching',
            question: q.question,
            pairs: q.pairs,
            answer: q.answer,
            explanation: q.explanation
          });
        }
      });

      // B. Synthesize questions dynamically from Vocabulary to populate
      if (lesson.vocabulary && lesson.vocabulary.length > 0) {
        // Dynamic True/False Questions
        if (qTypes.trueFalse) {
          lesson.vocabulary.forEach((vocab, index) => {
            // Generate a true statement
            pool.push({
              id: `${lesson.id}-tf-t-${index}`,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              type: 'true-false',
              question: `يُقصد بكلمة ( ${vocab.word} ) في المنهج الدراسي: " ${vocab.meaning} ".`,
              answer: 'صح',
              explanation: `صح، فمن قاموس معاني الكلمات بالدرس: ${vocab.word} تعني ${vocab.meaning}.`
            });

            // Generate a false statement with a different word's meaning
            const otherVocabs = allLessons
              .flatMap(l => l.vocabulary)
              .filter(v => v.word !== vocab.word);
            
            if (otherVocabs.length > 0) {
              const wrongVocab = otherVocabs[Math.floor(Math.random() * otherVocabs.length)];
              pool.push({
                id: `${lesson.id}-tf-f-${index}`,
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                type: 'true-false',
                question: `معنى كلمة ( ${vocab.word} ) لغوياً هو: " ${wrongVocab.meaning} ".`,
                answer: 'خطأ',
                explanation: `خطأ، بل معنى كلمة ( ${vocab.word} ) هو: "${vocab.meaning}". بينما "${wrongVocab.meaning}" هو معنى كلمة ( ${wrongVocab.word} ).`
              });
            }
          });
        }

        // Dynamic Vocabulary Fill-in-the-Blanks
        if (qTypes.fillBlank) {
          lesson.vocabulary.forEach((vocab, index) => {
            pool.push({
              id: `${lesson.id}-fb-v-${index}`,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              type: 'fill-blank',
              question: `مرادف ومعنى كلمة ( ${vocab.word} ) لغوياً هو: ___________________.`,
              answer: vocab.meaning,
              explanation: `المعنى والرد الصحيح لكلمة ( ${vocab.word} ) هو: "${vocab.meaning}".`
            });
          });
        }

        // Dynamic Vocabulary Matching (Combine up to 4 words into a matching question)
        if (qTypes.matching && lesson.vocabulary.length >= 3) {
          const vocabSlice = lesson.vocabulary.slice(0, 4);
          const pairs: { [key: string]: string } = {};
          vocabSlice.forEach(v => {
            pairs[v.word] = v.meaning;
          });

          pool.push({
            id: `${lesson.id}-match-vocab`,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            type: 'matching',
            question: 'صِلِ الكلماتِ اللغويّة في العمود (أ) بالمعنى الصحيحِ المطابِق في العمود (ب):',
            pairs: pairs,
            answer: Object.entries(pairs).map(([k, v]) => `${k} -> ${v}`).join(' | '),
            explanation: 'توصيل الكلمات بمعانيها اللغوية المذكورة في المعجم المدرسي لكل درس.'
          });
        }
      }
    });

    // Shuffle the pool for variety
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);

    if (shuffledPool.length === 0) {
      alert('لم يتم العثور على أي أسئلة تطابق المعايير المحددة! الرجاء تفعيل المزيد من أنواع الأسئلة.');
      return;
    }

    // 3. Page Distribution Algorithm (1 to 20 pages)
    // We aim for roughly 4-6 questions per page for A4 density, except Matching or TF which are condensed.
    // We strictly respect the user's selected "pageCount" (عدد الأوراق).
    const questionsPerPage = Math.max(3, Math.min(6, Math.ceil(shuffledPool.length / pageCount)));
    const pages: WorksheetQuestion[][] = [];

    for (let i = 0; i < pageCount; i++) {
      // Extract segment of questions
      const startIndex = i * questionsPerPage;
      let pageQuestions = shuffledPool.slice(startIndex, startIndex + questionsPerPage);
      
      // If we run out of unique questions and need to populate the requested 20 sheets:
      if (pageQuestions.length === 0 && i < pageCount) {
        // Clone and reuse questions with modified randomized ids to avoid state bugs
        const fillerCount = Math.min(questionsPerPage, shuffledPool.length);
        const fillers = shuffledPool.slice(0, fillerCount).map((q, idx) => ({
          ...q,
          id: `${q.id}-duplicate-p${i}-${idx}`
        }));
        pageQuestions = fillers;
      }

      // Pre-shuffle matching options so the matching isn't too obvious!
      const processedQuestions = pageQuestions.map(q => {
        if (q.type === 'matching' && q.pairs) {
          // Shuffled meanings for display
          const meanings = Object.values(q.pairs).sort(() => Math.random() - 0.5);
          const matchedPairs: { [key: string]: string } = {};
          Object.keys(q.pairs).forEach((key, index) => {
            matchedPairs[key] = meanings[index];
          });
          return {
            ...q,
            matchedPairs
          };
        }
        return q;
      });

      pages.push(processedQuestions);
    }

    setWorksheetPages(pages);
    setGenerated(true);
    setUserAnswers({});
    setIsGraded(false);
  };

  // Watermark removal logic
  const handleRemoveWatermark = (e: React.FormEvent) => {
    e.preventDefault();
    // Verify password strictly against 20302060
    if (watermarkPassword === '20302060') {
      setIsWatermarkRemoved(true);
      setWatermarkPassword('');
      setPasswordError('');
      setShowPasswordModal(false);
    } else {
      setPasswordError('كلمة المرور غير صحيحة! يرجى المحاولة مجدداً.');
    }
  };

  // Submit and Grade on-site immediately
  const handleGradeOnsite = () => {
    let totalScore = 0;
    let totalQuestionsGraded = 0;

    worksheetPages.forEach(page => {
      page.forEach(q => {
        if (q.type === 'matching' && q.pairs) {
          // Matching is graded as: each item correct is worth 1 point.
          const keys = Object.keys(q.pairs);
          let correctPairs = 0;
          keys.forEach(key => {
            const userSelection = userAnswers[`${q.id}-${key}`];
            if (userSelection === q.pairs![key]) {
              correctPairs++;
            }
          });
          totalScore += (correctPairs / keys.length);
          totalQuestionsGraded++;
        } else {
          const userAns = userAnswers[q.id]?.trim().toLowerCase();
          const correctAns = q.answer.trim().toLowerCase();
          
          if (userAns && (userAns === correctAns || correctAns.includes(userAns))) {
            totalScore += 1;
          }
          totalQuestionsGraded++;
        }
      });
    });

    const percent = Math.round((totalScore / totalQuestionsGraded) * 100);
    setScorePercent(percent);
    setIsGraded(true);

    // Scroll to grading section smoothly
    setTimeout(() => {
      document.getElementById('grading-banner')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-natural-bg text-natural-text min-h-screen">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-natural-border pb-4 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-natural-dark font-serif flex items-center">
            <FileText className="h-6 w-6 ml-2 text-natural-accent" />
            مُولِّد أوراق العمل والامتحانات الذكي
          </h2>
          <p className="text-natural-muted text-xs mt-1 font-medium">أداة تربوية متقدمة لتوليد أوراق عمل مخصصة بصيغة A4 للطباعة أو الحل التفاعلي المباشر</p>
        </div>
        
        {generated && (
          <button 
            onClick={() => setGenerated(false)}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-natural-accent hover:bg-natural-accent-hover text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <ArrowRight className="h-4 w-4 ml-1.5" />
            تعديل خيارات التوليد
          </button>
        )}
      </div>

      {!generated ? (
        /* Configuration Panel */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
          
          {/* Main settings card */}
          <div className="lg:col-span-2 bg-white border border-natural-border p-6 rounded-3xl space-y-6 shadow-sm">
            <h3 className="font-bold text-sm text-natural-dark font-serif flex items-center border-b border-natural-border pb-3">
              <Sparkles className="h-4 w-4 ml-2 text-natural-accent" />
              1. تهيئة أوراق العمل والامتحانات
            </h3>

            {/* Scope Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-natural-dark block">نطاق الأسئلة ومصدرها:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                    scope === 'all'
                      ? 'bg-natural-accent/10 border-natural-accent text-natural-accent'
                      : 'bg-white border-natural-border text-natural-muted hover:bg-natural-light'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>كامل المنهج</span>
                </button>

                <button
                  type="button"
                  disabled={favoriteLessons.length === 0}
                  onClick={() => setScope('favorites')}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                    favoriteLessons.length === 0 
                      ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400'
                      : scope === 'favorites'
                        ? 'bg-natural-accent/10 border-natural-accent text-natural-accent'
                        : 'bg-white border-natural-border text-natural-muted hover:bg-natural-light'
                  }`}
                  title={favoriteLessons.length === 0 ? "يجب تفضيل بعض الدروس أولاً من منهج القراءة لتفعيل هذا الخيار!" : ""}
                >
                  <Star className="h-4 w-4" />
                  <span>المفضلة ({favoriteLessons.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('unit')}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                    scope === 'unit'
                      ? 'bg-natural-accent/10 border-natural-accent text-natural-accent'
                      : 'bg-white border-natural-border text-natural-muted hover:bg-natural-light'
                  }`}
                >
                  <Award className="h-4 w-4" />
                  <span>وحدة محددة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('lesson')}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                    scope === 'lesson'
                      ? 'bg-natural-accent/10 border-natural-accent text-natural-accent'
                      : 'bg-white border-natural-border text-natural-muted hover:bg-natural-light'
                  }`}
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>درس محدد</span>
                </button>
              </div>
            </div>

            {/* Dynamic selectors for Unit/Lesson */}
            {scope === 'unit' && (
              <div className="p-4 bg-natural-light/60 border border-natural-border rounded-2xl space-y-2 animate-fadeIn">
                <label className="text-xs font-bold text-natural-dark block">اختر الوحدة المطلوبة:</label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full bg-white border border-natural-border rounded-xl px-3 py-2 text-xs font-bold text-natural-dark focus:outline-none focus:ring-1 focus:ring-natural-accent"
                >
                  {curriculumData.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      الوحدة {unit.number}: {unit.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {scope === 'lesson' && (
              <div className="p-4 bg-natural-light/60 border border-natural-border rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-dark block">الوحدة الحاضنة للدرس:</label>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full bg-white border border-natural-border rounded-xl px-3 py-2 text-xs font-bold text-natural-dark focus:outline-none focus:ring-1 focus:ring-natural-accent"
                  >
                    {curriculumData.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        الوحدة {unit.number}: {unit.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-natural-dark block">الدرس المستهدف بورقة العمل:</label>
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="w-full bg-white border border-natural-border rounded-xl px-3 py-2 text-xs font-bold text-natural-dark focus:outline-none focus:ring-1 focus:ring-natural-accent"
                  >
                    {selectedUnit.lessons.map(lesson => (
                      <option key={lesson.id} value={lesson.id}>
                        صفحة {lesson.page}: {lesson.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Question Types Configuration */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-natural-dark block">أنواع الأسئلة المدرجة:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="flex items-center p-3.5 bg-natural-light/40 border border-natural-border rounded-2xl cursor-pointer hover:bg-natural-light transition-all">
                  <input
                    type="checkbox"
                    checked={qTypes.mcq}
                    onChange={(e) => setQTypes({ ...qTypes, mcq: e.target.checked })}
                    className="rounded text-natural-accent focus:ring-natural-accent ml-2.5 h-4 w-4"
                  />
                  <div className="text-right">
                    <span className="text-xs font-bold text-natural-dark block">اختيار من متعدد</span>
                    <span className="text-[10px] text-natural-muted font-bold">خيارات أ، ب، ج، د</span>
                  </div>
                </label>

                <label className="flex items-center p-3.5 bg-natural-light/40 border border-natural-border rounded-2xl cursor-pointer hover:bg-natural-light transition-all">
                  <input
                    type="checkbox"
                    checked={qTypes.trueFalse}
                    onChange={(e) => setQTypes({ ...qTypes, trueFalse: e.target.checked })}
                    className="rounded text-natural-accent focus:ring-natural-accent ml-2.5 h-4 w-4"
                  />
                  <div className="text-right">
                    <span className="text-xs font-bold text-natural-dark block">صح أم خطأ</span>
                    <span className="text-[10px] text-natural-muted font-bold">صواب وخطأ للعبارات</span>
                  </div>
                </label>

                <label className="flex items-center p-3.5 bg-natural-light/40 border border-natural-border rounded-2xl cursor-pointer hover:bg-natural-light transition-all">
                  <input
                    type="checkbox"
                    checked={qTypes.fillBlank}
                    onChange={(e) => setQTypes({ ...qTypes, fillBlank: e.target.checked })}
                    className="rounded text-natural-accent focus:ring-natural-accent ml-2.5 h-4 w-4"
                  />
                  <div className="text-right">
                    <span className="text-xs font-bold text-natural-dark block">إكمال الفراغ</span>
                    <span className="text-[10px] text-natural-muted font-bold">ملء الكلمات المحذوفة</span>
                  </div>
                </label>

                <label className="flex items-center p-3.5 bg-natural-light/40 border border-natural-border rounded-2xl cursor-pointer hover:bg-natural-light transition-all">
                  <input
                    type="checkbox"
                    checked={qTypes.matching}
                    onChange={(e) => setQTypes({ ...qTypes, matching: e.target.checked })}
                    className="rounded text-natural-accent focus:ring-natural-accent ml-2.5 h-4 w-4"
                  />
                  <div className="text-right">
                    <span className="text-xs font-bold text-natural-dark block">توصيل الكلمات</span>
                    <span className="text-[10px] text-natural-muted font-bold">ربط العمود أ بالعمود ب</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Stepper / Slider for Worksheet Page Volume */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-natural-dark">عدد الأوراق (الصفحات):</label>
                <span className="text-xs font-extrabold text-natural-accent bg-natural-accent/10 px-2.5 py-1 rounded-full">{pageCount} أوراق (A4)</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={pageCount}
                onChange={(e) => setPageCount(parseInt(e.target.value, 10))}
                className="w-full accent-natural-accent bg-natural-cream h-2.5 rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-natural-muted font-extrabold font-mono px-1">
                <span>1 ورقة (مبسطة)</span>
                <span>5</span>
                <span>10 (متوسطة)</span>
                <span>15</span>
                <span>20 ورقة (مكثفة وشاملة)</span>
              </div>
            </div>

            {/* Generate Action */}
            <button
              onClick={handleGenerate}
              className="w-full py-4 bg-natural-accent hover:bg-natural-accent-hover text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 space-x-reverse"
            >
              <RefreshCw className="h-5 w-5 animate-spin-slow ml-2" />
              توليد وطباعة أوراق العمل الذكية
            </button>
          </div>

          {/* Quick instructions and Watermark locker panel */}
          <div className="bg-white border border-natural-border p-6 rounded-3xl space-y-6 shadow-sm h-fit">
            <h3 className="font-bold text-sm text-natural-dark font-serif flex items-center border-b border-natural-border pb-3">
              <Printer className="h-4 w-4 ml-2 text-natural-accent" />
              طبيعة أوراق العمل
            </h3>

            <div className="text-xs text-natural-text leading-relaxed space-y-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="bg-natural-light p-1.5 rounded-lg text-natural-accent shrink-0 font-bold">A4</div>
                <p className="font-medium">أوراق العمل مصممة بهياكل هندسية متطابقة تماماً مع حجم الطباعة القياسي A4 ومزودة بفواصل صفحات تلقائية.</p>
              </div>

              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="bg-natural-light p-1.5 rounded-lg text-natural-accent shrink-0 font-bold">💧</div>
                <p className="font-medium">تشتمل أوراق العمل على علامة مائية مخصصة مطبوع عليها عبارتنا الرسمية <strong>"نقلة للمناهج الإلكترونية"</strong>.</p>
              </div>

              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="bg-natural-light p-1.5 rounded-lg text-natural-accent shrink-0 font-bold">🔐</div>
                <p className="font-medium">لمدراء ومعلمي المدارس الراغبين بإزالة العلامة المائية لأغراض الامتحانات الرسمية، يمكن فك القفل بالباسوورد الخاص بالمنصة.</p>
              </div>
            </div>

            {/* Watermark management section */}
            <div className="border-t border-natural-border pt-5 mt-4 space-y-3">
              <h4 className="font-bold text-xs text-natural-dark">العلامة المائية الحالية:</h4>
              
              {isWatermarkRemoved ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center">
                  <Unlock className="h-4 w-4 ml-2 text-emerald-600" />
                  تمت إزالة العلامة المائية بنجاح!
                </div>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-medium flex items-center justify-between">
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 ml-2 text-rose-600 shrink-0" />
                    <span>نشطة (نقلة للمناهج الإلكترونية)</span>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-2.5 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg text-[10px] font-bold text-rose-700 transition-colors"
                  >
                    إلغاء قفل العلامة
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Generated Worksheet View and interactive engine */
        <div className="space-y-8">
          
          {/* Quick Header toolbar for Generated content */}
          <div className="bg-white border border-natural-border p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
            <div className="flex items-center space-x-3 space-x-reverse">
              <span className="p-2 bg-natural-accent/10 rounded-xl text-natural-accent font-bold">A4</span>
              <div>
                <h4 className="font-bold text-xs text-natural-dark">أوراق العمل جاهزة الآن!</h4>
                <p className="text-[10px] text-natural-muted font-medium">عدد الأوراق: {pageCount} ورقة عمل شاملة للتقييم والدراسة.</p>
              </div>
            </div>

            {/* Modes switches & print action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setInteractiveMode(false)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  !interactiveMode
                    ? 'bg-natural-accent text-white border-natural-accent shadow-sm'
                    : 'bg-white border-natural-border text-natural-text hover:bg-natural-light'
                }`}
              >
                وضع الطباعة والتحميل
              </button>
              
              <button
                onClick={() => setInteractiveMode(true)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  interactiveMode
                    ? 'bg-natural-accent text-white border-natural-accent shadow-sm'
                    : 'bg-white border-natural-border text-natural-text hover:bg-natural-light'
                }`}
              >
                حل تفاعلي بالموقع
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center"
              >
                <Printer className="h-4 w-4 ml-1.5" />
                اطبع الآن
              </button>
            </div>
          </div>

          {/* Interactive grading summary box */}
          {interactiveMode && isGraded && (
            <div id="grading-banner" className="bg-white border-2 border-natural-accent p-6 rounded-3xl shadow-sm text-center space-y-4 animate-bounce-short">
              <Award className="h-12 w-12 text-natural-accent mx-auto" />
              <div>
                <h3 className="font-serif font-bold text-lg text-natural-dark">نتيجتك في التقييم التفاعلي لورقة العمل</h3>
                <span className="text-3xl font-extrabold font-mono text-natural-accent block mt-2">{scorePercent}%</span>
              </div>
              <p className="text-xs text-natural-muted max-w-md mx-auto">
                {scorePercent >= 90 ? 'أحسنت يا بطل! لقد حصلت على درجة ممتازة وتستحق مرتبة الشرف لمهاراتك اللغوية العالية 🇸🇩🌟' : 
                 scorePercent >= 75 ? 'ممتاز جداً! إجاباتك تدل على فهم ممتاز لمنهج اللغة العربية، استمر بالتقدم!' : 
                 scorePercent >= 50 ? 'رائع، لقد اجتزت الاختبار بنجاح! راجع الأخطاء في الأسفل لتعزيز معلوماتك.' : 
                 'محاولة جيدة، ننصحك بمراجعة نصوص المنهج اللغوية والمحاولة مجدداً لرفع علامتك!'}
              </p>
              <button 
                onClick={() => {
                  setUserAnswers({});
                  setIsGraded(false);
                }}
                className="px-4 py-2 bg-natural-light hover:bg-natural-cream text-natural-dark text-xs font-bold rounded-xl border border-natural-border transition-all"
              >
                إعادة المحاولة من جديد
              </button>
            </div>
          )}

          {/* Core Printable / Interactive Layout pages */}
          <div className="space-y-8 select-text">
            {worksheetPages.map((page, pageIdx) => (
              <div 
                key={pageIdx}
                className="w-full md:w-[210mm] min-h-[297mm] bg-white text-black p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between border border-natural-border shadow-md mx-auto page-break print:shadow-none print:border-0 print:p-8"
              >
                {/* Embedded Watermark */}
                {!isWatermarkRemoved && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                    <div className="text-gray-200/45 text-4xl sm:text-5xl font-serif font-bold tracking-widest transform -rotate-45 whitespace-nowrap text-center">
                      نقلة للمناهج الإلكترونية
                    </div>
                  </div>
                )}

                {/* Worksheet Page Header */}
                <div className="relative z-10 border-b-2 border-black/80 pb-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="text-right">
                      <h1 className="text-lg font-serif font-bold tracking-wide">ورقة عمل - مادة اللغة العربية</h1>
                      <p className="text-[10px] font-sans font-bold text-gray-600 mt-1">المرحلة الابتدائية - الصف السادس الابتدائي</p>
                    </div>
                    
                    <div className="text-left font-serif text-xs font-bold space-y-1 text-gray-700">
                      <div>السنة الدراسية: ٢٠٢٦م</div>
                      <div>رقم الورقة: {pageIdx + 1}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-right pt-2 text-[11px] font-bold">
                    <div className="border border-gray-400 px-3 py-1 bg-gray-50 flex justify-between">
                      <span>اسم الطالب: ............................................</span>
                    </div>
                    <div className="border border-gray-400 px-3 py-1 bg-gray-50 flex justify-between">
                      <span>المدرسة: ............................................</span>
                    </div>
                  </div>
                </div>

                {/* Worksheet Page Core Questions */}
                <div className="flex-1 relative z-10 py-6 space-y-6">
                  <h2 className="text-xs font-serif font-bold bg-gray-100 px-3 py-1.5 rounded border border-gray-300 inline-block">
                    أجب بتركيز وإتقان عن الأسئلة المدرجة أدناه:
                  </h2>

                  <div className="space-y-6">
                    {page.map((q, idx) => {
                      const questionNum = (pageIdx * page.length) + idx + 1;
                      
                      return (
                        <div key={q.id} className="space-y-3 text-right">
                          <div className="flex items-start">
                            <span className="font-bold text-xs ml-2 bg-gray-200 px-2 py-0.5 rounded font-mono">{questionNum}</span>
                            <p className="font-serif text-xs leading-relaxed font-bold text-gray-900">{q.question}</p>
                          </div>

                          {/* Sub-renderer for MCQ */}
                          {q.type === 'multiple-choice' && q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-6">
                              {q.options.map((option, oIdx) => {
                                const optionLabels = ['أ', 'ب', 'ج', 'د'];
                                const isSelected = userAnswers[q.id] === option;
                                
                                return (
                                  <div key={oIdx}>
                                    {interactiveMode ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (isGraded) return;
                                          setUserAnswers({ ...userAnswers, [q.id]: option });
                                        }}
                                        className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                                          isSelected 
                                            ? 'bg-natural-accent text-white border-natural-accent shadow-sm'
                                            : 'bg-white border-natural-border text-natural-text hover:bg-natural-light'
                                        } ${isGraded && option === q.answer ? '!bg-emerald-500 !text-white !border-emerald-500' : ''} ${isGraded && isSelected && option !== q.answer ? '!bg-rose-500 !text-white !border-rose-500' : ''}`}
                                        disabled={isGraded}
                                      >
                                        <span>({optionLabels[oIdx]}) {option}</span>
                                        {isGraded && option === q.answer && <Check className="h-4 w-4 mr-2" />}
                                        {isGraded && isSelected && option !== q.answer && <X className="h-4 w-4 mr-2" />}
                                      </button>
                                    ) : (
                                      <p className="text-xs text-gray-700 font-medium">
                                        ({optionLabels[oIdx]}) {option}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Sub-renderer for True/False */}
                          {q.type === 'true-false' && (
                            <div className="pr-6 flex items-center space-x-4 space-x-reverse">
                              {interactiveMode ? (
                                <div className="flex space-x-2 space-x-reverse">
                                  {['صح', 'خطأ'].map((option) => {
                                    const isSelected = userAnswers[q.id] === option;
                                    return (
                                      <button
                                        key={option}
                                        type="button"
                                        onClick={() => {
                                          if (isGraded) return;
                                          setUserAnswers({ ...userAnswers, [q.id]: option });
                                        }}
                                        className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                          isSelected
                                            ? 'bg-natural-accent text-white border-natural-accent'
                                            : 'bg-white border-natural-border text-natural-text hover:bg-natural-light'
                                        } ${isGraded && option === q.answer ? '!bg-emerald-500 !text-white !border-emerald-500' : ''} ${isGraded && isSelected && option !== q.answer ? '!bg-rose-500 !text-white !border-rose-500' : ''}`}
                                        disabled={isGraded}
                                      >
                                        {option}
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-600 font-serif font-bold">
                                  الإجابة:  (       )
                                </span>
                              )}
                            </div>
                          )}

                          {/* Sub-renderer for Fill in blanks */}
                          {q.type === 'fill-blank' && (
                            <div className="pr-6 flex items-center">
                              {interactiveMode ? (
                                <div className="w-full max-w-sm">
                                  <input
                                    type="text"
                                    value={userAnswers[q.id] || ''}
                                    onChange={(e) => {
                                      if (isGraded) return;
                                      setUserAnswers({ ...userAnswers, [q.id]: e.target.value });
                                    }}
                                    placeholder="اكتب الإجابة هنا..."
                                    className={`w-full bg-white border border-natural-border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-natural-accent ${
                                      isGraded 
                                        ? userAnswers[q.id]?.trim().toLowerCase() === q.answer.trim().toLowerCase()
                                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                                          : 'border-rose-500 bg-rose-50 text-rose-900'
                                        : ''
                                    }`}
                                    disabled={isGraded}
                                  />
                                  {isGraded && (
                                    <div className="mt-1.5 flex items-center space-x-1 space-x-reverse text-[10px] font-bold">
                                      <span className="text-emerald-700">الإجابة الصحيحة:</span>
                                      <span className="text-emerald-900 bg-emerald-100/50 px-1.5 py-0.5 rounded">{q.answer}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-600 font-serif font-bold">
                                  الجواب: ................................................................
                                </span>
                              )}
                            </div>
                          )}

                          {/* Sub-renderer for Matching pairs */}
                          {q.type === 'matching' && q.pairs && (
                            <div className="pr-6 space-y-3">
                              <p className="text-[10px] text-gray-500 font-bold">صِل كل عبارة بالرقم المناسب:</p>
                              
                              <div className="grid grid-cols-2 gap-4">
                                {/* Left Side Words */}
                                <div className="space-y-1.5">
                                  {Object.keys(q.pairs).map((leftWord, lIdx) => (
                                    <div key={leftWord} className="flex items-center justify-between border border-gray-200 bg-gray-50 px-3 py-1.5 rounded text-xs font-bold">
                                      <span>{lIdx + 1}. {leftWord}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Right Side Definitions with inputs or selectors */}
                                <div className="space-y-1.5">
                                  {Object.values(q.pairs).map((rightDef, rIdx) => {
                                    const matchKeys = Object.keys(q.pairs!);
                                    const userSelectedKey = matchKeys.find(k => userAnswers[`${q.id}-${k}`] === rightDef);
                                    
                                    return (
                                      <div key={rightDef} className="flex items-center justify-between border border-gray-200 px-3 py-1 rounded text-xs">
                                        <span className="flex-1 text-right">{rightDef}</span>
                                        
                                        {interactiveMode ? (
                                          <select
                                            value={userSelectedKey || ''}
                                            onChange={(e) => {
                                              if (isGraded) return;
                                              const selectedWord = e.target.value;
                                              
                                              // Clear previous matching for this word
                                              const updatedAnswers = { ...userAnswers };
                                              matchKeys.forEach(k => {
                                                if (updatedAnswers[`${q.id}-${k}`] === rightDef) {
                                                  delete updatedAnswers[`${q.id}-${k}`];
                                                }
                                              });

                                              if (selectedWord) {
                                                updatedAnswers[`${q.id}-${selectedWord}`] = rightDef;
                                              }
                                              setUserAnswers(updatedAnswers);
                                            }}
                                            className={`ml-2 bg-white border border-natural-border rounded-lg px-2 py-1 text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-natural-accent ${
                                              isGraded 
                                                ? userSelectedKey && q.pairs![userSelectedKey] === rightDef
                                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                                                  : 'border-rose-500 bg-rose-50 text-rose-900'
                                                : ''
                                            }`}
                                            disabled={isGraded}
                                          >
                                            <option value="">اختر التوصيل...</option>
                                            {matchKeys.map(k => (
                                              <option key={k} value={k}>{k}</option>
                                            ))}
                                          </select>
                                        ) : (
                                          <span className="ml-2 font-mono text-xs text-gray-400"> (      )</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Show Explanations post-grading */}
                          {interactiveMode && isGraded && q.explanation && (
                            <div className="mr-6 p-3 bg-natural-light/60 border-r-4 border-r-natural-accent rounded-xl text-[11px] leading-relaxed font-bold text-natural-dark animate-fadeIn">
                              <strong>الشرح والمفهوم:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Worksheet Page Footer */}
                <div className="relative z-10 border-t border-gray-300 pt-3 flex justify-between items-center text-[10px] font-bold text-gray-500 font-mono">
                  <span>المعلم الذكي للغة العربية - نقلة للمناهج الإلكترونية</span>
                  <span>صفحة رقم {pageIdx + 1} من {pageCount}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Mode Grading Floating Trigger */}
          {interactiveMode && !isGraded && (
            <div className="flex justify-center print:hidden">
              <button
                onClick={handleGradeOnsite}
                className="px-8 py-4 bg-natural-accent hover:bg-natural-accent-hover text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 space-x-reverse"
              >
                <CheckCircle className="h-5 w-5 ml-2" />
                تصحيح ورقة العمل الذاتية ومعرفة النتيجة
              </button>
            </div>
          )}
        </div>
      )}

      {/* Watermark Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white border border-natural-border rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl text-right animate-scaleUp">
            <div className="flex justify-between items-start border-b border-natural-border pb-3">
              <h3 className="font-serif font-bold text-base text-natural-dark flex items-center">
                <Lock className="h-5 w-5 ml-2 text-rose-600 shrink-0" />
                إدخال كلمة المرور
              </h3>
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError('');
                }}
                className="p-1 rounded-full text-natural-muted hover:bg-natural-light transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-natural-muted font-medium leading-relaxed">
              يرجى إدخال كلمة المرور السرية الخاصة بالمعلم لإلغاء وإزالة العلامة المائية للطباعة الرسمية:
            </p>

            <form onSubmit={handleRemoveWatermark} className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  value={watermarkPassword}
                  onChange={(e) => setWatermarkPassword(e.target.value)}
                  placeholder="كلمة المرور..."
                  className="w-full bg-natural-light border border-natural-border rounded-xl px-4 py-2 text-xs font-bold text-natural-dark text-center focus:outline-none focus:ring-1 focus:ring-natural-accent"
                  autoFocus
                />
              </div>

              {passwordError && (
                <p className="text-[10px] text-rose-700 font-bold">{passwordError}</p>
              )}

              <div className="flex space-x-2 space-x-reverse pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  تأكيد الإزالة
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                  }}
                  className="px-4 py-2.5 bg-natural-light hover:bg-natural-cream text-natural-dark rounded-xl text-xs font-bold border border-natural-border transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
