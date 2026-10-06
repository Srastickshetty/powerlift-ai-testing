import React, { useState, useMemo } from 'react';
import { Utensils, IndianRupee, Clock, ShieldCheck, Flame } from 'lucide-react';
import { generateIndianDietPlan } from '@powerlift/engines';
import Stat from '../../ui/Stat';

export default function IndianNutritionView({ defaultBw = 75 }) {
  const [bodyweight, setBodyweight] = useState(defaultBw);
  const [dietType, setDietType] = useState('vegetarian');
  const [multiplier, setMultiplier] = useState(2.0);
  const [calories, setCalories] = useState(2600);

  const plan = useMemo(() => {
    return generateIndianDietPlan({
      bodyweightKg: Number(bodyweight) || 75,
      dietType,
      proteinMultiplier: Number(multiplier) || 2.0,
      calorieTarget: Number(calories) || 2600
    });
  }, [bodyweight, dietType, multiplier, calories]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <Utensils className="h-5 w-5 text-accent" />
            <span>Desi Nutrition &amp; Budget Engine</span>
          </h2>
          <span className="text-xs text-muted block mt-0.5">
            Regional high-protein macro allocation with affordable Indian staples
          </span>
        </div>

        {/* Diet Type Selector */}
        <div className="flex rounded-lg border border-line bg-surface p-1 text-xs">
          {[
            { id: 'vegetarian', label: 'Vegetarian' },
            { id: 'eggetarian', label: 'Eggetarian' },
            { id: 'non_vegetarian', label: 'Non-Veg' }
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setDietType(type.id)}
              className={`px-3 py-1.5 rounded font-semibold transition ${
                dietType === type.id ? 'bg-accent text-bg font-bold' : 'text-muted hover:text-ink'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat
          label="Target Protein"
          value={plan.targetProteinGrams}
          unit="g/day"
          change={`${multiplier} g/kg`}
          changeType="ok"
        />
        <Stat
          label="Daily Caloric Target"
          value={plan.totalCalories}
          unit="kcal"
          change="Energy Balance"
        />
        <Stat
          label="Est. Daily Cost"
          value={`₹${plan.estimatedDailyCostINR}`}
          unit="/day"
          change="Pocket-Friendly"
          changeType="ok"
        />
        <Stat
          label="Cost Per Gram Protein"
          value={`₹${plan.costPerGramProteinINR}`}
          unit="/g"
          change="Optimal Density"
        />
      </div>

      {/* Staples Highlighted */}
      <div className="rounded-xl border border-line bg-surface p-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono uppercase text-muted mr-2">Key Staples:</span>
        {plan.staplesHighlighted.map((staple) => (
          <span key={staple} className="rounded-md border border-line bg-bg px-2.5 py-1 text-xs font-bold text-accent">
            {staple}
          </span>
        ))}
      </div>

      {/* Meal Breakdown Cards */}
      <div className="space-y-3">
        {plan.meals.map((meal, idx) => (
          <div key={idx} className="rounded-xl border border-line bg-surface p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                <span className="font-bold text-ink text-sm">{meal.mealName}</span>
                <span className="text-xs text-muted font-mono">({meal.timing})</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-accent font-bold">{meal.proteinGrams}g Protein</span>
                <span className="text-muted">{meal.carbsGrams}g C</span>
                <span className="text-muted">{meal.fatGrams}g F</span>
              </div>
            </div>

            <ul className="text-xs text-ink/90 space-y-1 list-disc list-inside">
              {meal.items.map((item, iIdx) => (
                <li key={iIdx}>{item}</li>
              ))}
            </ul>

            <p className="text-[11px] text-muted italic pt-1 border-t border-line/50">
              💡 {meal.notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
