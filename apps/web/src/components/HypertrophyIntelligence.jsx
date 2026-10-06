/**
 * HypertrophyIntelligence.jsx - Advanced Bodybuilding & Hypertrophy Engineering Engine
 * Features:
 * 1. Volume Landmarks (MEV, MAV, MRV) per muscle group with interactive set tracking
 * 2. Scientific Double Progression System (+2.5kg overload auto-calculator)
 * 3. Stretch-Mediated Hypertrophy & Stimulus-to-Fatigue Ratio (SFR) Exercise Library
 * 4. Intensity Techniques: Myo-Reps, Mechanical Drop Sets, & Long-Length Partials
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Dumbbell, 
  TrendingUp, 
  Layers, 
  Target, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  ChevronRight, 
  Info,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Scale
} from 'lucide-react';
import { toast } from 'sonner';

// Renaissance Periodization / Scientific Volume Landmarks (Sets Per Week)
const MUSCLE_VOLUME_LANDMARKS = {
  chest: {
    name: 'Chest / Pectorals',
    icon: '🛡️',
    mev: 8,   // Minimum Effective Volume
    mavMin: 12, // Maximum Adaptive Volume start
    mavMax: 18, // Maximum Adaptive Volume peak
    mrv: 22,  // Maximum Recoverable Volume
    currentSets: 14,
    lengthenedFavs: ['Incline Dumbbell Press (30°)', 'Deep Dumbbell Fly / Cable Fly with Stretch Hold', 'Deficit Push-Up'],
    sfrKing: 'Low Incline Dumbbell Press with 2-second deep stretch at the bottom'
  },
  lats_back: {
    name: 'Lats & Upper Back',
    icon: '🦅',
    mev: 10,
    mavMin: 14,
    mavMax: 20,
    mrv: 24,
    currentSets: 16,
    lengthenedFavs: ['Single-Arm Lat Pulldown (Neutral Grip)', 'Chest-Supported T-Bar Row', 'Cross-Body Lat Cable Row'],
    sfrKing: 'Chest-Supported Row (Eliminates lower-back axial fatigue, isolates pure lat/rhomboid tension)'
  },
  quads: {
    name: 'Quadriceps',
    icon: '🦵',
    mev: 8,
    mavMin: 12,
    mavMax: 16,
    mrv: 20,
    currentSets: 12,
    lengthenedFavs: ['Heel-Elevated Hack Squat', 'Sissy Squat / Spanish Squat', 'Leg Extension with Full Stretch'],
    sfrKing: 'Hack Squat or Pendulum Squat (High knee flexion with stable back support)'
  },
  hamstrings: {
    name: 'Hamstrings',
    icon: '🎯',
    mev: 6,
    mavMin: 10,
    mavMax: 14,
    mrv: 18,
    currentSets: 10,
    lengthenedFavs: ['Dumbbell Romanian Deadlift (RDL)', 'Seated Leg Curl (Eliminates active insufficiency)', 'Good Mornings'],
    sfrKing: 'Seated Leg Curl (Stretches the hamstrings at both the hip and the knee simultaneously)'
  },
  side_delts: {
    name: 'Side Deltoids (Cap Width)',
    icon: '⚔️',
    mev: 8,
    mavMin: 16,
    mavMax: 24,
    mrv: 28,
    currentSets: 18,
    lengthenedFavs: ['Behind-the-Back Cable Lateral Raise', 'Cross-Body Cable Y-Raise', 'Incline Leaning DB Lateral Raise'],
    sfrKing: 'Behind-the-Back Cable Lateral (Peak resistance at the stretched bottom position instead of top)'
  },
  biceps: {
    name: 'Biceps & Brachialis',
    icon: '💪',
    mev: 6,
    mavMin: 10,
    mavMax: 16,
    mrv: 20,
    currentSets: 12,
    lengthenedFavs: ['Incline Dumbbell Curl (Arms Behind Torso)', 'Bayesian Cable Curl (Facing Away)', 'Preacher Curl'],
    sfrKing: 'Incline Dumbbell Curl (Places long head of biceps under maximal stretch at shoulder joint)'
  },
  triceps: {
    name: 'Triceps (Long & Lateral Head)',
    icon: '⚡',
    mev: 6,
    mavMin: 10,
    mavMax: 16,
    mrv: 20,
    currentSets: 12,
    lengthenedFavs: ['Cross-Body Overhead Cable Extension', 'Incline Dumbbell Skull Crusher', 'Cable Pushdown'],
    sfrKing: 'Overhead Cable Triceps Extension (Fully stretches long head of triceps across shoulder)'
  },
  calves_abs: {
    name: 'Calves & Core',
    icon: '🧱',
    mev: 6,
    mavMin: 10,
    mavMax: 14,
    mrv: 18,
    currentSets: 8,
    lengthenedFavs: ['Leg Press Calf Raise (3s stretch at bottom)', 'Hanging Leg Raise (Posterior pelvic tilt)', 'Cable Crunch'],
    sfrKing: 'Straight-Leg Calf Raise on Leg Press with a dead 3-second pause in full dorsiflexion'
  }
};

// Stretch-Mediated Hypertrophy Knowledge Base
const STRETCH_HYPERTROPHY_CATALOG = [
  {
    muscle: 'Hamstrings',
    exercise: 'Seated Leg Curl vs Lying Leg Curl',
    verdict: 'Seated Leg Curl Produces ~1.5x More Hypertrophy',
    why: 'When seated, the hips are flexed at 90°, lengthening the bi-articular hamstring muscles over the hip joint before knee flexion begins.',
    badge: 'High SFR'
  },
  {
    muscle: 'Triceps',
    exercise: 'Overhead Cable Triceps Extension vs Rope Pushdown',
    verdict: 'Overhead Position Yields Greater Long-Head Growth',
    why: 'The long head of the triceps originates on the infraglenoid tubercle of the scapula. Elevating the arm overhead stretches this head to its optimal sarcomere operating length.',
    badge: 'Long-Head Focus'
  },
  {
    muscle: 'Biceps',
    exercise: 'Incline Dumbbell Curl vs Standing Barbell Curl',
    verdict: 'Incline DB Curl Maximizes Stretch-Mediated Signaling',
    why: 'Setting the bench at 45-60° allows the humerus to extend behind the torso, inducing high passive tension on the biceps long head.',
    badge: 'Peak Stretch'
  },
  {
    muscle: 'Side Delts',
    exercise: 'Cable Lateral Raise (Cuff at Wrist) vs Dumbbell Lateral',
    verdict: 'Cables Provide Constant Tension in the Lengthened Range',
    why: 'With dumbbells, resistance is 0 at the bottom and peaks at the top. With cables set at hand height, tension is highest in the first 0-45° of abduction.',
    badge: '3D Deltoid King'
  }
];

export default function HypertrophyIntelligence() {
  const [activeTab, setActiveTab] = useState('volume_landmarks'); // 'volume_landmarks' | 'double_progression' | 'stretch_sfr' | 'intensity_techniques'
  const [selectedMuscle, setSelectedMuscle] = useState('chest');
  const [weeklySets, setWeeklySets] = useState({
    chest: 14,
    lats_back: 16,
    quads: 12,
    hamstrings: 10,
    side_delts: 18,
    biceps: 12,
    triceps: 12,
    calves_abs: 8
  });

  // Double Progression Simulator State
  const [dpExercise, setDpExercise] = useState('Incline Dumbbell Press');
  const [dpMinReps, setDpMinReps] = useState(8);
  const [dpMaxReps, setDpMaxReps] = useState(12);
  const [dpWeight, setDpWeight] = useState(36);
  const [set1Reps, setSet1Reps] = useState(12);
  const [set2Reps, setSet2Reps] = useState(12);
  const [set3Reps, setSet3Reps] = useState(12);

  // Evaluate Double Progression Recommendation
  const dpRecommendation = useMemo(() => {
    const allHitMax = set1Reps >= dpMaxReps && set2Reps >= dpMaxReps && set3Reps >= dpMaxReps;
    if (allHitMax) {
      return {
        status: 'bump_weight',
        title: 'OVERLOAD UNLOCKED: +2.5 KG BUMP! 🚀',
        newWeight: dpWeight + 2.5,
        newRepTarget: dpMinReps,
        explanation: `You successfully hit the ceiling (${dpMaxReps} reps) across all 3 working sets! Next session: load ${(dpWeight + 2.5)}kg and reset rep target to ${dpMinReps} reps.`
      };
    } else {
      const repsShort = (dpMaxReps * 3) - (set1Reps + set2Reps + set3Reps);
      return {
        status: 'add_reps',
        title: 'HOLD LOAD: PROGRESS VIA REPS 🔄',
        newWeight: dpWeight,
        newRepTarget: `${dpMinReps}-${dpMaxReps}`,
        explanation: `Keep ${dpWeight}kg on the bar. You need ${repsShort} more cumulative reps to unlock the next weight increase. Focus on adding +1 rep to Set 1 or Set 2 next session.`
      };
    }
  }, [dpMaxReps, dpMinReps, dpWeight, set1Reps, set2Reps, set3Reps]);

  // Adjust volume sets
  const handleSetChange = (muscleKey, delta) => {
    setWeeklySets(prev => ({
      ...prev,
      [muscleKey]: Math.max(0, Math.min(40, (prev[muscleKey] || 0) + delta))
    }));
  };

  const currentMuscleData = MUSCLE_VOLUME_LANDMARKS[selectedMuscle] || MUSCLE_VOLUME_LANDMARKS.chest;
  const currentSets = weeklySets[selectedMuscle] ?? currentMuscleData.currentSets;

  // Determine volume tier status
  const volumeTier = useMemo(() => {
    if (currentSets < currentMuscleData.mev) {
      return {
        label: 'UNDER-STIMULATED (< MEV)',
        color: 'text-amber-400',
        barColor: 'bg-amber-500',
        badge: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
        advice: 'Below Minimum Effective Volume. Add 2-3 weekly working sets to trigger optimal hypertrophy.'
      };
    } else if (currentSets >= currentMuscleData.mavMin && currentSets <= currentMuscleData.mavMax) {
      return {
        label: 'GROWTH SWEET SPOT (MAV) 🏆',
        color: 'text-emerald-400',
        barColor: 'bg-emerald-500',
        badge: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
        advice: 'Optimal Maximum Adaptive Volume! Muscle Protein Synthesis is maximized with manageable fatigue.'
      };
    } else if (currentSets > currentMuscleData.mavMax && currentSets <= currentMuscleData.mrv) {
      return {
        label: 'HIGH VOLUME OVER-REACHING',
        color: 'text-orange-400',
        barColor: 'bg-orange-500',
        badge: 'bg-orange-950/80 border-orange-500/40 text-orange-300',
        advice: 'Nearing Maximum Recoverable Volume. Monitor joint soreness and sleep quality closely.'
      };
    } else if (currentSets > currentMuscleData.mrv) {
      return {
        label: 'FATIGUE OVERLOAD (> MRV) 🚨',
        color: 'text-red-400',
        barColor: 'bg-red-500',
        badge: 'bg-red-950/80 border-red-500/60 text-red-300',
        advice: 'Exceeding systemic recovery capacity! Risk of muscle loss and tendonitis. Deload or reduce sets immediately.'
      };
    } else {
      return {
        label: 'MAINTENANCE / ACCUMULATION',
        color: 'text-cyan-400',
        barColor: 'bg-cyan-500',
        badge: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300',
        advice: 'Sufficient to maintain and slowly build lean contractile tissue.'
      };
    }
  }, [currentSets, currentMuscleData]);

  return (
    <div className="bg-zinc-950 rounded-2xl border border-purple-500/20 p-5 md:p-7 shadow-2xl space-y-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-purple-400 uppercase font-bold">SPORTS SCIENCE HYPERTROPHY LAB</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
            <Flame className="w-7 h-7 text-purple-500" />
            Hypertrophy & Scientific Volume Engine
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Evidence-based bodybuilding: MEV/MAV/MRV landmarks, double progression auto-overload, and stretch-mediated mechanics.
          </p>
        </div>

        {/* Navigation Switcher */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-white/5 font-mono text-xs overflow-x-auto">
          {[
            { id: 'volume_landmarks', label: '📊 Volume Landmarks (MEV/MAV)' },
            { id: 'double_progression', label: '⚡ Double Overload Calculator' },
            { id: 'stretch_sfr', label: '🔬 Stretch-Mediated Library' },
            { id: 'intensity_techniques', label: '🔥 Myo-Reps & Intensity' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === t.id ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SCIENTIFIC VOLUME LANDMARKS (MEV, MAV, MRV) */}
      {/* ========================================================================= */}
      {activeTab === 'volume_landmarks' && (
        <div className="space-y-6">
          {/* Muscle Selector Pills */}
          <div>
            <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-2 font-bold">
              Select Muscle Group to Inspect Volume Tier:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {Object.entries(MUSCLE_VOLUME_LANDMARKS).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMuscle(key)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedMuscle === key
                      ? 'bg-purple-950/60 border-purple-500 text-white shadow-md shadow-purple-950'
                      : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xl block mb-1">{data.icon}</span>
                  <p className="text-[11px] font-bold leading-tight truncate">{data.name.split('/')[0]}</p>
                  <p className="text-[10px] font-mono text-purple-400 mt-1">{weeklySets[key]} sets/wk</p>
                </button>
              ))}
            </div>
          </div>

          {/* Volume Meter Bento Card */}
          <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-5 md:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider">
                  WEEKLY EFFECTIVE SET TRACKER
                </span>
                <h3 className="text-xl font-black italic text-white flex items-center gap-2">
                  <span>{currentMuscleData.name}</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${volumeTier.badge}`}>
                    {volumeTier.label}
                  </span>
                </h3>
              </div>

              {/* Set Steppers */}
              <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-xl border border-white/5 font-mono">
                <span className="text-xs text-zinc-400">Current Sets:</span>
                <button
                  onClick={() => handleSetChange(selectedMuscle, -1)}
                  className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-sm font-bold flex items-center justify-center text-red-400"
                >-</button>
                <span className="text-2xl font-black text-white w-8 text-center">{currentSets}</span>
                <button
                  onClick={() => handleSetChange(selectedMuscle, +1)}
                  className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-sm font-bold flex items-center justify-center text-green-400"
                >+</button>
                <span className="text-xs text-zinc-500">sets/wk</span>
              </div>
            </div>

            {/* Volume Tier Visual Progress Track */}
            <div className="space-y-2">
              <div className="h-4 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-white/5 relative">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${volumeTier.barColor}`}
                  style={{ width: `${Math.min(100, (currentSets / (currentMuscleData.mrv + 4)) * 100)}%` }}
                />
              </div>

              {/* Landmarks Milestone Scale */}
              <div className="grid grid-cols-4 text-center font-mono text-[10px] text-zinc-400 pt-1">
                <div>
                  <span className="text-amber-400 font-bold block">{currentMuscleData.mev} sets</span>
                  <span>MEV (Min Effective)</span>
                </div>
                <div>
                  <span className="text-emerald-400 font-bold block">{currentMuscleData.mavMin} - {currentMuscleData.mavMax} sets</span>
                  <span>MAV (Growth Zone)</span>
                </div>
                <div>
                  <span className="text-orange-400 font-bold block">{currentMuscleData.mrv} sets</span>
                  <span>MRV (Max Recoverable)</span>
                </div>
                <div>
                  <span className="text-red-400 font-bold block">&gt; {currentMuscleData.mrv} sets</span>
                  <span>Overtraining Risk</span>
                </div>
              </div>
            </div>

            {/* Coach Prescription Callout */}
            <div className="bg-black/40 rounded-xl border border-white/5 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-purple-300 font-bold uppercase text-[10px]">SCIENCE-BACKED RECOMMENDATION</p>
                  <p className="text-zinc-200 mt-0.5 font-sans text-xs">{volumeTier.advice}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-zinc-500 block uppercase">Lengthened (Stretch-Mediated) Favorites:</span>
                  <p className="text-cyan-300 font-bold mt-0.5">{currentMuscleData.lengthenedFavs.join(' • ')}</p>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase">High Stimulus-to-Fatigue (SFR) King:</span>
                  <p className="text-amber-300 font-bold mt-0.5">{currentMuscleData.sfrKing}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SCIENTIFIC DOUBLE PROGRESSION AUTO-CALCULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'double_progression' && (
        <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-5 md:p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                HYPERTROPHY DOUBLE PROGRESSION PROTOCOL
              </span>
              <h3 className="text-xl font-black italic text-white">
                Auto-Overload Calculator (+2.5 KG Jump Evaluator)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                The most reliable method for natural muscle growth: Add reps inside the rep bracket first, then bump weight.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">Exercise Name</label>
              <input
                type="text"
                value={dpExercise}
                onChange={e => setDpExercise(e.target.value)}
                className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">Target Rep Bracket</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={dpMinReps}
                  onChange={e => setDpMinReps(parseInt(e.target.value) || 8)}
                  className="w-full bg-black border border-white/10 rounded px-2 py-2 text-center text-white font-bold"
                />
                <span className="text-zinc-500">to</span>
                <input
                  type="number"
                  value={dpMaxReps}
                  onChange={e => setDpMaxReps(parseInt(e.target.value) || 12)}
                  className="w-full bg-black border border-white/10 rounded px-2 py-2 text-center text-white font-bold"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">Current Working Load</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="2.5"
                  value={dpWeight}
                  onChange={e => setDpWeight(parseFloat(e.target.value) || 20)}
                  className="w-full bg-black border border-white/10 rounded px-3 py-2 text-center text-white font-bold"
                />
                <span className="text-zinc-500 font-bold">KG</span>
              </div>
            </div>
            <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 uppercase block">Criterion</span>
              <span className="text-xs font-bold text-cyan-400">All sets must reach {dpMaxReps} reps</span>
            </div>
          </div>

          {/* Actual Logged Reps per Set */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold block">
              Log Today's Completed Reps (RIR 1-2):
            </span>
            <div className="grid grid-cols-3 gap-3 font-mono text-center">
              {[
                { label: 'Set 1', val: set1Reps, setVal: setSet1Reps },
                { label: 'Set 2', val: set2Reps, setVal: setSet2Reps },
                { label: 'Set 3', val: set3Reps, setVal: setSet3Reps },
              ].map((s, idx) => (
                <div key={idx} className="bg-black/40 border border-white/10 p-3 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1 font-bold">{s.label}</span>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => s.setVal(Math.max(1, s.val - 1))}
                      className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold"
                    >-</button>
                    <span className="text-2xl font-black text-white w-8">{s.val}</span>
                    <button
                      onClick={() => s.setVal(s.val + 1)}
                      className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold"
                    >+</button>
                  </div>
                  <span className={`text-[10px] mt-1 block font-bold ${s.val >= dpMaxReps ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {s.val >= dpMaxReps ? '✓ Max Reps Met' : `${dpMaxReps - s.val} reps to ceiling`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Solution Banner */}
          <div className={`p-5 rounded-xl border-2 transition-all space-y-2 font-mono ${
            dpRecommendation.status === 'bump_weight'
              ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200'
              : 'bg-zinc-900 border-amber-500/50 text-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-current animate-pulse" />
              <h4 className="text-sm font-black uppercase tracking-wider">{dpRecommendation.title}</h4>
            </div>
            <p className="text-xs text-white font-sans leading-relaxed">{dpRecommendation.explanation}</p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span>Next Session Target: <strong className="text-white">{dpRecommendation.newWeight} KG</strong> for <strong className="text-white">{dpRecommendation.newRepTarget} Reps</strong></span>
              <button
                onClick={() => toast.success(`⚡ Overload recorded: Target ${dpRecommendation.newWeight}kg next session!`)}
                className="px-3 py-1 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors text-[11px]"
              >
                Log Overload Target
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STRETCH-MEDIATED HYPERTROPHY LIBRARY */}
      {/* ========================================================================= */}
      {activeTab === 'stretch_sfr' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/10">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">SPORTS SCIENCE SPOTLIGHT</span>
            <h3 className="text-base font-bold text-white mt-0.5">Why Stretch-Mediated Hypertrophy Dominates</h3>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              When a muscle fibers are loaded at long muscle lengths under high passive mechanical tension, <strong>titin kinase</strong> and mechanotransduction pathways signal dramatically higher rates of myofibrillar protein synthesis compared to partial or contracted-only movements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STRETCH_HYPERTROPHY_CATALOG.map((item, idx) => (
              <div key={idx} className="bg-zinc-900/60 rounded-xl border border-white/10 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-400 uppercase">{item.muscle}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded">
                    {item.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{item.exercise}</h4>
                <div className="bg-black/40 p-2.5 rounded border border-white/5 font-mono text-xs text-emerald-400 font-bold">
                  {item.verdict}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{item.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INTENSITY TECHNIQUES (MYO-REPS & DROP SETS) */}
      {/* ========================================================================= */}
      {activeTab === 'intensity_techniques' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-orange-400 font-bold">TECHNIQUE 1</span>
              <span className="text-[10px] font-mono bg-orange-950 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30">Time-Saver</span>
            </div>
            <h4 className="text-base font-bold text-white">Myo-Reps Protocol</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Best for side delts, arms, and calves. Eliminates useless warm-up reps and keeps motor units recruited.
            </p>
            <div className="bg-black/50 p-3 rounded-lg border border-white/5 font-mono text-[11px] space-y-1 text-zinc-300">
              <p><strong className="text-white">Activation Set:</strong> 12-15 reps @ RIR 0-1</p>
              <p><strong className="text-white">Rest:</strong> 5 deep breaths (15-20 secs)</p>
              <p><strong className="text-white">Mini-Sets:</strong> 4 sets of 3-4 reps with 15s rest</p>
            </div>
          </div>

          <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-cyan-400 font-bold">TECHNIQUE 2</span>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">Joint Friendly</span>
            </div>
            <h4 className="text-base font-bold text-white">Mechanical Drop-Sets</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Instead of dropping weight, shift biomechanics from your weakest leverage to your strongest leverage without resting.
            </p>
            <div className="bg-black/50 p-3 rounded-lg border border-white/5 font-mono text-[11px] space-y-1 text-zinc-300">
              <p><strong className="text-white">Phase 1:</strong> Incline DB Fly to failure</p>
              <p><strong className="text-white">Phase 2:</strong> Shift to Incline DB Press</p>
              <p><strong className="text-white">Phase 3:</strong> Shift to Flat Neutral Press</p>
            </div>
          </div>

          <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-purple-400 font-bold">TECHNIQUE 3</span>
              <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">Max Tension</span>
            </div>
            <h4 className="text-base font-bold text-white">Long-Length Partials</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              When full range of motion fails near concentric lockout, continue repping in the bottom stretched half of the movement.
            </p>
            <div className="bg-black/50 p-3 rounded-lg border border-white/5 font-mono text-[11px] space-y-1 text-zinc-300">
              <p><strong className="text-white">Rule:</strong> Stop before mid-point contraction</p>
              <p><strong className="text-white">Reps:</strong> 4-6 partials in full stretch</p>
              <p><strong className="text-white">Best Exercises:</strong> Lat pulldowns, leg extensions</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
