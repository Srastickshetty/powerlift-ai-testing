const { adjustLift } = require("./autoregulationEngine");
const { computeWeeklyLiftMetrics } = require("./weeklyPerformance");
const {
  getWeeksToMeet,
  getPhase,
} = require("./competitionPhaseEngine");
const {
  applyCompetitionModifiers,
} = require("./competitionModifiers");

function autoregulateNextWeek({ program, logs, fatigueRate }) {
  if (!program || !program.weeks || program.weeks.length === 0) {
    throw new Error("Program has no weeks to autoregulate");
  }

  // 🔹 Clone last available week (safe base)
  const baseWeek =
    program.weeks.length > 1
      ? structuredClone(program.weeks[program.weeks.length - 1])
      : structuredClone(program.weeks[0]);

  // Increment week number
  baseWeek.week = (baseWeek.week ?? program.weeks.length) + 1;

  // 🔹 Default phase
  let phase = "normal";

  // 🔹 Detect competition phase ONLY if coach confirmed
  if (program.competition?.confirmed && program.competition.date) {
    const weeksOut = getWeeksToMeet(program.competition.date);
    phase = getPhase(weeksOut);
  }

  // 🔹 Apply autoregulation per lift
  baseWeek.days.forEach((day) => {
    day.main_lifts.forEach((lift) => {
      const metrics = computeWeeklyLiftMetrics(logs, lift.lift);

      // Skip if no usable data
      if (!metrics || metrics.avgRPE === null) return;

      const { loadAdjustment, volumeAdjustment } = adjustLift({
        avgRPE: metrics.avgRPE,
        targetRPE: lift.target_rpe ?? 8,
        missRate: metrics.missRate,
        fatigueRate,
        phase, // 🔒 Stage 16.5 safety guard applied here
      });

      // Apply load change
      if (loadAdjustment !== 0) {
        lift.load = Math.round(lift.load * (1 + loadAdjustment));
      }

      // Apply volume change
      if (volumeAdjustment !== 0) {
        lift.sets = Math.max(1, lift.sets + volumeAdjustment);
      }
    });
  });

  // 🔹 Apply competition-specific modifiers LAST
  if (program.competition?.confirmed && phase !== "normal") {
    applyCompetitionModifiers(baseWeek, phase);
  }

  return baseWeek;
}

module.exports = { autoregulateNextWeek };
