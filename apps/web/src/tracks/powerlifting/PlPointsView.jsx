import React, { useState, useMemo } from 'react';
import { Trophy, Award, Shield, Calculator } from 'lucide-react';
import { calculateAllPoints } from '@powerlift/engines';
import Stat from '../../ui/Stat';
import Button from '../../ui/Button';

export default function PlPointsView({ defaultBw = 83, defaultTotal = 600, defaultGender = 'male' }) {
  const [bw, setBw] = useState(defaultBw);
  const [total, setTotal] = useState(defaultTotal);
  const [gender, setGender] = useState(defaultGender);

  const scores = useMemo(() => {
    return calculateAllPoints(Number(bw) || 0, Number(total) || 0, gender);
  }, [bw, total, gender]);

  const classification = useMemo(() => {
    const dots = scores.dots;
    if (dots >= 450) return { title: 'National Elite', color: 'text-accent' };
    if (dots >= 380) return { title: 'Advanced Competitor', color: 'text-ok' };
    if (dots >= 300) return { title: 'Intermediate Lifter', color: 'text-ink' };
    return { title: 'Novice / Developing', color: 'text-muted' };
  }, [scores.dots]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            <span>Powerlifting Points &amp; Classification</span>
          </h2>
          <span className="text-xs text-muted block mt-0.5">
            Official DOTS, IPF GL, and Wilks relative strength scoring formulas
          </span>
        </div>
        <div className="flex rounded-lg border border-line bg-surface p-1 text-xs">
          <button
            type="button"
            onClick={() => setGender('male')}
            className={`px-3 py-1 rounded font-semibold transition ${
              gender === 'male' ? 'bg-accent text-bg' : 'text-muted hover:text-ink'
            }`}
          >
            Men
          </button>
          <button
            type="button"
            onClick={() => setGender('female')}
            className={`px-3 py-1 rounded font-semibold transition ${
              gender === 'female' ? 'bg-accent text-bg' : 'text-muted hover:text-ink'
            }`}
          >
            Women
          </button>
        </div>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-line bg-surface p-4 space-y-2">
          <label htmlFor="bw-input" className="text-xs font-mono uppercase text-muted block">
            Weigh-in Bodyweight (kg)
          </label>
          <input
            id="bw-input"
            type="number"
            inputMode="decimal"
            value={bw}
            onChange={(e) => setBw(parseFloat(e.target.value) || 0)}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base font-bold text-ink focus:border-accent focus:outline-none"
          />
        </div>

        <div className="rounded-xl border border-line bg-surface p-4 space-y-2">
          <label htmlFor="total-input" className="text-xs font-mono uppercase text-muted block">
            Projected / Platform Total (kg)
          </label>
          <input
            id="total-input"
            type="number"
            inputMode="decimal"
            value={total}
            onChange={(e) => setTotal(parseFloat(e.target.value) || 0)}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base font-bold text-ink focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat
          label="DOTS Points"
          value={scores.dots.toFixed(1)}
          unit="pts"
          change={classification.title}
          changeType="ok"
        />
        <Stat
          label="IPF GL Points"
          value={scores.ipfGl.toFixed(1)}
          unit="pts"
          change="Classic / Raw"
        />
        <Stat
          label="Wilks Formula"
          value={scores.wilks.toFixed(1)}
          unit="pts"
          change="Historic Benchmark"
        />
      </div>

      {/* Standing Banner */}
      <div className="rounded-xl border border-line bg-surface p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-raised border border-line grid place-items-center text-accent">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">National Standard</span>
            <span className={`text-base font-bold ${classification.color}`}>{classification.title}</span>
          </div>
        </div>
        <span className="text-xs text-muted font-mono">{scores.dots.toFixed(2)} DOTS</span>
      </div>
    </div>
  );
}
