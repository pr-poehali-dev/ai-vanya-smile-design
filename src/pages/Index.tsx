import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  emoji?: string;
  time: string;
}

const DEMO_RESPONSES = [
  { text: "Привет! Я Ваня — твой умный помощник 🤖 Чем могу помочь сегодня?", emoji: "🤖" },
  { text: "Отличный вопрос! Я обрабатываю миллионы данных в секунду, чтобы дать тебе лучший ответ 🚀", emoji: "🚀" },
  { text: "Понял тебя! Давай разберёмся вместе. Я всегда рядом 💙", emoji: "💙" },
  { text: "Это интересно! Могу рассказать подробнее или помочь с чем-то ещё? ✨", emoji: "✨" },
  { text: "Конечно! Я готов помочь тебе с любым вопросом 24/7 🌟", emoji: "🌟" },
  { text: "Хороший выбор! Я уже анализирую информацию для тебя 🧠", emoji: "🧠" },
];

const FEATURES = [
  {
    emoji: "💬",
    title: "Умные ответы",
    desc: "Ваня понимает контекст разговора и отвечает точно и по делу, как настоящий собеседник.",
  },
  {
    emoji: "🔊",
    title: "Озвучивание",
    desc: "Нажми на кнопку — и Ваня прочитает ответ вслух приятным голосом. Удобно когда руки заняты.",
  },
  {
    emoji: "🎙️",
    title: "Голосовой ввод",
    desc: "Говори — Ваня слышит. Распознаёт речь и мгновенно переводит в текст.",
  },
  {
    emoji: "😊",
    title: "Живые эмоции",
    desc: "Ваня общается тепло и эмоционально — со смайлами и живым стилем, а не сухим роботом.",
  },
  {
    emoji: "⚡",
    title: "Мгновенный ответ",
    desc: "Ответ появляется за секунды. Никаких долгих ожиданий — Ваня всегда на связи.",
  },
  {
    emoji: "🛡️",
    title: "Безопасность",
    desc: "Все разговоры защищены. Ваня не сохраняет личные данные без вашего согласия.",
  },
];

