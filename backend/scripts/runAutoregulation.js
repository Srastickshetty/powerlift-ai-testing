const fs = require("fs");
const path = require("path");
const autoregulation = require("../services/applyAutoregulation");

const autoregulateNextWeek = autoregulation.autoregulateNextWeek;

const programsPath = path.join(__dirname, "../data/programs.json");
const logsPath = path.join(__dirname, "../data/workoutLogs.json");
const proposalsPath = path.join(
  __dirname,
  "../data/autoregulationProposals.json"
);

const programs = JSON.parse(fs.readFileSync(programsPath, "utf-8"));
const logs = JSON.parse(fs.readFileSync(logsPath, "utf-8"));

const proposals = fs.existsSync(proposalsPath)
  ? JSON.parse(fs.readFileSync(proposalsPath, "utf-8"))
  : {};

const athleteId = "athlete_001";
const program = programs[athleteId];

if (!program) {
  throw new Error("Program not found");
}

const fatigueRate = 0.2; // TEMP, from analytics later

const result = autoregulateNextWeek({
  program,
  logs,
  fatigueRate,
});

/* 🔒 SAVE AS PROPOSAL ONLY */
proposals[athleteId] = {
  createdAt: result.createdAt,
  phase: result.phase,
  confidence: result.confidence,
  proposedWeek: result.proposedWeek,
  adjustments: result.adjustments,
};

fs.writeFileSync(
  proposalsPath,
  JSON.stringify(proposals, null, 2)
);

console.log("\nAUTOREGULATION PROPOSAL CREATED\n");
console.log({
  athleteId,
  confidence: result.confidence,
  week: result.proposedWeek.week,
});
