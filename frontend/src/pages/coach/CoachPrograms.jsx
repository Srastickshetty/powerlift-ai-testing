import React from "react";
import Button from "../../ui/Button";

export default function CoachPrograms() {
  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-4 flex items-center justify-between">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">Program Library & Builder</h1>
          <p className="text-sm text-muted">Create, clone, and assign 12-week powerlifting and bodybuilding mesocycles.</p>
        </div>
        <Button variant="primary" size="md">+ New Program Template</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "IPF 12-Week Peaking Block", athletes: 8, model: "DUP & RPE Autoregulation" },
          { title: "4-Day Upper/Lower Hypertrophy", athletes: 12, model: "Mesocycle Progression" },
          { title: "Raw Strength Base Accumulator", athletes: 5, model: "Linear Periodization" },
          { title: "Meet Week Taper Protocol", athletes: 3, model: "Fatigue Dissipation" },
        ].map((prog) => (
          <div key={prog.title} className="rounded-xl border border-line bg-surface p-5 space-y-3">
            <h3 className="num text-xl font-bold text-ink">{prog.title}</h3>
            <p className="text-xs text-muted">Active on {prog.athletes} athletes · {prog.model}</p>
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" size="md" className="flex-1">Edit Template</Button>
              <Button variant="secondary" size="md" className="flex-1">Assign</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
