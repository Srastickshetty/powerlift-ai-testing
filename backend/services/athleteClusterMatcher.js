// services/athleteClusterMatcher.js

const clusterMeta = require("../data/programClusterMeta.json");

function matchAthleteToCluster(athlete) {
  const results = [];

  Object.entries(clusterMeta).forEach(([clusterId, cluster]) => {
    let score = 0;
    const reasons = [];

    // 1️⃣ Experience match
    if (cluster.recommended_for.includes(athlete.experience_level)) {
      score += 3;
      reasons.push("Experience level matches cluster");
    } else {
      score -= 5;
      reasons.push("Experience mismatch");
    }

    // 2️⃣ Days per week
    if (athlete.days_available >= cluster.constraints.min_days_per_week) {
      score += 2;
      reasons.push("Training availability sufficient");
    } else {
      score -= 10;
      reasons.push("Insufficient training days");
    }

    // 3️⃣ RPE compatibility
    if (cluster.constraints.requires_rpe && athlete.uses_rpe) {
      score += 2;
      reasons.push("RPE compatible");
    } else if (cluster.constraints.requires_rpe && !athlete.uses_rpe) {
      score -= 4;
      reasons.push("RPE required but athlete not compatible");
    }

    // 4️⃣ Fatigue & recovery
    if (athlete.fatigue_rate < 0.5 && athlete.recovery_score > 0.6) {
      score += 2;
      reasons.push("Good recovery capacity");
    }

    // 5️⃣ Injury risk safety
    if (athlete.injury_risk > 0.6 && cluster.risk_level !== "low") {
      score -= 6;
      reasons.push("Injury risk too high for this cluster");
    }

    results.push({
      cluster_id: clusterId,
      label: cluster.label,
      score,
      reasons
    });
  });

  // Pick best
  results.sort((a, b) => b.score - a.score);
  const best = results[0];

  return {
    cluster_id: best.cluster_id,
    label: best.label,
    confidence: Math.min(1, Math.max(0.5, best.score / 10)),
    reasoning: best.reasons
  };
}

module.exports = { matchAthleteToCluster };
