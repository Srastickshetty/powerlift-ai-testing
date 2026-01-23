function adjustLift({
  avgRPE,
  targetRPE,
  missRate,
  fatigueRate,
  phase = "normal",
}) {
  let loadAdjustment = 0;
  let volumeAdjustment = 0;

  // Fatigue safety override
  if (fatigueRate >= 0.75) {
    return { loadAdjustment: 0, volumeAdjustment: -1 };
  }

  // Performance-based logic
  if (avgRPE <= targetRPE - 1 && missRate < 0.1) {
    loadAdjustment = 0.025;
  } else if (avgRPE >= targetRPE + 1 || missRate >= 0.2) {
    loadAdjustment = -0.05;
  }

  // 🔒 Stage 16.5 peak/taper guard
  if ((phase === "peak" || phase === "taper") && loadAdjustment > 0) {
    loadAdjustment = 0;
  }

  return { loadAdjustment, volumeAdjustment };
}

module.exports = { adjustLift };
