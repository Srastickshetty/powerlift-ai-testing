const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/programs.json");

router.post("/confirm", (req, res) => {
  const { athlete_id } = req.body;
  const programs = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  if (!programs[athlete_id]?.competition) {
    return res.status(400).json({ error: "No competition data" });
  }

  programs[athlete_id].competition.confirmed = true;

  fs.writeFileSync(dataPath, JSON.stringify(programs, null, 2));
  res.json({ success: true });
});

module.exports = router;
