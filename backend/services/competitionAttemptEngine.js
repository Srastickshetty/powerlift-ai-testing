/**
 * ESTIMATE E1RM
 * Uses the Epley formula: Weight * (1 + reps/30)
 */
function estimateE1RM(weight, reps) {
  return weight * (1 + (reps / 30));
}

/**
 * CALCULATE LIFT STATS
 * Aggregates training history to find performance trends.
 */
function calculateLiftStats(logs, liftName) {
  if (!logs) return null;

  const liftLogs = Object.values(logs).flatMap(day =>
    Object.entries(day)
      .filter(([name]) => name === liftName)
      .map(([, data]) => data)
  );

  if (!liftLogs.length) return null;

  const estimatedMaxes = liftLogs.map(entry =>
    estimateE1RM(Number(entry.weight), Number(entry.reps))
  );

  const avgE1RM =
    estimatedMaxes.reduce((a, b) => a + b, 0) /
    estimatedMaxes.length;

  const recent = estimatedMaxes.slice(-3);
  const recentAvg =
    recent.reduce((a, b) => a + b, 0) / recent.length;

  return {
    avgE1RM,
    recentAvg
  };
}

/**
 * GET BASE ATTEMPTS
 * Maps the standard percentage-based attempt structure.
 */
function getBaseAttempts(trainingMax) {
  return {
    opener: Math.round(trainingMax * 0.9),
    second: Math.round(trainingMax * 0.96),
    third: Math.round(trainingMax * 1.02) // Slight PR attempt
  };
}

/**
 * GENERATE ATTEMPTS
 * Main entry point for the competition generator.
 * Uses logs for intelligence, falling back to training max.
 */
function generateAttempts({ athlete, logs }) {
  const lifts = ["Squat", "Bench", "Deadlift"];
  const attempts = {};

  lifts.forEach(lift => {
    const stats = calculateLiftStats(logs, lift);
    const trainingMax = athlete.training_max[lift.toLowerCase()];

    // Intelligence: Prioritize recent performance over static training max
    const baseStrength =
      stats?.recentAvg ||
      stats?.avgE1RM ||
      trainingMax;

    // Use the base attempt logic
    attempts[lift] = getBaseAttempts(baseStrength);
  });

  return attempts;
}

/**
 * ADJUST ATTEMPTS (REAL-TIME)
 * Logic to shift second and third attempts based on live performance.
 */
function adjustAttempts({ trainingMax, openerRPE, secondSuccess }) {
  const base = getBaseAttempts(trainingMax);

  let adjustedSecond = base.second;
  let adjustedThird = base.third;

  // If opener was too hard (RPE 9+), reduce second
  if (openerRPE >= 9) {
    adjustedSecond = Math.round(trainingMax * 0.94);
  }

  // If opener was very easy (RPE ≤7), increase second
  if (openerRPE <= 7) {
    adjustedSecond = Math.round(trainingMax * 0.98);
  }

  // Third attempt logic
  if (!secondSuccess) {
    adjustedThird = Math.round(adjustedSecond * 0.98); // secure total
  } else {
    adjustedThird = Math.round(trainingMax * 1.03); // push PR
  }

  return {
    opener: base.opener,
    second: adjustedSecond,
    third: adjustedThird
  };
}

module.exports = { 
  generateAttempts, 
  getBaseAttempts, 
  adjustAttempts 
};