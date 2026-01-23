const express = require("express");
const router = express.Router();

const athleteStatuses = require("../data/athleteStatus.json");
const { detectAlerts } = require("../services/coachAlerts");

router.get("/status", (req, res) => {
  const enriched = athleteStatuses.map((athlete) => {
    const alerts = detectAlerts({
      fatigueRate: athlete.fatigue_rate ?? 0,
      missRate: athlete.miss_rate ?? 0,
      progressTrend: 0, // placeholder
    });

    return {
      ...athlete,
      alerts,
    };
  });

  res.json(enriched);
});

module.exports = router;
