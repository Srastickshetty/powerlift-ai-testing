import React from "react";
import { Check, Trash2 } from "lucide-react";
import Stepper from "./Stepper";

const SET_TYPES = ["Warm-up", "Working", "Top Set", "Back-off", "Drop Set"];

/**
 * SetRow - Individual set in workout mode
 * Active: expanded with 56px Steppers, RPE/RIR chips, set type
 * Inactive: compact one-line row; tap expands or checks
 */
export default function SetRow({
  idx,
  set,
  active,
  track = "pl",
  onChange,
  onDone,
  onSelect,
  onDelete,
  unit = "kg"
}) {
  const isBb = track === "bb";
  const ratingLabel = isBb ? "RIR" : "RPE";
  const ratingOptions = isBb ? [0, 1, 2, 3, 4] : [6, 7, 8, 9, 10];

  if (!active) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect?.(); }}
        className={`flex items-center justify-between rounded-lg border border-line bg-surface/80 px-4 py-3 cursor-pointer hover:bg-raised/60 transition ${
          set.done ? "border-ok/30 bg-ok/5" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-mono tracking-wider text-muted">
            SET {idx + 1}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-raised border border-line text-ink font-medium">
            {set.type}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="num text-xl font-bold text-ink">
            {set.weight} × {set.reps}
            {set.rating !== null && set.rating !== undefined ? ` @${set.rating} ${ratingLabel}` : ""}
          </span>
          {set.done ? (
            <div className="h-6 w-6 rounded-full bg-ok/20 border border-ok/40 grid place-items-center">
              <Check className="h-3.5 w-3.5 text-ok" aria-label="Completed" />
            </div>
          ) : (
            <span className="text-xs text-muted">Tap to edit</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-accent/70 bg-surface p-4 shadow-lg space-y-4">
      <div className="flex items-center justify-between text-sm border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          <span className="num font-bold text-accent">SET {idx + 1}</span>
          <select
            value={set.type}
            onChange={(e) => onChange?.({ type: e.target.value })}
            className="text-xs rounded bg-raised border border-line px-2 py-1 text-ink focus:outline-none focus:border-accent"
            aria-label="Set Type"
          >
            {SET_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {set.target && (
            <span className="text-xs text-muted font-mono">Target: {set.target}</span>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-muted hover:text-danger p-1 transition"
              aria-label="Delete Set"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Steppers: Big 56px gym touch targets */}
      <div className="flex flex-wrap items-start justify-center gap-6 py-1">
        <Stepper
          label={`Weight (${unit})`}
          unit={unit}
          value={set.weight}
          step={2.5}
          onChange={(v) => onChange?.({ weight: v })}
        />
        <Stepper
          label="Reps"
          value={set.reps}
          step={1}
          inputMode="numeric"
          onChange={(v) => onChange?.({ reps: v })}
        />
      </div>

      {/* RPE (Powerlifting) or RIR (Bodybuilding) Chips */}
      <div>
        <span className="text-xs uppercase font-mono tracking-wider text-muted block text-center mb-1.5">
          {ratingLabel} Rating
        </span>
        <div className="flex justify-center gap-1.5" role="radiogroup" aria-label={ratingLabel}>
          {ratingOptions.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={set.rating === r}
              onClick={() => onChange?.({ rating: r })}
              className={`h-11 w-11 rounded-md border num text-lg font-bold transition select-none ${
                set.rating === r
                  ? "bg-accent text-accent-ink border-accent shadow-sm"
                  : "border-line bg-raised text-ink hover:bg-line"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Log set CTA (≤ 2 taps) */}
      <button
        type="button"
        onClick={onDone}
        className="h-14 w-full rounded-lg bg-accent font-bold text-base text-accent-ink active:scale-[.99] transition flex items-center justify-center gap-2 shadow-md hover:brightness-110"
      >
        <Check className="h-5 w-5 stroke-[2.5]" />
        <span>✓ Log Set as Prescribed</span>
      </button>
    </div>
  );
}
