import React, { useMemo } from "react";
import { X, Layers } from "lucide-react";
import Button from "../../ui/Button";

const PLATES = [
  { weight: 25, color: "bg-red-600 border-red-700", text: "text-white" },
  { weight: 20, color: "bg-blue-600 border-blue-700", text: "text-white" },
  { weight: 15, color: "bg-yellow-500 border-yellow-600", text: "text-black" },
  { weight: 10, color: "bg-emerald-600 border-emerald-700", text: "text-white" },
  { weight: 5, color: "bg-zinc-200 border-zinc-400", text: "text-black" },
  { weight: 2.5, color: "bg-zinc-800 border-zinc-700", text: "text-white" },
  { weight: 1.25, color: "bg-zinc-400 border-zinc-500", text: "text-black" },
];

export default function PlateCalculatorSheet({ isOpen, onClose, targetWeight = 140, barWeight = 20 }) {
  const platesPerSide = useMemo(() => {
    let remainder = Math.max(0, (targetWeight - barWeight) / 2);
    const result = [];

    for (const p of PLATES) {
      const count = Math.floor(remainder / p.weight);
      if (count > 0) {
        result.push({ ...p, count });
        remainder = +(remainder - count * p.weight).toFixed(2);
      }
    }
    return result;
  }, [targetWeight, barWeight]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-line bg-surface p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-accent" />
            <h3 className="num text-xl font-bold text-ink">Plate Calculator</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center bg-bg p-3 rounded-xl border border-line">
          <span className="text-xs uppercase text-muted block">Barbell Total</span>
          <span className="num text-4xl font-bold text-ink">{targetWeight} kg</span>
          <span className="text-xs text-muted block mt-0.5">
            ({barWeight}kg Bar + {((targetWeight - barWeight) / 2).toFixed(1)}kg per side)
          </span>
        </div>

        {/* Visual Sleeve Representation */}
        <div>
          <span className="text-xs font-semibold text-muted block mb-2">Load Per Side:</span>
          <div className="flex items-center gap-1 overflow-x-auto py-2 px-1 bg-bg rounded-lg border border-line">
            <div className="h-10 w-4 rounded-l bg-zinc-600 border border-zinc-500 shrink-0" title="Collar" />
            {platesPerSide.flatMap((p, i) =>
              Array.from({ length: p.count }).map((_, idx) => (
                <div
                  key={`${p.weight}-${idx}`}
                  className={`h-12 w-8 rounded flex items-center justify-center font-bold text-xs num border shrink-0 ${p.color} ${p.text}`}
                >
                  {p.weight}
                </div>
              ))
            )}
            <div className="h-5 flex-1 bg-zinc-700 min-w-[30px] rounded-r" title="Barbell Sleeve" />
          </div>
        </div>

        {/* List Breakdown */}
        <div className="space-y-1.5 text-xs text-muted">
          {platesPerSide.map((p) => (
            <div key={p.weight} className="flex justify-between items-center bg-raised/50 px-3 py-1.5 rounded">
              <span className="text-ink font-medium">{p.weight} kg Plate</span>
              <span className="num font-bold text-accent">{p.count} × each side ({p.count * 2} total)</span>
            </div>
          ))}
        </div>

        <Button variant="primary" size="md" className="w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
