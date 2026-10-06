import React, { useState } from "react";
import { Trophy, TrendingUp, Dumbbell, Award, Flame } from "lucide-react";
import Stat from "../../ui/Stat";
import ChartCard from "../../ui/ChartCard";
import { useAuth } from "../../auth/authContext";

const SQUAT_DATA = [
  { week: "W1", value: 155, isPR: false },
  { week: "W2", value: 157.5, isPR: false },
  { week: "W3", value: 160, isPR: false },
  { week: "W4", value: 150, isPR: false, note: "Deload recovery" },
  { week: "W5", value: 162.5, isPR: false },
  { week: "W6", value: 165, isPR: true, note: "Triple PR: 165×3" },
  { week: "W7", value: 167.5, isPR: false },
  { week: "W8", value: 155, isPR: false, note: "Scheduled deload" },
  { week: "W9", value: 170, isPR: false },
  { week: "W10", value: 172.5, isPR: true, note: "Current e1RM record" },
];

const BENCH_DATA = [
  { week: "W1", value: 110, isPR: false },
  { week: "W2", value: 112.5, isPR: false },
  { week: "W3", value: 115, isPR: false },
  { week: "W4", value: 105, isPR: false, note: "Deload recovery" },
  { week: "W5", value: 117.5, isPR: false },
  { week: "W6", value: 117.5, isPR: false },
  { week: "W7", value: 120, isPR: true, note: "Paused Single PR" },
  { week: "W8", value: 110, isPR: false, note: "Deload recovery" },
  { week: "W9", value: 122.5, isPR: true, note: "Competition PR" },
  { week: "W10", value: 122.5, isPR: false },
];

const DEADLIFT_DATA = [
  { week: "W1", value: 195, isPR: false },
  { week: "W2", value: 200, isPR: false },
  { week: "W3", value: 202.5, isPR: false },
  { week: "W4", value: 185, isPR: false, note: "Deload recovery" },
  { week: "W5", value: 205, isPR: false },
  { week: "W6", value: 207.5, isPR: false },
  { week: "W7", value: 210, isPR: true, note: "Double PR" },
  { week: "W8", value: 190, isPR: false, note: "Deload recovery" },
  { week: "W9", value: 212.5, isPR: false },
  { week: "W10", value: 215, isPR: true, note: "Current e1RM record" },
];

const BODY_DATA = [
  { week: "W1", value: 80.2, isPR: false },
  { week: "W2", value: 80.5, isPR: false },
  { week: "W3", value: 80.8, isPR: false },
  { week: "W4", value: 80.6, isPR: false },
  { week: "W5", value: 81.0, isPR: false },
  { week: "W6", value: 81.2, isPR: false },
  { week: "W7", value: 81.3, isPR: false },
  { week: "W8", value: 81.1, isPR: false },
  { week: "W9", value: 81.4, isPR: false },
  { week: "W10", value: 81.5, isPR: false },
];

export default function Progress() {
  const { profile } = useAuth();
  const [segment, setSegment] = useState("lifts"); // 'lifts' | 'volume' | 'body' | 'prs'
  const track = profile?.track === "bb" || profile?.pathway === "fitness" ? "bb" : "pl";

  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="num text-3xl font-bold tracking-tight text-ink">Progress & Analytics</h1>
          <p className="text-sm text-muted">Autoregulated strength trajectory, PR markers, and volume fatigue trends.</p>
        </div>

        {/* Segmented Control */}
        <div className="flex rounded-lg border border-line bg-surface p-1 text-xs" role="tablist">
          {["lifts", "volume", "body", "prs"].map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={segment === tab}
              onClick={() => setSegment(tab)}
              className={`px-3 py-1.5 rounded-md font-semibold uppercase transition ${
                segment === tab ? "bg-accent text-accent-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Primary Stat Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Squat e1RM"
          value="172.5"
          unit="kg"
          change="+5.0 kg (+3.2%)"
          changeType="ok"
        />
        <Stat
          label="Bench e1RM"
          value="122.5"
          unit="kg"
          change="+2.5 kg (+2.1%)"
          changeType="ok"
        />
        <Stat
          label="Deadlift e1RM"
          value="215.0"
          unit="kg"
          change="+7.5 kg (+3.6%)"
          changeType="ok"
        />
        <Stat
          label="Competition Total"
          value="510.0"
          unit="kg"
          change="+15.0 kg"
          changeType="ok"
        />
      </div>

      {/* 2×2 Responsive Chart Grid on Desktop (>= lg) / Stacked Cards on Mobile (< md) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Squat Strength Trajectory"
          subtitle="Estimated 1RM with annotated PR milestones & deloads"
          data={SQUAT_DATA}
          dataKey="value"
          unit="kg"
          color="var(--accent)"
        />

        <ChartCard
          title="Bench Press Trajectory"
          subtitle="Pause single strength velocity regression"
          data={BENCH_DATA}
          dataKey="value"
          unit="kg"
          color="#3DD68C"
        />

        <ChartCard
          title="Deadlift Strength Trajectory"
          subtitle="Hip hinge pulling capacity over 10 weeks"
          data={DEADLIFT_DATA}
          dataKey="value"
          unit="kg"
          color="#4C9AFF"
        />

        <ChartCard
          title="Bodyweight Trend"
          subtitle="Weekly morning weigh-in moving average"
          data={BODY_DATA}
          dataKey="value"
          unit="kg"
          color="#F5A524"
        />
      </div>

      {/* Recent Personal Records Section */}
      <div className="rounded-xl border border-line bg-surface p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          <h2 className="num text-xl font-bold text-ink">Recent Lifetime PRs</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { lift: "Competition Squat", record: "165.0 kg × 3", badge: "Triple PR", date: "2 weeks ago" },
            { lift: "Paused Bench Press", record: "122.5 kg × 1", badge: "1RM PR", date: "1 week ago" },
            { lift: "Deadlift", record: "210.0 kg × 2", badge: "Double PR", date: "3 weeks ago" },
          ].map((item) => (
            <div key={item.lift} className="rounded-lg border border-line bg-bg p-4 space-y-1.5">
              <span className="text-xs text-muted block">{item.lift}</span>
              <span className="num text-2xl font-bold text-ink block">{item.record}</span>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-line/50">
                <span className="font-mono text-accent font-semibold">{item.badge}</span>
                <span className="text-muted">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
