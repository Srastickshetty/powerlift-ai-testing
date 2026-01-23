const blueprints = require("../blueprints");

function selectBlueprint(athlete) {
  let best = null;
  let bestScore = -Infinity;

  blueprints.forEach(bp => {
    let score = 0;

    // Experience match
    if (bp.suitable_for.experience.includes(athlete.experience_level)) {
      score += 3;
    }

    // Recovery match
    if (bp.suitable_for.recovery.includes(athlete.recovery_level)) {
      score += 2;
    }

    // Days per week
    if (bp.days_per_week.includes(athlete.days_available)) {
      score += 2;
    }

    // Weak lift bias
    if (bp.frequency[athlete.weak_lift] === "high") {
      score += 2;
    }

    // Injury safety
    if (athlete.injuries.length && !bp.suitable_for.injury_safe) {
      score -= 3;
    }

    if (score > bestScore) {
      bestScore = score;
      best = bp;
    }
  });

  return {
    blueprint: best,
    confidence: bestScore
  };
}

module.exports = selectBlueprint;
