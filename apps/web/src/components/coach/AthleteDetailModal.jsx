import React, { useState } from "react";
import { X, Send, Video, AlertTriangle, CheckCircle2, FileText, Calendar, MessageSquare, Dumbbell } from "lucide-react";
import Button from "../../ui/Button";

export default function AthleteDetailModal({ athlete, isOpen, onClose, onApproveProgram }) {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'logs' | 'program' | 'checkins' | 'notes'
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([
    { sender: "coach", text: "Checked your squat singles. Solid depth and bracing on set 3.", time: "10:30 AM" },
    { sender: "athlete", text: "Thanks coach! Felt slight quad tightness on the ascent though.", time: "10:35 AM" },
  ]);

  if (!isOpen || !athlete) return null;

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!chatMessage.trim()) return;
    setMessages(prev => [...prev, { sender: "coach", text: chatMessage, time: "Just now" }]);
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
      <div className="w-full max-w-5xl h-[92vh] max-h-[820px] rounded-2xl border border-line bg-surface flex flex-col shadow-2xl overflow-hidden">
        
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

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 rounded-lg text-muted hover:text-ink transition" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
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

        {/* Modal Content Body: Responsive 2-column on >= xl */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden">
          
          {/* Main Left Content Panel (Col 1-7 or 8) */}
          <div className="xl:col-span-7 p-5 overflow-y-auto space-y-5">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border border-line bg-bg">
                    <span className="text-xs text-muted block">Squat e1RM</span>
                    <span className="num text-xl font-bold text-ink block mt-1">172.5 kg</span>
                  </div>
                  <div className="p-3 rounded-xl border border-line bg-bg">
                    <span className="text-xs text-muted block">Bench e1RM</span>
                    <span className="num text-xl font-bold text-ink block mt-1">122.5 kg</span>
                  </div>
                  <div className="p-3 rounded-xl border border-line bg-bg">
                    <span className="text-xs text-muted block">Deadlift e1RM</span>
                    <span className="num text-xl font-bold text-ink block mt-1">215.0 kg</span>
                  </div>
                  <div className="p-3 rounded-xl border border-line bg-bg">
                    <span className="text-xs text-muted block">Weekly Sessions</span>
                    <span className="num text-xl font-bold text-ok block mt-1">4 of 4</span>
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

                <div className="rounded-xl border border-line bg-bg p-4 space-y-2">
                  <h3 className="font-bold text-sm text-ink">Active Mesocycle</h3>
                  <p className="text-xs text-muted">
                    Week 3 of 12 · Block 1 Accumulation. AI generated with coach manual volume caps.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-ink">Recent Session Log</h3>
                <div className="divide-y divide-line rounded-lg border border-line bg-bg text-xs">
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
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <h3 className="font-bold text-sm text-ink">Proposed Week 4 Program Diff</h3>
                  <Button
                    variant="primary"
                    size="md"
                    className="text-xs"
                    onClick={() => {
                      onApproveProgram?.(athlete.id);
                      alert("Program approved and published to athlete!");
                    }}
                  >
                    Approve & Publish
                  </Button>
                </div>
                <div className="rounded-lg border border-line bg-bg p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-muted">Squat Top Single:</span>
                    <span className="text-ok font-bold">142.5 kg (+2.5 kg)</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-muted">Back-off sets:</span>
                    <span className="text-ok font-bold">3×5 @ 122.5 kg (+2.5 kg)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "checkins" && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-ink">Check-In Submissions</h3>
                <div className="rounded-lg border border-line bg-bg p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted">
                    <span className="font-semibold text-ink">Sunday Check-In #3</span>
                    <span>3 days ago</span>
                  </div>
                  <p className="text-muted leading-relaxed">
                    "Recovery has been good, slight stiffness in deep squat hole. Video link attached below."
                  </p>
                  <div className="flex items-center gap-2 text-accent font-semibold pt-1">
                    <Video className="h-4 w-4" />
                    <span>Watch Form Video (0:45)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-ink">Private Coach Notes</h3>
                <textarea
                  rows={4}
                  placeholder="Athlete cues, meet date goals, competition division notes..."
                  className="w-full bg-bg border border-line rounded-lg p-3 text-sm text-ink focus:outline-none focus:border-accent"
                  defaultValue="Aiming for IPF state trials in December. Target opener: 180kg Squat."
                />
                <Button variant="secondary" size="md" className="text-xs">Save Private Note</Button>
              </div>
            )}
          </div>

          {/* Right Chat Panel (Col 8-12 on desktop) */}
          <div className="xl:col-span-5 border-t xl:border-t-0 xl:border-l border-line flex flex-col bg-surface/50">
            <div className="p-3 border-b border-line bg-raised/50 text-xs font-semibold text-ink flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-accent" />
              <span>Coach ↔ Athlete Direct Chat</span>
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
                placeholder="Send coaching cue or reply..."
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
