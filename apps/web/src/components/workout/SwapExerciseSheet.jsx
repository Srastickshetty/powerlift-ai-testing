import React from "react";
import { X, RefreshCw } from "lucide-react";
import Button from "../../ui/Button";

const SQUAT_ALTERNATIVES = [
  { name: "Safety Squat Bar (SSB) Squat", reason: "Reduces shoulder/pec strain, targets thoracic extensors" },
  { name: "Pause Squat (2-Sec Count)", reason: "Reinforces position and power out of the bottom hole" },
  { name: "Pin Squat (At Parallel)", reason: "Deloads hips and builds concentric drive" },
  { name: "Leg Press (45-Degree)", reason: "Quads volume with zero axial spine loading" },
];

export default function SwapExerciseSheet({ isOpen, onClose, currentExercise = "Competition Squat", onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-line bg-surface p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-accent" />
            <h3 className="num text-xl font-bold text-ink">Swap Exercise</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-muted">
          Current: <strong className="text-ink">{currentExercise}</strong>. Preserved volume and RPE targets will transfer to the replacement exercise.
        </p>

        <div className="divide-y divide-line rounded-lg border border-line bg-bg">
          {SQUAT_ALTERNATIVES.map((alt) => (
            <button
              key={alt.name}
              type="button"
              onClick={() => { onSelect?.(alt.name); onClose(); }}
              className="w-full text-left p-3.5 hover:bg-surface/60 transition block"
            >
              <span className="font-semibold text-sm text-ink block">{alt.name}</span>
              <span className="text-xs text-muted block mt-0.5">{alt.reason}</span>
            </button>
          ))}
        </div>

        <Button variant="secondary" size="md" className="w-full" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
