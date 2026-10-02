import { Check } from "lucide-react";
import Stepper from "./Stepper";
/** One set in workout mode. Active = expanded with steppers; done/upcoming = compact. */
export default function SetRow({ idx, set, active, onChange, onDone, unit = "kg" }) {
  if (!active)
    return (
      <div className={`flex items-center justify-between rounded-md border border-line px-4 py-3 ${set.done ? "opacity-60" : ""}`}>
        <span className="text-sm text-muted">SET {idx + 1} · {set.type}</span>
        <span className="num text-xl">{set.weight} × {set.reps}{set.rpe ? ` @${set.rpe}` : ""}</span>
        {set.done && <Check className="h-5 w-5 text-ok" aria-label="done" />}
      </div>
    );
  return (
    <div className="rounded-lg border border-accent/60 bg-surface p-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-semibold">SET {idx + 1} · {set.type}</span>
        <span className="text-muted">Target {set.target}</span>
      </div>
      <div className="flex flex-wrap items-start justify-center gap-6">
        <Stepper label="Weight" unit={unit} value={set.weight} step={2.5} onChange={(v) => onChange({ weight: v })} />
        <Stepper label="Reps" value={set.reps} step={1} inputMode="numeric" onChange={(v) => onChange({ reps: v })} />
      </div>
      <div className="mt-4 flex justify-center gap-2" role="radiogroup" aria-label="RPE">
        {[6, 7, 8, 9, 10].map((r) => (
          <button key={r} role="radio" aria-checked={set.rpe === r} onClick={() => onChange({ rpe: r })}
            className={`h-11 w-11 rounded-md border num text-lg ${set.rpe === r ? "bg-accent text-accent-ink border-accent" : "border-line bg-raised"}`}>{r}</button>
        ))}
      </div>
      <button onClick={onDone} className="mt-4 h-14 w-full rounded-md bg-accent font-bold text-accent-ink active:scale-[.99]">
        ✓ Log set
      </button>
    </div>
  );
}
