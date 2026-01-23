const programs = require("../data/programs.json");
const logs = require("../data/workoutLogs.json");
const athleteStatuses = require("../data/athleteStatus.json");

const { autoregulateNextWeek } = require("../services/applyAutoregulation");

const athleteId = "athlete_001";

// ✅ FIND athlete status safely
const athleteStatus = athleteStatuses.find(
  (a) => a.athlete_id === athleteId
);

if (!athleteStatus) {
  throw new Error("Athlete status not found for " + athleteId);
}

const program = programs[athleteId];

if (!program) {
  throw new Error("Program not found for " + athleteId);
}

// ✅ AUTOREGULATION CALL
const nextWeek = autoregulateNextWeek({
  program,
  logs,
  fatigueRate: athleteStatus.fatigue_rate,
});

console.log("\nAUTOREGULATED NEXT WEEK\n");
console.dir(nextWeek, { depth: null });
