import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock, CheckCircle2 } from "lucide-react";
import Button from "../../ui/Button";
import { toast } from "sonner";

export default function AthleteNotesTab({ athlete }) {
  const storageKey = `coach_notes_${athlete.id}`;
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState([]);

  // Load notes strictly isolated to this athlete's ID
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotes(JSON.parse(saved));
      } else {
        // Initial sample note customized for this specific athlete
        const initial = [
          {
            id: `note_${Date.now()}_1`,
            text: athlete.track === "bb"
              ? `Posing and macro check-in noted for ${athlete.name}. Prioritizing deltoid lateral raises and hamstring curl volume.`
              : `Aiming for competition peaking block with ${athlete.name}. Target opener: Squat 180kg, Bench 125kg, Deadlift 225kg.`,
            createdAt: "Yesterday at 4:15 PM",
            author: "Head Coach"
          }
        ];
        setNotes(initial);
        localStorage.setItem(storageKey, JSON.stringify(initial));
      }
    } catch {
      setNotes([]);
    }
  }, [athlete.id, storageKey]);

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const noteObj = {
      id: `note_${Date.now()}`,
      text: newNote.trim(),
      createdAt: new Date().toLocaleDateString(undefined, { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      }),
      author: "Coach"
    };

    const updated = [noteObj, ...notes];
    setNotes(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setNewNote("");
    toast.success(`Private note saved for ${athlete.name}!`);
  };

  const handleDeleteNote = (id) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    toast.info("Note deleted from athlete record.");
  };

  return (
    <div className="space-y-5 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-ink">Private Coach Notes for {athlete.name}</h3>
          <p className="text-muted">Encrypted private observations saved exclusively to this athlete's file.</p>
        </div>
        <span className="px-2 py-0.5 rounded bg-raised border border-line text-[11px] font-mono text-muted">
          {notes.length} saved
        </span>
      </div>

      {/* Note Composer */}
      <form onSubmit={handleSaveNote} className="space-y-2.5 rounded-xl border border-line bg-bg p-3.5">
        <textarea
          rows={3}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={`Add private notes for ${athlete.name} (e.g. cue reminders, meet goals, injury adjustments)...`}
          className="w-full bg-surface border border-line rounded-lg p-3 text-xs text-ink focus:outline-none focus:border-accent"
        />
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Save Private Note</span>
          </Button>
        </div>
      </form>

      {/* Notes History Feed */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
          Saved Notes Timeline
        </span>

        {notes.length === 0 ? (
          <div className="p-6 rounded-xl border border-line bg-bg text-center text-muted">
            No notes saved yet for {athlete.name}. Write an observation above to start.
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-3.5 rounded-xl border border-line bg-bg space-y-2 group">
              <div className="flex items-center justify-between text-muted text-[11px]">
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  <CheckCircle2 className="h-3.5 w-3.5 text-ok" />
                  {note.author}
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {note.createdAt}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-muted hover:text-danger opacity-70 hover:opacity-100 transition p-0.5"
                    title="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-ink leading-relaxed whitespace-pre-wrap">{note.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
