const { getWeeksToMeet } = require("./dateUtils");

function buildAutoregulationProposal({ program, logs, fatigueRate }) {
  if (!program?.versions?.length) {
    throw new Error("Program has no versions");
  }

  const activeVersion =
    program.versions.find(v => v.version === program.activeVersion) ||
    program.versions[program.versions.length - 1];

  const baseWeek =
    activeVersion.program.weeks.at(-1) ||
    activeVersion.program.weeks[0];

  const proposedWeek = structuredClone(baseWeek);
  proposedWeek.week += 1;

  const explanations = [];

  proposedWeek.days.forEach(day => {
    day.main_lifts.forEach(lift => {
      let delta = 0;
      let reason = "Stable performance";

      if (fatigueRate < 0.2) {
        delta = +3;
        reason = "Low fatigue and stable RPE trend";
      }

      if (fatigueRate > 0.4) {
        delta = -3;
        reason = "Elevated fatigue or missed reps detected";
      }

      lift.load = Math.max(0, lift.load + delta);

      explanations.push({
        lift: lift.lift,
        from: lift.load - delta,
        to: lift.load,
        reason,
        fatigueRate,
      });
    });
  });

  return {
    createdAt: new Date().toISOString(),
    confidence: Math.max(0.5, 1 - fatigueRate),
    proposedWeek,
    explanations,
  };
}

module.exports = buildAutoregulationProposal;
