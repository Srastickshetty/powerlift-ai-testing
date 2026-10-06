/**
 * @powerlift/engines/bodybuilding/tdeeNutritionEngine
 * BMR (Mifflin-St Jeor), TDEE, macronutrient distribution, and weekly caloric auto-adjustment.
 * Pure deterministic calculations.
 */

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete';

export interface NutritionProfileInput {
  age: number;
  sex: 'male' | 'female' | 'other';
  bodyweightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: 'cut' | 'lean_bulk' | 'recomp' | 'hypertrophy';
}

export interface MacroTargets {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  athlete: 1.9
};

export function calculateBmr(age: number, sex: string, bodyweightKg: number, heightCm: number): number {
  if (bodyweightKg <= 0 || heightCm <= 0 || age <= 0) return 0;
  const isFemale = sex.toLowerCase() === 'female' || sex.toLowerCase() === 'women';
  const base = 10 * bodyweightKg + 6.25 * heightCm - 5 * age;
  return Math.round(isFemale ? base - 161 : base + 5);
}

export function calculateTdee(bmr: number, activityLevel: ActivityLevel = 'moderate'): number {
  const mult = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  return Math.round(bmr * mult);
}

export function calculateMacroTargets(input: NutritionProfileInput): MacroTargets {
  const bmr = calculateBmr(input.age, input.sex, input.bodyweightKg, input.heightCm);
  const tdee = calculateTdee(bmr, input.activityLevel);

  let targetCalories = tdee;
  if (input.goal === 'cut') {
    targetCalories = Math.max(Math.round(bmr * 0.85), tdee - 450); // deficit capped above extreme limit
  } else if (input.goal === 'lean_bulk' || input.goal === 'hypertrophy') {
    targetCalories = tdee + 300; // clean lean surplus
  }

  // Protein: 2.2 g/kg for cut (muscle-sparing), 2.0 g/kg for bulk/recomp
  const proteinPerKg = input.goal === 'cut' ? 2.2 : 2.0;
  const proteinGrams = Math.round(input.bodyweightKg * proteinPerKg);

  // Fat: 0.8 g/kg for endocrine health
  const fatGrams = Math.round(input.bodyweightKg * 0.8);

  // Carbs: Remaining calories
  const proteinCals = proteinGrams * 4;
  const fatCals = fatGrams * 9;
  const remainingCals = Math.max(0, targetCalories - (proteinCals + fatCals));
  const carbGrams = Math.round(remainingCals / 4);

  return {
    bmr,
    tdee,
    targetCalories,
    proteinGrams,
    fatGrams,
    carbGrams
  };
}
