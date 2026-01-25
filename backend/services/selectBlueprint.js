const blueprints = require("../data/programBlueprints.json");

function selectBlueprint(vector) {
  let best = null;
  let bestScore = -Infinity;

  blueprints.forEach((bp) => {
    let score = 0;

    // Volume tolerance match
    if (bp.volume === vector.volume_tolerance) score += 2;

    // Intensity tolerance match
    if (bp.intensity === vector.intensity_tolerance) score += 2;

    // Risk control
    if (vector.risk_level === "high" && bp.risk === "low") score += 3;
    if (vector.risk_level === "low" && bp.risk === "high") score -= 2;

    // Fatigue safety
    if (vector.fatigue_rate > 0.75 && bp.volume === "high") score -= 3;

    // Weak lift logic (frequency bias)
    if (bp.frequency === "high") score += 1;

    if (score > bestScore) {
      bestScore = score;
      best = bp;
    }
  });

  return {
    blueprint: best.id,
    volume_multiplier:
      vector.volume_tolerance === "high" ? 1.15 :
      vector.volume_tolerance === "low" ? 0.85 : 1.0,
    intensity_cap:
      vector.intensity_tolerance === "high" ? 0.9 :
      vector.intensity_tolerance === "low" ? 0.8 : 0.85,
    deload_bias:
      vector.fatigue_rate > 0.7 ? "early" : "normal",
    confidence: Math.min(1, 0.75 + bestScore * 0.05)
  };
}

module.exports = { selectBlueprint };
