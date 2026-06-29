import React, { useState, useEffect } from 'react';
import { curriculumData, Lesson } from '../data/curriculum';
import { Award, CheckCircle2, AlertCircle, RefreshCw, ChevronLeft } from 'lucide-react';

interface QuizSectionProps {
  initialActiveLessonId?: string;
  onSaveQuizScore: (lessonId: string, score: number, total: number) => void;
}

export default function QuizSection({ initialActiveLessonId, onSaveQuizScore }: QuizSectionProps) {
  // Select active lesson to test
  const allLessons: Lesson[] = curriculumData.flatMap(unit => unit.lessons);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(
    allLessons.find(l => l.id === initialActiveLessonId) || allLessons[0]
  );

  useEffect(() => {
    if (initialActiveLessonId) {
      const found = allLessons.find(l => l.id === initialActiveLessonId);
      if (found) {
        setSelectedLesson(found);
        resetQuizState();
      }
    }
  }, [initialActiveLessonId]);

  // Quiz States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillBlankInput, setFillBlankInput] = useState<string>('');
  const [matchingPairs, setMatchingPairs] = useState<{ [key: string]: string }>({});
  const [selectedMatchLeft, setSelectedMatchLeft] = useState<string | null>(null);
  const [selectedMatchRight, setSelectedMatchRight] = useState<string | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);

  const activeQuestions = selectedLesson.quiz;
  const currentQuestion = activeQuestions[currentQuestionIndex];

  const resetQuizState = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setFillBlankInput('');
    setMatchingPairs({});
    setSelectedMatchLeft(null);
    setSelectedMatchRight(null);
    setShowAnswerFeedback(false);
    setIsAnswerCorrect(false);
    setQuizScore(0);
    setQuizComplete(false);
  };

  // Change lesson
  const handleLessonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = allLessons.find(l => l.id === e.target.value);
    if (found) {
      setSelectedLesson(found);
      resetQuizState();
    }
  };

  // Matching Question Mechanics
  const handleMatchSelect = (type: 'left' | 'right', value: string) => {
    if (type === 'left') {
      setSelectedMatchLeft(value);
    } else {
      setSelectedMatchRight(value);
    }
  };

  // Hook to couple match items when both selected
  useEffect(() => {
    if (selectedMatchLeft && selectedMatchRight) {
      setMatchingPairs(prev => ({
        ...prev,
        [selectedMatchLeft]: selectedMatchRight
      }));
      setSelectedMatchLeft(null);
      setSelectedMatchRight(null);
    }
  }, [selectedMatchLeft, selectedMatchRight]);

  const handleClearMatches = () => {
    setMatchingPairs({});
    setSelectedMatchLeft(null);
    setSelectedMatchRight(null);
  };

  // Answer Evaluation
  const handleCheckAnswer = () => {
    if (!currentQuestion) return;

    let correct = false;

    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'grammar') {
      correct = (selectedOption === currentQuestion.answer);
    } else if (currentQuestion.type === 'fill-blank') {
      // Normalize spaces and commas
      const normInput = fillBlankInput.trim().replace(/\s+/g, ' ');
      const normAns = currentQuestion.answer.trim().replace(/\s+/g, ' ');
      correct = (normInput === normAns || normAns.includes(normInput) && normInput.length > 2);
    } else if (currentQuestion.type === 'matching') {
      // Check if all pairs match the correct keys
      const requiredPairs = currentQuestion.pairs || {};
      const totalRequired = Object.keys(requiredPairs).length;
      let correctMatches = 0;

      Object.entries(matchingPairs).forEach(([term, meaning]) => {
        if (requiredPairs[term] === meaning) {
          correctMatches++;
        }
      });

      correct = (correctMatches === totalRequired);
    }

    setIsAnswerCorrect(correct);
    if (correct) {
      setQuizScore(prev => prev + 1);
    }
    setShowAnswerFeedback(true);
  };

  // Proceed to next question
  const handleNextQuestion = () => {
    setSelectedOption(null);
    setFillBlankInput('');
    setMatchingPairs({});
    setSelectedMatchLeft(null);
    setSelectedMatchRight(null);
    setShowAnswerFeedback(false);
    setIsAnswerCorrect(false);

    if (currentQuestionIndex + 1 < activeQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions finished
      setQuizComplete(true);
    }
  };

  // Trigger final save of scores on complete state
  useEffect(() => {
    if (quizComplete) {
      onSaveQuizScore(selectedLesson.id, quizScore, activeQuestions.length);
    }
  }, [quizComplete]);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 bg-natural-bg text-natural-text min-h-screen transition-all">
      {/* Selector & Header */}
      <div className="bg-white border border-natural-border p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-natural-dark font-serif flex items-center">
            <Award className="h-6 w-6 ml-2 text-amber-600" />
            اختبارات قياس مستوى الأداء
          </h2>
          <p className="text-natural-muted text-xs mt-1 font-medium">حل تدريبات الفهم وقواعد الإعراب للتأكد من استيعاب الدروس والمفردات.</p>
        </div>

        {/* Dropdown lesson list selector */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <label htmlFor="lesson-selector" className="text-xs text-natural-muted font-bold whitespace-nowrap">الدرس المستهدف:</label>
          <select
            id="lesson-selector"
            value={selectedLesson.id}
            onChange={handleLessonChange}
            className="bg-natural-light border border-natural-border text-natural-dark text-xs rounded-xl px-3.5 py-2 font-bold focus:outline-none focus:border-natural-accent transition-all max-w-[200px] sm:max-w-xs"
          >
            {curriculumData.map(unit => (
              <optgroup key={unit.id} label={unit.title} className="bg-white text-natural-muted font-bold">
                {unit.lessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id} className="bg-white text-natural-dark font-medium">
                    {lesson.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Main Testing Canvas */}
      {!quizComplete ? (
        <div className="bg-white border border-natural-border rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
          {/* Question Stepper Indicator */}
          <div className="flex items-center justify-between border-b border-natural-border pb-4">
            <span className="text-xs text-natural-muted font-bold">
              السؤال <strong className="text-natural-accent font-mono text-sm">{currentQuestionIndex + 1}</strong> من أصل <strong className="font-mono text-natural-dark">{activeQuestions.length}</strong>
            </span>
            <div className="flex space-x-1.5 space-x-reverse">
              {activeQuestions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                    i === currentQuestionIndex ? 'bg-natural-accent' : i < currentQuestionIndex ? 'bg-natural-accent/50' : 'bg-natural-light'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <span className="text-[10px] bg-natural-accent/10 text-natural-accent border border-natural-accent/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {currentQuestion.type === 'grammar' ? 'إعراب وقواعد نحوية' : 'فهم واستيعاب نصوص'}
            </span>
            <h3 className="text-lg font-bold text-natural-dark leading-relaxed font-serif">{currentQuestion.question}</h3>
          </div>

          {/* Question Inputs */}
          <div className="py-2">
            {/* 1. Multiple Choice / Grammar Options */}
            {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'grammar') && currentQuestion.options && (
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOption === option;
                  let optStyle = "bg-natural-light border-natural-border/70 text-natural-text hover:bg-natural-cream hover:border-natural-accent/30";
                  
                  if (showAnswerFeedback) {
                    if (option === currentQuestion.answer) {
                      optStyle = "bg-natural-accent/15 border-natural-accent text-natural-accent font-bold shadow-sm";
                    } else if (isSelected) {
                      optStyle = "bg-rose-600/10 border-rose-600/30 text-rose-700 font-bold shadow-sm";
                    } else {
                      optStyle = "bg-natural-light/50 border-natural-border/40 text-natural-muted opacity-60";
                    }
                  } else if (isSelected) {
                    optStyle = "bg-natural-accent/10 border-natural-accent text-natural-accent font-bold";
                  }

                  return (
                    <button
                      key={option}
                      disabled={showAnswerFeedback}
                      onClick={() => setSelectedOption(option)}
                      className="w-full text-right p-4 rounded-xl border text-xs transition-all font-bold"
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. Fill in the Blank Input */}
            {currentQuestion.type === 'fill-blank' && (
              <div className="space-y-4">
                <input
                  type="text"
                  disabled={showAnswerFeedback}
                  placeholder="اكتب إجابتك الدقيقة باللغة العربية الفصحى هنا..."
                  value={fillBlankInput}
                  onChange={(e) => setFillBlankInput(e.target.value)}
                  className="w-full bg-natural-light border border-natural-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-natural-accent focus:bg-white text-natural-dark transition-all text-center font-bold"
                />
              </div>
            )}

            {/* 3. Matching Game (صِل الكلمات) */}
            {currentQuestion.type === 'matching' && currentQuestion.pairs && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  {/* Left Column (Terms) */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] text-natural-muted font-bold block mb-1">الكلمات اللغوية:</span>
                    {Object.keys(currentQuestion.pairs).map((term) => {
                      const isConnected = matchingPairs[term] !== undefined;
                      const isSelected = selectedMatchLeft === term;
                      return (
                        <button
                          key={term}
                          disabled={showAnswerFeedback || isConnected}
                          onClick={() => handleMatchSelect('left', term)}
                          className={`w-full text-right px-3 py-2.5 rounded-xl border text-xs transition-all font-bold ${
                            isConnected 
                              ? 'bg-natural-accent/10 border-natural-accent/30 text-natural-accent' 
                              : isSelected
                              ? 'bg-natural-accent/20 border-natural-accent text-natural-accent-hover'
                              : 'bg-natural-light border-natural-border/70 text-natural-text hover:bg-natural-cream'
                          }`}
                        >
                          {term}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column (Meanings) */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] text-natural-muted font-bold block mb-1">المعاني والشروحات:</span>
                    {(Object.values(currentQuestion.pairs || {}) as string[]).map((meaning) => {
                      const isConnected = Object.values(matchingPairs).includes(meaning);
                      const isSelected = selectedMatchRight === meaning;
                      return (
                        <button
                          key={meaning}
                          disabled={showAnswerFeedback || isConnected}
                          onClick={() => handleMatchSelect('right', meaning)}
                          className={`w-full text-right px-3 py-2.5 rounded-xl border text-xs transition-all font-bold ${
                            isConnected 
                              ? 'bg-natural-accent/10 border-natural-accent/30 text-natural-accent' 
                              : isSelected
                              ? 'bg-natural-accent/20 border-natural-accent text-natural-accent-hover'
                              : 'bg-natural-light border-natural-border/70 text-natural-text hover:bg-natural-cream'
                          }`}
                        >
                          {meaning}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reset Matches Button */}
                {!showAnswerFeedback && Object.keys(matchingPairs).length > 0 && (
                  <button
                    onClick={handleClearMatches}
                    className="text-xs text-rose-700 hover:text-rose-800 font-bold flex items-center mx-auto"
                  >
                    إعادة توصيل الكلمات
                    <RefreshCw className="h-3 w-3 mr-1" />
                  </button>
                )}

                {/* Display connected matching pairs */}
                {Object.keys(matchingPairs).length > 0 && (
                  <div className="bg-natural-light p-4 rounded-2xl border border-natural-border text-right space-y-1.5 shadow-inner">
                    <span className="text-[10px] text-natural-muted block mb-1 font-bold">الروابط التي قمت بتوصيلها:</span>
                    {Object.entries(matchingPairs).map(([term, meaning]) => (
                      <div key={term} className="text-xs flex items-center justify-between border-b border-natural-border pb-1.5 font-bold">
                        <span className="text-natural-accent">{term}</span>
                        <span className="text-natural-muted">←</span>
                        <span className="text-natural-dark">{meaning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Feedback Section */}
          {showAnswerFeedback && (
            <div className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 ${
              isAnswerCorrect 
                ? 'bg-natural-accent/15 border-natural-accent/30 text-natural-accent' 
                : 'bg-rose-600/10 border-rose-600/30 text-rose-700'
            }`}>
              <div className="p-2 bg-white rounded-xl border border-natural-border/50 mr-3 shrink-0">
                {isAnswerCorrect ? (
                  <CheckCircle2 className="h-6 w-6 text-natural-accent" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-rose-600" />
                )}
              </div>
              <div className="text-right">
                <h4 className="font-bold text-xs">{isAnswerCorrect ? 'إجابة صحيحة، أحسنت!' : 'لم تكن هذه هي الإجابة الصحيحة'}</h4>
                <p className="text-xs text-natural-text mt-1 leading-relaxed font-medium">{currentQuestion.explanation}</p>
              </div>
            </div>
          )}

          {/* Core Controls */}
          <div className="flex items-center justify-between border-t border-natural-border pt-5">
            {!showAnswerFeedback ? (
              <button
                onClick={handleCheckAnswer}
                disabled={
                  (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'grammar') && !selectedOption ||
                  currentQuestion.type === 'fill-blank' && !fillBlankInput.trim() ||
                  currentQuestion.type === 'matching' && Object.keys(matchingPairs).length < Object.keys(currentQuestion.pairs || {}).length
                }
                className="px-6 py-3 bg-natural-accent hover:bg-natural-accent-hover text-white rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                تحقق من الإجابة
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 bg-natural-light hover:bg-natural-cream text-natural-dark border border-natural-border rounded-xl text-xs font-bold transition-all shadow-sm flex items-center"
              >
                {currentQuestionIndex + 1 < activeQuestions.length ? 'السؤال التالي' : 'عرض النتيجة النهائية'}
                <ChevronLeft className="h-4 w-4 mr-2" />
              </button>
            )}

            <button
              onClick={resetQuizState}
              className="text-xs text-natural-muted hover:text-natural-dark flex items-center font-bold"
            >
              إعادة تصفير الاختبار
              <RefreshCw className="h-3 w-3 mr-1" />
            </button>
          </div>
        </div>
      ) : (
        /* Quiz Complete Screen */
        <div className="bg-white border border-natural-border rounded-3xl p-8 text-center space-y-6 shadow-sm flex flex-col items-center justify-center">
          <div className="bg-natural-accent p-4 rounded-3xl text-white shadow-md shadow-natural-accent/15">
            <Award className="h-12 w-12" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-serif text-natural-dark">تهانينا! أكملت الاختبار بنجاح</h3>
            <p className="text-xs text-natural-muted max-w-sm font-medium">
              أحسنت صنعاً في حل أسئلة درس "{selectedLesson.title}". تم حفظ نتيجتك بنجاح في سجل المتابعة التفاعلي.
            </p>
          </div>

          {/* Progress Ring and Score */}
          <div className="bg-natural-light px-6 py-4 rounded-2xl border border-natural-border text-center space-y-1">
            <span className="text-[10px] text-natural-muted font-bold">النتيجة المحصلة</span>
            <div className="text-3xl font-extrabold text-natural-accent font-mono">
              {quizScore} <span className="text-natural-border text-lg">/</span> {activeQuestions.length}
            </div>
            <span className="text-[10px] bg-natural-accent/10 text-natural-accent border border-natural-accent/20 px-2.5 py-0.5 rounded-full font-bold">
              معدل نجاح: {Math.round((quizScore / activeQuestions.length) * 100)}%
            </span>
          </div>

          <div className="flex space-x-3 space-x-reverse">
            <button
              onClick={resetQuizState}
              className="px-5 py-2.5 bg-natural-accent hover:bg-natural-accent-hover text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center"
            >
              إعادة اختبار الفهم
              <RefreshCw className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
