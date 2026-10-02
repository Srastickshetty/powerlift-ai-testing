import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Check, 
  X, 
  Flame, 
  ShieldCheck, 
  Scale, 
  Share2, 
  RefreshCw, 
  ChevronRight, 
  Award,
  ArrowRight,
  Anchor,
  Compass
} from 'lucide-react';
import { toast } from 'sonner';

export default function WeeklyCheckInModal({
  isOpen,
  onClose,
  athleteId = 'athlete_demo',
  currentProgram = null,
  currentWeekNumber = 1,
  onWeekEvolved
}) {
  const [avgRpe, setAvgRpe] = useState(8.0);
  const [tonnageAchievedPct, setTonnageAchievedPct] = useState(90);
  const [missedReps, setMissedReps] = useState(0);
  const [fatigueScore, setFatigueScore] = useState(30);
  const [scaleWeightShiftKg, setScaleWeightShiftKg] = useState(0.0);
  const [selectedJoints, setSelectedJoints] = useState([]);
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolvedResult, setEvolvedResult] = useState(null);

  const jointOptions = [
    'Shoulder impingement',
    'Elbow tendon irritation',
    'Lower back erector pump',
    'Knee patellar discomfort',
    'Wrist strain',
    'Hip flexor / adductor tightness'
  ];

  const toggleJoint = (joint) => {
    setSelectedJoints(prev => 
      prev.includes(joint) ? prev.filter(j => j !== joint) : [...prev, joint]
    );
  };

  const handleEvolveWeek = async () => {
    setIsEvolving(true);
    setEvolvedResult(null);

    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com' 
        : 'http://localhost:5001';

      const payload = {
        currentWeekNumber,
        currentProgram,
        weeklyCheckIn: {
          avgRpe: parseFloat(avgRpe),
          tonnageAchievedPct: parseInt(tonnageAchievedPct),
          missedReps: parseInt(missedReps),
          fatigueScore: parseInt(fatigueScore),
          scaleWeightShiftKg: parseFloat(scaleWeightShiftKg),
          jointTweaks: selectedJoints
        }
      };

      const res = await fetch(`${apiUrl}/api/programs/ai-evolve-week/${athleteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.evolvedProgram) {
        setEvolvedResult(data);
        toast.success(`Week ${data.evolvedWeek} Advanced: ${data.statusBadge}!`);
      } else {
        throw new Error(data.error || "Evolution failed");
      }
    } catch (err) {
      console.error("Evolution error:", err);
      toast.error(`Evolution failed: ${err.message}`);
    } finally {
      setIsEvolving(false);
    }
  };

  const handleDeployEvolvedWeek = () => {
    if (!evolvedResult || !evolvedResult.evolvedProgram) return;

    localStorage.setItem(`active_ai_program_${athleteId}`, JSON.stringify(evolvedResult.evolvedProgram));
    localStorage.setItem(`active_ai_program_date_${athleteId}`, new Date().toISOString());

    if (onWeekEvolved) {
      onWeekEvolved(evolvedResult.evolvedProgram);
    }

    toast.success(`🚀 Week ${evolvedResult.evolvedWeek} Deployed to Live Gym Tracker!`);
    onClose();
  };

  const shareDebriefOnWhatsApp = () => {
    if (!evolvedResult) return;
    const text = `🏆 *TITAN-AI STABLE MESOCYCLE DEBRIEF* 🏆
👤 *Athlete ID:* ${athleteId}
📅 *Block Progression:* Week ${currentWeekNumber} ➔ Week ${evolvedResult.evolvedWeek}
⚡ *Status:* ${evolvedResult.statusBadge}
🛡️ *Program Stability:* ${evolvedResult.isProgramStable ? '100% Locked (Motor Unit Consolidation)' : 'Surgical Prehab Adjustments Applied'}

📊 *Weekly Biofeedback:*
• Volume Tonnage: ${tonnageAchievedPct}%
• Average RPE: ${avgRpe} / 10
• CNS Fatigue Score: ${fatigueScore}%
• Scale Weight: ${scaleWeightShiftKg >= 0 ? `+${scaleWeightShiftKg}` : scaleWeightShiftKg} kg

🎯 *Coach Deva Khule & Multi-Council Directives:*
${evolvedResult.adaptations.map(a => `• ${a}`).join('\n')}

Generated via TITAN-AI Autonomous Stable Mesocycle Engine`;

    const encoded = encodeURI(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    toast.success("Opening WhatsApp with weekly debrief!");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[#0a0a0f] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-950/80 via-zinc-900 to-black p-5 border-b border-zinc-800 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Brain className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    COACH DEVA KHULE CORE
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                    STABLE 4-WEEK BLOCK
                  </span>
                </div>
                <h2 className="text-xl font-black italic tracking-tight text-white">
                  WEEKLY AI ATHLETE CHECK-IN & BLOCK WAVE
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
            {!evolvedResult ? (
              <>
                {/* Periodization Philosophy Callout */}
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
                  <Anchor className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    <span className="font-bold text-amber-300 block mb-0.5">Stable Mesocycle Periodization (Anti-Churn):</span>
                    Real powerlifting coaches do <span className="text-white font-semibold">not</span> rewrite your program weekly. Exercises remain locked to consolidate motor unit recruitment. Adjustments occur strictly along planned wave loading (<span className="text-emerald-400 font-mono">+2.5kg to +5kg</span>) unless acute joint flags are reported below.
                  </div>
                </div>

                {/* Metric 1: Average Top-Set RPE */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono uppercase text-zinc-300 font-bold">
                      Average Top-Set RPE (Rate of Perceived Exertion):
                    </label>
                    <span className={`text-base font-black font-mono italic ${avgRpe <= 7.5 ? 'text-emerald-400' : avgRpe >= 9.2 ? 'text-red-400' : 'text-amber-400'}`}>
                      RPE {avgRpe}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="6.5"
                    max="10.0"
                    step="0.5"
                    value={avgRpe}
                    onChange={(e) => setAvgRpe(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                    <span>RPE 6.5 (Bar flew fast)</span>
                    <span>RPE 8.0 (2 reps in tank)</span>
                    <span>RPE 10 (Maximum grind)</span>
                  </div>
                </div>

                {/* Metric 2 & 3: Tonnage Achieved & Fatigue Score */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                    <label className="text-xs font-mono uppercase text-zinc-300 block mb-1 font-bold">
                      Prescribed Volume Completed:
                    </label>
                    <div className="flex items-center gap-2">
                      {[75, 90, 100].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setTonnageAchievedPct(pct)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-all ${
                            tonnageAchievedPct === pct 
                              ? 'bg-amber-600 text-white font-bold' 
                              : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                    <label className="text-xs font-mono uppercase text-zinc-300 block mb-1 font-bold">
                      CNS Fatigue & Muscle Soreness:
                    </label>
                    <div className="flex items-center gap-2">
                      {[
                        { val: 20, label: 'Low (Fresh)' },
                        { val: 40, label: 'Nominal' },
                        { val: 70, label: 'High (Stiff)' }
                      ].map(item => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setFatigueScore(item.val)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-all ${
                            fatigueScore === item.val 
                              ? 'bg-amber-600 text-white font-bold' 
                              : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Metric 4: Scale Weight Shift */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-zinc-300 block font-bold">
                      Scale Weight Trend This Week:
                    </label>
                    <span className="text-[11px] text-zinc-500">Syncs with Coach Deva Nutrition 101</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={scaleWeightShiftKg}
                      onChange={(e) => setScaleWeightShiftKg(e.target.value)}
                      placeholder="+0.2 or -0.4"
                      className="w-24 p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-white text-center"
                    />
                    <span className="text-xs font-mono text-zinc-400">KG</span>
                  </div>
                </div>

                {/* Metric 5: Acute Joint Discomfort Flags */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono uppercase text-zinc-400 block font-bold">
                      Flag Acute Joint Discomfort:
                    </label>
                    <span className="text-[10px] font-mono text-amber-400">
                      Surgically adjusts only offending movement
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {jointOptions.map(joint => {
                      const isSelected = selectedJoints.includes(joint);
                      return (
                        <button
                          key={joint}
                          type="button"
                          onClick={() => toggleJoint(joint)}
                          className={`p-2 rounded-lg text-left text-xs font-mono transition-all border ${
                            isSelected 
                              ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold' 
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {isSelected ? '⚠️ ' : '○ '} {joint}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* EVOLUTION RESULTS SCREEN */
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-amber-950/60 via-zinc-900 to-black border border-amber-500/40 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {evolvedResult.isProgramStable ? "STABLE MESOCYCLE CONSOLIDATION" : "SURGICAL PREHAB ADAPTATION"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                      {evolvedResult.statusBadge}
                    </span>
                  </div>
                  <h3 className="text-xl font-black italic text-white flex items-center gap-2">
                    <span>Week {currentWeekNumber}</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                    <span>Week {evolvedResult.evolvedWeek} Target Protocol</span>
                  </h3>
                </div>

                {/* AI Coach Debrief Callout */}
                <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 space-y-2.5 leading-relaxed">
                  <div className="font-bold font-mono text-amber-300 uppercase text-[11px] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    COACH DEVA KHULE & MULTI-COUNCIL DIRECTIVES:
                  </div>
                  {evolvedResult.adaptations.map((a, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-zinc-300">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{a}</span>
                    </div>
                  ))}
                  {evolvedResult.surgicalSubstitutions?.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300 font-mono text-[11px]">
                      <strong>Surgical Joint Modifications:</strong> {evolvedResult.surgicalSubstitutions.join("; ")}
                    </div>
                  )}
                </div>

                {/* Evolved Days Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-zinc-400 block font-bold">
                    Week {evolvedResult.evolvedWeek} Prescribed Working Loads:
                  </span>
                  {evolvedResult.evolvedProgram?.days?.map((day, dIdx) => (
                    <div key={dIdx} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
                      <div className="font-bold text-white mb-1.5 flex items-center justify-between">
                        <span>{day.dayName}</span>
                        <span className="text-[10px] font-mono text-amber-400">{day.focus}</span>
                      </div>
                      <div className="divide-y divide-zinc-800/60">
                        {day.exercises?.map((ex, exIdx) => (
                          <div key={exIdx} className="py-1.5 flex items-center justify-between font-mono text-xs">
                            <div className="flex flex-col">
                              <span className="text-zinc-300 font-sans font-semibold">{ex.name}</span>
                              {ex.cue && (
                                <span className="text-[10px] text-zinc-500 font-sans italic truncate max-w-sm">
                                  {ex.cue}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-amber-300 font-bold text-sm">{ex.loadKg}kg</span>
                              <span className="text-zinc-500">({ex.sets}x{ex.reps})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="bg-zinc-950 p-4 border-t border-zinc-800 flex items-center justify-between">
            {!evolvedResult ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleEvolveWeek}
                  disabled={isEvolving}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-black font-mono text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-950"
                >
                  {isEvolving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Computing Bio-Telemetry...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 text-black" />
                      <span>Advance Block Wave with AI Brain</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={shareDebriefOnWhatsApp}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Debrief on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeployEvolvedWeek}
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-black font-mono text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-950"
                >
                  <Check className="w-4 h-4 text-black" />
                  <span>Deploy Week {evolvedResult.evolvedWeek} to Live Tracker</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
