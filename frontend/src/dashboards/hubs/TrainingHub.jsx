import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Share2, 
  Check, 
  Dumbbell, 
  Sparkles, 
  Calendar, 
  History,
  Layers, 
  ArrowRight, 
  ChevronRight,
  Play,
  RotateCcw,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';
import WarmupLadderDrawer from '../../components/WarmupLadderDrawer';
import AthletePRShowcase from '../../components/AthletePRShowcase';

// Helper to attach a guaranteed 4-week periodized mesocycle
function attachFourWeekMesocycle(program, pathway) {
  if (!program) return program;
  const baseDays = program.days || [];
  const isPowerlifting = pathway === 'powerlifting' || program.pathway === 'powerlifting';

  // If already has 4 weeks and weeks have days, return program
  if (program.weeks && program.weeks.length === 4 && program.weeks[0]?.days?.length > 0) {
    return program;
  }

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
      focus: "+2.5kg to +5kg overload wave across compounds, intensity escalation to RPE 8-8.5",
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
      focus: "RIR 2, progressive load +2.5kg, metabolic cell swelling & muscle tension",
      loadModifier: 1.025,
      setModifier: 0
    },
    {
      weekNumber: 3,
      name: "Week 3: Peak Hypertrophy Overload (MAV 2)",
      phase: "Peak",
      focus: "RIR 1, maximum muscle pump and volume overload milestone",
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
            : (ex.intensityTarget || (isPowerlifting ? 'RPE 8' : 'RIR 1-2'))
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
    ...program,
    totalWeeks: 4,
    weeks
  };
}

