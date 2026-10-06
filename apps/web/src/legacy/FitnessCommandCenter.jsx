import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Flame, 
  Target, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Zap, 
  Share2, 
  Copy, 
  Check, 
  IndianRupee, 
  Camera, 
  Upload, 
  RefreshCw, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  Printer, 
  Eye, 
  ChevronRight, 
  Plus,
  Scale,
  Apple,
  Info,
  SlidersHorizontal,
  ChevronDown,
  Brain,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  RadialBarChart, 
  RadialBar, 
  PolarAngleAxis, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import TierBadge from '../components/TierBadge';
import OfflineSyncBadge from '../components/OfflineSyncBadge';
import InRackRestTimer from '../components/InRackRestTimer';
import AIChatBot from '../components/AIChatBot';
import AIProgramGeneratorModal from '../components/AIProgramGeneratorModal';
import AIBrainTrainingModal from '../components/AIBrainTrainingModal';
import WeeklyCheckInModal from '../components/WeeklyCheckInModal';
import GlobalBroadcastBanner from '../components/GlobalBroadcastBanner';
import HumanCoachComingSoonModal from '../components/HumanCoachComingSoonModal';
import JointTweakEngine from '../components/JointTweakEngine';
import TempoAudioCoach from '../components/TempoAudioCoach';
import HypertrophyIntelligence from '../components/HypertrophyIntelligence';
import PrecisionDietEngine from '../components/PrecisionDietEngine';

