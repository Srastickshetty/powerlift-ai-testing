const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const { buildProgress } = require("../services/progressService");

const logsPath = path.join(__dirname, "../data/workoutLogs.json");

router.get("/:athleteId", (req, res) => {
  try {
    const logs = JSON.parse(fs.readFileSync(logsPath, "utf-8"));
    const athleteLogs = logs.filter(
      (l) => l.athlete_id === req.params.athleteId
    );

    const progress = buildProgress(athleteLogs);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