const getTime = () =>
  new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      text: "Привет! 👋 Я Ваня — твой личный ИИ-ассистент. Спроси меня что угодно!",
      emoji: "👋",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState("chat");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formSent, setFormSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const msgIdRef = useRef(2);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: msgIdRef.current++,
      role: "user",
      text: text.trim(),
      time: getTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const resp = DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];
      const aiMsg: Message = {
        id: msgIdRef.current++,
        role: "ai",
        text: resp.text,
        emoji: resp.emoji,
        time: getTime(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const speak = (msg: Message) => {
    if (!("speechSynthesis" in window)) return;
    if (speakingId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(msg.text.replace(/[\u{1F000}-\u{1FFFF}]/gu, ""));
    utt.lang = "ru-RU";
    utt.rate = 0.95;
    utt.pitch = 1.1;
    setSpeakingId(msg.id);
    utt.onend = () => setSpeakingId(null);
    utt.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utt);
  };

  const toggleRecording = () => {
    const w = window as Window & { SpeechRecognition?: new () => { lang: string; interimResults: boolean; onresult: ((e: { results: { transcript: string }[][] }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void }; webkitSpeechRecognition?: new () => { lang: string; interimResults: boolean; onresult: ((e: { results: { transcript: string }[][] }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void } };
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Ваш браузер не поддерживает распознавание речи 😔");
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "ru-RU";
    rec.interimResults = false;
    rec.onresult = (e: { results: { transcript: string }[][] }) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
    rec.start();
    setIsRecording(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  return (
    <div className="min-h-screen mesh-bg font-['Golos_Text',sans-serif]">
      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[hsl(220,30%,7%)]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center text-lg glow-blue-sm">
              🤖
            </div>
            <span className="font-bold text-xl text-white">
              Ваня<span className="text-[hsl(var(--primary))]">.</span>
            </span>
          </div>
          <div className="flex gap-1">
            {[
              { id: "chat", label: "Чат" },
              { id: "features", label: "Возможности" },
              { id: "contact", label: "Контакты" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === s.id
                    ? "bg-[hsl(var(--primary))] text-[hsl(220,30%,7%)]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-[hsl(205,60%,12%)] border border-[hsl(var(--primary))]/30 rounded-full px-4 py-1.5 text-sm text-[hsl(var(--primary))] mb-6">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse"></span>
          Онлайн и готов помочь
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
          Познакомься с{" "}
          <span className="text-[hsl(var(--primary))] text-glow">Ваней</span> 👋
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto mb-2">
          Умный ИИ-ассистент, который общается по-человечески — со смайлами, голосом и настроением
        </p>
      </section>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* CHAT SECTION */}
        {activeSection === "chat" && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="bg-[hsl(220,25%,10%)] border border-white/8 rounded-3xl overflow-hidden glow-blue">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full gradient-blue flex items-center justify-center text-xl">
                    🤖
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[hsl(220,25%,10%)] rounded-full"></span>
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Ваня</p>
                  <p className="text-xs text-emerald-400">в сети</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-white/30 text-xs">
                  <Icon name="Lock" size={12} />
                  <span>защищено</span>
                </div>
              </div>

              {/* Messages */}
              <div className="h-[400px] overflow-y-auto p-5 space-y-4 scrollbar-thin">
                {messages.map((msg, i) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 animate-fade-in-up ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {msg.role === "ai" && (
                      <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center text-base flex-shrink-0">
                        🤖
                      </div>
                    )}
                    <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "chat-bubble-user rounded-tr-sm"
                            : "chat-bubble-ai rounded-tl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/25">{msg.time}</span>
                        {msg.role === "ai" && (
                          <button
                            onClick={() => speak(msg)}
                            className={`text-xs flex items-center gap-1 transition-colors ${
                              speakingId === msg.id
                                ? "text-[hsl(var(--primary))]"
                                : "text-white/25 hover:text-white/50"
                            }`}
                          >
                            <Icon name={speakingId === msg.id ? "VolumeX" : "Volume2"} size={12} />
                            {speakingId === msg.id ? "стоп" : "слушать"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 animate-fade-in-up">
                    <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center text-base flex-shrink-0">
                      🤖
                    </div>
                    <div className="chat-bubble-ai px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                      <span className="typing-dot w-2 h-2 bg-[hsl(var(--primary))] rounded-full inline-block"></span>
                      <span className="typing-dot w-2 h-2 bg-[hsl(var(--primary))] rounded-full inline-block"></span>
                      <span className="typing-dot w-2 h-2 bg-[hsl(var(--primary))] rounded-full inline-block"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-4 border-t border-white/8">
                <div className="flex items-center gap-2 bg-[hsl(220,20%,14%)] border border-white/8 rounded-2xl px-4 py-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Напиши Ване что-нибудь... 💬"
                    className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none"
                  />
                  <button
                    onClick={toggleRecording}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isRecording
                        ? "animate-recording text-white"
                        : "text-white/40 hover:text-[hsl(var(--primary))] hover:bg-[hsl(205,60%,12%)]"
                    }`}
                    title={isRecording ? "Остановить запись" : "Голосовой ввод"}
                  >
                    <Icon name={isRecording ? "MicOff" : "Mic"} size={16} />
                  </button>
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim()}
                    className="w-8 h-8 rounded-xl gradient-blue flex items-center justify-center text-[hsl(220,30%,7%)] transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Icon name="Send" size={14} />
                  </button>
                </div>
                {isRecording && (
                  <p className="text-xs text-red-400 text-center mt-2 animate-pulse">
                    🔴 Говорите — я слушаю...
                  </p>
                )}
              </div>
            </div>

            {/* Quick prompts */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {["Расскажи о себе 🤔", "Что умеешь? ✨", "Привет, Ваня! 👋", "Помоги с идеей 💡"].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(205,60%,12%)] transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FEATURES SECTION */}
        {activeSection === "features" && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-white mb-3">
                Что умеет <span className="text-[hsl(var(--primary))] text-glow">Ваня</span>? ✨
              </h2>
              <p className="text-white/40 text-lg">Шесть суперспособностей твоего ИИ-помощника</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className="bg-[hsl(220,25%,10%)] border border-white/8 rounded-2xl p-6 hover:border-[hsl(var(--primary))]/30 hover:bg-[hsl(220,25%,12%)] transition-all duration-300 group animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[hsl(205,60%,12%)] border border-[hsl(var(--primary))]/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {f.emoji}
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTACT SECTION */}
        {activeSection === "contact" && (
          <div className="animate-fade-in-up max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-white mb-3">
                Свяжитесь с <span className="text-[hsl(var(--primary))] text-glow">нами</span> 📬
              </h2>
              <p className="text-white/40 text-lg">Есть вопрос или предложение? Мы всегда рады</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Form */}
              <div className="bg-[hsl(220,25%,10%)] border border-white/8 rounded-3xl p-8">
                {!formSent ? (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">Ваше имя</label>
                      <input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Как вас зовут?"
                        className="w-full bg-[hsl(220,20%,14%)] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-[hsl(var(--primary))]/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">Email</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full bg-[hsl(220,20%,14%)] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-[hsl(var(--primary))]/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">Сообщение</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Напишите, чем мы можем помочь..."
                        className="w-full bg-[hsl(220,20%,14%)] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-[hsl(var(--primary))]/50 transition-colors resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full gradient-blue text-[hsl(220,30%,7%)] font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform duration-200 glow-blue-sm"
                    >
                      Отправить сообщение ✉️
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <div className="text-5xl mb-4 animate-float">🎉</div>
                    <h3 className="text-xl font-bold text-white mb-2">Сообщение отправлено!</h3>
                    <p className="text-white/45 text-sm mb-6">Мы свяжемся с вами в ближайшее время</p>
                    <button
                      onClick={() => { setFormSent(false); setFormData({ name: "", email: "", message: "" }); }}
                      className="text-[hsl(var(--primary))] text-sm hover:underline"
                    >
                      Отправить ещё
                    </button>
                  </div>
                )}
              </div>

              {/* Contacts */}
              <div className="space-y-4">
                {[
                  { emoji: "📧", label: "Email", value: "vanya@example.com", sub: "Ответим в течение дня" },
                  { emoji: "💬", label: "Telegram", value: "@vanya_ai_bot", sub: "Мгновенные ответы" },
                  { emoji: "📞", label: "Телефон", value: "+7 (999) 123-45-67", sub: "Пн–Пт, 9:00–18:00" },
                  { emoji: "📍", label: "Офис", value: "Москва, ул. Арбат, 1", sub: "Рады встрече!" },
                ].map((c) => (
                  <div key={c.label} className="bg-[hsl(220,25%,10%)] border border-white/8 rounded-2xl p-5 flex items-center gap-4 hover:border-[hsl(var(--primary))]/30 transition-all duration-200">
                    <div className="w-11 h-11 rounded-xl bg-[hsl(205,60%,12%)] border border-[hsl(var(--primary))]/20 flex items-center justify-center text-xl flex-shrink-0">
                      {c.emoji}
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-0.5">{c.label}</p>
                      <p className="text-white font-semibold text-sm">{c.value}</p>
                      <p className="text-white/30 text-xs">{c.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 text-center text-white/25 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">🤖</span>
          <span className="font-bold text-white/40">Ваня</span>
        </div>
        <p>© 2024 Ваня — ИИ-ассистент. Все права защищены.</p>
      </footer>
    </div>
  );
}