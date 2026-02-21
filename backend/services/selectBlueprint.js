const blueprints = require("../data/programBlueprints.json");

function selectBlueprint(vector) {
  let best = null;
  let bestScore = -Infinity;

  blueprints.forEach((bp) => {
    let score = 0;

    if (bp.volume === vector.volume_tolerance) score += 2;
    if (bp.intensity === vector.intensity_tolerance) score += 2;

    if (vector.risk_level === "high" && bp.risk === "low") score += 3;
    if (vector.risk_level === "low" && bp.risk === "high") score -= 2;

    if (vector.fatigue_rate > 0.75 && bp.volume === "high") score -= 3;
    if (bp.frequency === "high") score += 1;

    if (score > bestScore) {
      bestScore = score;
      best = bp;
    }
  });

  if (!best) return null;

  return {
    classification: best.id, // 🔑 IMPORTANT
    confidence: Math.min(1, 0.75 + bestScore * 0.05),
  };
}

module.exports = { selectBlueprint };
