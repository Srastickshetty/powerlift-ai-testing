import React, { useState } from "react";
import { 
  Flame, 
  Layers, 
  Camera, 
  Sliders, 
  CheckCircle2, 
  Scale, 
  HeartHandshake 
} from "lucide-react";
import Button from "../../ui/Button";
import Stat from "../../ui/Stat";

export default function BbSportConsole() {
  const [bbParams, setBbParams] = useState({
    minCalorieFloorBmrPercent: 80, // %
    maxWeeklyBwLossRate: 1.0, // % of BW
    minProteinPerKg: 1.6, // g/kg
    restPauseMachineLockOnly: true,
    photoCadenceDays: 7,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6" data-track="bb">
      {/* Bodybuilding KPIs Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label="Weekly Check-In Rate"
          value="94.2%"
          subtext="Physique photo submissions"
          trend="+5.8%"
          trendUp={true}
        />
        <Stat
          label="Avg Sets in MAV"
          value="16.4"
          subtext="Sets/muscle/wk sweet spot"
          trend="+1.2 sets"
          trendUp={true}
        />
        <Stat
          label="Contest Prep Roster"
          value="38 Athletes"
          subtext="Within 16 weeks of stage"
        />
        <Stat
          label="Avg Rate of Loss"
          value="0.68%"
          subtext="BW loss/wk in active cut"
        />
      </div>

      {/* Hypertrophy Volume Landmarks & Division Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Muscle Group Landmark Distribution */}
        <div className="rounded-xl border border-line bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="num text-lg font-bold text-ink flex items-center gap-2">
              <Layers className="h-4 w-4 text-accent" />
              <span>Hypertrophy Volume Landmarks</span>
            </h3>
            <span className="text-xs font-mono text-muted">Weekly Averages</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">Lats / Upper Back (Target MAV: 16–22)</span>
                <span className="font-bold text-ink">18.4 sets</span>
              </div>
              <div className="h-2 rounded-full bg-raised overflow-hidden">
                <div className="h-full bg-accent" style={{ width: "82%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">Side / Rear Delts (Target MAV: 18–26)</span>
                <span className="font-bold text-ink">22.0 sets</span>
              </div>
              <div className="h-2 rounded-full bg-raised overflow-hidden">
                <div className="h-full bg-accent" style={{ width: "88%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">Hamstrings / Glutes (Target MAV: 12–18)</span>
                <span className="font-bold text-ink">14.6 sets</span>
              </div>
              <div className="h-2 rounded-full bg-raised overflow-hidden">
                <div className="h-full bg-accent" style={{ width: "70%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Division Distribution */}
        <div className="rounded-xl border border-line bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="num text-lg font-bold text-ink flex items-center gap-2">
              <Flame className="h-4 w-4 text-accent" />
              <span>Physique Divisions</span>
            </h3>
            <span className="text-xs font-mono text-muted">Active Roster</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-lg border border-line bg-bg">
              <span className="num text-2xl font-bold text-ink block">42%</span>
              <span className="text-[11px] text-muted uppercase tracking-wider">Classic Physique</span>
            </div>
            <div className="p-3 rounded-lg border border-line bg-bg">
              <span className="num text-2xl font-bold text-ink block">34%</span>
              <span className="text-[11px] text-muted uppercase tracking-wider">Men's Physique</span>
            </div>
            <div className="p-3 rounded-lg border border-line bg-bg">
              <span className="num text-2xl font-bold text-ink block">24%</span>
              <span className="text-[11px] text-muted uppercase tracking-wider">Bikini / Figure</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-bg border border-line text-xs text-muted flex items-center gap-2">
            <Camera className="h-4 w-4 text-accent shrink-0" />
            <span>Weekly front/side/back mandatory posing photos encrypted with coach consent tags.</span>
          </div>
        </div>
      </div>

      {/* Bodybuilding Superadmin Tuning Parameters */}
      <section className="rounded-xl border border-line bg-surface p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h3 className="num text-xl font-bold text-ink flex items-center gap-2">
              <Sliders className="h-5 w-5 text-accent" />
              <span>Hypertrophy & Prep Parameters</span>
            </h3>
            <p className="text-xs text-muted">Rules governing double progression, prep caloric safety, and intensity gating.</p>
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
              Min Calorie Floor (% BMR)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={bbParams.minCalorieFloorBmrPercent}
              onChange={(e) => setBbParams({ ...bbParams, minCalorieFloorBmrPercent: Number(e.target.value) })}
              className="w-full h-11 px-3 rounded-md bg-surface border border-line text-ink text-base outline-none focus:border-accent"
            />
            <span className="text-[11px] text-muted">Rule 6: Blocks starvation cut diets below 80% BMR.</span>
          </div>

          <div className="space-y-1.5 bg-bg p-3.5 rounded-lg border border-line">
            <label className="text-xs font-semibold text-muted block">
              Max Weekly BW Loss Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              value={bbParams.maxWeeklyBwLossRate}
              onChange={(e) => setBbParams({ ...bbParams, maxWeeklyBwLossRate: Number(e.target.value) })}
              className="w-full h-11 px-3 rounded-md bg-surface border border-line text-ink text-base outline-none focus:border-accent"
            />
            <span className="text-[11px] text-muted">Clamps aggressive prep weight cuts exceeding 1.0% BW/week.</span>
          </div>

          <div className="space-y-1.5 bg-bg p-3.5 rounded-lg border border-line">
            <label className="text-xs font-semibold text-muted block">
              Min Protein Floor (g/kg BW)
            </label>
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              value={bbParams.minProteinPerKg}
              onChange={(e) => setBbParams({ ...bbParams, minProteinPerKg: Number(e.target.value) })}
              className="w-full h-11 px-3 rounded-md bg-surface border border-line text-ink text-base outline-none focus:border-accent"
            />
            <span className="text-[11px] text-muted">Rule 7: Enforces lean tissue preservation during caloric deficits.</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="md" onClick={handleSave} className="font-bold min-h-[44px]">
            Save Bodybuilding Parameters
          </Button>
        </div>
      </section>
    </div>
  );
}
