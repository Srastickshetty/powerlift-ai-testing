import React, { useState, useEffect } from "react";
import { Plus, Edit3, UserCheck, Layers, Sparkles } from "lucide-react";
import Button from "../../ui/Button";
import ProgramTemplateModal from "../../components/coach/ProgramTemplateModal";
import AssignTemplateModal from "../../components/coach/AssignTemplateModal";

const DEFAULT_TEMPLATES = [
  {
    id: "tpl_1",
    title: "IPF 12-Week Peaking Block",
    track: "pl",
    athletes: 8,
    model: "DUP & RPE Autoregulation",
    weeks: 12,
    daysPerWeek: 4,
    notes: "Competition peaking for raw powerlifters. Heavy singles @ RPE 8-9 followed by 4x4 backoff volume."
  },
  {
    id: "tpl_2",
    title: "4-Day Upper/Lower Hypertrophy",
    track: "bb",
    athletes: 12,
    model: "Mesocycle Progression",
    weeks: 8,
    daysPerWeek: 4,
    notes: "Bodybuilding volume accumulation with deload at week 5. RIR 3 to RIR 0 progression."
  },
  {
    id: "tpl_3",
    title: "Raw Strength Base Accumulator",
    track: "pl",
    athletes: 5,
    model: "Linear Periodization",
    weeks: 10,
    daysPerWeek: 4,
    notes: "Submaximal volume base building to build work capacity before heavy peaking blocks."
  },
  {
    id: "tpl_4",
    title: "Meet Week Taper Protocol",
    track: "pl",
    athletes: 3,
    model: "Fatigue Dissipation",
    weeks: 2,
    daysPerWeek: 3,
    notes: "Neuromuscular maintenance, fatigue drop, light openers on Monday and Wednesday."
  },
];

export default function CoachPrograms() {
  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem("coach_program_templates");
      return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
    } catch {
      return DEFAULT_TEMPLATES;
    }
  });

  const [activeModal, setActiveModal] = useState(null); // 'create' | 'edit' | 'assign' | null
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {
    try {
      localStorage.setItem("coach_program_templates", JSON.stringify(templates));
    } catch (e) {
      console.error("Failed to save templates to localStorage", e);
    }
  }, [templates]);

  const handleSaveTemplate = (saved) => {
    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...saved };
        return next;
      }
      return [saved, ...prev];
    });
    showToast(`Template "${saved.title}" saved successfully!`);
  };

  const handleDeleteTemplate = (id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast("Template deleted.");
  };

  const handleAssigned = (template, athlete) => {
    showToast(`Assigned "${template.title}" to ${athlete?.name || "athlete"}!`);
    // increment athlete count
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === template.id ? { ...t, athletes: (t.athletes || 0) + 1 } : t
      )
    );
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-raised border border-accent/40 text-ink px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="border-b border-line pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">
            Program Library & Builder
          </h1>
          <p className="text-sm text-muted">
            Create, clone, and assign periodized mesocycles to your athletes.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="gap-2"
          onClick={() => {
            setSelectedTemplate(null);
            setActiveModal("create");
          }}
        >
          <Plus className="w-4 h-4" />
          <span>New Program Template</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((prog) => (
          <div
            key={prog.id || prog.title}
            className="rounded-xl border border-line bg-surface p-5 flex flex-col justify-between hover:border-line-focus transition space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="num text-lg font-bold text-ink leading-tight">
                  {prog.title}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-raised border border-line text-accent shrink-0">
                  {prog.track === "bb" ? "Bodybuilding" : "Powerlifting"}
                </span>
              </div>
              <p className="text-xs text-muted">
                Active on {prog.athletes || 0} athletes · {prog.model}
              </p>
              {prog.notes && (
                <p className="text-xs text-muted/80 line-clamp-2 italic bg-bg/50 p-2 rounded border border-line/50">
                  "{prog.notes}"
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-line">
              <Button
                variant="secondary"
                size="md"
                className="flex-1 gap-1.5 text-xs"
                onClick={() => {
                  setSelectedTemplate(prog);
                  setActiveModal("edit");
                }}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Template</span>
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1 gap-1.5 text-xs"
                onClick={() => {
                  setSelectedTemplate(prog);
                  setActiveModal("assign");
                }}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assign</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Program Template Modal (Create / Edit) */}
      <ProgramTemplateModal
        isOpen={activeModal === "create" || activeModal === "edit"}
        onClose={() => {
          setActiveModal(null);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        onSave={handleSaveTemplate}
        onDelete={handleDeleteTemplate}
      />

      {/* Assign Template Modal */}
      <AssignTemplateModal
        isOpen={activeModal === "assign"}
        onClose={() => {
          setActiveModal(null);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        onAssigned={handleAssigned}
      />
    </div>
  );
}
