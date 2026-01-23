const fs = require("fs");
const path = require("path");

const logsPath = path.join(__dirname, "../data/workoutLogs.json");

function readLogs() {
  if (!fs.existsSync(logsPath)) return [];
  return JSON.parse(fs.readFileSync(logsPath, "utf-8"));
}

function writeLogs(logs) {
  fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
}

// POST /api/logs
exports.logWorkout = (req, res) => {
  const logs = readLogs();
  const newLog = req.body;

  const exists = logs.find(
    (l) =>
      l.athlete_id === newLog.athlete_id &&
      l.date === newLog.date
  );

  if (exists) {
    return res.status(400).json({ error: "Workout already logged" });
  }

  logs.push(newLog);
  writeLogs(logs);

  res.json({ success: true });
};

// GET /api/logs?athlete_id=xxx
exports.getLogsByAthlete = (req, res) => {
  const { athlete_id } = req.query;

  if (!athlete_id) {
    return res.status(400).json({ error: "athlete_id required" });
  }

  const logs = readLogs();
  const filtered = logs.filter(
    (log) => log.athlete_id === athlete_id
  );

  res.json(filtered);
};
