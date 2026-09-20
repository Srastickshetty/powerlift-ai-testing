/**
 * IndianNutritionEngine.jsx - Authentic Indian High-Protein Powerlifting Nutrition Planner
 * Precision macro allocation using Indian staples (Soya, Paneer, Sattu, Eggs, Chicken, Dahi, Dals)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Utensils, 
  Flame, 
  Droplet, 
  Award, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Info,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export const IndianNutritionEngine = ({ athleteWeight = 75 }) => {
  const [bodyweight, setBodyweight] = useState(athleteWeight);
  const [dietType, setDietType] = useState('vegetarian'); // 'vegetarian' | 'eggetarian' | 'non_vegetarian'
  const [proteinMultiplier, setProteinMultiplier] = useState(2.0); // 2.0g per kg
  const [calorieTarget, setCalorieTarget] = useState(2600);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch plan from backend
  const fetchNutritionPlan = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://powerlift-ai-backend.onrender.com' 
        : 'http://localhost:5001';

      const res = await fetch(`${apiUrl}/api/india/nutrition-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bodyweightKg: bodyweight,
          dietType,
          multiplier: proteinMultiplier,
          calorieTarget
        })
      });

      const data = await res.json();
      if (data.success) {
        setPlanData(data);
      }
    } catch (err) {
      console.error("Failed to load Indian nutrition plan", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutritionPlan();
  }, [bodyweight, dietType, proteinMultiplier, calorieTarget]);

  return (
    <div className="bg-zinc-950 rounded-2xl border border-white/10 p-6 shadow-2xl font-sans text-white space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold">DESI STRENGTH FUEL</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
            <Utensils className="w-7 h-7 text-emerald-500" />
            Indian High-Protein Nutrition Engine
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Engineered for Indian powerlifters using authentic local staples (Soya, Paneer, Sattu, Dahi, Chicken & Eggs)
          </p>
        </div>

        {/* Diet Type Selector */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-white/5 font-mono text-xs">
          {[
            { id: 'vegetarian', label: 'Pure Veg (Lacto)' },
            { id: 'eggetarian', label: 'Eggetarian' },
            { id: 'non_vegetarian', label: 'Non-Veg' }
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDietType(d.id)}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                dietType === d.id
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control Sliders & Daily Target Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Bodyweight & Protein Slider */}
        <div className="bg-zinc-900/60 p-5 rounded-xl border border-white/5 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-zinc-400">Bodyweight (KG)</span>
              <span className="text-emerald-400 font-bold">{bodyweight} kg</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="140" 
              step="1"
              value={bodyweight} 
              onChange={(e) => setBodyweight(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-zinc-400">Protein Multiplier</span>
              <span className="text-emerald-400 font-bold">{proteinMultiplier}g / kg</span>
            </div>
            <input 
              type="range" 
              min="1.6" 
              max="2.5" 
              step="0.1"
              value={proteinMultiplier} 
              onChange={(e) => setProteinMultiplier(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Protein Target Card */}
        <div className="bg-zinc-900/60 p-5 rounded-xl border border-emerald-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-400">Daily Protein Target</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black italic text-emerald-400 font-mono">
              {planData?.targets?.protein_g || Math.round(bodyweight * proteinMultiplier)}g
            </div>
            <p className="text-[10px] font-mono text-zinc-400 mt-1">
              Menu provides: <span className="text-white font-bold">{planData?.actual_menu_protein || 0}g</span>
            </p>
          </div>
        </div>

        {/* Caloric & Hydration Target */}
        <div className="bg-zinc-900/60 p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-400">Energy & Hydration</span>
            <Droplet className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black italic text-white font-mono">
              {calorieTarget} <span className="text-base text-zinc-400 font-normal">KCAL</span>
            </div>
            <p className="text-[10px] font-mono text-blue-400 mt-1">
              💧 Water Intake: {planData?.targets?.hydration_liters || 3.8} Liters / day
            </p>
          </div>
        </div>

        {/* Daily Estimated Cost in INR */}
        <div className="bg-zinc-900/60 p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-400">Daily Desi Budget</span>
            <DollarSign className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black italic text-yellow-400 font-mono">
              ₹{planData?.estimated_daily_cost_inr || 140}
            </div>
            <p className="text-[10px] font-mono text-zinc-400 mt-1">
              ~₹{(planData?.estimated_daily_cost_inr || 140) * 30}/month for high-protein diet
            </p>
          </div>
        </div>
      </div>

      {/* 4-Meal Detailed Powerlifting Daily Menu */}
      <div className="bg-zinc-900/60 rounded-xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black italic uppercase text-white">Daily Strength Meal Schedule</h3>
            <p className="text-xs font-mono text-zinc-400">Timed nutrient delivery around heavy barbell squat/bench/deadlift sessions</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 px-3 py-1 bg-emerald-950/60 border border-emerald-800/40 rounded-full font-bold uppercase">
            {dietType} Protocol
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planData?.meals?.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="p-5 bg-zinc-950 rounded-xl border border-white/5 hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {m.timing} — {m.meal_name}
                  </span>
                  <div className="px-2.5 py-1 rounded bg-zinc-900 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                    {m.protein_g}g Protein
                  </div>
                </div>

                <ul className="space-y-2 text-xs font-mono text-zinc-300 mt-3">
                  {m.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span className="italic">💡 {m.notes}</span>
                <span className="text-zinc-400 font-bold whitespace-nowrap ml-2">
                  {m.carbs_g}g C / {m.fat_g}g F
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Desi Power Staples Cheat Sheet */}
      <div className="bg-zinc-900/60 rounded-xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black italic uppercase text-white">Desi Power Staples Protein Matrix</h3>
            <p className="text-xs font-mono text-zinc-400">Nutritional value per standard portion with coach preparation tips</p>
          </div>
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {planData?.staple_cheat_sheet?.map((staple, i) => (
            <div key={i} className="p-4 bg-zinc-950 rounded-lg border border-white/5 hover:border-emerald-500/30 transition-all font-mono text-xs space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-bold text-white">{staple.name}</h4>
                <span className="text-emerald-400 font-black">{staple.protein_g}g Pro</span>
              </div>
              <div className="text-[10px] text-zinc-400">
                Serving: {staple.serving_g}g | {staple.calories} kcal ({staple.carbs_g}g C / {staple.fat_g}g F)
              </div>
              <div className="text-[10px] text-zinc-500 bg-zinc-900/80 p-2 rounded border border-white/5">
                <span className="text-emerald-400 font-bold">Chef Tip:</span> {staple.tip}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndianNutritionEngine;
