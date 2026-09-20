import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  ChevronRight
} from "lucide-react";
import { useAuth } from "../auth/authContext";

export default function Landing() {
  const navigate = useNavigate();
  const { user, profile, loginDemo, updateProfileData } = useAuth();

  const [hoveredWorld, setHoveredWorld] = useState(null); // 'powerlifting' | 'bodybuilding'

  const handleSelectWorld = (world) => {
    // Save discipline selection
    localStorage.setItem('active_world_discipline', world);
    if (updateProfileData) {
      updateProfileData({ pathway: world });
    }
    if (loginDemo) {
      loginDemo(world === 'powerlifting' ? 'athlete' : 'fitness');
    }
    navigate(world === 'powerlifting' ? '/powerlifting-dashboard' : '/fitness-dashboard');
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl text-xs font-mono uppercase text-zinc-400 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono uppercase font-bold text-white border border-zinc-700 transition-colors"
          >
            Register
          </button>
        </div>
      </header>

      {/* MAIN DISCIPLINE SELECTION CHAMBER */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 max-w-6xl mx-auto w-full text-center">
        <div className="space-y-3 mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            <Lock className="w-3 h-3 text-orange-400" />
            <span>DISCIPLINE SELECTION GATEWAY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tight text-white">
            SELECT YOUR WORLD
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-light">
            TITAN-AI isolates your training psychology and sports science. Once you enter a world, your dashboard, tracking, and diet are calibrated exclusively to that discipline.
          </p>
        </div>

        {/* TWO DISTINCT WORLD PORTALS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* DOOR 1: POWERLIFTING WORLD */}
          <motion.div
            whileHover={{ scale: 1.015 }}
            onMouseEnter={() => setHoveredWorld('powerlifting')}
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
                  <span>Heavy Singles @ RPE 8-9 + Velocity Backoff Overload</span>
                </div>
              </div>
            </div>

            <div className="pt-8 relative z-10">
              <button
                onClick={() => handleSelectWorld('powerlifting')}
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
            onMouseEnter={() => setHoveredWorld('bodybuilding')}
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
                onClick={() => handleSelectWorld('fitness')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span className="font-mono">ENTER BODYBUILDING WORLD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* FOOTER NOTICE */}
        <div className="mt-12 text-[11px] font-mono text-zinc-500 max-w-md">
          🔒 Strict Protocol Rule: Once you enter a world, your metrics remain isolated to prevent training confusion. You can exit back to this chamber at any time.
        </div>
      </main>
    </div>
  );
}