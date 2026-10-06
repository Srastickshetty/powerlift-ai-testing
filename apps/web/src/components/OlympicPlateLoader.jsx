/**
 * OlympicPlateLoader.jsx - Visual Competition Plate Loader & Warm-Up War Room
 * Precision IPF/USAPL/WRPF Barbell & Flight Strategy Engine
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Clock, 
  RotateCcw, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Layers, 
  TrendingUp, 
  Flame,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';

// Standard IPF Plate Specifications (kg)
const IPF_PLATES = [
  { weight: 25, color: '#dc2626', borderColor: '#991b1b', textColor: '#ffffff', height: 160, width: 22, name: '25kg Red' },
  { weight: 20, color: '#2563eb', borderColor: '#1d4ed8', textColor: '#ffffff', height: 160, width: 20, name: '20kg Blue' },
  { weight: 15, color: '#eab308', borderColor: '#ca8a04', textColor: '#000000', height: 140, width: 18, name: '15kg Yellow' },
  { weight: 10, color: '#16a34a', borderColor: '#15803d', textColor: '#ffffff', height: 120, width: 16, name: '10kg Green' },
  { weight: 5, color: '#f4f4f5', borderColor: '#a1a1aa', textColor: '#09090b', height: 95, width: 14, name: '5kg White' },
  { weight: 2.5, color: '#27272a', borderColor: '#52525b', textColor: '#ffffff', height: 80, width: 12, name: '2.5kg Black' },
  { weight: 1.25, color: '#a1a1aa', borderColor: '#71717a', textColor: '#09090b', height: 68, width: 10, name: '1.25kg Chrome' },
  { weight: 0.5, color: '#d4d4d8', borderColor: '#a1a1aa', textColor: '#09090b', height: 55, width: 8, name: '0.5kg Micro' },
  { weight: 0.25, color: '#e4e4e7', borderColor: '#d4d4d8', textColor: '#09090b', height: 48, width: 7, name: '0.25kg Record' },
];

export const OlympicPlateLoader = ({ initialTarget = 180, onWeightChange }) => {
  const [unit, setUnit] = useState('kg'); // 'kg' | 'lbs'
  const [barWeight, setBarWeight] = useState(20); // 20kg standard, 25kg squat bar, 15kg women's bar
  const [useCollars, setUseCollars] = useState(true); // 2.5kg each = 5kg pair
  const [targetWeight, setTargetWeight] = useState(initialTarget);
  const [activeTab, setActiveTab] = useState('loader'); // 'loader' | 'flight_timing' | 'attempt_strategy'

  // Flight timing states
  const [liftersOut, setLiftersOut] = useState(5);
  const [currentFlight, setCurrentFlight] = useState('Flight A');
  const [flightPhase, setFlightPhase] = useState('Squat 1st Attempt');

  // Attempt presets
  const [attempts, setAttempts] = useState({
    squat: [180, 192.5, 202.5],
    bench: [120, 127.5, 135],
    deadlift: [210, 225, 237.5]
  });

  // Calculate plate distribution per side
  const calculation = useMemo(() => {
    const collarWeightTotal = useCollars ? 5 : 0;
    const baseWeight = barWeight + collarWeightTotal;
    const effectiveTarget = Math.max(baseWeight, targetWeight);
    const weightToLoad = (effectiveTarget - baseWeight) / 2; // per side

    let remaining = weightToLoad;
    const loadedPlates = [];
    const plateCounts = {};

    for (const plate of IPF_PLATES) {
      const count = Math.floor((remaining + 0.001) / plate.weight);
      if (count > 0) {
        plateCounts[plate.weight] = count;
        for (let i = 0; i < count; i++) {
          loadedPlates.push(plate);
        }
        remaining = Math.round((remaining - count * plate.weight) * 100) / 100;
      }
    }

    const actualPerSide = loadedPlates.reduce((sum, p) => sum + p.weight, 0);
    const totalActual = baseWeight + actualPerSide * 2;

    return {
      baseWeight,
      collarWeightPerSide: useCollars ? 2.5 : 0,
      loadedPlates,
      plateCounts,
      actualPerSide,
      totalActual,
      lbs: Math.round(totalActual * 2.20462 * 10) / 10,
      unachievableDelta: Math.round((targetWeight - totalActual) * 100) / 100
    };
  }, [targetWeight, barWeight, useCollars]);

  // Adjust target weight
  const adjustWeight = (delta) => {
    const newWeight = Math.max(barWeight + (useCollars ? 5 : 0), targetWeight + delta);
    setTargetWeight(newWeight);
    onWeightChange?.(newWeight);
  };

  // Warm-up progression ladder calculation from opener
  const warmupLadder = useMemo(() => {
    const opener = targetWeight;
    return [
      { set: 1, reps: '8-10', weight: barWeight, timeOut: '35 min', desc: 'Bar Warmup / Mobility' },
      { set: 2, reps: '5', weight: Math.round((opener * 0.45) / 2.5) * 2.5, timeOut: '26 min', desc: 'Groove & Speed' },
      { set: 3, reps: '3', weight: Math.round((opener * 0.62) / 2.5) * 2.5, timeOut: '19 min', desc: 'CNS Awakening' },
      { set: 4, reps: '2', weight: Math.round((opener * 0.77) / 2.5) * 2.5, timeOut: '13 min', desc: 'Potentiation' },
      { set: 5, reps: '1', weight: Math.round((opener * 0.88) / 2.5) * 2.5, timeOut: '8 min', desc: 'Last Heavy Warm-up' },
      { set: 6, reps: '1', weight: Math.round((opener * 0.94) / 2.5) * 2.5, timeOut: '4 min', desc: 'Platform Timing Opener Prep' },
    ];
  }, [targetWeight, barWeight]);

  return (
    <div className="bg-zinc-950 rounded-2xl border border-white/10 p-6 shadow-2xl font-sans text-white">
      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
            <span className="text-xs font-mono tracking-widest text-orange-400 uppercase font-bold">MEET DAY WAR ROOM</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
            <Dumbbell className="w-7 h-7 text-orange-500" />
            IPF Olympic Plate Loader
          </h2>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-white/5 font-mono text-xs">
          {[
            { id: 'loader', label: 'Barbell Sleeve' },
            { id: 'flight_timing', label: 'Flight Countdown' },
            { id: 'attempt_strategy', label: 'Attempt Strategist' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'loader' && (
        <div className="space-y-6">
          {/* Target Weight Display & Direct Steppers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-zinc-900/60 p-6 rounded-xl border border-white/5 items-center">
            {/* Direct Total Weight */}
            <div className="text-center md:text-left">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">Total Barbell Load</span>
              <div className="flex items-baseline gap-2 mt-1 justify-center md:justify-start">
                <span className="text-5xl md:text-6xl font-black italic text-orange-500 tracking-tighter">
                  {calculation.totalActual}
                </span>
                <span className="text-xl font-black text-zinc-400 uppercase font-mono">KG</span>
                <span className="text-sm font-mono text-zinc-500 ml-2">
                  ({calculation.lbs} LBS)
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Per Side Load: <span className="text-white font-bold">{calculation.actualPerSide}kg</span> + {useCollars ? '2.5kg Collar' : 'No Collar'}
              </p>
            </div>

            {/* Quick Adjust Buttons */}
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Quick Adjustments</span>
              <div className="flex items-center gap-2">
                {[-25, -10, -2.5].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => adjustWeight(amt)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs font-mono font-bold rounded border border-white/5 transition-all text-red-400"
                  >
                    {amt}
                  </button>
                ))}
                {[+2.5, +10, +25].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => adjustWeight(amt)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs font-mono font-bold rounded border border-white/5 transition-all text-green-400"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  step="2.5"
                  min="20"
                  max="600"
                  value={targetWeight}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 20;
                    setTargetWeight(v);
                    onWeightChange?.(v);
                  }}
                  className="w-28 bg-black border border-white/10 rounded px-3 py-1 text-sm font-mono text-center text-white focus:border-orange-500 outline-none"
                />
                <button
                  onClick={() => setTargetWeight(20)}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
                  title="Reset to Bar Only"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hardware Config: Bar & Collars */}
            <div className="space-y-3 font-mono text-xs border-t md:border-t-0 md:border-l border-white/5 md:pl-6 pt-4 md:pt-0">
              <div>
                <label className="text-zinc-500 uppercase text-[10px] block mb-1">Barbell Type</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { wt: 20, name: '20kg IPF' },
                    { wt: 25, name: '25kg Squat' },
                    { wt: 15, name: '15kg Women' },
                  ].map((bar) => (
                    <button
                      key={bar.wt}
                      onClick={() => setBarWeight(bar.wt)}
                      className={`py-1.5 px-2 rounded text-[11px] font-bold text-center border transition-all ${
                        barWeight === bar.wt
                          ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                          : 'bg-zinc-950 border-white/5 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {bar.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-400 text-xs">2.5kg Competition Collars (5kg pair)</span>
                <button
                  onClick={() => setUseCollars(!useCollars)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    useCollars ? 'bg-orange-600' : 'bg-zinc-800'
                  }`}
                >
                  <motion.div
                    className="bg-white w-4 h-4 rounded-full shadow-md"
                    animate={{ x: useCollars ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* VISUAL BARBELL SLEEVE GRAPHIC */}
          <div className="bg-zinc-900/80 rounded-2xl border border-white/10 p-6 md:p-8 overflow-x-auto">
            <div className="text-center mb-6">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Symmetrical Competition Sleeve Loading Graphic
              </span>
            </div>

            <div className="min-w-[650px] flex items-center justify-center py-8">
              {/* LEFT SLEEVE PLATES (Mirror of Right) */}
              <div className="flex items-center justify-end gap-1.5">
                {/* Collar on far outside */}
                {useCollars && (
                  <div 
                    className="h-20 w-3.5 bg-gradient-to-r from-zinc-400 to-zinc-200 rounded border border-zinc-500 shadow-lg flex items-center justify-center"
                    title="2.5kg Competition Collar"
                  >
                    <div className="w-1 h-3 bg-zinc-900 rounded-sm" />
                  </div>
                )}

                {/* Plates rendered outwards (reversed) */}
                {calculation.loadedPlates.slice().reverse().map((plate, idx) => (
                  <motion.div
                    key={`left_${idx}`}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    className="rounded shadow-2xl flex flex-col items-center justify-between py-1 transition-all select-none border-x-2"
                    style={{
                      backgroundColor: plate.color,
                      borderColor: plate.borderColor,
                      height: `${plate.height}px`,
                      width: `${plate.width}px`,
                      boxShadow: `0 0 12px ${plate.color}33`
                    }}
                    title={`${plate.name}`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
                    <span 
                      className="text-[9px] font-black uppercase font-mono tracking-tighter transform -rotate-90 origin-center whitespace-nowrap"
                      style={{ color: plate.textColor }}
                    >
                      {plate.weight}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
                  </motion.div>
                ))}

                {/* Left Inner Sleeve Stopper */}
                <div className="h-24 w-5 bg-gradient-to-r from-zinc-700 to-zinc-500 rounded-l border border-zinc-600 shadow-md" />
              </div>

              {/* BARBELL SHAFT (CENTER) */}
              <div className="relative w-72 md:w-96 h-6 bg-gradient-to-b from-zinc-400 via-zinc-200 to-zinc-600 rounded-sm shadow-inner flex items-center justify-between px-4">
                {/* Knurling Texture Indicators */}
                <div className="w-16 h-4 bg-zinc-500/40 rounded-sm border border-zinc-600/30" />
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-mono font-black text-zinc-800 uppercase tracking-widest">
                    {barWeight}KG BAR
                  </span>
                  <div className="w-6 h-0.5 bg-orange-600" />
                </div>
                <div className="w-16 h-4 bg-zinc-500/40 rounded-sm border border-zinc-600/30" />
              </div>

              {/* RIGHT SLEEVE PLATES */}
              <div className="flex items-center justify-start gap-1.5">
                {/* Right Inner Sleeve Stopper */}
                <div className="h-24 w-5 bg-gradient-to-r from-zinc-500 to-zinc-700 rounded-r border border-zinc-600 shadow-md" />

                {/* Plates loaded from inside out */}
                {calculation.loadedPlates.map((plate, idx) => (
                  <motion.div
                    key={`right_${idx}`}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    className="rounded shadow-2xl flex flex-col items-center justify-between py-1 transition-all select-none border-x-2"
                    style={{
                      backgroundColor: plate.color,
                      borderColor: plate.borderColor,
                      height: `${plate.height}px`,
                      width: `${plate.width}px`,
                      boxShadow: `0 0 12px ${plate.color}33`
                    }}
                    title={`${plate.name}`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
                    <span 
                      className="text-[9px] font-black uppercase font-mono tracking-tighter transform rotate-90 origin-center whitespace-nowrap"
                      style={{ color: plate.textColor }}
                    >
                      {plate.weight}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
                  </motion.div>
                ))}

                {/* Collar on outside */}
                {useCollars && (
                  <div 
                    className="h-20 w-3.5 bg-gradient-to-r from-zinc-200 to-zinc-400 rounded border border-zinc-500 shadow-lg flex items-center justify-center"
                    title="2.5kg Competition Collar"
                  >
                    <div className="w-1 h-3 bg-zinc-900 rounded-sm" />
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Plate Breakdown Chips */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="text-xs font-mono text-zinc-400 uppercase font-bold">Each Side Requires:</span>
                {Object.keys(calculation.plateCounts).length === 0 ? (
                  <span className="text-xs font-mono text-zinc-500">Unloaded Barbell Only</span>
                ) : (
                  Object.entries(calculation.plateCounts).map(([wt, count]) => {
                    const pl = IPF_PLATES.find(p => p.weight === parseFloat(wt));
                    return (
                      <div 
                        key={wt} 
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs shadow-md"
                        style={{
                          backgroundColor: `${pl.color}22`,
                          borderColor: `${pl.color}66`,
                          color: pl.textColor === '#09090b' ? '#f4f4f5' : pl.color
                        }}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pl.color }} />
                        <span className="font-bold">{count} × {wt}kg</span>
                        <span className="text-[10px] text-zinc-400">({count * parseFloat(wt)}kg)</span>
                      </div>
                    );
                  })
                )}
                {useCollars && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-600 bg-zinc-800/60 font-mono text-xs text-zinc-300">
                    <span className="w-3 h-3 rounded-full bg-zinc-300" />
                    <span>1 × 2.5kg Collar</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Platform Attempt Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { lift: 'Squat', key: 'squat', color: 'border-red-500/40 text-red-400', icon: Flame },
              { lift: 'Bench Press', key: 'bench', color: 'border-blue-500/40 text-blue-400', icon: Dumbbell },
              { lift: 'Deadlift', key: 'deadlift', color: 'border-amber-500/40 text-amber-400', icon: Award },
            ].map(({ lift, key, color, icon: Icon }) => (
              <div key={key} className="bg-zinc-900/60 rounded-xl border border-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-orange-500" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">{lift} Attempts</h4>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {attempts[key].map((att, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTargetWeight(att);
                        onWeightChange?.(att);
                      }}
                      className={`p-2 rounded text-center font-mono transition-all ${
                        targetWeight === att
                          ? 'bg-orange-600 text-white font-black scale-105 shadow-md'
                          : 'bg-zinc-950 border border-white/5 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className="text-[9px] text-zinc-500 uppercase">{i + 1}st Attempt</div>
                      <div className="text-sm font-bold mt-0.5">{att}kg</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'flight_timing' && (
        <div className="space-y-6">
          {/* Flight Manager Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-zinc-900/60 p-6 rounded-xl border border-white/5">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">Current Turnaround</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl md:text-5xl font-black italic text-orange-500 font-mono">
                  {liftersOut * 1.5} MIN
                </span>
                <span className="text-xs font-mono text-zinc-400">EST. TO PLATFORM</span>
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Based on ~90s average platform changeover
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">Lifters Out Countdown</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLiftersOut(Math.max(0, liftersOut - 1))}
                  className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-bold text-lg active:scale-95"
                >
                  <Minus className="w-5 h-5 text-zinc-300" />
                </button>
                <div className="px-6 py-2 bg-black border border-white/10 rounded-lg font-mono text-2xl font-black text-white text-center">
                  {liftersOut} LIFTERS
                </div>
                <button
                  onClick={() => setLiftersOut(liftersOut + 1)}
                  className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-bold text-lg active:scale-95"
                >
                  <Plus className="w-5 h-5 text-zinc-300" />
                </button>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs border-t md:border-t-0 md:border-l border-white/5 md:pl-6 pt-4 md:pt-0">
              <div>
                <span className="text-zinc-500 uppercase text-[10px]">Flight Assignment</span>
                <div className="flex gap-2 mt-1">
                  {['Flight A', 'Flight B', 'Flight C'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setCurrentFlight(f)}
                      className={`px-3 py-1 rounded text-xs font-bold border ${
                        currentFlight === f ? 'bg-orange-600/30 border-orange-500 text-orange-400' : 'bg-zinc-950 border-white/5 text-zinc-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <span className="text-zinc-500 uppercase text-[10px]">Platform Status</span>
                <div className="text-green-400 font-bold text-xs mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {flightPhase}
                </div>
              </div>
            </div>
          </div>

          {/* Warm-Up Ladder Progression Checklist */}
          <div className="bg-zinc-900/60 rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black italic uppercase text-white">Warm-Up Rack Progression</h3>
                <p className="text-xs font-mono text-zinc-400">Calculated countdown for an Opener of {targetWeight}kg</p>
              </div>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>

            <div className="space-y-2.5">
              {warmupLadder.map((step) => (
                <div
                  key={step.set}
                  className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-lg border border-white/5 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-orange-600/20 border border-orange-500/40 text-orange-400 font-mono text-xs font-bold flex items-center justify-center">
                      {step.set}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white font-mono flex items-center gap-2">
                        {step.weight}kg × {step.reps}
                        <span className="text-xs font-normal text-zinc-400">— {step.desc}</span>
                      </div>
                      <span className="text-[10px] font-mono text-orange-400/80">
                        Target Time: {step.timeOut} before flight
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setTargetWeight(step.weight);
                      setActiveTab('loader');
                    }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-orange-600 text-zinc-300 hover:text-white rounded text-xs font-mono font-bold transition-all"
                  >
                    View Sleeve
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attempt_strategy' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/60 rounded-xl border border-white/5 p-6">
            <h3 className="text-lg font-black italic uppercase text-white mb-2">Real-Time Attempt Selection Matrix</h3>
            <p className="text-xs font-mono text-zinc-400 mb-6">
              Autoregulation strategy based on measured barbell velocity & athlete reported RPE
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              <div className="p-4 bg-zinc-950 rounded-lg border border-green-500/30">
                <div className="text-green-400 font-bold uppercase mb-2">Aggressive Jump (RPE ≤ 7.5)</div>
                <p className="text-zinc-400 mb-3">Bar moved with high acceleration (&gt;0.55 m/s). Minimal fatigue detected.</p>
                <div className="p-2.5 bg-green-950/30 rounded text-green-300 font-bold">
                  Recommended Jump: +10kg to +15kg
                </div>
              </div>

              <div className="p-4 bg-zinc-950 rounded-lg border border-yellow-500/30">
                <div className="text-yellow-400 font-bold uppercase mb-2">Standard Jump (RPE 8.0 - 8.5)</div>
                <p className="text-zinc-400 mb-3">Nominal competition speed. Matches peaking projection profile.</p>
                <div className="p-2.5 bg-yellow-950/30 rounded text-yellow-300 font-bold">
                  Recommended Jump: +7.5kg to +10kg
                </div>
              </div>

              <div className="p-4 bg-zinc-950 rounded-lg border border-red-500/30">
                <div className="text-red-400 font-bold uppercase mb-2">Conservative Jump (RPE ≥ 9.0)</div>
                <p className="text-zinc-400 mb-3">Significant bar slowdown or technical drift. Secure total/points.</p>
                <div className="p-2.5 bg-red-950/30 rounded text-red-300 font-bold">
                  Recommended Jump: +2.5kg to +5kg
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OlympicPlateLoader;
