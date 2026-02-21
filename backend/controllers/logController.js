const fs = require("fs");
const path = require("path");
// IMPORT YOUR ENGINES
const { calculateE1RM } = require("../services/e1rmCalculator"); 
const { processAutoregulation } = require("../services/autoregulationEngine");

const logsPath = path.join(__dirname, "../data/workoutLogs.json");

function readLogs() {
  if (!fs.existsSync(logsPath)) return [];
  return JSON.parse(fs.readFileSync(logsPath, "utf-8"));
}

function writeLogs(logs) {
  fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
}

exports.logWorkout = (req, res) => {
  const logs = readLogs();
  const newLog = req.body;

  // 1. Prevent Duplicates
  const exists = logs.find(
    (l) => l.athlete_id === newLog.athlete_id && l.date === newLog.date
  );
  if (exists) return res.status(400).json({ error: "Workout already logged" });

  // 2. CRITICAL: Calculate e1RM for every set in the workout
  // This is what populates your Progress Charts!
  if (newLog.exercises) {
    newLog.exercises = newLog.exercises.map(ex => {
      // Calculate max for the top set (usually the first set)
      const topSet = ex.sets[0];
      if (topSet && topSet.weight && topSet.reps) {
        ex.estimated_1rm = calculateE1RM(topSet.weight, topSet.reps, topSet.rpe || 8);
      }
      return ex;
    });
  }

  // 3. Save to File
  logs.push(newLog);
  writeLogs(logs);

  // 4. Trigger Autoregulation Check (Async)
  // This will populate your "Proposals" panel if the RPE was too high/low
  try {
    processAutoregulation(newLog);
  } catch (e) {
    console.log("Autoreg engine skipped: ", e.message);
  }

  res.json({ 
    success: true, 
    message: "Log saved and e1RM updated",
    estimated_1rm: newLog.exercises[0]?.estimated_1rm 
  });
};

exports.getLogsByAthlete = (req, res) => {
  const { athlete_id } = req.query;
  if (!athlete_id) return res.status(400).json({ error: "athlete_id required" });

  const logs = readLogs();
  const filtered = logs.filter((log) => log.athlete_id === athlete_id);
  res.json(filtered);
};