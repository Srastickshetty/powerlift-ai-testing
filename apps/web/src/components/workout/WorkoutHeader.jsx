import React from "react";
import { ArrowLeft, Play, Pause } from "lucide-react";

export default function WorkoutHeader({
  onExit,
  onManualSync,
  isOnline,
  pendingCount,
  isSyncing,
  exerciseIndex,
  totalExercises,
  exerciseName,
  timerFormatted,
  isTimerRunning,
  onToggleTimer,
  onAddTimerTime
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur px-4 py-3 pt-safe">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="h-11 w-11 rounded-lg border border-line bg-raised grid place-items-center text-muted hover:text-ink transition"
            aria-label="Exit Workout"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={onManualSync}
            className={`px-2 py-1 rounded text-xs font-mono border transition ${
              !isOnline
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : pendingCount > 0
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}
            title="Offline Sync Queue Status"
          >
            {!isOnline
              ? `⚡ Offline (${pendingCount})`
              : isSyncing
              ? "Syncing..."
              : pendingCount > 0
              ? `Pending (${pendingCount})`
              : "Synced"}
          </button>
        </div>

        {/* Exercise Progression Indicator */}
        <div className="text-center">
          <span className="text-[11px] font-mono uppercase text-muted tracking-wider block">
            Exercise {exerciseIndex + 1} of {totalExercises}
          </span>
          <h1 className="num text-xl sm:text-2xl font-bold text-ink truncate max-w-[200px] sm:max-w-xs">
            {exerciseName}
          </h1>
        </div>

        {/* Sticky Rest Timer Widget */}
        <div className="flex items-center gap-1.5 rounded-full border border-line bg-raised px-2.5 py-1">
          <button
            onClick={onToggleTimer}
            className="text-accent hover:brightness-110 p-0.5"
            aria-label={isTimerRunning ? "Pause Timer" : "Start Timer"}
          >
            {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <span className="num font-bold text-sm text-ink">{timerFormatted}</span>
          <button
            onClick={() => onAddTimerTime(30)}
            className="text-[10px] num font-semibold text-muted hover:text-ink pl-1"
          >
            +30s
          </button>
        </div>
      </div>
    </header>
  );
}
