/**
 * PodiumAttemptBattleSolver.jsx - Meet Day Tactical Attempt & Podium Solver
 * Real-time "What-If" scenario calculator for 3rd attempts, Gold Medal attacks, and DOTS tie-breakers
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Swords, 
  ShieldCheck, 
  AlertCircle, 
  Scale, 
  TrendingUp, 
  Sparkles, 
  Award, 
  ChevronRight,
  Flame,
  CheckCircle2,
  Clock
} from 'lucide-react';

// DOTS Calculation helper
function calculateDots(weight, total, gender = 'men') {
  if (!weight || !total || weight <= 0) return 0;
  if (gender === 'men') {
    const a = -307.272, b = 24.3724, c = -0.191875, d = 0.000739073, e = -0.000001093;
    const denom = a + b * weight + c * Math.pow(weight, 2) + d * Math.pow(weight, 3) + e * Math.pow(weight, 4);
    return (500 / denom) * total;
  } else {
    const a = -57.96288, b = 13.6175032, c = -0.11266554, d = 0.0005158568, e = -0.0000010706;
    const denom = a + b * weight + c * Math.pow(weight, 2) + d * Math.pow(weight, 3) + e * Math.pow(weight, 4);
    return (500 / denom) * total;
  }
}

// IPF GL Calculation helper
function calculateIpfGl(weight, total, gender = 'men') {
  if (!weight || !total || weight <= 0) return 0;
  if (gender === 'men') {
    const a = 1199.72839, b = 1025.18162, c = -0.00921;
    const denom = a - b * Math.exp(c * weight);
    return (100 / denom) * total;
  } else {
    const a = 610.84442, b = 1045.59282, c = -0.03048;
    const denom = a - b * Math.exp(c * weight);
    return (100 / denom) * total;
  }
}

export default function PodiumAttemptBattleSolver({ athleteProfile = {} }) {
  // Goal: 'win_gold' | 'secure_podium' | 'dots_champion'
  const [goal, setGoal] = useState('win_gold');
  const [gender, setGender] = useState('men');
  const [metric, setMetric] = useState('total'); // 'total' | 'dots' | 'ipf_gl'

  // Athlete State
  const [myBw, setMyBw] = useState(athleteProfile.bodyweight || 73.8);
  const [myBestSquat, setMyBestSquat] = useState(210);
  const [myBestBench, setMyBestBench] = useState(140);
  const [myDeadlift1, setMyDeadlift1] = useState(240);
  const [myDeadlift2, setMyDeadlift2] = useState(255);
  const [myDeadlift2Rpe, setMyDeadlift2Rpe] = useState(8.5);
  const [myDeadlift2Result, setMyDeadlift2Result] = useState('good'); // 'good' | 'no_lift'

  // Competitor / Target Leader State
  const [rivalName, setRivalName] = useState('Competitor #1');
  const [rivalBw, setRivalBw] = useState(74.0);
  const [rivalBestSquat, setRivalBestSquat] = useState(215);
  const [rivalBestBench, setRivalBestBench] = useState(142.5);
  const [rivalProjectedDeadlift, setRivalProjectedDeadlift] = useState(252.5);

  // Solved Tactical Calculations
  const battleAnalysis = useMemo(() => {
    const mySubTotal = myBestSquat + myBestBench;
    const rivalSubTotal = rivalBestSquat + rivalBestBench;
    const rivalProjectedTotal = rivalSubTotal + rivalProjectedDeadlift;
    const rivalDots = calculateDots(rivalBw, rivalProjectedTotal, gender);
    const rivalGl = calculateIpfGl(rivalBw, rivalProjectedTotal, gender);

    // Is athlete lighter than rival? (Official IPF tie-breaker rule)
    const isAthleteLighter = myBw < rivalBw;
    const bwDiff = Math.abs(myBw - rivalBw);

    let minDeadliftNeeded = 0;
    let winReason = '';

    if (metric === 'total') {
      if (isAthleteLighter) {
        // Equal total wins on lighter bodyweight!
        minDeadliftNeeded = rivalProjectedTotal - mySubTotal;
        winReason = `Lighter bodyweight advantage (-${bwDiff.toFixed(2)}kg): Equal total wins!`;
      } else {
        // Must beat by at least 2.5kg (competition increment)
        minDeadliftNeeded = rivalProjectedTotal - mySubTotal + 2.5;
        winReason = `Heavier bodyweight (+${bwDiff.toFixed(2)}kg): Must exceed rival total by +2.5kg.`;
      }
    } else if (metric === 'dots') {
      // Find lowest deadlift in 2.5kg steps where myDots > rivalDots
      let dl = myDeadlift2 || 200;
      while (calculateDots(myBw, mySubTotal + dl, gender) <= rivalDots && dl < 500) {
        dl += 2.5;
      }
      minDeadliftNeeded = dl;
      winReason = `Calculated for DOTS superiority (${rivalDots.toFixed(2)} vs target).`;
    } else {
      // IPF GL points
      let dl = myDeadlift2 || 200;
      while (calculateIpfGl(myBw, mySubTotal + dl, gender) <= rivalGl && dl < 500) {
        dl += 2.5;
      }
      minDeadliftNeeded = dl;
      winReason = `Calculated for IPF GoodLift points superiority.`;
    }

    // Round to standard 2.5kg competition plates
    minDeadliftNeeded = Math.round(minDeadliftNeeded / 2.5) * 2.5;

    const myWinningTotal = mySubTotal + minDeadliftNeeded;
    const myWinningDots = calculateDots(myBw, myWinningTotal, gender);
    const myWinningGl = calculateIpfGl(myBw, myWinningTotal, gender);

    // Jump from Attempt 2 to Attempt 3
    const requiredJump = minDeadliftNeeded - (myDeadlift2 || 0);

    // Feasibility / Risk Index based on 2nd attempt RPE
    let riskLevel = 'moderate'; // 'safe' | 'moderate' | 'high_risk' | 'miracle'
    let coachVerdict = '';

    if (myDeadlift2Result === 'no_lift') {
      riskLevel = 'high_risk';
      coachVerdict = 'Attempt 2 was RED LIGHTED. Calling higher weight carries severe risk of bombing out. Consider repeating weight or fixing technical flaw.';
    } else if (requiredJump <= 5) {
      riskLevel = 'safe';
      coachVerdict = `Required jump is only +${requiredJump}kg. Highly probable based on RPE ${myDeadlift2Rpe}. Load the bar and secure the win!`;
    } else if (requiredJump <= 12.5) {
      if (myDeadlift2Rpe <= 8.5) {
        riskLevel = 'moderate';
        coachVerdict = `+${requiredJump}kg is a solid tactical jump. Speed on Attempt 2 was crisp; maintain aggressive lat tightness and lock it out.`;
      } else {
        riskLevel = 'high_risk';
        coachVerdict = `Attempt 2 was RPE ${myDeadlift2Rpe}. A +${requiredJump}kg jump is near your true maximum. Smelling salts, tight belt, and all heart needed.`;
      }
    } else {
      riskLevel = 'miracle';
      coachVerdict = `Requires a massive +${requiredJump}kg jump. This is an all-or-nothing hail mary attempt for Gold.`;
    }

    return {
      mySubTotal,
      rivalSubTotal,
      rivalProjectedTotal,
      rivalDots: Math.round(rivalDots * 100) / 100,
      rivalGl: Math.round(rivalGl * 100) / 100,
      isAthleteLighter,
      bwDiff: Math.round(bwDiff * 100) / 100,
      minDeadliftNeeded,
      myWinningTotal,
      myWinningDots: Math.round(myWinningDots * 100) / 100,
      myWinningGl: Math.round(myWinningGl * 100) / 100,
      requiredJump,
      riskLevel,
      coachVerdict,
      winReason
    };
  }, [
    myBw, myBestSquat, myBestBench, myDeadlift2, myDeadlift2Rpe, myDeadlift2Result,
    rivalBw, rivalBestSquat, rivalBestBench, rivalProjectedDeadlift, gender, metric
  ]);

  return (
    <div className="bg-zinc-950 rounded-2xl border border-amber-500/20 p-5 md:p-7 shadow-2xl space-y-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-amber-400 uppercase font-bold">MEET DAY TACTICAL ROOM</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
            <Swords className="w-7 h-7 text-amber-500" />
            Podium Battle & Deadlift 3rd Attempt Solver
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Calculate the exact minimum weight needed on Deadlift 3 to win Gold or podium, accounting for bodyweight tie-breakers.
          </p>
        </div>

        {/* Scoring Metric Switcher */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-white/5 font-mono text-xs">
          {[
            { id: 'total', label: 'Total (KG)' },
            { id: 'dots', label: 'DOTS Points' },
            { id: 'ipf_gl', label: 'IPF GL Points' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              className={`px-3 py-1.5 rounded font-bold transition-all ${
                metric === m.id ? 'bg-amber-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Head-to-Head Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Corner */}
        <div className="bg-zinc-900/70 border border-blue-500/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h3 className="text-sm font-black italic uppercase tracking-wider text-blue-400">
                YOUR CORNER (ATHLETE)
              </h3>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-zinc-400">Bodyweight:</span>
              <input
                type="number"
                step="0.1"
                value={myBw}
                onChange={e => setMyBw(parseFloat(e.target.value) || 74)}
                className="w-16 bg-black border border-blue-500/40 rounded px-2 py-0.5 text-center text-white font-bold"
              />
              <span className="text-zinc-500">KG</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase block mb-1">Best Squat</label>
              <input
                type="number"
                step="2.5"
                value={myBestSquat}
                onChange={e => setMyBestSquat(parseFloat(e.target.value) || 0)}
                className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-white font-bold text-center"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase block mb-1">Best Bench</label>
              <input
                type="number"
                step="2.5"
                value={myBestBench}
                onChange={e => setMyBestBench(parseFloat(e.target.value) || 0)}
                className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-white font-bold text-center"
              />
            </div>
            <div className="bg-blue-950/40 border border-blue-500/30 p-2 rounded text-center">
              <span className="text-[10px] text-blue-400 uppercase block">Sub-Total</span>
              <span className="text-base font-black text-white">{battleAnalysis.mySubTotal}kg</span>
            </div>
          </div>

          {/* Deadlift 2 Feedback */}
          <div className="pt-2 border-t border-white/5 space-y-2 font-mono text-xs">
            <span className="text-[10px] uppercase text-zinc-400 font-bold block">Attempt 2 Status (Pre-Requisite):</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Attempt 2 Load</label>
                <input
                  type="number"
                  step="2.5"
                  value={myDeadlift2}
                  onChange={e => setMyDeadlift2(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Felt RPE</label>
                <select
                  value={myDeadlift2Rpe}
                  onChange={e => setMyDeadlift2Rpe(parseFloat(e.target.value))}
                  className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white text-center"
                >
                  <option value={7}>@7 (Speed pull)</option>
                  <option value={8}>@8 (Crisp single)</option>
                  <option value={8.5}>@8.5 (1-2 in tank)</option>
                  <option value={9}>@9 (1 grind rep left)</option>
                  <option value={9.5}>@9.5 (Near limit)</option>
                  <option value={10}>@10 (Maximal grind)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Referee Lights</label>
                <button
                  onClick={() => setMyDeadlift2Result(myDeadlift2Result === 'good' ? 'no_lift' : 'good')}
                  className={`w-full py-1 rounded font-bold border transition-all text-[11px] ${
                    myDeadlift2Result === 'good'
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                      : 'bg-red-950/80 border-red-500/60 text-red-300'
                  }`}
                >
                  {myDeadlift2Result === 'good' ? '⚪⚪⚪ GOOD' : '🔴🔴🔴 NO LIFT'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rival / Leader Corner */}
        <div className="bg-zinc-900/70 border border-red-500/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <input
                type="text"
                value={rivalName}
                onChange={e => setRivalName(e.target.value)}
                className="bg-transparent border-b border-red-500/30 font-black italic uppercase tracking-wider text-red-400 text-sm focus:outline-none w-36"
              />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-zinc-400">Bodyweight:</span>
              <input
                type="number"
                step="0.1"
                value={rivalBw}
                onChange={e => setRivalBw(parseFloat(e.target.value) || 74)}
                className="w-16 bg-black border border-red-500/40 rounded px-2 py-0.5 text-center text-white font-bold"
              />
              <span className="text-zinc-500">KG</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase block mb-1">Rival Squat</label>
              <input
                type="number"
                step="2.5"
                value={rivalBestSquat}
                onChange={e => setRivalBestSquat(parseFloat(e.target.value) || 0)}
                className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-white font-bold text-center"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase block mb-1">Rival Bench</label>
              <input
                type="number"
                step="2.5"
                value={rivalBestBench}
                onChange={e => setRivalBestBench(parseFloat(e.target.value) || 0)}
                className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-white font-bold text-center"
              />
            </div>
            <div className="bg-red-950/40 border border-red-500/30 p-2 rounded text-center">
              <span className="text-[10px] text-red-400 uppercase block">Sub-Total</span>
              <span className="text-base font-black text-white">{battleAnalysis.rivalSubTotal}kg</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-2 font-mono text-xs">
            <label className="text-[10px] uppercase text-zinc-400 font-bold block">
              Rival Projected / Called 3rd Attempt:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="2.5"
                value={rivalProjectedDeadlift}
                onChange={e => setRivalProjectedDeadlift(parseFloat(e.target.value) || 0)}
                className="w-28 bg-black border border-red-500/50 rounded px-3 py-1.5 text-white font-black text-center text-sm"
              />
              <div className="text-[11px] text-zinc-400">
                Projected Total: <span className="text-white font-bold">{battleAnalysis.rivalProjectedTotal}kg</span> • DOTS: <span className="text-cyan-400 font-bold">{battleAnalysis.rivalDots}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Master Tactical Solution Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-zinc-900 to-amber-950/80 rounded-2xl border-2 border-amber-500/60 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy className="w-36 h-36 text-amber-400" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-black flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              MINIMUM DEADLIFT 3 ATTEMPT REQUIRED FOR GOLD:
            </span>
            <span className="text-xs font-mono text-zinc-400 bg-black/60 px-2.5 py-1 rounded border border-white/10">
              {battleAnalysis.winReason}
            </span>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-5xl md:text-7xl font-black italic text-amber-400 tracking-tighter">
              {battleAnalysis.minDeadliftNeeded}
            </span>
            <span className="text-2xl font-black text-white font-mono">KG</span>
            <div className="ml-2 font-mono text-xs">
              <span className={`px-2 py-0.5 rounded font-bold ${
                battleAnalysis.requiredJump <= 5 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                  : battleAnalysis.requiredJump <= 12.5 
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40' 
                  : 'bg-red-950 text-red-300 border border-red-500/40'
              }`}>
                +{battleAnalysis.requiredJump}kg Jump from Attempt 2
              </span>
            </div>
          </div>

          {/* Outcome Breakdown Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 font-mono text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Winning Total</span>
              <span className="text-sm font-bold text-white">{battleAnalysis.myWinningTotal} KG</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Resulting DOTS</span>
              <span className="text-sm font-bold text-cyan-400">{battleAnalysis.myWinningDots} PTS</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Bodyweight Tie-Breaker</span>
              <span className={`text-sm font-bold ${battleAnalysis.isAthleteLighter ? 'text-emerald-400' : 'text-amber-400'}`}>
                {battleAnalysis.isAthleteLighter ? `Advantage (-${battleAnalysis.bwDiff}kg)` : `Heavier (+${battleAnalysis.bwDiff}kg)`}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Coach Risk Rating</span>
              <span className={`text-sm font-black uppercase ${
                battleAnalysis.riskLevel === 'safe' ? 'text-emerald-400' :
                battleAnalysis.riskLevel === 'moderate' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {battleAnalysis.riskLevel.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Coach Tactical Voice Box */}
          <div className="bg-black/60 rounded-xl border border-white/10 p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-mono uppercase text-amber-400 font-bold mb-0.5">HEAD COACH VERDICT</p>
              <p className="text-xs text-zinc-200 leading-relaxed font-sans">{battleAnalysis.coachVerdict}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
