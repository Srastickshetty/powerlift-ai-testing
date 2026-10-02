import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  Dumbbell, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Brain, 
  Apple, 
  Scale, 
  Target, 
  Clock, 
  Zap,
  Lock,
  ChevronRight,
  AlertTriangle,
  UserCheck,
  LogOut,
  X
} from "lucide-react";
import { useAuth } from "../auth/authContext";

export default function Landing() {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  const [hoveredWorld, setHoveredWorld] = useState(null); // 'powerlifting' | 'fitness'
  const [switchModal, setSwitchModal] = useState({
    isOpen: false,
    targetWorld: "fitness",
    currentWorld: "powerlifting"
  });

  const handleSelectWorld = (world) => {
    // 1. UNREGISTERED USER: Gatekeep strictly - force registration/login with selected world
    if (!user) {
      localStorage.setItem("active_world_discipline", world);
      navigate(`/register?world=${world}`);
      return;
    }

    // 2. ADMIN / COACH: Direct straight to their operations center
    if (profile?.role === "admin") {
      navigate("/admin");
      return;
    }
    if (profile?.role === "coach") {
      navigate("/coach");
      return;
    }

    // 3. LOGGED IN BUT INCOMPLETE PROFILE: Send to profile onboarding
    if (!profile?.profile_complete) {
      localStorage.setItem("active_world_discipline", world);
      navigate(`/profile-setup?world=${world}`);
      return;
    }

    // 4. EXISTING ATHLETE: Check if selecting a different discipline than registered
    const currentWorld = profile?.pathway || localStorage.getItem("active_world_discipline") || "powerlifting";
    
    if (currentWorld === world) {
      // Same world - go straight to their dashboard
      navigate(world === "powerlifting" ? "/powerlifting-dashboard" : "/fitness-dashboard");
    } else {
      // Different world - Trigger discipline switch confirmation modal
      setSwitchModal({
        isOpen: true,
        targetWorld: world,
        currentWorld: currentWorld
      });
    }
  };

  const handleConfirmDisciplineSwitch = () => {
    const { targetWorld } = switchModal;
    localStorage.setItem("active_world_discipline", targetWorld);
    setSwitchModal({ isOpen: false, targetWorld: "fitness", currentWorld: "powerlifting" });
    // Navigate to profile setup with migration flag to preserve common metrics and ask only missing metrics
    navigate(`/profile-setup?world=${targetWorld}&switching=true`);
  };

  const tickerPhrases = [
    "CHOOSE YOUR REALM: POWERLIFTING SBD OR BODYBUILDING HYPERTROPHY",
    "IPF & POWERLIFTING INDIA 9-FOR-9 ATTEMPT STRATEGIST",
    "LEUCINE-PACED MUSCLE PROTEIN SYNTHESIS & CALORIC DEFICIT ENGINE",
    "2-HOUR RAPID REHYDRATION & WATER CUT MANAGEMENT",
    "DESI HIGH-PROTEIN NUTRITION (SOYA • PANEER • SATTU • EGGS)",
    "AUTONOMOUS CV BIOMECHANICS & VELOCITY TRACKER"
  ];

  return (
    <div className="min-h-screen bg-[#060608] text-white selection:bg-orange-500/30 font-sans overflow-x-hidden flex flex-col">
      {/* 📡 TOP DATA TICKER */}
      <div className="w-full bg-[#0b0c10]/95 backdrop-blur-md text-zinc-400 py-1.5 overflow-hidden whitespace-nowrap z-50 fixed top-0 left-0 border-b border-white/5 shadow-sm">
        <div className="flex animate-[scroll_40s_linear_infinite] font-semibold uppercase text-[10px] tracking-widest font-mono text-zinc-400">
          {[...tickerPhrases, ...tickerPhrases].map((phrase, i) => (
            <span key={i} className="mx-8 flex items-center shrink-0">
              {phrase} <span className="ml-8 text-amber-500/60">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* TOP BRAND HEADER */}
      <header className="pt-11 pb-4 px-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center font-black italic text-zinc-950 text-base shadow-sm border border-amber-500/20">
            T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl italic tracking-wider text-white">TITAN-AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
              Autonomous Strength & Physique Engine
            </span>
          </div>
        </div>

        {/* AUTH STATE BUTTONS */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-mono text-zinc-300 font-bold">
                  {user.email}
                </span>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                  ROLE: {profile?.role || "ATHLETE"} {profile?.pathway ? `• ${profile.pathway.toUpperCase()}` : ""}
                </span>
              </div>
              <button
                onClick={() => {
                  if (profile?.role === "admin") navigate("/admin");
                  else if (profile?.role === "coach") navigate("/coach");
                  else if (!profile?.profile_complete) navigate("/profile-setup");
                  else navigate(profile?.pathway === "fitness" ? "/fitness-dashboard" : "/powerlifting-dashboard");
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-mono uppercase font-black text-zinc-950 transition-colors shadow-sm"
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-xl text-xs font-mono uppercase text-zinc-400 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono uppercase font-bold text-white border border-zinc-700 transition-colors"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MAIN DISCIPLINE SELECTION CHAMBER */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 max-w-6xl mx-auto w-full text-center">
        <div className="space-y-3 mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            <Lock className="w-3 h-3 text-orange-400" />
            <span>DISCIPLINE SELECTION GATEWAY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-[1000] italic uppercase tracking-tight text-white">
            SELECT YOUR REALM
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-light">
            TITAN-AI customizes your training neuroscience, periodization algorithms, and desi nutrition. Select your discipline to begin onboarding or access your calibrated dashboard.
          </p>
        </div>

        {/* TWO DISTINCT WORLD PORTALS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* DOOR 1: POWERLIFTING WORLD */}
          <motion.div
            whileHover={{ scale: 1.015 }}
            onMouseEnter={() => setHoveredWorld("powerlifting")}
            onMouseLeave={() => setHoveredWorld(null)}
            className="group relative bg-[#0c0d12] border border-amber-500/20 hover:border-amber-500/40 rounded-3xl p-8 text-left transition-all shadow-xl shadow-black/60 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-600/10 transition-all" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-black transition-all">
                  <Flame className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-zinc-900 border border-amber-500/20 text-[10px] font-mono font-medium text-amber-300/80 uppercase tracking-widest">
                  SBD • IPF PLATFORM
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-zinc-100 tracking-tight group-hover:text-amber-400 transition-colors">
                  POWERLIFTING WORLD
                </h2>
                <p className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-wider">
                  Maximum Force • 1RM SBD • National Platform
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400/80 shrink-0" />
                  <span>9-for-9 Competition Attempt Strategist & DOTS Forecaster</span>
                </div>
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-amber-400/80 shrink-0" />
                  <span>Olympic Plate Loader & 60-Second Table Submission Clock</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400/80 shrink-0" />
                  <span>IPF Weight Class Proximity, Water Cut & 2-Hour Rehydration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-amber-400/80 shrink-0" />
                  <span>Heavy Singles @ RPE 8-9 + Prilepin Backoff Wave</span>
                </div>
              </div>
            </div>

            <div className="pt-8 relative z-10">
              <button
                onClick={() => handleSelectWorld("powerlifting")}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-zinc-950 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span className="font-mono">ENTER POWERLIFTING WORLD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* DOOR 2: BODYBUILDING WORLD */}
          <motion.div
            whileHover={{ scale: 1.015 }}
            onMouseEnter={() => setHoveredWorld("fitness")}
            onMouseLeave={() => setHoveredWorld(null)}
            className="group relative bg-[#0c0d12] border border-indigo-500/20 hover:border-indigo-500/40 rounded-3xl p-8 text-left transition-all shadow-xl shadow-black/60 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-600/10 transition-all" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-500 group-hover:text-black transition-all">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-zinc-900 border border-indigo-500/20 text-[10px] font-mono font-medium text-indigo-300/80 uppercase tracking-widest">
                  HYPERTROPHY • AESTHETICS
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-zinc-100 tracking-tight group-hover:text-indigo-400 transition-colors">
                  BODYBUILDING WORLD
                </h2>
                <p className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-wider">
                  V-Taper Aesthetics • Muscle Volume • Body Recomp
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400/80 shrink-0" />
                  <span>PPL & Arnold Splits with Hypertrophy Landmarks (MEV / MAV)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Apple className="w-4 h-4 text-indigo-400/80 shrink-0" />
                  <span>Muscle Protein Synthesis Pacing (4-5 Feedings, 3g Leucine)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400/80 shrink-0" />
                  <span>Caloric Deficit & Recomp Periodization with Body Fat Targets</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400/80 shrink-0" />
                  <span>Desi High-Protein Budget Groceries & 1-Click WhatsApp Export</span>
                </div>
              </div>
            </div>

            <div className="pt-8 relative z-10">
              <button
                onClick={() => handleSelectWorld("fitness")}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span className="font-mono">ENTER BODYBUILDING WORLD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* STRICT GATEKEEPING FOOTER NOTICE */}
        <div className="mt-12 text-[11px] font-mono text-zinc-500 max-w-md">
          🔒 Strict Protocol: You must register or log in before accessing the war rooms. Once your profile is synthesized, your training data and diet are custom-tailored to you.
        </div>
      </main>

      {/* ⚠️ DISCIPLINE SWITCH WARNING MODAL */}
      <AnimatePresence>
        {switchModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0e1017] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setSwitchModal(prev => ({ ...prev, isOpen: false }))}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    Discipline Switch Warning
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                    PROTOCOL_MIGRATION_DETECTED
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 mb-6 bg-zinc-900/60 p-4 rounded-2xl border border-white/5">
                <p>
                  You are already registered under{" "}
                  <strong className="text-amber-400 uppercase">
                    {switchModal.currentWorld === "powerlifting" ? "Powerlifting (SBD/IPF)" : "Bodybuilding (Hypertrophy)"}
                  </strong>
                  .
                </p>
                <p>
                  Do you want to switch your training realm to{" "}
                  <strong className="text-indigo-400 uppercase">
                    {switchModal.targetWorld === "powerlifting" ? "Powerlifting World" : "Bodybuilding World"}
                  </strong>
                  ?
                </p>
                <div className="pt-2 text-[11px] text-zinc-400 border-t border-white/5 font-mono">
                  ✨ <span className="text-emerald-400 font-bold">Good news:</span> Your existing biological baseline (age, height, weight) and desi diet preferences will be retained. You will only be asked for the remaining discipline-specific details.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleConfirmDisciplineSwitch}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs uppercase transition-colors"
                >
                  Yes, Switch to {switchModal.targetWorld === "powerlifting" ? "Powerlifting" : "Bodybuilding"}
                </button>
                <button
                  onClick={() => {
                    setSwitchModal(prev => ({ ...prev, isOpen: false }));
                    navigate(switchModal.currentWorld === "fitness" ? "/fitness-dashboard" : "/powerlifting-dashboard");
                  }}
                  className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs uppercase transition-colors"
                >
                  Stay in Current World
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}