export default function FitnessCommandCenter({ athleteId, user, profile }) {
  const navigate = useNavigate();
  const { updateProfileData } = useAuth();

  const effectiveAthleteId = athleteId || user?.uid || "athlete_demo";
  const effectiveProfile = profile || {};

  const [showCoachModal, setShowCoachModal] = useState(false);
  const isAdmin = 
    profile?.role === 'admin' || 
    user?.email?.toLowerCase().includes('admin') || 
    user?.email?.toLowerCase().includes('srastick') ||
    profile?.role === 'coach';

  // Display Mode: 'interactive' (live logger with timers & checks) vs 'simple_blueprint' (minimalist printable sheet)
  const [appMode, setAppMode] = useState(effectiveProfile.appMode || 'interactive');
  const [activeTab, setActiveTab] = useState('workout'); // 'workout' | 'volume_radar' | 'nutrition' | 'physique' | 'warmup'
  const [showAiGenModal, setShowAiGenModal] = useState(false);
  const [showAiTrainModal, setShowAiTrainModal] = useState(false);
  const [showWeeklyCheckInModal, setShowWeeklyCheckInModal] = useState(false);
  const [activeAiProgramTitle, setActiveAiProgramTitle] = useState(null);
  const [currentWeekNumber, setCurrentWeekNumber] = useState(1);

  // Selected workout split day: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'arnold_chest_back' | 'arnold_shoulders_arms'
  const [selectedSplit, setSelectedSplit] = useState(
    effectiveProfile.splitPreference === 'upper_lower' ? 'upper' : 
    effectiveProfile.splitPreference === 'arnold' ? 'arnold_chest_back' : 'push'
  );

  // Bar-Feel & Auto-regulation energy level: 0.95 (stiff/tired), 1.0 (nominal), 1.025 (peak glycogen)
  const [energyModifier, setEnergyModifier] = useState(1.0);
  const [sessionCopied, setSessionCopied] = useState(false);
  const [groceryCopied, setGroceryCopied] = useState(false);

  // Nutrition state
  const [budgetTier, setBudgetTier] = useState(effectiveProfile.dailyBudgetINR || 150);
  const [dietType, setDietType] = useState(effectiveProfile.dietType || 'pure_veg');
  const [proteinGoal, setProteinGoal] = useState(
    parseInt(effectiveProfile.proteinWillingness?.split('-')[1]) || 130
  );

  // Apply real-time synthesized AI program to workout splits
  const applyAiProgramToSplits = (aiProgram) => {
    if (!aiProgram || !aiProgram.days || aiProgram.days.length === 0) return;
    const newSplits = {};
    aiProgram.days.forEach((day, idx) => {
      const splitKey = `ai_day_${idx + 1}`;
      newSplits[splitKey] = day.exercises?.map((ex, exIdx) => ({
        id: `ai-${idx}-${exIdx}`,
        name: ex.name,
        sets: ex.sets || 4,
        reps: ex.reps || '8-10',
        targetRir: ex.intensityTarget || 'RIR 1-2',
        loadKg: ex.loadKg || 30,
        restSec: ex.restSec || 75,
        cue: ex.cue || "Control eccentric, explosive concentric drive.",
        completedSets: new Array(ex.sets || 4).fill(false),
        muscle: ex.muscle || 'Target Muscle'
      })) || [];
    });

    setWorkoutSplits(prev => ({ ...prev, ...newSplits }));
    setSelectedSplit('ai_day_1');
    setActiveAiProgramTitle(aiProgram.programTitle || 'Real-Time AI Protocol');
    toast.success(`⚡ Live AI Protocol Loaded: ${aiProgram.programTitle}!`);
  };

  // Check on load for saved AI program
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`active_ai_program_${effectiveAthleteId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.days?.length > 0) {
          applyAiProgramToSplits(parsed);
        }
      }
    } catch (e) {}
  }, [effectiveAthleteId]);

  // Physique tracking
  const [physiqueBaseline, setPhysiqueBaseline] = useState(
    effectiveProfile.physiquePhoto || localStorage.getItem(`physique_baseline_${effectiveAthleteId}`) || null
  );
  const [physiqueCurrent, setPhysiqueCurrent] = useState(
    localStorage.getItem(`physique_current_${effectiveAthleteId}`) || null
  );

  // Weigh-in history
  const [weighInLogs, setWeighInLogs] = useState(() => {
    const saved = localStorage.getItem(`weigh_ins_${effectiveAthleteId}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const bw = effectiveProfile.bodyweight || 74;
    return [
      { date: '4 Wks Ago', weight: bw + 1.6, waist: 84 },
      { date: '3 Wks Ago', weight: bw + 1.1, waist: 83.5 },
      { date: '2 Wks Ago', weight: bw + 0.6, waist: 83 },
      { date: 'Last Week', weight: bw + 0.2, waist: 82.5 },
      { date: 'Current', weight: bw, waist: 82 }
    ];
  });

  const [newWeighIn, setNewWeighIn] = useState({ weight: '', waist: '' });

  // Preset workout routines for various splits with direct working sets, rep ranges (hypertrophy focus), and form cues
  const [workoutSplits, setWorkoutSplits] = useState({
    push: [
      { id: 'ex-1', name: 'Incline Dumbbell Bench Press', sets: 4, reps: '8-10', targetRir: 'RIR 1-2', loadKg: 28, restSec: 90, cue: '30° bench incline. Deep pectoral stretch at bottom, explosive push without clanking dumbbells.', completedSets: [false, false, false, false], muscle: 'Chest' },
      { id: 'ex-2', name: 'Barbell Flat Bench Press or Machine Chest Press', sets: 3, reps: '8-10', targetRir: 'RIR 2', loadKg: 75, restSec: 90, cue: 'Drive shoulder blades down and back. Controlled 2s eccentric descent to mid-sternum.', completedSets: [false, false, false], muscle: 'Chest' },
      { id: 'ex-3', name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '10-12', targetRir: 'RIR 1-2', loadKg: 22, restSec: 75, cue: 'Slight arc overhead. Core braced to eliminate lumbar extension.', completedSets: [false, false, false], muscle: 'Shoulders' },
      { id: 'ex-4', name: 'Cable Lateral Raises (Behind Back or Floor)', sets: 4, reps: '12-15', targetRir: 'RIR 0-1', loadKg: 10, restSec: 60, cue: 'Lead with elbows. Constant line of pull matching the lateral deltoid plane.', completedSets: [false, false, false, false], muscle: 'Shoulders' },
      { id: 'ex-5', name: 'Cable Low-to-High Chest Flyes', sets: 3, reps: '12-15', targetRir: 'RIR 1', loadKg: 15, restSec: 60, cue: 'Imagine hugging a huge barrel. Squeeze clavicular upper pec for 1 full second at peak.', completedSets: [false, false, false], muscle: 'Chest' },
      { id: 'ex-6', name: 'Overhead Cable Rope Tricep Extension', sets: 3, reps: '10-12', targetRir: 'RIR 1', loadKg: 25, restSec: 60, cue: 'Flare the rope apart at full lockout. Full deep tricep long-head stretch behind neck.', completedSets: [false, false, false], muscle: 'Triceps' },
      { id: 'ex-7', name: 'Straight Bar Cable Tricep Pushdowns', sets: 3, reps: '12-15', targetRir: 'RIR 0', loadKg: 30, restSec: 60, cue: 'Keep elbows locked like hinges beside ribs. Drive straight down and contract lateral head.', completedSets: [false, false, false], muscle: 'Triceps' }
    ],
    pull: [
      { id: 'p-1', name: 'Wide Grip Lat Pulldown', sets: 4, reps: '10-12', targetRir: 'RIR 1-2', loadKg: 65, restSec: 90, cue: 'Pull elbows down into back pockets. Slight arch in upper chest, full stretch at top.', completedSets: [false, false, false, false], muscle: 'Back' },
      { id: 'p-2', name: 'Chest-Supported T-Bar Row', sets: 4, reps: '8-10', targetRir: 'RIR 1', loadKg: 45, restSec: 90, cue: 'Zero momentum from spine. Drive elbows hard back and squeeze rhomboids.', completedSets: [false, false, false, false], muscle: 'Back' },
      { id: 'p-3', name: 'Single-Arm Cable Lat Pulldown / Row', sets: 3, reps: '10-12', targetRir: 'RIR 1', loadKg: 30, restSec: 60, cue: 'Match lat fiber trajectory. Wrap elbow tight around ribcage.', completedSets: [false, false, false], muscle: 'Back' },
      { id: 'p-4', name: 'Face Pulls with External Rotation', sets: 4, reps: '15-20', targetRir: 'RIR 1', loadKg: 20, restSec: 60, cue: 'Pull towards bridge of nose while showing thumbs backwards. Excellent rear delt and rotator cuff builder.', completedSets: [false, false, false, false], muscle: 'Shoulders' },
      { id: 'p-5', name: 'Incline Dumbbell Bicep Curls', sets: 3, reps: '10-12', targetRir: 'RIR 1', loadKg: 14, restSec: 60, cue: 'Bench at 45°. Emphasize the deep stretch on the biceps long head. Supinate forcefully.', completedSets: [false, false, false], muscle: 'Biceps' },
      { id: 'p-6', name: 'Standing Hammer Curls (Dumbbells)', sets: 3, reps: '10-12', targetRir: 'RIR 1', loadKg: 16, restSec: 60, cue: 'Neutral thumbs-up grip. Overloads brachialis for arm thickness and forearm size.', completedSets: [false, false, false], muscle: 'Biceps' }
    ],
    legs: [
      { id: 'l-1', name: 'Barbell High-Bar Squat or Hack Squat', sets: 4, reps: '8-10', targetRir: 'RIR 1-2', loadKg: 100, restSec: 120, cue: 'Torso upright. Track knees directly over toes for maximal quadriceps stretch.', completedSets: [false, false, false, false], muscle: 'Quads' },
      { id: 'l-2', name: 'Romanian Deadlift (Dumbbell or Barbell)', sets: 4, reps: '8-10', targetRir: 'RIR 2', loadKg: 85, restSec: 90, cue: 'Hips back to the wall until hamstrings are on fire. Neutral spine throughout.', completedSets: [false, false, false, false], muscle: 'Hamstrings' },
      { id: 'l-3', name: 'Leg Press (Quad-Dominant Foot Placement)', sets: 3, reps: '10-12', targetRir: 'RIR 1', loadKg: 180, restSec: 90, cue: 'Feet placed low on plate. Descend deep without pelvis lifting off seat.', completedSets: [false, false, false], muscle: 'Quads' },
      { id: 'l-4', name: 'Seated or Lying Leg Curls', sets: 4, reps: '12-15', targetRir: 'RIR 0-1', loadKg: 45, restSec: 60, cue: 'Toes pointed toward shins. 2-second slow negative on each rep.', completedSets: [false, false, false, false], muscle: 'Hamstrings' },
      { id: 'l-5', name: 'Leg Extensions (Drop-Set Finisher)', sets: 3, reps: '12-15', targetRir: 'RIR 0', loadKg: 50, restSec: 60, cue: 'Lock out and hold for 1 full second at top. Burn quads to failure.', completedSets: [false, false, false], muscle: 'Quads' },
      { id: 'l-6', name: 'Standing Calf Raises', sets: 4, reps: '15-20', targetRir: 'RIR 0', loadKg: 60, restSec: 45, cue: '2-second dead pause at deepest bottom stretch before driving up onto big toes.', completedSets: [false, false, false, false], muscle: 'Calves' }
    ],
    upper: [
      { id: 'u-1', name: 'Incline Barbell Bench Press', sets: 4, reps: '6-8', targetRir: 'RIR 2', loadKg: 70, restSec: 90, cue: 'Drive shoulders down. Clavicular chest builder.', completedSets: [false, false, false, false], muscle: 'Chest' },
      { id: 'u-2', name: 'Neutral-Grip Weighted Pull-Ups / Lat Pulldown', sets: 4, reps: '8-10', targetRir: 'RIR 1-2', loadKg: 70, restSec: 90, cue: 'Full dead-hang at bottom. Drive elbows down.', completedSets: [false, false, false, false], muscle: 'Back' },
      { id: 'u-3', name: 'Dumbbell Seated Shoulder Press', sets: 3, reps: '8-10', targetRir: 'RIR 1-2', loadKg: 24, restSec: 75, cue: 'Clean pressing groove overhead.', completedSets: [false, false, false], muscle: 'Shoulders' },
      { id: 'u-4', name: 'Chest Supported Dumbbell Rows', sets: 3, reps: '10-12', targetRir: 'RIR 1', loadKg: 26, restSec: 75, cue: 'Strict mid-back contraction.', completedSets: [false, false, false], muscle: 'Back' },
      { id: 'u-5', name: 'Cable Lateral Raises', sets: 4, reps: '12-15', targetRir: 'RIR 0-1', loadKg: 10, restSec: 60, cue: 'Smooth pump on lateral delts.', completedSets: [false, false, false, false], muscle: 'Shoulders' },
      { id: 'u-6', name: 'EZ-Bar Skull Crushers + Bicep Curl Superser', sets: 3, reps: '10-12', targetRir: 'RIR 1', loadKg: 28, restSec: 60, cue: 'No shoulder movement. Pure tricep and bicep pump.', completedSets: [false, false, false], muscle: 'Arms' }
    ],
    lower: [
      { id: 'lw-1', name: 'Leg Press (Heavy Working Sets)', sets: 4, reps: '10-12', targetRir: 'RIR 1-2', loadKg: 200, restSec: 90, cue: 'Deep knee bend, push through whole foot.', completedSets: [false, false, false, false], muscle: 'Quads' },
      { id: 'lw-2', name: 'Barbell Romanian Deadlift', sets: 4, reps: '8-10', targetRir: 'RIR 2', loadKg: 90, restSec: 90, cue: 'Hips back, hamstring stretch.', completedSets: [false, false, false, false], muscle: 'Hamstrings' },
      { id: 'lw-3', name: 'Bulgarian Split Squats (Dumbbells)', sets: 3, reps: '10-12', targetRir: 'RIR 1', loadKg: 18, restSec: 75, cue: 'Lean torso forward to bias glute and quad stretch.', completedSets: [false, false, false], muscle: 'Quads' },
      { id: 'lw-4', name: 'Lying Leg Curls', sets: 4, reps: '12-15', targetRir: 'RIR 0', loadKg: 40, restSec: 60, cue: 'Squeeze hamstrings violently.', completedSets: [false, false, false, false], muscle: 'Hamstrings' },
      { id: 'lw-5', name: 'Seated Calf Raises + Hanging Leg Raises', sets: 4, reps: '15-20', targetRir: 'RIR 0', loadKg: 40, restSec: 45, cue: 'Soleus calf work + lower abdominal posterior tilt.', completedSets: [false, false, false, false], muscle: 'Calves/Abs' }
    ]
  });

  // Current active exercise list
  const currentExercises = workoutSplits[selectedSplit] || workoutSplits.push;

  // Toggle individual set completed
  const handleToggleSet = (exerciseId, setIndex) => {
    setWorkoutSplits(prev => {
      const splitList = prev[selectedSplit] || [];
      const updated = splitList.map(ex => {
        if (ex.id === exerciseId) {
          const newCompleted = [...ex.completedSets];
          newCompleted[setIndex] = !newCompleted[setIndex];
          return { ...ex, completedSets: newCompleted };
        }
        return ex;
      });
      return { ...prev, [selectedSplit]: updated };
    });
  };

  const handleApplyJointSwap = (swapInfo) => {
    setWorkoutSplits(prev => {
      const splitList = prev[selectedSplit] || [];
      const updated = splitList.map((ex, idx) => {
        if (idx === 0 || ex.name.toLowerCase().includes(swapInfo.originalExercise.toLowerCase())) {
          return {
            ...ex,
            name: `[SWAPPED] ${swapInfo.swappedExercise}`,
            loadKg: Math.round((ex.loadKg * swapInfo.loadModifier) / 2.5) * 2.5,
            targetRir: swapInfo.rpeCap || ex.targetRir,
            cue: swapInfo.cue || ex.cue
          };
        }
        return ex;
      });
      return { ...prev, [selectedSplit]: updated };
    });
    setActiveTab('workout');
    toast.success(`⚡ Swapped: ${swapInfo.swappedExercise} injected into today's ${selectedSplit.toUpperCase()} split!`);
  };

  // Live session volume & tonnage lifted
  const { totalSessionSets, completedSessionSets, liveVolumeTonnageKg, maxPossibleTonnageKg } = useMemo(() => {
    let totalSets = 0;
    let doneSets = 0;
    let liveTonnage = 0;
    let maxTonnage = 0;

    currentExercises.forEach(ex => {
      const repsEst = parseInt(ex.reps.split('-')[0]) || 10;
      const effectiveLoad = Math.round(ex.loadKg * energyModifier);

      totalSets += ex.sets;
      ex.completedSets.forEach(isDone => {
        if (isDone) {
          doneSets += 1;
          liveTonnage += (effectiveLoad * repsEst);
        }
      });
      maxTonnage += (effectiveLoad * repsEst * ex.sets);
    });

    return {
      totalSessionSets: totalSets,
      completedSessionSets: doneSets,
      liveVolumeTonnageKg: liveTonnage,
      maxPossibleTonnageKg: maxTonnage
    };
  }, [currentExercises, energyModifier]);

  const sessionPercent = totalSessionSets > 0 
    ? Math.round((completedSessionSets / totalSessionSets) * 100) 
    : 0;

  // Hypertrophy Muscle Group Weekly Volume Distribution (direct sets per week)
  const muscleVolumeRadarData = useMemo(() => {
    return [
      { muscle: 'Chest', sets: 14, optimalMin: 12, optimalMax: 18, status: 'Optimal MAV' },
      { muscle: 'Back / Lats', sets: 16, optimalMin: 14, optimalMax: 20, status: 'Optimal MAV' },
      { muscle: 'Side Delts', sets: 15, optimalMin: 12, optimalMax: 18, status: 'Optimal MAV' },
      { muscle: 'Quads', sets: 13, optimalMin: 10, optimalMax: 16, status: 'Optimal MAV' },
      { muscle: 'Hamstrings', sets: 11, optimalMin: 8, optimalMax: 14, status: 'Optimal MAV' },
      { muscle: 'Biceps', sets: 10, optimalMin: 8, optimalMax: 14, status: 'Optimal MAV' },
      { muscle: 'Triceps', sets: 11, optimalMin: 8, optimalMax: 14, status: 'Optimal MAV' },
      { muscle: 'Calves / Abs', sets: 8, optimalMin: 6, optimalMax: 12, status: 'Maintenance' }
    ];
  }, []);

  // Indian Diet & Budget Breakdown calculation
  const indianDietPlan = useMemo(() => {
    // Generate meal plan matching user's selected budget & dietary category
    if (dietType === 'pure_veg') {
      if (budgetTier <= 120) {
        // Ultra Budget Veg
        return {
          title: "Desi High-Protein Ultra-Budget Protocol (Pure Veg)",
          dailyCost: 112,
          proteinGrams: 126,
          calories: 2280,
          meals: [
            { name: "Breakfast", items: "60g Sattu Drink with Roasted Jeera + 2 Besan Chilla with Curd (100g)", protein: 28, cost: 26 },
            { name: "Post-Workout", items: "70g Soya Chunks Bhurji with Onion/Tomato & Jeera Rice", protein: 37, cost: 18 },
            { name: "Evening Snack", items: "50g Roasted Chana + 1 Banana + Black Coffee", protein: 12, cost: 14 },
            { name: "Dinner", items: "100g Low-Fat Paneer Curry + 2 Whole Wheat Rotis + Dal (1 cup)", protein: 34, cost: 42 },
            { name: "Bedtime", items: "150ml Warm Haldi Milk", protein: 5, cost: 12 }
          ],
          groceryList: [
            { item: "Soya Chunks (Fortune/Nutrela)", qty: "2 kg", cost: 240, note: "52g protein per 100g at ₹12/100g" },
            { item: "Chana Sattu (Desi)", qty: "1.5 kg", cost: 180, note: "Natural plant protein powerhouse" },
            { item: "Roasted Chana (Bhoona Chana)", qty: "1 kg", cost: 140, note: "High fiber, ready-to-eat snack" },
            { item: "Paneer (Low-Fat or Local Dairy)", qty: "2 kg", cost: 720, note: "Rich casein & leucine" },
            { item: "Dahi / Curd", qty: "3 kg", cost: 180, note: "Probiotic gut support" }
          ]
        };
      } else if (budgetTier <= 200) {
        // Standard Veg
        return {
          title: "Desi Aesthetic Bodybuilding Protocol (Pure Veg)",
          dailyCost: 168,
          proteinGrams: 138,
          calories: 2350,
          meals: [
            { name: "Breakfast", items: "40g Oats with 150ml Milk, 1 scoop Sattu + 15g Peanut Butter + Banana", protein: 26, cost: 35 },
            { name: "Post-Workout", items: "60g Soya Chunks Curry + Steamed Basmati Rice + Salad", protein: 34, cost: 20 },
            { name: "Evening Snack", items: "200g Curd/Dahi with 40g Roasted Chana & Chaat Masala", protein: 16, cost: 22 },
            { name: "Dinner", items: "150g Low-Fat Paneer Tikka / Bhurji + 2 Multigrain Rotis + Dal", protein: 42, cost: 68 },
            { name: "Pre-Bed", items: "200ml Haldi Milk with 10 Almonds", protein: 8, cost: 23 }
          ],
          groceryList: [
            { item: "Low-Fat Paneer", qty: "3 kg", cost: 1050, note: "Primary lean vegetarian protein" },
            { item: "Soya Chunks", qty: "1.5 kg", cost: 180, note: "Ultra cost-efficient protein spike" },
            { item: "Curd / Dahi", qty: "4 kg", cost: 240, note: "Digestive enzyme booster" },
            { item: "Roasted Chana", qty: "1 kg", cost: 140, note: "Pocket snack" },
            { item: "Rolled Oats & Peanut Butter", qty: "1 kg + 500g", cost: 350, note: "Clean complex carbs & fats" }
          ]
        };
      } else {
        // Premium Veg with Whey
        return {
          title: "Peak Hypertrophy Gold Protocol (Pure Veg + Whey)",
          dailyCost: 265,
          proteinGrams: 154,
          calories: 2400,
          meals: [
            { name: "Breakfast", items: "50g Oats + 1 Scoop Whey Protein Isolate + 15g Almonds + Blueberries/Banana", protein: 35, cost: 95 },
            { name: "Post-Workout", items: "60g Soya Chunks Biryani with Mint Raita", protein: 36, cost: 24 },
            { name: "Evening Snack", items: "150g Dahi with 40g Roasted Chana + Green Tea", protein: 14, cost: 20 },
            { name: "Dinner", items: "180g Low-Fat Paneer Bhurji + 2 Rotis + Big Cucumber/Tomato Bowl", protein: 45, cost: 82 },
            { name: "Night Primer", items: "200ml Low-Fat Milk + Ashwagandha & Haldi", protein: 8, cost: 24 }
          ],
          groceryList: [
            { item: "Whey Protein Isolate (1kg)", qty: "1 Tub", cost: 2100, note: "Rapid post-workout MPS trigger" },
            { item: "Fresh Low-Fat Paneer", qty: "3.5 kg", cost: 1200, note: "High bioavailability" },
            { item: "Soya Chunks", qty: "1.5 kg", cost: 180, note: "Amino acid diversity" },
            { item: "Rolled Oats & Dry Fruits", qty: "1 kg", cost: 450, note: "Micronutrients & zinc" }
          ]
        };
      }
    } else if (dietType === 'eggetarian') {
      return {
        title: "Desi Eggetarian High-Protein Protocol",
        dailyCost: budgetTier <= 150 ? 135 : 195,
        proteinGrams: budgetTier <= 150 ? 134 : 152,
        calories: 2320,
        meals: [
          { name: "Breakfast", items: "4 Whole Boiled Eggs with Black Pepper + 2 Whole Wheat Toast + Tea", protein: 26, cost: 32 },
          { name: "Post-Workout", items: "3 Egg Whites + 1 Whole Egg Omelette with 50g Soya Chunks & Rice", protein: 42, cost: 36 },
          { name: "Evening Snack", items: "200g Curd with 40g Roasted Chana", protein: 16, cost: 22 },
          { name: "Dinner", items: "100g Low-Fat Paneer Bhurji + 2 Rotis + Dal Bowl", protein: 32, cost: 45 },
          { name: "Bedtime", items: "3 Boiled Egg Whites or Warm Milk", protein: 11, cost: 20 }
        ],
        groceryList: [
          { item: "Farm Fresh Eggs (Crate of 30)", qty: "2.5 Crates (75 Eggs)", cost: 480, note: "Gold standard 100% biological value protein" },
          { item: "Soya Chunks", qty: "1.5 kg", cost: 180, note: "Budget booster" },
          { item: "Low-Fat Paneer", qty: "2 kg", cost: 720, note: "Night casein" },
          { item: "Curd / Dahi", qty: "3 kg", cost: 180, note: "Gut health" }
        ]
      };
    } else {
      // Non-Veg
      return {
        title: "Desi Lean Hypertrophy Protocol (Chicken & Eggs)",
        dailyCost: budgetTier <= 150 ? 148 : 220,
        proteinGrams: budgetTier <= 150 ? 142 : 165,
        calories: 2380,
        meals: [
          { name: "Breakfast", items: "3 Whole Eggs Scrambled + 2 Rotis or Bread + 1 Apple", protein: 22, cost: 30 },
          { name: "Post-Workout", items: "180g Chicken Breast Grilled with Jeera Rice & Steamed Veggies", protein: 55, cost: 58 },
          { name: "Evening Snack", items: "4 Boiled Egg Whites + 40g Roasted Chana + Green Tea", protein: 20, cost: 24 },
          { name: "Dinner", items: "150g Chicken Breast Curry / Soya Bhurji + 2 Rotis + Salad", protein: 46, cost: 50 },
          { name: "Bedtime", items: "200ml Haldi Milk", protein: 6, cost: 15 }
        ],
        groceryList: [
          { item: "Fresh Chicken Breast (Local Butcher)", qty: "7 kg (1kg/day)", cost: 1800, note: "₹260/kg lean protein benchmark" },
          { item: "Farm Fresh Eggs", qty: "2 Crates (60 Eggs)", cost: 380, note: "Breakfast & snack staple" },
          { item: "Roasted Chana / Sattu", qty: "1 kg", cost: 140, note: "Crunchy low-fat snack" },
          { item: "Dahi & Milk", qty: "3 kg / 2L", cost: 260, note: "Calcium and vitamin D" }
        ]
      };
    }
  }, [dietType, budgetTier]);

  // Handle Photo upload for current physique
  const handleCurrentPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file too large (Max 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setPhysiqueCurrent(base64);
        localStorage.setItem(`physique_current_${effectiveAthleteId}`, base64);
        toast.success("Current physique check-in captured successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new weigh-in log
  const handleAddWeighIn = (e) => {
    e.preventDefault();
    const wt = parseFloat(newWeighIn.weight);
    if (!wt || wt < 30 || wt > 250) {
      toast.error("Please enter a realistic bodyweight (kg)");
      return;
    }
    const waistNum = parseFloat(newWeighIn.waist) || (weighInLogs[weighInLogs.length - 1]?.waist || 80);
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    const updated = [...weighInLogs, { date: dateStr, weight: wt, waist: waistNum }];
    setWeighInLogs(updated);
    localStorage.setItem(`weigh_ins_${effectiveAthleteId}`, JSON.stringify(updated));
    setNewWeighIn({ weight: '', waist: '' });
    toast.success(`Logged: ${wt} kg! Trend calculated.`);
  };

  // Toggle App Experience Mode (Interactive vs Simple Blueprint)
  const handleToggleMode = (mode) => {
    setAppMode(mode);
    updateProfileData?.({ appMode: mode });
    localStorage.setItem(`appMode_${effectiveAthleteId}`, mode);
    toast.success(`Switched to ${mode === 'interactive' ? '⚡ Interactive Live Logger' : '📄 Simple Clean Blueprint'}`);
  };

  // Switch pathway to Competitive Powerlifting Platform
  const handleSwitchToPowerlifting = () => {
    updateProfileData?.({ pathway: 'powerlifting' });
    toast.success("Switching to Powerlifting Platform...");
    setTimeout(() => {
      navigate('/dashboard');
      window.location.reload();
    }, 400);
  };

  // WhatsApp Share Generator for Workout
  const shareWorkoutOnWhatsApp = () => {
    const completedList = currentExercises.filter(ex => ex.completedSets.some(Boolean));
    const text = `🏆 *TITAN-AI FITNESS SESSION LOG* 🏆
👤 *Athlete:* ${effectiveProfile.displayName || user?.displayName || 'Fitness Lifter'}
📅 *Split:* ${selectedSplit.toUpperCase()} (${new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })})
🔥 *Energy/Pump State:* ${energyModifier === 1.025 ? 'Peak Vascularity (+2.5%)' : energyModifier === 0.95 ? 'Low Energy (-5%)' : 'Nominal 100%'}

📊 *Session Metrics:*
• Sets Completed: ${completedSessionSets} / ${totalSessionSets} (${sessionPercent}%)
• Volume Lifted: *${liveVolumeTonnageKg.toLocaleString()} KG*

⚡ *Exercises Logged:*
${completedList.length > 0
  ? completedList.map(ex => {
      const doneCount = ex.completedSets.filter(Boolean).length;
      return `  ✅ *${ex.name}*: ${doneCount}/${ex.sets} sets @ ${Math.round(ex.loadKg * energyModifier)}kg (${ex.targetRir})`;
    }).join('\n')
  : '  ⏳ Workout session in progress...'}

🥗 *Daily Nutrition:* ${indianDietPlan.title} (~${indianDietPlan.proteinGrams}g Protein, ₹${indianDietPlan.dailyCost}/day)

Logged via TITAN-AI Aesthetics & Hypertrophy Command Center`;

    const encoded = encodeURI(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    toast.success("Opening WhatsApp with formatted session summary!");
  };

  // Copy session text
  const copySessionSummary = () => {
    const completedList = currentExercises.filter(ex => ex.completedSets.some(Boolean));
    const text = `TITAN-AI FITNESS LOG - ${selectedSplit.toUpperCase()}
Sets: ${completedSessionSets}/${totalSessionSets} | Volume: ${liveVolumeTonnageKg.toLocaleString()} KG
${completedList.map(e => `${e.name}: ${e.completedSets.filter(Boolean).length}/${e.sets} sets @ ${Math.round(e.loadKg * energyModifier)}kg`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setSessionCopied(true);
    toast.success("Session summary copied to clipboard!");
    setTimeout(() => setSessionCopied(false), 2500);
  };

  // Copy grocery list to WhatsApp
  const shareGroceryOnWhatsApp = () => {
    const listText = `🛒 *TITAN-AI INDIAN HIGH-PROTEIN GROCERY LIST* 🛒
🎯 *Diet:* ${indianDietPlan.title}
💰 *Est. Daily Cost:* ₹${indianDietPlan.dailyCost}/day (~${indianDietPlan.proteinGrams}g Protein)

📋 *Items to Buy:*
${indianDietPlan.groceryList.map((g, idx) => `  ${idx + 1}. *${g.item}* — ${g.qty} (~₹${g.cost}) [${g.note}]`).join('\n')}

Generated via TITAN-AI Nutrition Protocol`;

    const encoded = encodeURI(listText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    toast.success("Opening WhatsApp with your weekly grocery checklist!");
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 p-4 sm:p-6 relative overflow-x-hidden font-sans">
      {/* Background ambient gradient glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Global Broadcast Notification Banner */}
      <GlobalBroadcastBanner targetAudience="fitness" />

      {/* TOP COMMAND HEADER */}
      <div className="relative z-10 mb-6 border-b border-zinc-800/80 pb-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-[10px] font-mono uppercase font-bold text-purple-300 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                HYPERTROPHY & RECOMP PROTOCOL
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-zinc-400">
                {effectiveProfile.splitPreference?.toUpperCase() || 'PPL'} SPLIT • {dietType.toUpperCase().replace('_', ' ')}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black italic tracking-tight text-white flex items-center gap-3">
              FITNESS & PHYSIQUE WAR ROOM
            </h1>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs">
            <TierBadge />
            <OfflineSyncBadge />

            {/* AI Real-time Protocol Synthesis */}
            <button
              onClick={() => setShowAiGenModal(true)}
              className="px-3 py-1.5 rounded border border-purple-500/50 bg-purple-950/50 text-purple-200 hover:bg-purple-900/60 hover:text-white transition-all flex items-center gap-1.5 font-bold shadow-md shadow-purple-950"
              title="Synthesize 100% Real-Time AI Hypertrophy Program with customized sets, RIR, loads, and cues"
            >
              <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>AI HYPERTROPHY SYNTHESIS 🧠</span>
            </button>

            {/* Weekly AI Micro-Cycle Evolution */}
            <button
              onClick={() => setShowWeeklyCheckInModal(true)}
              className="px-3 py-1.5 rounded border border-emerald-500/50 bg-emerald-950/50 text-emerald-200 hover:bg-emerald-900/60 hover:text-white transition-all flex items-center gap-1.5 font-bold shadow-md shadow-emerald-950"
              title="Weekly Athlete Check-In: Evolve next week's loads (+2.5kg overload / fatigue deload) with AI Brain"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>WEEKLY AI EVOLUTION ⚡</span>
            </button>

            {/* Train AI Brain */}
            <button
              onClick={() => setShowAiTrainModal(true)}
              className="px-2.5 py-1.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-1.5 font-mono text-xs"
              title="Train the AI Brain: Reinforce session difficulty and joint fatigue memory"
            >
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span>Train AI Brain</span>
            </button>

            {/* Request Human Coach (v2.0 Waitlist Gate) */}
            <button
              onClick={() => setShowCoachModal(true)}
              className="px-2.5 py-1.5 rounded border border-amber-500/40 bg-amber-950/30 text-amber-300 hover:bg-amber-900/50 hover:text-white transition-all flex items-center gap-1.5 font-bold"
              title="1-on-1 Human Coach Roster (v2.0 Release)"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>HUMAN COACH (v2.0) 🔒</span>
            </button>

            {/* Admin Console Direct Link (if admin/owner) */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="px-2.5 py-1.5 rounded border border-red-500/50 bg-red-950/60 text-red-300 hover:bg-red-900/80 hover:text-white transition-all flex items-center gap-1.5 font-bold"
                title="Open Super-Admin Command Center"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>ADMIN CONSOLE</span>
              </button>
            )}

            {/* Mode Toggle Button */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => handleToggleMode('interactive')}
                className={`px-3 py-1.5 rounded text-xs transition-all flex items-center gap-1.5 ${
                  appMode === 'interactive' 
                    ? 'bg-purple-600 text-white font-bold shadow-sm' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Live set checkoffs, timers, and volume tonnage"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Interactive</span>
              </button>
              <button
                onClick={() => handleToggleMode('simple_blueprint')}
                className={`px-3 py-1.5 rounded text-xs transition-all flex items-center gap-1.5 ${
                  appMode === 'simple_blueprint' 
                    ? 'bg-purple-600 text-white font-bold shadow-sm' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Clean printable routine sheet without buttons"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>📄 Simple Blueprint</span>
              </button>
            </div>

            {/* Switch Pathway Button */}
            <button
              onClick={handleSwitchToPowerlifting}
              className="px-3 py-1.5 rounded border border-orange-500/40 bg-orange-950/30 text-orange-300 hover:bg-orange-900/50 hover:text-white transition-all flex items-center gap-1.5 font-bold"
              title="Switch to 1RM SBD, 9-for-9 Attempt Strategist, and IPF Platform Rules"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>POWERLIFTING PLATFORM ⚡</span>
            </button>

            {/* Re-calibrate Profile */}
            <button
              onClick={() => navigate('/profile-setup')}
              className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
              title="Edit Onboarding Survey Answers"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* TOP TELEMETRY BENTO STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Metric 1: Direct Hypertrophy Sets */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Weekly Hypertrophy Sets</span>
            <Dumbbell className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black italic text-white">48</span>
            <span className="text-xs font-mono text-zinc-400">/ 64 Sets Targeted</span>
            <span className="text-xs font-mono font-bold text-emerald-400">75% MAV</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-emerald-400 h-1.5 rounded-full" style={{ width: '75%' }} />
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1.5">Optimal Muscle Hypertrophy Window</div>
        </div>

        {/* Metric 2: Protein & INR Budget Efficiency */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Protein / Budget ROI</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black italic text-white">{indianDietPlan.proteinGrams}g</span>
            <span className="text-xs font-mono text-zinc-400">@ ₹{indianDietPlan.dailyCost}/day</span>
          </div>
          <div className="text-xs font-mono text-emerald-400 mt-1 flex items-center gap-1 font-bold">
            ₹{(indianDietPlan.dailyCost / indianDietPlan.proteinGrams).toFixed(2)} per gram of Protein
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">High-bioavailability Desi Staples</div>
        </div>

        {/* Metric 3: Body Recomposition & Scale Trend */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Scale & Waist Recomp</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black italic text-white">
              {weighInLogs[weighInLogs.length - 1]?.weight || 74} KG
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">-1.6kg (Lean Phase)</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-1">
            Waist: <span className="text-white font-bold">{weighInLogs[weighInLogs.length - 1]?.waist || 82} cm</span> (Down 2cm)
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">Caloric Deficit In Golden Zone (-350 kcal)</div>
        </div>

        {/* Metric 4: Bar-Feel Auto-Regulation Dial */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Auto-Regulation Dial</span>
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
          </div>
          <div className="grid grid-cols-3 gap-1 mt-1 font-mono text-[10px]">
            <button
              onClick={() => { setEnergyModifier(0.95); toast.info("Weights auto-scaled down by 5% for recovery"); }}
              className={`py-1.5 px-1 rounded text-center transition-all ${
                energyModifier === 0.95 ? 'bg-amber-600 text-white font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title="Sleep deprived / stiff joint feel"
            >
              😴 Stiff (-5%)
            </button>
            <button
              onClick={() => { setEnergyModifier(1.0); toast.info("Weights restored to nominal 100%"); }}
              className={`py-1.5 px-1 rounded text-center transition-all ${
                energyModifier === 1.0 ? 'bg-purple-600 text-white font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title="Solid baseline pump & energy"
            >
              ⚡ Normal (100%)
            </button>
            <button
              onClick={() => { setEnergyModifier(1.025); toast.success("Peak vascularity! Working loads boosted +2.5%"); }}
              className={`py-1.5 px-1 rounded text-center transition-all ${
                energyModifier === 1.025 ? 'bg-emerald-600 text-white font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title="Carbed up, high vascularity & explosive"
            >
              🔥 Peak (+2.5%)
            </button>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-2">
            Auto-scales working dumbbell & barbell loads
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION TABS */}
      <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-thin">
        {[
          { id: 'workout', label: "Today's Hypertrophy Session", icon: Dumbbell },
          { id: 'hypertrophy_engine', label: '⚡ Hypertrophy & Volume Engine', icon: Sparkles },
          { id: 'precision_diet', label: '🥗 Precision Diet & Macros', icon: Apple },
          { id: 'joint_tweak', label: '🩹 Joint Tweak & Swap', icon: ShieldAlert },
          { id: 'tempo_coach', label: '⏱️ Tempo Metronome', icon: Clock },
          { id: 'volume_radar', label: 'Muscle Volume & Hypertrophy Radar', icon: Layers },
          { id: 'nutrition', label: 'Desi Budget Nutrition & Groceries', icon: IndianRupee },
          { id: 'physique', label: 'Physique Transformation Lab', icon: Camera },
          { id: 'warmup', label: 'Mobility & Prehab Primers', icon: Flame }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive 
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-950' 
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREAS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + appMode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* ========================================================================= */}
          {/* TAB 1: TODAY'S HYPERTROPHY SESSION */}
          {/* ========================================================================= */}
          {activeTab === 'workout' && (
            <div className="space-y-6">
              {/* Split Selector Pill Bar */}
              <div className="flex items-center justify-between flex-wrap gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase">Current Split Day:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      ...(Object.keys(workoutSplits).some(k => k.startsWith('ai_day_'))
                        ? Object.keys(workoutSplits)
                            .filter(k => k.startsWith('ai_day_'))
                            .map((k, idx) => ({ id: k, label: `🧠 AI Day ${idx + 1}` }))
                        : [
                            { id: 'push', label: 'Push (Chest & Delts)' },
                            { id: 'pull', label: 'Pull (Lats & Biceps)' },
                            { id: 'legs', label: 'Legs (Quads & Hams)' },
                            { id: 'upper', label: 'Upper Body A' },
                            { id: 'lower', label: 'Lower Body A' }
                          ]
                      )
                    ].map(split => (
                      <button
                        key={split.id}
                        onClick={() => setSelectedSplit(split.id)}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                          selectedSplit === split.id
                            ? 'bg-purple-600 text-white font-bold'
                            : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {split.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => setActiveTab('joint_tweak')}
                    className="bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 font-mono text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1.5 transition-colors shadow-md shadow-red-950"
                    title="Feeling joint discomfort? Instant biomechanical swap for today's session"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    Joint Tweak Swap
                  </button>
                  <button
                    onClick={() => setActiveTab('tempo_coach')}
                    className="bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-950"
                    title="Pace reps with precision eccentric tempo metronome"
                  >
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Tempo Pacer
                  </button>
                  <button
                    onClick={() => setShowAiTrainModal(true)}
                    className="bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1.5 transition-colors shadow-md shadow-purple-950"
                    title="Train the AI Brain on muscle pump, joint status, and fatigue"
                  >
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                    Train AI Brain
                  </button>
                  <button
                    onClick={shareWorkoutOnWhatsApp}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share on WhatsApp
                  </button>
                  <button
                    onClick={copySessionSummary}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs py-1.5 px-3 rounded flex items-center gap-1.5 transition-colors border border-zinc-700"
                  >
                    {sessionCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Log
                  </button>
                </div>
              </div>

              {/* LIVE TONNAGE & REST TIMER STRIP (Interactive Mode) */}
              {appMode === 'interactive' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Tonnage Banner */}
                  <div className="lg:col-span-2 bg-gradient-to-r from-zinc-900 via-zinc-950 to-purple-950/40 border border-purple-500/30 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-purple-400 animate-pulse" />
                        <span className="text-xs font-mono uppercase font-bold text-purple-300">
                          Hypertrophy Volume Tonnage Meter
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-purple-400">
                        {sessionPercent}% Completed
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-black italic font-mono text-white">
                        {liveVolumeTonnageKg.toLocaleString()}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">/ ~{maxPossibleTonnageKg.toLocaleString()} KG Target</span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        ({completedSessionSets} of {totalSessionSets} Sets Done)
                      </span>
                    </div>

                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-600 via-purple-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${sessionPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Rest Timer Widget */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 flex flex-col justify-center">
                    <InRackRestTimer defaultRestSeconds={90} />
                  </div>
                </div>
              )}

              {/* EXERCISE LIST: INTERACTIVE MODE */}
              {appMode === 'interactive' && (
                <div className="space-y-4">
                  {currentExercises.map((ex, exIndex) => {
                    const effectiveLoad = Math.round(ex.loadKg * energyModifier);
                    const setsDoneCount = ex.completedSets.filter(Boolean).length;
                    const isFullyDone = setsDoneCount === ex.sets;

                    return (
                      <div 
                        key={ex.id}
                        className={`rounded-xl border transition-all p-4 ${
                          isFullyDone 
                            ? 'bg-zinc-900/40 border-emerald-500/30' 
                            : 'bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-purple-400 font-bold">#{exIndex + 1}</span>
                              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                                {ex.name}
                                {isFullyDone && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                              </h3>
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300">
                                {ex.muscle}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1 italic leading-relaxed">
                              💡 <span className="text-zinc-300 font-medium">Mind-Muscle Cue:</span> {ex.cue}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                            <span className="px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 font-bold">
                              {effectiveLoad} KG
                            </span>
                            <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300">
                              {ex.reps} Reps
                            </span>
                            <span className="px-2 py-1 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300">
                              {ex.targetRir}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Sets Grid */}
                        <div className="border-t border-zinc-800/80 pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono uppercase text-zinc-400">
                              Working Sets ({setsDoneCount}/{ex.sets} Complete)
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              Rest: {ex.restSec}s between sets
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {ex.completedSets.map((isDone, setIdx) => (
                              <button
                                key={setIdx}
                                onClick={() => handleToggleSet(ex.id, setIdx)}
                                className={`py-2 px-3 rounded-lg border text-left font-mono transition-all flex items-center justify-between ${
                                  isDone
                                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                                    : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:border-purple-500 hover:text-white'
                                }`}
                              >
                                <div>
                                  <div className="text-[10px] text-zinc-400">SET {setIdx + 1}</div>
                                  <div className="text-xs font-bold text-white">
                                    {effectiveLoad}kg × {ex.reps}
                                  </div>
                                </div>
                                {isDone ? (
                                  <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded border border-zinc-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* EXERCISE LIST: SIMPLE CLEAN BLUEPRINT MODE */}
              {appMode === 'simple_blueprint' && (
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 shadow-xl">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                    <div>
                      <div className="text-xs font-mono uppercase text-purple-400 font-bold">
                        TITAN-AI CLEAN WORKOUT BLUEPRINT
                      </div>
                      <h2 className="text-xl font-bold text-white mt-0.5">
                        {selectedSplit.toUpperCase()} ROUTINE — HYPERTROPHY FOCUS
                      </h2>
                    </div>
                    <div className="text-right text-xs font-mono text-zinc-400">
                      <div>Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div className="text-emerald-400 font-bold">Readiness: 100% Nominal</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                          <th className="pb-3 pr-4">#</th>
                          <th className="pb-3 pr-4">Exercise Name</th>
                          <th className="pb-3 pr-4">Target Muscle</th>
                          <th className="pb-3 pr-4">Sets × Reps</th>
                          <th className="pb-3 pr-4">Load (KG)</th>
                          <th className="pb-3 pr-4">Intensity / RIR</th>
                          <th className="pb-3 pr-4">Rest</th>
                          <th className="pb-3">Key Execution Cue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {currentExercises.map((ex, idx) => (
                          <tr key={ex.id} className="hover:bg-zinc-800/30">
                            <td className="py-3 pr-4 font-mono text-purple-400 font-bold">{idx + 1}</td>
                            <td className="py-3 pr-4 font-bold text-white">{ex.name}</td>
                            <td className="py-3 pr-4 text-zinc-400">{ex.muscle}</td>
                            <td className="py-3 pr-4 font-mono text-zinc-200">{ex.sets} × {ex.reps}</td>
                            <td className="py-3 pr-4 font-mono font-bold text-purple-300">{Math.round(ex.loadKg * energyModifier)} kg</td>
                            <td className="py-3 pr-4 font-mono text-amber-300">{ex.targetRir}</td>
                            <td className="py-3 pr-4 font-mono text-zinc-400">{ex.restSec}s</td>
                            <td className="py-3 text-zinc-400 italic max-w-xs">{ex.cue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
                    <div>Total Working Sets: <span className="text-white font-bold">{totalSessionSets}</span></div>
                    <button
                      onClick={() => window.print()}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-1.5 px-3 rounded flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Workout Sheet
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MUSCLE VOLUME & HYPERTROPHY RADAR */}
          {/* ========================================================================= */}
          {activeTab === 'volume_radar' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      Weekly Hypertrophy Direct Sets Radar
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Scientific landmarks: Maintenance Volume (MV: 6-8 sets), Minimum Effective Volume (MEV: 10 sets), Maximum Adaptive Volume (MAV: 12-18 sets optimal sweet spot), and Maximum Recoverable Volume (MRV: 20-22 sets).
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> MAV Sweet Spot (12-18)
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <span className="w-2 h-2 rounded-full bg-zinc-600" /> Maintenance (&lt;10)
                    </span>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={muscleVolumeRadarData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="muscle" stroke="#a1a1aa" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#a1a1aa" domain={[0, 22]} tick={{ fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                        formatter={(val) => [`${val} Direct Sets/Week`, 'Volume']}
                      />
                      <Bar dataKey="sets" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Muscle Group Detail Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {muscleVolumeRadarData.map(group => (
                  <div key={group.muscle} className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-sm font-bold text-white">{group.muscle}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/30">
                        {group.status}
                      </span>
                    </div>
                    <div className="text-2xl font-black italic font-mono text-white mb-2">
                      {group.sets} <span className="text-xs font-normal text-zinc-400">sets/wk</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-purple-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (group.sets / 20) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1.5">
                      <span>MEV: {group.optimalMin}</span>
                      <span>MRV: {group.optimalMax + 2}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: DESI BUDGET NUTRITION & GROCERY ENGINE */}
          {/* ========================================================================= */}
          {activeTab === 'nutrition' && (
            <div className="space-y-6">
              {/* Controls Bar */}
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                    Indian Budget Nutrition Calculator
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Hit your macro targets affordably using local Indian staples.
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Diet Selector */}
                  <div className="flex items-center bg-zinc-800 p-1 rounded-lg">
                    {[
                      { id: 'pure_veg', label: 'Pure Veg' },
                      { id: 'eggetarian', label: 'Eggetarian' },
                      { id: 'non_veg', label: 'Non-Veg' }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setDietType(type.id)}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                          dietType === type.id
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Budget Selector */}
                  <div className="flex items-center bg-zinc-800 p-1 rounded-lg">
                    {[
                      { id: 100, label: '₹100/day' },
                      { id: 150, label: '₹150/day' },
                      { id: 250, label: '₹250/day' }
                    ].map(b => (
                      <button
                        key={b.id}
                        onClick={() => setBudgetTier(b.id)}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                          budgetTier === b.id
                            ? 'bg-purple-600 text-white font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={shareGroceryOnWhatsApp}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    WhatsApp Grocery List
                  </button>
                </div>
              </div>

              {/* Diet Summary Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Daily Meal Blueprint */}
                <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                    <div>
                      <h4 className="text-base font-bold text-white">{indianDietPlan.title}</h4>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        Estimated Cost: ₹{indianDietPlan.dailyCost}/day
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black italic text-purple-400 font-mono">
                        {indianDietPlan.proteinGrams}g Protein
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">~{indianDietPlan.calories} kcal</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {indianDietPlan.meals.map((meal, mIdx) => (
                      <div key={mIdx} className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-700/40 flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold font-mono text-purple-300">{meal.name}</span>
                            <span className="text-[10px] font-mono text-zinc-500">• ₹{meal.cost}</span>
                          </div>
                          <p className="text-xs text-zinc-300">{meal.items}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold">
                            {meal.protein}g Protein
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desi Swaps Engine */}
                  <div className="mt-5 p-4 rounded-xl bg-purple-950/20 border border-purple-500/30">
                    <h5 className="text-xs font-bold font-mono uppercase text-purple-300 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Smart Desi Swaps Engine (1-Tap Equivalent Protein)
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                      <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                        <span className="font-bold text-white">Out of Paneer?</span>
                        <div className="text-zinc-400 text-[11px] mt-0.5">
                          Swap 100g Paneer (18g protein, ₹40) with <span className="text-emerald-400 font-bold">35g Soya Chunks (18g protein, ₹4.5)</span>. Saves ₹35!
                        </div>
                      </div>
                      <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                        <span className="font-bold text-white">No Whey Protein?</span>
                        <div className="text-zinc-400 text-[11px] mt-0.5">
                          Swap 1 scoop Whey (25g protein, ₹75) with <span className="text-emerald-400 font-bold">4 Boiled Eggs (24g protein, ₹26)</span> or 50g Soya + 200g Curd.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Grocery Checklist */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                    <h4 className="text-sm font-bold font-mono uppercase text-white">Weekly Grocery Checklist</h4>
                    <span className="text-xs font-mono text-emerald-400">Weekly Batch</span>
                  </div>

                  <div className="space-y-3">
                    {indianDietPlan.groceryList.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{item.item}</span>
                          <span className="font-mono text-emerald-400 font-bold">₹{item.cost}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                          <span>Qty: {item.qty}</span>
                          <span className="italic text-zinc-500">{item.note}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 text-center">
                    <button
                      onClick={shareGroceryOnWhatsApp}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Send to WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: PHYSIQUE TRANSFORMATION LAB */}
          {/* ========================================================================= */}
          {activeTab === 'physique' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Baseline Photo */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold font-mono uppercase text-zinc-300">Baseline Physique Check-in</h4>
                      <span className="text-[11px] font-mono text-zinc-500">Day 1 Onboarding Photo</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400">Baseline</span>
                  </div>

                  <div className="aspect-[3/4] bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center overflow-hidden relative">
                    {physiqueBaseline ? (
                      <img src={physiqueBaseline} alt="Baseline Physique" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6 text-zinc-500">
                        <Camera className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
                        <p className="text-xs">No baseline photo on record.</p>
                        <p className="text-[10px] text-zinc-600 mt-1">Complete setup survey to upload baseline photo.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Check-in Photo */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold font-mono uppercase text-purple-300">Current Physique Check-in</h4>
                      <span className="text-[11px] font-mono text-zinc-500">Updated Weekly for Recomp Tracking</span>
                    </div>
                    <label className="cursor-pointer px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Photo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleCurrentPhotoUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <div className="aspect-[3/4] bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center overflow-hidden relative">
                    {physiqueCurrent ? (
                      <img src={physiqueCurrent} alt="Current Physique" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6 text-zinc-500">
                        <Camera className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
                        <p className="text-xs">No current check-in photo.</p>
                        <p className="text-[10px] text-zinc-600 mt-1">Snap a mirror photo to inspect V-taper & vascularity.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Weigh-in History & Trend Chart */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Scale className="w-4 h-4 text-cyan-400" />
                      Bodyweight & Waist Progression Trend
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Target recomposition rate: 0.25kg - 0.4kg change per week to ensure muscle retention.
                    </p>
                  </div>

                  {/* Weigh-in entry form */}
                  <form onSubmit={handleAddWeighIn} className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Weight (kg)"
                      value={newWeighIn.weight}
                      onChange={(e) => setNewWeighIn({ ...newWeighIn, weight: e.target.value })}
                      className="w-28 px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="number"
                      step="0.5"
                      placeholder="Waist (cm)"
                      value={newWeighIn.waist}
                      onChange={(e) => setNewWeighIn({ ...newWeighIn, waist: e.target.value })}
                      className="w-28 px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Log
                    </button>
                  </form>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weighInLogs} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#71717a" domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="weight" stroke="#38bdf8" strokeWidth={2.5} name="Bodyweight (kg)" dot={{ r: 4, fill: '#38bdf8' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: MOBILITY & PREHAB PRIMERS */}
          {/* ========================================================================= */}
          {activeTab === 'warmup' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-white">5-Minute Dynamic Warm-Up & Joint Priming</h3>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Perform these dynamic mobility flows before your heavy sets to increase synovial fluid, enhance shoulder capsule health, and maximize mind-muscle activation.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-xl p-4">
                    <div className="text-xs font-mono text-purple-400 font-bold mb-1">UPPER BODY PRIMER</div>
                    <h4 className="text-sm font-bold text-white mb-2">Band Pull-Aparts & Dislocates</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      2 sets × 15 reps. Keep arms straight, squeeze rear delts and retract scapulae. Opens the anterior shoulder capsule before pressing.
                    </p>
                  </div>

                  <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-xl p-4">
                    <div className="text-xs font-mono text-purple-400 font-bold mb-1">LOWER BODY PRIMER</div>
                    <h4 className="text-sm font-bold text-white mb-2">90/90 Hip Flow & Ankle Dorsiflexion</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      2 sets × 8 rotations per side. Unlocks tight internal hip rotation and calf tightness so knees track cleanly over toes.
                    </p>
                  </div>

                  <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-xl p-4">
                    <div className="text-xs font-mono text-purple-400 font-bold mb-1">THORACIC & CORE PRIMER</div>
                    <h4 className="text-sm font-bold text-white mb-2">World's Greatest Stretch</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      5 reps per side. Lunging reach with elbow to instep followed by high thoracic rotation. Frees up upper back mobility for rows and squats.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: HYPERTROPHY & VOLUME ENGINE */}
          {activeTab === 'hypertrophy_engine' && (
            <HypertrophyIntelligence />
          )}

          {/* TAB: PRECISION DIET & MACROS */}
          {activeTab === 'precision_diet' && (
            <PrecisionDietEngine athleteWeight={effectiveProfile.bodyweight || 74} athleteGoal={effectiveProfile.primaryGoal || 'hypertrophy'} />
          )}

          {/* TAB: JOINT TWEAK & EXERCISE SWAP */}
          {activeTab === 'joint_tweak' && (
            <JointTweakEngine onApplySwap={handleApplyJointSwap} />
          )}

          {/* TAB: AUDIO TEMPO METRONOME */}
          {activeTab === 'tempo_coach' && (
            <TempoAudioCoach />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Embedded Intelligent AI Coach Assistant */}
      <AIChatBot />

      {/* Real-Time AI Hypertrophy Program Generator Modal */}
      <AIProgramGeneratorModal
        isOpen={showAiGenModal}
        onClose={() => setShowAiGenModal(false)}
        pathway="fitness"
        profile={profile}
        athleteId={effectiveAthleteId}
        onProgramGenerated={applyAiProgramToSplits}
      />

      {/* AI Brain Reinforcement Training Modal */}
      <AIBrainTrainingModal
        isOpen={showAiTrainModal}
        onClose={() => setShowAiTrainModal(false)}
        athleteId={effectiveAthleteId}
        currentExercises={currentExercises}
      />

      {/* Weekly AI Micro-Cycle Evolution Modal */}
      <WeeklyCheckInModal
        isOpen={showWeeklyCheckInModal}
        onClose={() => setShowWeeklyCheckInModal(false)}
        athleteId={effectiveAthleteId}
        pathway="fitness"
        currentWeekNumber={currentWeekNumber}
        currentProgram={activeAiProgramTitle ? {
          programTitle: activeAiProgramTitle,
          days: Object.keys(workoutSplits).map((splitKey, idx) => ({
            dayNumber: idx + 1,
            dayName: splitKey.toUpperCase(),
            exercises: workoutSplits[splitKey]
          }))
        } : null}
        onWeekEvolved={(evolvedProg) => {
          if (evolvedProg) {
            applyAiProgramToSplits(evolvedProg);
            setCurrentWeekNumber(evolvedProg.weekNumber || (currentWeekNumber + 1));
          }
        }}
      />

      {/* Human Coach Mode v2.0 Waitlist Gate Modal */}
      <HumanCoachComingSoonModal
        isOpen={showCoachModal}
        onClose={() => setShowCoachModal(false)}
        user={user}
        profile={profile}
        pathway="fitness"
      />
    </div>
  );
}
