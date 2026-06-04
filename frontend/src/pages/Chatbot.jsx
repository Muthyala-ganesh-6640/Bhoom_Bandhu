import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Send, Loader2, Mic, MicOff, Volume2, VolumeX, Bot, User } from 'lucide-react';

const SUGGESTIONS = {
  en: ['Which fertilizer for cotton?', 'Rice leaves turning yellow', 'Tomato market price today', 'PM-KISAN scheme details'],
  hi: ['कपास के लिए कौन सा उर्वरक?', 'धान की पत्तियां पीली हो रही हैं', 'आज टमाटर का भाव', 'PM-KISAN योजना विवरण'],
  te: ['పత్తికి ఏ ఎరువు?', 'వరి ఆకులు పసుపు అవుతున్నాయి', 'ఈరోజు టమాటా ధర', 'PM-KISAN పథకం వివరాలు'],
};

export default function Chatbot() {
  const { t } = useTranslation();
  const { lang } = useApp();
  const [messages, setMessages] = useState([
    { id: 0, role: 'assistant', content: lang === 'hi' ? 'नमस्ते! मैं भूमि बंधु AI सहायक हूं। खेती संबंधी कोई भी प्रश्न पूछें।' : lang === 'te' ? 'నమస్తే! నేను భూమి బంధు AI సహాయకుడిని. వ్యవసాయ సంబంధిత ఏ ప్రశ్నైనా అడగండి.' : 'Hello! I am Bhoomi Bandhu AI assistant. Ask me any farming questions!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const bottomRef = useRef();
  const recognitionRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/chatbot/message', {
        message: text,
        lang,
        history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
      });
      const botMsg = { id: Date.now() + 1, role: 'assistant', content: res.data.answer };
      setMessages(m => [...m, botMsg]);
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice not supported on this browser'); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN';
    rec.continuous = false;
    rec.onstart = () => setListening(true);
    rec.onresult = e => { const text = e.results[0][0].transcript; setInput(text); setListening(false); };
    rec.onerror = () => { setListening(false); toast.error('Voice recognition failed. Try typing.'); };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    // Auto-stop after 10s
    setTimeout(() => { try { rec.stop(); } catch {} }, 10000);
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN';
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  const stopSpeak = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };

  return (
    <div className="flex flex-col h-[calc(100dvh-130px)]">
      {/* Header */}
      <div className="hero-gradient p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
          <div>
            <h1 className="font-bold">{t('app_name')} AI</h1>
            <p className="text-white/80 text-xs">{t('farming_advisory')} · {lang === 'hi' ? 'हिंदी' : lang === 'te' ? 'తెలుగు' : 'English'}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-green-600' : 'bg-amber-500'}`}>
              {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-green-600 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm rounded-tl-sm'}`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              {msg.role === 'assistant' && (
                <button onClick={() => speaking ? stopSpeak() : speakText(msg.content)} className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                  {speaking ? <><VolumeX size={12} /> Stop</> : <><Volume2 size={12} /> Listen</>}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center"><Bot size={14} className="text-white" /></div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="bg-white dark:bg-gray-900 px-4 py-2 flex gap-2 overflow-x-auto border-t border-gray-100 dark:border-gray-800">
          {(SUGGESTIONS[lang] || SUGGESTIONS.en).map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)} className="flex-shrink-0 text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 rounded-xl px-3 py-2 whitespace-nowrap min-h-[36px]">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-3 flex items-end gap-2">
        <button
          onClick={listening ? () => { recognitionRef.current?.stop(); setListening(false); } : startVoice}
          className={`p-3 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-all ${listening ? 'bg-red-500 text-white pulse-voice' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          {listening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center px-3 min-h-[44px]">
          <input
            type="text"
            placeholder={listening ? t('listening') : t('type_message')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            maxLength={500}
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
          />
        </div>

        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="p-3 bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-all"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}
