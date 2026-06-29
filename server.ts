import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client securely
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date() });
  });

  // Smart Search and Interactive Tutor API Endpoint
  app.post("/api/tutor", async (req, res) => {
    try {
      const { message, chatHistory, actionType, textContext } = req.body;
      
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(500).json({ 
          error: "مفتاح واجهة برمجة التطبيقات لجيميني (GEMINI_API_KEY) غير مكوّن. يرجى تهيئته في لوحة الإعدادات (Secrets) في AI Studio." 
        });
      }

      // Action types: 'search' | 'chat' | 'grammar'
      let prompt = "";
      const systemInstruction = `أنت معلم اللغة العربية الذكي والمشرف والموجّه لطلاب الصف السادس الابتدائي في جمهورية السودان.
تلتزم بمنهج اللغة العربية الرسمي للصف السادس المكون من 5 وحدات.
منهج الطالب يحتوي على نصوص قراءة وقصائد وقواعد نحوية وإملائية مثل:
- الفاعل وعلامات رفعه (الضمة، الألف للمثنى، الواو لجمع المذكر السالم).
- المفعول به وعلامات نصبه (الفتحة، الكسرة لجمع المؤنث السالم، الياء للمثنى وجمع المذكر السالم).
- المفعول المطلق (مؤكد للفعل، مبين للنوع، مبين للعدد).
- الضمائر المنفصلة (أنا، نحن، هو، هي، هما، هم، هن، إلخ).
- النعت والمنعوت (الصفة والموصوف) ومطابقته في الحركة والنوع والعدد.
- المضاف والمضاف إليه وجر المضاف إليه بالكسرة أو الياء.
- الألف اللينة في نهاية الأفعال (قائمة مثل دعا/دنا، مقصورة مثل رمى/سقى).
- همزة الوصل وهمزة القطع، والفرق بينهما.
- التاء المربوطة (ـة) والهاء (ـه) في نهاية الكلمة.
- حذف ألف (يا) النداء إذا وقع بعدها (ابن، ابنة، أهل، أيها، أيتها).

أجب باللغة العربية الفصحى المبسطة والواضحة، واستخدم التشكيل وعلامات الترقيم لتسهيل القراءة للطلاب. كن ودوداً، مشجعاً، واستخدم أسلوباً تربوياً ملهماً.
إذا سألك الطالب عن درس أو كلمة خارج المنهج، نبهه بلطف وركز على دروس المنهج الرسمية ولكن أجب عن سؤاله بشكل صحيح ومبسط مع ضرب أمثلة من دروس الكتاب إذا تيسر.`;

      if (actionType === "search") {
        prompt = `ابحث في منهج الصف السادس الابتدائي للغة العربية عن هذا الاستفسار: "${message}".
قم بتوفير إجابة توضح الدروس ذات الصلة في المنهج وتلخيص مبسط ومفيد للمحتوى والمعلومات اللغوية أو النحوية الواردة فيها.`;
      } else if (actionType === "grammar") {
        prompt = `قم بإعراب الجملة التالية إعراباً لغوياً تفصيلياً مبسطاً يناسب طالب الصف السادس الابتدائي في السودان: "${message}".
اشرح القواعد النحوية المرتبطة بها (مثل تحديد الفاعل، المفعول به، المبتدأ والخبر، النعت والمنعوت، المضاف والمضاف إليه، المفعول المطلق) بناءً على ما يدرسه في المنهج.`;
      } else {
        // General Chat with tutoring context
        prompt = `رسالة الطالب: "${message}"`;
        if (textContext) {
          prompt += `\n\nالسياق الحالي (الدرس أو الموضوع النشط الذي يتصفحه الطالب): ${textContext}`;
        }
      }

      // Convert chatHistory to Gemini contents format
      const contents = [];
      if (chatHistory && Array.isArray(chatHistory)) {
        for (const turn of chatHistory) {
          contents.push({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.text }]
          });
        }
      }
      contents.push({ role: "user", parts: [{ text: prompt }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error?.message || "حدث خطأ غير متوقع أثناء معالجة الطلب." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
