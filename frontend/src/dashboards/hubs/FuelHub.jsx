import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Apple, 
  Utensils, 
  Share2, 
  Scale, 
  Droplet, 
  Clock, 
  Zap, 
  Check, 
  SlidersHorizontal 
} from 'lucide-react';
import { toast } from 'sonner';

export default function FuelHub({ 
  pathway = 'powerlifting', 
  athleteProfile,
  isAdvancedMode = false 
}) {
  const isPowerlifting = pathway === 'powerlifting';
  const bodyweight = athleteProfile?.bodyweight || 74;
  const gender = athleteProfile?.gender || 'male';

  // Bodybuilding Phase: 'cut' | 'maintain' | 'bulk'
  const [bbPhase, setBbPhase] = useState('maintain');

  // Dynamic Targets Calculation
  let targetCalories = Math.round(bodyweight * 33);
  let targetProtein = Math.round(bodyweight * 2.0);

  if (!isPowerlifting) {
    if (bbPhase === 'cut') {
      targetCalories = Math.round(bodyweight * 24);
      targetProtein = Math.round(bodyweight * 2.4);
    } else if (bbPhase === 'bulk') {
      targetCalories = Math.round(bodyweight * 34);
      targetProtein = Math.round(bodyweight * 2.0);
    } else {
      targetCalories = Math.round(bodyweight * 29);
      targetProtein = Math.round(bodyweight * 2.2);
    }
  }

  // Official IPF Weight Classes
  const ipfClasses = gender === 'female' 
    ? [47, 52, 57, 63, 69, 76, 84]
    : [59, 66, 74, 83, 93, 105, 120];

  const matchedIpfClass = ipfClasses.find(c => bodyweight <= c) || `${ipfClasses[ipfClasses.length - 1]}+`;
  const classDifference = typeof matchedIpfClass === 'number' 
    ? (bodyweight - matchedIpfClass).toFixed(1)
    : 0;

  // Daily Meal Routine
  const dailyMeals = isPowerlifting ? [
    { time: 'Breakfast', name: 'Sattu Strength Drink + 2 Parathas with Curd', protein: '32g protein', desc: 'Sustained energy and glycogen fuel' },
    { time: 'Lunch', name: '70g Soya Chunks Curry + Steamed Rice + Dal', protein: '42g protein', desc: 'Dense leucine and carbohydrate saturation' },
    { time: 'Pre-Workout', name: '1 Banana + Black Coffee + Salt pinch', protein: '3g protein', desc: 'CNS stimulant & muscle pump' },
    { time: 'Dinner', name: '150g Paneer Bhurji + 2 Rotis + Salad', protein: '38g protein', desc: 'Overnight recovery & structural rebuild' }
  ] : [
    { time: 'Meal 1 (08:30)', name: '50g Oats with Sattu & Milk + 1 Banana', protein: '30g protein', desc: 'Leucine Spike 1 — Initiates protein synthesis' },
    { time: 'Meal 2 (13:00)', name: '60g Soya Chunks Bhurji + Rice + Dahi', protein: '38g protein', desc: 'Leucine Spike 2 — Refuels amino acid pool' },
    { time: 'Meal 3 (17:30)', name: 'Roasted Chana (50g) + Dahi / Curd', protein: '18g protein', desc: 'Leucine Spike 3 — Sustained nitrogen retention' },
    { time: 'Meal 4 (21:30)', name: '120g Low-Fat Paneer + 2 Rotis', protein: '35g protein', desc: 'Overnight Casein & structural repair' }
  ];

  const shareGroceryToWhatsApp = () => {
    const text = `🛒 *TITAN-AI INDIAN HIGH-PROTEIN GROCERY BASKET*
👤 *Athlete:* ${athleteProfile?.displayName || 'Lifter'}
🎯 *Discipline:* ${isPowerlifting ? `Powerlifting Fuel (${matchedIpfClass}kg IPF Class)` : `Bodybuilding (${bbPhase.toUpperCase()})`}
📊 *Daily Target:* ${targetCalories} kcal • ${targetProtein}g Protein

📋 *Weekly Grocery Essentials:*
  1. *Soya Chunks (Fortune/Nutrela)* — 2 kg (52g protein/100g)
  2. *Low-Fat Paneer* — 2.5 kg (28g protein/100g)
  3. *Chana Sattu (Desi)* — 1.5 kg (24g protein/100g)
  4. *Roasted Bhoona Chana* — 1 kg (high fiber snack)
  5. *Dahi / Fresh Curd* — 4 kg (probiotic digestive support)

Generated via TITAN-AI Platform`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const accentColor = isPowerlifting ? 'text-orange-400' : 'text-purple-400';
  const badgeBorder = isPowerlifting ? 'border-orange-500/30' : 'border-purple-500/30';
  const badgeBg = isPowerlifting ? 'bg-orange-950/50' : 'bg-purple-950/50';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 1. TOP FUEL HEADER & MACRO CARD */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${accentColor}`}>
                {isPowerlifting ? '⚡ POWERLIFTING METABOLIC ENGINE' : '🧬 LEUCINE-PACED HYPERTROPHY DIET'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${badgeBg} ${accentColor} border ${badgeBorder}`}>
                {isPowerlifting ? `${matchedIpfClass}KG IPF CLASS` : bbPhase.toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-black italic uppercase text-white">
              Daily Macro & Nutrition Plan
            </h2>
          </div>

          <button
            onClick={shareGroceryToWhatsApp}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition-all self-start sm:self-auto"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp Grocery List</span>
          </button>
        </div>

        {/* Bodybuilding Goal Selector (Cut / Maintain / Bulk) */}
        {!isPowerlifting && (
          <div className="mt-4 pt-4 border-t border-zinc-800/60">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-2">
              SELECT PHYSIQUE CALORIC PHASE:
            </span>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              {[
                { id: 'cut', label: '✂️ Cut / Shred', desc: '-500 kcal deficit' },
                { id: 'maintain', label: '⚖️ Recomp / Maintain', desc: 'Maintenance' },
                { id: 'bulk', label: '💪 Hypertrophy Bulk', desc: '+350 kcal surplus' }
              ].map(phase => (
                <button
                  key={phase.id}
                  onClick={() => setBbPhase(phase.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    bbPhase === phase.id
                      ? 'bg-purple-600 border-purple-500 text-white font-bold shadow-md shadow-purple-950'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">{phase.label}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{phase.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Powerlifting IPF Class Info Strip */}
        {isPowerlifting && (
          <div className="mt-4 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="text-zinc-300">
              <span>Class: <strong className="text-white font-bold">{matchedIpfClass}kg Class</strong></span>
              <span className="text-zinc-500 mx-2">•</span>
              <span>Bodyweight: <strong className="text-orange-400">{bodyweight}kg</strong></span>
            </div>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
              {Number(classDifference) <= 0 
                ? '✅ On Target for Weigh-In' 
                : `⚠️ +${classDifference}kg over limit — Water cut required`}
            </span>
          </div>
        )}

        {/* 2 Simple Big Macro Numbers */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl">
            <span className="text-xs font-mono text-zinc-400 uppercase">Daily Calorie Target</span>
            <div className="text-2xl font-black text-white mt-1">
              {targetCalories} <span className="text-xs font-normal text-zinc-500 font-mono">kcal</span>
            </div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl">
            <span className="text-xs font-mono text-zinc-400 uppercase">Daily Protein Target</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {targetProtein} <span className="text-xs font-normal text-zinc-500 font-mono">g</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SIMPLE MEAL SCHEDULE */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase text-zinc-400 font-bold px-1">
          Recommended Daily Meals ({isPowerlifting ? 'High-Energy Glycogen Fuel' : 'Timed Leucine Pacing Every 4 Hours'})
        </div>

        {dailyMeals.map((meal, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div>
              <span className={`text-[11px] font-mono font-bold uppercase ${accentColor}`}>{meal.time}</span>
              <h3 className="text-base font-bold text-white mt-0.5">{meal.name}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">{meal.desc}</p>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-400 px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/20 self-start sm:self-auto">
              {meal.protein}
            </div>
          </div>
        ))}
      </div>

      {/* 3. PRO TOOLS EXPANSIONS */}
      {isAdvancedMode && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className={`flex items-center gap-2 text-xs font-mono font-bold uppercase ${accentColor}`}>
            <SlidersHorizontal className="w-4 h-4" />
            <span>Pro Platform Protocols ({isPowerlifting ? 'IPF Water Cut & Rehydration' : 'mTOR Leucine Science'})</span>
          </div>

          {isPowerlifting ? (
            <div className="space-y-3 font-mono text-xs text-zinc-300">
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-orange-400 font-bold block mb-1">5-Day Water Cut:</span>
                Days -5 to -4: 7L water load • Day -3: 5L water • Day -2: 2.5L water • Day -1: 500ml sips only.
              </div>
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-emerald-400 font-bold block mb-1">2-Hour Post-Weigh-in Rehydration:</span>
                0-15m: 1L water + ORS electrolytes • 15-45m: 75g rapid carbs (bananas, honey rice) • 45m+: 30g whey/sattu + creatine.
              </div>
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs text-zinc-300">
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-purple-400 font-bold block mb-1">Leucine Pacing Rule:</span>
                Consume minimum 3.0g leucine every 3.5 to 4 hours to re-sensitize the mTOR pathway.
              </div>
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-emerald-400 font-bold block mb-1">Nutrient Timing:</span>
                Distribute daily protein across 4 equal pulses rather than 1-2 massive meals for optimal fractional synthetic rate (FSR).
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
