const fs = require("fs");
const path = require("path");
const workoutLogs = require("../data/workoutLogs.json");
const { detectAlerts } = require("../services/coachAlerts");


const logsPath = path.join(__dirname, "../data/workoutLogs.json");

function readLogs() {
  return JSON.parse(fs.readFileSync(logsPath, "utf-8"));
}

// Simple heuristics (upgradeable later)
function calculateFatigue(logs) {
  return Math.min(1, logs.length * 0.15);
}

function calculateMissRate(logs) {
  let totalSets = 0;
  let missedSets = 0;

  logs.forEach((log) => {
    log.main_lifts.forEach((lift) => {
      lift.performed.forEach((set) => {
        totalSets++;
        if (Number(set.reps) < lift.prescribed.reps) {
          missedSets++;
        }
      });
    });
  });

  return totalSets === 0 ? 0 : +(missedSets / totalSets).toFixed(2);
}

exports.getCoachDashboard = (req, res) => {
  const athleteIds = [
    ...new Set(workoutLogs.map((l) => l.athlete_id)),
  ];

  const response = athleteIds.map((athleteId) => {
    const logs = workoutLogs.filter(
      (l) => l.athlete_id === athleteId
    );

    const fatigueRate = logs.length
      ? logs.reduce((s, l) => s + (l.fatigue || 0), 0) / logs.length
      : 0;

    const missRate = logs.length
      ? logs.reduce((s, l) => s + (l.missed_sets || 0), 0) / logs.length
      : 0;

    const alerts = detectAlerts({
      fatigueRate,
      missRate,
      progressTrend: 0,
    });

    return {
      athlete_id: athleteId,
      fatigue_rate: Number(fatigueRate.toFixed(2)),
      miss_rate: Number(missRate.toFixed(2)),
      alerts,
    };
  });

  res.json(response);
};