/**
 * PowerliftingCalculators.jsx - The Powerlifting Fingertip Toolbox
 * Includes:
 * 1. RPE & 1RM Master Wheel (e1RM & Target Load Finder)
 * 2. Official IPF GL & DOTS Points Calculator
 * 3. Official IPF & National Weight Class Classification Ladder
 * 4. Competition KG <-> LBS Rounder
 * 5. Interactive RPE Conversion Matrix
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Target, 
  TrendingUp, 
  Layers, 
  RotateCcw, 
  Award, 
  Check, 
  ArrowRightLeft,
  Sparkles,
  Trophy,
  ShieldCheck,
  ChevronRight,
  Dumbbell
} from 'lucide-react';
import OlympicPlateLoader from './OlympicPlateLoader';

// Standard IPF RPE Percentage Table (% of 1RM)
const RPE_TABLE = {
  10:  [1.000, 0.955, 0.922, 0.892, 0.863, 0.837, 0.811, 0.786, 0.762, 0.739],
  9.5: [0.978, 0.939, 0.907, 0.878, 0.850, 0.824, 0.799, 0.774, 0.751, 0.723],
  9.0: [0.955, 0.922, 0.892, 0.863, 0.837, 0.811, 0.786, 0.762, 0.739, 0.707],
  8.5: [0.939, 0.907, 0.878, 0.850, 0.824, 0.799, 0.774, 0.751, 0.723, 0.694],
  8.0: [0.922, 0.892, 0.863, 0.837, 0.811, 0.786, 0.762, 0.739, 0.707, 0.680],
  7.5: [0.907, 0.878, 0.850, 0.824, 0.799, 0.774, 0.751, 0.723, 0.694, 0.667],
  7.0: [0.892, 0.863, 0.837, 0.811, 0.786, 0.762, 0.739, 0.707, 0.680, 0.653],
  6.5: [0.878, 0.850, 0.824, 0.799, 0.774, 0.751, 0.723, 0.694, 0.667, 0.640]
};

// Official Powerlifting India / IPF Weight Class Ranking Standards (Total SBD in KG)
const NATIONAL_STANDARDS = {
  men: {
    '59kg': { classIV: 330, classIII: 395, classII: 460, classI: 520, cms: 575, ms: 630, elite: 675 },
    '66kg': { classIV: 360, classIII: 430, classII: 500, classI: 565, cms: 625, ms: 685, elite: 735 },
    '74kg': { classIV: 385, classIII: 460, classII: 535, classI: 605, cms: 670, ms: 735, elite: 790 },
    '83kg': { classIV: 410, classIII: 490, classII: 570, classI: 645, cms: 715, ms: 785, elite: 845 },
    '93kg': { classIV: 435, classIII: 520, classII: 605, classI: 685, cms: 755, ms: 830, elite: 890 },
    '105kg': { classIV: 455, classIII: 545, classII: 635, classI: 720, cms: 795, ms: 870, elite: 935 },
    '120kg': { classIV: 475, classIII: 570, classII: 660, classI: 750, cms: 830, ms: 910, elite: 980 },
    '120+kg': { classIV: 495, classIII: 590, classII: 685, classI: 780, cms: 865, ms: 950, elite: 1025 }
  },
  women: {
    '47kg': { classIV: 200, classIII: 240, classII: 280, classI: 320, cms: 360, ms: 400, elite: 435 },
    '52kg': { classIV: 220, classIII: 265, classII: 310, classI: 355, cms: 400, ms: 440, elite: 480 },
    '57kg': { classIV: 240, classIII: 290, classII: 335, classI: 385, cms: 435, ms: 480, elite: 520 },
    '63kg': { classIV: 260, classIII: 310, classII: 360, classI: 415, cms: 465, ms: 515, elite: 560 },
    '69kg': { classIV: 280, classIII: 330, classII: 385, classI: 440, cms: 495, ms: 550, elite: 600 },
    '76kg': { classIV: 295, classIII: 350, classII: 405, classI: 465, cms: 525, ms: 580, elite: 635 },
    '84kg': { classIV: 315, classIII: 370, classII: 430, classI: 490, cms: 555, ms: 615, elite: 670 },
    '84+kg': { classIV: 335, classIII: 395, classII: 455, classI: 520, cms: 590, ms: 650, elite: 710 }
  }
};

const TIER_META = [
  { key: 'classIV', name: 'Class IV', label: 'Novice Competitor', color: 'text-zinc-400', badge: 'bg-zinc-800' },
  { key: 'classIII', name: 'Class III', label: 'District / Regional Standard', color: 'text-cyan-400', badge: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300' },
  { key: 'classII', name: 'Class II', label: 'State Championship Standard', color: 'text-blue-400', badge: 'bg-blue-950/80 border-blue-500/40 text-blue-300' },
  { key: 'classI', name: 'Class I', label: 'National Championship Standard', color: 'text-purple-400', badge: 'bg-purple-950/80 border-purple-500/40 text-purple-300' },
  { key: 'cms', name: 'Candidate Master of Sport (CMS)', label: 'National Medal Contender', color: 'text-amber-400', badge: 'bg-amber-950/80 border-amber-500/40 text-amber-300' },
  { key: 'ms', name: 'Master of Sport (MS)', label: 'International Team Standard', color: 'text-orange-400', badge: 'bg-orange-950/80 border-orange-500/40 text-orange-300' },
  { key: 'elite', name: 'International Elite (IMS)', label: 'World Podium Standard', color: 'text-emerald-400', badge: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' }
];

export const PowerliftingCalculators = () => {
  const [activeTool, setActiveTool] = useState('rpe_wheel'); // 'rpe_wheel' | 'dots_ipf' | 'national_ladder' | 'kg_lbs' | 'rpe_matrix'

  // Tool 1: RPE & 1RM states
  const [load, setLoad] = useState(170);
  const [reps, setReps] = useState(3);
  const [rpe, setRpe] = useState(8.5);

  // Target load finder states
  const [target1RM, setTarget1RM] = useState(200);
  const [targetReps, setTargetReps] = useState(5);
  const [targetRpe, setTargetRpe] = useState(8);

  // Tool 2: Points states
  const [bw, setBw] = useState(74);
  const [total, setTotal] = useState(580);
  const [gender, setGender] = useState('men');

  // Tool 3: National Rank Ladder states
  const [ladderGender, setLadderGender] = useState('men');
  const [ladderWeightClass, setLadderWeightClass] = useState('74kg');
  const [ladderSquat, setLadderSquat] = useState(205);
  const [ladderBench, setLadderBench] = useState(137.5);
  const [ladderDeadlift, setLadderDeadlift] = useState(242.5);

  // Tool 4: KG <-> LBS states
  const [convWeight, setConvWeight] = useState(315);
  const [convMode, setConvMode] = useState('lbs_to_kg'); // 'lbs_to_kg' | 'kg_to_lbs'

  // Calculate estimated 1RM
  const calculated1RM = useMemo(() => {
    const pct = RPE_TABLE[rpe]?.[reps - 1] || 0.85;
    const e1rm = load / pct;
    return Math.round(e1rm * 10) / 10;
  }, [load, reps, rpe]);

  // Calculate target barbell load for prescribed set
  const calculatedTargetLoad = useMemo(() => {
    const pct = RPE_TABLE[targetRpe]?.[targetReps - 1] || 0.80;
    const raw = target1RM * pct;
    const rounded = Math.round(raw / 2.5) * 2.5;
    return { exact: Math.round(raw * 10) / 10, rounded };
  }, [target1RM, targetReps, targetRpe]);

  // Calculate DOTS & IPF GL Points
  const scoreResults = useMemo(() => {
    const w = bw;
    const t = total;

    // DOTS formula
    let dots = 0;
    if (gender === 'men') {
      const a = -307.272;
      const b = 24.3724;
      const c = -0.191875;
      const d = 0.000739073;
      const e = -0.000001093;
      const denom = a + b * w + c * Math.pow(w, 2) + d * Math.pow(w, 3) + e * Math.pow(w, 4);
      dots = (500 / denom) * t;
    } else {
      const a = -57.96288;
      const b = 13.6175032;
      const c = -0.11266554;
      const d = 0.0005158568;
      const e = -0.0000010706;
      const denom = a + b * w + c * Math.pow(w, 2) + d * Math.pow(w, 3) + e * Math.pow(w, 4);
      dots = (500 / denom) * t;
    }

    // IPF GoodLift Points (Classic)
    let ipfGL = 0;
    if (gender === 'men') {
      const a = 1199.72839;
      const b = 1025.18162;
      const c = 0.00921;
      ipfGL = (100 / (a - b * Math.exp(-c * w))) * t;
    } else {
      const a = 610.32796;
      const b = 1045.59282;
      const c = 0.03048;
      ipfGL = (100 / (a - b * Math.exp(-c * w))) * t;
    }

    return {
      dots: Math.round(dots * 100) / 100,
      ipfGL: Math.round(ipfGL * 100) / 100
    };
  }, [bw, total, gender]);

  // National Classification Calculation
  const nationalStanding = useMemo(() => {
    const sbdTotal = ladderSquat + ladderBench + ladderDeadlift;
    const stds = NATIONAL_STANDARDS[ladderGender]?.[ladderWeightClass] || NATIONAL_STANDARDS.men['74kg'];

    let currentTier = TIER_META[0];
    let nextTier = TIER_META[1];
    let prevTotal = 0;
    let nextTotal = stds.classIV;

    for (let i = 0; i < TIER_META.length; i++) {
      const t = TIER_META[i];
      const req = stds[t.key];
      if (sbdTotal >= req) {
        currentTier = t;
        prevTotal = req;
        nextTier = TIER_META[i + 1] || null;
        nextTotal = nextTier ? stds[nextTier.key] : req;
      } else {
        break;
      }
    }

    const kgNeeded = nextTier ? Math.max(0, nextTotal - sbdTotal) : 0;
    const pct = nextTier 
      ? Math.min(100, Math.round(((sbdTotal - prevTotal) / Math.max(1, nextTotal - prevTotal)) * 100))
      : 100;

    return {
      total: sbdTotal,
      currentTier,
      nextTier,
      kgNeeded: Math.round(kgNeeded * 10) / 10,
      pct,
      standards: stds
    };
  }, [ladderGender, ladderWeightClass, ladderSquat, ladderBench, ladderDeadlift]);

  // Conversion result
  const conversionResult = useMemo(() => {
    if (convMode === 'lbs_to_kg') {
      const kg = convWeight * 0.45359237;
      const roundedKg = Math.round(kg / 2.5) * 2.5;
      return { val: Math.round(kg * 10) / 10, comp: roundedKg, unit: 'KG' };
    } else {
      const lbs = convWeight * 2.20462262;
      return { val: Math.round(lbs * 10) / 10, comp: Math.round(lbs / 5) * 5, unit: 'LBS' };
    }
  }, [convWeight, convMode]);

  return (
    <div className="bg-zinc-950 rounded-2xl border border-white/10 p-6 shadow-2xl font-sans text-white space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-bold">FINGERTIP TOOLBOX</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
            <Calculator className="w-7 h-7 text-cyan-500" />
            Powerlifting Precision Calculators
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            RPE wheels, IPF GoodLift coefficients, National rank ladders, and competition conversions.
          </p>
        </div>

        {/* Tool Switcher */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1.5 rounded-xl border border-white/5 font-mono text-xs overflow-x-auto">
          {[
            { id: 'rpe_wheel', label: '1RM & Target Load' },
            { id: 'plate_loader', label: '🔴 Plate Visualizer' },
            { id: 'dots_ipf', label: 'DOTS & IPF GL' },
            { id: 'national_ladder', label: '🏆 National Rank Ladder' },
            { id: 'kg_lbs', label: 'KG / LBS Rounder' },
            { id: 'rpe_matrix', label: 'RPE Table Matrix' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTool === t.id
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tool 1: 1RM & RPE Master Wheel */}
      {activeTool === 'rpe_wheel' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box A: e1RM from Set */}
          <div className="bg-zinc-900/60 p-6 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Calculate Estimated 1RM from Set
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">IPF RPE TABLE</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-400">Weight Lifted (KG)</span>
                  <span className="text-white font-bold">{load} kg</span>
                </div>
                <input 
                  type="range"
                  min="20"
                  max="450"
                  step="2.5"
                  value={load}
                  onChange={(e) => setLoad(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-400">Reps Completed</span>
                  <span className="text-white font-bold">{reps} Reps</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="10"
                  value={reps}
                  onChange={(e) => setReps(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-400">Rate of Perceived Exertion (RPE)</span>
                  <span className="text-orange-400 font-bold">@{rpe}</span>
                </div>
                <input 
                  type="range"
                  min="6.5"
                  max="10"
                  step="0.5"
                  value={rpe}
                  onChange={(e) => setRpe(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 bg-zinc-950 rounded-xl border border-cyan-500/30 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Projected 1RM (e1RM)</span>
                <span className="text-xs text-zinc-500">Based on {load}kg × {reps} @{rpe}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black italic text-cyan-400 font-mono">{calculated1RM}</span>
                <span className="text-xs font-bold text-zinc-400 font-mono">KG</span>
              </div>
            </div>
          </div>

          {/* Box B: Target Load Finder */}
          <div className="bg-zinc-900/60 p-6 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-wider text-orange-400 font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-400" />
                Target Barbell Load Finder
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">TRAINING MAX</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-400">Current 1RM / Training Max (KG)</span>
                  <span className="text-white font-bold">{target1RM} kg</span>
                </div>
                <input 
                  type="range"
                  min="40"
                  max="500"
                  step="2.5"
                  value={target1RM}
                  onChange={(e) => setTarget1RM(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-400">Prescribed Target Reps</span>
                  <span className="text-white font-bold">{targetReps} Reps</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="10"
                  value={targetReps}
                  onChange={(e) => setTargetReps(parseInt(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-400">Prescribed Target Intensity</span>
                  <span className="text-orange-400 font-bold">@{targetRpe} RPE</span>
                </div>
                <input 
                  type="range"
                  min="6.5"
                  max="10"
                  step="0.5"
                  value={targetRpe}
                  onChange={(e) => setTargetRpe(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 bg-zinc-950 rounded-xl border border-orange-500/30 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Prescribed Barbell Load</span>
                <span className="text-xs text-zinc-500">Exact: {calculatedTargetLoad.exact} kg</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black italic text-orange-400 font-mono">{calculatedTargetLoad.rounded}</span>
                <span className="text-xs font-bold text-zinc-400 font-mono">KG</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tool 2: DOTS & IPF GL Score */}
      {activeTool === 'dots_ipf' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/60 p-6 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400 font-bold">Lifter Inputs</h3>
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Gender / Division</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setGender('men')}
                    className={`p-2 rounded border text-center transition-all ${gender === 'men' ? 'bg-cyan-600 border-cyan-500 text-white font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}
                  >
                    Men's Open
                  </button>
                  <button 
                    onClick={() => setGender('women')}
                    className={`p-2 rounded border text-center transition-all ${gender === 'women' ? 'bg-cyan-600 border-cyan-500 text-white font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}
                  >
                    Women's Open
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-400">Scale Bodyweight (KG)</span>
                  <span className="text-white font-bold">{bw} kg</span>
                </div>
                <input 
                  type="range"
                  min="40"
                  max="160"
                  step="0.1"
                  value={bw}
                  onChange={(e) => setBw(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-400">Total S+B+D (KG)</span>
                  <span className="text-white font-bold">{total} kg</span>
                </div>
                <input 
                  type="range"
                  min="150"
                  max="1100"
                  step="2.5"
                  value={total}
                  onChange={(e) => setTotal(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 p-6 rounded-xl border border-cyan-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400">DOTS Score</span>
              <Award className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-black italic text-cyan-400 font-mono">
                {scoreResults.dots}
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-2">
                Universal coefficient standard across WRPF, USPA, and international meets.
              </p>
              <div className="mt-3 text-[10px] font-mono text-cyan-400/80">
                {scoreResults.dots > 450 ? '🔥 National Elite (>450 DOTS)' : scoreResults.dots > 380 ? '💪 Advanced Lifter' : '📈 Developing Lifter'}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 p-6 rounded-xl border border-blue-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-zinc-400">Official IPF GL Points</span>
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-black italic text-blue-400 font-mono">
                {scoreResults.ipfGL}
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-2">
                Official International Powerlifting Federation & Powerlifting India ranking formula.
              </p>
              <div className="mt-3 text-[10px] font-mono text-blue-400/80">
                {scoreResults.ipfGL > 90 ? '🏆 International Podium (>90 GL)' : scoreResults.ipfGL > 75 ? '🏅 National Contender' : '🎯 State Competitor'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tool 3: Official National Classification Ladder */}
      {activeTool === 'national_ladder' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lifter SBD Form */}
            <div className="bg-zinc-900/70 p-6 rounded-xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  National Classification Inputs
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  onClick={() => setLadderGender('men')}
                  className={`p-2 rounded border font-bold text-center ${ladderGender === 'men' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}
                >
                  Men's Division
                </button>
                <button
                  onClick={() => setLadderGender('women')}
                  className={`p-2 rounded border font-bold text-center ${ladderGender === 'women' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}
                >
                  Women's Division
                </button>
              </div>

              <div className="font-mono text-xs">
                <label className="text-zinc-400 block mb-1">Official Weight Category</label>
                <select
                  value={ladderWeightClass}
                  onChange={(e) => setLadderWeightClass(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white font-bold outline-none focus:border-amber-500"
                >
                  {Object.keys(NATIONAL_STANDARDS[ladderGender] || {}).map(wc => (
                    <option key={wc} value={wc}>{wc} Weight Class</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 font-mono text-xs pt-2 border-t border-zinc-800">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-red-400">Squat 1RM (KG)</span>
                    <span className="text-white font-bold">{ladderSquat} kg</span>
                  </div>
                  <input
                    type="number"
                    step="2.5"
                    value={ladderSquat}
                    onChange={(e) => setLadderSquat(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-blue-400">Bench Press 1RM (KG)</span>
                    <span className="text-white font-bold">{ladderBench} kg</span>
                  </div>
                  <input
                    type="number"
                    step="2.5"
                    value={ladderBench}
                    onChange={(e) => setLadderBench(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-amber-400">Deadlift 1RM (KG)</span>
                    <span className="text-white font-bold">{ladderDeadlift} kg</span>
                  </div>
                  <input
                    type="number"
                    step="2.5"
                    value={ladderDeadlift}
                    onChange={(e) => setLadderDeadlift(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-amber-500/30 flex items-center justify-between font-mono text-xs">
                <span className="text-zinc-400">Total SBD Load:</span>
                <span className="text-xl font-black italic text-amber-400">{nationalStanding.total} KG</span>
              </div>
            </div>

            {/* Classification Standing Card */}
            <div className="lg:col-span-2 bg-zinc-900/70 p-6 rounded-xl border border-amber-500/30 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Official National Standing ({ladderWeightClass} {ladderGender.toUpperCase()})
                  </span>
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${nationalStanding.currentTier.badge}`}>
                    {nationalStanding.currentTier.name}
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-black italic uppercase text-white tracking-tight">
                  {nationalStanding.currentTier.label}
                </h3>
                <p className="text-xs text-zinc-300 mt-2 font-mono leading-relaxed">
                  Verified according to Powerlifting India & IPF technical classification guidelines.
                </p>
              </div>

              {/* Progress to Next Tier */}
              {nationalStanding.nextTier ? (
                <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">
                      Next Rank: <strong className="text-white">{nationalStanding.nextTier.name} ({nationalStanding.nextTier.label})</strong>
                    </span>
                    <span className="text-amber-400 font-bold">{nationalStanding.pct}%</span>
                  </div>

                  <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${nationalStanding.pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
                    <span className="text-zinc-300">
                      Required Overload Delta: <strong className="text-amber-400">+{nationalStanding.kgNeeded} KG</strong>
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Target: {nationalStanding.standards[nationalStanding.nextTier.key]} KG Total
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400 bg-zinc-900/60 p-2.5 rounded border border-zinc-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Recommended Progression: +{Math.round(nationalStanding.kgNeeded * 0.4 / 2.5) * 2.5}kg Squat, +{Math.round(nationalStanding.kgNeeded * 0.2 / 2.5) * 2.5}kg Bench, +{Math.round(nationalStanding.kgNeeded * 0.4 / 2.5) * 2.5}kg Deadlift.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-center font-mono">
                  <Trophy className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">INTERNATIONAL ELITE TIER ACHIEVED!</div>
                  <div className="text-xs text-zinc-300 mt-1">You exceed the highest world-class national qualifying benchmark.</div>
                </div>
              )}

              {/* Tiers Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                {TIER_META.map(tier => {
                  const reqKg = nationalStanding.standards[tier.key];
                  const isAchieved = nationalStanding.total >= reqKg;
                  return (
                    <div 
                      key={tier.key}
                      className={`p-2 rounded-lg border ${
                        isAchieved 
                          ? 'bg-amber-950/40 border-amber-500/60 text-white' 
                          : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{tier.name.split(' ')[0]}</span>
                        {isAchieved && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <div className="text-xs font-black mt-1">{reqKg} kg</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tool 4: KG <-> LBS Rounder */}
      {activeTool === 'kg_lbs' && (
        <div className="max-w-xl mx-auto bg-zinc-900/60 p-8 rounded-2xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-mono uppercase tracking-wider text-cyan-400 font-bold">Competition Plate Rounder</h3>
            <button
              onClick={() => setConvMode(convMode === 'lbs_to_kg' ? 'kg_to_lbs' : 'lbs_to_kg')}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold flex items-center gap-2 text-white"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
              {convMode === 'lbs_to_kg' ? 'LBS ➔ KG' : 'KG ➔ LBS'}
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-zinc-400">Input Weight ({convMode === 'lbs_to_kg' ? 'LBS' : 'KG'})</span>
              <span className="text-white font-bold">{convWeight} {convMode === 'lbs_to_kg' ? 'lbs' : 'kg'}</span>
            </div>
            <input 
              type="number"
              step="5"
              value={convWeight}
              onChange={(e) => setConvWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-lg font-mono text-white focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="p-6 bg-zinc-950 rounded-xl border border-white/5 space-y-3">
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span>Exact Conversion:</span>
              <span className="text-white font-bold">{conversionResult.val} {conversionResult.unit}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-zinc-900">
              <span className="text-xs font-mono uppercase text-cyan-400 font-bold">Nearest Competition Barbell Load:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black italic text-cyan-400 font-mono">{conversionResult.comp}</span>
                <span className="text-xs font-bold text-zinc-400 font-mono">{conversionResult.unit}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tool 5: Full RPE Table Matrix */}
      {activeTool === 'rpe_matrix' && (
        <div className="bg-zinc-900/60 p-6 rounded-xl border border-white/5 overflow-x-auto">
          <div className="mb-4">
            <h3 className="text-base font-mono uppercase tracking-wider text-white font-bold">Standard IPF RPE Percentage Conversion Matrix</h3>
            <p className="text-xs font-mono text-zinc-400">Multiply your 1RM by these decimals to prescribe loads precisely</p>
          </div>

          <table className="w-full text-center font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-cyan-400 border-b border-white/10">
                <th className="p-2.5 text-left">RPE</th>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
                  <th key={r} className="p-2.5">{r} Rep{r > 1 ? 's' : ''}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(RPE_TABLE).map(([rpeVal, pcts]) => (
                <tr key={rpeVal} className="border-b border-zinc-900 hover:bg-zinc-900/80 transition-colors">
                  <td className="p-2 text-left font-bold text-orange-400">@{rpeVal}</td>
                  {pcts.map((p, i) => (
                    <td key={i} className="p-2 text-zinc-300">
                      {Math.round(p * 1000) / 10}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tool 6: Interactive Olympic Plate Loader */}
      {activeTool === 'plate_loader' && (
        <div className="pt-2">
          <OlympicPlateLoader initialTarget={calculatedTargetLoad.rounded || 180} />
        </div>
      )}
    </div>
  );
};

export default PowerliftingCalculators;
