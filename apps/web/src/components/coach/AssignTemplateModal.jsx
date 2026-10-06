import React, { useState } from "react";
import { X, UserCheck, Calendar, Check, Search, Dumbbell, ShieldCheck } from "lucide-react";
import Button from "../../ui/Button";

const ROSTER_ATHLETES = [
  { id: "ath_1", name: "Dev Patel", email: "dev.patel@gym.in", track: "pl", currentProgram: "IPF 12-Week Peaking Block" },
  { id: "ath_2", name: "Arjun Verma", email: "arjun.v@domain.com", track: "pl", currentProgram: "Raw Strength Base Accumulator" },
  { id: "ath_3", name: "Priya Sharma", email: "priya.fit@domain.com", track: "bb", currentProgram: "4-Day Upper/Lower Hypertrophy" },
  { id: "ath_4", name: "Rohan Malhotra", email: "rohan.lift@domain.com", track: "pl", currentProgram: "Meet Week Taper Protocol" },
  { id: "ath_5", name: "Ananya Iyer", email: "ananya.bb@domain.com", track: "bb", currentProgram: "4-Day Upper/Lower Hypertrophy" }
];

export default function AssignTemplateModal({ isOpen, onClose, template, onAssigned }) {
  const [selectedAthleteId, setSelectedAthleteId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
  );
  const [intensityModifier, setIntensityModifier] = useState("standard");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  if (!isOpen || !template) return null;

  const filteredAthletes = ROSTER_ATHLETES.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedAthleteId) return;

    const athlete = ROSTER_ATHLETES.find(a => a.id === selectedAthleteId);
    
    // Persist assignment to localStorage
    const assignmentRecord = {
      templateId: template.id || template.title,
      templateTitle: template.title,
      assignedAt: new Date().toISOString(),
      startDate,
      intensityModifier,
      notes,
      athleteName: athlete?.name
    };

    localStorage.setItem(`coach_active_program_${selectedAthleteId}`, JSON.stringify(assignmentRecord));
    
    if (onAssigned) {
      onAssigned(template, athlete);
    }

    setAssignedSuccess(true);
    setTimeout(() => {
      setAssignedSuccess(false);
      setSelectedAthleteId("");
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-line rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ok/15 border border-ok/20 flex items-center justify-center text-ok">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">Assign Template to Athlete</h3>
              <p className="text-xs text-muted truncate max-w-xs">{template.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-raised transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {assignedSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-ok/20 border border-ok/30 flex items-center justify-center text-ok">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-ink">Template Assigned Successfully!</h4>
            <p className="text-sm text-muted">
              {template.title} has been scheduled for the athlete starting {startDate}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleAssign} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Select Athlete from Roster *
              </label>
              
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter athletes by name or email..."
                  className="w-full h-9 pl-8 pr-3 rounded-lg border border-line bg-bg text-xs text-ink placeholder:text-muted/50 focus:border-accent outline-none"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-lg border border-line p-1.5 bg-bg">
                {filteredAthletes.map((ath) => {
                  const isSelected = selectedAthleteId === ath.id;
                  return (
                    <div
                      key={ath.id}
                      onClick={() => setSelectedAthleteId(ath.id)}
                      className={`p-2 rounded-md cursor-pointer flex items-center justify-between text-xs transition border ${
                        isSelected
                          ? "bg-accent/15 border-accent text-ink"
                          : "border-transparent hover:bg-surface text-muted hover:text-ink"
                      }`}
                    >
                      <div>
                        <span className="font-semibold text-ink">{ath.name}</span>
                        <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded uppercase font-bold bg-raised text-muted">
                          {ath.track}
                        </span>
                        <div className="text-[10px] text-muted">Currently: {ath.currentProgram}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-accent" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-line bg-bg text-ink text-xs focus:border-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Load Modifier
                </label>
                <select
                  value={intensityModifier}
                  onChange={(e) => setIntensityModifier(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-line bg-bg text-ink text-xs focus:border-accent outline-none"
                >
                  <option value="standard">Standard Progression (100%)</option>
                  <option value="conservative">Conservative Base (-5% initial loads)</option>
                  <option value="aggressive">Aggressive Peak (+2.5% progression)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Coach Onboarding Note to Athlete
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific cues or focus areas for this block (e.g. focus on pause bench bar path)..."
                className="w-full p-2.5 rounded-lg border border-line bg-bg text-ink text-xs placeholder:text-muted/50 focus:border-accent outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
              <Button type="button" variant="secondary" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!selectedAthleteId}
              >
                Confirm & Assign
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
