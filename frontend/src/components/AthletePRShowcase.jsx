import React, { useState, useEffect } from 'react';
import { Trophy, Award, Flame, Target, Edit3, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Clean & Motivating Lifter PR Trophy Showcase & Milestone Tracker
 * Uncluttered, high-aesthetic badges with 1-tap PR updates
 */
export const AthletePRShowcase = ({ profile, bodyweight = 74, gender = 'male' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [prs, setPrs] = useState(() => {
    const saved = localStorage.getItem('titan_lifter_prs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      squat: profile?.training_max?.squat || 195,
      bench: profile?.training_max?.bench || 130,
      deadlift: profile?.training_max?.deadlift || 235
    };
  });

  const total = (Number(prs.squat) || 0) + (Number(prs.bench) || 0) + (Number(prs.deadlift) || 0);

  // DOTS calculation
  const calculateDots = (tot, bw, isMale) => {
    if (!tot || !bw) return 0;
    const coeffMale = [-307.27205, 24.372449, -0.2250154, 0.00097794, -0.000001643];
    const coeffFemale = [-57.96288, 13.6175032, -0.11266554, 0.0005158568, -0.0000010706];
    const c = isMale ? coeffMale : coeffFemale;
    const denom = c[0] + (c[1] * bw) + (c[2] * Math.pow(bw, 2)) + (c[3] * Math.pow(bw, 3)) + (c[4] * Math.pow(bw, 4));
    if (denom <= 0) return 0;
    return Math.round((500 / denom) * tot * 100) / 100;
  };

  const dots = calculateDots(total, bodyweight, gender === 'male');

  // Next Milestone Target
  const nextTotalMilestone = Math.ceil((total + 1) / 50) * 50;
  const kgRemaining = nextTotalMilestone - total;

  const handleSave = () => {
    localStorage.setItem('titan_lifter_prs', JSON.stringify(prs));
    setIsEditing(false);
    toast.success("Personal Records updated!");
  };

  return (
    <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-black rounded-xl border border-white/10 p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-orange-500" />
          <h3 className="text-base font-black italic uppercase text-white tracking-wide">
            Personal Records & Platform Total
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
            {bodyweight}kg Class
          </span>
        </div>

        <button
          onClick={() => {
            if (isEditing) handleSave();
            else setIsEditing(true);
          }}
          className="font-mono text-xs text-orange-400 hover:text-white flex items-center gap-1 transition-colors px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800"
        >
          {isEditing ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Edit3 className="w-3.5 h-3.5" />}
          <span>{isEditing ? 'Save PRs' : 'Edit PRs'}</span>
        </button>
      </div>

      {/* PR Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
        <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-500 uppercase block">Squat PR</span>
          {isEditing ? (
            <input
              type="number"
              value={prs.squat}
              onChange={(e) => setPrs({ ...prs, squat: e.target.value })}
              className="w-16 bg-zinc-900 text-white font-black text-center text-lg rounded border border-zinc-700"
            />
          ) : (
            <span className="text-xl font-black text-white">{prs.squat} <span className="text-xs font-normal text-zinc-400">kg</span></span>
          )}
        </div>

        <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-500 uppercase block">Bench Press PR</span>
          {isEditing ? (
            <input
              type="number"
              value={prs.bench}
              onChange={(e) => setPrs({ ...prs, bench: e.target.value })}
              className="w-16 bg-zinc-900 text-white font-black text-center text-lg rounded border border-zinc-700"
            />
          ) : (
            <span className="text-xl font-black text-white">{prs.bench} <span className="text-xs font-normal text-zinc-400">kg</span></span>
          )}
        </div>

        <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-500 uppercase block">Deadlift PR</span>
          {isEditing ? (
            <input
              type="number"
              value={prs.deadlift}
              onChange={(e) => setPrs({ ...prs, deadlift: e.target.value })}
              className="w-16 bg-zinc-900 text-white font-black text-center text-lg rounded border border-zinc-700"
            />
          ) : (
            <span className="text-xl font-black text-white">{prs.deadlift} <span className="text-xs font-normal text-zinc-400">kg</span></span>
          )}
        </div>

        <div className="bg-zinc-950/80 p-3 rounded-lg border border-orange-500/30 text-center">
          <span className="text-[10px] text-orange-400 uppercase block font-bold">Total PR</span>
          <span className="text-xl font-black text-orange-400">{total} <span className="text-xs font-normal text-zinc-400">kg</span></span>
        </div>

        <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] text-zinc-500 uppercase block">DOTS Score</span>
          <span className="text-xl font-black text-green-400">{dots}</span>
        </div>
      </div>

      {/* Milestone Progress Bar */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-orange-500" />
          <span className="text-zinc-300">
            Road to <strong className="text-white">{nextTotalMilestone} KG Total</strong>:
          </span>
          <span className="text-orange-400 font-bold">{kgRemaining} kg to go!</span>
        </div>

        <div className="w-full sm:w-48 bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-600 to-amber-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.max(10, ((50 - kgRemaining) / 50) * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AthletePRShowcase;
