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
  const [explanationStyle, setExplanationStyle] = useState<'simple' | 'detailed'>('simple');
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
        extraContext = `💡 ملاحظة من درس "${match.lesson.title}":\n"${match.lesson.grammarFocus}"\n\n`;
      }
    }

    let analysis = `📝 إعراب الجملة: "${trimmed}" (${explanationStyle === 'simple' ? 'نمط مبسط' : 'نمط تفصيلي'})\n`;
    analysis += `━━━━━━━━━━━━━━━━━━━━━━\n`;

    if (explanationStyle === 'detailed') {
      analysis += `📌 [قواعد عامة مطبقة في هذا الإعراب]:\n`;
      analysis += `- فحص الكلمة لتحديد نوعها: (اسم، فعل، حرف).\n`;
      analysis += `- تحديد الحالة الإعرابية: (الرفع، النصب، الجر) وعلامتها.\n\n`;
    }

    // Try parsing words
    const words = trimmed.split(/\s+/);
    let parsedCount = 0;

    // Common words list mapping to Grade 6 rules
    const rules: { [key: string]: { pos: string, grammatical: string, detailedGrammar?: string } } = {
      'ذبح': { pos: 'فعل ماضٍ', grammatical: 'مبني على الفتح الظاهر على آخره.', detailedGrammar: 'فعل ماضٍ ثلاثي مبني على الفتح الظاهر على آخره، والفاعل هو الذي قام بالفعل.' },
      'سأل': { pos: 'فعل ماضٍ', grammatical: 'مبني على الفتح الظاهر على آخره.', detailedGrammar: 'فعل ماضٍ مبني على الفتح الظاهر، والهمزة فيه همزة قطع أصلية.' },
      'سجدت': { pos: 'فعل ماضٍ', grammatical: 'مبني على السكون لاتصاله بتاء الفاعل، والتاء ضمير متصل مبني في محل رفع فاعل.', detailedGrammar: 'فعل ماضٍ مبني على السكون لاتصاله بضمير الرفع المتحرك (التاء)، والتاء ضمير متصل مبني على الضم في محل رفع فاعل.' },
      'يعاني': { pos: 'فعل مضارع', grammatical: 'مرفوع وعلامة رفعه الضمة المقدرة للثقل.', detailedGrammar: 'فعل مضارع مرفوع لتجرده من الناصب والجازم، وعلامة رفعه الضمة المقدرة على الياء منع من ظهورها الثقل.' },
      'يواجه': { pos: 'فعل مضارع', grammatical: 'مرفوع وعلامة رفعه الضمة الظاهرة على آخره.', detailedGrammar: 'فعل مضارع مرفوع وعلامة رفعه الضمة الظاهرة على آخره، والفاعل ضمير مستتر أو اسم ظاهر.' },
      'الغلام': { pos: 'فاعل', grammatical: 'مرفوع وعلامة رفعه الضمة الظاهرة على آخره.', detailedGrammar: 'فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره، وهو المفرد المعرف بأل الذي قام بالفعل.' },
      'رجل': { pos: 'فاعل', grammatical: 'مرفوع وعلامة رفعه الضمة الظاهرة على آخره.', detailedGrammar: 'فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره، وجاء نكرة ليدل على العموم.' },
      'الناس': { pos: 'فاعل أو مفعول به', grammatical: 'حسب موقعها (مرفوع بالضمة أو منصوب بالفتحة).', detailedGrammar: 'اسم جنس معرف بأل، يعرب إما فاعلاً مرفوعاً بالضمة الظاهرة أو مفعولاً به منصوباً بالفتحة الظاهرة حسب سياق الجملة.' },
      'الغنم': { pos: 'مفعول به', grammatical: 'منصوب وعلامة نصبه الفتحة الظاهرة على آخره.', detailedGrammar: 'مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره، وهو الاسم الذي وقع عليه فعل الفاعل.' },
      'المياه': { pos: 'مضاف إليه أو مفعول به', grammatical: 'مجرور بالكسرة أو منصوب بالفتحة.', detailedGrammar: 'اسم معرف بـ أل، يقع مضافاً إليه مجروراً وعلامة جره الكسرة الظاهرة، أو مفعولاً به منصوباً بالفتحة حسب علاقته بما قبله.' },
      'الناجحون': { pos: 'مبتدأ', grammatical: 'مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم.', detailedGrammar: 'مبتدأ مرفوع وعلامة رفعه الواو نيابة عن الضمة لأنه جمع مذكر سالم، والنون عوض عن التنوين في الاسم المفرد.' },
      'ماهرون': { pos: 'خبر المبتدأ', grammatical: 'مرفوع وعلامة رفعه الواو لأنه جمع مذكر سالم.', detailedGrammar: 'خبر المبتدأ مرفوع وعلامة رفعه الواو نيابة عن الضمة لأنه جمع مذكر سالم، وبه يتم معنى الجملة الاسمية.' },
      'المعلم': { pos: 'مبتدأ', grammatical: 'مرفوع وعلامة رفعه الضمة الظاهرة على آخره.', detailedGrammar: 'مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره، وهو الاسم المعرف بأل الذي تبدأ به الجملة الاسمية.' },
      'محبوب': { pos: 'خبر المبتدأ', grammatical: 'مرفوع وعلامة رفعه الضمة الظاهرة على آخره.', detailedGrammar: 'خبر المبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره، وهو الجزء الذي يكمل الفائدة مع المبتدأ.' },
      'الحرية': { pos: 'مبتدأ', grammatical: 'مرفوع وعلامة رفعه الضمة الظاهرة على آخره.', detailedGrammar: 'مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره، وبها تبدأ الجملة لبيان أهميتها.' },
      'شمس': { pos: 'خبر المبتدأ', grammatical: 'مرفوع وعلامة رفعه الضمة الظاهرة على آخره.', detailedGrammar: 'خبر المبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره، وجاء تشبيهاً بليغاً لتوضيح معنى الحرية.' },
      'في': { pos: 'حرف جر', grammatical: 'مبني لا محل له من الإعراب.', detailedGrammar: 'حرف جر مبني على السكون لا محل له من الإعراب، ويجر الاسم الواقع بعده.' },
      'على': { pos: 'حرف جر', grammatical: 'مبني لا محل له من الإعراب.', detailedGrammar: 'حرف جر مبني على السكون المقدر على الألف لا محل له من الإعراب.' },
      'من': { pos: 'حرف جر', grammatical: 'مبني لا محل له من الإعراب.', detailedGrammar: 'حرف جر مبني على السكون لا محل له من الإعراب، وقد يحرك بالفتح منعاً لالتقاء الساكنين.' },
      'إلى': { pos: 'حرف جر', grammatical: 'مبني لا محل له من الإعراب.', detailedGrammar: 'حرف جر مبني على السكون المقدر على الألف المقصورة لا محل له من الإعراب.' },
      'لله': { pos: 'جار ومجرور', grammatical: 'اللام حرف جر، ولفظ الجلالة اسم مجرور وعلامة جره الكسرة الظاهرة.', detailedGrammar: 'اللام حرف جر مبني على الكسر، ولفظ الجلالة (الله) اسم مجرور باللام وعلامة جره الكسرة الظاهرة في آخره.' },
      'أمس': { pos: 'ظرف زمان', grammatical: 'مبني على الكسر في محل نصب.', detailedGrammar: 'ظرف زمان مبني على الكسر في محل نصب مفعول فيه.' },
      'المفعول': { pos: 'مصطلح نحوي', grammatical: 'يدرس الطالب المفعول به والمفعول المطلق والمفعول لأجله.', detailedGrammar: 'لفظ نحوي يطلق على الأسماء المنصوبة التابعة للأفعال، مثل المفعول به والمفعول المطلق والمفعول لأجله.' },
      'إياك': { pos: 'ضمير منفصل', grammatical: 'مبني في محل نصب مفعول به لفعل محذوف تقديره (أحذر) وهو أسلوب تحذير.', detailedGrammar: 'ضمير منفصل مبني على الفتح في محل نصب مفعول به مقدم لفعل محذوف وجوباً تقديره (أحذر)، والكاف للخطاب.' }
    };

    words.forEach((w) => {
      const cleanW = w.replace(/[،.؟!:""'']/g, "");
      const normW = normalizeArabic(cleanW);
      
      // Look up in rules
      let found = false;
      for (const [key, val] of Object.entries(rules)) {
        if (normW === normalizeArabic(key) || normW.includes(normalizeArabic(key))) {
          const detail = explanationStyle === 'detailed' && val.detailedGrammar ? val.detailedGrammar : val.grammatical;
          analysis += `• كلمة [${cleanW}]: هي ${val.pos} 👈 ${detail}\n`;
          found = true;
          parsedCount++;
          break;
        }
      }

      if (!found) {
        // Fallback guessing
        if (normW.startsWith("ال") && normW.endsWith("ون")) {
          analysis += `• كلمة [${cleanW}]: جمع مذكر سالم (مرفوع بالواو نيابة عن الضمة، والنون عوض عن التنوين).\n`;
          if (explanationStyle === 'detailed') {
            analysis += `  * تفصيل: علامة رفعه فرعية وهي الواو، ويدل على أكثر من اثنين بزيادة واو ونون.\n`;
          }
          parsedCount++;
        } else if (normW.startsWith("ال") && normW.endsWith("ين")) {
          analysis += `• كلمة [${cleanW}]: جمع مذكر سالم أو مثنى (منصوب أو مجرور بالياء).\n`;
          if (explanationStyle === 'detailed') {
            analysis += `  * تفصيل: الياء علامة إعراب فرعية تستعمل في حالتي النصب والجر لجمع المذكر والمثنى.\n`;
          }
          parsedCount++;
        } else if (normW.startsWith("ال")) {
          analysis += `• كلمة [${cleanW}]: اسم معرّف بـ (أل) وعلامة إعرابه تتبع موقعه في الجملة.\n`;
          if (explanationStyle === 'detailed') {
            analysis += `  * تفصيل: اسم معرف بـ ال التعريف، يقبل الحركات الأصلية (الضمة، الفتحة، الكسرة) ولا ينون.\n`;
          }
          parsedCount++;
        } else if (normW.length >= 3 && (normW.endsWith("ت") || normW.startsWith("ت") || normW.startsWith("ي") || normW.startsWith("ن") || normW.startsWith("أ"))) {
          analysis += `• كلمة [${cleanW}]: فعل (ماضٍ أو مضارع) تظهر عليه علامة البناء أو الإعراب المناسبة.\n`;
          if (explanationStyle === 'detailed') {
            analysis += `  * تفصيل: يحتوي على حرف من حروف المضارعة أو تاء الفاعل/التأنيث مما يدل على حركته الزمنية.\n`;
          }
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
    
    if (explanationStyle === 'detailed') {
      analysis += `📘 **قواعد تفصيلية هامة في المقرر:**\n`;
      analysis += `١. **الفاعل:** اسم مرفوع يقع بعد الفعل المبني للمعلوم ويدل على من فعل الفعل. علامات رفعه:\n`;
      analysis += `   - الضمة الظاهرة (للمفرد وجمع التكسير وجمع المؤنث السالم).\n`;
      analysis += `   - الألف (للمثنى).\n`;
      analysis += `   - الواو (لجمع المذكر السالم والأشخاص الخمسة مثل أبوك أخوك).\n`;
      analysis += `٢. **المفعول به:** اسم منصوب يدل على من وقع عليه فعل الفاعل. علامات نصبه:\n`;
      analysis += `   - الفتحة الظاهرة (للمفرد وجمع التكسير).\n`;
      analysis += `   - الكسرة نيابة عن الفتحة (لجمع المؤنث السالم).\n`;
      analysis += `   - الياء (للمثنى وجمع المذكر السالم).\n`;
      analysis += `٣. **المفعول المطلق:** مصدر منصوب يذكر بعد فعل من لفظه لتأكيده أو لبيان نوعه أو عدده.\n\n`;
    }

    analysis += `🎓 نصيحة المعلم النحوية:\n` +
                `تذكّر يا بني دائماً أن:\n` +
                `- الفاعل يكون دائماً مرفوعاً.\n` +
                `- المفعول به يكون دائماً منصوباً.\n` +
                `- المفعول المطلق مصدر منصوب يؤكد الفعل أو يبين نوعه أو عدده (مثل: رابني ريباً، وضربت ضرباً).`;

    return analysis;
  };

  // Chat/Dialogue Answering Engine
  const generateChatResponse = (query: string): string => {
    const normQuery = normalizeArabic(query);
    
    // Quick greeting matches
    if (normQuery.match(/(مرحبا|اهلا|السلام عليكم|سلام|صباح الخير|مساء الخير|كيف حالك)/i)) {
      return `وعليكم السلام ورحمة الله وبركاته! أهلاً بك يا بني العزيز 🌟\n\nأنا معلمك الافتراضي المساعد هنا لخدمتك طوال الوقت في إطار المنهج المدرسي للصف السادس الابتدائي لجمهورية السودان.\n\nلقد حددت نمط الشرح الحالي ليكون: **[${explanationStyle === 'simple' ? 'شرح مبسط ومختصر 📚' : 'شرح تفصيلي وشامل 🔍'}]**.\n\nيمكنك سؤالي عن أي درس من دروس كتاب القراءة، القصائد، معاني المفردات، أو القواعد النحوية وسأبسط لك الشرح فوراً وبدون أي تكلفة! كيف يمكنني مساعدتك؟`;
    }

    // Search curriculum
    const searchMatches = performCurriculumSearch(query);
    
    if (searchMatches.length > 0) {
      const bestMatch = searchMatches[0];
      const lesson = bestMatch.lesson;
      
      if (explanationStyle === 'simple') {
        let response = `👨‍🏫 أهلاً بك! إليك **شرحاً مبسطاً وسريعاً** من درس:\n`;
        response += `📖 **${lesson.title}** (صفحة ${lesson.page})\n\n`;
        
        response += `📝 **الفكرة الأساسية للدرس:**\n`;
        response += `"${lesson.text.substring(0, 180)}..."\n\n`;

        if (lesson.vocabulary && lesson.vocabulary.length > 0) {
          response += `💡 **أهم مفردة في الدرس:**\n`;
          const v = lesson.vocabulary[0];
          response += `• الكلمة: **${v.word}** 👈 تعني: "${v.meaning}"${v.opposite ? ` (مضادها: "${v.opposite}")` : ""}\n\n`;
        }

        if (lesson.grammarFocus) {
          response += `🔍 **القاعدة النحوية باختصار:**\n`;
          response += `${lesson.grammarFocus.split(/[.،]/)[0]}...\n\n`;
        }

        response += `🙋‍♂️ هل تود معرفة تفاصيل أكثر وتعمق أكبر؟ يمكنك تغيير نمط الشرح إلى "شرح تفصيلي" في الأعلى!`;
        return response;
      } else {
        // Detailed Style
        let response = `👨‍🏫 أهلاً بك يا بني! إليك **شرحاً تفصيلياً وتعمقاً شاملاً** لدرس:\n`;
        response += `📖 **${lesson.title}** (الوحدة ${bestMatch.unitNumber} • صفحة ${lesson.page})\n\n`;
        
        if (lesson.author) {
          response += `✍️ كاتب/شاعر هذا الدرس هو الأديب: **${lesson.author}**، وتتميز كتاباته بالبلاغة والأسلوب اللغوي المتميز في المنهج السوداني.\n\n`;
        }

        response += `📝 **النص الكامل والمعتمد للدرس:**\n`;
        response += `"${lesson.text}"\n\n`;

        if (lesson.vocabulary && lesson.vocabulary.length > 0) {
          response += `💡 **معجم المفردات والتراكيب اللغوية بالتفصيل:**\n`;
          lesson.vocabulary.forEach((v) => {
            response += `• الكلمة: **${v.word}**\n  👈 المعنى اللغوي: "${v.meaning}"\n${v.opposite ? `  👈 المضاد/العكس: "${v.opposite}"\n` : ""}`;
          });
          response += `\n`;
        }

        if (lesson.grammarFocus) {
          response += `🔍 **الدراسة النحوية والقواعد المرتبطة بالدرس:**\n`;
          response += `${lesson.grammarFocus}\n\n`;
          response += `🛡️ **تطبيقات نحوية مستخرجة من الدرس:**\n`;
          response += `١. استخراج الكلمات وتصنيفها من حيث علامات الإعراب الأصلية والفرعية.\n`;
          response += `٢. دراسة التركيب النحوي للجمل المستفادة وتحديد أركانها الرئيسية والفرعية.\n\n`;
        }

        if (lesson.quiz && lesson.quiz.length > 0) {
          response += `❓ **سؤال تفاعلي لتقييم الفهم واستيعاب الدرس:**\n`;
          const q = lesson.quiz[0];
          response += `السؤال: ${q.question}\n`;
          response += `👈 الإجابة النموذجية مع الشرح: **${q.answer}**\n`;
          if (q.explanation) {
            response += `   *توضيح تربوي:* ${q.explanation}\n\n`;
          }
        }

        response += `✨ يمكنك سؤالي عن إعراب أي جملة محددة من هذا النص، أو الاستفسار عن تفاصيل المعاني، وسأجيبك بكل سرور!`;
        return response;
      }
    }

    // Fallback general guidance
    if (explanationStyle === 'simple') {
      return `👨‍🏫 مرحباً بك يا بني! لقد بحثت في فصول كتاب اللغة العربية للصف السادس.\n\nلم أجد نصاً مباشراً يتطابق تماماً مع سؤالك: "${query}".\n\n💡 **مواضيع مقترحة يسهل شرحها:**\n` +
             `• قصة كرم حاتم الطائي (الوحدة الأولى)\n` +
             `• ترشيد استهلاك المياه وسدود السودان (الوحدة الأولى)\n` +
             `• عناصر النجاح الستة (الوحدة الثانية)\n` +
             `• قصيدة وفاء الكلب لأحمد شوقي (الوحدة الثانية)\n\n` +
             `اكتب أي سؤال بخصوص هذه المواضيع وسأبسط لك الشرح فوراً! ✨`;
    } else {
      return `👨‍🏫 مرحباً بك يا بني! لقد قمت بالبحث المعمق في كامل فصول كتاب المنهج المطور للصف السادس لجمهورية السودان.\n\nلم أجد نصاً مباشراً يتطابق تماماً مع سؤالك: "${query}"، ولكن إليك دليلاً شاملاً للمواضيع التي تتقنها محركاتي تماماً ويمكنك الاستفسار عنها:\n\n` +
             `📖 **مواضيع الوحدة الأولى (العقيدة والوطن وكرم العرب):**\n` +
             `• قصة كرم حاتم الطائي وأهمية المروءة والسخاء.\n` +
             `• ترشيد استهلاك المياه وسدود السودان (سد سنار وسد الروصيرص).\n` +
             `• قصة الخليفة المأمون ومؤدب ولديه يحيى بن زياد الفراء.\n` +
             `• وصايا الحكيم لابنه والابتعاد عن الكذب ومجالس الصالحين.\n\n` +
             `📖 **مواضيع الوحدة الثانية (النجاح والوقت والحرية والوفاء والتعاون):**\n` +
             `• عناصر النجاح الستة (الثقة بالله، التواضع، المسؤولية، الإصرار، الإبداع، المهارة).\n` +
             `• الوقت وأهميته وقصيدة أبو العلاء المعري في تنظيم الساعات.\n` +
             `• الحرية شمس وقصة الهرة والكاتب مصطفى لطفي المنفلوطي.\n` +
             `• قصيدة وفاء الكلب الرائعة للشاعر أحمد شوقي.\n` +
             `• قصة إحسان وأختها أروى والعمل الإنساني في عيادة الطبيب.\n` +
             `• قصة ثورة الكتب وصراع العلم ضد الملك المستبد.\n\n` +
             `اكتب أي كلمة مفتاحية أو سؤال تفصيلي بخصوص هذه المواضيع وسأعطيك الشرح الكامل والإجابة الفورية النموذجية! ✨`;
    }
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

      {/* Explanation Style Selection Bar */}
      <div className="bg-white border border-natural-border px-6 py-4 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm" dir="rtl">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold text-natural-dark font-serif block">نمط وعمق الشرح التعليمي:</span>
            <p className="text-[10px] text-natural-muted font-medium mt-0.5">اختر بين التوضيح المبسط السريع أو الشرح المتعمق والمفصل للإعراب والمفردات.</p>
          </div>
        </div>
        <div className="flex p-1 bg-natural-light rounded-xl border border-natural-border/60 self-start sm:self-center">
          <button
            onClick={() => setExplanationStyle('simple')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer ${
              explanationStyle === 'simple'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-natural-muted hover:text-natural-dark'
            }`}
          >
            📚 شرح مبسط ومختصر
          </button>
          <button
            onClick={() => setExplanationStyle('detailed')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer ${
              explanationStyle === 'detailed'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-natural-muted hover:text-natural-dark'
            }`}
          >
            🔍 شرح تفصيلي ومتعمق
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
