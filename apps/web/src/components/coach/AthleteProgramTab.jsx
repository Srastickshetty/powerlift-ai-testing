import React, { useState, useEffect } from "react";
import { Edit3, Check, RotateCcw, Send, Sparkles } from "lucide-react";
import Button from "../../ui/Button";
import { toast } from "sonner";

export default function AthleteProgramTab({ athlete, onApproveProgram }) {
  const storageKey = `coach_program_${athlete.id}`;
  const [isEditing, setIsEditing] = useState(false);
  const isPl = athlete.track === "pl";

  // Athlete specific proposed items
  const [programData, setProgramData] = useState({
    title: isPl ? "Week 4 Peaking & Overload Diff" : "Week 4 Hypertrophy Meso Progression",
    status: "PROPOSED", // 'PROPOSED' | 'MODIFIED' | 'PUBLISHED'
    topSingle: isPl ? 142.5 : 110.0,
    topSingleDiff: "+2.5 kg",
    backoffLoad: isPl ? 122.5 : 95.0,
    backoffSets: "3 sets × 5 reps",
    accessories: isPl ? "Pause Bench 3×4 @ 95kg, Romanian Deadlift 3×8 @ 130kg" : "Incline DB Press 4×10, Lat Pulldown 4×12, Cable Lateral 4×15",
    coachNotes: "AI algorithm nudged top load based on RPE 7.5 reserve."
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setProgramData(JSON.parse(saved));
      }
    } catch {
      // Retain default
    }
  }, [athlete.id, storageKey]);

  const handleSaveEdit = () => {
    const updated = { ...programData, status: "MODIFIED" };
    setProgramData(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setIsEditing(false);
    toast.success(`Program adjustments saved for ${athlete.name}! You can now publish.`);
  };

  const handlePublish = () => {
    const published = { ...programData, status: "PUBLISHED" };
    setProgramData(published);
    localStorage.setItem(storageKey, JSON.stringify(published));
    onApproveProgram?.(athlete.id);
    toast.success(`Program approved and published to ${athlete.name}'s active training feed!`);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-ink">{programData.title}</h3>
            {programData.status === "MODIFIED" && (
              <span className="px-2 py-0.5 rounded bg-warn/15 text-warn border border-warn/30 font-semibold text-[10px]">
                Modified by Coach
              </span>
            )}
            {programData.status === "PUBLISHED" && (
              <span className="px-2 py-0.5 rounded bg-ok/15 text-ok border border-ok/30 font-semibold text-[10px]">
                ✓ Live on Athlete App
              </span>
            )}
          </div>
          <p className="text-muted mt-0.5">Compare AI proposed progressive overload, edit loads, and publish to {athlete.name}.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>{isEditing ? "Close Editor" : "Edit Plan"}</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handlePublish}
            disabled={programData.status === "PUBLISHED"}
            className="text-xs gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{programData.status === "PUBLISHED" ? "Published" : "Approve & Publish"}</span>
          </Button>
        </div>
      </div>

      {/* Editor or Diff View */}
      {isEditing ? (
        <div className="rounded-xl border border-accent/40 bg-bg p-4 space-y-4">
          <div className="flex items-center justify-between text-accent font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Coach Override Editor</span>
            </span>
            <span className="text-muted text-[11px]">Adjust before publishing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1">
                {isPl ? "Squat Top Single (kg)" : "Compound Main Target (kg)"}
              </label>
              <input
                type="number"
                step="0.5"
                value={programData.topSingle}
                onChange={(e) => setProgramData({ ...programData, topSingle: parseFloat(e.target.value) || 0 })}
                className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-ink font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1">Back-off Load (kg)</label>
              <input
                type="number"
                step="0.5"
                value={programData.backoffLoad}
                onChange={(e) => setProgramData({ ...programData, backoffLoad: parseFloat(e.target.value) || 0 })}
                className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-ink font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted block mb-1">Prescribed Scheme / Sets</label>
            <input
              type="text"
              value={programData.backoffSets}
              onChange={(e) => setProgramData({ ...programData, backoffSets: e.target.value })}
              className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-ink"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted block mb-1">Accessories Routine</label>
            <input
              type="text"
              value={programData.accessories}
              onChange={(e) => setProgramData({ ...programData, accessories: e.target.value })}
              className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-ink"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted block mb-1">Coach Direction for Athlete</label>
            <input
              type="text"
              value={programData.coachNotes}
              onChange={(e) => setProgramData({ ...programData, coachNotes: e.target.value })}
              className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-ink"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="md" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={handleSaveEdit} className="gap-1.5">
              <Check className="h-4 w-4" />
              <span>Save Adjustments</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-bg p-4 space-y-3">
          <div className="divide-y divide-line">
            <div className="py-2.5 flex justify-between items-center">
              <div>
                <span className="font-semibold text-ink block">
                  {isPl ? "Competition Squat Top Single" : "Primary Compound Anchor"}
                </span>
                <span className="text-muted text-[11px]">RPE 8.0 target</span>
              </div>
              <div className="text-right font-mono">
                <span className="num font-bold text-ink text-sm">{programData.topSingle} kg</span>
                <span className="text-ok font-semibold ml-2 text-xs">({programData.topSingleDiff})</span>
              </div>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div>
                <span className="font-semibold text-ink block">Back-off Working Sets</span>
                <span className="text-muted text-[11px]">{programData.backoffSets}</span>
              </div>
              <span className="num font-bold text-ink text-sm font-mono">{programData.backoffLoad} kg</span>
            </div>

            <div className="py-2.5">
              <span className="font-semibold text-ink block">Accessories & Hypertrophy Blocks</span>
              <p className="text-muted mt-0.5">{programData.accessories}</p>
            </div>

            <div className="py-2.5 bg-surface/50 -mx-4 px-4 rounded-b-xl">
              <span className="font-semibold text-accent block text-[11px]">Coach Notes to Athlete:</span>
              <p className="text-muted mt-0.5 italic">"{programData.coachNotes}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
