/**
 * MeetDayPrepKit.jsx - The Meet Day War Kit
 * 1. 2-Hour (IPF / Powerlifting India) vs 24-Hour Weigh-In Water Cut & Rehydration Protocol
 * 2. IPF Gear & Meet Bag Persistent Checklist
 * 3. Biomechanical Sticking Point & Weakness Diagnostic Engine
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Droplet, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Flame,
  Zap,
  Info,
  RotateCcw
} from 'lucide-react';

export const MeetDayPrepKit = () => {
  const [activeTab, setActiveTab] = useState('water_cut'); // 'water_cut' | 'gear_checklist' | 'sticking_points'

  // Water cut states
  const [weighInType, setWeighInType] = useState('2hour'); // '2hour' (IPF / Powerlifting India) | '24hour' (WPC/WRPF)
  const [targetWeightDrop, setTargetWeightDrop] = useState(2.5); // kg

  // Gear checklist state with localStorage persistence
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('titan_meet_checklist');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      singlet: false,
      cotton_tee: false,
      deadlift_socks: false,
      approved_underwear: false,
      belt: false,
      knee_sleeves: false,
      wrist_wraps: false,
      lifting_shoes: false,
      chalk: false,
      smelling_salts: false,
      bands: false,
      fed_card_id: false,
      ors_electrolytes: false,
      quick_carbs: false,
      water_jug: false
    };
  });

  const toggleCheck = (id) => {
    setChecklist(prev => {
      const up = { ...prev, [id]: !prev[id] };
      localStorage.setItem('titan_meet_checklist', JSON.stringify(up));
      return up;
    });
  };

  const resetChecklist = () => {
    const reset = Object.keys(checklist).reduce((acc, k) => ({ ...acc, [k]: false }), {});
    setChecklist(reset);
    localStorage.setItem('titan_meet_checklist', JSON.stringify(reset));
  };

  // Sticking points diagnostic state
  const [diagLift, setDiagLift] = useState('bench');
  const [diagPoint, setDiagPoint] = useState('off_chest');

  const STICKING_DATA = {
    bench: {
      off_chest: {
        title: "Failing Off The Chest (0-2 Inches)",
        cause: "Weak pectoral reversal power, passive lat tension, or loss of leg drive timing upon press command.",
        fix_cues: "Squeeze lats hard into the bench pad before lowering bar. Flare elbows slightly on reversal and drive heels into floor to initiate upward bar drive.",
        primary_variation: "Spoto Press (1-Inch Pause Above Chest)",
        accessories: ["3-Second Competition Paused Bench", "Incline Dumbbell Press", "Barbell Seal Rows"]
      },
      midway: {
        title: "Failing Midway (Sticking Point at 90° Elbows)",
        cause: "Transition zone from pectorals to triceps. Bar path drifting too far back toward face prematurely.",
        fix_cues: "Press the barbell back towards the rack uprights slightly, not straight up. Keep chest flared high.",
        primary_variation: "Larsen Press (Feet-Up Bench) or Pin Press at Chest Level",
        accessories: ["Close Grip Bench Press", "JM Press", "Chest Supported Rows"]
      },
      lockout: {
        title: "Failing Lockout (Last 2-3 Inches)",
        cause: "Triceps brachii weakness or unequal elbow extension.",
        fix_cues: "Tuck elbows slightly on ascent and violently punch knuckles through ceiling.",
        primary_variation: "Close Grip Bench Press with Pause",
        accessories: ["Overhead Rope Tricep Extensions", "JM Press", "Heavy Dips"]
      }
    },
    squat: {
      hole: {
        title: "Failing In The Hole (Bottom Reversal)",
        cause: "Loss of abdominal bracing pressure, loose hip crease, or bouncing out of bounce without control.",
        fix_cues: "360-degree diaphragmatic breath into belt. Spread the floor with outer feet edges. Don't dive-bomb.",
        primary_variation: "2-Sec Dead Stop Paused Squat",
        accessories: ["Pin Squats at Parallel", "Bulgarian Split Squats", "Ab Wheel Rollouts"]
      },
      midway: {
        title: "Failing Halfway Up (Sticking Point at Parallel)",
        cause: "Hips shooting back prematurely (Good-morning squat), turning lift into lower back strain.",
        fix_cues: "Drive upper back and traps up into the barbell barbell bar. Keep chest proud out of hole.",
        primary_variation: "Pin Squats at Sticking Height or High Bar Tempo Squat",
        accessories: ["Paused Leg Press", "Hack Squat", "Copenhagen Side Planks"]
      },
      lockout: {
        title: "Failing Lockout / Knee Extension",
        cause: "Weak glute max lockout drive or adductor exhaustion.",
        fix_cues: "Squeeze glutes forward under bar. Avoid hyperextending lower back.",
        primary_variation: "Heavy Walkouts & Overloaded Quarter Squats",
        accessories: ["Hip Adductor Machine", "Barbell Hip Thrusts", "Standing Calf Raises"]
      }
    },
    deadlift: {
      floor: {
        title: "Failing Off The Floor (Bar Won't Budge)",
        cause: "Lack of leg drive, hips too high at start, or pulling without removing barbell slack.",
        fix_cues: "Pull slack until bar clicks. Push the earth away with quads before hips rise.",
        primary_variation: "Deficit Deadlift (1.5-Inch Deficit)",
        accessories: ["2-Sec Paused Deadlift (1\" Off Floor)", "Leg Press", "Front Squat"]
      },
      knees: {
        title: "Failing At Or Below Knees",
        cause: "Spinal flexion (rounding), weak thoracic extensors, or bar drifting away from shins.",
        fix_cues: "Engage lats to drag bar up shins. Maintain neutral lumbar alignment throughout transition.",
        primary_variation: "2-Sec Paused Deadlift (Below Knee)",
        accessories: ["Romanian Deadlifts (RDL)", "Barbell Seal Rows", "Lat Pulldowns"]
      },
      lockout: {
        title: "Failing Lockout / Hips Won't Push Through",
        cause: "Exhausted glutes, soft knees, grip slipping, or downward hitching.",
        fix_cues: "Stand tall. Push hips through into bar. Do not ramp or hitch bar on thighs (instant red lights).",
        primary_variation: "Block Pulls (Below Knee)",
        accessories: ["Heavy Barbell Shrugs (2s pause)", "Farmer Walks", "Stiff-Legged Deadlifts"]
      }
    }
  };

  const currentDiag = STICKING_DATA[diagLift]?.[diagPoint] || STICKING_DATA.bench.off_chest;

  return (
    <div className="bg-zinc-950 rounded-2xl border border-white/10 p-6 shadow-2xl font-sans text-white space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-orange-400 uppercase font-bold">MEET DAY WAR KIT</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-orange-500" />
            Weigh-In, Gear & Diagnostic War Room
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Step-by-step water cut schedule, rehydration protocol, IPF gear checklist, and sticking point solver
          </p>
        </div>

        {/* Subtab Selector */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1.5 rounded-xl border border-white/5 font-mono text-xs overflow-x-auto">
          {[
            { id: 'water_cut', label: 'Weigh-In & Water Cut' },
            { id: 'gear_checklist', label: 'IPF Gear Checklist' },
            { id: 'sticking_points', label: 'Weak Point Diagnostic' },
            { id: 'ipf_rulebook', label: 'Official Rulebook & Gear Check' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Water Cut & Rehydration Protocol */}
      {activeTab === 'water_cut' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-xl border border-white/5">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">Weigh-In Window Protocol</span>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setWeighInType('2hour')}
                  className={`px-4 py-2 rounded-lg font-mono text-xs font-bold border transition-all ${
                    weighInType === '2hour'
                      ? 'bg-orange-600 border-orange-500 text-white'
                      : 'bg-zinc-950 border-white/5 text-zinc-400'
                  }`}
                >
                  Strict 2-Hour Weigh-In (Powerlifting India / IPF)
                </button>
                <button
                  onClick={() => setWeighInType('24hour')}
                  className={`px-4 py-2 rounded-lg font-mono text-xs font-bold border transition-all ${
                    weighInType === '24hour'
                      ? 'bg-orange-600 border-orange-500 text-white'
                      : 'bg-zinc-950 border-white/5 text-zinc-400'
                  }`}
                >
                  24-Hour Weigh-In (WPC / WRPF)
                </button>
              </div>
            </div>

            <div className="font-mono text-xs text-zinc-400">
              <span className="text-white font-bold block mb-1">Target Water Weight Cut:</span>
              <div className="flex items-center gap-2">
                {[1.5, 2.5, 3.5].map(kg => (
                  <button
                    key={kg}
                    onClick={() => setTargetWeightDrop(kg)}
                    className={`px-3 py-1 rounded font-bold border ${
                      targetWeightDrop === kg ? 'bg-orange-600 text-white border-orange-500' : 'bg-zinc-950 border-white/5 text-zinc-400'
                    }`}
                  >
                    -{kg}kg
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 7-Day Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/5 space-y-2">
              <div className="text-orange-400 font-bold uppercase">Days -6 & -5 (Water Load)</div>
              <div className="text-white text-sm font-black">8.0 Liters Water / Day</div>
              <p className="text-zinc-400 text-[11px]">Normal high sodium. Up-regulates aldosterone to flush water out of soft tissue.</p>
            </div>

            <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/5 space-y-2">
              <div className="text-orange-400 font-bold uppercase">Days -4 & -3 (Water Drop)</div>
              <div className="text-white text-sm font-black">4.0L ➔ 2.5L Water / Day</div>
              <p className="text-zinc-400 text-[11px]">Switch to low residue carbs (White rice, rice cakes, whey). Drop fibrous raw salads.</p>
            </div>

            <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/5 space-y-2">
              <div className="text-orange-400 font-bold uppercase">Day -1 (Water Restriction)</div>
              <div className="text-white text-sm font-black">&lt;0.5L Water Sips Only</div>
              <p className="text-zinc-400 text-[11px]">Zero added salt. Fast from 8:00 PM. Body continues flushing water through nocturnal diuresis.</p>
            </div>

            <div className="p-4 bg-zinc-900/60 rounded-xl border border-green-500/30 space-y-2 bg-green-950/10">
              <div className="text-green-400 font-bold uppercase">Meet Day (Weigh-In)</div>
              <div className="text-white text-sm font-black">Hit Weight ➔ Rehydrate</div>
              <p className="text-zinc-400 text-[11px]">Step off scales and immediately execute the 2-Hour Rapid Rehydration Blueprint.</p>
            </div>
          </div>

          {/* Rapid Rehydration Blueprint */}
          <div className="bg-zinc-900/60 p-6 rounded-xl border border-white/5">
            <h3 className="text-sm font-mono uppercase tracking-wider text-green-400 font-bold mb-4 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-green-400" />
              Strict 2-Hour Post-Weigh-In Rehydration Blueprint
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 bg-zinc-950 rounded-lg border border-white/5 space-y-1">
                <span className="text-orange-400 font-bold">Minute 0 - 15 (Immediate)</span>
                <p className="text-zinc-300">Drink 500ml ORS (Electral / Oral Rehydration Salts) + 200ml coconut water + 1/4 tsp pink salt.</p>
              </div>
              <div className="p-4 bg-zinc-950 rounded-lg border border-white/5 space-y-1">
                <span className="text-orange-400 font-bold">Minute 15 - 50 (Carb Load)</span>
                <p className="text-zinc-300">Eat 4-6 rice cakes with honey / strawberry jam + 1 large ripe banana. Drink 500ml clean water.</p>
              </div>
              <div className="p-4 bg-zinc-950 rounded-lg border border-white/5 space-y-1">
                <span className="text-orange-400 font-bold">Minute 60 - 80 (Potentiation)</span>
                <p className="text-zinc-300">Take 150-200mg caffeine / pre-workout 45 mins before warmups begin. You are 100% full & energized.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: IPF Gear Checklist */}
      {activeTab === 'gear_checklist' && (
        <div className="bg-zinc-900/60 p-6 rounded-xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-black italic uppercase text-white">IPF Rulebook Gear & Meet Bag Checklist</h3>
              <p className="text-xs font-mono text-zinc-400">Checked items are saved locally so you never forget essentials on meet morning</p>
            </div>
            <button
              onClick={resetChecklist}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            {/* Column 1: Mandatory Apparel */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-orange-400 font-bold block">Mandatory Platform Apparel</span>
              {[
                { id: 'singlet', label: 'IPF Approved Singlet (SBD/Titan/A7)' },
                { id: 'cotton_tee', label: '100% Cotton Crewneck T-Shirt (No collar/pockets)' },
                { id: 'deadlift_socks', label: 'Deadlift Knee-High Socks (Covering shins)' },
                { id: 'approved_underwear', label: 'Standard Cotton Briefs (No boxer briefs)' }
              ].map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleCheck(item.id)}
                  className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${
                    checklist[item.id] ? 'bg-green-950/20 border-green-500/40 text-green-300' : 'bg-zinc-950 border-white/5 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${checklist[item.id] ? 'bg-green-600 border-green-600 text-white' : 'border-zinc-600'}`}>
                    {checklist[item.id] && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className={checklist[item.id] ? 'line-through text-zinc-500' : ''}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Column 2: Supportive Equipment */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold block">Supportive Hardware</span>
              {[
                { id: 'belt', label: '10mm or 13mm Approved Lifting Belt' },
                { id: 'knee_sleeves', label: '7mm / 30cm Max Competition Knee Sleeves' },
                { id: 'wrist_wraps', label: 'Wrist Wraps (1-meter max)' },
                { id: 'lifting_shoes', label: 'Squat Shoes / Flat Deadlift Slippers' }
              ].map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleCheck(item.id)}
                  className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${
                    checklist[item.id] ? 'bg-green-950/20 border-green-500/40 text-green-300' : 'bg-zinc-950 border-white/5 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${checklist[item.id] ? 'bg-green-600 border-green-600 text-white' : 'border-zinc-600'}`}>
                    {checklist[item.id] && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className={checklist[item.id] ? 'line-through text-zinc-500' : ''}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Column 3: Platform Kit & Admin */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-yellow-400 font-bold block">Kit, Nutrition & ID</span>
              {[
                { id: 'fed_card_id', label: 'Government ID & Federation Card' },
                { id: 'ors_electrolytes', label: 'ORS Packets & Pre-weighed Dextrose' },
                { id: 'chalk', label: 'Chalk Ball & Liquid Chalk for warmup' },
                { id: 'smelling_salts', label: 'Smelling Salts / Ammonia Caps' }
              ].map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleCheck(item.id)}
                  className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${
                    checklist[item.id] ? 'bg-green-950/20 border-green-500/40 text-green-300' : 'bg-zinc-950 border-white/5 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${checklist[item.id] ? 'bg-green-600 border-green-600 text-white' : 'border-zinc-600'}`}>
                    {checklist[item.id] && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className={checklist[item.id] ? 'line-through text-zinc-500' : ''}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sticking Point Diagnostic */}
      {activeTab === 'sticking_points' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-xl border border-white/5">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold block mb-1">Select Lift</span>
              <div className="flex gap-2">
                {['bench', 'squat', 'deadlift'].map(l => (
                  <button
                    key={l}
                    onClick={() => {
                      setDiagLift(l);
                      setDiagPoint(l === 'bench' ? 'off_chest' : l === 'squat' ? 'hole' : 'floor');
                    }}
                    className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase border transition-all ${
                      diagLift === l ? 'bg-orange-600 border-orange-500 text-white' : 'bg-zinc-950 border-white/5 text-zinc-400'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-1">Where do you fail?</span>
              <div className="flex gap-2">
                {Object.keys(STICKING_DATA[diagLift]).map(p => (
                  <button
                    key={p}
                    onClick={() => setDiagPoint(p)}
                    className={`px-3.5 py-2 rounded-lg font-mono text-xs font-bold capitalize border transition-all ${
                      diagPoint === p ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-zinc-950 border-white/5 text-zinc-400'
                    }`}
                  >
                    {p.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Diagnostic Result Card */}
          <div className="bg-zinc-900/60 p-6 rounded-xl border border-white/5 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-black italic uppercase text-white font-mono">{currentDiag.title}</h3>
              <span className="text-xs px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800/40 rounded-full font-bold uppercase">
                Diagnosis Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <div className="p-4 bg-zinc-950 rounded-lg border border-white/5 space-y-1">
                  <span className="text-red-400 font-bold uppercase">Biomechanical Root Cause:</span>
                  <p className="text-zinc-300 leading-relaxed">{currentDiag.cause}</p>
                </div>

                <div className="p-4 bg-zinc-950 rounded-lg border border-white/5 space-y-1">
                  <span className="text-green-400 font-bold uppercase">Coaching & Cue Fix:</span>
                  <p className="text-zinc-300 leading-relaxed">{currentDiag.fix_cues}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-zinc-950 rounded-lg border border-orange-500/30 space-y-1">
                  <span className="text-orange-400 font-bold uppercase">Primary Prescribed Variation:</span>
                  <p className="text-white font-black text-sm">{currentDiag.primary_variation}</p>
                  <p className="text-zinc-500 text-[11px] mt-1">Substitute on secondary day for 4-6 weeks to break plateau.</p>
                </div>

                <div className="p-4 bg-zinc-950 rounded-lg border border-white/5 space-y-2">
                  <span className="text-cyan-400 font-bold uppercase">Targeted Accessory Arsenal:</span>
                  <ul className="space-y-1 text-zinc-300">
                    {currentDiag.accessories.map((acc, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-cyan-400">•</span>
                        <span>{acc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OFFICIAL RULEBOOK & GEAR VERIFICATION INSPECTOR */}
      {activeTab === 'ipf_rulebook' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/60 rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black italic uppercase text-white">
                  IPF & Powerlifting India Technical Rulebook & Gear Verification
                </h3>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  Official specifications to guarantee you pass Equipment Check with zero warnings or disqualifications.
                </p>
              </div>
              <ShieldCheck className="w-6 h-6 text-green-500" />
            </div>

            {/* Gear Verification Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs mt-6">
              <div className="p-4 bg-zinc-950 rounded-lg border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-400 uppercase">1. Lifting Singlet</span>
                  <span className="text-[10px] bg-green-950 text-green-400 px-2 py-0.5 rounded">MANDATORY</span>
                </div>
                <ul className="text-zinc-300 space-y-1 text-[11px]">
                  <li>• Must be one-piece suit of single-ply stretch material.</li>
                  <li>• Leg length must NOT extend beyond mid-thigh or touch knees.</li>
                  <li>• No zippers, buttons, pockets, or rubberized reinforcement.</li>
                  <li>• Approved brands: SBD, A7, Titan, Inzer, Metal, Wahlanders.</li>
                </ul>
              </div>

              <div className="p-4 bg-zinc-950 rounded-lg border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-400 uppercase">2. T-Shirt Under Singlet</span>
                  <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded">STRICT CHECKS</span>
                </div>
                <ul className="text-zinc-300 space-y-1 text-[11px]">
                  <li>• <strong>100% Cotton or Poly-Cotton blend ONLY.</strong></li>
                  <li>• <strong>Round crew neck ONLY</strong> — NO V-neck, NO collared polo.</li>
                  <li>• Sleeves must end above elbow, cannot be rolled up or sleeveless.</li>
                  <li>• NO rubberized printing, pockets, or compression elastane.</li>
                </ul>
              </div>

              <div className="p-4 bg-zinc-950 rounded-lg border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-400 uppercase">3. Underwear</span>
                  <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded">COMMON DQ CAUSE</span>
                </div>
                <ul className="text-zinc-300 space-y-1 text-[11px]">
                  <li>• <strong>Standard brief / triangle style ONLY (legless).</strong></li>
                  <li>• ❌ <strong>BOXER SHORTS OR COMPRESSION SHORTS WITH LEGS ARE STRICTLY ILLEGAL.</strong></li>
                  <li>• Material must not provide supportive compression to hips.</li>
                </ul>
              </div>

              <div className="p-4 bg-zinc-950 rounded-lg border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-400 uppercase">4. Knee Sleeves (Classic)</span>
                  <span className="text-[10px] bg-green-950 text-green-400 px-2 py-0.5 rounded">IPF APPROVED LIST</span>
                </div>
                <ul className="text-zinc-300 space-y-1 text-[11px]">
                  <li>• Maximum length: <strong>300 mm (30 cm)</strong>.</li>
                  <li>• Maximum thickness: <strong>7 mm</strong>.</li>
                  <li>• Must not touch singlet or socks during lifting.</li>
                  <li>• Cannot be pulled on using plastic bags or assistance straps.</li>
                </ul>
              </div>

              <div className="p-4 bg-zinc-950 rounded-lg border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-400 uppercase">5. Deadlift Socks</span>
                  <span className="text-[10px] bg-green-950 text-green-400 px-2 py-0.5 rounded">MANDATORY FOR DL</span>
                </div>
                <ul className="text-zinc-300 space-y-1 text-[11px]">
                  <li>• Must cover the entire shin bone up to just below the knee cap.</li>
                  <li>• Must NOT touch knee sleeve or cover the knee joint.</li>
                  <li>• Full tights or leggings under/over socks are strictly prohibited.</li>
                </ul>
              </div>

              <div className="p-4 bg-zinc-950 rounded-lg border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-400 uppercase">6. Lifting Belt</span>
                  <span className="text-[10px] bg-blue-950 text-blue-400 px-2 py-0.5 rounded">MAX 13MM</span>
                </div>
                <ul className="text-zinc-300 space-y-1 text-[11px]">
                  <li>• Maximum width: <strong>100 mm (10 cm / 4 inches)</strong>.</li>
                  <li>• Maximum thickness: <strong>13 mm</strong>.</li>
                  <li>• Prong buckle or approved quick-release lever.</li>
                  <li>• No internal padding, velcro, or contoured taper designs.</li>
                </ul>
              </div>
            </div>

            {/* Platform Card Infractions & Colors */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="font-bold uppercase text-sm text-white mb-3 flex items-center gap-2">
                <span>🔴 Platform Referee Card & Lights System</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-lg">
                  <div className="font-bold text-red-400 mb-1">🔴 RED CARD / LIGHT</div>
                  <div className="text-zinc-300 text-[11px] space-y-1">
                    <div>• <strong>Squat:</strong> Failure to break parallel (hip crease not below top of knee).</div>
                    <div>• <strong>Bench:</strong> Failure to lock out arms completely.</div>
                    <div>• <strong>Deadlift:</strong> Failure to lock knees or stand fully erect.</div>
                  </div>
                </div>

                <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-lg">
                  <div className="font-bold text-blue-400 mb-1">🔵 BLUE CARD / LIGHT</div>
                  <div className="text-zinc-300 text-[11px] space-y-1">
                    <div>• <strong>All Lifts:</strong> Downward bar movement during the upward ascent.</div>
                    <div>• <strong>Squat:</strong> Stepping forward or backward after start command.</div>
                    <div>• <strong>Deadlift:</strong> Hitching / resting barbell on thighs.</div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-950/30 border border-yellow-500/30 rounded-lg">
                  <div className="font-bold text-yellow-400 mb-1">🟡 YELLOW CARD / LIGHT</div>
                  <div className="text-zinc-300 text-[11px] space-y-1">
                    <div>• <strong>Commands:</strong> Jumping "Squat", "Press", "Rack", or "Down" commands.</div>
                    <div>• <strong>Bench:</strong> Buttocks lifting off bench; feet shifting.</div>
                    <div>• <strong>Deadlift:</strong> Dropping bar before it touches the platform.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetDayPrepKit;
