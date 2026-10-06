import React, { useState, useEffect } from "react";
import { Sparkles, History, X, Info, Check, RefreshCw } from "lucide-react";
import Button from "../../ui/Button";
import { useAuth } from "../../auth/authContext";
import ProgramProposalCard from "../../components/program/ProgramProposalCard";
import ProgramHistoryModal from "../../components/program/ProgramHistoryModal";

export default function Program() {
  const { user, profile } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showWhyPanel, setShowWhyPanel] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [pendingProposal, setPendingProposal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const track = (profile?.track === "bb" || profile?.track === "bodybuilding") ? "bb" : "pl";
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);

  // Load latest AI proposal if one exists
  useEffect(() => {
    async function loadProposal() {
      try {
        const token = user?.getIdToken ? await user.getIdToken() : `dev_mock_${user?.uid || 'ath'}_athlete_powerlifting`;
        const res = await fetch('/api/v1/ai/proposals/latest', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.proposal) {
            setPendingProposal(json.proposal);
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
    loadProposal();
  }, [user]);

  const handleGenerateProposal = async () => {
    setLoading(true);
    setActionSuccess(null);
    try {
      const token = user?.getIdToken ? await user.getIdToken() : `dev_mock_${user?.uid || 'ath'}_athlete_powerlifting`;
      const res = await fetch('/api/v1/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.proposal) {
          setPendingProposal(json.proposal);
          setShowWhyPanel(true);
          setActionSuccess('New AI Mesocycle generated and ready for review.');
        }
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProposal = async () => {
    if (!pendingProposal) return;
    setLoading(true);
    try {
      const token = user?.getIdToken ? await user.getIdToken() : `dev_mock_${user?.uid || 'ath'}_athlete_powerlifting`;
      const res = await fetch(`/api/v1/ai/proposals/${pendingProposal.id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPendingProposal(null);
        setActionSuccess('Proposal approved! Your weekly schedule is now live.');
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleRejectProposal = async () => {
    if (!pendingProposal) return;
    setLoading(true);
    try {
      const token = user?.getIdToken ? await user.getIdToken() : `dev_mock_${user?.uid || 'ath'}_athlete_powerlifting`;
      const res = await fetch(`/api/v1/ai/proposals/${pendingProposal.id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPendingProposal(null);
        setActionSuccess('Draft proposal archived.');
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

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
            {track === "pl" ? "Powerlifting SBD" : "Bodybuilding Physique"} Program
          </h1>
          <p className="text-sm text-muted">
            12-Week Mesocycle · Week {selectedWeek} of 12 · Verified against §9 Safety Constraints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleGenerateProposal}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing...' : 'Generate AI Proposal'}</span>
          </Button>
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
            <span>History</span>
          </Button>
        </div>
      </header>

      {/* Action Notification Banner */}
      {actionSuccess && (
        <div className="rounded-xl border border-ok/40 bg-ok/10 p-3.5 text-xs text-ok flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            <span>{actionSuccess}</span>
          </span>
          <button onClick={() => setActionSuccess(null)} className="text-muted hover:text-ink">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Pending AI Proposal Review Panel */}
      <ProgramProposalCard
        proposal={pendingProposal}
        loading={loading}
        onApprove={handleApproveProposal}
        onReject={handleRejectProposal}
      />

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
              ? "Week 1 establishes baseline training volume at 70-75% e1RM with submaximal velocity verification. Weekly load progression is strictly capped at ≤5% per Safety Rule §9."
              : "Week 1 initiates the accumulation mesocycle in the Minimum Effective Volume (MEV) zone (10-12 sets/muscle). Double progression will advance working loads as reps hit the top of each target bracket."}
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
      <ProgramHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
}
