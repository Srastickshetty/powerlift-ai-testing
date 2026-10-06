import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  AlertTriangle, 
  X, 
  Check, 
  ShieldAlert, 
  Dumbbell, 
  Scale, 
  Calendar, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  pathway = 'powerlifting', 
  profile = {}, 
  athleteId = 'athlete_demo',
  onProfileUpdated 
}) {
  const [formData, setFormData] = useState({
    bodyweight: profile.bodyweight || 74,
    squat: profile.training_max?.squat || profile.squat || 195,
    bench: profile.training_max?.bench || profile.bench || 130,
    deadlift: profile.training_max?.deadlift || profile.deadlift || 235,
    daysAvailable: profile.daysAvailable || 4,
    splitPreference: profile.splitPreference || (pathway === 'powerlifting' ? 'sbd' : 'ppl'),
    dietType: profile.dietType || 'pure_veg',
    dailyBudgetINR: profile.dailyBudgetINR || 150
  });

  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleTriggerSave = (e) => {
    e.preventDefault();
    // Prompt the safety warning
    setShowWarningDialog(true);
  };

  const handleConfirmDestructiveUpdate = async () => {
    setIsSaving(true);
    setShowWarningDialog(false);

    try {
      const updatedProfile = {
        ...profile,
        ...formData,
        bodyweight: parseFloat(formData.bodyweight) || 74,
        training_max: {
          squat: parseFloat(formData.squat) || 140,
          bench: parseFloat(formData.bench) || 100,
          deadlift: parseFloat(formData.deadlift) || 180
        },
        updated_at: new Date().toISOString()
      };

      // 1. Save updated profile to localStorage
      localStorage.setItem(`profile_${athleteId}`, JSON.stringify(updatedProfile));

      // 2. Synthesize freshly calibrated 4-week protocol derived mathematically from new 1RMs
      const sq = parseFloat(formData.squat) || 140;
      const bp = parseFloat(formData.bench) || 100;
      const dl = parseFloat(formData.deadlift) || 180;
      const days = parseInt(formData.daysAvailable) || 4;

      const baseDays = pathway === 'powerlifting' ? [
        {
          dayNumber: 1,
          dayName: "Day 1: Competition Squat & Quad Drive",
          focus: "Squat Technique & Rate of Force Development",
          warmupPrimer: "90/90 Hip Flow + Ankle Dorsiflexion + 3 Empty Bar Pause Sets",
          exercises: [
            { name: "Competition Squat — Top Single @ RPE 8", sets: 1, reps: "1", loadKg: Math.round((sq * 0.90) / 2.5) * 2.5, cue: "IPF Command simulation: 1-sec pause below parallel." },
            { name: "Competition Squat — Volume Backoffs", sets: 4, reps: "4", loadKg: Math.round((sq * 0.76) / 2.5) * 2.5, cue: "Drive upper back aggressively into the bar." },
            { name: "Bulgarian Split Squats", sets: 3, reps: "8-10", loadKg: 24, cue: "Load front quad smoothly." },
            { name: "Ab Wheel Rollouts", sets: 3, reps: "10-12", loadKg: 0, cue: "Maintain posterior pelvic tilt." }
          ]
        },
        {
          dayNumber: 2,
          dayName: "Day 2: Competition Bench Press & Scapular Drive",
          focus: "Pectoral Reversal & Lat Stability",
          warmupPrimer: "Band Pull-Aparts + Shoulder Dislocates + Rotator Cuff Primer",
          exercises: [
            { name: "Competition Bench Press — Top Single @ RPE 8", sets: 1, reps: "1", loadKg: Math.round((bp * 0.91) / 2.5) * 2.5, cue: "Full motionless pause on chest." },
            { name: "Competition Bench Press — Volume Sets", sets: 4, reps: "4", loadKg: Math.round((bp * 0.78) / 2.5) * 2.5, cue: "Drive heels into floor, wedge upper traps." },
            { name: "Chest Supported Dumbbell Rows", sets: 4, reps: "10-12", loadKg: 28, cue: "1-sec isometric squeeze at top." },
            { name: "EZ-Bar Skull Crushers", sets: 3, reps: "10-12", loadKg: 30, cue: "Lower behind head to stretch long head." }
          ]
        },
        {
          dayNumber: 3,
          dayName: "Day 3: Competition Deadlift & Posterior Chain Engine",
          focus: "Wedge & Slack Pull from Floor",
          warmupPrimer: "World's Greatest Stretch + Hamstring Sweeps + Glute Bridge Activations",
          exercises: [
            { name: "Competition Deadlift — Top Single @ RPE 8", sets: 1, reps: "1", loadKg: Math.round((dl * 0.90) / 2.5) * 2.5, cue: "Pull slack out of bar, wedge hips forward." },
            { name: "Deficit Deadlift (1.5-inch)", sets: 3, reps: "3", loadKg: Math.round((dl * 0.72) / 2.5) * 2.5, cue: "Violent quad push off floor." },
            { name: "Barbell Romanian Deadlifts", sets: 3, reps: "8-10", loadKg: Math.round((dl * 0.55) / 2.5) * 2.5, cue: "Hips back, deep hamstring stretch." },
            { name: "Hanging Leg Raises", sets: 3, reps: "12-15", loadKg: 0, cue: "Decompress lumbar spine." }
          ]
        },
        {
          dayNumber: 4,
          dayName: "Day 4: SBD Volume Flush & Weak-Point Hypertrophy",
          focus: "Secondary Overload & Structural Balance",
          warmupPrimer: "Thoracic Extensions on Foam Roller + Lat Pulldown Primer",
          exercises: [
            { name: "Close-Grip Bench Press", sets: 3, reps: "6", loadKg: Math.round((bp * 0.70) / 2.5) * 2.5, cue: "Shoulder-width grip. Explosive triceps extension." },
            { name: "Belt Squats or Front Squats", sets: 3, reps: "8", loadKg: Math.round((sq * 0.60) / 2.5) * 2.5, cue: "Pure knee flexion, zero lower back load." },
            { name: "Neutral-Grip Lat Pulldowns", sets: 4, reps: "10-12", loadKg: 65, cue: "Pull elbows straight down into pockets." },
            { name: "Standing Calf Raises", sets: 4, reps: "15", loadKg: 50, cue: "2-sec deep bottom stretch." }
          ]
        }
      ] : [
        {
          dayNumber: 1,
          dayName: "Day 1: Push Hypertrophy (Chest, Delts & Triceps)",
          focus: "Clavicular Pecs & Lateral Delt Hypertrophy",
          warmupPrimer: "Band Dislocates + Arm Circles + Pushup Holds",
          exercises: [
            { name: "Incline Barbell Bench Press", sets: 4, reps: "6-8", loadKg: Math.round((bp * 0.75) / 2.5) * 2.5, cue: "Lower to upper chest, squeeze clavicular pecs." },
            { name: "Dumbbell Seated Shoulder Press", sets: 3, reps: "8-10", loadKg: 26, cue: "Clean pressing groove overhead." },
            { name: "Cable Lateral Raises", sets: 4, reps: "12-15", loadKg: 10, cue: "Sweep hands outward towards walls." },
            { name: "Cable Triceps Pushdowns", sets: 3, reps: "12-15", loadKg: 30, cue: "Pin elbows to sides. Full lockout." }
          ]
        },
        {
          dayNumber: 2,
          dayName: "Day 2: Pull Hypertrophy (Lats, Upper Back & Biceps)",
          focus: "V-Taper Lat Width & Rhomboid Thickness",
          warmupPrimer: "Dead Hangs + Scapular Shrugs + Band Pull-Aparts",
          exercises: [
            { name: "Neutral-Grip Lat Pulldowns", sets: 4, reps: "8-10", loadKg: 65, cue: "Full stretch at top. Drive elbows down." },
            { name: "Chest-Supported Dumbbell Rows", sets: 3, reps: "10-12", loadKg: 28, cue: "1-sec pause at peak retraction." },
            { name: "Incline Dumbbell Bicep Curls", sets: 3, reps: "10-12", loadKg: 14, cue: "Deep stretch at bottom, supinate at top." },
            { name: "Facepulls with Rope", sets: 4, reps: "15-20", loadKg: 25, cue: "Pull to forehead, external rotation." }
          ]
        },
        {
          dayNumber: 3,
          dayName: "Day 3: Lower Body Hypertrophy (Quads & Hamstrings)",
          focus: "Quad Sweep & Hamstring Mass",
          warmupPrimer: "Leg Swings + Bodyweight Squats + Ankle Mobility",
          exercises: [
            { name: "Leg Press (Deep Knee Bend)", sets: 4, reps: "10-12", loadKg: 180, cue: "Full depth without pelvic tucking." },
            { name: "Barbell Romanian Deadlift", sets: 4, reps: "8-10", loadKg: Math.round((dl * 0.50) / 2.5) * 2.5, cue: "Hips back, deep hamstring stretch." },
            { name: "Lying Leg Curls", sets: 4, reps: "12-15", loadKg: 40, cue: "Squeeze hamstrings at contraction." },
            { name: "Standing Calf Raises", sets: 4, reps: "15-20", loadKg: 60, cue: "Dead pause at deepest bottom stretch." }
          ]
        },
        {
          dayNumber: 4,
          dayName: "Day 4: Upper Body Sculpt & Weak-Point Overload",
          focus: "Chest Density & Arm Volume",
          warmupPrimer: "World's Greatest Stretch + Banded External Rotations",
          exercises: [
            { name: "Flat Dumbbell Press", sets: 4, reps: "8-10", loadKg: 32, cue: "Deep chest stretch, convergent press." },
            { name: "Barbell Pendlay Rows", sets: 3, reps: "8-10", loadKg: 65, cue: "Explosive pull from dead stop on floor." },
            { name: "Hammer Curls + Overhead Triceps Extension", sets: 3, reps: "12", loadKg: 16, cue: "Brachialis density & long head triceps peak." }
          ]
        }
      ];

      const weekDefs = pathway === 'powerlifting' ? [
        { weekNumber: 1, name: "Week 1: Accumulation & Base Volume", phase: "Accumulation", focus: "Establish movement rhythm & initial bar speed", loadModifier: 1.0, setModifier: 0 },
        { weekNumber: 2, name: "Week 2: Progressive Overload Wave", phase: "Progression", focus: "+2.5kg to +5kg overload across main compounds", loadModifier: 1.025, setModifier: 0 },
        { weekNumber: 3, name: "Week 3: Peak Overload & Singles", phase: "Peak", focus: "High intensity, singles @ RPE 8.5, rate of force", loadModifier: 1.05, setModifier: 0 },
        { weekNumber: 4, name: "Week 4: Deload & Realization", phase: "Deload", focus: "CNS fatigue flush, volume reduced by 1 set, joint recovery", loadModifier: 0.85, setModifier: -1 }
      ] : [
        { weekNumber: 1, name: "Week 1: Minimum Effective Volume (MEV)", phase: "Accumulation", focus: "RIR 3 baseline, introduce movement patterns", loadModifier: 1.0, setModifier: 0 },
        { weekNumber: 2, name: "Week 2: Maximum Adaptive Volume (MAV 1)", phase: "Progression", focus: "RIR 2, progressive load +2.5kg", loadModifier: 1.025, setModifier: 0 },
        { weekNumber: 3, name: "Week 3: Peak Hypertrophy Overload (MAV 2)", phase: "Peak", focus: "RIR 1, maximum muscle pump and volume", loadModifier: 1.05, setModifier: 0 },
        { weekNumber: 4, name: "Week 4: Resensitization Deload", phase: "Deload", focus: "RIR 4, volume cut by 30%, resensitize receptors", loadModifier: 0.85, setModifier: -1 }
      ];

      const fullWeeks = weekDefs.map(def => ({
        ...def,
        days: baseDays.map(day => ({
          ...day,
          exercises: day.exercises.map(ex => ({
            ...ex,
            loadKg: Math.round((ex.loadKg * def.loadModifier) / 2.5) * 2.5,
            sets: Math.max(2, ex.sets + def.setModifier)
          }))
        }))
      }));

      const freshProtocol = {
        programTitle: `${days}-Day Recalibrated ${pathway === 'powerlifting' ? 'Competitive SBD Wave' : 'Hypertrophy MAV Split'}`,
        pathway,
        daysPerWeek: days,
        periodizationModel: pathway === 'powerlifting' ? "Prilepin DUP 4-Week Block" : "Israetel Hypertrophy Landmarks",
        aiCoachSummary: `Recalibrated to match your new 1RM baseline (SQ: ${sq}kg, BP: ${bp}kg, DL: ${dl}kg). Working sets calibrated to optimal intensity zones.`,
        days: baseDays,
        weeks: fullWeeks,
        totalWeeks: 4
      };

      localStorage.setItem(`active_ai_program_${athleteId}`, JSON.stringify(freshProtocol));
      localStorage.setItem(`active_ai_program_date_${athleteId}`, new Date().toISOString());

      toast.success("Profile recalibrated! 4-Week Protocol synthesized to your new 1RM baseline.");

      if (onProfileUpdated) {
        onProfileUpdated(updatedProfile);
      }

      onClose();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save settings: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 relative shadow-2xl my-8"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Calibration & Athlete Settings
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Current World: <span className="uppercase font-bold text-orange-400">{pathway}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SETTINGS FORM */}
        <form onSubmit={handleTriggerSave} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                Bodyweight (KG)
              </label>
              <input
                type="number"
                value={formData.bodyweight}
                onChange={e => setFormData({ ...formData, bodyweight: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-orange-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                Training Days / Week
              </label>
              <select
                value={formData.daysAvailable}
                onChange={e => setFormData({ ...formData, daysAvailable: parseInt(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-orange-500 focus:outline-none"
              >
                <option value={3}>3 Days (Full Body / SBD)</option>
                <option value={4}>4 Days (Upper / Lower)</option>
                <option value={5}>5 Days (DUP / High Volume)</option>
                <option value={6}>6 Days (Push / Pull / Legs)</option>
              </select>
            </div>
          </div>

          {/* 1RM Strength Baselines */}
          <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider block">
              1RM Baseline / Working Capacity (KG)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-mono text-zinc-500 block mb-0.5">SQUAT</label>
                <input
                  type="number"
                  value={formData.squat}
                  onChange={e => setFormData({ ...formData, squat: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-500 block mb-0.5">BENCH</label>
                <input
                  type="number"
                  value={formData.bench}
                  onChange={e => setFormData({ ...formData, bench: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-500 block mb-0.5">DEADLIFT</label>
                <input
                  type="number"
                  value={formData.deadlift}
                  onChange={e => setFormData({ ...formData, deadlift: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Nutrition & Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                Dietary Category
              </label>
              <select
                value={formData.dietType}
                onChange={e => setFormData({ ...formData, dietType: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-orange-500 focus:outline-none"
              >
                <option value="pure_veg">Pure Vegetarian (Desi)</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="non_veg">Non-Vegetarian</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
                Daily Budget (INR)
              </label>
              <select
                value={formData.dailyBudgetINR}
                onChange={e => setFormData({ ...formData, dailyBudgetINR: parseInt(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-orange-500 focus:outline-none"
              >
                <option value={100}>₹100 / day (Ultra Budget)</option>
                <option value={150}>₹150 / day (Optimal Soya/Paneer)</option>
                <option value={250}>₹250 / day (Premium Protein)</option>
                <option value={350}>₹350+ / day (Unlimited)</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-950 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Save & Re-Synthesize Protocol</span>
            </button>
          </div>
        </form>
      </motion.div>

      {/* STRICT SAFETY WARNING MODAL */}
      {showWarningDialog && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-amber-500/60 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl shadow-amber-950/40">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest">
                CRITICAL SAFETY RULE
              </span>
              <h3 className="text-xl font-black italic uppercase text-white">
                OVERWRITE ACTIVE TRAINING BLOCK?
              </h3>
              <p className="text-xs font-mono text-zinc-300 leading-relaxed text-left bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl">
                ⚠️ <span className="text-amber-400 font-bold">WARNING:</span> Recalibrating your 1RMs or baseline stats will immediately overwrite your active training block and reset your current week's logged progress.
                <br /><br />
                A new, individualized periodization block will be synthesized from your updated numbers.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowWarningDialog(false)}
                className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-xs"
              >
                Cancel / Keep Current
              </button>
              <button
                onClick={handleConfirmDestructiveUpdate}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold shadow-lg shadow-amber-950 transition-all flex items-center justify-center gap-1.5"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Yes, Overwrite & Update</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
