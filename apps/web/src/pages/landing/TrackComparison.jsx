import React from "react";
import { Dumbbell, Flame } from "lucide-react";

export default function TrackComparison() {
  return (
    <section id="tracks" className="border-y border-line bg-surface py-16">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-accent font-bold">Dual Domain Specialization</span>
          <h2 className="num text-3xl sm:text-4xl font-bold text-ink mt-1">Two sports. Completely isolated engines.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-line bg-bg p-6 sm:p-8 space-y-4 shadow-sm hover:border-line-focus transition">
            <div className="flex items-center justify-between">
              <h3 className="num text-2xl font-bold text-accent flex items-center gap-2">
                <Dumbbell className="w-5 h-5" /> Powerlifting (SBD)
              </h3>
              <span className="px-2.5 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent text-xs font-mono font-bold">1RM Optimization</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted">
              <li>• Continuous e1RM autoregulation calculated from recorded RPE sets</li>
              <li>• Block periodization, DUP, and calibrated taper schedules</li>
              <li>• Weak-point targeting: pause variants, pin presses, deficit pulls</li>
              <li>• Competition backroom strategist: attempts, warmups, DOTS / IPF GL</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-line bg-bg p-6 sm:p-8 space-y-4 shadow-sm hover:border-line-focus transition">
            <div className="flex items-center justify-between">
              <h3 className="num text-2xl font-bold text-accent flex items-center gap-2">
                <Flame className="w-5 h-5" /> Bodybuilding (Physique)
              </h3>
              <span className="px-2.5 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent text-xs font-mono font-bold">Hypertrophy Volume</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted">
              <li>• Direct volume-per-muscle tracking aligned to MEV / MAV thresholds</li>
              <li>• Mesocycles escalating RIR with structured systemic deloads</li>
              <li>• High-resolution progress photo comparisons and tape measurements</li>
              <li>• Dynamic calorie and macro shifting linked to weekly bodyweight rates</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
