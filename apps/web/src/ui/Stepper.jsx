import { useRef } from "react";
/** Big −/+ stepper for weight/reps. Long-press repeats. */
export default function Stepper({ value, onChange, step = 1, min = 0, label, unit, inputMode = "decimal" }) {
  const t = useRef();
  const bump = (d) => onChange(Math.max(min, +(Number(value || 0) + d).toFixed(2)));
  const hold = (d) => { bump(d); t.current = setTimeout(function r() { bump(d); t.current = setTimeout(r, 90); }, 400); };
  const stop = () => clearTimeout(t.current);
  const btn = "h-14 w-14 shrink-0 rounded-md bg-raised border border-line text-2xl font-bold active:bg-line select-none touch-manipulation";
  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-xs uppercase tracking-wider text-muted">{label}</span>}
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`Decrease ${label || ""}`} className={btn}
          onPointerDown={() => hold(-step)} onPointerUp={stop} onPointerLeave={stop}>−</button>
        <div className="w-20 text-center">
          <input inputMode={inputMode} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            className="num w-full bg-transparent text-center text-4xl font-semibold outline-none" aria-label={label} />
          {unit && <div className="text-xs text-muted -mt-1">{unit}</div>}
        </div>
        <button type="button" aria-label={`Increase ${label || ""}`} className={btn}
          onPointerDown={() => hold(step)} onPointerUp={stop} onPointerLeave={stop}>+</button>
      </div>
    </div>
  );
}
