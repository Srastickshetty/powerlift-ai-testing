import React, { useState, useMemo } from 'react';
import { Trophy, Clock, Check, X, Shield, AlertTriangle } from 'lucide-react';
import { calculateDots } from '@powerlift/engines';
import Button from '../../ui/Button';

export default function MeetDayMode({ bodyweight = 83, gender = 'male' }) {
  const [attempts, setAttempts] = useState({
    squat: [
      { num: 1, load: 185, good: true },
      { num: 2, load: 195, good: true },
      { num: 3, load: 202.5, good: false }
    ],
    bench: [
      { num: 1, load: 125, good: true },
      { num: 2, load: 132.5, good: true },
      { num: 3, load: 137.5, good: null }
    ],
    deadlift: [
      { num: 1, load: 220, good: null },
      { num: 2, load: 235, good: null },
      { num: 3, load: 245, good: null }
    ]
  });

  const toggleAttemptResult = (lift, index) => {
    setAttempts((prev) => {
      const next = { ...prev };
      const current = next[lift][index].good;
      next[lift][index] = {
        ...next[lift][index],
        good: current === true ? false : current === false ? null : true
      };
      return next;
    });
  };

  // Best successful lift per discipline
  const bestLifts = useMemo(() => {
    const getBest = (lift) => {
      const successful = attempts[lift].filter((a) => a.good === true);
      if (successful.length === 0) return 0;
      return Math.max(...successful.map((a) => a.load));
    };
    return {
      squat: getBest('squat'),
      bench: getBest('bench'),
      deadlift: getBest('deadlift')
    };
  }, [attempts]);

  const totalKg = bestLifts.squat + bestLifts.bench + bestLifts.deadlift;
  const dots = useMemo(() => {
    return calculateDots(bodyweight, totalKg, gender);
  }, [bodyweight, totalKg, gender]);

  return (
    <div className="space-y-6">
      {/* Platform Banner */}
      <div className="rounded-xl border border-line bg-surface p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">Championship Platform</span>
          <h2 className="text-2xl font-black text-ink mt-0.5">Meet Day Scoreboard</h2>
          <span className="text-xs text-muted block">Weigh-in Bodyweight: {bodyweight} kg</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-muted block">Current Total</span>
            <span className="num text-3xl font-black text-accent">{totalKg} <span className="text-xs font-normal text-muted">kg</span></span>
          </div>
          <div className="text-right border-l border-line pl-6">
            <span className="text-[10px] font-mono uppercase text-muted block">DOTS Score</span>
            <span className="num text-3xl font-black text-ok">{dots.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* 3 Discipline Flight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['squat', 'bench', 'deadlift']).map((lift) => (
          <div key={lift} className="rounded-xl border border-line bg-surface p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-ink">{lift}</span>
              <span className="text-xs font-mono font-bold text-accent">Best: {bestLifts[lift]} kg</span>
            </div>

            <div className="space-y-2">
              {attempts[lift].map((att, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleAttemptResult(lift, idx)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer select-none transition ${
                    att.good === true
                      ? 'border-ok/40 bg-ok/10 text-ink'
                      : att.good === false
                      ? 'border-warn/40 bg-warn/10 text-ink'
                      : 'border-line bg-bg text-muted hover:border-accent/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-muted">#{att.num}</span>
                    <span className="num text-lg font-bold text-ink">{att.load} kg</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {att.good === true && (
                      <span className="flex items-center gap-1 text-xs font-bold text-ok">
                        <Check className="h-4 w-4" /> Good
                      </span>
                    )}
                    {att.good === false && (
                      <span className="flex items-center gap-1 text-xs font-bold text-warn">
                        <X className="h-4 w-4" /> Miss
                      </span>
                    )}
                    {att.good === null && (
                      <span className="text-xs text-muted font-mono">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Official IPF Referee Commands Cheat-sheet */}
      <div className="rounded-xl border border-line bg-surface p-4 space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">IPF Platform Commands</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted">
          <div className="p-3 rounded-lg border border-line bg-bg">
            <span className="font-bold text-ink block mb-1">Squat:</span>
            <span>1. "SQUAT" (after unrack &amp; lock) → 2. "RACK" (after standing motionless).</span>
          </div>
          <div className="p-3 rounded-lg border border-line bg-bg">
            <span className="font-bold text-ink block mb-1">Bench:</span>
            <span>1. "START" → 2. "PRESS" (after motionless pause on chest) → 3. "RACK".</span>
          </div>
          <div className="p-3 rounded-lg border border-line bg-bg">
            <span className="font-bold text-ink block mb-1">Deadlift:</span>
            <span>Only 1 command: "DOWN" (after knees, hips, and shoulders are locked).</span>
          </div>
        </div>
      </div>
    </div>
  );
}
