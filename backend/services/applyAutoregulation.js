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
  if (!program || !program.versions || program.versions.length === 0) {
    throw new Error("Program has no versions to autoregulate");
  }

  const adjustments = [];

  const activeVersionIndex = (program.activeVersion ?? 1) - 1;
  const activeProgram = program.versions[activeVersionIndex].program;

  if (!activeProgram.weeks || activeProgram.weeks.length === 0) {
    throw new Error("Active program version has no weeks");
  }

  // 🧱 BASE WEEK (CLONED, NEVER MUTATED IN ORIGINAL)
  const baseWeek =
    activeProgram.weeks.length > 1
      ? structuredClone(
          activeProgram.weeks[activeProgram.weeks.length - 1]
        )
      : structuredClone(activeProgram.weeks[0]);

  baseWeek.week =
    (baseWeek.week ?? activeProgram.weeks.length) + 1;

  // 🔹 Detect phase
  let phase = "normal";
  if (program.competition?.confirmed && program.competition.date) {
    const weeksOut = getWeeksToMeet(program.competition.date);
    phase = getPhase(weeksOut);
  }

  // 🔹 PROPOSED WEEK (this is what AI suggests)
  const proposedWeek = structuredClone(baseWeek);

  proposedWeek.days.forEach((day) => {
    day.main_lifts.forEach((lift) => {
      const metrics = computeWeeklyLiftMetrics(logs, lift.lift);

      if (!metrics || metrics.avgRPE === null) return;

      const { avgRPE, missRate } = metrics;

      const { loadAdjustment, volumeAdjustment } = adjustLift({
        avgRPE,
        targetRPE: lift.target_rpe ?? 8,
        missRate,
        fatigueRate,
        phase,
      });

      /* -------- LOAD -------- */
      if (loadAdjustment !== 0) {
        const oldLoad = lift.load;
        const newLoad = Math.round(lift.load * (1 + loadAdjustment));

        lift.load = newLoad;

        adjustments.push({
          week: proposedWeek.week,
          day: day.day,
          lift: lift.lift,
          type: "load",
          from: oldLoad,
          to: newLoad,
          delta: newLoad - oldLoad,
          reason:
            loadAdjustment > 0
              ? "Low fatigue and stable RPE trend"
              : "Elevated fatigue or missed reps detected",
          signals: {
            avgRPE,
            missRate,
            fatigueRate,
            phase,
          },
        });
      }

      /* -------- VOLUME -------- */
      if (volumeAdjustment !== 0) {
        const oldSets = lift.sets;
        const newSets = Math.max(1, lift.sets + volumeAdjustment);

        lift.sets = newSets;

        adjustments.push({
          week: proposedWeek.week,
          day: day.day,
          lift: lift.lift,
          type: "volume",
          from: oldSets,
          to: newSets,
          delta: newSets - oldSets,
          reason:
            volumeAdjustment > 0
              ? "Under-target RPE with good recovery"
              : "Accumulated fatigue / recovery constraint",
          signals: {
            avgRPE,
            missRate,
            fatigueRate,
            phase,
          },
        });
      }
    });
  });

  // 🔹 Competition modifiers apply ONLY to proposal
  if (program.competition?.confirmed && phase !== "normal") {
    applyCompetitionModifiers(proposedWeek, phase);
  }

  // ✅ FINAL: PROPOSAL (NOT APPLIED)
 return {
  id: `proposal_${Date.now()}`,
  status: "pending",
  createdAt: new Date().toISOString(),
  phase,
  confidence: Math.max(0.5, 1 - fatigueRate),
  proposedWeek,
  adjustments,
};

}

module.exports = { autoregulateNextWeek };
