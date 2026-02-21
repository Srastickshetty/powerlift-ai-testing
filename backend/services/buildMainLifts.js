const RULES = require("./programRules");

function buildMainLift({
  lift,
  week = 1,             // Default to 1 for (week - 1) logic
  baseLoad = 0,
  intensityCap = 0.90,  // Default cap (e.g., 90%)
  fatigueRate = 0,
  sets,
  reps
}) {
  // 1. Ensure baseLoad is a valid number to avoid NaN
  const resolvedBaseLoad = typeof baseLoad === "number" && !isNaN(baseLoad) ? baseLoad : 0;

  // 2. Define Progression Constants
  const BASE_INTENSITY = 0.75;      // Start at 75%
  const WEEKLY_INCREMENT = 0.025;   // +2.5% per week

  // 3. Calculate Raw Intensity based on the week
  // Week 1: 0.75 + (0 * 0.025) = 0.75
  let intensity = BASE_INTENSITY + (week - 1) * WEEKLY_INCREMENT;

  // 4. Apply Caps and Fatigue logic
  const maxAllowed = intensityCap || (RULES.MAX_INTENSITY || 1.0);
  intensity = Math.min(intensity, maxAllowed);

  // Fatigue safety: Drop intensity by 5% if athlete is over-reached
  if (fatigueRate > 0.75) {
    intensity *= 0.95;
  }

  // 5. Final Calculations
  return {
    lift,
    sets,
    reps,
    intensity_pct: parseFloat(intensity.toFixed(4)), // Useful for UI/Graphs
    load: resolvedBaseLoad > 0 
      ? Math.round(resolvedBaseLoad * intensity) 
      : null,
    target_rpe: Math.min(8, RULES.MAX_RPE || 10)
  };
}

module.exports = { buildMainLift };