export default function TrainingHub({
  pathway = 'powerlifting',
  athleteProfile,
  isAdvancedMode = false,
  onOpenAiSynthesis
}) {
  const athleteId = athleteProfile?.uid || 'athlete_demo';

  // View state: 'today_logger' | 'full_mesocycle' | 'past_logs'
  const [currentView, setCurrentView] = useState('today_logger');

  // Active Multi-Week Program State
  const [activeAiProgram, setActiveAiProgram] = useState(null);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(1); // 1 | 2 | 3 | 4
  const [selectedDayIdx, setSelectedDayIdx] = useState(0); // 0 | 1 | 2 | 3

  // Modals & Timers
  const [activeWarmupModal, setActiveWarmupModal] = useState(null);
  const [showFinishedModal, setShowFinishedModal] = useState(false);

  // Minimal In-Rack Rest Countdown
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);

  // Workout History State
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [showPrShowcase, setShowPrShowcase] = useState(false);

  // Thematic Tokens based on Discipline
  const isPowerlifting = pathway === 'powerlifting';
  const themeAccentText = isPowerlifting ? 'text-orange-400' : 'text-purple-400';
  const themeBadge = isPowerlifting 
    ? 'bg-orange-950/80 text-orange-400 border-orange-500/30' 
    : 'bg-purple-950/80 text-purple-400 border-purple-500/30';
  const themeTabActive = isPowerlifting 
    ? 'bg-orange-600 text-white shadow-md shadow-orange-950' 
    : 'bg-purple-600 text-white shadow-md shadow-purple-950';
  const themeCardSelected = isPowerlifting 
    ? 'bg-gradient-to-b from-orange-950/40 to-zinc-900 border-orange-500 shadow-md shadow-orange-950' 
    : 'bg-gradient-to-b from-purple-950/40 to-zinc-900 border-purple-500 shadow-md shadow-purple-950';
  const themeBadgeActive = isPowerlifting ? 'bg-orange-600 text-white' : 'bg-purple-600 text-white';
  const themeDayPillActive = isPowerlifting
    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-950'
    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950';
  const themeActionBtn = isPowerlifting 
    ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-950' 
    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950';

  // Calibrate baseline 1RMs from athleteProfile
  const userSquat = parseFloat(athleteProfile?.training_max?.squat || athleteProfile?.squat || 165);
  const userBench = parseFloat(athleteProfile?.training_max?.bench || athleteProfile?.bench || 125);
  const userDeadlift = parseFloat(athleteProfile?.training_max?.deadlift || athleteProfile?.deadlift || 195);

  // Base Standard 4-Day Protocols calibrated to athlete strength
  const defaultPowerliftingProgram = {
    programTitle: "4-Week Competitive SBD Wave",
    periodizationModel: "Prilepin DUP 4-Week Block (Accumulation → Progression → Peak → Deload)",
    days: [
      {
        dayNumber: 1,
        dayName: "Day 1: Competition Squat & Quad Drive",
        focus: "Squat Volume & Anterior Chain",
        warmupPrimer: "90/90 Hip Flow + Ankle Dorsiflexion + 3 Empty Bar Pause Sets",
        exercises: [
          { name: "Competition Squat", baseSets: 4, sets: 4, reps: "4", baseLoadKg: Math.round((userSquat * 0.80) / 2.5) * 2.5, loadKg: Math.round((userSquat * 0.80) / 2.5) * 2.5, cue: "IPF Command simulation: 1-sec pause below parallel." },
          { name: "Bulgarian Split Squats", baseSets: 3, sets: 3, reps: "8-10", baseLoadKg: 24, loadKg: 24, cue: "Load lead quad smoothly. Controlled descent." },
          { name: "Ab Wheel Rollouts", baseSets: 3, sets: 3, reps: "10-12", baseLoadKg: 0, loadKg: 0, cue: "Maintain posterior pelvic tilt throughout roll." }
        ]
      },
      {
        dayNumber: 2,
        dayName: "Day 2: Competition Bench Press & Scapular Drive",
        focus: "Pectoral Reversal & Lat Shelf Stability",
        warmupPrimer: "Band Pull-Aparts + Rotator Cuff Primer",
        exercises: [
          { name: "Competition Bench Press", baseSets: 4, sets: 4, reps: "5", baseLoadKg: Math.round((userBench * 0.80) / 2.5) * 2.5, loadKg: Math.round((userBench * 0.80) / 2.5) * 2.5, cue: "Full leg drive before unrack. Locked wrist alignment." },
          { name: "Spoto Press (1-inch off chest)", baseSets: 3, sets: 3, reps: "5", baseLoadKg: Math.round((userBench * 0.70) / 2.5) * 2.5, loadKg: Math.round((userBench * 0.70) / 2.5) * 2.5, cue: "Dead motionless pause above sternum." },
          { name: "Chest Supported Dumbbell Rows", baseSets: 4, sets: 4, reps: "10", baseLoadKg: 28, loadKg: 28, cue: "1-sec isometric squeeze at top." },
          { name: "EZ-Bar Skull Crushers", baseSets: 3, sets: 3, reps: "12", baseLoadKg: 30, loadKg: 30, cue: "Lower behind head to stretch long head." }
        ]
      },
      {
        dayNumber: 3,
        dayName: "Day 3: Competition Deadlift & Posterior Chain Engine",
        focus: "Wedge & Slack Pull from Floor",
        warmupPrimer: "World's Greatest Stretch + Hamstring Sweeps + Glute Activations",
        exercises: [
          { name: "Competition Deadlift", baseSets: 3, sets: 3, reps: "3", baseLoadKg: Math.round((userDeadlift * 0.80) / 2.5) * 2.5, loadKg: Math.round((userDeadlift * 0.80) / 2.5) * 2.5, cue: "Pull slack out of bar, wedge hips forward, push floor away." },
          { name: "Deficit Deadlifts (1.5 inch)", baseSets: 3, sets: 3, reps: "4", baseLoadKg: Math.round((userDeadlift * 0.65) / 2.5) * 2.5, loadKg: Math.round((userDeadlift * 0.65) / 2.5) * 2.5, cue: "Overcome disadvantaged leverage off floor." },
          { name: "Barbell Romanian Deadlift", baseSets: 3, sets: 3, reps: "8", baseLoadKg: Math.round((userDeadlift * 0.55) / 2.5) * 2.5, loadKg: Math.round((userDeadlift * 0.55) / 2.5) * 2.5, cue: "Hips back, feel deep stretch in hamstrings." },
          { name: "Hanging Leg Raises", baseSets: 3, sets: 3, reps: "12", baseLoadKg: 0, loadKg: 0, cue: "Decompress spine after heavy pulls." }
        ]
      },
      {
        dayNumber: 4,
        dayName: "Day 4: SBD Volume Flush & Technique Balance",
        focus: "Secondary Overload & Structural Balance",
        warmupPrimer: "Thoracic Extensions on Foam Roller + Lat Primer",
        exercises: [
          { name: "Close-Grip Bench Press", baseSets: 3, sets: 3, reps: "6", baseLoadKg: Math.round((userBench * 0.65) / 2.5) * 2.5, loadKg: Math.round((userBench * 0.65) / 2.5) * 2.5, cue: "Shoulder-width grip. Explosive lockout." },
          { name: "Belt Squats or Front Squats", baseSets: 3, sets: 3, reps: "8", baseLoadKg: Math.round((userSquat * 0.55) / 2.5) * 2.5, loadKg: Math.round((userSquat * 0.55) / 2.5) * 2.5, cue: "Pure knee flexion, zero lower back load." },
          { name: "Neutral-Grip Lat Pulldowns", baseSets: 4, sets: 4, reps: "10", baseLoadKg: 65, loadKg: 65, cue: "Pull elbows straight down into pockets." },
          { name: "Standing Calf Raises", baseSets: 4, sets: 4, reps: "15", baseLoadKg: 50, loadKg: 50, cue: "2-sec deep bottom stretch on platform." }
        ]
      }
    ]
  };

  const defaultFitnessProgram = {
    programTitle: "4-Week Hypertrophy MAV Mesocycle",
    periodizationModel: "Israetel Hypertrophy Landmarks (MEV → MAV → MRV → Deload)",
    days: [
      {
        dayNumber: 1,
        dayName: "Day 1: Push Hypertrophy (Chest, Delts & Triceps)",
        focus: "Clavicular Pecs & Lateral Delt Hypertrophy",
        warmupPrimer: "Band Dislocates + Arm Circles + Pushup Holds",
        exercises: [
          { name: "Incline Barbell Bench Press", baseSets: 4, sets: 4, reps: "8-10", baseLoadKg: Math.round((userBench * 0.70) / 2.5) * 2.5, loadKg: Math.round((userBench * 0.70) / 2.5) * 2.5, cue: "Lower bar to upper chest, squeeze clavicular pecs." },
          { name: "Dumbbell Seated Shoulder Press", baseSets: 3, sets: 3, reps: "8-10", baseLoadKg: 26, loadKg: 26, cue: "Neutral pressing groove, smooth lockout." },
          { name: "Cable Lateral Raises", baseSets: 4, sets: 4, reps: "12-15", baseLoadKg: 10, loadKg: 10, cue: "Sweep hands outward towards walls." },
          { name: "Cable Triceps Pushdowns", baseSets: 3, sets: 3, reps: "12-15", baseLoadKg: 30, loadKg: 30, cue: "Pin elbows to ribs. Controlled eccentric." }
        ]
      },
      {
        dayNumber: 2,
        dayName: "Day 2: Pull Hypertrophy (Lats, Upper Back & Biceps)",
        focus: "V-Taper Lat Width & Rhomboid Thickness",
        warmupPrimer: "Dead Hangs + Scapular Shrugs + Band Pull-Aparts",
        exercises: [
          { name: "Lat Pulldowns (Neutral Grip)", baseSets: 4, sets: 4, reps: "10-12", baseLoadKg: 65, loadKg: 65, cue: "Full stretch at top, drive elbows to hips." },
          { name: "Chest-Supported Dumbbell Rows", baseSets: 3, sets: 3, reps: "10-12", baseLoadKg: 28, loadKg: 28, cue: "1-sec pause at peak retraction." },
          { name: "Incline Dumbbell Bicep Curls", baseSets: 3, sets: 3, reps: "10-12", baseLoadKg: 14, loadKg: 14, cue: "Deep bottom stretch, supinate at top." },
          { name: "Facepulls with Rope", baseSets: 4, sets: 4, reps: "15-20", baseLoadKg: 25, loadKg: 25, cue: "Pull to forehead, external shoulder rotation." }
        ]
      },
      {
        dayNumber: 3,
        dayName: "Day 3: Lower Body Hypertrophy (Quads & Hamstrings)",
        focus: "Quad Sweep & Hamstring Mass",
        warmupPrimer: "Leg Swings + Bodyweight Squats + Ankle Mobility",
        exercises: [
          { name: "Leg Press (Deep Knee Bend)", baseSets: 4, sets: 4, reps: "10-12", baseLoadKg: 180, loadKg: 180, cue: "Full depth without pelvic tucking." },
          { name: "Barbell Romanian Deadlift", baseSets: 4, sets: 4, reps: "8-10", baseLoadKg: Math.round((userDeadlift * 0.50) / 2.5) * 2.5, loadKg: Math.round((userDeadlift * 0.50) / 2.5) * 2.5, cue: "Hips back, deep hamstring stretch." },
          { name: "Lying Leg Curls", baseSets: 4, sets: 4, reps: "12-15", baseLoadKg: 40, loadKg: 40, cue: "Squeeze hamstrings at contraction, 2-sec eccentric." },
          { name: "Standing Calf Raises", baseSets: 4, sets: 4, reps: "15-20", baseLoadKg: 60, loadKg: 60, cue: "Dead pause at deepest bottom stretch." }
        ]
      },
      {
        dayNumber: 4,
        dayName: "Day 4: Upper Body Sculpt & Weak-Point Overload",
        focus: "Chest Density & Arm Volume",
        warmupPrimer: "World's Greatest Stretch + Banded Rotations",
        exercises: [
          { name: "Flat Dumbbell Press", baseSets: 4, sets: 4, reps: "8-10", baseLoadKg: Math.round((userBench * 0.32) / 2.5) * 2.5, loadKg: Math.round((userBench * 0.32) / 2.5) * 2.5, cue: "Deep chest stretch, convergent press." },
          { name: "Barbell Pendlay Rows", baseSets: 3, sets: 3, reps: "8-10", baseLoadKg: Math.round((userBench * 0.60) / 2.5) * 2.5, loadKg: Math.round((userBench * 0.60) / 2.5) * 2.5, cue: "Explosive pull from dead stop on floor." },
          { name: "Hammer Curls + Overhead Triceps Extension", baseSets: 3, sets: 3, reps: "12", baseLoadKg: 16, loadKg: 16, cue: "Brachialis density & long head triceps peak." }
        ]
      }
    ]
  };

  // Ensure effective program always has full 4-week mesocycle
  const effectiveProgram = useMemo(() => {
    let program = pathway === 'fitness' ? defaultFitnessProgram : defaultPowerliftingProgram;
    if (activeAiProgram && activeAiProgram.days && activeAiProgram.days.length > 0 && activeAiProgram.pathway === pathway) {
      program = activeAiProgram;
    }
    return attachFourWeekMesocycle(program, pathway);
  }, [activeAiProgram, pathway]);

  const weeksList = effectiveProgram.weeks || [];

  // Active exercises for today's live session
  const [tasks, setTasks] = useState([]);

  // Load Protocol & History on Mount & State Changes
  useEffect(() => {
    // Check localStorage for saved active AI program
    try {
      const saved = localStorage.getItem(`active_ai_program_${athleteId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.days && parsed.days.length > 0 && parsed.pathway === pathway) {
          setActiveAiProgram(attachFourWeekMesocycle(parsed, pathway));
        }
      }
    } catch (e) {}

    loadProtocolForWeekAndDay(selectedWeekNumber, selectedDayIdx);
    loadWorkoutHistory();
  }, [pathway, athleteId, selectedWeekNumber, selectedDayIdx]);

  const loadProtocolForWeekAndDay = (weekNum = 1, dayIdx = 0) => {
    const activeWeek = weeksList.find(w => w.weekNumber === weekNum) || weeksList[0] || {
      loadModifier: 1.0,
      setModifier: 0,
      days: effectiveProgram.days
    };

    const safeIdx = Math.min(dayIdx, (activeWeek.days?.length || effectiveProgram.days.length) - 1);
    const day = (activeWeek.days && activeWeek.days[safeIdx]) || effectiveProgram.days[safeIdx];
    
    if (day && day.exercises) {
      const converted = day.exercises.map((ex, idx) => {
        const baseLoad = ex.loadKg || ex.baseLoadKg || 50;
        const finalLoad = (activeWeek.days && ex.loadKg) 
          ? ex.loadKg 
          : Math.round((baseLoad * (activeWeek.loadModifier || 1.0)) / 2.5) * 2.5;
        const totalSets = (activeWeek.days && ex.sets) 
          ? ex.sets 
          : Math.max(2, (ex.sets || ex.baseSets || 4) + (activeWeek.setModifier || 0));

        return {
          id: `w${weekNum}-d${safeIdx}-${idx}`,
          title: ex.name,
          sets: totalSets,
          reps: ex.reps || '8',
          weight: finalLoad,
          cue: ex.cue || '',
          muscle: ex.muscle || '',
          intensityTarget: ex.intensityTarget || '',
          completedSets: new Array(totalSets).fill(false)
        };
      });
      setTasks(converted);
    }
  };

  // Load Past Workout History from LocalStorage
  const loadWorkoutHistory = () => {
    try {
      const savedLogs = localStorage.getItem(`athlete_workout_history_${athleteId}`);
      if (savedLogs) {
        setWorkoutLogs(JSON.parse(savedLogs));
      } else {
        // Default historical sessions
        const sampleLogs = [
          {
            id: 'log-1',
            date: 'Thu, 18 Sep',
            week: 1,
            day: 2,
            sessionName: 'Competition Bench Press & Scapular Drive',
            completedSets: 14,
            totalSets: 14,
            volumeKg: 8420
          },
          {
            id: 'log-2',
            date: 'Tue, 16 Sep',
            week: 1,
            day: 1,
            sessionName: 'Competition Squat & Quad Drive',
            completedSets: 10,
            totalSets: 10,
            volumeKg: 10240
          }
        ];
        setWorkoutLogs(sampleLogs);
      }
    } catch (e) {}
  };

  // Switch Week
  const handleSelectWeek = (wNum) => {
    setSelectedWeekNumber(wNum);
    loadProtocolForWeekAndDay(wNum, selectedDayIdx);
    toast.info(`Switched to Week ${wNum}`);
  };

  // Switch Day
  const handleSelectDay = (dIdx) => {
    setSelectedDayIdx(dIdx);
    loadProtocolForWeekAndDay(selectedWeekNumber, dIdx);
    setCurrentView('today_logger');
    toast.info(`Loaded Day ${dIdx + 1}`);
  };

  // Start Session from Mesocycle Roadmap
  const handleStartSessionFromRoadmap = (wNum, dIdx) => {
    setSelectedWeekNumber(wNum);
    setSelectedDayIdx(dIdx);
    loadProtocolForWeekAndDay(wNum, dIdx);
    setCurrentView('today_logger');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success(`⚡ Week ${wNum} • Day ${dIdx + 1} Loaded into Live Gym Tracker!`);
  };

  // Acoustic chime when rest interval finishes
  const playRestChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.7);
    } catch (e) {}
  };

  // Rest Countdown effect
  useEffect(() => {
    let interval = null;
    if (isRestTimerRunning && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (restSecondsLeft === 0 && isRestTimerRunning) {
      setIsRestTimerRunning(false);
      playRestChime();
      toast.success("⏰ Rest time is up! Ready for next set.");
    }
    return () => clearInterval(interval);
  }, [isRestTimerRunning, restSecondsLeft]);

  // Toggle set completed
  const handleToggleSet = (taskId, setIndex) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedSets = [...task.completedSets];
        const isNowDone = !updatedSets[setIndex];
        updatedSets[setIndex] = isNowDone;

        if (isNowDone) {
          setRestSecondsLeft(90);
          setIsRestTimerRunning(true);
          toast.success(`Set ${setIndex + 1} logged! Rest timer: 90s`);
        }
        return { ...task, completedSets: updatedSets };
      }
      return task;
    }));
  };

  // Live Metrics
  const { totalSets, completedSets, completedVolumeKg } = useMemo(() => {
    let tSets = 0;
    let cSets = 0;
    let volume = 0;

    tasks.forEach(task => {
      const repsNum = parseInt(task.reps.split('-')[0]) || 8;
      task.completedSets.forEach(isDone => {
        tSets += 1;
        if (isDone) {
          cSets += 1;
          volume += (task.weight * repsNum);
        }
      });
    });

    return { totalSets: tSets, completedSets: cSets, completedVolumeKg: volume };
  }, [tasks]);

  const activeWeekInfo = weeksList.find(w => w.weekNumber === selectedWeekNumber) || weeksList[0] || {
    name: "Week 1: Base Volume",
    phase: "Accumulation",
    focus: "Establish technical baseline",
    loadModifier: 1.0,
    days: effectiveProgram.days
  };

  const currentDay = (activeWeekInfo.days && activeWeekInfo.days[selectedDayIdx]) || effectiveProgram.days[selectedDayIdx] || effectiveProgram.days[0];

  // Upcoming Day & Week Calculations
  const nextDayIdx = (selectedDayIdx + 1) < (activeWeekInfo.days?.length || 4) ? selectedDayIdx + 1 : null;
  const nextDay = nextDayIdx !== null ? ((activeWeekInfo.days && activeWeekInfo.days[nextDayIdx]) || effectiveProgram.days[nextDayIdx]) : null;
  const nextWeekNum = selectedWeekNumber < 4 ? selectedWeekNumber + 1 : null;
  const nextWeek = nextWeekNum ? weeksList.find(w => w.weekNumber === nextWeekNum) : null;

  // Finish Workout & Commit to History
  const handleFinishAndSaveWorkout = () => {
    const newLog = {
      id: `log-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      week: selectedWeekNumber,
      day: selectedDayIdx + 1,
      sessionName: currentDay.dayName,
      completedSets,
      totalSets,
      volumeKg: completedVolumeKg
    };

    const updated = [newLog, ...workoutLogs];
    setWorkoutLogs(updated);
    try {
      localStorage.setItem(`athlete_workout_history_${athleteId}`, JSON.stringify(updated));
    } catch (e) {}

    setShowFinishedModal(true);
  };

  // WhatsApp Summary
  const shareToWhatsApp = () => {
    const text = `🏋️ *TITAN-AI TRAINING LOG*
👤 *Athlete:* ${athleteProfile?.displayName || 'Lifter'}
📅 *Date:* ${new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
🗓️ *Cycle:* Week ${selectedWeekNumber} • Day ${selectedDayIdx + 1} (${currentDay.dayName})

⚡ *Completed Sets:*
${tasks.filter(t => t.completedSets.some(Boolean)).map(t => `  ✅ *${t.title}* — ${t.completedSets.filter(Boolean).length}/${t.sets} sets @ ${t.weight}kg`).join('\n')}

📊 *Total Volume:* *${completedVolumeKg.toLocaleString()} KG*
🎯 *Sets Done:* ${completedSets} of ${totalSets}

Generated via TITAN-AI Platform`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Total logged volume across history
  const totalHistoryVolume = useMemo(() => {
    return workoutLogs.reduce((acc, curr) => acc + (curr.volumeKg || 0), 0);
  }, [workoutLogs]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. TOP PROTOCOL HEADER & VIEW SWITCHER */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${themeAccentText}`}>
                {activeAiProgram ? '⚡ ACTIVE AI PROTOCOL' : '4-WEEK PERIODIZED MESOCYCLE'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${themeBadge}`}>
                {pathway}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black italic uppercase text-white">
              {effectiveProgram.programTitle}
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              {activeWeekInfo.name} • {activeWeekInfo.days?.length || effectiveProgram.days.length} Days/Week
            </p>
          </div>

          {/* 3 Prominent Views: Today's Workout | Entire 4-Week Protocol | Past Workout Logs */}
          <div className="flex items-center bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 self-start sm:self-auto overflow-x-auto scrollbar-none gap-1">
            <button
              onClick={() => setCurrentView('today_logger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                currentView === 'today_logger'
                  ? themeTabActive
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Today's Workout</span>
            </button>
            <button
              onClick={() => setCurrentView('full_mesocycle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                currentView === 'full_mesocycle'
                  ? themeTabActive
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Entire Protocol ({weeksList.length} Weeks)</span>
            </button>
            <button
              onClick={() => setCurrentView('past_logs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                currentView === 'past_logs'
                  ? themeTabActive
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Past Logs ({workoutLogs.length})</span>
            </button>
          </div>
        </div>

        {/* 4-WEEK INTERACTIVE TIMELINE STRIP */}
        <div className="pt-2 border-t border-zinc-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold">
              4-WEEK MESOCYCLE PROGRESSION & TIMELINE:
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Click any week to switch phase
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {weeksList.map((w) => {
              const isSelected = selectedWeekNumber === w.weekNumber;
              const isDone = w.weekNumber < selectedWeekNumber;

              return (
                <button
                  key={w.weekNumber}
                  onClick={() => handleSelectWeek(w.weekNumber)}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? themeCardSelected
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className={isSelected ? `${themeAccentText} font-bold` : 'text-zinc-400'}>
                      WEEK {w.weekNumber}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      isSelected
                        ? themeBadgeActive
                        : isDone
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {isSelected ? 'ACTIVE' : isDone ? 'DONE' : 'UPCOMING'}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white truncate">
                    {w.phase}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 mt-0.5 truncate">
                    {w.loadModifier ? `${Math.round(w.loadModifier * 100)}% load` : '100%'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Powerlifting 1RM & DOTS Trophy Strip */}
        {isPowerlifting && (
          <div className="pt-2 border-t border-zinc-800/60">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPrShowcase(!showPrShowcase)}
                className="text-xs font-mono font-bold text-orange-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>{showPrShowcase ? 'Hide 1RM PR & Platform Trophy Bar' : 'View 1RM PR & Platform Trophy Bar'}</span>
              </button>
              <span className="text-[10px] font-mono text-zinc-500">Squat • Bench • Deadlift • DOTS</span>
            </div>

            {showPrShowcase && (
              <div className="mt-3">
                <AthletePRShowcase 
                  profile={athleteProfile} 
                  bodyweight={athleteProfile?.bodyweight || 74} 
                  gender={athleteProfile?.gender || 'male'} 
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* VIEW 1: TODAY'S LIVE WORKOUT LOGGER                         */}
      {/* ─────────────────────────────────────────────────────────── */}
      {currentView === 'today_logger' && (
        <div className="space-y-4">
          {/* Day Selector Pills for the Active Week */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold shrink-0">
              WEEK {selectedWeekNumber} DAYS:
            </span>
            {(activeWeekInfo.days || effectiveProgram.days).map((d, i) => (
              <button
                key={i}
                onClick={() => handleSelectDay(i)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedDayIdx === i
                    ? themeDayPillActive
                    : 'bg-zinc-900/70 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>Day {d.dayNumber}: {d.focus?.split(' ')[0] || `Workout ${d.dayNumber}`}</span>
              </button>
            ))}
          </div>

          {/* Day Header Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className={`text-[11px] font-mono uppercase tracking-wider block mb-1 font-bold ${themeAccentText}`}>
                WEEK {selectedWeekNumber} ({activeWeekInfo.phase}) • DAY {currentDay.dayNumber} OF {(activeWeekInfo.days || effectiveProgram.days).length}
              </span>
              <h3 className="text-xl font-black italic uppercase text-white">
                {currentDay.dayName}
              </h3>
              {currentDay.warmupPrimer && (
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  🔥 <span className={`${themeAccentText} font-bold`}>Primer:</span> {currentDay.warmupPrimer}
                </p>
              )}
            </div>

            {/* Set Counter & Finish */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-mono text-zinc-400">Sets Done</div>
                <div className="text-lg font-black text-emerald-400">{completedSets} / {totalSets}</div>
              </div>
              {completedSets > 0 && (
                <button
                  onClick={handleFinishAndSaveWorkout}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase font-mono shadow-md shadow-emerald-950 transition-all"
                >
                  Finish & Save
                </button>
              )}
            </div>
          </div>

          {/* Minimal Rest Timer Banner */}
          {isRestTimerRunning && (
            <div className="p-3 bg-zinc-950 border border-emerald-500/40 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono">
                <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="text-zinc-300">Rest Timer:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {Math.floor(restSecondsLeft / 60)}:{(restSecondsLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRestSecondsLeft(prev => prev + 30)}
                  className="px-2 py-1 rounded bg-zinc-800 text-[11px] font-mono text-zinc-300 hover:text-white"
                >
                  +30s
                </button>
                <button
                  onClick={() => setIsRestTimerRunning(false)}
                  className="px-2 py-1 rounded bg-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-red-400"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Exercise List for Today */}
          <div className="space-y-3">
            {tasks.map((task) => {
              const isDone = task.completedSets.every(Boolean);

              return (
                <div
                  key={task.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isDone 
                      ? 'bg-zinc-950/40 border-emerald-500/30' 
                      : 'bg-zinc-900/40 border-zinc-800/70 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        {task.title}
                      </h4>
                      <div className="text-xs font-mono text-zinc-400 mt-0.5">
                        {task.sets} sets × {task.reps} reps • <span className="text-white font-bold">{task.weight} kg</span>
                        {task.intensityTarget && (
                          <span className="text-amber-400 ml-2">[{task.intensityTarget}]</span>
                        )}
                      </div>
                      {task.cue && (
                        <p className="text-[11px] font-mono text-zinc-500 italic mt-0.5">
                          💡 {task.cue}
                        </p>
                      )}
                    </div>

                    {isAdvancedMode && (
                      <button
                        onClick={() => setActiveWarmupModal({ name: task.title, weight: task.weight })}
                        className="px-2.5 py-1 rounded bg-zinc-800 text-[11px] font-mono text-zinc-300 hover:text-white shrink-0"
                      >
                        Plate Math
                      </button>
                    )}
                  </div>

                  {/* Set Checkboxes */}
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-zinc-800/50">
                    {task.completedSets.map((done, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleToggleSet(task.id, sIdx)}
                        className={`h-11 px-4 rounded-xl border flex items-center gap-2 font-mono text-xs transition-all ${
                          done
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {done ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-600" />
                        )}
                        <span>Set {sIdx + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* UPCOMING IN YOUR PROTOCOL PREVIEW CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase font-bold flex items-center gap-1.5">
                <span>🗓️ UPCOMING SESSIONS IN YOUR PROTOCOL:</span>
              </span>
              <button
                onClick={() => setCurrentView('full_mesocycle')}
                className={`text-xs font-mono ${themeAccentText} hover:opacity-80 font-bold flex items-center gap-1`}
              >
                <span>View Full 4-Week Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Next Day */}
              {nextDay ? (
                <div 
                  onClick={() => handleSelectDay(nextDayIdx)}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                    <span>NEXT SESSION IN WEEK {selectedWeekNumber}</span>
                    <span className={themeAccentText}>Day {nextDay.dayNumber}</span>
                  </div>
                  <div className="text-sm font-bold text-white truncate">
                    {nextDay.dayName}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-1">
                    {nextDay.exercises?.length} Lifts • {nextDay.focus}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-400">
                  🎉 You are on the final day of Week {selectedWeekNumber}!
                </div>
              )}

              {/* Upcoming Week */}
              {nextWeek ? (
                <div 
                  onClick={() => handleSelectWeek(nextWeekNum)}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                    <span>UPCOMING PHASE</span>
                    <span className="text-purple-400">Week {nextWeek.weekNumber}</span>
                  </div>
                  <div className="text-sm font-bold text-white truncate">
                    {nextWeek.name}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-1">
                    🎯 {nextWeek.focus}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-400">
                  🏆 You are in Week 4 (Deload & Realization Phase)!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* VIEW 2: 4-WEEK FULL MESOCYCLE ROADMAP (ENTIRE PROGRAM)      */}
      {/* ─────────────────────────────────────────────────────────── */}
      {currentView === 'full_mesocycle' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-zinc-400">
            <div>
              🗺️ <span className="text-white font-bold">Entire 4-Week Protocol Program:</span> Complete roadmap with all weeks, days, exact working KG targets, and coaching cues.
            </div>
            <button
              onClick={() => setCurrentView('today_logger')}
              className={`px-3.5 py-1.5 rounded-xl ${themeActionBtn} font-bold self-start sm:self-auto shrink-0 shadow-md`}
            >
              Return to Live Tracker
            </button>
          </div>

          <div className="space-y-6">
            {weeksList.map((week) => (
              <div 
                key={week.weekNumber} 
                className={`p-5 rounded-2xl border transition-all ${
                  selectedWeekNumber === week.weekNumber 
                    ? (isPowerlifting ? 'bg-zinc-900/80 border-orange-500/50' : 'bg-zinc-900/80 border-purple-500/50')
                    : 'bg-zinc-950/60 border-zinc-800/80'
                }`}
              >
                {/* Week Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-zinc-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono uppercase ${themeAccentText} font-bold`}>
                        PHASE {week.weekNumber}: {week.phase}
                      </span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                        {week.loadModifier ? `${Math.round(week.loadModifier * 100)}% Load` : '100%'}
                      </span>
                    </div>
                    <h4 className="text-lg sm:text-xl font-black italic uppercase text-white">
                      {week.name}
                    </h4>
                    <p className="text-xs font-mono text-zinc-400 mt-0.5">{week.focus}</p>
                  </div>

                  <button
                    onClick={() => {
                      handleSelectWeek(week.weekNumber);
                      setCurrentView('today_logger');
                    }}
                    className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all shrink-0 ${
                      selectedWeekNumber === week.weekNumber
                        ? themeBadgeActive
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {selectedWeekNumber === week.weekNumber ? '✓ Active in Tracker' : `Select Week ${week.weekNumber}`}
                  </button>
                </div>

                {/* Days Grid for this week with ALL exercises */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(week.days || effectiveProgram.days).map((d, dIdx) => (
                    <div key={dIdx} className="bg-black/50 border border-zinc-800/80 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                        <div>
                          <span className={`text-[10px] font-mono ${themeAccentText} uppercase font-bold block`}>
                            DAY {d.dayNumber}
                          </span>
                          <span className="text-sm font-bold text-white">{d.dayName}</span>
                        </div>
                        <span className="text-xs font-mono text-zinc-500">{d.exercises?.length} Lifts</span>
                      </div>

                      {d.warmupPrimer && (
                        <div className="text-[11px] font-mono text-zinc-500">
                          🔥 <span className="text-zinc-400">Primer:</span> {d.warmupPrimer}
                        </div>
                      )}

                      {/* Full Exercise List */}
                      <div className="space-y-1.5 divide-y divide-zinc-900">
                        {d.exercises?.map((ex, exIdx) => {
                          const baseLoad = Number(ex.loadKg || ex.baseLoadKg) || 50;
                          const load = (week.days && ex.loadKg) 
                            ? ex.loadKg 
                            : Math.round((baseLoad * (week.loadModifier || 1.0)) / 2.5) * 2.5;
                          const sets = (week.days && ex.sets) 
                            ? ex.sets 
                            : Math.max(2, (ex.sets || ex.baseSets || 4) + (week.setModifier || 0));

                          return (
                            <div key={exIdx} className="pt-1.5 flex items-start justify-between gap-2 text-xs font-mono">
                              <div className="min-w-0 pr-2">
                                <div className="text-zinc-200 font-medium truncate">{ex.name}</div>
                                {ex.cue && (
                                  <div className="text-[10px] text-zinc-500 truncate italic">💡 {ex.cue}</div>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`${themeAccentText} font-bold`}>{load} kg</span>
                                <span className="text-zinc-500 mx-1">•</span>
                                <span className="text-zinc-300">{sets}x{ex.reps}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Start / Jump to this session button */}
                      <button
                        onClick={() => handleStartSessionFromRoadmap(week.weekNumber, dIdx)}
                        className={`w-full py-2 rounded-lg bg-zinc-900 ${isPowerlifting ? 'hover:bg-orange-600' : 'hover:bg-purple-600'} hover:text-white border border-zinc-800 text-zinc-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all`}
                      >
                        <Play className="w-3 h-3" />
                        <span>Start / Log Week {week.weekNumber} Day {d.dayNumber}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* VIEW 3: PAST WORKOUT LOGS & TRAINING HISTORY               */}
      {/* ─────────────────────────────────────────────────────────── */}
      {currentView === 'past_logs' && (
        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Sessions Logged</span>
              <span className="text-2xl font-black text-white">{workoutLogs.length}</span>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Tonnage Lifted</span>
              <span className={`text-2xl font-black ${themeAccentText}`}>{totalHistoryVolume.toLocaleString()} KG</span>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Active Mesocycle</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 block truncate">
                Week {selectedWeekNumber} ({activeWeekInfo.phase})
              </span>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="text-xs font-mono text-zinc-400">
              📜 <span className="text-white font-bold">Training History:</span> {workoutLogs.length} Platform Workouts Recorded
            </div>
            <button
              onClick={shareToWhatsApp}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Training History</span>
            </button>
          </div>

          {workoutLogs.length === 0 ? (
            <div className="text-center py-12 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 space-y-3">
              <History className="w-8 h-8 text-zinc-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No Completed Sessions Logged Yet</h4>
              <p className="text-xs font-mono text-zinc-500 max-w-sm mx-auto">
                Complete sets in Today's Workout and click "Finish & Save" to build your lifetime training history.
              </p>
              <button
                onClick={() => setCurrentView('today_logger')}
                className={`px-4 py-2 rounded-xl ${themeActionBtn} font-mono text-xs font-bold`}
              >
                Log Today's Workout
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {workoutLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-orange-400 font-bold">
                        W{log.week} D{log.day}
                      </span>
                      <h4 className="text-sm font-bold text-white">{log.sessionName}</h4>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500 mt-1">
                      Logged on {log.date}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono self-start sm:self-auto">
                    <div className="text-right">
                      <span className="text-zinc-500 block text-[10px]">VOLUME</span>
                      <span className="text-orange-400 font-bold">{log.volumeKg?.toLocaleString() || 0} KG</span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-500 block text-[10px]">SETS</span>
                      <span className="text-white font-bold">{log.completedSets} / {log.totalSets}</span>
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FINISH WORKOUT RECAP MODAL */}
      {showFinishedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black italic uppercase text-white">Workout Finished & Logged!</h3>
            <div className="bg-zinc-900 p-3 rounded-xl font-mono text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Volume:</span>
                <span className="text-white font-bold">{completedVolumeKg.toLocaleString()} KG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Sets Completed:</span>
                <span className="text-white font-bold">{completedSets} / {totalSets}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold pt-1">
                <span>History:</span>
                <span>Committed to Past Logs ✅</span>
              </div>
            </div>

            <button
              onClick={shareToWhatsApp}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to WhatsApp</span>
            </button>
            <button
              onClick={() => setShowFinishedModal(false)}
              className="w-full py-2 rounded-xl text-zinc-500 hover:text-zinc-300 font-mono text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Warmup Modal */}
      {activeWarmupModal && (
        <WarmupLadderDrawer
          isOpen={!!activeWarmupModal}
          onClose={() => setActiveWarmupModal(null)}
          liftName={activeWarmupModal.name}
          targetWeight={activeWarmupModal.weight}
        />
      )}
    </div>
  );
}
