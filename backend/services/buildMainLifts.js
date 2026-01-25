const RULES = require("./programRules");

function buildMainLift({
  lift,
  week,
  baseLoad,
  intensityCap,
  fatigueRate
}) {
  let loadMultiplier = 1 + Math.min(
    week * RULES.MAX_WEEKLY_LOAD_INCREASE,
    intensityCap - 1
  );

  if (fatigueRate > 0.75) {
    loadMultiplier *= 0.95;
  }

  return {
    lift,
    sets: 3,
    reps: 5,
    load: Math.round(baseLoad * loadMultiplier),
    target_rpe: Math.min(8, RULES.MAX_RPE)
  };
}

module.exports = { buildMainLift };
