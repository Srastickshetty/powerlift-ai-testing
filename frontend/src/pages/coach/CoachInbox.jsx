import React from "react";
import Button from "../../ui/Button";

export default function CoachInbox() {
  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-4 flex items-center justify-between">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">Coach Inbox & Check-Ins</h1>
          <p className="text-sm text-muted">Weekly submissions, form video reviews, and athlete messages.</p>
        </div>
        <Button variant="primary" size="md">Broadcast Message</Button>
      </header>

      <div className="rounded-xl border border-line bg-surface p-6 space-y-4">
        <h2 className="num text-xl font-bold text-ink">Pending Check-In Submissions</h2>
        <div className="divide-y divide-line rounded-lg border border-line bg-bg">
          {[
            { name: "Arjun Verma", track: "Powerlifting", time: "2 hrs ago", alert: "Needs Peaking Adjustment" },
            { name: "Priya Sharma", track: "Bodybuilding", time: "5 hrs ago", alert: "Check-in Photos Attached" },
            { name: "Dev Patel", track: "Powerlifting", time: "1 day ago", alert: "Reported Knee Fatigue (Score 4)" },
          ].map((item) => (
            <div key={item.name} className="p-4 flex items-center justify-between">
              <div>
                <span className="font-semibold text-ink block">{item.name}</span>
                <span className="text-xs text-muted">{item.track} · {item.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-warn/10 text-warn border border-warn/30">
                  {item.alert}
                </span>
                <Button variant="secondary" size="md">Review</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
