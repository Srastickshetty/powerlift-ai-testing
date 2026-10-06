import React, { useState } from "react";
import { 
  Trophy, 
  Dumbbell, 
  Activity, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  Scale
} from "lucide-react";
import Button from "../../ui/Button";
import Stat from "../../ui/Stat";

export default function PlSportConsole() {
  const [plParams, setPlParams] = useState({
    maxOpenerJumpCap: 5, // %
    peakingIntensityCap: 95, // %
    velocityLossThreshold: 20, // %
    strictDepthEnforcement: true,
    inolLimitPerSession: 2.0,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6" data-track="pl">
      {/* Powerlifting KPIs Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label="Total SBD Volume"
          value="482.4 t"
          subtext="Past 30 days tonnage"
          trend="+14%"
          trendUp={true}
        />
        <Stat
          label="Avg DOTS Score"
          value="418.6"
          subtext="Active roster baseline"
          trend="+8.2 pts"
          trendUp={true}
        />
        <Stat
          label="9-for-9 Attempt Rate"
          value="87.4%"
          subtext="Competition strategy accuracy"
          trend="+4.1%"
          trendUp={true}
        />
        <Stat
          label="Active Meet Cycles"
          value="42 Lifters"
          subtext="Peaking for sanctioned meets"
        />
      </div>

      {/* SBD Sticking Points & Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-line bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="num text-lg font-bold text-ink flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-accent" />
              <span>SBD Weak Point Clustering</span>
            </h3>
            <span className="text-xs font-mono text-muted">AI Mapped</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">Squat: Out of the hole (rebound deficit)</span>
                <span className="font-bold text-ink">44%</span>
              </div>
              <div className="h-2 rounded-full bg-raised overflow-hidden">
                <div className="h-full bg-accent" style={{ width: "44%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">Bench: Mid-range tricep transition</span>
                <span className="font-bold text-ink">36%</span>
              </div>
              <div className="h-2 rounded-full bg-raised overflow-hidden">
                <div className="h-full bg-accent" style={{ width: "36%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">Deadlift: Breaking floor slack (Sumo/Conv)</span>
                <span className="font-bold text-ink">52%</span>
              </div>
              <div className="h-2 rounded-full bg-raised overflow-hidden">
                <div className="h-full bg-accent" style={{ width: "52%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Federation Distribution */}
        <div className="rounded-xl border border-line bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="num text-lg font-bold text-ink flex items-center gap-2">
              <Scale className="h-4 w-4 text-accent" />
              <span>Sanctioned Federations</span>
            </h3>
            <span className="text-xs font-mono text-muted">Active Lifters</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-lg border border-line bg-bg">
              <span className="num text-2xl font-bold text-ink block">58%</span>
              <span className="text-[11px] text-muted uppercase tracking-wider">IPF / National</span>
            </div>
            <div className="p-3 rounded-lg border border-line bg-bg">
              <span className="num text-2xl font-bold text-ink block">28%</span>
              <span className="text-[11px] text-muted uppercase tracking-wider">WRPF / Open</span>
            </div>
            <div className="p-3 rounded-lg border border-line bg-bg">
              <span className="num text-2xl font-bold text-ink block">14%</span>
              <span className="text-[11px] text-muted uppercase tracking-wider">USAPL / Tested</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-bg border border-line text-xs text-muted flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-ok shrink-0" />
            <span>IPF 2.5kg plate loading and round-down rule automatically applied.</span>
          </div>
        </div>
      </div>

      {/* Powerlifting Superadmin Tuning Parameters */}
      <section className="rounded-xl border border-line bg-surface p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h3 className="num text-xl font-bold text-ink flex items-center gap-2">
              <Sliders className="h-5 w-5 text-accent" />
              <span>Powerlifting Engine Parameters</span>
            </h3>
            <p className="text-xs text-muted">Global threshold limits enforced on coaching programs and autoregulation.</p>
          </div>
          {saved && (
            <span className="text-xs text-ok font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Parameters Synced
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5 bg-bg p-3.5 rounded-lg border border-line">
            <label className="text-xs font-semibold text-muted block">
              Max Opener Jump Cap (%)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={plParams.maxOpenerJumpCap}
              onChange={(e) => setPlParams({ ...plParams, maxOpenerJumpCap: Number(e.target.value) })}
              className="w-full h-11 px-3 rounded-md bg-surface border border-line text-ink text-base outline-none focus:border-accent"
            />
            <span className="text-[11px] text-muted">Clamps max attempt jumps between Opener and 2nd attempt.</span>
          </div>

          <div className="space-y-1.5 bg-bg p-3.5 rounded-lg border border-line">
            <label className="text-xs font-semibold text-muted block">
              Peaking Intensity Cap (%)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={plParams.peakingIntensityCap}
              onChange={(e) => setPlParams({ ...plParams, peakingIntensityCap: Number(e.target.value) })}
              className="w-full h-11 px-3 rounded-md bg-surface border border-line text-ink text-base outline-none focus:border-accent"
            />
            <span className="text-[11px] text-muted">Max percentage of 1RM permitted in realization phase.</span>
          </div>

          <div className="space-y-1.5 bg-bg p-3.5 rounded-lg border border-line">
            <label className="text-xs font-semibold text-muted block">
              INOL Fatigue Limit (per session)
            </label>
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              value={plParams.inolLimitPerSession}
              onChange={(e) => setPlParams({ ...plParams, inolLimitPerSession: Number(e.target.value) })}
              className="w-full h-11 px-3 rounded-md bg-surface border border-line text-ink text-base outline-none focus:border-accent"
            />
            <span className="text-[11px] text-muted">Triggers axial deload warning when single session exceeds INOL 2.0.</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="md" onClick={handleSave} className="font-bold">
            Save Powerlifting Parameters
          </Button>
        </div>
      </section>
    </div>
  );
}
