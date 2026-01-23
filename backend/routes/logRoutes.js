const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const LOG_PATH = path.join(__dirname, "../data/workoutLogs.json");

// POST already exists (keep it)
// --------------------------------

// ✅ NEW: GET workout history
router.get("/", (req, res) => {
  const { athlete_id } = req.query;

  if (!athlete_id) {
    return res.status(400).json({ error: "athlete_id required" });
  }

  try {
    if (!fs.existsSync(LOG_PATH)) {
      return res.json([]);
    }

    const logs = JSON.parse(fs.readFileSync(LOG_PATH, "utf-8"));

    const athleteLogs = logs
      .filter((l) => l.athlete_id === athlete_id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(athleteLogs);
  } catch (err) {
    console.error("Log read error:", err);
    res.status(500).json({ error: "Failed to read logs" });
  }
});

module.exports = router;
