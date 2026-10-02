import React from "react";
import Button from "../../ui/Button";

export default function CoachLibrary() {
  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-4 flex items-center justify-between">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">Exercise Technique & Cue Library</h1>
          <p className="text-sm text-muted">Curated movement variations, coaching cues, and biomechanics guides.</p>
        </div>
        <Button variant="primary" size="md">+ Add Movement</Button>
      </header>

      <div className="rounded-xl border border-line bg-surface p-6 space-y-4">
        <h2 className="num text-xl font-bold text-ink">Movement Database</h2>
        <div className="divide-y divide-line rounded-lg border border-line bg-bg">
          {[
            { lift: "Competition Squat", category: "Lower Body Compound", cues: "Tripod foot, wedge upper back, drive hips through" },
            { lift: "Pause Bench Press", category: "Upper Body Compound", cues: "Leg drive before press, bar over wrists, flared lats" },
            { lift: "Sumo Deadlift", category: "Posterior Chain Compound", cues: "Open groin, spread floor, pull slack out of bar" },
            { lift: "Romanian Deadlift", category: "Hamstring/Glute Accessory", cues: "Hinge at hip crease, soft knees, vertical shins" },
          ].map((item) => (
            <div key={item.lift} className="p-4 flex items-center justify-between">
              <div>
                <span className="font-semibold text-ink block">{item.lift}</span>
                <span className="text-xs text-muted">{item.category}</span>
                <span className="text-xs text-ink/80 block mt-1 italic">Cue: "{item.cues}"</span>
              </div>
              <Button variant="secondary" size="md">Edit Cues</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
