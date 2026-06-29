import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, MessageSquare, RefreshCw, CheckCircle2, BookOpen, Sparkles, Star } from 'lucide-react';
import { curriculumData, Lesson, Unit } from '../data/curriculum';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

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

export default function AITutor() {
  const [activeMode, setActiveMode] = useState<'chat' | 'grammar' | 'search'>('chat');
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'مرحباً بك يا بني! أنا معلمك المساعد الفوري لمنهج اللغة العربية (الصف السادس الابتدائي). 🇸🇩🌟\n\nتم تحديث محركي ليعمل بنظام "البحث الفوري الآمن والموثوق" للبحث مباشرة داخل نصوص وقواعد معجم المنهج المدرسي بدون تكاليف ذكاء اصطناعي!\n\nيمكنك:\n١. الاستفسار عن أي شخصية أو موضوع بالمنهج.\n٢. طلب إعراب الجمل النحوية المدروسة.\n٣. البحث السريع عن أي كلمة في المعاجم وقواعد الدروس.\n\nكيف يمكنني مساعدتك اليوم؟'
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [grammarResult, setGrammarResult] = useState<string>('');
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [searchQueryAttempted, setSearchQueryAttempted] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions for students
  const suggestionChips = {
    chat: [
      'ما هي عناصر النجاح الستة في المنهج؟',
      'من هو الشاعر كاتب قصيدة وفاء الكلب؟',
      'ما أهمية ترشيد استهلاك المياه في السودان؟',
      'لماذا اعتبر حاتم الطائي الغلام اليتيم أكرم منه؟'
    ],
    grammar: [
      'ذبحَ الغلامُ الغنمَ بأسرِها',
      'الناجحونَ ماهرونَ في أعمالهم',
      'أمسِ الذي مرّ على قربه',
      'عامل الناس كما تحب أن يعاملوك'
    ],
    search: [
      'الألف اللينة',
      'حاتم الطائي',
      'المفعول المطلق',
      'الحرية شمس'
    ]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Search Engine Logic inside the Curriculum
  const performCurriculumSearch = (query: string) => {
    const normQuery = normalizeArabic(query);
    if (!normQuery) return [];

    const results: any[] = [];
    const queryWords = normQuery.split(/\s+/).filter(w => w.length > 1);

    curriculumData.forEach((unit) => {
      unit.lessons.forEach((lesson) => {
        let score = 0;
        const matches: string[] = [];

        // Check lesson title
        const normTitle = normalizeArabic(lesson.title);
        if (normTitle.includes(normQuery)) {
          score += 100;
          matches.push(`عنوان الدرس: ${lesson.title}`);
        }

        // Check author
        if (lesson.author) {
          const normAuthor = normalizeArabic(lesson.author);
          if (normAuthor.includes(normQuery)) {
            score += 50;
            matches.push(`اسم الكاتب/الشاعر: ${lesson.author}`);
          }
        }

        // Check grammarFocus
        if (lesson.grammarFocus) {
          const normGrammar = normalizeArabic(lesson.grammarFocus);
          if (normGrammar.includes(normQuery)) {
            score += 40;
            // Extract surrounding context
            const sentences = lesson.grammarFocus.split(/[.،\n]/);
            sentences.forEach(s => {
              if (normalizeArabic(s).includes(normQuery)) {
                matches.push(`في القواعد: ... ${s.trim()} ...`);
              }
            });
          }
        }

        // Check vocabulary words and meanings
        lesson.vocabulary.forEach((v) => {
          const normWord = normalizeArabic(v.word);
          const normMeaning = normalizeArabic(v.meaning);
          if (normWord.includes(normQuery) || normMeaning.includes(normQuery)) {
            score += 30;
            matches.push(`المعجم اللغوي: كلمة "${v.word}" تعني "${v.meaning}"${v.opposite ? ` ومضادها "${v.opposite}"` : ""}`);
          }
        });

        // Check text content line by line or sentence by sentence
        const sentences = lesson.text.split(/[.\n]/);
        sentences.forEach((sentence) => {
          const normSentence = normalizeArabic(sentence);
          if (normSentence.includes(normQuery)) {
            score += 20;
            matches.push(`سياق الدرس: ${sentence.trim()}`);
          } else {
            // Check word matches
            const matchedWordsCount = queryWords.filter(word => normSentence.includes(word)).length;
            if (matchedWordsCount > 0) {
              score += matchedWordsCount * 5;
              matches.push(`سياق الدرس: ${sentence.trim()}`);
            }
          }
        });

        // Check quiz questions
        lesson.quiz.forEach((q) => {
          const normQ = normalizeArabic(q.question);
          const normAns = normalizeArabic(q.answer);
          const normExpl = normalizeArabic(q.explanation);
          if (normQ.includes(normQuery) || normAns.includes(normQuery) || normExpl.includes(normQuery)) {
            score += 25;
            matches.push(`من بنك الأسئلة: سؤال عن "${q.question.substring(0, 45)}..." الإجابة النموذجية هي: "${q.answer}"`);
          }
        });

        if (score > 0) {
          // Remove duplicate matching context lines to keep output clean and rich
          const uniqueMatches = Array.from(new Set(matches)).slice(0, 3);
          results.push({
            unitNumber: unit.number,
            unitTitle: unit.title,
            lesson,
            score,
            matches: uniqueMatches
          });
        }
      });
    });

    // Sort by relevance score
    return results.sort((a, b) => b.score - a.score);
  };

  // Rule-based Grammar Parser suited for Grade 6 Arabic curriculum
  const analyzeGrammarLocally = (sentence: string): string => {
    const trimmed = sentence.trim();
    const normalized = normalizeArabic(trimmed);
    
    // Look up in curriculum first for exact examples
    const searchMatch = performCurriculumSearch(trimmed);
    let extraContext = "";
    if (searchMatch.length > 0) {
      const match = searchMatch[0];
      if (match.lesson.grammarFocus) {
        extraContext = `💡 ملاحظة من الدرس الحادي عشر والمنهج المعتمد لدرس "${match.lesson.title}":\n"${match.lesson.grammarFocus}"\n\n`;
      }
    }

    let analysis = `📝 تحليل وإعراب الجملة: "${trimmed}"\n`;
    analysis += `━━━━━━━━━━━━━━━━━━━━━━\n`;

    // Try parsing words
    const words = trimmed.split(/\s+/);
    let parsedCount = 0;

    // Common words list mapping to Grade 6 rules
    const rules: { [key: string]: { pos: string, grammatical: string } } = {
      'ذبح': { pos: 'فعل ماضٍ', grammatical: 'مبني على الفتح الظاهر على آخره.' },
      'سأل': { pos: 'فعل ماضٍ', grammatical: 'مبني على الفتح الظاهر على آخره.' },
      'سجدت': { pos: 'فعل ماضٍ', grammatical: 'مبني على السكون لاتصاله بتاء الفاعل، والتاء ضمير متصل مبني في محل رفع فاعل.' },
      'يعاني': { pos: 'فعل مضارع', grammatical: 'مرفوع وعلامة رفعه الضمة المقدرة للثقل.' },
      'يواجه': { pos: 'فعل مضارع', grammatical: 'مرفوع وعلامة رفعه الضمة الظاهرة على آخره.' },
      'الغلام': { pos: 'فاعل', grammatical: 'مرفوع وعلامة رفعه الضمة الظاهرة على آخره.' },
      'رجل': { pos: 'فاعل', grammatical: 'مرفوع وعلامة رفعه الضمة الظاهرة على آخره.' },
      'الناس': { pos: 'فاعل أو مفعول به', grammatical: 'حسب موقعها (مرفوع بالضمة أو منصوب بالفتحة).' },
      'الغنم': { pos: 'مفعول به', grammatical: 'منصوب وعلامة نصبه الفتحة الظاهرة على آخره.' },
      'المياه': { pos: 'مضاف إليه أو مفعول به', grammatical: 'مجرور بالكسرة أو منصوب بالفتحة.' },
      'الناجحون': { pos: 'مبتدأ', grammatical: 'مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم.' },
      'ماهرون': { pos: 'خبر المبتدأ', grammatical: 'مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم.' },
      'المعلم': { pos: 'مبتدأ', grammatical: 'مرفوع وعلامة رفعه الضمة الظاهرة على آخره.' },
      'محبوب': { pos: 'خبر المبتدأ', grammatical: 'مرفوع وعلامة رفعه الضمة الظاهرة على آخره.' },
      'الحرية': { pos: 'مبتدأ', grammatical: 'مرفوع وعلامة رفعه الضمة الظاهرة على آخره.' },
      'شمس': { pos: 'خبر المبتدأ', grammatical: 'مرفوع وعلامة رفعه الضمة الظاهرة على آخره.' },
      'في': { pos: 'حرف جر', grammatical: 'مبني لا محل له من الإعراب.' },
      'على': { pos: 'حرف جر', grammatical: 'مبني لا محل له من الإعراب.' },
      'من': { pos: 'حرف جر', grammatical: 'مبني لا محل له من الإعراب.' },
      'إلى': { pos: 'حرف جر', grammatical: 'مبني لا محل له من الإعراب.' },
      'لله': { pos: 'جار ومجرور', grammatical: 'اللام حرف جر، ولفظ الجلالة اسم مجرور وعلامة جره الكسرة الظاهرة.' },
      'أمس': { pos: 'ظرف زمان', grammatical: 'مبني على الكسر في محل نصب.' },
      'المفعول': { pos: 'مصطلح نحوي', grammatical: 'يدرس الطالب المفعول به والمفعول المطلق والمفعول لأجله.' },
      'إياك': { pos: 'ضمير منفصل', grammatical: 'مبني في محل نصب مفعول به لفعل محذوف تقديره (أحذر) وهو أسلوب تحذير.' }
    };

    words.forEach((w) => {
      const cleanW = w.replace(/[،.؟!:""'']/g, "");
      const normW = normalizeArabic(cleanW);
      
      // Look up in rules
      let found = false;
      for (const [key, val] of Object.entries(rules)) {
        if (normW === normalizeArabic(key) || normW.includes(normalizeArabic(key))) {
          analysis += `• كلمة [${cleanW}]: هي ${val.pos} 👈 ${val.grammatical}\n`;
          found = true;
          parsedCount++;
          break;
        }
      }

      if (!found) {
        // Fallback morphological guessing for grade 6
        if (normW.startsWith("ال") && normW.endsWith("ون")) {
          analysis += `• كلمة [${cleanW}]: جمع مذكر سالم (مرفوع بالواو نيابة عن الضمة).\n`;
          parsedCount++;
        } else if (normW.startsWith("ال") && normW.endsWith("ين")) {
          analysis += `• كلمة [${cleanW}]: جمع مذكر سالم أو مثنى (منصوب أو مجرور بالياء).\n`;
          parsedCount++;
        } else if (normW.startsWith("ال")) {
          analysis += `• كلمة [${cleanW}]: اسم معرّف بـ (أل) وعلامة إعرابه تتبع موقعه في الجملة.\n`;
          parsedCount++;
        } else if (normW.length >= 3 && (normW.endsWith("ت") || normW.startsWith("ت") || normW.startsWith("ي") || normW.startsWith("ن") || normW.startsWith("أ"))) {
          analysis += `• كلمة [${cleanW}]: فعل (ماضٍ أو مضارع) تظهر عليه علامة البناء أو الإعراب المناسبة.\n`;
          parsedCount++;
        } else {
          analysis += `• كلمة [${cleanW}]: اسم أو كلمة تحتاج سياقاً لبيان حالتها الإعرابية التفصيلية.\n`;
        }
      }
    });

    if (parsedCount === 0) {
      analysis += `⚠️ تعذر تحليل تفاصيل الكلمات فردياً. يرجى مراجعة القواعد العامة المرفقة في المنهج للوحدات الدراسية.\n`;
    }

    analysis += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    analysis += `${extraContext}`;
    analysis += `🎓 نصيحة المعلم النحوية:\n` +
                `تذكّر يا بني دائماً أن:\n` +
                `- الفاعل يكون دائماً مرفوعاً (بالضمة للمفرد، وبالألف للمثنى، وبالواو لجمع المذكر السالم).\n` +
                `- المفعول به يكون دائماً منصوباً بالفتحة أو الكسرة (لجمع المؤنث السالم) أو الياء (للمثنى والجمع).\n` +
                `- المفعول المطلق مصدر منصوب يؤكد الفعل أو يبين نوعه أو عدده (مثل: رابني ريباً، وضربت ضرباً).`;

    return analysis;
  };

  // Chat/Dialogue Answering Engine
  const generateChatResponse = (query: string): string => {
    const normQuery = normalizeArabic(query);
    
    // Quick greeting matches
    if (normQuery.match(/(مرحبا|اهلا|السلام عليكم|سلام|صباح الخير|مساء الخير|كيف حالك)/i)) {
      return `وعليكم السلام ورحمة الله وبركاته! أهلاً بك يا بني العزيز 🌟\n\nأنا معلمك الافتراضي المساعد هنا لخدمتك طوال الوقت. لقد قمت بالبحث الفوري وتحديث معلوماتي لتطابق تماماً الكتاب المدرسي للصف السادس الابتدائي لجمهورية السودان.\n\nيمكنك سؤالي عن أي درس من دروس كتاب القراءة، القصائد، معاني المفردات، أو القواعد النحوية وسأبسط لك الشرح فوراً وبدون أي تكلفة! كيف يمكنني مساعدتك؟`;
    }

    // Search curriculum
    const searchMatches = performCurriculumSearch(query);
    
    if (searchMatches.length > 0) {
      const bestMatch = searchMatches[0];
      const lesson = bestMatch.lesson;
      
      let response = `👨‍🏫 أهلاً بك! لقد بحثت في كتاب القراءة ووجدت لك شرحاً وافياً في:\n`;
      response += `📖 **${lesson.title}** (الوحدة ${bestMatch.unitNumber} • صفحة ${lesson.page})\n\n`;
      
      if (lesson.author) {
        response += `✍️ من تأليف الكاتب/الشاعر: **${lesson.author}**\n\n`;
      }

      // Add snippets
      response += `📝 **مقتطف من نص الدرس المعتمد:**\n`;
      response += `"${lesson.text.substring(0, 350)}..."\n\n`;

      if (lesson.vocabulary && lesson.vocabulary.length > 0) {
        response += `💡 **معاني المفردات الهامة في هذا الدرس:**\n`;
        lesson.vocabulary.slice(0, 3).forEach((v) => {
          response += `• الكلمة: **${v.word}** 👈 معناها: "${v.meaning}"${v.opposite ? ` (ضدها: "${v.opposite}")` : ""}\n`;
        });
        response += `\n`;
      }

      if (lesson.grammarFocus) {
        response += `🔍 **القاعدة النحوية المستفادة هنا:**\n`;
        response += `${lesson.grammarFocus}\n\n`;
      }

      response += `🙋‍♂️ هل تريد مني إعراب أي جملة من هذا الدرس، أو الانتقال لقصيدة أخرى؟ اكتب لي وسأجيبك فوراً!`;
      return response;
    }

    // Fallback general guidance
    return `👨‍🏫 مرحباً بك يا بني! لقد قمت بالبحث في كامل فصول كتاب اللغة العربية المطور للصف السادس.\n\nلم أجد نصاً مباشراً يتطابق تماماً مع سؤالك: "${query}"، ولكن إليك بعض المواضيع المقترحة التي تتقنها محركاتي تماماً:\n` +
           `• قصة كرم حاتم الطائي (الوحدة الأولى)\n` +
           `• ترشيد استهلاك المياه وسدود السودان (الوحدة الأولى)\n` +
           `• قصة المأمون ومؤدب ولديه يحيى الفراء (الوحدة الأولى)\n` +
           `• وصايا الحكيم لابنه والكذب ومجالس الصالحين (الوحدة الأولى)\n` +
           `• عناصر النجاح الستة (الثقة، التواضع، المسؤولية، الإصرار...) (الوحدة الثانية)\n` +
           `• الوقت وأهميته وقصيدة أبو العلاء المعري (الوحدة الثانية)\n` +
           `• الحرية شمس وقصة الهرة والكاتب مصطفى لطفي المنفلوطي (الوحدة الثانية)\n` +
           `• قصيدة وفاء الكلب للشاعر أحمد شوقي (الوحدة الثانية)\n` +
           `• قصة إحسان وأختها أروى وعملها في عيادة الطبيب (الوحدة الثانية)\n` +
           `• قصة ثورة الكتب ويعقوب وسقوط الملك المستبد (الوحدة الثانية)\n\n` +
           `اكتب أي كلمة أو سؤال بخصوص هذه المواضيع وسأعطيك الإجابة الفورية النموذجية! ✨`;
  };

  // Execute query wrapper simulating response latency for pleasant UI/UX feel
  const handleQuery = (queryText: string, mode: 'chat' | 'grammar' | 'search') => {
    if (!queryText.trim()) return;

    setLoading(true);

    if (mode === 'chat') {
      const userMsgId = Date.now().toString();
      setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: queryText }]);
      setInputText('');

      setTimeout(() => {
        const replyText = generateChatResponse(queryText);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: replyText }]);
        setLoading(false);
      }, 550);

    } else if (mode === 'grammar') {
      setGrammarResult('');
      setInputText('');

      setTimeout(() => {
        const result = analyzeGrammarLocally(queryText);
        setGrammarResult(result);
        setLoading(false);
      }, 450);

    } else if (mode === 'search') {
      setSearchResult([]);
      setSearchQueryAttempted(true);
      setInputText('');

      setTimeout(() => {
        const results = performCurriculumSearch(queryText);
        setSearchResult(results);
        setLoading(false);
      }, 400);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, mode: 'chat' | 'grammar' | 'search') => {
    if (e.key === 'Enter') {
      handleQuery(inputText, mode);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 bg-natural-bg text-natural-text min-h-screen transition-all select-none">
      
      {/* Smart Tutor Info Bar */}
      <div className="bg-white border border-natural-border p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 shadow-sm">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="bg-natural-accent/10 p-3 rounded-xl border border-natural-accent/20 text-natural-accent">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-natural-dark">المعلم والمساعد المدرسي الفوري</h2>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">توفير وحماية 100%</span>
            </div>
            <p className="text-natural-muted text-xs mt-1 font-medium">بحث فوري دقيق ومجاني في نصوص المنهج المدرسي للصف السادس دون الحاجة لذكاء اصطناعي مكلف!</p>
          </div>
        </div>

        {/* Sub-modes navigation */}
        <div className="flex space-x-2 space-x-reverse bg-natural-light p-1.5 rounded-xl border border-natural-border/60 self-start md:self-center">
          <button
            id="tab-tutor-chat"
            onClick={() => { setActiveMode('chat'); setInputText(''); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center ${
              activeMode === 'chat'
                ? 'bg-natural-accent text-white shadow-sm'
                : 'text-natural-muted hover:text-natural-dark'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 ml-1.5" />
            نقاش مع المعلم
          </button>
          
          <button
            id="tab-tutor-grammar"
            onClick={() => { setActiveMode('grammar'); setInputText(''); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center ${
              activeMode === 'grammar'
                ? 'bg-natural-accent text-white shadow-sm'
                : 'text-natural-muted hover:text-natural-dark'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 ml-1.5" />
            الإعراب المدرسي
          </button>

          <button
            id="tab-tutor-search"
            onClick={() => { setActiveMode('search'); setInputText(''); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center ${
              activeMode === 'search'
                ? 'bg-natural-accent text-white shadow-sm'
                : 'text-natural-muted hover:text-natural-dark'
            }`}
          >
            <Search className="h-3.5 w-3.5 ml-1.5" />
            البحث اللفظي
          </button>
        </div>
      </div>

      {/* Mode Renderers */}
      
      {/* 1. CHAT MODE */}
      {activeMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Suggestion Sidebar */}
          <div className="lg:col-span-1 bg-white p-4 rounded-3xl border border-natural-border space-y-4 shadow-sm h-fit">
            <div className="border-b border-natural-border pb-2.5">
              <h4 className="text-xs font-bold text-natural-dark font-serif">أسئلة مقترحة للنقاش:</h4>
              <p className="text-[10px] text-natural-muted mt-0.5 font-bold">انقر فوق أي بطاقة لبدء النقاش فوراً:</p>
            </div>
            <div className="flex flex-col space-y-2">
              {suggestionChips.chat.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuery(chip, 'chat')}
                  className="w-full text-right p-3 text-xs bg-natural-light border border-natural-border/70 rounded-xl hover:bg-natural-cream hover:border-natural-accent/40 text-natural-text transition-all leading-relaxed font-bold shadow-sm"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Main Chat Canvas */}
          <div className="lg:col-span-3 bg-white border border-natural-border rounded-3xl flex flex-col h-[520px] overflow-hidden shadow-sm">
            {/* Scrollable message content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 select-text">
              {messages.map((m) => {
                const isModel = m.role === 'model';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start ${isModel ? 'justify-start' : 'justify-end'} space-x-2 space-x-reverse`}
                  >
                    {isModel && (
                      <div className="p-2 bg-natural-accent/10 border border-natural-accent/20 rounded-xl text-natural-accent shrink-0">
                        <BookOpen className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-sm border ${
                        isModel
                          ? 'bg-natural-light border-natural-border text-natural-dark font-medium'
                          : 'bg-natural-accent border-natural-accent text-white rounded-tr-none font-bold'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-start justify-start space-x-2 space-x-reverse animate-pulse">
                  <div className="p-2 bg-natural-accent/10 border border-natural-accent/20 rounded-xl text-natural-accent shrink-0">
                    <BookOpen className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="bg-natural-light border border-natural-border text-natural-dark max-w-md px-4 py-3 rounded-2xl text-xs flex items-center font-bold">
                    <RefreshCw className="h-3.5 w-3.5 ml-2 animate-spin text-natural-accent" />
                    يبحث المعلم المساعد في المنهج المدرسي...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat footer input bar */}
            <div className="p-4 bg-natural-light/60 border-t border-natural-border flex items-center space-x-3 space-x-reverse">
              <input
                id="input-tutor-chat"
                type="text"
                disabled={loading}
                placeholder="اكتب سؤالك عن كرم حاتم، عناصر النجاح، قصيدة الكلب، ترشيد المياه..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, 'chat')}
                className="flex-1 bg-white border border-natural-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-natural-accent text-natural-dark font-bold transition-all"
              />
              <button
                id="btn-tutor-chat-submit"
                disabled={loading || !inputText.trim()}
                onClick={() => handleQuery(inputText, 'chat')}
                className="p-3 bg-natural-accent hover:bg-natural-accent-hover text-white rounded-xl shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. GRAMMAR MODE */}
      {activeMode === 'grammar' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sentences Suggestions */}
          <div className="lg:col-span-1 bg-white p-4 rounded-3xl border border-natural-border space-y-4 shadow-sm h-fit">
            <div className="border-b border-natural-border pb-2.5">
              <h4 className="text-xs font-bold text-natural-dark font-serif">أمثلة جمل للإعراب:</h4>
              <p className="text-[10px] text-natural-muted mt-0.5 font-bold">انقر فوق أي جملة للتحليل النحوي الفوري:</p>
            </div>
            <div className="flex flex-col space-y-2">
              {suggestionChips.grammar.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => { setInputText(chip); handleQuery(chip, 'grammar'); }}
                  className="w-full text-right p-3 text-xs bg-natural-light border border-natural-border/70 rounded-xl hover:bg-natural-cream hover:border-natural-accent/40 text-natural-text transition-all font-serif font-bold shadow-sm"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Grammar Parser Panel */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-natural-border rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-xs text-natural-dark font-serif">أدخل أي جملة عربية من دروس المنهج لتحليلها وإعرابها فوراً:</h3>
              <div className="flex items-center space-x-3 space-x-reverse">
                <input
                  id="input-tutor-grammar"
                  type="text"
                  disabled={loading}
                  placeholder="مثال: ذبحَ الغلامُ الغنمَ بأسرِها..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, 'grammar')}
                  className="flex-1 bg-natural-light border border-natural-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-natural-accent text-natural-dark transition-all font-bold"
                />
                <button
                  id="btn-tutor-grammar-submit"
                  disabled={loading || !inputText.trim()}
                  onClick={() => handleQuery(inputText, 'grammar')}
                  className="px-5 py-3 bg-natural-accent hover:bg-natural-accent-hover text-white rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center shrink-0 shadow-sm animate-pulse"
                >
                  {loading && <RefreshCw className="h-3 w-3 ml-1.5 animate-spin" />}
                  ابدأ الإعراب
                </button>
              </div>
            </div>

            {/* Parse Result Output */}
            {(grammarResult || loading) && (
              <div className="bg-white border border-natural-accent/35 rounded-3xl p-6 space-y-4 shadow-sm select-text">
                <div className="flex items-center justify-between border-b border-natural-border pb-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Sparkles className="h-5 w-5 text-natural-accent" />
                    <h4 className="font-bold text-xs text-natural-dark font-serif">التحليل النحوي المدرسي المعتمد (الصف السادس):</h4>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">مُعرب فوري آمن</span>
                </div>

                {loading ? (
                  <div className="space-y-3 py-4 animate-pulse">
                    <div className="h-4 bg-natural-light rounded w-1/3"></div>
                    <div className="h-3 bg-natural-light rounded w-full"></div>
                    <div className="h-3 bg-natural-light rounded w-5/6"></div>
                  </div>
                ) : (
                  <div className="font-serif leading-relaxed text-right text-natural-dark text-sm whitespace-pre-line tracking-wide select-text font-bold bg-amber-50/20 p-4 rounded-2xl border border-amber-100">
                    {grammarResult}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SEARCH MODE */}
      {activeMode === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search suggestions */}
          <div className="lg:col-span-1 bg-white p-4 rounded-3xl border border-natural-border space-y-4 shadow-sm h-fit">
            <div className="border-b border-natural-border pb-2.5">
              <h4 className="text-xs font-bold text-natural-dark font-serif">كلمات ومفاهيم شائعة للبحث:</h4>
              <p className="text-[10px] text-natural-muted mt-0.5 font-bold">انقر فوق المصطلح للبحث السريع المباشر:</p>
            </div>
            <div className="flex flex-col space-y-2">
              {suggestionChips.search.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => { setInputText(chip); handleQuery(chip, 'search'); }}
                  className="w-full text-right p-3 text-xs bg-natural-light border border-natural-border/70 rounded-xl hover:bg-natural-cream hover:border-natural-accent/40 text-natural-text transition-all font-bold shadow-sm"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Search Result Canvas */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-natural-border rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-xs text-natural-dark font-serif">ابحث عن أي كلمة أو موضوع أو قاعدة في المنهج بالكامل:</h3>
              <div className="flex items-center space-x-3 space-x-reverse">
                <input
                  id="input-tutor-search"
                  type="text"
                  disabled={loading}
                  placeholder="ابحث عن: المفعول المطلق، يوسف، ترشيد المياه، حاتم..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, 'search')}
                  className="flex-1 bg-natural-light border border-natural-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-natural-accent text-natural-dark transition-all font-bold"
                />
                <button
                  id="btn-tutor-search-submit"
                  disabled={loading || !inputText.trim()}
                  onClick={() => handleQuery(inputText, 'search')}
                  className="px-5 py-3 bg-natural-accent hover:bg-natural-accent-hover text-white rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center shrink-0 shadow-sm"
                >
                  {loading && <RefreshCw className="h-3 w-3 ml-1.5 animate-spin" />}
                  ابحث الآن
                </button>
              </div>
            </div>

            {/* Search result output */}
            {searchQueryAttempted && (
              <div className="bg-white border border-natural-accent/35 rounded-3xl p-6 space-y-4 shadow-sm select-text">
                <div className="flex items-center justify-between border-b border-natural-border pb-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Search className="h-5 w-5 text-natural-accent" />
                    <h4 className="font-bold text-xs text-natural-dark font-serif">نتائج البحث المستخرجة مباشرة من المنهج والمقرر:</h4>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">بـحـث مـوثـوق</span>
                </div>

                {loading ? (
                  <div className="space-y-3 py-4 animate-pulse">
                    <div className="h-4 bg-natural-light rounded w-1/4"></div>
                    <div className="h-3 bg-natural-light rounded w-full"></div>
                    <div className="h-3 bg-natural-light rounded w-11/12"></div>
                  </div>
                ) : searchResult.length > 0 ? (
                  <div className="space-y-6">
                    {searchResult.map((res, index) => (
                      <div key={index} className="p-4 bg-natural-light/50 border border-natural-border rounded-2xl space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-natural-border/30 pb-2">
                          <h5 className="font-serif font-bold text-xs text-natural-accent">
                            📖 {res.lesson.title}
                          </h5>
                          <span className="text-[10px] text-natural-muted font-bold mt-1 sm:mt-0">
                            الوحدة {res.unitNumber} • صفحة {res.lesson.page}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {res.matches.map((match: string, mIdx: number) => (
                            <p key={mIdx} className="text-xs text-natural-dark leading-relaxed font-sans font-medium whitespace-pre-line border-r-2 border-amber-400 pr-2">
                              {match}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-natural-muted text-xs font-bold">
                    ⚠️ لم نجد نتائج لـ "{inputText}". جرب كلمات أبسط مثل "كرم"، "الوقت"، "شوقي".
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
