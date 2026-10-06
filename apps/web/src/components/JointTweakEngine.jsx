/**
 * JointTweakEngine.jsx - Smart Injury Workaround & Biomechanical Exercise Swap Engine
 * Real-time clinical biomechanics: Replaces aggravating exercises with safe joint-friendly alternatives
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Activity, 
  ArrowRightLeft, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Dumbbell, 
  RefreshCw, 
  Flame, 
  AlertTriangle,
  HeartPulse,
  Info,
  ChevronRight,
  Zap,
  Play
} from 'lucide-react';
import { toast } from 'sonner';

// Clinical Biomechanical Database of Tweaks and Substitutions
const TWEAK_DATABASE = {
  lower_back: {
    name: 'Lower Back & Lumbar Spine',
    icon: '🦴',
    commonCauses: 'Excessive lumbar flexion, anterior pelvic tilt under load, fatigue breakdown in spinal erectors.',
    protocols: [
      { name: 'McGill Big 3 (Bird-Dog & Curl-up)', time: '3 Mins', reps: '3 sets of 5 reps per side' },
      { name: 'Passive Decompression Hang', time: '90 Secs', reps: '2 x 45s hanging from pull-up bar' },
      { name: 'Cat-Cow with Lumbar Segmentation', time: '2 Mins', reps: '10 slow undulating cycles' }
    ],
    lifts: {
      deadlift: {
        diagnosis: 'High shear force across L4-L5/L5-S1 disc spaces due to long moment arm from bar to hip axis.',
        recommendedRpeCap: 'RPE 6.5 (Strict non-failure)',
        loadAdjustment: '-20% from nominal target',
        swaps: [
          {
            name: 'Trap Bar Deadlift (High Handles)',
            advantage: 'Brings center of mass inside your base of support, reducing spinal shear stress by ~22%.',
            cue: 'Sit hips back, push floor away like a leg press, lock lats tight.',
            loadModifier: 0.85
          },
          {
            name: 'Chest-Supported Row / Seal Row',
            advantage: '100% spinal deloading. Keeps back completely flat on pad while maintaining posterior chain volume.',
            cue: 'Drive elbows to hips, hold 1-sec squeeze at top, no body swinging.',
            loadModifier: 0.60
          },
          {
            name: 'Neutral-Grip Dumbbell Romanian Deadlift (RDL)',
            advantage: 'Dumbbells travel alongside thighs instead of in front, significantly shortening the lumbar lever arm.',
            cue: 'Soft knees, push hips back to wall until hamstring stretch, stop before lower back rounds.',
            loadModifier: 0.70
          }
        ]
      },
      squat: {
        diagnosis: 'Spinal compressive load and pelvic "butt wink" causing lumbar facet joint impingement at bottom depth.',
        recommendedRpeCap: 'RPE 7.0',
        loadAdjustment: '-15% from nominal target',
        swaps: [
          {
            name: 'Safety Squat Bar (SSB) Box Squat',
            advantage: 'Forces upright thoracic posture and stops kinetic chain on box, avoiding lumbar tuck at depth.',
            cue: 'Sit back onto box softly, keep chest tall, explode off box without rocking.',
            loadModifier: 0.80
          },
          {
            name: 'Belt Squat',
            advantage: 'Puts 100% of the load on the pelvis/legs. Zero spinal compression or axial loading.',
            cue: 'Stay upright, grip handles for stability, focus entirely on quad drive.',
            loadModifier: 0.90
          },
          {
            name: 'Bulgarian Split Squat (Rear Foot Elevated)',
            advantage: 'Unilateral loading halves spinal load while providing equal or greater quad/glute stimulus.',
            cue: 'Slight forward lean, drop back knee straight down, drive through front heel.',
            loadModifier: 0.50
          }
        ]
      }
    }
  },
  shoulder: {
    name: 'Shoulder & Rotator Cuff',
    icon: '🦾',
    commonCauses: 'Subacromial impingement, excessive internal rotation, flare during eccentric bench press.',
    protocols: [
      { name: 'Banded Face Pulls with External Rotation', time: '2 Mins', reps: '2 sets of 15 reps' },
      { name: 'Sleeper Stretch / Cross-Body Stretch', time: '90 Secs', reps: '45s hold per side' },
      { name: 'Thoracic Extension on Foam Roller', time: '2 Mins', reps: '10 extensions with hands behind head' }
    ],
    lifts: {
      bench: {
        diagnosis: 'Extreme humeral extension beyond the rib cage pinches the supraspinatus tendon under the acromion.',
        recommendedRpeCap: 'RPE 7.0',
        loadAdjustment: '-15% from nominal target',
        swaps: [
          {
            name: 'Floor Press (Barbell or Dumbbell)',
            advantage: 'The floor acts as a natural hard stop for elbows at 90°, completely eliminating shoulder hyperextension.',
            cue: 'Rest triceps on floor for 1 second to dissipate stretch reflex, then drive up violently.',
            loadModifier: 0.85
          },
          {
            name: 'Swiss Bar / Neutral-Grip Dumbbell Press',
            advantage: 'Neutral grip (palms facing each other) opens up the subacromial space, removing tendon friction.',
            cue: 'Tuck elbows at 45°, squeeze dumbbells inward throughout the press.',
            loadModifier: 0.80
          },
          {
            name: 'Push-Up to Downward Dog (Loaded with Band/Weight)',
            advantage: 'Allows the scapula to rotate freely around the rib cage, unlike benching where scapulae are pinned down.',
            cue: 'Full protraction at top, reach into downward dog for serratus activation.',
            loadModifier: 0.50
          }
        ]
      },
      overhead: {
        diagnosis: 'Lack of upward scapular rotation causes acromion pinch when pressing vertically.',
        recommendedRpeCap: 'RPE 6.5',
        loadAdjustment: '-25% from nominal target',
        swaps: [
          {
            name: 'Half-Kneeling Landmine Press',
            advantage: 'Angled pressing vector (~60°) spares the rotator cuff while building heavy deltoid power.',
            cue: 'Lean forward into the press, reach at the top without shrugging the trap.',
            loadModifier: 0.75
          },
          {
            name: 'High Incline Neutral Dumbbell Press (70°)',
            advantage: 'Slight incline angle keeps the humerus in the scapular plane (scaption plane).',
            cue: 'Keep palms neutral, control the eccentric descent for 3 full seconds.',
            loadModifier: 0.70
          }
        ]
      }
    }
  },
  knee: {
    name: 'Knee & Patellar Tendon',
    icon: '🦵',
    commonCauses: 'Excessive anterior knee travel with quad dominance, knee valgus cave, tight rectus femoris.',
    protocols: [
      { name: 'Isometric Spanish Squat (Banded)', time: '3 Mins', reps: '4 x 45s holds (Proven patellar analgesia)' },
      { name: 'Reverse Sled Drag / Backward Treadmill Walking', time: '5 Mins', reps: 'Light continuous pump for synovial fluid' },
      { name: 'Couch Stretch (Quad & Hip Flexor)', time: '2 Mins', reps: '60s hold per side' }
    ],
    lifts: {
      squat: {
        diagnosis: 'High peak patellofemoral compressive force at deep flexion angles when shin angle is forward.',
        recommendedRpeCap: 'RPE 7.0',
        loadAdjustment: '-15% from nominal target',
        swaps: [
          {
            name: 'Low-Bar Box Squat with Vertical Shins',
            advantage: 'Shins stay perpendicular to the floor, shifting load entirely into the hips/hamstrings and 0 patellar shear.',
            cue: 'Push hips backward as far as possible, sit gently on box, keep shins vertical.',
            loadModifier: 0.85
          },
          {
            name: 'Romanian Deadlift (RDL) with 3s Eccentric',
            advantage: 'Replaces quad-dominant squatting with posterior chain hip hinge, giving patellar tendon complete rest.',
            cue: 'Feel deep stretch in hamstrings, squeeze glutes at lockout.',
            loadModifier: 0.80
          },
          {
            name: 'Leg Press with Feet High on Sled',
            advantage: 'High foot placement emphasizes hip flexion over knee flexion, dramatically reducing knee shear.',
            cue: 'Place feet near top edge of platform, descend only to 90 degrees.',
            loadModifier: 0.90
          }
        ]
      }
    }
  },
  elbow: {
    name: 'Elbow & Tricep Tendon',
    icon: '⚡',
    commonCauses: 'Tricep tendonitis from heavy skull crushers or excessive elbow flare on heavy bench presses.',
    protocols: [
      { name: 'Isometric Bicep Hammer Hold', time: '2 Mins', reps: '3 x 30s holds at 90° angle' },
      { name: 'Wrist Flexor / Extensor Eccentrics', time: '2 Mins', reps: '2 sets of 15 slow eccentric reps' },
      { name: 'Forearm Deep Tissue Rolling on Barbell', time: '90 Secs', reps: 'Roll brachioradialis along bar sleeve' }
    ],
    lifts: {
      bench: {
        diagnosis: 'Distal triceps tendon micro-tears aggravated by acute elbow flexion under heavy eccentric load.',
        recommendedRpeCap: 'RPE 7.0',
        loadAdjustment: '-15% from nominal target',
        swaps: [
          {
            name: 'Board Press / Spoto Press (2-3 Inches Above Chest)',
            advantage: 'Stops descent before maximum acute elbow flexion angle, keeping triceps in strongest range.',
            cue: 'Hover 2 inches off chest, hold 1 full second dead pause, drive back to lockout.',
            loadModifier: 0.90
          },
          {
            name: 'Dumbbell Neutral Bench Press with Chains / Bands',
            advantage: 'Allows wrists to rotate freely, reducing rotational torque through the distal humerus.',
            cue: 'Tuck elbows, smooth fluid movement without bouncing.',
            loadModifier: 0.80
          }
        ]
      }
    }
  },
  hip_adductor: {
    name: 'Hip Flexor & Adductor Groin',
    icon: '🎯',
    commonCauses: 'Overly wide stance squat or sumo deadlift pulling without sufficient hip external rotation mobility.',
    protocols: [
      { name: '90/90 Hip Mobility & Internal Rotation Lift-Offs', time: '3 Mins', reps: '8 controlled lift-offs per side' },
      { name: 'Copenhagen Plank (Adductor Activation)', time: '2 Mins', reps: '3 x 20s hold per side' },
      { name: 'Deep Goblet Squat Prying', time: '90 Secs', reps: 'Sit in bottom of goblet squat, push knees out' }
    ],
    lifts: {
      squat: {
        diagnosis: 'Adductor magnus strain aggravated by wide stance knee flare under maximal depth loading.',
        recommendedRpeCap: 'RPE 6.5',
        loadAdjustment: '-20% from nominal target',
        swaps: [
          {
            name: 'Narrow-Stance Heel-Elevated Goblet / Safety Bar Squat',
            advantage: 'Narrow stance moves the strain away from groin adductors directly into the quadricep belly.',
            cue: 'Feet shoulder-width apart, toes pointing forward or slight 10° angle.',
            loadModifier: 0.75
          },
          {
            name: 'Leg Press with Close Stance',
            advantage: 'Completely eliminates adductor stabilization requirements.',
            cue: 'Keep knees strictly in line with second toe, smooth controlled rhythm.',
            loadModifier: 0.85
          }
        ]
      },
      deadlift: {
        diagnosis: 'Sumo pull groin tweak: Adductor tendon avulsion risk during initial break from the floor.',
        recommendedRpeCap: 'RPE 7.0',
        loadAdjustment: '-15% from nominal target',
        swaps: [
          {
            name: 'Conventional Stance Deadlift (Narrow Stance)',
            advantage: 'Shifts all force production straight into hamstrings and spinal erectors, giving adductors zero stress.',
            cue: 'Feet hip-width, arms outside knees, push floor away.',
            loadModifier: 0.90
          },
          {
            name: 'Trap Bar Deadlift (Narrow Base)',
            advantage: 'Combines narrow stance safety with upright torso comfort.',
            cue: 'Grip high handles, squeeze lats, drive hips forward.',
            loadModifier: 0.90
          }
        ]
      }
    }
  }
};

export default function JointTweakEngine({ onApplySwap, currentExerciseName = 'Squat' }) {
  const [selectedJoint, setSelectedJoint] = useState('lower_back');
  const [selectedLift, setSelectedLift] = useState('squat');
  const [severity, setSeverity] = useState('tweak'); // 'mild_stiff' | 'tweak' | 'acute_pain'
  const [selectedSwapIdx, setSelectedSwapIdx] = useState(0);
  const [prehabTimer, setPrehabTimer] = useState(null);
  const [activePrehabStep, setActivePrehabStep] = useState(null);

  const jointData = TWEAK_DATABASE[selectedJoint] || TWEAK_DATABASE.lower_back;
  const availableLifts = Object.keys(jointData.lifts || {});
  
  // Ensure selected lift exists for selected joint
  const activeLiftKey = availableLifts.includes(selectedLift) ? selectedLift : availableLifts[0] || 'squat';
  const liftData = jointData.lifts?.[activeLiftKey] || Object.values(jointData.lifts || {})[0];
  const activeSwap = liftData?.swaps?.[selectedSwapIdx] || liftData?.swaps?.[0];

  const handleApplyToWorkout = () => {
    if (!activeSwap) return;
    
    if (onApplySwap) {
      onApplySwap({
        originalExercise: activeLiftKey.toUpperCase(),
        swappedExercise: activeSwap.name,
        rpeCap: liftData.recommendedRpeCap,
        loadModifier: activeSwap.loadModifier,
        cue: activeSwap.cue
      });
    }

    toast.success(`⚡ Swapped: ${activeSwap.name} applied to workout! Load adjusted to ${(activeSwap.loadModifier * 100).toFixed(0)}%`);
  };

  return (
    <div className="bg-zinc-950 rounded-2xl border border-red-500/20 p-5 md:p-7 shadow-2xl space-y-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-red-400 uppercase font-bold">CLINICAL PREHAB ENGINE</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-red-500" />
            Joint Tweak & Exercise Swap Matrix
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Never train through bad pain. Replace aggravating movements with biomechanically safe strength builders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Severity Selector */}
          <span className="text-[11px] font-mono text-zinc-400 uppercase">Severity:</span>
          {[
            { id: 'mild_stiff', label: 'Stiff', color: 'border-yellow-500/40 text-yellow-300 bg-yellow-950/40' },
            { id: 'tweak', label: 'Tweaked ⚠️', color: 'border-amber-500/50 text-amber-300 bg-amber-950/60' },
            { id: 'acute_pain', label: 'Sharp Pain 🚨', color: 'border-red-500/60 text-red-300 bg-red-950/80' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSeverity(s.id)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all ${
                severity === s.id ? `${s.color} ring-1 ring-white/20` : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Joint Selector Pills */}
      <div>
        <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2 font-bold">
          1. Select Problem Joint / Muscle Area:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {Object.entries(TWEAK_DATABASE).map(([key, data]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedJoint(key);
                setSelectedSwapIdx(0);
              }}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                selectedJoint === key
                  ? 'bg-red-950/40 border-red-500/60 text-white shadow-lg shadow-red-950/30'
                  : 'bg-zinc-900/70 border-white/5 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span className="text-xl">{data.icon}</span>
              <div>
                <p className="text-xs font-bold leading-tight text-white">{data.name.split('&')[0]}</p>
                <p className="text-[10px] font-mono text-zinc-500">{data.name.split('&')[1] || ''}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Scheduled Lift Selection */}
      <div>
        <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2 font-bold">
          2. What Lift Was Scheduled Today?
        </label>
        <div className="flex flex-wrap gap-2">
          {availableLifts.map((liftKey) => (
            <button
              key={liftKey}
              onClick={() => {
                setSelectedLift(liftKey);
                setSelectedSwapIdx(0);
              }}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 border ${
                activeLiftKey === liftKey
                  ? 'bg-red-600 text-white border-red-500 shadow-md'
                  : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>{liftKey}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Biomechanical Root Cause Diagnosis Card */}
      {liftData && (
        <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold">
                CLINICAL BIOMECHANICAL DIAGNOSIS
              </span>
              <p className="text-sm font-semibold text-zinc-200">
                {liftData.diagnosis}
              </p>
              <p className="text-xs text-zinc-400 italic">
                Primary Root Cause: {jointData.commonCauses}
              </p>
            </div>
            <div className="text-right whitespace-nowrap bg-black/40 px-3 py-2 rounded-lg border border-white/5 font-mono">
              <p className="text-[10px] text-zinc-500 uppercase">Prescribed Cap</p>
              <p className="text-xs font-bold text-amber-400">{liftData.recommendedRpeCap}</p>
              <p className="text-[10px] text-emerald-400">{liftData.loadAdjustment}</p>
            </div>
          </div>

          {/* Safe Substitutions Carousel / Selector */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2.5 font-bold">
              3. Select Safe Biomechanical Replacement ({liftData.swaps?.length} options):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {liftData.swaps?.map((swap, idx) => (
                <div
                  key={swap.name}
                  onClick={() => setSelectedSwapIdx(idx)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 relative ${
                    selectedSwapIdx === idx
                      ? 'bg-emerald-950/40 border-emerald-500/70 text-white shadow-lg'
                      : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {selectedSwapIdx === idx && (
                    <span className="absolute top-2.5 right-2.5 text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                    </span>
                  )}
                  <h4 className="text-sm font-bold text-white pr-12">{swap.name}</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">{swap.advantage}</p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[10px]">
                    <span className="text-cyan-400 font-bold">Load Factor: {(swap.loadModifier * 100).toFixed(0)}%</span>
                    <span className="text-zinc-500">Cue: {swap.cue.slice(0, 24)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Swap Deep Dive & Action Strip */}
          {activeSwap && (
            <div className="bg-black/60 rounded-xl border border-emerald-500/30 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">RECOMMENDED TECHNIQUE CUE</span>
                  <p className="text-sm font-bold text-white italic">"{activeSwap.cue}"</p>
                </div>

                <button
                  onClick={handleApplyToWorkout}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-950 active:scale-95 whitespace-nowrap justify-center"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>APPLY SWAP TO TODAY'S WORKOUT</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3-Minute Targeted Priming & Rehab Flow */}
      <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-pink-500" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              3-Step Clinical Priming Routine ({jointData.name})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">Do before loading the bar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {jointData.protocols.map((proto, idx) => (
            <div 
              key={proto.name}
              className="bg-black/40 border border-white/5 p-3.5 rounded-lg space-y-1 relative"
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-pink-400 font-bold">STEP {idx + 1} • {proto.time}</span>
              </div>
              <p className="text-xs font-bold text-white">{proto.name}</p>
              <p className="text-[11px] font-mono text-zinc-400">{proto.reps}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
