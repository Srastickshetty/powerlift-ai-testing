import React, { useState, useEffect } from "react";
import { X, Send, AlertTriangle, MessageSquare } from "lucide-react";
import AthleteNotesTab from "./AthleteNotesTab";
import AthleteProgramTab from "./AthleteProgramTab";
import AthleteCheckinsTab from "./AthleteCheckinsTab";

export default function AthleteDetailModal({ athlete, isOpen, onClose, onApproveProgram }) {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'logs' | 'program' | 'checkins' | 'notes'
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Strict athlete-isolation: load chat thread keyed by athlete.id
  useEffect(() => {
    if (!athlete?.id) return;
    const chatKey = `coach_chat_${athlete.id}`;
    try {
      const saved = localStorage.getItem(chatKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        const initial = [
          { 
            sender: "coach", 
            text: `Hey ${athlete.name.split(" ")[0]}, reviewed your latest session telemetry. Looking consistent!`, 
            time: "Yesterday" 
          },
          { 
            sender: "athlete", 
            text: athlete.hasPain 
              ? `Thanks coach! Noticed some slight ${athlete.painArea || "joint"} tightness on the last set.` 
              : "Thanks coach! Felt strong on the top single, ready for the next block.", 
            time: "Today" 
          },
        ];
        setMessages(initial);
        localStorage.setItem(chatKey, JSON.stringify(initial));
      }
    } catch {
      setMessages([]);
    }
  }, [athlete?.id, athlete?.name, athlete?.hasPain, athlete?.painArea]);

  if (!isOpen || !athlete) return null;

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!chatMessage.trim()) return;

    const newMsg = {
      sender: "coach",
      text: chatMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(`coach_chat_${athlete.id}`, JSON.stringify(updated));
    setChatMessage("");
  };

  const quickReplies = [
    "Great pause on the chest!",
    "Keep knees driven outward on hole exit.",
    "Add 30s to your rest intervals.",
    "Deloading accessories next session."
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 font-sans">
      <div className="w-full max-w-5xl h-[92vh] max-h-[820px] rounded-2xl border border-line bg-surface flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Bar */}
        <header className="border-b border-line p-4 flex items-center justify-between shrink-0 bg-raised/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-line bg-bg grid place-items-center font-bold text-accent">
              {athlete.name?.charAt(0) || "A"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="num text-xl font-bold text-ink">{athlete.name}</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-raised border border-line text-muted">
                  {athlete.track === "bb" ? "Bodybuilding" : "Powerlifting"}
                </span>
              </div>
              <span className="text-xs text-muted">{athlete.email} · {athlete.adherence}% adherence</span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 rounded-lg text-muted hover:text-ink transition" 
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Tab Selection Navigation */}
        <div className="flex border-b border-line px-4 bg-bg overflow-x-auto shrink-0 scrollbar-none text-xs">
          {["overview", "logs", "program", "checkins", "notes"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`py-3 px-4 font-semibold uppercase tracking-wider border-b-2 transition shrink-0 ${
                activeTab === t
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden">
          
          {/* Main Left Content Panel */}
          <div className="xl:col-span-7 p-5 overflow-y-auto space-y-5">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-line bg-bg">
                    <span className="text-muted block">Squat e1RM</span>
                    <span className="num text-xl font-bold text-ink block mt-1">172.5 kg</span>
                  </div>
                  <div className="p-3 rounded-xl border border-line bg-bg">
                    <span className="text-muted block">Bench e1RM</span>
                    <span className="num text-xl font-bold text-ink block mt-1">122.5 kg</span>
                  </div>
                  <div className="p-3 rounded-xl border border-line bg-bg">
                    <span className="text-muted block">Deadlift e1RM</span>
                    <span className="num text-xl font-bold text-ink block mt-1">215.0 kg</span>
                  </div>
                  <div className="p-3 rounded-xl border border-line bg-bg">
                    <span className="text-muted block">Adherence</span>
                    <span className="num text-xl font-bold text-ok block mt-1">{athlete.adherence}%</span>
                  </div>
                </div>

                {athlete.hasPain && (
                  <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-sm text-danger block">Pain Flag: {athlete.painArea} ({athlete.painScore}/10)</span>
                      <p className="text-xs text-muted mt-1">
                        Reported during last squat backoff set. Knee flexion loading recommended for deload.
                      </p>
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-line bg-bg p-4 space-y-2 text-xs">
                  <h3 className="font-bold text-sm text-ink">Active Mesocycle</h3>
                  <p className="text-muted">
                    Week 3 of 12 · Block 1 Accumulation. AI generated with coach manual volume caps.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="space-y-3 text-xs">
                <h3 className="font-bold text-sm text-ink">Recent Session Log for {athlete.name}</h3>
                <div className="divide-y divide-line rounded-lg border border-line bg-bg">
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-ink block">Competition Squat</span>
                      <span className="text-muted">Top Set: 140kg × 5 @ RPE 8.0</span>
                    </div>
                    <span className="num text-ok font-bold">✓ Prescribed</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-ink block">Pause Bench</span>
                      <span className="text-muted">3×6 @ 95kg @ RPE 7.5</span>
                    </div>
                    <span className="num text-ok font-bold">✓ Prescribed</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "program" && (
              <AthleteProgramTab athlete={athlete} onApproveProgram={onApproveProgram} />
            )}

            {activeTab === "checkins" && (
              <AthleteCheckinsTab athlete={athlete} />
            )}

            {activeTab === "notes" && (
              <AthleteNotesTab athlete={athlete} />
            )}
          </div>

          {/* Right Chat Panel: Strictly isolated per athlete.id */}
          <div className="xl:col-span-5 border-t xl:border-t-0 xl:border-l border-line flex flex-col bg-surface/50">
            <div className="p-3 border-b border-line bg-raised/50 text-xs font-semibold text-ink flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-accent" />
                <span>Direct Thread: {athlete.name}</span>
              </div>
              <span className="text-[10px] text-muted font-mono">1-on-1 Encrypted</span>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.sender === "coach" ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl p-3 ${
                      m.sender === "coach"
                        ? "bg-accent text-accent-ink rounded-tr-none font-medium"
                        : "bg-raised border border-line text-ink rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-muted mt-1 px-1">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Quick Template Chips */}
            <div className="px-3 py-2 border-t border-line/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {quickReplies.map((qr) => (
                <button
                  key={qr}
                  type="button"
                  onClick={() => setChatMessage(qr)}
                  className="px-2.5 py-1 rounded-md border border-line bg-bg text-[11px] text-muted hover:text-ink whitespace-nowrap transition"
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-line flex items-center gap-2 bg-bg">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={`Message ${athlete.name.split(" ")[0]} directly...`}
                className="flex-1 bg-surface border border-line rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="h-9 w-9 rounded-lg bg-accent text-accent-ink grid place-items-center hover:brightness-110 shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
