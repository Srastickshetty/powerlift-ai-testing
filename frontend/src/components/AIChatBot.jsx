import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Paperclip, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Coach here. Send a question or a video for a form check!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [exercise, setExercise] = useState('squat');
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "❌ Server Offline." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessages(prev => [...prev, { role: 'user', content: `📹 Analyzing ${exercise}...` }]);
    setLoading(true);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('exercise', exercise);

    try {
      const res = await fetch('http://localhost:5001/api/ai/analyze-video', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.feedback || data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "❌ Video analysis failed." }]);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="bg-red-600 p-4 rounded-full shadow-2xl hover:scale-110 transition-all text-white">
          <Bot size={28} />
        </button>
      )}

      {isOpen && (
        <div className="bg-zinc-900 border border-zinc-800 w-96 h-[550px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-zinc-800 p-4 flex justify-between items-center border-b border-zinc-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-bold text-white text-sm">IPF Referee AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
          </div>

          <div className="bg-zinc-800/50 px-4 py-2 flex items-center justify-between border-b border-zinc-700/50">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Focus:</span>
            <select value={exercise} onChange={(e) => setExercise(e.target.value)} className="bg-transparent text-xs text-red-500 font-bold outline-none cursor-pointer">
              <option value="squat">SQUAT DEPTH</option>
              <option value="bench">BENCH PAUSE</option>
              <option value="deadlift">DL LOCKOUT</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-200 border border-zinc-700'}`}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && <div className="text-zinc-500 text-xs italic"><Loader2 className="inline animate-spin mr-2" size={14}/>Analyzing...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-zinc-800 border-t border-zinc-700">
            <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1 border border-zinc-700">
              <input type="file" ref={fileInputRef} onChange={handleVideoUpload} hidden accept="video/*" />
              <button onClick={() => fileInputRef.current.click()} className="text-zinc-500 hover:text-red-500 p-2"><Paperclip size={20} /></button>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask Coach..." className="flex-1 bg-transparent text-white px-2 py-2 outline-none text-sm" />
              <button onClick={handleSend} disabled={loading || !input.trim()} className="bg-red-600 p-2 rounded-md text-white disabled:opacity-50"><Send size={18} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatBot;