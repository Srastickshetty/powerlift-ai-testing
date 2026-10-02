import React from "react";
import { MessageCircle, Video, CheckCircle2, UserCheck, ShieldAlert } from "lucide-react";
import Button from "../../ui/Button";

export default function CoachTab() {
  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">Coach Collaboration</h1>
          <p className="text-sm text-muted">Weekly check-ins, technique video critiques, and direct feedback.</p>
        </div>
        <Button variant="primary" size="md">Submit Weekly Check-In</Button>
      </header>

      {/* Linked Coach Status */}
      <div className="rounded-xl border border-line bg-surface p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full border border-line bg-raised grid place-items-center text-xl font-bold text-accent">
            MC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="num text-xl font-bold text-ink">Coach Michael Chen</h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-ok/20 text-ok border border-ok/30 font-semibold">
                Active Link
              </span>
            </div>
            <p className="text-xs text-muted">Specialty: IPF Raw Powerlifting & Peaking Protocols</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md">Direct Message</Button>
          <Button variant="ghost" size="md" className="text-muted hover:text-danger">Change Coach</Button>
        </div>
      </div>

      {/* Check-In Action Card */}
      <div className="rounded-xl border border-line bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="num text-xl font-bold text-ink">Sunday Check-In Due in 2 Days</h2>
          <span className="text-xs text-warn font-semibold">Pending Form Submission</span>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          Submit your average weekly bodyweight, joint fatigue ratings, and upload competition squat/bench sets for pause verification before Monday's block adjustment.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="primary" size="md">Complete Check-In Form</Button>
          <Button variant="secondary" size="md">Upload Form Videos</Button>
        </div>
      </div>

      {/* Recent Feedback Feed */}
      <div className="rounded-xl border border-line bg-surface p-6 space-y-4">
        <h2 className="num text-xl font-bold text-ink">Recent Video Critique</h2>
        <div className="rounded-lg border border-line bg-bg p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="font-semibold text-ink">Competition Bench Press (117.5kg × 1)</span>
            <span>Reviewed yesterday</span>
          </div>
          <p className="text-sm text-muted italic">
            "Pause was rock solid on the chest. Make sure you don't allow elbows to flare too early on the drive phase off the chest."
          </p>
          <div className="flex items-center gap-2 text-xs text-accent font-semibold pt-1">
            <Video className="h-4 w-4" />
            <span>Timestamp marker 0:14 — Flare critique</span>
          </div>
        </div>
      </div>
    </div>
  );
}
