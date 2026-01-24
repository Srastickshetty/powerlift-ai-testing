const express = require("express");
const router = express.Router();

const programs = require("../data/programs.json");

router.get("/:athleteId", (req, res) => {
  const program = programs[req.params.athleteId];
  if (!program) return res.status(404).json({ error: "Program not found" });
  res.json(program);
});

module.exports = router; // ✅ REQUIRED
