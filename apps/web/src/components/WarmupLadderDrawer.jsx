import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Dumbbell, Sparkles, Check } from 'lucide-react';

/**
 * Minimalist 1-Tap Barbell Warm-Up Ladder & Plate Math
 * Designed for athletes in the rack with chalk on their hands
 */
export const WarmupLadderDrawer = ({ isOpen, onClose, liftName = 'Squat', targetWeight = 180, barWeight = 20 }) => {
  if (!isOpen) return null;

  const target = parseFloat(targetWeight) || 100;
  const bar = parseFloat(barWeight) || 20;

  // Calculate realistic powerlifting warmup jumps
  const generateWarmupSteps = (target, bar) => {
    if (target <= bar) {
      return [{ set: 1, weight: bar, reps: '10', percentage: 100, cue: 'Empty bar form groove' }];
    }

    const steps = [];
    
    // Step 1: Empty bar
    steps.push({
      set: 1,
      weight: bar,
      reps: '8-10',
      percentage: Math.round((bar / target) * 100),
      cue: 'Groove bar path & brace pattern'
    });

    // Step 2: ~45%
    const step2 = Math.round(((target * 0.45) / 2.5)) * 2.5;
    if (step2 > bar + 5 && step2 < target * 0.75) {
      steps.push({
        set: 2,
        weight: Math.max(bar + 10, step2),
        reps: '5',
        percentage: Math.round((step2 / target) * 100),
        cue: 'Accelerate through transition zone'
      });
    }

    // Step 3: ~60%
    const step3 = Math.round(((target * 0.62) / 2.5)) * 2.5;
    if (step3 > (steps[1]?.weight || bar) && step3 < target * 0.82) {
      steps.push({
        set: 3,
        weight: step3,
        reps: '3',
        percentage: Math.round((step3 / target) * 100),
        cue: 'Dial in competition descent tempo'
      });
    }

    // Step 4: ~78%
    const step4 = Math.round(((target * 0.78) / 2.5)) * 2.5;
    if (step4 > (steps[steps.length - 1]?.weight || bar) && step4 < target * 0.92) {
      steps.push({
        set: 4,
        weight: step4,
        reps: '2',
        percentage: Math.round((step4 / target) * 100),
        cue: 'Treat like a maximum single: 100% effort'
      });
    }

    // Step 5: ~90% (Final Primer Single)
    const step5 = Math.round(((target * 0.90) / 2.5)) * 2.5;
    if (step5 > (steps[steps.length - 1]?.weight || bar) && step5 < target - 2.5) {
      steps.push({
        set: 5,
        weight: step5,
        reps: '1',
        percentage: Math.round((step5 / target) * 100),
        cue: 'Final CNS activation single: Fast lockout'
      });
    }

    // Final: Working Weight
    steps.push({
      set: steps.length + 1,
      weight: target,
      reps: 'WORK SET',
      percentage: 100,
      isTarget: true,
      cue: 'Locked in. Execute programmed cues.'
    });

    return steps;
  };

  const steps = generateWarmupSteps(target, bar);

  // Quick plate breakdown per side (assuming 20kg bar and standard plates)
  const getPlatesPerSide = (weight, bar) => {
    let perSide = (weight - bar) / 2;
    if (perSide <= 0) return 'Empty Bar';

    const plateTypes = [
      { weight: 25, color: 'text-red-400', name: '25kg (Red)' },
      { weight: 20, color: 'text-blue-400', name: '20kg (Blue)' },
      { weight: 15, color: 'text-yellow-400', name: '15kg (Yellow)' },
      { weight: 10, color: 'text-green-400', name: '10kg (Green)' },
      { weight: 5, color: 'text-zinc-200', name: '5kg (White)' },
      { weight: 2.5, color: 'text-zinc-400', name: '2.5kg' },
      { weight: 1.25, color: 'text-zinc-500', name: '1.25kg' }
    ];

    const result = [];
    for (const p of plateTypes) {
      while (perSide >= p.weight - 0.01) {
        result.push(p);
        perSide -= p.weight;
      }
    }
    return result;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-zinc-950 border border-orange-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase text-orange-400 font-bold tracking-widest">
                  1-TAP BARBELL WARMUP LADDER
                </span>
              </div>
              <h3 className="text-xl font-black italic uppercase text-white">
                {liftName} — Target {target} KG
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps List */}
          <div className="space-y-3 my-5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
            {steps.map((s) => {
              const plates = getPlatesPerSide(s.weight, bar);

              return (
                <div
                  key={s.set}
                  className={`p-3.5 rounded-xl border transition-all ${
                    s.isTarget
                      ? 'bg-orange-950/20 border-orange-500 shadow-md shadow-orange-950/30'
                      : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                        s.isTarget ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {s.set}
                      </div>
                      <div>
                        <div className="font-mono font-black text-base text-white flex items-center gap-2">
                          <span>{s.weight} KG</span>
                          <span className="text-xs text-orange-400 font-normal">× {s.reps}</span>
                          <span className="text-[10px] font-mono text-zinc-500">({s.percentage}%)</span>
                        </div>
                        <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{s.cue}</p>
                      </div>
                    </div>

                    {s.isTarget && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-orange-600 text-white font-bold uppercase tracking-wider">
                        Work Set
                      </span>
                    )}
                  </div>

                  {/* Plate Load Visual Cue per side */}
                  <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
                    <span className="text-zinc-500">Per side:</span>
                    {Array.isArray(plates) ? (
                      plates.map((p, idx) => (
                        <span key={idx} className={`font-bold px-1.5 py-0.2 rounded bg-zinc-950 border border-zinc-800 ${p.color}`}>
                          {p.weight}kg
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-400">{plates}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Close */}
          <button
            onClick={onClose}
            className="w-full bg-white hover:bg-zinc-200 text-black font-mono text-xs uppercase font-black py-3 rounded-xl transition-colors shadow-lg"
          >
            Ready to Lift — Close Ladder
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WarmupLadderDrawer;
