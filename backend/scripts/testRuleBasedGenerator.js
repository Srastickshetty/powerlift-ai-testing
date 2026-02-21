// backend/scripts/testRuleBasedGenerator.js

const { generateProgram } = require("../services/ruleBasedProgramGenerator");

// 🔹 Mock athlete (realistic)
const athlete = {
  experience_level: "intermediate",
  squat: 180,
  bench: 120,
  deadlift: 210,
  days_available: 4,
  recovery_score: 0.7,
  fatigue_rate: 0.3
};

// 🔹 Mock cluster match (from clustering step)
const clusterMatch = {
  cluster_id: "0",
  label: "moderate_volume_moderate_frequency_rpe_based",
  confidence: 0.84
};

// 🧠 Generate program
const program = generateProgram({
  athlete,
  clusterMatch
});

// 📤 Output
console.log("🧠 GENERATED PROGRAM STRUCTURE\n");
console.log(JSON.stringify(program, null, 2));
