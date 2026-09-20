import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Paperclip, Loader2, Key, Sparkles, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('titan_groq_key') || '');
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('titan_gemini_key') || '');
  const [messages, setMessages] = useState([
    { role: 'ai', content: '👋 **IPF Coach AI**: Ask for cues, RPE guidance, attempt strategies, or upload a lifting video!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [exercise, setExercise] = useState('squat');
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const saveKeys = (gKey, gemKey) => {
    localStorage.setItem('titan_groq_key', gKey);
    localStorage.setItem('titan_gemini_key', gemKey);
    setGroqKey(gKey);
    setGeminiKey(gemKey);
    setShowKeyModal(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com'
        : 'http://localhost:5001';

      const res = await fetch(`${apiUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-groq-key': groqKey 
        },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "❌ Network error. Check server or API key." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessages(prev => [...prev, { role: 'user', content: `📹 Analyzing ${exercise} video...` }]);
    setLoading(true);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('exerciseType', exercise);

    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com'
        : 'http://localhost:5001';

      const res = await fetch(`${apiUrl}/api/ai/analyze-video`, {
        method: 'POST',
        headers: {
          'x-gemini-key': geminiKey
        },
        body: formData,
      });
      const data = await res.json();
      if (data.error === "API_KEY_REQUIRED") {
        setShowKeyModal(true);
        setMessages(prev => [...prev, { role: 'ai', content: "⚠️ **Free Gemini API Key Required**: Enter your Google Gemini key in the settings above to run video form checks for free!" }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: data.feedback || data.reply || "Analysis complete." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "❌ Video analysis failed. Try entering a Gemini API key." }]);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="bg-orange-600 hover:bg-orange-500 p-4 rounded-full shadow-2xl hover:scale-105 transition-all text-white flex items-center justify-center border border-orange-400/40"
        >
          <Bot size={26} />
        </button>
      )}

      {isOpen && (
        <div className="bg-zinc-950 border border-zinc-800 w-96 h-[560px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-zinc-900 p-3.5 flex justify-between items-center border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider">IPF Coach AI</h3>
              <span className="text-[10px] font-mono bg-orange-950 text-orange-400 px-1.5 py-0.5 rounded border border-orange-800/40">
                {groqKey ? "BYOK FREE" : "PRO"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowKeyModal(!showKeyModal)} 
                title="Configure Free API Key"
                className="text-zinc-400 hover:text-orange-400 p-1 transition-colors"
              >
                <Key size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* API Key Modal / Drawer */}
          {showKeyModal && (
            <div className="bg-zinc-900 p-4 border-b border-orange-500/30 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-orange-400 font-bold uppercase flex items-center gap-1.5">
                  <Sparkles size={14} /> BYOK (Free AI Access)
                </span>
                <span className="text-[10px] text-zinc-500">Stored locally</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Use your own free API keys to get unlimited AI coaching with zero platform fees:
              </p>
              <input 
                type="password"
                placeholder="Groq API Key (gsk_...)" 
                defaultValue={groqKey}
                id="groq-key-input"
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white text-xs outline-none focus:border-orange-500"
              />
              <input 
                type="password"
                placeholder="Google Gemini Key (AIza...)" 
                defaultValue={geminiKey}
                id="gemini-key-input"
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white text-xs outline-none focus:border-orange-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button 
                  onClick={() => {
                    const g = document.getElementById('groq-key-input').value;
                    const gem = document.getElementById('gemini-key-input').value;
                    saveKeys(g, gem);
                  }}
                  className="bg-orange-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-orange-500 flex items-center gap-1"
                >
                  <Check size={12} /> Save Keys
                </button>
              </div>
            </div>
          )}

          {/* Exercise Sub-header */}
          <div className="bg-zinc-900/60 px-4 py-1.5 flex items-center justify-between border-b border-zinc-800 text-xs">
            <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Focus:</span>
            <select 
              value={exercise} 
              onChange={(e) => setExercise(e.target.value)} 
              className="bg-transparent text-xs text-orange-500 font-mono font-bold outline-none cursor-pointer"
            >
              <option value="squat" className="bg-zinc-900">SQUAT DEPTH</option>
              <option value="bench" className="bg-zinc-900">BENCH PAUSE</option>
              <option value="deadlift" className="bg-zinc-900">DEADLIFT LOCKOUT</option>
            </select>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/40">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-zinc-900 text-zinc-200 border border-zinc-800'
                }`}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-zinc-500 text-xs italic flex items-center gap-2">
                <Loader2 className="animate-spin" size={14} /> Coach analyzing...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-zinc-900 border-t border-zinc-800">
            <div className="flex items-center gap-2 bg-zinc-950 rounded-lg p-1 border border-zinc-800">
              <input type="file" ref={fileInputRef} onChange={handleVideoUpload} hidden accept="video/*" />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                title="Upload Form Check Video" 
                className="text-zinc-500 hover:text-orange-500 p-2 transition-colors"
              >
                <Paperclip size={18} />
              </button>
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                placeholder="Ask Coach for cues, RPE, tactics..." 
                className="flex-1 bg-transparent text-white px-2 py-1.5 outline-none text-xs" 
              />
              <button 
                onClick={handleSend} 
                disabled={loading || !input.trim()} 
                className="bg-orange-600 hover:bg-orange-500 p-2 rounded-md text-white disabled:opacity-40 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatBot;