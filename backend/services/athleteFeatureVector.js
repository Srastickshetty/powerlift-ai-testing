const { computeWeeklyLiftMetrics } = require("./weeklyPerformance");
const { getAthleteStatus } = require("./getAthleteStatus");

/**
 * Build Athlete Feature Vector
 * PURE FUNCTION — no file writes
 */
function buildAthleteFeatureVector({ athleteId, logs, profile }) {
  if (!logs || logs.length === 0) {
    return null;
  }

  // ----------------------------
  // EXPERIENCE (RULE-BASED)
  // ----------------------------
  const trainingAge = Math.min(
    1,
    (profile?.training_years || 2) / 5
  );

  // ----------------------------
  // LIFT METRICS
  // ----------------------------
  const squat = computeWeeklyLiftMetrics(logs, "Squat");
  const bench = computeWeeklyLiftMetrics(logs, "Bench");
  const deadlift = computeWeeklyLiftMetrics(logs, "Deadlift");

  const max = Math.max(
    squat?.avgE1RM || 1,
    bench?.avgE1RM || 1,
    deadlift?.avgE1RM || 1
  );

  const ratios = {
    squat_ratio: Number((squat?.avgE1RM / max).toFixed(2)),
    bench_ratio: Number((bench?.avgE1RM / max).toFixed(2)),
    deadlift_ratio: Number((deadlift?.avgE1RM / max).toFixed(2)),
  };

  const weak_lift = Object.entries(ratios)
    .sort((a, b) => a[1] - b[1])[0][0]
    .replace("_ratio", "");

  // ----------------------------
  // FATIGUE & RECOVERY
  // ----------------------------
  const avg_rpe =
    (squat?.avgRPE + bench?.avgRPE + deadlift?.avgRPE) / 3 || 0;

  const fatigue_rate = Number((avg_rpe / 10).toFixed(2));

  const miss_rate =
    (squat?.missRate + bench?.missRate + deadlift?.missRate) / 3 || 0;

  // ----------------------------
  // CAPACITY CLASSIFICATION
  // ----------------------------
  let volume_tolerance = "medium";
  if (fatigue_rate > 0.75 || miss_rate > 0.25) volume_tolerance = "low";
  if (fatigue_rate < 0.55 && miss_rate < 0.1) volume_tolerance = "high";

  let intensity_tolerance = "medium";
  if (avg_rpe > 8.5) intensity_tolerance = "low";
  if (avg_rpe < 7) intensity_tolerance = "high";

  // ----------------------------
  // RISK
  // ----------------------------
  let risk_level = "low";
  if (miss_rate > 0.3 || fatigue_rate > 0.8) risk_level = "high";
  else if (miss_rate > 0.15 || fatigue_rate > 0.65) risk_level = "medium";

  // ----------------------------
  // STATUS
  // ----------------------------
  const status = getAthleteStatus([
    squat,
    bench,
    deadlift,
  ]);

  return {
    athlete_id: athleteId,
    training_age: trainingAge,
    compliance: profile?.compliance ?? 1,

    ...ratios,
    weak_lift,

    avg_rpe,
    fatigue_rate,
    miss_rate,

    volume_tolerance,
    intensity_tolerance,

    risk_level,
    status,
  };
}

module.exports = { buildAthleteFeatureVector };
