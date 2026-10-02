import React, { useState } from "react";
import { CalendarDays, ChevronRight, Dumbbell, Shield, Sparkles, History, X, Info } from "lucide-react";
import Button from "../../ui/Button";
import { useAuth } from "../../auth/authContext";

export default function Program() {
  const { profile } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(3);
  const [showWhyPanel, setShowWhyPanel] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const track = profile?.track === "bb" || profile?.pathway === "fitness" ? "bb" : "pl";
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);

  const days = track === "pl" ? [
    { day: "Day 1", title: "Squat Volume & Bench", exercises: ["Competition Squat (4×5 @ 120kg)", "Competition Pause Bench (4×6 @ 95kg)", "RDL (3×8 @ 110kg)"] },
    { day: "Day 2", title: "Deadlift Heavy & Upper Volume", exercises: ["Deadlift Top Single (205kg) + 4×3 Backoffs", "Overhead Press (3×8 @ 60kg)", "Barbell Rows (4×10 @ 75kg)"] },
    { day: "Day 3", title: "Bench Heavy & Squat Variation", exercises: ["Competition Bench (Top 3 @ RPE 8.5)", "Pause Squat (3×4 @ 125kg)", "Weighted Dips (3×12)"] },
    { day: "Day 4", title: "Deadlift Technique & Upper Volume", exercises: ["Deficit Deadlift (3×5 @ 160kg)", "Close Grip Bench (3×8 @ 85kg)", "Pull-ups (4×8)"] }
  ] : [
    { day: "Day 1", title: "Chest & Triceps Hypertrophy", exercises: ["Incline DB Press (4×8-10 · 2 RIR)", "Flat Machine Press (3×10-12)", "Cable Flyes (3×15)", "Tricep Pushdowns (4×12)"] },
    { day: "Day 2", title: "Back & Biceps Volume", exercises: ["Lat Pulldown (4×10)", "Chest Supported Row (4×12)", "Facepulls (3×15)", "Incline DB Curls (4×12)"] },
    { day: "Day 3", title: "Legs & Calves Hypertrophy", exercises: ["Hack Squat (4×8-10 · 1 RIR)", "Romanian Deadlift (3×10)", "Leg Extensions (3×15)", "Standing Calf (4×15)"] },
    { day: "Day 4", title: "Shoulders & Arms", exercises: ["Seated DB OHP (4×10)", "Lateral Raises (5×15)", "Hammer Curls (3×12)", "Skullcrushers (3×12)"] }
  ];

  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">
            12-Week {track === "pl" ? "Powerlifting" : "Bodybuilding"} Program
          </h1>
          <p className="text-sm text-muted">
            Block 1: Hypertrophy & Work Capacity Base · Week {selectedWeek} of 12
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowWhyPanel(!showWhyPanel)}
          >
            <Info className="h-4 w-4" />
            <span>Why This Week</span>
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowHistoryModal(true)}
          >
            <History className="h-4 w-4" />
            <span>Version History</span>
          </Button>
        </div>
      </header>

      {/* "Why" Rationale Accordion Panel */}
      {showWhyPanel && (
        <div className="rounded-xl border border-accent/40 bg-accent/5 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono font-bold text-accent tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Program Architecture & Rationale</span>
            </span>
            <button onClick={() => setShowWhyPanel(false)} className="text-muted hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-ink leading-relaxed">
            {track === "pl"
              ? "Week 3 introduces moderate volume accumulation (+5% load jump from Week 2). Squat and Bench top singles are calibrated to verify bar velocity at RPE 8.0 before Week 4's planned mini-deload."
              : "Week 3 increases working sets to 16 sets per major muscle group. Proximity to muscular failure is targeted at 1–2 RIR to stimulate mechanical tension without inducing excessive systemic fatigue."}
          </p>
        </div>
      )}

      {/* Week Selector Horizontal Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {weeks.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setSelectedWeek(w)}
            className={`h-11 min-w-[56px] rounded-lg border num text-sm font-semibold transition shrink-0 ${
              selectedWeek === w
                ? "border-accent bg-accent text-accent-ink shadow-sm"
                : "border-line bg-surface text-muted hover:text-ink hover:bg-raised"
            }`}
          >
            W{w}
          </button>
        ))}
      </div>

      {/* Days Grid: 2 columns on tablet/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {days.map((d) => (
          <article key={d.day} className="rounded-xl border border-line bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-accent font-bold">{d.day}</span>
                <h3 className="num text-xl font-bold text-ink">{d.title}</h3>
              </div>
              <span className="text-xs text-muted num font-mono">{d.exercises.length} Exercises</span>
            </div>

            <ul className="space-y-2 text-sm">
              {d.exercises.map((ex) => (
                <li key={ex} className="flex items-center gap-2 text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  <span className="text-ink">{ex}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <Button variant="secondary" size="md" className="w-full">
                View Set Prescriptions
              </Button>
            </div>
          </article>
        ))}
      </div>

      {/* Version History Sheet Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="num text-xl font-bold text-ink">Program Version History</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-muted hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="divide-y divide-line rounded-lg border border-line bg-bg text-xs">
              <div className="p-3.5 space-y-1">
                <div className="flex justify-between font-semibold text-ink">
                  <span>v1.2 (Active Program)</span>
                  <span className="text-ok">Approved by Coach</span>
                </div>
                <p className="text-muted">Adjusted Squat volume by +1 set based on low RPE recovery.</p>
                <span className="text-[10px] text-muted font-mono block">3 days ago</span>
              </div>
              <div className="p-3.5 space-y-1">
                <div className="flex justify-between font-semibold text-ink">
                  <span>v1.1</span>
                  <span className="text-muted">Archived</span>
                </div>
                <p className="text-muted">Initial 12-week powerlifting block generation from onboarding.</p>
                <span className="text-[10px] text-muted font-mono block">2 weeks ago</span>
              </div>
            </div>

            <Button variant="primary" size="md" className="w-full" onClick={() => setShowHistoryModal(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
