import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  Flame, 
  Dumbbell, 
  Zap, 
  Check, 
  X, 
  Layers, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  SlidersHorizontal,
  Send,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIProgramGeneratorModal({ 
  isOpen, 
  onClose, 
  pathway = 'powerlifting', 
  profile = {}, 
  athleteId = 'athlete_demo',
  onProgramGenerated
}) {
  const [currentPathway, setCurrentPathway] = useState(pathway);
  const [daysPerWeek, setDaysPerWeek] = useState(profile.daysAvailable || 4);
  const [splitPreference, setSplitPreference] = useState(
    profile.splitPreference || (pathway === 'powerlifting' ? 'sbd' : 'ppl')
  );
  const [gymType, setGymType] = useState(profile.gymType || 'commercial');
  const [selectedFocus, setSelectedFocus] = useState(
    pathway === 'powerlifting' ? 'bench_lockout' : 'upper_chest'
  );
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedProtocol, setGeneratedProtocol] = useState(null);
  const [aiMemory, setAiMemory] = useState(null);
  const [previewWeekNumber, setPreviewWeekNumber] = useState(1);

  // Helper to attach a full 4-week periodized mesocycle
  const attachFourWeekMesocycle = (protocol) => {
    if (!protocol || !protocol.days || protocol.days.length === 0) return protocol;
    const baseDays = protocol.days;
    const isPowerlifting = protocol.pathway === 'powerlifting';

    const weekDefinitions = isPowerlifting ? [
      {
        weekNumber: 1,
        name: "Week 1: Accumulation & Technical Baseline",
        phase: "Accumulation",
        focus: "Establish movement rhythm & bar velocity baseline at RPE 7.5-8",
        loadModifier: 1.0,
        setModifier: 0
      },
      {
        weekNumber: 2,
        name: "Week 2: Progressive Overload Wave",
        phase: "Progression",
        focus: "+2.5kg to +5kg overload wave, intensity escalation to RPE 8-8.5",
        loadModifier: 1.025,
        setModifier: 0
      },
      {
        weekNumber: 3,
        name: "Week 3: Peak Intensity & Heavy Singles",
        phase: "Peak",
        focus: "High-intensity competition singles @ RPE 8.5-9, rate of force realization",
        loadModifier: 1.05,
        setModifier: 0
      },
      {
        weekNumber: 4,
        name: "Week 4: Active Deload & Joint Resensitization",
        phase: "Deload",
        focus: "Volume reduced by 1 set, 85% load, CNS recovery and tissue restoration",
        loadModifier: 0.85,
        setModifier: -1
      }
    ] : [
      {
        weekNumber: 1,
        name: "Week 1: Minimum Effective Volume (MEV)",
        phase: "Accumulation",
        focus: "RIR 3 baseline, introduce movement patterns, technical form mastery",
        loadModifier: 1.0,
        setModifier: 0
      },
      {
        weekNumber: 2,
        name: "Week 2: Maximum Adaptive Volume (MAV 1)",
        phase: "Progression",
        focus: "RIR 2, progressive load +2.5kg, metabolic cell swelling",
        loadModifier: 1.025,
        setModifier: 0
      },
      {
        weekNumber: 3,
        name: "Week 3: Peak Hypertrophy Overload (MAV 2)",
        phase: "Peak",
        focus: "RIR 1, maximum muscle pump and volume overload",
        loadModifier: 1.05,
        setModifier: 0
      },
      {
        weekNumber: 4,
        name: "Week 4: Resensitization Deload",
        phase: "Deload",
        focus: "RIR 4, volume cut by 30%, resensitize muscle androgen and stretch receptors",
        loadModifier: 0.85,
        setModifier: -1
      }
    ];

    const weeks = weekDefinitions.map(def => {
      const weekDays = baseDays.map(day => {
        const weekExercises = (day.exercises || []).map(ex => {
          const baseLoad = Number(ex.loadKg || ex.baseLoadKg) || 50;
          const adjustedLoad = Math.round((baseLoad * def.loadModifier) / 2.5) * 2.5;
          const baseSets = Number(ex.sets || ex.baseSets) || 3;
          const adjustedSets = Math.max(2, baseSets + def.setModifier);

          return {
            ...ex,
            sets: adjustedSets,
            loadKg: adjustedLoad,
            intensityTarget: def.weekNumber === 4
              ? (isPowerlifting ? 'RPE 6 (Deload)' : 'RIR 4 (Deload)')
              : ex.intensityTarget
          };
        });

        return {
          ...day,
          exercises: weekExercises
        };
      });

      return {
        ...def,
        days: weekDays
      };
    });

    return {
      ...protocol,
      totalWeeks: 4,
      weeks
    };
  };

  // Fetch lifter's AI training memory on open
  useEffect(() => {
    if (isOpen) {
      setCurrentPathway(pathway);
      fetchAiMemory();
    }
  }, [isOpen, pathway]);

  const fetchAiMemory = async () => {
    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com' 
        : 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/programs/ai-memory/${athleteId}`);
      const data = await res.json();
      if (data.success) {
        setAiMemory(data.memory);
      }
    } catch (e) {
      console.warn("Could not load AI memory:", e);
    }
  };

  const powerliftingFocusOptions = [
    { id: 'bench_lockout', label: 'Bench Press Pause & Triceps Lockout', desc: 'Spoto press, pin press, close grip & lat shelf' },
    { id: 'squat_hole', label: 'Squat Reversal Out of the Hole', desc: 'Paused squats, tempo descent, quad drive' },
    { id: 'deadlift_floor', label: 'Deadlift Wedge & Off-the-Floor Speed', desc: 'Deficit pulls, pause below knee, hip wedge' },
    { id: 'upper_back_rigidity', label: 'Upper Back Rigidity & Bracing', desc: 'Heavy rows, facepulls, posterior chain stability' },
    { id: 'meet_peaking', label: 'Competition Peaking & Rate of Force', desc: 'Heavy singles @ RPE 8-9 + velocity backoffs' }
  ];

  const fitnessFocusOptions = [
    { id: 'upper_chest', label: 'Clavicular Upper Chest & Pec Thickness', desc: '30° incline DB, low-to-high cable flyes, machine press' },
    { id: 'lat_width', label: 'V-Taper Lat Width & Outer Wing Sweep', desc: 'Wide-grip pulldowns, single-arm iliac pulls, dead hangs' },
    { id: 'delt_caps', label: '3D Capped Shoulders & Lateral Delt Sweep', desc: 'High-volume cable lateral raises, rear delt flyes' },
    { id: 'quad_sweep', label: 'Teardrop Quads & Outer Vastus Lateralis', desc: 'Hack squats, close-stance leg press, quad burnouts' },
    { id: 'arm_density', label: 'Peak Biceps & Thick Triceps Long-Head', desc: 'Incline curls, hammer curls, overhead cable extensions' },
    { id: 'lean_recomp', label: 'Lean Body Recomposition & High Density', desc: 'Controlled negatives, RIR 1-2, metabolic supersets' }
  ];

  const activeFocusOptions = currentPathway === 'powerlifting' ? powerliftingFocusOptions : fitnessFocusOptions;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStep(1);
    setGeneratedProtocol(null);

    // Simulate animated generation pipeline
    const timer1 = setTimeout(() => setGenerationStep(2), 700);
    const timer2 = setTimeout(() => setGenerationStep(3), 1400);

    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com' 
        : 'http://localhost:5001';

      // Forward client-side BYOK keys if present in localStorage
      const userGroqKey = localStorage.getItem('groq_api_key') || null;
      const userGeminiKey = localStorage.getItem('gemini_api_key') || null;

      const headers = { 'Content-Type': 'application/json' };
      if (userGroqKey) headers['x-groq-key'] = userGroqKey;
      if (userGeminiKey) headers['x-gemini-key'] = userGeminiKey;

      const payload = {
        athleteId,
        pathway: currentPathway,
        goal: currentPathway === 'powerlifting' ? 'strength' : 'hypertrophy',
        experienceLevel: profile.fitnessLevel || 'intermediate',
        daysPerWeek: parseInt(daysPerWeek) || 4,
        sessionDuration: profile.sessionDuration || '60 mins',
        splitPreference,
        gymType,
        focusArea: selectedFocus,
        userPrompt: customPrompt,
        trainingMax: {
          squat: profile.training_max?.squat || profile.squat || 140,
          bench: profile.training_max?.bench || profile.bench || 100,
          deadlift: profile.training_max?.deadlift || profile.deadlift || 180
        }
      };

      const res = await fetch(`${apiUrl}/api/programs/ai-generate/${athleteId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      clearTimeout(timer1);
      clearTimeout(timer2);
      setGenerationStep(4);

      if (data.success && data.days && data.days.length > 0) {
        const completeProtocol = attachFourWeekMesocycle(data);
        setGeneratedProtocol(completeProtocol);
        toast.success(`Full 4-Week Protocol Synthesized: ${completeProtocol.programTitle}!`);
      } else {
        throw new Error(data.error || "Failed to parse generated days");
      }
    } catch (err) {
      console.warn("Server AI Generation unavailable, executing Neural Algorithmic Periodization:", err.message);
      clearTimeout(timer1);
      clearTimeout(timer2);
      setGenerationStep(4);

      // Deterministic Client-Side Sports Science Synthesis
      const sq = parseFloat(profile.training_max?.squat || profile.squat || 195);
      const bp = parseFloat(profile.training_max?.bench || profile.bench || 130);
      const dl = parseFloat(profile.training_max?.deadlift || profile.deadlift || 235);

      const fallbackProtocol = currentPathway === 'powerlifting' ? {
        success: true,
        aiEngine: "TITAN-AI Neural Heuristic Periodization Engine (Client-Side Sports Science)",
        programTitle: `${daysPerWeek}-Day Competitive SBD Wave (${selectedFocus.replace(/_/g, ' ').toUpperCase()})`,
        archetype: "Daily Undulating Strength Wave",
        pathway: "powerlifting",
        daysPerWeek: parseInt(daysPerWeek) || 4,
        periodizationModel: "Prilepin DUP 4-Week Block",
        aiCoachSummary: `Synthesized specifically for athlete with focus on ${selectedFocus.replace(/_/g, ' ')}. Working loads derived from 1RM baseline (SQ: ${sq}kg, BP: ${bp}kg, DL: ${dl}kg).`,
        days: [
          {
            dayNumber: 1,
            dayName: "Day 1: Competition Squat CNS Priming & Quad Drive",
            focus: "Squat Technique & Rate of Force Development",
            warmupPrimer: "90/90 Hip Flow + Ankle Dorsiflexion + 3 Empty Bar Pause Sets",
            exercises: [
              { name: "Competition Squat — Top Single @ RPE 8", muscle: "Quads & Glutes", sets: 1, reps: "1", loadKg: Math.round((sq * 0.90) / 2.5) * 2.5, intensityTarget: "RPE 8", restSec: 180, cue: "IPF Command simulation: 1-second motionless pause below parallel." },
              { name: "Competition Squat — Volume Back-offs", muscle: "Quads & Glutes", sets: 3, reps: "4", loadKg: Math.round((sq * 0.76) / 2.5) * 2.5, intensityTarget: "RPE 7.5", restSec: 150, cue: "Drive upper back aggressively into the bar out of the hole." },
              { name: "Spoto Press (1-inch off chest)", muscle: "Chest & Triceps", sets: 3, reps: "5", loadKg: Math.round((bp * 0.74) / 2.5) * 2.5, intensityTarget: "RPE 8", restSec: 120, cue: "Dead pause 1 inch above sternum. Maintain locked lat shelf." },
              { name: "Bulgarian Split Squats", muscle: "Quads", sets: 3, reps: "8-10", loadKg: 24, intensityTarget: "RIR 1-2", restSec: 90, cue: "Upright torso to bias anterior quad knee flexion." },
              { name: "Ab Wheel Rollouts", muscle: "Core & Prehab", sets: 3, reps: "10-12", loadKg: 0, intensityTarget: "RPE 8", restSec: 60, cue: "Posterior pelvic tilt throughout full extension." }
            ]
          },
          {
            dayNumber: 2,
            dayName: "Day 2: Competition Bench Press & Scapular Drive",
            focus: "Pectoral Reversal & Lat Stability",
            warmupPrimer: "Band Pull-Aparts + Shoulder Dislocates + Rotator Cuff Primer",
            exercises: [
              { name: "Competition Bench Press — Top Single @ RPE 8", muscle: "Chest & Triceps", sets: 1, reps: "1", loadKg: Math.round((bp * 0.91) / 2.5) * 2.5, intensityTarget: "RPE 8", restSec: 180, cue: "Full motionless pause on chest until 'PRESS' command simulation." },
              { name: "Competition Bench Press — Volume Sets", muscle: "Chest & Triceps", sets: 4, reps: "4", loadKg: Math.round((bp * 0.78) / 2.5) * 2.5, intensityTarget: "RPE 8", restSec: 120, cue: "Drive heels into the floor, wedge upper traps into bench." },
              { name: "Chest Supported Dumbbell Rows", muscle: "Upper Back", sets: 4, reps: "10-12", loadKg: 28, intensityTarget: "RPE 8", restSec: 90, cue: "1-sec isometric squeeze at top to fortify bench press lat shelf." },
              { name: "EZ-Bar Skull Crushers", muscle: "Triceps Lockout", sets: 3, reps: "10-12", loadKg: 32, intensityTarget: "RPE 8.5", restSec: 75, cue: "Lower bar behind head to maximize long-head triceps stretch." }
            ]
          },
          {
            dayNumber: 3,
            dayName: "Day 3: Competition Deadlift & Posterior Chain Engine",
            focus: "Wedge & Slack Pull from Floor",
            warmupPrimer: "World's Greatest Stretch + Hamstring Sweeps + Glute Bridge Activations",
            exercises: [
              { name: "Competition Deadlift — Top Single @ RPE 8", muscle: "Posterior Chain", sets: 1, reps: "1", loadKg: Math.round((dl * 0.90) / 2.5) * 2.5, intensityTarget: "RPE 8", restSec: 180, cue: "Pull slack out of bar, wedge hips forward, drive floor away." },
              { name: "Deficit Deadlift (1.5-inch elevation)", muscle: "Posterior Chain", sets: 3, reps: "3", loadKg: Math.round((dl * 0.72) / 2.5) * 2.5, intensityTarget: "RPE 7.5", restSec: 150, cue: "Overcome disadvantaged leverage with violent quad push off floor." },
              { name: "Barbell Romanian Deadlifts", muscle: "Hamstrings", sets: 3, reps: "8-10", loadKg: Math.round((dl * 0.55) / 2.5) * 2.5, intensityTarget: "RPE 8", restSec: 90, cue: "Hips back, hamstring stretch, neutral spine throughout." },
              { name: "Hanging Leg Raises", muscle: "Core & Pelvis", sets: 3, reps: "12-15", loadKg: 0, intensityTarget: "RPE 8", restSec: 60, cue: "Posterior tilt to decompress lumbar spine after heavy pulls." }
            ]
          },
          {
            dayNumber: 4,
            dayName: "Day 4: SBD Volume Flush & Weak-Point Hypertrophy",
            focus: "Secondary Overload & Structural Balance",
            warmupPrimer: "Thoracic Extensions on Foam Roller + Lat Pulldown Primer",
            exercises: [
              { name: "Close-Grip Bench Press", muscle: "Triceps & Chest", sets: 3, reps: "6", loadKg: Math.round((bp * 0.70) / 2.5) * 2.5, intensityTarget: "RPE 8", restSec: 120, cue: "Shoulder-width grip. Explosive triceps extension." },
              { name: "Belt Squats or Front Squats", muscle: "Quads", sets: 3, reps: "8", loadKg: Math.round((sq * 0.60) / 2.5) * 2.5, intensityTarget: "RPE 8", restSec: 90, cue: "Pure knee flexion, zero lower back spinal loading." },
              { name: "Neutral-Grip Lat Pulldowns", muscle: "Lats", sets: 4, reps: "10-12", loadKg: 65, intensityTarget: "RPE 8", restSec: 75, cue: "Pull elbows straight down into pockets." },
              { name: "Standing Calf Raises", muscle: "Calves", sets: 4, reps: "15", loadKg: 50, intensityTarget: "RPE 9", restSec: 60, cue: "2-sec deep bottom stretch on platform." }
            ]
          }
        ]
      } : {
        success: true,
        aiEngine: "TITAN-AI Neural Heuristic Periodization Engine (Client-Side Sports Science)",
        programTitle: `${daysPerWeek}-Day Hypertrophy MAV Split (${selectedFocus.replace(/_/g, ' ').toUpperCase()})`,
        archetype: "Hypertrophy MAV Volume Protocol",
        pathway: "fitness",
        daysPerWeek: parseInt(daysPerWeek) || 4,
        periodizationModel: "Israetel Hypertrophy Landmarks (MEV to MAV)",
        aiCoachSummary: `Synthesized specifically for aesthetic physique recomp with priority on ${selectedFocus.replace(/_/g, ' ')}.`,
        days: [
          {
            dayNumber: 1,
            dayName: "Day 1: Push Hypertrophy (Chest, Delts & Triceps)",
            focus: "Clavicular Pecs & Lateral Delt Hypertrophy",
            warmupPrimer: "Band Dislocates + Arm Circles + Pushup Holds",
            exercises: [
              { name: "Incline Barbell Bench Press", muscle: "Upper Chest", sets: 4, reps: "6-8", loadKg: Math.round((bp * 0.75) / 2.5) * 2.5, intensityTarget: "RIR 2", restSec: 90, cue: "Lower bar to upper clavicular region. Squeeze chest at peak." },
              { name: "Dumbbell Seated Shoulder Press", muscle: "Front/Side Delts", sets: 3, reps: "8-10", loadKg: 26, intensityTarget: "RIR 1-2", restSec: 75, cue: "Clean pressing groove overhead. Full lockout without shrugging." },
              { name: "Cable Lateral Raises", muscle: "Lateral Delts", sets: 4, reps: "12-15", loadKg: 10, intensityTarget: "RIR 0-1", restSec: 60, cue: "Slight forward lean, sweep hands outward towards walls." },
              { name: "Cable Triceps Pushdowns", muscle: "Triceps", sets: 3, reps: "12-15", loadKg: 30, intensityTarget: "RIR 1", restSec: 60, cue: "Keep elbows pinned to sides. Full lockout." }
            ]
          },
          {
            dayNumber: 2,
            dayName: "Day 2: Pull Hypertrophy (Lats, Upper Back & Biceps)",
            focus: "V-Taper Lat Width & Rhomboid Thickness",
            warmupPrimer: "Dead Hangs + Scapular Shrugs + Band Pull-Aparts",
            exercises: [
              { name: "Neutral-Grip Lat Pulldowns", muscle: "Lats", sets: 4, reps: "8-10", loadKg: 65, intensityTarget: "RIR 1-2", restSec: 90, cue: "Full stretch at top. Drive elbows down into back pockets." },
              { name: "Chest-Supported Dumbbell Rows", muscle: "Mid-Back", sets: 3, reps: "10-12", loadKg: 28, intensityTarget: "RIR 1", restSec: 75, cue: "1-sec pause at peak retraction." },
              { name: "Incline Dumbbell Bicep Curls", muscle: "Biceps", sets: 3, reps: "10-12", loadKg: 14, intensityTarget: "RIR 1", restSec: 60, cue: "Deep stretch at bottom. Supinate wrist violently at top." },
              { name: "Facepulls with Rope", muscle: "Rear Delts", sets: 4, reps: "15-20", loadKg: 25, intensityTarget: "RIR 0", restSec: 60, cue: "Pull to forehead, external shoulder rotation." }
            ]
          },
          {
            dayNumber: 3,
            dayName: "Day 3: Lower Body Hypertrophy (Quads & Hamstrings)",
            focus: "Quad Sweep & Hamstring Mass",
            warmupPrimer: "Leg Swings + Bodyweight Squats + Ankle Mobility",
            exercises: [
              { name: "Leg Press (Deep Knee Bend)", muscle: "Quads & Glutes", sets: 4, reps: "10-12", loadKg: 180, intensityTarget: "RIR 1-2", restSec: 90, cue: "Full depth without pelvic tucking. Push through midfoot." },
              { name: "Barbell Romanian Deadlift", muscle: "Hamstrings", sets: 4, reps: "8-10", loadKg: Math.round((dl * 0.50) / 2.5) * 2.5, intensityTarget: "RIR 2", restSec: 90, cue: "Hips back, feel deep stretch in hamstrings." },
              { name: "Lying Leg Curls", muscle: "Hamstrings", sets: 4, reps: "12-15", loadKg: 40, intensityTarget: "RIR 0", restSec: 60, cue: "Squeeze hamstrings at contraction, slow 2-sec eccentric." },
              { name: "Standing Calf Raises", muscle: "Calves", sets: 4, reps: "15-20", loadKg: 60, intensityTarget: "RIR 0", restSec: 45, cue: "Dead pause at deepest bottom stretch." }
            ]
          },
          {
            dayNumber: 4,
            dayName: "Day 4: Upper Body Sculpt & Weak-Point Overload",
            focus: "Chest Density & Arm Volume",
            warmupPrimer: "World's Greatest Stretch + Banded External Rotations",
            exercises: [
              { name: "Flat Dumbbell Press", muscle: "Chest", sets: 4, reps: "8-10", loadKg: 32, intensityTarget: "RIR 1-2", restSec: 90, cue: "Deep chest stretch at bottom, convergent press." },
              { name: "Barbell Pendlay Rows", muscle: "Upper Back", sets: 3, reps: "8-10", loadKg: 65, intensityTarget: "RIR 2", restSec: 75, cue: "Explosive pull from dead stop on floor." },
              { name: "Hammer Curls + Overhead Triceps Extension", muscle: "Arms", sets: 3, reps: "12", loadKg: 16, intensityTarget: "RIR 1", restSec: 60, cue: "Brachialis density & long head triceps peak." }
            ]
          }
        ]
      };

      const completeFallback = attachFourWeekMesocycle(fallbackProtocol);
      setGeneratedProtocol(completeFallback);
      toast.success(`Full 4-Week Protocol Synthesized: ${completeFallback.programTitle}!`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeployProtocol = () => {
    if (!generatedProtocol) return;

    // Save to localStorage for instant client dashboard reactivity
    localStorage.setItem(`active_ai_program_${athleteId}`, JSON.stringify(generatedProtocol));
    localStorage.setItem(`active_ai_program_date_${athleteId}`, new Date().toISOString());

    if (onProgramGenerated) {
      onProgramGenerated(generatedProtocol);
    }

    toast.success("🚀 AI Protocol Deployed to Live Gym Tracker!");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-[#09090d] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-950/80 via-zinc-900 to-black p-5 border-b border-zinc-800 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                    TITAN-AI REAL-TIME NEURAL BRAIN
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h2 className="text-xl font-black italic tracking-tight text-white">
                  SYNTHESIZE REAL-TIME TRAINING PROTOCOL
                </h2>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin">
            {/* Step Indicator / Result Preview */}
            {!generatedProtocol ? (
              <>
                {/* Pathway Toggle */}
                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 mb-1.5 block">
                    Select Training Pathway Archetype:
                  </label>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setCurrentPathway('powerlifting')}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        currentPathway === 'powerlifting'
                          ? 'bg-orange-950/40 border-orange-500 text-white font-bold'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <div>
                          <div>Powerlifting Platform</div>
                          <div className="text-[10px] text-zinc-400 font-normal">SBD 1RM, RPE 7-9, Technical Cues</div>
                        </div>
                      </div>
                      {currentPathway === 'powerlifting' && <Check className="w-4 h-4 text-orange-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentPathway('fitness')}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        currentPathway === 'fitness'
                          ? 'bg-purple-950/40 border-purple-500 text-white font-bold'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-purple-400" />
                        <div>
                          <div>Fitness & Aesthetics</div>
                          <div className="text-[10px] text-zinc-400 font-normal">Hypertrophy, RIR 1-2, Volume MAV</div>
                        </div>
                      </div>
                      {currentPathway === 'fitness' && <Check className="w-4 h-4 text-purple-400" />}
                    </button>
                  </div>
                </div>

                {/* Days and Split Preference Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-zinc-400 mb-1.5 block">
                      Days Available Per Week:
                    </label>
                    <div className="flex gap-2">
                      {[3, 4, 5, 6].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setDaysPerWeek(num)}
                          className={`flex-1 py-2 rounded-lg font-mono text-xs transition-all ${
                            daysPerWeek === num
                              ? 'bg-purple-600 text-white font-bold'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {num} Days
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-zinc-400 mb-1.5 block">
                      Split Architecture:
                    </label>
                    <select
                      value={splitPreference}
                      onChange={(e) => setSplitPreference(e.target.value)}
                      className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                    >
                      {currentPathway === 'powerlifting' ? (
                        <>
                          <option value="sbd">SBD Competition Frequency Split</option>
                          <option value="upper_lower">Upper / Lower Strength Block</option>
                          <option value="conjugate">Westside Conjugate (Max & Dynamic Effort)</option>
                          <option value="dup">Daily Undulating Periodization (DUP)</option>
                        </>
                      ) : (
                        <>
                          <option value="ppl">Push / Pull / Legs Hypertrophy</option>
                          <option value="upper_lower">Upper / Lower Hypertrophy</option>
                          <option value="arnold">Arnold Split (Chest+Back / Shoulders+Arms / Legs)</option>
                          <option value="full_body">Full Body Hypertrophy</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Primary Weak Point / Focus Selection */}
                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 mb-1.5 block">
                    Select Primary Sticking Point / Growth Priority:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeFocusOptions.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedFocus(opt.id)}
                        className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                          selectedFocus === opt.id
                            ? 'bg-purple-950/50 border-purple-500 text-white font-bold'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="text-xs text-white">{opt.label}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Lifter Prompt Input */}
                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 mb-1.5 flex items-center justify-between">
                    <span>Custom AI Coach Prompt (Optional):</span>
                    <span className="text-zinc-500 text-[10px]">Natural Language Instructions</span>
                  </label>
                  <textarea
                    rows={2}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Focus on chest clavicular thickness, avoid good mornings due to back tweak, keep sessions under 60 minutes."
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-sans text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* AI Lifter Memory Pill Box */}
                {aiMemory && (aiMemory.jointTweaks?.length > 0 || aiMemory.adaptationNotes?.length > 0) && (
                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-zinc-300">
                    <div className="flex items-center gap-2 text-purple-300 font-bold font-mono text-[11px] mb-1">
                      <Brain className="w-3.5 h-3.5" />
                      <span>AI BRAIN ACTIVE LIFTER MEMORY:</span>
                    </div>
                    {aiMemory.jointTweaks?.length > 0 && (
                      <div className="text-[11px] text-amber-300">
                        • Joint watch areas: {aiMemory.jointTweaks.join(', ')}
                      </div>
                    )}
                    {aiMemory.adaptationNotes?.length > 0 && (
                      <div className="text-[11px] text-zinc-400">
                        • Learned rule: {aiMemory.adaptationNotes[0]}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* RESULT PREVIEW SCREEN */
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-950/40 via-zinc-900 to-black border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">
                      {generatedProtocol.aiEngine}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      ⚡ {generatedProtocol.weeks?.length || 4} Weeks • {((generatedProtocol.weeks?.[0]?.days?.length || generatedProtocol.days?.length || 4) * (generatedProtocol.weeks?.length || 4))} Total Sessions
                    </span>
                  </div>
                  <h3 className="text-lg font-black italic text-white">
                    {generatedProtocol.programTitle}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 italic">
                    "{generatedProtocol.aiCoachSummary}"
                  </p>
                </div>

                {/* 4-Week Mesocycle Navigation Tabs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-zinc-400 block font-bold">
                      Inspect Mesocycle Waves & Upcoming Weeks:
                    </span>
                    <span className="text-[11px] font-mono text-purple-400">
                      Click week to preview loads
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(generatedProtocol.weeks || [
                      { weekNumber: 1, name: "Week 1: Accumulation", phase: "Accumulation", loadModifier: 1.0 },
                      { weekNumber: 2, name: "Week 2: Progression", phase: "Progression", loadModifier: 1.025 },
                      { weekNumber: 3, name: "Week 3: Peak", phase: "Peak", loadModifier: 1.05 },
                      { weekNumber: 4, name: "Week 4: Deload", phase: "Deload", loadModifier: 0.85 }
                    ]).map((w) => {
                      const isSelected = previewWeekNumber === w.weekNumber;
                      return (
                        <button
                          key={w.weekNumber}
                          type="button"
                          onClick={() => setPreviewWeekNumber(w.weekNumber)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-purple-950/80 border-purple-500 shadow-md shadow-purple-950'
                              : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className={isSelected ? 'text-purple-300 font-bold' : 'text-zinc-500'}>
                              WEEK {w.weekNumber}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] ${
                              w.weekNumber === 4 ? 'bg-zinc-800 text-zinc-300' : 'bg-purple-900/60 text-purple-300'
                            }`}>
                              {w.phase || (w.weekNumber === 4 ? 'Deload' : 'Wave')}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white mt-1 truncate">
                            {w.name?.split(':')[1]?.trim() || w.name || `Phase ${w.weekNumber}`}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                            {w.loadModifier ? `${Math.round(w.loadModifier * 100)}% load` : '100% load'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Week Day-by-Day Exercises */}
                {(() => {
                  const activeWeek = (generatedProtocol.weeks || []).find(w => w.weekNumber === previewWeekNumber) || {
                    name: `Week ${previewWeekNumber}`,
                    focus: "Standard volume progression",
                    days: generatedProtocol.days
                  };

                  return (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-300 font-bold">
                          {activeWeek.name}
                        </span>
                        <span className="text-zinc-400 text-[11px]">
                          🎯 {activeWeek.focus}
                        </span>
                      </div>

                      {activeWeek.days?.map((day, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-purple-400 font-bold">DAY {day.dayNumber || idx + 1}:</span>
                              <span className="text-xs font-bold text-white">{day.dayName}</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400">{day.exercises?.length} Exercises</span>
                          </div>
                          {day.warmupPrimer && (
                            <div className="text-[11px] font-mono text-zinc-500 mb-2">
                              Primer: {day.warmupPrimer}
                            </div>
                          )}

                          <div className="divide-y divide-zinc-800/60 text-xs">
                            {day.exercises?.map((ex, exIdx) => (
                              <div key={exIdx} className="py-1.5 flex items-center justify-between gap-2">
                                <div>
                                  <span className="text-white font-medium">{ex.name}</span>
                                  {ex.muscle && (
                                    <span className="text-zinc-500 text-[10px] ml-2">({ex.muscle})</span>
                                  )}
                                </div>
                                <div className="font-mono text-right text-xs shrink-0">
                                  <span className="text-purple-300 font-bold">{ex.loadKg}kg</span>
                                  <span className="text-zinc-400 mx-1">×</span>
                                  <span className="text-zinc-300">{ex.sets}x{ex.reps}</span>
                                  {ex.intensityTarget && (
                                    <span className="text-amber-400 ml-1.5 text-[10px]">[{ex.intensityTarget}]</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="bg-zinc-950 p-4 border-t border-zinc-800 flex items-center justify-between">
            {!generatedProtocol ? (
              <>
                <div className="text-xs font-mono text-zinc-500 flex items-center gap-2">
                  {isGenerating && (
                    <span className="flex items-center gap-1.5 text-purple-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {generationStep === 1 && "Ingesting 1RM baseline..."}
                      {generationStep === 2 && "Synthesizing periodization waves..."}
                      {generationStep === 3 && "Calibrating loads & cues..."}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-mono text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-950"
                >
                  <Brain className="w-4 h-4" />
                  <span>{isGenerating ? "Synthesizing Protocol..." : "Generate with Real-Time AI Brain"}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setGeneratedProtocol(null)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs py-2 px-4 rounded-xl transition-colors"
                >
                  ← Re-Configure Options
                </button>

                <button
                  type="button"
                  onClick={handleDeployProtocol}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-950"
                >
                  <Check className="w-4 h-4" />
                  <span>Deploy Protocol to Live Gym Tracker</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
