// backend/services/programFeatureExtractor.js

/**
 * Convert a structured program into a numeric feature vector.
 * Foundation of Program Blueprint ML.
 */

function mapVolumeTrend(trend) {
  if (trend === "increasing") return 1;
  if (trend === "decreasing") return -1;
  return 0;
}

function mapPeriodization(style) {
  switch (style) {
    case "linear":
      return 1;
    case "block":
      return 2;
    case "undulating":
      return 3;
    default:
      return 0;
  }
}

function extractProgramFeatures(programMeta, programId) {
  if (!programMeta) {
    throw new Error("Program metadata missing");
  }

  const {
    program_id, // ✅ ADD THIS
    days_per_week,
    lift_frequency,
    intensity,
    volume,
    periodization,
    total_weeks,
  } = programMeta;

  return {
    // 🔑 IDENTITY (NON-NUMERIC, REQUIRED)
   program_id: programId,
    // --- STRUCTURE ---
    days_per_week: days_per_week || 0,
    block_length: total_weeks || 0,

    // --- LIFT FREQUENCY ---
    squat_freq: lift_frequency?.squat || 0,
    bench_freq: lift_frequency?.bench || 0,
    deadlift_freq: lift_frequency?.deadlift || 0,

    // --- INTENSITY PROFILE ---
    avg_intensity: intensity?.average_percentage || 0,
    max_intensity: intensity?.max_percentage || 0,
    uses_rpe: intensity?.uses_rpe ? 1 : 0,

    // --- VOLUME PROFILE ---
    avg_volume: volume?.average_weekly_volume || 0,
    volume_trend: mapVolumeTrend(volume?.volume_trend),

    // --- PERIODIZATION ---
    periodization_type: mapPeriodization(periodization?.style),
    has_deload: periodization?.has_deload ? 1 : 0,
    deload_week: periodization?.deload_week || 0,
  };
}

module.exports = { extractProgramFeatures };
