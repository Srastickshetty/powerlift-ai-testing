import React from "react";
import { 
  Activity, 
  Users, 
  Award, 
  Dumbbell, 
  Flame,
  CheckCircle2,
  Cpu
} from "lucide-react";

export default function AdminTelemetryKPIs({ activeSport }) {
  const isPl = activeSport === "pl";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Sport Track Focus KPI */}
      <div className="rounded-xl border border-line bg-surface p-4 sm:p-5 relative overflow-hidden shadow-sm hover:border-accent/40 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
            Domain Focus
          </span>
          <span className="p-1.5 rounded-lg bg-accent/15 text-accent border border-accent/25">
            {isPl ? <Dumbbell className="h-4 w-4" /> : <Flame className="h-4 w-4" />}
          </span>
        </div>

        <div className="mt-3">
          <div className="num text-2xl font-bold text-ink">
            {isPl ? "Powerlifting SBD" : "Bodybuilding Meso"}
          </div>
          <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {isPl ? "Squat, Bench & Deadlift 1RM" : "Hypertrophy & Sparing"}
          </p>
        </div>
      </div>

      {/* 2. System Engines & AI Safety SLA (Emerald OK) */}
      <div className="rounded-xl border border-line bg-surface p-4 sm:p-5 relative overflow-hidden shadow-sm hover:border-ok/40 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
            Engine Health
          </span>
          <span className="p-1.5 rounded-lg bg-ok/15 text-ok border border-ok/25">
            <Cpu className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-3">
          <div className="num text-2xl font-bold text-ok flex items-center gap-2">
            <span>100% Operational</span>
          </div>
          <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-ok shrink-0" />
            <span>Safety Rule §9 Active</span>
          </p>
        </div>
      </div>

      {/* 3. Verified Coach Roster (Electric Info Blue) */}
      <div className="rounded-xl border border-line bg-surface p-4 sm:p-5 relative overflow-hidden shadow-sm hover:border-info/40 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
            Coaches Onboarded
          </span>
          <span className="p-1.5 rounded-lg bg-info/15 text-info border border-info/25">
            <Award className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-3">
          <div className="num text-2xl font-bold text-ink flex items-baseline gap-2">
            <span>24</span>
            <span className="text-xs text-info font-semibold">Active Roster</span>
          </div>
          <p className="text-xs text-muted mt-1">
            {isPl ? "14 IPF / WRPF Specialists" : "10 IFBB / NPC Specialists"}
          </p>
        </div>
      </div>

      {/* 4. Telemetry Adherence (Warm Amber Warn) */}
      <div className="rounded-xl border border-line bg-surface p-4 sm:p-5 relative overflow-hidden shadow-sm hover:border-warn/40 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
            Platform Lifters
          </span>
          <span className="p-1.5 rounded-lg bg-warn/15 text-warn border border-warn/25">
            <Activity className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-3">
          <div className="num text-2xl font-bold text-ink flex items-baseline gap-2">
            <span>186</span>
            <span className="text-xs text-warn font-semibold">94% Adherence</span>
          </div>
          <p className="text-xs text-muted mt-1">
            Real-time biometric telemetry
          </p>
        </div>
      </div>
    </div>
  );
}
