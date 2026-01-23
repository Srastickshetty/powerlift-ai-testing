// backend/routes/coachRoutes.js
const express = require("express");
const router = express.Router();

const workoutLogs = require("../data/workoutLogs.json");
const { detectAlerts } = require("../services/coachAlerts");

// TEMP: static athletes list (later from DB)
const athletes = [
  { athlete_id: "athlete_001", name: "Athlete 1" },
];

router.get("/dashboard", (req, res) => {
  const response = athletes.map((athlete) => {
    const logs = workoutLogs.filter(
      (l) => l.athlete_id === athlete.athlete_id
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
      progressTrend: 0, // placeholder for now
    });
console.log("DEBUG ALERTS:", alerts);

    return {
      athlete_id: athlete.athlete_id,
      name: athlete.name,
      fatigue_rate: Number(fatigueRate.toFixed(2)),
      miss_rate: Number(missRate.toFixed(2)),
      alerts,
    };
  });

  res.json(response);
});

module.exports = router;
