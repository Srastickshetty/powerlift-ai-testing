const express = require("express");
const router = express.Router();

const programs = require("../data/programs.json");

// Force deload
router.post("/force-deload", (req, res) => {
  const { athlete_id } = req.body;

  if (!programs[athlete_id]) {
    return res.status(404).json({ error: "Program not found" });
  }

  programs[athlete_id].forceDeload = true;

  res.json({ success: true });
});

// Toggle autoregulation
router.post("/toggle-autoreg", (req, res) => {
  const { athlete_id, enabled } = req.body;

  if (!programs[athlete_id]) {
    return res.status(404).json({ error: "Program not found" });
  }

  programs[athlete_id].autoreg_enabled = enabled;

  res.json({ success: true });
});

// Set competition
router.post("/set-competition", (req, res) => {
  const { athlete_id, date } = req.body;

  if (!programs[athlete_id]) {
    return res.status(404).json({ error: "Program not found" });
  }

  programs[athlete_id].competition = {
    confirmed: true,
    date,
  };

  res.json({ success: true });
});

module.exports = router;
