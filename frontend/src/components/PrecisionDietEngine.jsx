/**
 * PrecisionDietEngine.jsx - Sports Nutrition & Macro Precision Command Center
 * Features:
 * 1. TDEE & Caloric Goal Periodization (Cut, Lean Bulk, Body Recomp)
 * 2. Protein Pacing & Leucine Threshold Distribution (4-5 feedings with MPS timing)
 * 3. High-Yield Desi & Global Protein Cost-per-Gram Matrix (₹ Rupee Economics)
 * 4. Glycogen Refeed & Diet Break Strategist
 * 5. Evidence-Based Supplement Stack Tier List
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Apple, 
  Flame, 
  IndianRupee, 
  Scale, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Layers,
  Copy,
  Check,
  Dumbbell
} from 'lucide-react';
import { toast } from 'sonner';

// High-Yield Desi Protein Cost-per-Gram Database (Indian Market Rates 2026)
const PROTEIN_SOURCES = [
  {
    id: 'soya',
    name: 'Soya Chunks (Nutrela)',
    proteinPer100g: 52,
    costPerKgINR: 200,
    costPerGramProtein: 0.38,
    servingSize: '60g dry',
    proteinPerServing: 31,
    costPerServing: 12,
    vegType: 'pure_veg',
    tag: 'Budget King 🥇',
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40',
    notes: '52% protein density. Complete amino acid profile. Soak in boiling water & squeeze.'
  },
  {
    id: 'eggs',
    name: 'Farm Fresh Eggs (Whole / Whites)',
    proteinPer100g: 13,
    costPerKgINR: 120, // ~Rs 7/egg for 50g
    costPerGramProtein: 1.15,
    servingSize: '4 Whole + 2 Whites',
    proteinPerServing: 32,
    costPerServing: 38,
    vegType: 'veg_eggs',
    tag: 'Gold Bioavailability 🥈',
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/40',
    notes: 'Biological Value 100. High choline and healthy micronutrients in yolk.'
  },
  {
    id: 'paneer_lowfat',
    name: 'Low-Fat Paneer / Homemade Chenna',
    proteinPer100g: 22,
    costPerKgINR: 360,
    costPerGramProtein: 1.63,
    servingSize: '150g',
    proteinPerServing: 33,
    costPerServing: 54,
    vegType: 'pure_veg',
    tag: 'Slow Casein Source 🥉',
    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40',
    notes: 'Slow-digesting micellar casein. Ideal for bedtime meal to prevent overnight catabolism.'
  },
  {
    id: 'chicken_breast',
    name: 'Raw Chicken Breast (Skinless)',
    proteinPer100g: 31,
    costPerKgINR: 280,
    costPerGramProtein: 0.90,
    servingSize: '150g raw',
    proteinPerServing: 46,
    costPerServing: 42,
    vegType: 'non_veg',
    tag: 'Lean Muscle Staple',
    badgeColor: 'border-orange-500/40 text-orange-300 bg-orange-950/40',
    notes: 'Virtually 0 carbs and 0 fat. Pure contractile protein building blocks.'
  },
  {
    id: 'whey_concentrate',
    name: 'Whey Protein Concentrate (80%)',
    proteinPer100g: 80,
    costPerKgINR: 1900,
    costPerGramProtein: 2.37,
    servingSize: '1 Scoop (33g)',
    proteinPerServing: 25,
    costPerServing: 62,
    vegType: 'pure_veg',
    tag: 'Rapid Leucine Spike',
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-950/40',
    notes: 'Rapidly absorbed. Highest leucine concentration (3g per scoop) for post-workout MPS.'
  },
  {
    id: 'sattu',
    name: 'Chana Sattu (Roasted Gram Flour)',
    proteinPer100g: 22,
    costPerKgINR: 140,
    costPerGramProtein: 0.63,
    servingSize: '75g',
    proteinPerServing: 16.5,
    costPerServing: 10.5,
    vegType: 'pure_veg',
    tag: 'Traditional Desi Fuel',
    badgeColor: 'border-yellow-500/40 text-yellow-300 bg-yellow-950/40',
    notes: 'High complex carbs + plant protein. Excellent natural mass gainer beverage.'
  },
  {
    id: 'moong_sprouts',
    name: 'Sprouted Green Moong Dal',
    proteinPer100g: 24,
    costPerKgINR: 120,
    costPerGramProtein: 0.50,
    servingSize: '100g raw',
    proteinPerServing: 24,
    costPerServing: 12,
    vegType: 'pure_veg',
    tag: 'Micro & Fiber Dense',
    badgeColor: 'border-lime-500/40 text-lime-300 bg-lime-950/40',
    notes: 'Germination increases bioavailability and reduces phytic acid.'
  }
];

// Evidence-Based Supplement Tiers
const SUPPLEMENT_TIERS = [
  {
    tier: 'Tier S (Essential Performance)',
    badge: 'bg-emerald-950 border-emerald-500/60 text-emerald-300',
    items: [
      { name: 'Creatine Monohydrate', dose: '5g daily', why: 'Directly restores intramuscular phosphocreatine. Increases 1RM strength by ~8-14% and cellular hydration.' },
      { name: 'Whey Protein (Isolate/Concentrate)', dose: '1-2 scoops/day', why: 'Convenient high-leucine protein delivery to meet 2.0g/kg target.' },
      { name: 'Caffeine Anhydrous / Pre-workout', dose: '150-300mg pre-lift', why: 'Adenosine receptor antagonist. Increases central nervous drive and reduces perceived exertion.' }
    ]
  },
  {
    tier: 'Tier A (Health, Recovery & Hormone Baseline)',
    badge: 'bg-cyan-950 border-cyan-500/60 text-cyan-300',
    items: [
      { name: 'Vitamin D3 + K2', dose: '2000-5000 IU daily', why: 'Critical for free testosterone synthesis, immune regulation, and bone density.' },
      { name: 'Omega-3 Fish Oil (High EPA/DHA)', dose: '2-3g combined EPA/DHA', why: 'Reduces joint inflammation and enhances muscle protein synthesis sensitivity.' },
      { name: 'Magnesium Glycinate / Bisglycinate', dose: '300-400mg before bed', why: 'Improves deep slow-wave sleep (REM) and prevents muscle cramps.' }
    ]
  },
  {
    tier: 'Tier B (Marginal Edge / High Volume)',
    badge: 'bg-amber-950 border-amber-500/60 text-amber-300',
    items: [
      { name: 'L-Citrulline Malate (2:1)', dose: '6-8g pre-workout', why: 'Direct nitric oxide precursor. Increases muscle pumps and reduces muscle soreness.' },
      { name: 'Electrolyte Salts (Sodium + Potassium)', dose: '500-1000mg sodium in water', why: 'Prevents mid-workout fatigue and maintains cell turgor pressure during heavy squats.' }
    ]
  },
  {
    tier: 'Tier F (Waste of Money / Don\'t Buy)',
    badge: 'bg-red-950 border-red-500/60 text-red-300',
    items: [
      { name: 'BCAAs (Branched-Chain Amino Acids)', dose: '0g (Skip)', why: 'If your daily protein intake is adequate, free-form BCAAs provide ZERO additional muscle growth and waste money.' },
      { name: 'Herbal Testosterone Boosters', dose: '0g (Skip)', why: 'Tribulus, Ashwagandha extracts do not raise free testosterone above baseline in healthy males.' },
      { name: 'Commercial Mass Gainers', dose: '0g (Skip)', why: '80% cheap maltodextrin sugar. Drink sattu, milk, oats, and bananas instead at 1/5th the cost.' }
    ]
  }
];

export default function PrecisionDietEngine({ athleteWeight = 74, athleteGoal = 'lean_bulk' }) {
  const [activeTab, setActiveTab] = useState('macro_planner'); // 'macro_planner' | 'protein_pacing' | 'desi_matrix' | 'refeed_strategist' | 'supplements'
  
  // Athlete Profile Parameters
  const [bwKg, setBwKg] = useState(athleteWeight || 74);
  const [heightCm, setHeightCm] = useState(175);
  const [age, setAge] = useState(24);
  const [gender, setGender] = useState('male');
  const [activityFactor, setActivityFactor] = useState(1.55); // 1.2 Sedentary, 1.375 Light, 1.55 Moderate, 1.725 Heavy
  const [phase, setPhase] = useState('cut'); // 'cut' | 'lean_bulk' | 'recomp'
  const [dietFilter, setDietFilter] = useState('all'); // 'all' | 'pure_veg' | 'veg_eggs' | 'non_veg'
  const [dailyBudget, setDailyBudget] = useState(250); // INR

  // Calculate BMR & TDEE (Mifflin-St Jeor)
  const { bmr, tdee, targetCalories, targetProteinG, targetCarbsG, targetFatsG } = useMemo(() => {
    let baseBmr = 10 * bwKg + 6.25 * heightCm - 5 * age;
    baseBmr = gender === 'male' ? baseBmr + 5 : baseBmr - 161;

    const maintenanceTdee = Math.round(baseBmr * activityFactor);

    let calories = maintenanceTdee;
    let proteinPerKg = 2.2;
    let fatsPerKg = 0.8;

    if (phase === 'cut') {
      calories = maintenanceTdee - 450; // Moderate 450 kcal deficit
      proteinPerKg = 2.4; // Elevated protein to prevent catabolism
      fatsPerKg = 0.7;
    } else if (phase === 'lean_bulk') {
      calories = maintenanceTdee + 275; // Clean 275 kcal surplus
      proteinPerKg = 2.0;
      fatsPerKg = 0.85;
    } else {
      // Recomposition
      calories = maintenanceTdee;
      proteinPerKg = 2.2;
      fatsPerKg = 0.8;
    }

    const proteinG = Math.round(bwKg * proteinPerKg);
    const fatsG = Math.round(bwKg * fatsPerKg);
    const remainingCaloriesForCarbs = Math.max(0, calories - (proteinG * 4 + fatsG * 9));
    const carbsG = Math.round(remainingCaloriesForCarbs / 4);

    return {
      bmr: Math.round(baseBmr),
      tdee: maintenanceTdee,
      targetCalories: calories,
      targetProteinG: proteinG,
      targetCarbsG: carbsG,
      targetFatsG: fatsG
    };
  }, [bwKg, heightCm, age, gender, activityFactor, phase]);

  // Protein Pacing Schedule across 4 meals
  const mealSchedule = useMemo(() => {
    const mealProtein = Math.round(targetProteinG / 4);
    const mealCarbs = Math.round(targetCarbsG / 4);
    const mealFats = Math.round(targetFatsG / 4);

    return [
      {
        mealNumber: 1,
        name: 'Breakfast / Anabolic Ignition',
        time: '08:30 AM',
        protein: mealProtein,
        carbs: mealCarbs,
        fats: mealFats,
        leucineG: 3.1,
        focus: 'Break fast with rapid leucine pulse to switch off overnight muscle breakdown.'
      },
      {
        mealNumber: 2,
        name: 'Mid-Day Fuel / Steady Synthesis',
        time: '01:30 PM',
        protein: mealProtein,
        carbs: mealCarbs + 10,
        fats: mealFats,
        leucineG: 2.9,
        focus: 'Complex carbohydrates + sustained release protein for sustained blood amino acids.'
      },
      {
        mealNumber: 3,
        name: 'Pre-Workout Primer / Intra Surge',
        time: '05:30 PM',
        protein: mealProtein,
        carbs: mealCarbs + 15,
        fats: Math.max(5, mealFats - 5),
        leucineG: 3.4,
        focus: 'Low fat for rapid gastric emptying. High carbs for full muscle glycogen pumps.'
      },
      {
        mealNumber: 4,
        name: 'Post-Workout / Bedtime Casein Sustained',
        time: '09:30 PM',
        protein: targetProteinG - (mealProtein * 3),
        carbs: targetCarbsG - (mealCarbs * 2 + (mealCarbs + 10) + (mealCarbs + 15)),
        fats: targetFatsG - (mealFats * 3),
        leucineG: 3.0,
        focus: 'Slow-digesting paneer/curd/casein to nourish recovering motor units across 8 hours of sleep.'
      }
    ];
  }, [targetProteinG, targetCarbsG, targetFatsG]);

  // Refeed Calculations
  const refeedPlan = useMemo(() => {
    const refeedCarbs = targetCarbsG + 100;
    const refeedFats = Math.max(25, targetFatsG - 15);
    const refeedCalories = (targetProteinG * 4) + (refeedCarbs * 4) + (refeedFats * 9);
    return {
      calories: refeedCalories,
      carbs: refeedCarbs,
      fats: refeedFats,
      extraCarbs: 100,
      protocol: 'Schedule on your heaviest leg or back training day. Keeps thyroid (T3) and leptin primed during fat loss.'
    };
  }, [targetProteinG, targetCarbsG, targetFatsG]);

  // Filter protein items
  const filteredProteins = useMemo(() => {
    if (dietFilter === 'all') return PROTEIN_SOURCES;
    return PROTEIN_SOURCES.filter(p => p.vegType === dietFilter || (dietFilter === 'veg_eggs' && p.vegType === 'pure_veg'));
  }, [dietFilter]);

  return (
    <div className="bg-zinc-950 rounded-2xl border border-emerald-500/20 p-5 md:p-7 shadow-2xl space-y-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold">SPORTS NUTRITION LAB</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
            <Apple className="w-7 h-7 text-emerald-500" />
            Precision Diet, Macros & Nutrition Engine
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Periodized calories, protein pacing (MPS leucine thresholds), Desi cost-per-gram economics, and refeed protocols.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-white/5 font-mono text-xs overflow-x-auto">
          {[
            { id: 'macro_planner', label: '🎯 TDEE & Macros' },
            { id: 'protein_pacing', label: '⏱️ Protein Pacing (MPS)' },
            { id: 'desi_matrix', label: '₹ Desi Protein Matrix' },
            { id: 'refeed_strategist', label: '⚡ Refeed Strategist' },
            { id: 'supplements', label: '💊 Supplement Tier List' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === t.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TDEE & MACRO PERIODIZATION PLANNER */}
      {/* ========================================================================= */}
      {activeTab === 'macro_planner' && (
        <div className="space-y-6">
          {/* Phase Selector Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'cut', label: '🔥 Aggressive Fat Loss Cut', sub: '-450 kcal deficit • High protein preservation' },
              { id: 'lean_bulk', label: '⚡ Clean Lean Bulk', sub: '+275 kcal surplus • Pure contractile growth' },
              { id: 'recomp', label: '⚖️ Body Recomposition', sub: 'Eucaloric • Fat loss + Muscle gain' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPhase(p.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  phase === p.id 
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-950/50' 
                    : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <p className="text-xs font-bold text-white leading-tight">{p.label}</p>
                <p className="text-[10px] font-mono text-zinc-400 mt-1">{p.sub}</p>
              </button>
            ))}
          </div>

          {/* Athlete Biometric Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-4 rounded-xl border border-white/10 font-mono text-xs">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase block mb-1">Bodyweight (KG)</label>
              <input
                type="number"
                step="0.5"
                value={bwKg}
                onChange={e => setBwKg(parseFloat(e.target.value) || 70)}
                className="w-full bg-black border border-white/10 rounded px-3 py-1.5 text-white font-bold text-center"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase block mb-1">Height (CM)</label>
              <input
                type="number"
                value={heightCm}
                onChange={e => setHeightCm(parseFloat(e.target.value) || 175)}
                className="w-full bg-black border border-white/10 rounded px-3 py-1.5 text-white font-bold text-center"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase block mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(parseInt(e.target.value) || 24)}
                className="w-full bg-black border border-white/10 rounded px-3 py-1.5 text-white font-bold text-center"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase block mb-1">Training Frequency</label>
              <select
                value={activityFactor}
                onChange={e => setActivityFactor(parseFloat(e.target.value))}
                className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-white font-bold text-center"
              >
                <option value={1.375}>3-4 Days / Week</option>
                <option value={1.55}>5-6 Days / Week (Standard)</option>
                <option value={1.725}>6+ Days / 2x Sessions</option>
              </select>
            </div>
          </div>

          {/* The Solved Macro Target Banner */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-emerald-950/80 rounded-2xl border-2 border-emerald-500/50 p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                DAILY CALORIC & MACRONUTRIENT BLUEPRINT ({phase.toUpperCase().replace('_', ' ')})
              </span>
              <span className="text-xs font-mono text-zinc-400">
                BMR: {bmr} kcal • Maintenance TDEE: {tdee} kcal
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
              <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">Total Daily Calories</span>
                <span className="text-3xl sm:text-4xl font-black italic text-emerald-400">{targetCalories}</span>
                <span className="text-xs text-zinc-500 block mt-0.5">KCAL / DAY</span>
              </div>
              <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">Protein (4 kcal/g)</span>
                <span className="text-3xl sm:text-4xl font-black italic text-cyan-400">{targetProteinG}</span>
                <span className="text-xs text-zinc-500 block mt-0.5">GRAMS ({(targetProteinG / bwKg).toFixed(1)}g/kg)</span>
              </div>
              <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">Carbohydrates (4 kcal/g)</span>
                <span className="text-3xl sm:text-4xl font-black italic text-amber-400">{targetCarbsG}</span>
                <span className="text-xs text-zinc-500 block mt-0.5">GRAMS (Glycogen)</span>
              </div>
              <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">Dietary Fats (9 kcal/g)</span>
                <span className="text-3xl sm:text-4xl font-black italic text-pink-400">{targetFatsG}</span>
                <span className="text-xs text-zinc-500 block mt-0.5">GRAMS (Hormonal)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROTEIN PACING & LEUCINE THRESHOLD DISTRIBUTION */}
      {/* ========================================================================= */}
      {activeTab === 'protein_pacing' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/10 space-y-1">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">SPORTS NUTRITION PRINCIPLE</span>
            <h3 className="text-sm font-bold text-white">Why Protein Pacing Beats 1 Huge Meal</h3>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Muscle Protein Synthesis (MPS) has a "refractory period". Eating 100g of protein in 1 sitting does not build 2x more muscle than 40g. To maximize 24-hour myofibrillar growth, you must stimulate the <strong>Leucine Trigger (&ge; 2.7g leucine)</strong> every 3 to 4.5 hours across 4 distinct feedings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mealSchedule.map(m => (
              <div key={m.mealNumber} className="bg-zinc-900/60 rounded-xl border border-white/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center">
                      {m.mealNumber}
                    </span>
                    <h4 className="text-sm font-bold text-white">{m.name}</h4>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> {m.time}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs bg-black/40 p-2.5 rounded-lg border border-white/5">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Protein</span>
                    <span className="text-sm font-bold text-cyan-400">{m.protein}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Carbs</span>
                    <span className="text-sm font-bold text-amber-400">{m.carbs}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Fats</span>
                    <span className="text-sm font-bold text-pink-400">{m.fats}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Leucine</span>
                    <span className="text-sm font-bold text-emerald-400">{m.leucineG}g</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  💡 {m.focus}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HIGH-YIELD DESI PROTEIN COST MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'desi_matrix' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                INDIAN GROCERY REALITY & RUPEE COST-PER-GRAM
              </span>
              <h3 className="text-base font-bold text-white">Smart High-Protein Pantry Architecture</h3>
            </div>

            {/* Diet Filter Switcher */}
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-white/5 font-mono text-xs">
              {[
                { id: 'all', label: 'All Sources' },
                { id: 'pure_veg', label: 'Pure Veg 🌱' },
                { id: 'veg_eggs', label: 'Vegetarian + Eggs 🥚' },
                { id: 'non_veg', label: 'Non-Veg 🍗' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setDietFilter(f.id)}
                  className={`px-2.5 py-1 rounded font-bold transition-all ${
                    dietFilter === f.id ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredProteins.map(p => (
              <div key={p.id} className="bg-zinc-900/60 rounded-xl border border-white/10 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${p.badgeColor}`}>
                      {p.tag}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{p.name}</h4>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-base font-black text-emerald-400">₹{p.costPerGramProtein.toFixed(2)}</span>
                    <span className="text-[10px] text-zinc-500 block">/ 1g protein</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs bg-black/40 p-2.5 rounded-lg border border-white/5">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Serving ({p.servingSize}):</span>
                    <span className="text-white font-bold">{p.proteinPerServing}g Protein</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Cost / Serving:</span>
                    <span className="text-amber-400 font-bold">₹{p.costPerServing}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 font-sans leading-relaxed">{p.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GLYCOGEN REFEED & DIET BREAK STRATEGIST */}
      {/* ========================================================================= */}
      {activeTab === 'refeed_strategist' && (
        <div className="bg-zinc-900/60 rounded-xl border border-white/10 p-5 md:p-6 space-y-5">
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">
              METABOLIC PRESERVATION & LEPTIN RESTORATION
            </span>
            <h3 className="text-xl font-black italic text-white">
              Weekly Glycogen Refeed Protocol (Cut Phase)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Prevent metabolic adaptation, restore muscle fullness, and fire up central nervous intensity for heavy squat/deadlift days.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-center">
            <div className="bg-black/50 p-4 rounded-xl border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">Refeed Total Calories</span>
              <span className="text-3xl font-black italic text-amber-400">{refeedPlan.calories}</span>
              <span className="text-xs text-zinc-500 block mt-0.5">KCAL (+{refeedPlan.calories - targetCalories} kcal)</span>
            </div>
            <div className="bg-black/50 p-4 rounded-xl border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">Elevated Carbs (+100g)</span>
              <span className="text-3xl font-black italic text-emerald-400">{refeedPlan.carbs}</span>
              <span className="text-xs text-zinc-500 block mt-0.5">GRAMS (Glycogen Supercomp)</span>
            </div>
            <div className="bg-black/50 p-4 rounded-xl border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">Suppressed Fats</span>
              <span className="text-3xl font-black italic text-pink-400">{refeedPlan.fats}</span>
              <span className="text-xs text-zinc-500 block mt-0.5">GRAMS (Prevents Fat Storage)</span>
            </div>
          </div>

          <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>HOW TO EXECUTE THE REFEED:</span>
            </div>
            <ul className="space-y-1.5 text-zinc-300 font-sans list-disc list-inside">
              <li><strong>Timing:</strong> Schedule once every 7 to 10 days of continuous caloric deficit, ideally on the evening before or morning of your heaviest session.</li>
              <li><strong>Source Selection:</strong> Clean, high-starch carbohydrates: Basmati rice, sweet potatoes, oats, sourdough, and cream of rice.</li>
              <li><strong>Strict Fat Suppression:</strong> Keep dietary fats strictly below 40g on refeed days so elevated insulin does not shuttle dietary fat into adipose stores.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: EVIDENCE-BASED SUPPLEMENT STACK TIER LIST */}
      {/* ========================================================================= */}
      {activeTab === 'supplements' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/10">
            <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">OBJECTIVE CLINICAL EVALUATION</span>
            <h3 className="text-base font-bold text-white">Evidence-Based Supplement Tier List</h3>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              90% of bodybuilding supplements on gym shelves are predatory marketing. Below is the clinical consensus on what actually improves lean mass, strength, and health.
            </p>
          </div>

          <div className="space-y-4">
            {SUPPLEMENT_TIERS.map((tierData, idx) => (
              <div key={idx} className="bg-zinc-900/60 rounded-xl border border-white/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono px-2.5 py-1 rounded border font-bold ${tierData.badge}`}>
                    {tierData.tier}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {tierData.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="bg-black/40 p-3.5 rounded-lg border border-white/5 space-y-1.5 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                      </div>
                      <span className="text-[11px] text-cyan-400 font-bold block">{item.dose}</span>
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">{item.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
