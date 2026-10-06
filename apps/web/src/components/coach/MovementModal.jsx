import React, { useState, useEffect } from "react";
import { X, Dumbbell, Trash2, Video, CheckCircle2 } from "lucide-react";
import Button from "../../ui/Button";

const CATEGORIES = ["Compound", "Accessory", "Specialty", "Isolation"];

export default function MovementModal({ isOpen, onClose, movement, onSave, onDelete }) {
  const isEditing = Boolean(movement?.lift);

  const [formData, setFormData] = useState({
    id: "",
    lift: "",
    category: "Compound",
    cues: "",
    muscles: "",
    videoUrl: ""
  });

  useEffect(() => {
    if (movement) {
      setFormData({
        id: movement.id || movement.lift,
        lift: movement.lift || "",
        category: movement.category || "Compound",
        cues: movement.cues || "",
        muscles: movement.muscles || "",
        videoUrl: movement.videoUrl || ""
      });
    } else {
      setFormData({
        id: `mv_${Date.now()}`,
        lift: "",
        category: "Compound",
        cues: "",
        muscles: "",
        videoUrl: ""
      });
    }
  }, [movement, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.lift.trim()) return;

    onSave({
      ...formData,
      id: formData.id || formData.lift
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface border border-line rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">
                {isEditing ? "Edit Movement & Cues" : "Add New Movement"}
              </h3>
              <p className="text-xs text-muted">
                {isEditing ? "Refine technique instruction and cues" : "Add exercise variation to library"}
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
              Exercise / Movement Name *
            </label>
            <input
              type="text"
              required
              value={formData.lift}
              onChange={(e) => setFormData({ ...formData, lift: e.target.value })}
              placeholder="e.g. 2-Second Paused Bench Press"
              className="w-full h-11 px-3.5 rounded-lg border border-line bg-bg text-ink text-sm placeholder:text-muted/50 focus:border-accent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Movement Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full h-11 px-3 rounded-lg border border-line bg-bg text-ink text-sm focus:border-accent outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Coaching Cues & Technique Prescription *
            </label>
            <textarea
              required
              rows={3}
              value={formData.cues}
              onChange={(e) => setFormData({ ...formData, cues: e.target.value })}
              placeholder="e.g. Leg drive before press, bar over wrists, flared lats, pull slack out..."
              className="w-full p-3 rounded-lg border border-line bg-bg text-ink text-sm placeholder:text-muted/50 focus:border-accent outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-accent" /> Technique Reference Video URL
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="Google Drive preview link, YouTube unlisted link, or MP4..."
              className="w-full h-10 px-3 rounded-lg border border-line bg-bg text-ink text-xs placeholder:text-muted/50 focus:border-accent outline-none"
            />
            <p className="text-[11px] text-muted mt-1">
              Supports Google Drive video sharing links, YouTube unlisted, or cloud video URLs.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-line">
            {isEditing && onDelete ? (
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={() => {
                  if (window.confirm(`Delete exercise "${formData.lift}" from library?`)) {
                    onDelete(formData.id || formData.lift);
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
                {isEditing ? "Save Cues" : "Add Movement"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
