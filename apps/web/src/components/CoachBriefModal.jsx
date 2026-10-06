import React from 'react';
import { ShieldAlert, Award, Calendar, Dumbbell, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

export default function CoachBriefModal({ brief, onAcknowledge }) {
  if (!brief) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        role="dialog" 
        aria-modal="true"
        aria-labelledby="brief-title"
        className="relative w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 grid place-items-center text-accent">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">AI Coach Synthesis</span>
              <h2 id="brief-title" className="text-xl font-bold text-ink">Coach Brief: {brief.athleteName}</h2>
            </div>
          </div>
          <span className="rounded-full border border-line bg-bg px-2.5 py-1 text-xs font-semibold text-accent">
            {brief.track}
          </span>
        </div>

        {/* Youth-Safe Mode Banner */}
        {brief.isYouthSafeMode && (
          <div className="rounded-xl border border-warn/40 bg-warn/10 p-3.5 flex items-start gap-3 text-warn">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Youth Athlete Guardrails Active (&lt;18)</p>
              <p className="text-muted text-[11px] leading-relaxed">
                Conservative volume progression enforced. Extreme deficits, rapid weight cuts, and contest prep are locked.
              </p>
            </div>
          </div>
        )}

        {/* Primary Objective & Weekly Setup */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-line bg-bg p-3">
            <span className="text-muted block text-[10px] uppercase font-mono">Objective</span>
            <span className="font-bold text-ink mt-0.5 block">{brief.primaryObjective}</span>
          </div>
          <div className="rounded-xl border border-line bg-bg p-3">
            <span className="text-muted block text-[10px] uppercase font-mono">Frequency</span>
            <span className="font-bold text-ink mt-0.5 block">{brief.weeklySchedule}</span>
          </div>
        </div>

        {/* Week 1 Overview */}
        <div className="rounded-xl border border-line bg-bg/50 p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink">
            <Calendar className="h-4 w-4 text-accent" />
            <span>Week 1 Protocol</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {brief.week1Overview}
          </p>
        </div>

        {/* Safety Directives */}
        {brief.safetyDirectives && brief.safetyDirectives.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">Directives &amp; Constraints</span>
            <ul className="text-xs text-muted space-y-1">
              {brief.safetyDirectives.map((dir, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>{dir}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Equipment Available */}
        {brief.equipmentSummary && (
          <div className="flex items-center gap-2 text-xs text-muted pt-1">
            <Dumbbell className="h-4 w-4 text-muted shrink-0" />
            <span>Equipment mapped: {brief.equipmentSummary.join(', ')}</span>
          </div>
        )}

        {/* CTA Button */}
        <div className="pt-2 border-t border-line">
          <Button
            variant="primary"
            size="lg"
            className="w-full text-base font-semibold"
            onClick={onAcknowledge}
          >
            <span>Confirm &amp; Enter Training Arena</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
