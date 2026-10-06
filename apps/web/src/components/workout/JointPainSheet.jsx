import React, { useState } from "react";
import { X, AlertTriangle, ShieldCheck } from "lucide-react";
import Button from "../../ui/Button";

const AREAS = ["Knee", "Lower Back", "Shoulder", "Hip", "Elbow", "Wrist"];

export default function JointPainSheet({ isOpen, onClose, onSubmit }) {
  const [area, setArea] = useState("Knee");
  const [severity, setSeverity] = useState(3);
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    onSubmit?.({ area, severity, note });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-line bg-surface p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2 text-warn">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="num text-xl font-bold text-ink">Report Joint Pain / Tweak</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>
          <label className="text-xs uppercase font-mono tracking-wider text-muted block mb-2">Affected Area</label>
          <div className="grid grid-cols-3 gap-2">
            {AREAS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setArea(a)}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                  area === a ? "border-warn bg-warn/15 text-warn" : "border-line bg-bg text-muted hover:text-ink"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs uppercase font-mono tracking-wider text-muted">Pain Rating (0–10)</label>
            <span className="num text-lg font-bold text-warn">{severity}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="w-full accent-warn h-2 bg-raised rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted mt-1">
            <span>0 Mild / Sensation</span>
            <span>5 Sharp Sticking</span>
            <span>10 Stop Session</span>
          </div>
        </div>

        {severity >= 5 && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Safety Rule: Ratings ≥ 5 automatically cap today's load jumps and drop working sets by 20%.</span>
          </div>
        )}

        <div>
          <label className="text-xs uppercase font-mono tracking-wider text-muted block mb-1">Coach / Autoregulation Note</label>
          <input
            type="text"
            placeholder="e.g. slight pinch in deep hole on set 2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-bg border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-warn"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" className="flex-1 bg-warn hover:brightness-110 text-black font-bold" onClick={handleSave}>
            Log Pain Flag
          </Button>
        </div>
      </div>
    </div>
  );
}
