/**
 * @powerlift/engines/bodybuilding/indianDietEngine
 * Authentic Indian bodybuilding & strength nutrition planner with staples, portion allocation, and INR budget optimizer.
 * Pure deterministic calculations.
 */

export type IndianDietType = 'vegetarian' | 'eggetarian' | 'non_vegetarian';

export interface IndianMealPlanInput {
  bodyweightKg: number;
  dietType: IndianDietType;
  proteinMultiplier?: number; // default 2.0g/kg
  calorieTarget?: number;     // default ~2600
}

export interface MealItemPlan {
  mealName: string;
  timing: string;
  items: string[];
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  notes: string;
}

export interface IndianDietPlan {
  dietType: IndianDietType;
  targetProteinGrams: number;
  targetCarbGrams: number;
  targetFatGrams: number;
  totalCalories: number;
  estimatedDailyCostINR: number;
  costPerGramProteinINR: number;
  staplesHighlighted: string[];
  meals: MealItemPlan[];
}

export function generateIndianDietPlan(input: IndianMealPlanInput): IndianDietPlan {
  const {
    bodyweightKg = 75,
    dietType = 'vegetarian',
    proteinMultiplier = 2.0,
    calorieTarget = 2600
  } = input;

  const targetProteinGrams = Math.round(bodyweightKg * proteinMultiplier);
  const targetFatGrams = Math.round((calorieTarget * 0.25) / 9);
  const targetCarbGrams = Math.round((calorieTarget - (targetProteinGrams * 4 + targetFatGrams * 9)) / 4);

  let meals: MealItemPlan[] = [];
  let estimatedDailyCostINR = 140;
  let staplesHighlighted: string[] = [];

  if (dietType === 'vegetarian') {
    estimatedDailyCostINR = 140;
    staplesHighlighted = ['Soya Chunks', 'Paneer', 'Sattu', 'Hung Curd', 'Moong Dal'];
    meals = [
      {
        mealName: 'Meal 1 — Desi Power Breakfast',
        timing: '8:00 AM',
        items: [
          '60g Sattu Drink (with cold water, black salt, lemon, and roasted cumin)',
          '150g Hung Curd / Greek Dahi with 1 tsp roasted flaxseeds',
          '2 Whole Wheat Rotis'
        ],
        proteinGrams: 27,
        carbsGrams: 65,
        fatGrams: 10,
        notes: 'Sattu provides sustained complex carbs and clean gut-friendly plant protein.'
      },
      {
        mealName: 'Meal 2 — Post-Workout Recovery',
        timing: '12:30 PM',
        items: [
          '1 Scoop Whey Protein (25g protein) with 300ml water',
          '1 Large Banana'
        ],
        proteinGrams: 26,
        carbsGrams: 30,
        fatGrams: 2,
        notes: 'Rapid amino acid delivery to trigger muscle protein synthesis.'
      },
      {
        mealName: 'Meal 3 — High-Protein Lunch',
        timing: '2:00 PM',
        items: [
          '60g Soya Chunks Curry (boiled and squeezed dry, cooked in onion-tomato masala)',
          '1 Bowl Thick Moong / Toor Dal (200g)',
          '1.5 Cups Steamed Rice + Green Salad'
        ],
        proteinGrams: 45,
        carbsGrams: 75,
        fatGrams: 6,
        notes: 'Soya chunks provide unmatched 52% protein density at an affordable Indian budget.'
      },
      {
        mealName: 'Meal 4 — Pre-Bed Strength Recovery Dinner',
        timing: '8:30 PM',
        items: [
          '180g Low-Fat Paneer Bhurji / Grilled Paneer with turmeric and bell peppers',
          '2 Multigrain Rotis',
          'Cucumber & Tomato Salad with lemon juice'
        ],
        proteinGrams: 38,
        carbsGrams: 45,
        fatGrams: 20,
        notes: 'Slow-digesting micellar casein in paneer prevents catabolism across 8 hours of sleep.'
      },
      {
        mealName: 'Optional Evening Snack',
        timing: 'Evening',
        items: ['30g Roasted Chana (Bhuna Chana)', 'Handful of Almonds (15g)'],
        proteinGrams: 8,
        carbsGrams: 18,
        fatGrams: 8,
        notes: 'Mineral dense magnesium and zinc for athletic recovery.'
      }
    ];
  } else if (dietType === 'eggetarian') {
    estimatedDailyCostINR = 160;
    staplesHighlighted = ['Whole Eggs', 'Egg Whites', 'Soya Chunks', 'Dahi', 'Dal Tadka'];
    meals = [
      {
        mealName: 'Meal 1 — Egg Power Breakfast',
        timing: '8:00 AM',
        items: [
          '2 Whole Eggs + 4 Egg Whites (Omelette / Bhurji)',
          '2 Slices Whole Wheat Toast / 2 Rotis',
          '1 Glass Lemon Water with electrolyte salt'
        ],
        proteinGrams: 29,
        carbsGrams: 35,
        fatGrams: 12,
        notes: 'Whole eggs supply dietary cholesterol essential for steroid hormone synthesis.'
      },
      {
        mealName: 'Meal 2 — Post-Workout Recovery',
        timing: '12:00 PM',
        items: [
          '1 Scoop Whey Protein Isolate',
          '1 Bowl Oatmeal with 1 tsp Peanut Butter'
        ],
        proteinGrams: 30,
        carbsGrams: 45,
        fatGrams: 8,
        notes: 'Replenishes glycogen depleted during heavy lifting.'
      },
      {
        mealName: 'Meal 3 — High-Protein Lunch',
        timing: '2:30 PM',
        items: [
          '50g Soya Chunks Curry or 150g Paneer',
          '1 Bowl Thick Dal Tadka',
          '1.5 Cups Steamed Rice + Beetroot Salad'
        ],
        proteinGrams: 40,
        carbsGrams: 70,
        fatGrams: 10,
        notes: 'Complete plant-dairy amino profile.'
      },
      {
        mealName: 'Meal 4 — Evening Eggs & Strength Dinner',
        timing: '8:30 PM',
        items: [
          '5 Boiled Egg Whites + 1 Whole Egg',
          '150g Dahi / Curd',
          '2 Multigrain Rotis with Sabzi'
        ],
        proteinGrams: 36,
        carbsGrams: 40,
        fatGrams: 11,
        notes: 'High biological value proteins with zero heaviness before bed.'
      }
    ];
  } else {
    // Non-Vegetarian
    estimatedDailyCostINR = 220;
    staplesHighlighted = ['Chicken Breast', 'Eggs', 'Fish', 'Curd', 'Rotis'];
    meals = [
      {
        mealName: 'Meal 1 — High-Protein Kickoff',
        timing: '8:00 AM',
        items: [
          '3 Whole Eggs + 3 Egg Whites Scramble',
          '2 Whole Wheat Rotis',
          '1 Cup Black Coffee / Green Tea'
        ],
        proteinGrams: 32,
        carbsGrams: 40,
        fatGrams: 16,
        notes: 'Sustained morning amino acids.'
      },
      {
        mealName: 'Meal 2 — Post-Lift Fuel',
        timing: '12:00 PM',
        items: [
          '1 Scoop Whey Protein',
          '1 Large Sweet Potato or 2 Bananas'
        ],
        proteinGrams: 27,
        carbsGrams: 50,
        fatGrams: 2,
        notes: 'Rapid absorption post-workout.'
      },
      {
        mealName: 'Meal 3 — Chicken & Rice Lunch',
        timing: '2:00 PM',
        items: [
          '200g Grilled / Curry Chicken Breast (boneless)',
          '1.5 Cups Steamed Basmati Rice',
          '1 Bowl Green Salad with cucumber and lemon'
        ],
        proteinGrams: 50,
        carbsGrams: 65,
        fatGrams: 8,
        notes: 'Lean poultry protein with low saturated fat.'
      },
      {
        mealName: 'Meal 4 — Desi Recovery Dinner',
        timing: '8:30 PM',
        items: [
          '150g Fish Curry or 150g Low-Fat Paneer',
          '2 Whole Wheat Rotis',
          '1 Bowl Yellow Moong Dal'
        ],
        proteinGrams: 38,
        carbsGrams: 45,
        fatGrams: 12,
        notes: 'Omega-3 fatty acids and slow digestion for night recovery.'
      }
    ];
  }

  const costPerGramProteinINR = Math.round((estimatedDailyCostINR / targetProteinGrams) * 100) / 100;

  return {
    dietType,
    targetProteinGrams,
    targetCarbGrams,
    targetFatGrams,
    totalCalories: calorieTarget,
    estimatedDailyCostINR,
    costPerGramProteinINR,
    staplesHighlighted,
    meals
  };
}
