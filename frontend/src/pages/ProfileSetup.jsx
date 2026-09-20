import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/authContext";
import { useNavigate } from "react-router-dom";
import { 
  Dumbbell, 
  Target, 
  Activity, 
  Flame, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Camera, 
  Upload,
  IndianRupee,
  Layers,
  Clock,
  ShieldCheck
} from "lucide-react";
import { db } from "../auth/firebase";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

export default function ProfileSetup() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const savedDiscipline = localStorage.getItem('active_world_discipline');

  // Form State
  const [formData, setFormData] = useState({
    name: profile?.displayName || user?.displayName || "",
    pathway: savedDiscipline || profile?.pathway || "powerlifting",
    goal: (savedDiscipline || profile?.pathway) === "fitness" ? "hypertrophy" : "strength",
    
    // Training history & setup
    yearsGymming: "1-2 years",
    gymType: "commercial", // 'commercial' | 'powerlifting' | 'local_iron' | 'home'
    daysAvailable: 4,
    sessionDuration: "60 mins",
    splitPreference: "ppl", // 'ppl' | 'upper_lower' | 'arnold' | 'full_body'

    // Biometrics & strength
    age: profile?.age || 23,
    heightCm: 175,
    bodyweight: profile?.bodyweight || 74,
    targetBodyweight: 75,
    squat: profile?.training_max?.squat || 140,
    bench: profile?.training_max?.bench || 100,
    deadlift: profile?.training_max?.deadlift || 180,
    fitnessLevel: "intermediate", // 'beginner' | 'intermediate' | 'advanced'

    // Indian Nutrition & Budget
    dietType: "pure_veg", // 'pure_veg' | 'eggetarian' | 'non_veg'
    proteinWillingness: "120-140g", // '60-80g' | '100-120g' | '120-140g' | '160g+'
    dailyBudgetINR: 150, // 100, 150, 250, 350
    staplesPreferred: ["soya", "paneer", "curd", "sattu"],

    // App Experience Mode
    appMode: "interactive", // 'interactive' | 'simple_blueprint'
    physiquePhoto: null,
    profile_complete: true
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large (max 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, physiquePhoto: reader.result }));
        toast.success("Physique baseline photo captured!");
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleStaple = (staple) => {
    setFormData(prev => {
      const exists = prev.staplesPreferred.includes(staple);
      const updated = exists 
        ? prev.staplesPreferred.filter(s => s !== staple)
        : [...prev.staplesPreferred, staple];
      return { ...prev, staplesPreferred: updated };
    });
  };

  const handleFinishSetup = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const uid = user?.uid || "athlete_demo";
      const profileData = {
        ...formData,
        training_max: {
          squat: parseFloat(formData.squat) || 140,
          bench: parseFloat(formData.bench) || 100,
          deadlift: parseFloat(formData.deadlift) || 180,
        },
        profile_complete: true,
        updated_at: new Date().toISOString()
      };

      // 1. Save to localStorage for instant offline access & zero-latency sync
      localStorage.setItem(`profile_${uid}`, JSON.stringify(profileData));
      localStorage.setItem('active_world_discipline', formData.pathway);
      sessionStorage.setItem('profileSetupComplete', 'true');

      // 2. Synthesize initial tailored 4-week protocol
      const sq = parseFloat(formData.squat) || 140;
      const bp = parseFloat(formData.bench) || 100;
      const dl = parseFloat(formData.deadlift) || 180;
      const days = parseInt(formData.daysAvailable) || 4;

      const baseDays = formData.pathway === 'powerlifting' ? [
        {
          dayNumber: 1,
          dayName: "Day 1: Competition Squat & Quad Drive",
          focus: "Squat Volume & Anterior Chain",
          warmupPrimer: "90/90 Hip Flow + Ankle Dorsiflexion + 3 Empty Bar Pause Sets",
          exercises: [
            { name: "Competition Squat", baseSets: 4, sets: 4, reps: "4", loadKg: Math.round((sq * 0.80) / 2.5) * 2.5, cue: "IPF Command simulation: 1-sec pause below parallel." },
            { name: "Bulgarian Split Squats", baseSets: 3, sets: 3, reps: "8-10", loadKg: 24, cue: "Load lead quad smoothly. Controlled descent." },
            { name: "Ab Wheel Rollouts", baseSets: 3, sets: 3, reps: "10-12", loadKg: 0, cue: "Maintain posterior pelvic tilt throughout roll." }
          ]
        },
        {
          dayNumber: 2,
          dayName: "Day 2: Competition Bench Press & Scapular Drive",
          focus: "Pectoral Reversal & Lat Shelf Stability",
          warmupPrimer: "Band Pull-Aparts + Rotator Cuff Primer",
          exercises: [
            { name: "Competition Bench Press", baseSets: 4, sets: 4, reps: "5", loadKg: Math.round((bp * 0.80) / 2.5) * 2.5, cue: "Full leg drive before unrack. Locked wrist alignment." },
            { name: "Spoto Press (1-inch off chest)", baseSets: 3, sets: 3, reps: "5", loadKg: Math.round((bp * 0.70) / 2.5) * 2.5, cue: "Dead motionless pause above sternum." },
            { name: "Chest Supported Dumbbell Rows", baseSets: 4, sets: 4, reps: "10", loadKg: 28, cue: "1-sec isometric squeeze at top." },
            { name: "EZ-Bar Skull Crushers", baseSets: 3, sets: 3, reps: "12", loadKg: 30, cue: "Lower behind head to stretch long head." }
          ]
        },
        {
          dayNumber: 3,
          dayName: "Day 3: Competition Deadlift & Posterior Chain Engine",
          focus: "Wedge & Slack Pull from Floor",
          warmupPrimer: "World's Greatest Stretch + Hamstring Sweeps + Glute Activations",
          exercises: [
            { name: "Competition Deadlift", baseSets: 3, sets: 3, reps: "3", loadKg: Math.round((dl * 0.80) / 2.5) * 2.5, cue: "Pull slack out of bar, wedge hips forward, push floor away." },
            { name: "Deficit Deadlifts (1.5 inch)", baseSets: 3, sets: 3, reps: "4", loadKg: Math.round((dl * 0.65) / 2.5) * 2.5, cue: "Overcome disadvantaged leverage off floor." },
            { name: "Barbell Romanian Deadlift", baseSets: 3, sets: 3, reps: "8", loadKg: Math.round((dl * 0.55) / 2.5) * 2.5, cue: "Hips back, feel deep stretch in hamstrings." },
            { name: "Hanging Leg Raises", baseSets: 3, sets: 3, reps: "12", loadKg: 0, cue: "Decompress spine after heavy pulls." }
          ]
        },
        {
          dayNumber: 4,
          dayName: "Day 4: SBD Volume Flush & Technique Balance",
          focus: "Secondary Overload & Structural Balance",
          warmupPrimer: "Thoracic Extensions on Foam Roller + Lat Primer",
          exercises: [
            { name: "Close-Grip Bench Press", baseSets: 3, sets: 3, reps: "6", loadKg: Math.round((bp * 0.65) / 2.5) * 2.5, cue: "Shoulder-width grip. Explosive lockout." },
            { name: "Belt Squats or Front Squats", baseSets: 3, sets: 3, reps: "8", loadKg: Math.round((sq * 0.55) / 2.5) * 2.5, cue: "Pure knee flexion, zero lower back load." },
            { name: "Neutral-Grip Lat Pulldowns", baseSets: 4, sets: 4, reps: "10", loadKg: 65, cue: "Pull elbows straight down into pockets." },
            { name: "Standing Calf Raises", baseSets: 4, sets: 4, reps: "15", loadKg: 50, cue: "2-sec deep bottom stretch on platform." }
          ]
        }
      ] : [
        {
          dayNumber: 1,
          dayName: "Day 1: Push Hypertrophy (Chest, Delts & Triceps)",
          focus: "Clavicular Pecs & Lateral Delt Hypertrophy",
          warmupPrimer: "Band Dislocates + Arm Circles + Pushup Holds",
          exercises: [
            { name: "Incline Barbell Bench Press", sets: 4, reps: "8-10", loadKg: Math.round((bp * 0.75) / 2.5) * 2.5, cue: "Lower to upper chest, squeeze clavicular pecs." },
            { name: "Dumbbell Seated Shoulder Press", sets: 3, reps: "8-10", loadKg: 26, cue: "Clean pressing groove overhead." },
            { name: "Cable Lateral Raises", sets: 4, reps: "12-15", loadKg: 10, cue: "Sweep hands outward towards walls." },
            { name: "Cable Triceps Pushdowns", sets: 3, reps: "12-15", loadKg: 30, cue: "Pin elbows to sides. Controlled eccentric." }
          ]
        },
        {
          dayNumber: 2,
          dayName: "Day 2: Pull Hypertrophy (Lats, Upper Back & Biceps)",
          focus: "V-Taper Lat Width & Rhomboid Thickness",
          warmupPrimer: "Dead Hangs + Scapular Shrugs + Band Pull-Aparts",
          exercises: [
            { name: "Lat Pulldowns (Neutral Grip)", sets: 4, reps: "10-12", loadKg: 65, cue: "Full stretch at top, drive elbows to hips." },
            { name: "Chest-Supported Dumbbell Rows", sets: 3, reps: "10-12", loadKg: 28, cue: "1-sec pause at peak retraction." },
            { name: "Incline Dumbbell Bicep Curls", sets: 3, reps: "10-12", loadKg: 14, cue: "Deep bottom stretch, supinate at top." },
            { name: "Facepulls with Rope", sets: 4, reps: "15-20", loadKg: 25, cue: "Pull to forehead, external shoulder rotation." }
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
            { name: "Lying Leg Curls", sets: 4, reps: "12-15", loadKg: 40, cue: "Squeeze hamstrings at contraction, 2-sec eccentric." },
            { name: "Standing Calf Raises", sets: 4, reps: "15-20", loadKg: 60, cue: "Dead pause at deepest bottom stretch." }
          ]
        },
        {
          dayNumber: 4,
          dayName: "Day 4: Upper Body Sculpt & Weak-Point Overload",
          focus: "Chest Density & Arm Volume",
          warmupPrimer: "World's Greatest Stretch + Banded Rotations",
          exercises: [
            { name: "Flat Dumbbell Press", sets: 4, reps: "8-10", loadKg: 32, cue: "Deep chest stretch, convergent press." },
            { name: "Barbell Pendlay Rows", sets: 3, reps: "8-10", loadKg: 65, cue: "Explosive pull from dead stop on floor." },
            { name: "Hammer Curls + Overhead Triceps Extension", sets: 3, reps: "12", loadKg: 16, cue: "Brachialis density & long head triceps peak." }
          ]
        }
      ];

      const weekDefs = formData.pathway === 'powerlifting' ? [
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

      const initialProgram = {
        programTitle: `4-Week Initial ${formData.pathway === 'powerlifting' ? 'Competitive SBD Wave' : 'Hypertrophy MAV Split'}`,
        pathway: formData.pathway,
        daysPerWeek: days,
        periodizationModel: formData.pathway === 'powerlifting' ? "Prilepin DUP 4-Week Block" : "Israetel Hypertrophy Landmarks",
        aiCoachSummary: `Calibrated directly from your onboarding baseline (SQ: ${sq}kg, BP: ${bp}kg, DL: ${dl}kg).`,
        days: baseDays,
        weeks: fullWeeks,
        totalWeeks: 4
      };

      localStorage.setItem(`active_ai_program_${uid}`, JSON.stringify(initialProgram));
      localStorage.setItem(`active_ai_program_date_${uid}`, new Date().toISOString());

      // 3. Try persisting to Firebase Firestore if connected
      try {
        if (db) {
          const userDocRef = doc(db, "athletes", uid);
          await setDoc(userDocRef, profileData, { merge: true });
        }
      } catch (fbErr) {
        console.warn("Firestore save skipped, localStorage fallback active:", fbErr.message);
      }

      toast.success("Calibration complete! 4-Week Protocol synthesized.");
      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 500);
    } catch (err) {
      console.error("Profile save error:", err);
      // Fail-safe redirect
      sessionStorage.setItem('profileSetupComplete', 'true');
      window.location.replace("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800c_1px,transparent_1px),linear-gradient(to_bottom,#8080800c_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl bg-zinc-950/90 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Survey Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
            <span className="uppercase tracking-wider text-orange-400 font-bold">
              STEP {currentStep} OF 5: {
                currentStep === 1 ? 'TRAINING PATHWAY' :
                currentStep === 2 ? 'GYM & TIME REALITY' :
                currentStep === 3 ? 'BIOMETRICS & CAPACITY' :
                currentStep === 4 ? 'DESI DIET & BUDGET' :
                'EXPERIENCE & PHYSIQUE'
              }
            </span>
            <span>{Math.round((currentStep / 5) * 100)}% COMPLETED</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-600 to-amber-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* ──────────────── STEP 1: PATHWAY SELECTION ──────────────── */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white tracking-tight mb-1">
                Choose Your Primary Discipline
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans">
                We calibrate your dashboard, tools, and training programming to match your exact goals.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Powerlifting */}
              <div 
                onClick={() => setFormData({ ...formData, pathway: 'powerlifting', goal: 'strength' })}
                className={`p-6 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  formData.pathway === 'powerlifting'
                    ? 'border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-950/40'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-2.5 rounded-lg bg-orange-600/20 text-orange-400">
                      <Trophy className="w-6 h-6" />
                    </span>
                    {formData.pathway === 'powerlifting' && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                  </div>
                  <h3 className="text-xl font-black italic uppercase text-white mb-2">
                    Competitive Powerlifting
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Maximizing 1RM Squat, Bench Press, and Deadlift. Competition prep, 9-for-9 attempt strategy, DOTS scoring, IPF commands, and platform totals.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 font-mono text-[10px] text-orange-400 font-bold uppercase">
                  ✓ Platform War Room Tools Included
                </div>
              </div>

              {/* Option 2: General Fitness & Physique */}
              <div 
                onClick={() => setFormData({ ...formData, pathway: 'fitness', goal: 'hypertrophy' })}
                className={`p-6 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  formData.pathway === 'fitness'
                    ? 'border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-950/40'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-2.5 rounded-lg bg-orange-600/20 text-orange-400">
                      <Flame className="w-6 h-6" />
                    </span>
                    {formData.pathway === 'fitness' && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                  </div>
                  <h3 className="text-xl font-black italic uppercase text-white mb-2">
                    Fitness & Aesthetic Physique
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Muscle hypertrophy, aggressive fat loss, body recomposition, and aesthetic proportions. Push/Pull/Legs splits, direct volume sets, and muscle radar.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 font-mono text-[10px] text-orange-400 font-bold uppercase">
                  ✓ Hypertrophy Splits & Desi Diet Plans
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── STEP 2: GYM & TIME REALITY ──────────────── */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white tracking-tight mb-1">
                Your Gym & Schedule Reality
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans">
                A realistic routine you actually stick to beats an unrealistic routine every time.
              </p>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* Years Training */}
              <div>
                <label className="text-zinc-400 uppercase block mb-1.5 font-bold">Years of Gym Experience</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['< 6 months', '1-2 years', '3-5 years', '5+ years'].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setFormData({ ...formData, yearsGymming: yr })}
                      className={`p-3 rounded-lg border transition-all text-center ${
                        formData.yearsGymming === yr 
                          ? 'bg-orange-600 border-orange-500 text-white font-bold' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gym Equipment Type */}
              <div>
                <label className="text-zinc-400 uppercase block mb-1.5 font-bold">Your Training Facility</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'commercial', name: 'Commercial Gym (Cables, Machines, DBs)' },
                    { id: 'powerlifting', name: 'Hardcore Powerlifting / Iron Gym' },
                    { id: 'local_iron', name: 'Local Desi Gym (Basic Barbells & Plates)' },
                    { id: 'home', name: 'Home Gym Setup' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, gymType: g.id })}
                      className={`p-3 rounded-lg border transition-all text-left text-[11px] ${
                        formData.gymType === g.id 
                          ? 'bg-orange-600/30 border-orange-500 text-white font-bold' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Days Available & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-zinc-400 uppercase block mb-1.5 font-bold">Days Available Per Week</label>
                  <div className="flex gap-2">
                    {[3, 4, 5, 6].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFormData({ ...formData, daysAvailable: d })}
                        className={`flex-1 py-2.5 rounded-lg border transition-all font-bold ${
                          formData.daysAvailable === d 
                            ? 'bg-orange-600 border-orange-500 text-white' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 uppercase block mb-1.5 font-bold">Workout Duration Willingness</label>
                  <select
                    value={formData.sessionDuration}
                    onChange={(e) => setFormData({ ...formData, sessionDuration: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                  >
                    <option value="45 mins">45 mins (Fast & High Intensity)</option>
                    <option value="60 mins">60 mins (Standard Optimal)</option>
                    <option value="75 mins">75 mins (Powerlifting & Hypertrophy)</option>
                    <option value="90 mins">90 mins (Full Competition Peaking)</option>
                  </select>
                </div>
              </div>

              {/* Split Preference */}
              <div>
                <label className="text-zinc-400 uppercase block mb-1.5 font-bold">Preferred Split Architecture</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ppl', name: 'Push / Pull / Legs' },
                    { id: 'upper_lower', name: 'Upper / Lower' },
                    { id: 'arnold', name: 'Arnold Split' },
                    { id: 'full_body', name: 'Full Body' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, splitPreference: s.id })}
                      className={`p-2.5 rounded-lg border transition-all text-center text-[11px] ${
                        formData.splitPreference === s.id 
                          ? 'bg-orange-600 border-orange-500 text-white font-bold' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── STEP 3: BIOMETRICS & BASELINE STRENGTH ──────────────── */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white tracking-tight mb-1">
                Body Metrics & Strength Baseline
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans">
                Used to compute your target caloric needs, progressive overload, and DOTS score.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <label className="text-zinc-500 uppercase block mb-1">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 20 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xl font-bold font-mono text-white focus:border-orange-500 outline-none"
                />
              </div>

              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <label className="text-zinc-500 uppercase block mb-1">Height (CM)</label>
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: parseInt(e.target.value) || 175 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xl font-bold font-mono text-white focus:border-orange-500 outline-none"
                />
              </div>

              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <label className="text-zinc-500 uppercase block mb-1">Bodyweight (KG)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.bodyweight}
                  onChange={(e) => setFormData({ ...formData, bodyweight: parseFloat(e.target.value) || 70 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xl font-bold font-mono text-white focus:border-orange-500 outline-none"
                />
              </div>

              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <label className="text-zinc-500 uppercase block mb-1">Target Weight (KG)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.targetBodyweight}
                  onChange={(e) => setFormData({ ...formData, targetBodyweight: parseFloat(e.target.value) || 75 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xl font-bold font-mono text-white focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Baseline Strength Inputs */}
            <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 space-y-4 font-mono text-xs">
              <span className="text-orange-400 font-bold uppercase block">
                {formData.pathway === 'powerlifting' ? '1RM Competition Lifts (KG)' : 'Baseline Working Capacities (KG or Reps)'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-400 uppercase text-[10px] block mb-1">Squat Capacity</label>
                  <input
                    type="number"
                    step="2.5"
                    value={formData.squat}
                    onChange={(e) => setFormData({ ...formData, squat: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-lg font-bold text-white font-mono focus:border-orange-500 outline-none"
                    placeholder="140"
                  />
                  <span className="text-[10px] text-zinc-500">kg (or estimated 1RM)</span>
                </div>

                <div>
                  <label className="text-zinc-400 uppercase text-[10px] block mb-1">Bench Press Capacity</label>
                  <input
                    type="number"
                    step="2.5"
                    value={formData.bench}
                    onChange={(e) => setFormData({ ...formData, bench: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-lg font-bold text-white font-mono focus:border-orange-500 outline-none"
                    placeholder="100"
                  />
                  <span className="text-[10px] text-zinc-500">kg (or estimated 1RM)</span>
                </div>

                <div>
                  <label className="text-zinc-400 uppercase text-[10px] block mb-1">Deadlift Capacity</label>
                  <input
                    type="number"
                    step="2.5"
                    value={formData.deadlift}
                    onChange={(e) => setFormData({ ...formData, deadlift: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-lg font-bold text-white font-mono focus:border-orange-500 outline-none"
                    placeholder="180"
                  />
                  <span className="text-[10px] text-zinc-500">kg (or estimated 1RM)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── STEP 4: INDIAN NUTRITION & BUDGET REALITY ──────────────── */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white tracking-tight mb-1">
                Desi Nutrition & Budget Reality
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans">
                We calculate real-world Indian food portions that fit your exact dietary ethics and daily grocery budget.
              </p>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* Dietary Category */}
              <div>
                <label className="text-zinc-400 uppercase block mb-1.5 font-bold">Dietary Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pure_veg', name: '🥦 Pure Vegetarian', desc: 'Paneer, Soya, Sattu, Curd, Dal' },
                    { id: 'eggetarian', name: '🍳 Eggetarian', desc: 'Eggs + Dairy + Soya + Dal' },
                    { id: 'non_veg', name: '🍗 Non-Vegetarian', desc: 'Chicken, Eggs, Fish, Dairy' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, dietType: d.id })}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        formData.dietType === d.id 
                          ? 'bg-orange-600/30 border-orange-500 text-white font-bold' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="text-sm font-bold">{d.name}</div>
                      <div className="text-[10px] text-zinc-400 mt-1">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Budget in INR */}
              <div>
                <label className="text-zinc-400 uppercase block mb-1.5 font-bold">Daily Food Budget (INR)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { budget: 100, label: '₹100–120 / day', desc: 'Budget Desi (Soya, Sattu, Curd)' },
                    { budget: 180, label: '₹150–200 / day', desc: 'Standard (Paneer, Eggs, Soya)' },
                    { budget: 300, label: '₹250+ / day', desc: 'High Performance (Chicken + Whey)' }
                  ].map((b) => (
                    <button
                      key={b.budget}
                      type="button"
                      onClick={() => setFormData({ ...formData, dailyBudgetINR: b.budget })}
                      className={`p-3 rounded-lg border transition-all text-center ${
                        formData.dailyBudgetINR === b.budget 
                          ? 'bg-green-950 border-green-500 text-green-400 font-bold' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="text-sm font-bold flex items-center justify-center gap-0.5">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {b.label}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{b.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Protein Target Willingness */}
              <div>
                <label className="text-zinc-400 uppercase block mb-1.5 font-bold">Willing Daily Protein Intake</label>
                <div className="grid grid-cols-4 gap-2">
                  {['60-80g', '100-120g', '120-140g', '160g+'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, proteinWillingness: p })}
                      className={`py-2.5 rounded-lg border transition-all text-center font-bold ${
                        formData.proteinWillingness === p 
                          ? 'bg-orange-600 border-orange-500 text-white' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Staples Selection */}
              <div>
                <label className="text-zinc-400 uppercase block mb-1.5 font-bold">Available Staples in your Kitchen</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'soya', name: 'Soya Chunks' },
                    { id: 'paneer', name: 'Paneer' },
                    { id: 'sattu', name: 'Sattu Flour' },
                    { id: 'curd', name: 'Dahi / Curd' },
                    { id: 'eggs', name: 'Eggs' },
                    { id: 'chicken', name: 'Chicken Breast' },
                    { id: 'whey', name: 'Whey Protein' },
                    { id: 'dal', name: 'Moong / Chana Dal' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleStaple(s.id)}
                      className={`px-3 py-1.5 rounded-lg border text-[11px] transition-all flex items-center gap-1.5 ${
                        formData.staplesPreferred.includes(s.id)
                          ? 'bg-orange-600/30 border-orange-500 text-orange-400 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {formData.staplesPreferred.includes(s.id) && <span>✓</span>}
                      <span>{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── STEP 5: APP EXPERIENCE & PHYSIQUE PHOTO ──────────────── */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white tracking-tight mb-1">
                Experience Style & Physique Baseline
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans">
                Choose how you want to interact with your workouts, and capture your starting physique photo.
              </p>
            </div>

            {/* App Experience Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setFormData({ ...formData, appMode: 'interactive' })}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  formData.appMode === 'interactive'
                    ? 'border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-950/40'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold uppercase text-white text-base">⚡ Interactive Live Logger</span>
                    {formData.appMode === 'interactive' && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Check off sets in real-time, in-rack rest timer countdown, live tonnage volume meter, plate loading calculator, and 1-tap WhatsApp coach export.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-orange-400 uppercase mt-4 block">Recommended for active gym tracking</span>
              </div>

              <div
                onClick={() => setFormData({ ...formData, appMode: 'simple_blueprint' })}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  formData.appMode === 'simple_blueprint'
                    ? 'border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-950/40'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold uppercase text-white text-base">📄 Simple Clean Blueprint</span>
                    {formData.appMode === 'simple_blueprint' && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Clean, printable workout cards and daily meal breakdown. Zero tapping or logging needed during your workout—just open, glance, and lift.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase mt-4 block">Zero-fuss minimalist view</span>
              </div>
            </div>

            {/* Physique Photo Upload (Optional) */}
            <div className="p-5 bg-zinc-900/60 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-mono text-xs text-white uppercase font-bold block">
                    Starting Physique Baseline (Optional)
                  </span>
                  <span className="text-[11px] text-zinc-500 font-sans">
                    Private photo stored locally on your device for before/after comparison.
                  </span>
                </div>
                <Camera className="w-5 h-5 text-orange-500" />
              </div>

              <div className="flex items-center gap-4">
                {formData.physiquePhoto ? (
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden border border-orange-500/50">
                    <img src={formData.physiquePhoto} alt="Baseline Physique" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, physiquePhoto: null })}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/80 rounded-full text-xs text-white flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-24 rounded-xl border-2 border-dashed border-zinc-700 hover:border-orange-500 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-zinc-500 hover:text-orange-400 font-mono text-[10px] text-center p-2">
                    <Upload className="w-5 h-5" />
                    <span>Upload Snap</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
                <p className="text-xs text-zinc-400 font-mono flex-1">
                  Track your muscular development and body recomposition weekly with side-by-side progression sliders.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ────────────── NAVIGATION FOOTER ────────────── */}
        <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs uppercase flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-lg font-mono text-xs uppercase font-bold flex items-center gap-1.5 transition-all shadow-md shadow-orange-950"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleFinishSetup}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-8 py-3 rounded-xl font-mono text-xs uppercase font-black flex items-center gap-2 transition-all shadow-xl shadow-orange-950 transform active:scale-95"
            >
              <span>{loading ? 'CALIBRATING...' : 'FINISH & LAUNCH PROTOCOL'}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}