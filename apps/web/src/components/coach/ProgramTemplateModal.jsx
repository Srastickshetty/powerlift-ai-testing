import React, { useState, useEffect } from "react";
import { X, Dumbbell, Calendar, Layers, Activity, Trash2 } from "lucide-react";
import Button from "../../ui/Button";

const PERIODIZATION_MODELS = [
  "DUP & RPE Autoregulation",
  "Block Periodization",
  "Linear Periodization",
  "Mesocycle Progression",
  "Fatigue Dissipation Taper",
  "Conjugate / Max Effort"
];

export default function ProgramTemplateModal({ isOpen, onClose, template, onSave, onDelete }) {
  const isEditing = Boolean(template?.id || template?.title);

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    track: "pl",
    model: PERIODIZATION_MODELS[0],
    weeks: 12,
    daysPerWeek: 4,
    notes: "",
    athletes: 0
  });

  useEffect(() => {
    if (template) {
      setFormData({
        id: template.id || `tpl_${Date.now()}`,
        title: template.title || "",
        track: template.track || "pl",
        model: template.model || PERIODIZATION_MODELS[0],
        weeks: template.weeks || 12,
        daysPerWeek: template.daysPerWeek || 4,
        notes: template.notes || "",
        athletes: template.athletes || 0
      });
    } else {
      setFormData({
        id: `tpl_${Date.now()}`,
        title: "",
        track: "pl",
        model: PERIODIZATION_MODELS[0],
        weeks: 12,
        daysPerWeek: 4,
        notes: "",
        athletes: 0
      });
    }
  }, [template, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave({
      ...formData,
      id: formData.id || `tpl_${Date.now()}`,
      weeks: Number(formData.weeks) || 12,
      daysPerWeek: Number(formData.daysPerWeek) || 4
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-line rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">
                {isEditing ? "Edit Program Template" : "New Program Template"}
              </h3>
              <p className="text-xs text-muted">
                {isEditing ? "Modify block architecture and parameters" : "Build reusable periodized mesocycle template"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-raised transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Template Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. IPF 12-Week Peak & Priming"
              className="w-full h-11 px-3.5 rounded-lg border border-line bg-bg text-ink text-sm placeholder:text-muted/50 focus:border-accent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Sport Track
              </label>
              <select
                value={formData.track}
                onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-sm focus:border-accent outline-none"
              >
                <option value="pl">Powerlifting (SBD)</option>
                <option value="bb">Bodybuilding (Hypertrophy)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Periodization Model
              </label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-sm focus:border-accent outline-none"
              >
                {PERIODIZATION_MODELS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Total Weeks
              </label>
              <input
                type="number"
                min="1"
                max="52"
                inputMode="numeric"
                value={formData.weeks}
                onChange={(e) => setFormData({ ...formData, weeks: e.target.value })}
                className="w-full h-11 px-3.5 rounded-lg border border-line bg-bg text-ink text-sm focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Days / Week
              </label>
              <input
                type="number"
                min="2"
                max="7"
                inputMode="numeric"
                value={formData.daysPerWeek}
                onChange={(e) => setFormData({ ...formData, daysPerWeek: e.target.value })}
                className="w-full h-11 px-3.5 rounded-lg border border-line bg-bg text-ink text-sm focus:border-accent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Program Description & Progression Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Prescription guidelines, fatigue management rules, deload protocol..."
              className="w-full p-3 rounded-lg border border-line bg-bg text-ink text-sm placeholder:text-muted/50 focus:border-accent outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-line">
            {isEditing && onDelete ? (
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={() => {
                  if (window.confirm(`Delete template "${formData.title}"?`)) {
                    onDelete(formData.id);
                    onClose();
                  }
                }}
                className="gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </Button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md">
                {isEditing ? "Save Changes" : "Create Template"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
