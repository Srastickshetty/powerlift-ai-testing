import React, { useState } from "react";
import { Trophy, CheckCircle2, TrendingUp, Sparkles, X } from "lucide-react";
import Button from "../../ui/Button";

export default function SessionSummarySheet({
  isOpen,
  onClose,
  onFinish,
  totalVolume = 3850,
  completedSetsCount = 12,
  track = "pl"
}) {
  const [sessionRpe, setSessionRpe] = useState(8);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleComplete = () => {
    onFinish?.({ sessionRpe, notes });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-line bg-surface p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-accent" />
            <h2 className="num text-2xl font-bold text-ink">Session Complete!</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Volume & Set Metrics */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl border border-line bg-bg p-3.5">
            <span className="text-xs uppercase text-muted block">Tonnage Moved</span>
            <span className="num text-3xl font-bold text-ink">{totalVolume.toLocaleString()} kg</span>
          </div>
          <div className="rounded-xl border border-line bg-bg p-3.5">
            <span className="text-xs uppercase text-muted block">Completed Sets</span>
            <span className="num text-3xl font-bold text-ok">{completedSetsCount} sets</span>
          </div>
        </div>

        {/* Overall Session RPE (S-RPE) */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs uppercase font-mono tracking-wider text-muted">Session RPE (Exertion 1–10)</label>
            <span className="num text-lg font-bold text-accent">{sessionRpe}/10</span>
          </div>
          <div className="flex gap-1.5 justify-center">
            {[5, 6, 7, 8, 9, 10].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSessionRpe(r)}
                className={`h-11 flex-1 rounded-md border num text-base font-bold transition ${
                  sessionRpe === r ? "bg-accent text-accent-ink border-accent" : "border-line bg-bg text-muted hover:text-ink"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Autoregulation "What changes next week" */}
        <div className="rounded-xl border border-line bg-bg p-4 space-y-2">
          <div className="flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Autoregulation Forecast</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {track === "pl"
              ? "Your Squat top set moved cleanly at RPE 8.0. Next week: +2.5 kg progression on top set (142.5 kg) and 3×5 working sets bump to 122.5 kg."
              : "Volume was achieved within prescribed RIR. Next week volume increases by +1 set for chest and delts."}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs uppercase font-mono tracking-wider text-muted block mb-1">Session Notes (Optional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Sleep was solid, warmup was fast, belt felt slightly loose..."
            className="w-full bg-bg border border-line rounded-lg p-2.5 text-sm text-ink focus:outline-none focus:border-accent"
          />
        </div>

        {/* Confirm Save CTA */}
        <Button
          variant="primary"
          size="lg"
          className="w-full text-lg font-bold"
          onClick={handleComplete}
        >
          Save & Return to Today
        </Button>
      </div>
    </div>
  );
}
