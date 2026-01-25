function classifyProgram(program) {
  const {
    days_per_week,
    avg_volume,
    avg_intensity,
    uses_rpe,
    has_deload,   // ✅ FIXED
  } = program;

  // ---- VOLUME ----
  let volumeType = "moderate_volume";
  if (avg_volume < 11000) volumeType = "low_volume";
  if (avg_volume > 16000) volumeType = "high_volume";

  // ---- FREQUENCY ----
  let frequencyType = "moderate_frequency";
  if (days_per_week <= 3) frequencyType = "low_frequency";
  if (days_per_week >= 5) frequencyType = "high_frequency";

  // ---- INTENSITY ----
  let intensityType = "moderate_intensity";
  if (avg_intensity < 0.75) intensityType = "low_intensity";
  if (avg_intensity > 0.85) intensityType = "high_intensity";

  // ---- STYLE ----
  let style = uses_rpe ? "rpe_based" : "percentage_based";

  // ---- DELOAD ----
  let deloadType = has_deload ? "with_deload" : "no_deload";

  return `${volumeType}_${frequencyType}_${intensityType}_${style}_${deloadType}`;
}

module.exports = { classifyProgram };
